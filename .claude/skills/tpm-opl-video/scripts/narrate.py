#!/usr/bin/env python3
"""Synthesize the Thai narration of an OPL spec into per-segment MP3 files.

Usage: python3 narrate.py <spec.json> <project-dir> [--voice th-TH-PremwadeeNeural] [--rate +0%]

For every scene with a "narration" (a string or a list of segment strings) this writes
<project>/assets/vo/<scene>-<k>.mp3 and records each clip's length in <project>/assets/vo/vo.json:
    {"voice": "...", "rate": "...", "scenes": {"s2": [3.42, 4.10], ...}}
build_opl.mjs reads vo.json to place the audio and to time the scene around it.
Clips are cached by text+voice+rate, so re-running after an edit only re-synthesizes what changed.

Engines (--engine, or "voice": {"engine": ...} in the spec; default: azure when AZURE_SPEECH_KEY is set):
- azure: Azure AI Speech REST API (plain HTTPS). Env AZURE_SPEECH_KEY + AZURE_SPEECH_REGION (e.g. southeastasia);
  needs <region>.tts.speech.microsoft.com reachable. Free tier F0 covers training-video volumes.
- edge:  Microsoft Edge Read Aloud voices via the edge-tts package (pip install edge-tts), no key; needs a
  WebSocket to speech.platform.bing.com (some egress proxies allow HTTPS but block WebSockets).
Thai voices on both: th-TH-PremwadeeNeural (female), th-TH-NiwatNeural (male), th-TH-AcharaNeural (female).
Behind a TLS-intercepting proxy the CA bundle in SSL_CERT_FILE (or /root/.ccr/ca-bundle.crt) is used.
"""
import argparse
import asyncio
import hashlib
import json
import os
import ssl
import subprocess
import sys

import urllib.error
import urllib.request
from xml.sax.saxutils import escape

_CA = os.environ.get("SSL_CERT_FILE") or ("/root/.ccr/ca-bundle.crt" if os.path.exists("/root/.ccr/ca-bundle.crt") else None)
_SSL = ssl.create_default_context(cafile=_CA) if _CA else ssl.create_default_context()


def scene_ids(spec):
    """Scene ids exactly as build_opl.mjs assigns them (auto title first, auto outro last)."""
    scenes = list(spec.get("scenes", []))
    if not scenes or scenes[0].get("type") != "title":
        scenes.insert(0, {"type": "title", **({"narration": spec["title"]["narration"]} if spec.get("title", {}).get("narration") else {})})
    if spec.get("outro") is not False and scenes[-1].get("type") != "outro":
        scenes.append({"type": "outro", **(spec.get("outro") or {})})
    return [(f"s{i + 1}", s) for i, s in enumerate(scenes)]


def segments(scene):
    n = scene.get("narration")
    if not n:
        return []
    return [n] if isinstance(n, str) else [x for x in n if x]


def duration(path):
    out = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", path],
                         capture_output=True, text=True)
    return round(float(out.stdout.strip()), 3)


async def synth_edge(text, path, voice, rate):
    try:
        import edge_tts
        import edge_tts.communicate as comm
    except ImportError:
        sys.exit("edge-tts is not installed: run  pip install edge-tts")
    comm._SSL_CTX = _SSL  # edge-tts pins certifi's CA list; use the proxy-aware context instead
    await edge_tts.Communicate(text, voice, rate=rate).save(path)


def synth_azure(text, path, voice, rate):
    key, region = os.environ.get("AZURE_SPEECH_KEY"), os.environ.get("AZURE_SPEECH_REGION")
    if not key or not region:
        sys.exit("azure engine needs AZURE_SPEECH_KEY and AZURE_SPEECH_REGION in the environment")
    ssml = (f"<speak version='1.0' xml:lang='th-TH'><voice name='{voice}'>"
            f"<prosody rate='{rate}'>{escape(text)}</prosody></voice></speak>")
    req = urllib.request.Request(
        f"https://{region}.tts.speech.microsoft.com/cognitiveservices/v1", data=ssml.encode("utf-8"), method="POST",
        headers={"Ocp-Apim-Subscription-Key": key, "Content-Type": "application/ssml+xml",
                 "X-Microsoft-OutputFormat": "audio-24khz-96kbitrate-mono-mp3", "User-Agent": "tpm-opl-video"})
    try:
        with urllib.request.urlopen(req, context=_SSL, timeout=60) as r, open(path, "wb") as f:
            f.write(r.read())
    except urllib.error.HTTPError as e:
        if e.code in (401, 403):
            sys.exit(f"azure TTS refused the request (HTTP {e.code}): check AZURE_SPEECH_KEY and that "
                     f"AZURE_SPEECH_REGION ({region}) is the resource's region")
        if e.code == 429 or e.code >= 500:  # throttled (free tier allows few requests per minute) or busy
            raise Retry(float(e.headers.get("Retry-After") or 0)) from e
        raise


class Retry(Exception):
    def __init__(self, after):
        super().__init__(f"retry after {after:.0f}s")
        self.after = after


async def synth(engine, text, path, voice, rate):
    if engine == "azure":
        await asyncio.to_thread(synth_azure, text, path, voice, rate)
    else:
        await synth_edge(text, path, voice, rate)


async def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("spec")
    ap.add_argument("proj")
    ap.add_argument("--voice", default=None)
    ap.add_argument("--rate", default=None)
    ap.add_argument("--engine", choices=["azure", "edge"], default=None)
    a = ap.parse_args()
    spec = json.load(open(a.spec, encoding="utf8"))
    vo_cfg = spec.get("voice", {})
    voice = a.voice or vo_cfg.get("name", "th-TH-PremwadeeNeural")
    rate = a.rate or vo_cfg.get("rate", "+0%")
    engine = a.engine or vo_cfg.get("engine") or ("azure" if os.environ.get("AZURE_SPEECH_KEY") else "edge")
    out_dir = os.path.join(a.proj, "assets", "vo")
    os.makedirs(out_dir, exist_ok=True)
    cache_p = os.path.join(out_dir, "cache.json")
    cache = json.load(open(cache_p)) if os.path.exists(cache_p) else {}
    result = {"engine": engine, "voice": voice, "rate": rate, "scenes": {}}
    total = 0.0
    for sid, scene in scene_ids(spec):
        lens = []
        for k, text in enumerate(segments(scene)):
            path = os.path.join(out_dir, f"{sid}-{k + 1}.mp3")
            key = hashlib.sha1(f"{engine}|{voice}|{rate}|{text}".encode()).hexdigest()
            if cache.get(path) != key or not os.path.exists(path):
                for attempt in range(6):
                    try:
                        await synth(engine, text, path, voice, rate)
                        break
                    except Exception as e:  # throttling / network hiccups: back off, then fail loudly
                        if attempt == 5:
                            sys.exit(f"TTS failed for {sid} segment {k + 1}: {e}")
                        await asyncio.sleep(max(getattr(e, "after", 0), min(60, 4 * 2 ** attempt)))
                cache[path] = key
            lens.append(duration(path))
        if lens:
            result["scenes"][sid] = lens
            total += sum(lens)
            print(f"  {sid}: {len(lens)} segment(s), {sum(lens):.1f}s")
    json.dump(cache, open(cache_p, "w"), indent=1)
    json.dump(result, open(os.path.join(out_dir, "vo.json"), "w"), indent=1)
    print(f"✓ narration: {total:.1f}s of speech, {engine} voice {voice} {rate} → {out_dir}/vo.json")


asyncio.run(main())
