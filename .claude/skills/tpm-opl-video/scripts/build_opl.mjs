#!/usr/bin/env node
// Build a HyperFrames composition (index.html) for a TPM OPL video from an OPL spec JSON.
// Usage: node build_opl.mjs <spec.json> <project-dir>
// The project dir must have been prepared by setup_project.mjs (assets/gsap.min.js,
// assets/fonts/fontfaces.css, assets/sfx/*.wav). Spec format: references/spec-schema.md.

import fs from "node:fs";
import path from "node:path";

const [, , specArg, projArg = "."] = process.argv;
if (!specArg) {
  console.error("usage: node build_opl.mjs <spec.json> <project-dir>");
  process.exit(1);
}
const specPath = path.resolve(specArg);
const specDir = path.dirname(specPath);
const proj = path.resolve(projArg);
const spec = JSON.parse(fs.readFileSync(specPath, "utf8"));

const errors = [];
const warnings = [];

// ---------------------------------------------------------------- helpers
const J = (v) => JSON.stringify(v);
const r3 = (n) => Math.round(n * 1000) / 1000;
const esc = (s) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
// **text** = emphasis (blue), !!text!! = the key point (red — keep to ~5% of the frame)
const md = (s) => esc(s).replace(/\*\*(.+?)\*\*/g, '<span class="em">$1</span>').replace(/!!(.+?)!!/g, '<span class="key">$1</span>');
const plain = (s) => String(s ?? "").replace(/\*\*|!!/g, "");
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
// `at` of an item that may be a plain string (careful: "text".at is String.prototype.at, a function)
// An element may also say {"cue": k}: appear when narration segment k of its scene starts.
let CUES = [];
const atOf = (x) => {
  if (!x || typeof x !== "object") return undefined;
  if (typeof x.at === "number") return x.at;
  if (typeof x.cue === "number" && CUES[x.cue - 1] != null) return r3(CUES[x.cue - 1] + 0.1);
  return undefined;
};

const TYPES = {
  basic: { th: "ความรู้พื้นฐาน", jp: "基礎知識", en: "Basic Knowledge" },
  trouble: { th: "กรณีปัญหา", jp: "トラブル事例", en: "Trouble Case" },
  kaizen: { th: "กรณีปรับปรุง", jp: "改善事例", en: "Kaizen Case" },
};
const READ_CPS = 17; // on-screen reading pace (base characters / second), as in adult subtitle guidelines
const SFX_LEN = { whoosh: 0.45, pop: 0.12, tick: 0.05, thud: 0.35, ok: 0.5, ng: 0.4, alarm: 0.6, squeal: 1.0 };
const SFX_VOL = { whoosh: 0.5, pop: 0.5, tick: 0.5, thud: 0.9, ok: 0.8, ng: 0.7, alarm: 0.6, squeal: 0.35 };
const SFX_TRACK = { whoosh: 10, thud: 11, pop: 12, tick: 12, squeal: 13, ng: 14, alarm: 14, ok: 15 };

const type = TYPES[spec.opl_type];
if (!type) errors.push(`opl_type must be one of ${Object.keys(TYPES).join(" | ")}`);
if (!Array.isArray(spec.scenes) || !spec.scenes.length) errors.push("scenes[] is empty");

function svgMarkup(svg) {
  if (!svg) return "";
  if (typeof svg === "string") return svg;
  return `<svg viewBox="${esc(svg.viewBox || "0 0 800 560")}" preserveAspectRatio="xMidYMid meet">${svg.body || ""}</svg>`;
}
// Shared code for every scene (helpers, drawing functions). Runs once inside build(), before scene 1,
// so anything it declares (functions, consts, H.myHelper = …) is visible to all scene js.
function libJs() {
  const files = [].concat(spec.js_lib || []);
  return files.map((f) => `// ---- js_lib: ${f}\n` + fs.readFileSync(path.resolve(specDir, f), "utf8")).join("\n");
}
function sceneJs(s) {
  let js = s.js || "";
  if (s.js_file) js += "\n" + fs.readFileSync(path.resolve(specDir, s.js_file), "utf8");
  return js;
}

// ---------------------------------------------------------------- scene renderers
// Each renderer returns { html, tw: [code using `b` = scene start], sfx: [[name, t]] } with t relative to scene start.
function ctx(sid) {
  const c = { tw: [], sfx: [], T: {} };
  c.P = (t) => `b + ${r3(t)}`;
  c.rise = (sel, t, o = {}) =>
    c.tw.push(`tl.fromTo(${J(sel)}, { y: ${o.y ?? 40}, opacity: 0 }, { y: 0, opacity: 1, duration: ${o.d ?? 0.45}, ease: "power3.out"${o.stagger ? `, stagger: ${o.stagger}` : ""} }, ${c.P(t)});`);
  c.slide = (sel, t, dx, o = {}) =>
    c.tw.push(`tl.fromTo(${J(sel)}, { x: ${dx}, opacity: 0 }, { x: 0, opacity: 1, duration: ${o.d ?? 0.45}, ease: "power3.out"${o.stagger ? `, stagger: ${o.stagger}` : ""} }, ${c.P(t)});`);
  c.pop = (sel, t, o = {}) =>
    c.tw.push(`tl.fromTo(${J(sel)}, { scale: ${o.from ?? 1.5}, opacity: 0${o.rot != null ? `, rotation: ${o.rot - 14}` : ""} }, { scale: 1, opacity: 1${o.rot != null ? `, rotation: ${o.rot}` : ""}, duration: ${o.d ?? 0.32}, ease: "back.out(2)" }, ${c.P(t)});`);
  c.fade = (sel, t, o = {}) => c.tw.push(`tl.fromTo(${J(sel)}, { opacity: 0, scale: ${o.scale ?? 1} }, { opacity: 1, scale: 1, duration: ${o.d ?? 0.45}, ease: "power2.out" }, ${c.P(t)});`);
  c.s = (name, t) => c.sfx.push([name, t]);
  c.id = (x) => `${sid}-${x}`;
  return c;
}

const R = {};

R.title = (s, sid, dur) => {
  const c = ctx(sid);
  const t = spec.title || {};
  const len = Math.max(plain(t.line1).length, plain(t.line2).length);
  const size = len > 22 ? 76 : len > 14 ? 92 : 112;
  const vis = s.svg ? svgMarkup(s.svg) : `<div class="ti-kanji">一点</div>`;
  const html = `
      <div class="ti-left" style="--ti-size:${size}px">
        <span class="ti-stamp" id="${c.id("stamp")}">OPL</span>
        <span class="ti-l1" id="${c.id("l1")}">${md(t.line1)}</span>
        ${t.line2 ? `<span class="ti-l2" id="${c.id("l2")}">${md(t.line2)}</span>` : ""}
        ${t.sub ? `<span class="ti-sub" id="${c.id("sub")}">${md(t.sub)}</span>` : ""}
        <span class="ti-type" id="${c.id("type")}">${type.jp} · ${type.th}</span>
      </div>
      <div class="ti-vis" id="${c.id("vis")}">${vis}</div>`;
  c.fade(`#${c.id("vis")}`, 0.15, { scale: 0.92 });
  c.pop(`#${c.id("stamp")}`, 0.4, { from: 1.8, rot: -6, d: 0.35 });
  c.s("thud", 0.45);
  c.rise([`#${c.id("l1")}`, ...(t.line2 ? [`#${c.id("l2")}`] : [])], 0.6, { y: 70, d: 0.5, stagger: 0.14 });
  if (t.sub) { c.rise(`#${c.id("sub")}`, 1.25, { y: 30 }); c.s("pop", 1.3); }
  c.rise(`#${c.id("type")}`, 1.6, { y: 20, d: 0.35 });
  return { html, ...c };
};

R.compare = (s, sid, dur) => {
  const c = ctx(sid);
  const TAG = { before: "BEFORE", after: "AFTER" };
  const card = (k, d) => `
        <div class="card tone-${d.tone || "neutral"}" id="${c.id(k)}">
          ${d.tag || TAG[d.tone] ? `<span class="card-tag">${esc(d.tag || TAG[d.tone])}</span>` : ""}
          <h3>${md(d.title)}</h3>
          ${d.svg ? `<div class="card-vis">${svgMarkup(d.svg)}</div>` : ""}
          <ul>${(d.bullets || []).map((x) => `<li class="${c.id(k)}-li"><span class="dot"></span>${md(x)}</li>`).join("")}</ul>
        </div>`;
  const A = s.left || {}, B = s.right || {};
  const html = `
      <h2 class="h2" id="${c.id("h")}">${md(s.heading)}</h2>
      <div class="cmp">${card("a", A)}${card("b", B)}</div>
      ${s.banner ? `<span class="banner tone-${s.banner.tone || "ink"}" id="${c.id("ban")}">${md(s.banner.text)}</span>` : ""}`;
  c.rise(`#${c.id("h")}`, 0.05);
  const nA = (A.bullets || []).length, nB = (B.bullets || []).length;
  const tA = atOf(A) ?? 0.5, tB = atOf(B) ?? Math.max(1.8, tA + 0.4 + nA * 0.3 + 0.2);
  c.T.left = r3(tA); c.T.right = r3(tB);
  c.slide(`#${c.id("a")}`, tA, -90, { d: 0.5 }); c.s("pop", tA);
  if (nA) c.slide(`.${c.id("a")}-li`, tA + 0.4, -30, { d: 0.35, stagger: 0.3 });
  c.slide(`#${c.id("b")}`, tB, 90, { d: 0.5 }); c.s("pop", tB);
  if (nB) c.slide(`.${c.id("b")}-li`, tB + 0.4, 30, { d: 0.35, stagger: 0.3 });
  if (s.banner) {
    const tBan = atOf(s.banner) ?? Math.max(dur - 1.4, tB + 0.4 + nB * 0.3 + 0.3);
    c.T.banner = r3(tBan);
    c.pop(`#${c.id("ban")}`, tBan, { from: 1.4, d: 0.3 }); c.s("thud", tBan);
  }
  return { html, ...c };
};

const ICONS = {
  lock: `<svg viewBox="0 0 300 360"><path class="ic-shackle" d="M 80 170 L 80 110 A 70 70 0 0 1 220 110 L 220 170" fill="none" stroke="#f2a900" stroke-width="34" stroke-linecap="round"/><rect x="30" y="160" width="240" height="190" rx="30" fill="#f2a900"/><circle cx="150" cy="235" r="26" fill="#121417"/><rect x="138" y="245" width="24" height="60" rx="10" fill="#121417"/></svg>`,
  warning: `<svg viewBox="0 0 300 360"><path d="M150 40 L285 300 L15 300 Z" fill="#f2a900" stroke="#f2a900" stroke-width="18" stroke-linejoin="round"/><rect x="134" y="120" width="32" height="110" rx="12" fill="#121417"/><circle cx="150" cy="262" r="18" fill="#121417"/></svg>`,
  stop: `<svg viewBox="0 0 300 360"><path d="M95 40 H205 L285 120 V230 L205 310 H95 L15 230 V120 Z" fill="#d0233a"/><rect x="70" y="150" width="160" height="50" rx="10" fill="#fff"/></svg>`,
};

R.alert = (s, sid, dur) => {
  const c = ctx(sid);
  const icon = s.svg ? svgMarkup(s.svg) : ICONS[s.icon || "lock"] || ICONS.lock;
  const html = `
      <div class="hazard" id="${c.id("hz1")}" data-layout-allow-overflow></div>
      <div class="hazard bot" id="${c.id("hz2")}" data-layout-allow-overflow></div>
      <div class="al-row">
        <div class="al-icon" id="${c.id("icon")}">${icon}</div>
        <div class="al-txt">
          ${s.pre ? `<span class="al-pre" id="${c.id("pre")}">${md(s.pre)}</span>` : ""}
          <span class="al-big" id="${c.id("big")}">${md(s.big)}</span>
          ${s.note ? `<span class="al-note" id="${c.id("note")}">${md(s.note)}</span>` : ""}
        </div>
      </div>`;
  c.tw.push(`tl.fromTo(${J("#" + c.id("hz1"))}, { x: -184 }, { x: 0, duration: ${r3(dur)}, ease: "none" }, b);`);
  c.tw.push(`tl.fromTo(${J("#" + c.id("hz2"))}, { x: 0 }, { x: -184, duration: ${r3(dur)}, ease: "none" }, b);`);
  c.pop(`#${c.id("icon")}`, 0.08, { from: 0.6, d: 0.35 }); c.s("thud", 0.1);
  if (!s.svg && (s.icon || "lock") === "lock") {
    c.tw.push(`tl.fromTo(${J(`#${c.id("icon")} .ic-shackle`)}, { y: -40 }, { y: 0, duration: 0.18, ease: "power4.in" }, ${c.P(1.07)});`);
    c.s("pop", 1.25);
  }
  if (s.icon === "warning" || s.icon === "stop") c.s("alarm", 0.3);
  if (s.pre) c.rise(`#${c.id("pre")}`, 0.25, { y: 30, d: 0.3 });
  c.tw.push(`tl.fromTo(${J("#" + c.id("big"))}, { scale: 1.18, opacity: 0, transformOrigin: "0% 50%" }, { scale: 1, opacity: 1, transformOrigin: "0% 50%", duration: 0.35, ease: "power3.out" }, ${c.P(0.4)});`);
  if (s.note) c.rise(`#${c.id("note")}`, 0.85, { y: 24, d: 0.35 });
  return { html, ...c };
};

function pointTimes(s, n, dur, start = 1.2, tail = 2.2) {
  const gap = n ? clamp((dur - start - tail) / n, 0.6, 2.2) : 0;
  return Array.from({ length: n }, (_, i) => atOf(s.points?.[i]) ?? start + i * gap);
}

R.diagram = (s, sid, dur) => {
  const c = ctx(sid);
  const pts = s.points || [];
  const numbered = s.numbered !== false;
  const split = pts.length > 0 || !!s.callout;
  const pt = (p, i) => `
          <div class="pt" id="${c.id("p" + (i + 1))}"><span class="pn${numbered ? "" : " dot"}">${numbered ? i + 1 : ""}</span><span class="ptx">${md(typeof p === "string" ? p : p.text)}</span></div>`;
  const co = s.callout;
  const html = `
      <h2 class="h2" id="${c.id("h")}">${md(s.heading)}</h2>
      <div class="dg-body ${split ? "split" : "full"}">
        <div class="dg-vis" id="${c.id("vis")}">${svgMarkup(s.svg)}</div>
        ${split ? `<div class="dg-panel">${pts.map(pt).join("")}
          ${co ? `<div class="callout" id="${c.id("co")}">${co.label ? `<span class="k">${md(co.label)}</span>` : ""}<span class="v">${md(co.value)}</span>${co.example ? `<span class="x">${md(co.example)}</span>` : ""}</div>` : ""}
        </div>` : ""}
      </div>
      ${s.caption ? `<span class="dg-cap">${md(s.caption)}</span>` : ""}`;
  c.rise(`#${c.id("h")}`, 0.05);
  c.fade(`#${c.id("vis")}`, 0.3, { scale: 0.94, d: 0.5 });
  const times = pointTimes(s, pts.length, dur, 1.2, co ? 2.4 : 1.2);
  c.T.points = times.map(r3);
  times.forEach((t, i) => {
    const sel = `#${c.id("p" + (i + 1))}`;
    if (numbered) c.tw.push(`tl.fromTo(${J(sel)}, { opacity: 0.3, x: 20 }, { opacity: 1, x: 0, duration: 0.35 }, ${c.P(t)});`);
    else c.slide(sel, t, 30, { d: 0.35 });
    c.s("pop", t);
  });
  if (co) {
    const tc = atOf(co) ?? (times.length ? times[times.length - 1] + 1.0 : 1.2);
    c.T.callout = tc;
    c.rise(`#${c.id("co")}`, tc); c.s("pop", tc);
  }
  return { html, ...c };
};

// Verdicts: OK / NG, or a third "watch" level (○△× in Japanese practice): WATCH, △, CHECK, เฝ้าดู …
const vkind = (v) => (v === "OK" || v === "○" ? "ok" : v === "NG" || v === "×" ? "ng" : "warn");
const VCLS = { ok: "okc", ng: "", warn: "warnc" };

R.judgment = (s, sid, dur) => {
  const c = ctx(sid);
  const cards = s.cards || [];
  const html = `
      <h2 class="h2" id="${c.id("h")}">${md(s.heading)}</h2>
      <div class="jg">${cards.map((d, i) => `
        <div class="card jcard ${VCLS[vkind(d.verdict)]} ${c.id("card")}" id="${c.id("c" + (i + 1))}">
          <div class="jhead"><h3>${md(d.label)}</h3><span class="stamp ${vkind(d.verdict)}" id="${c.id("st" + (i + 1))}">${esc(d.verdict)}</span></div>
          ${d.svg ? `<div class="card-vis">${svgMarkup(d.svg)}</div>` : ""}
          ${d.cond ? `<span class="cond">${md(d.cond)}</span>` : ""}
          ${d.act ? `<span class="act" id="${c.id("a" + (i + 1))}">${md(d.act)}</span>` : ""}
        </div>`).join("")}
      </div>
      ${s.banner ? `<span class="banner tone-${s.banner.tone || "ink"}" id="${c.id("ban")}">${md(s.banner.text)}</span>` : ""}`;
  c.rise(`#${c.id("h")}`, 0.05);
  c.rise(`.${c.id("card")}`, 0.2, { y: 60, stagger: 0.12 });
  c.T.stamps = [];
  cards.forEach((d, i) => {
    const t = atOf(d) ?? 0.8 + i * 0.8;
    c.T.stamps.push(r3(t));
    c.pop(`#${c.id("st" + (i + 1))}`, t, { from: 2.2, rot: -8, d: 0.28 });
    c.s(d.sfx || { ok: "ok", ng: "ng", warn: "pop" }[vkind(d.verdict)], t);
    if (d.act) c.rise(`#${c.id("a" + (i + 1))}`, t + 0.1, { y: 16, d: 0.3 });
  });
  if (s.banner) {
    const tBan = atOf(s.banner) ?? Math.max(dur - 1.6, 0.8 + cards.length * 0.8 + 0.4);
    c.T.banner = r3(tBan);
    c.rise(`#${c.id("ban")}`, tBan); c.s("pop", tBan);
  }
  return { html, ...c };
};

R.checklist = (s, sid, dur) => {
  const c = ctx(sid);
  const items = s.items || [];
  const html = `
      <h2 class="h2" id="${c.id("h")}">${md(s.heading)}</h2>
      <div class="cl">${items.map((it, i) => `
        <div class="chk ${c.id("it")}" id="${c.id("r" + (i + 1))}">
          ${it.svg ? `<div class="chk-ic">${svgMarkup(it.svg)}</div>` : `<span class="chk-n">${i + 1}</span>`}
          <div><span class="ct">${md(it.title)}</span>${it.sub ? `<span class="cs">${md(it.sub)}</span>` : ""}</div>
        </div>`).join("")}
      </div>
      ${s.note ? `<span class="note" id="${c.id("note")}">${md(s.note)}</span>` : ""}`;
  c.rise(`#${c.id("h")}`, 0.05);
  c.T.items = items.map((it, i) => r3(atOf(it) ?? 0.5 + i * 0.4));
  c.T.items.forEach((t, i) => { c.slide(`#${c.id("r" + (i + 1))}`, t, -70, { d: 0.4 }); c.s("pop", t); });
  if (s.note) c.fade(`#${c.id("note")}`, atOf({ at: s.note_at, cue: s.note_cue }) ?? Math.max(...c.T.items, 0) + 0.7);
  return { html, ...c };
};

R.whywhy = (s, sid, dur) => {
  const c = ctx(sid);
  const whys = s.whys || [];
  const gap = s.gap ?? 0.85;
  const stack = `
        <div class="ww">
          <div class="ww-row ph" id="${c.id("ph")}"><span class="ww-tag">${esc(s.phenomenon_tag || "ปรากฏการณ์")}</span><span class="ww-t">${md(s.phenomenon)}</span></div>
          ${whys.map((w, i) => `<div class="ww-row" id="${c.id("w" + (i + 1))}"><span class="ww-tag">${esc((typeof w === "object" && w.tag) || `Why ${i + 1}`)}</span><span class="ww-t">${md(typeof w === "string" ? w : w.text)}</span></div>`).join("")}
          ${s.root ? `<div class="ww-row root" id="${c.id("root")}"><span class="ww-tag">${esc(s.root_tag || "สาเหตุราก")}</span><span class="ww-t">${md(s.root)}</span></div>` : ""}
        </div>`;
  const html = `
      <h2 class="h2" id="${c.id("h")}">${md(s.heading || "วิเคราะห์ Why-Why หาสาเหตุราก")}</h2>
      <div class="ww-body ${s.svg ? "split" : ""}">${stack}${s.svg ? `<div class="ww-vis" id="${c.id("vis")}">${svgMarkup(s.svg)}</div>` : ""}</div>`;
  c.rise(`#${c.id("h")}`, 0.05);
  if (s.svg) c.fade(`#${c.id("vis")}`, 0.3, { scale: 0.94 });
  c.T.phenomenon = 0.4; c.T.whys = whys.map((w, i) => r3(atOf(w) ?? 1.1 + i * gap));
  c.slide(`#${c.id("ph")}`, 0.4, -40, { d: 0.4 }); c.s("pop", 0.4);
  whys.forEach((w, i) => { const t = atOf(w) ?? 1.1 + i * gap; c.slide(`#${c.id("w" + (i + 1))}`, t, -40, { d: 0.35 }); c.s("tick", t); });
  if (s.root) { const t = atOf({ at: s.root_at, cue: s.root_cue }) ?? 1.1 + whys.length * gap + 0.2; c.T.root = r3(t); c.pop(`#${c.id("root")}`, t, { from: 1.15, d: 0.35 }); c.s("thud", t); }
  return { html, ...c };
};

R.result = (s, sid, dur) => {
  const c = ctx(sid);
  const ms = s.metrics || [];
  const fmt = (v) => (Math.abs(v) < 10 ? Math.round(v * 10) / 10 : Math.round(v));
  const rows = ms.map((m, i) => {
    const lower = m.better !== "higher";
    const max = Math.max(m.before, m.after) || 1;
    const pct = m.before ? ((lower ? m.before - m.after : m.after - m.before) / m.before) * 100 : 0;
    if (pct <= 0) warnings.push(`${sid}: metric "${plain(m.label)}" did not improve (${m.before} → ${m.after}, better=${lower ? "lower" : "higher"})`);
    return `
        <div class="rs-row" id="${c.id("m" + (i + 1))}">
          <span class="rs-l">${md(m.label)}</span>
          <div class="rs-bars">
            <div class="rs-bar"><div class="rs-track"><div class="rs-fill b4" id="${c.id("b" + (i + 1))}" style="width:${r3((m.before / max) * 100)}%"></div></div><span class="rs-v">ก่อน ${esc(m.before)} ${esc(m.unit || "")}</span></div>
            <div class="rs-bar"><div class="rs-track"><div class="rs-fill af" id="${c.id("f" + (i + 1))}" style="width:${r3((m.after / max) * 100)}%"></div></div><span class="rs-v">หลัง ${esc(m.after)} ${esc(m.unit || "")}</span></div>
          </div>
          <span class="rs-pct" id="${c.id("p" + (i + 1))}">${lower ? "ลดลง" : "เพิ่มขึ้น"} ${fmt(pct)}%</span>
        </div>`;
  });
  const html = `
      <h2 class="h2" id="${c.id("h")}">${md(s.heading || "ผลลัพธ์หลังปรับปรุง")}</h2>
      <div class="rs">${rows.join("")}</div>
      ${s.note ? `<span class="note" id="${c.id("note")}">${md(s.note)}</span>` : ""}`;
  c.rise(`#${c.id("h")}`, 0.05);
  c.T.rows = ms.map((m, i) => r3(atOf(m) ?? 0.5 + i * 1.3));
  ms.forEach((_, i) => {
    const t = c.T.rows[i];
    c.fade(`#${c.id("m" + (i + 1))}`, t, { d: 0.3 });
    c.tw.push(`tl.fromTo(${J("#" + c.id("b" + (i + 1)))}, { scaleX: 0 }, { scaleX: 1, transformOrigin: "0% 50%", duration: 0.5, ease: "power2.out" }, ${c.P(t + 0.1)});`);
    c.tw.push(`tl.fromTo(${J("#" + c.id("f" + (i + 1)))}, { scaleX: 0 }, { scaleX: 1, transformOrigin: "0% 50%", duration: 0.5, ease: "power2.out" }, ${c.P(t + 0.5)});`);
    c.pop(`#${c.id("p" + (i + 1))}`, t + 0.95, { from: 1.6 }); c.s(i === ms.length - 1 ? "ok" : "pop", t + 0.95);
  });
  if (s.note) c.fade(`#${c.id("note")}`, Math.max(...c.T.rows, 0) + 1.2);
  return { html, ...c };
};

R.outro = (s, sid, dur) => {
  const c = ctx(sid);
  const f = spec.form || {};
  const v = (x) => esc(x || "—");
  const missing = [["no", "OPL No."], ["date", "date"], ["author", "author"], ["approver", "approver"]].filter(([k]) => !f[k]).map(([, n]) => n);
  if (missing.length) warnings.push(`form: missing ${missing.join(", ")} — shown as "—" (rubric 5.2); ask the user`);
  const html = `
      ${s.tag ? `<span class="oc-tag" id="${c.id("tag")}">${md(s.tag)}</span>` : ""}
      <div class="oc-grid">
        ${s.standard ? `<div class="oc-box ${c.id("box")}"><span class="k">ผูกกับมาตรฐาน (Standard)</span><span class="v">${md(s.standard)}</span></div>` : ""}
        ${s.yokoten ? `<div class="oc-box ${c.id("box")}"><span class="k">ขยายผล · <span class="jp">横展開</span> Yokoten</span><span class="v">${md(s.yokoten)}</span></div>` : ""}
      </div>
      <div class="oc-form" id="${c.id("form")}">
        <span><b>OPL No.</b> ${v(f.no)}</span><span><b>วันที่</b> ${v(f.date)}</span><span><b>ผู้จัดทำ</b> ${v(f.author)}</span><span><b>ผู้อนุมัติ</b> ${v(f.approver)}</span>
      </div>
      <span class="oc-track" id="${c.id("trk")}">หลังดูจบ → ลงชื่อในตาราง Tracking ผู้รับการถ่ายทอด (ผู้สอน · ผู้เรียน · วันที่)</span>`;
  if (s.tag) { c.pop(`#${c.id("tag")}`, 0.2, { from: 1.4 }); c.s("thud", 0.2); }
  if (s.standard || s.yokoten) { c.rise(`.${c.id("box")}`, 0.9, { stagger: 0.3 }); c.s("pop", 0.9); }
  c.rise(`#${c.id("form")}`, 1.7, { y: 20 });
  c.rise(`#${c.id("trk")}`, 2.2, { y: 20 });
  return { html, ...c };
};

const NON_TEXT = new Set(["narration", "cue", "note_cue", "root_cue", "caption", "root_tag", "phenomenon_tag", "type", "tone", "verdict", "svg", "js", "js_file", "anim", "sfx", "icon", "better", "unit", "tag", "duration", "at", "gap", "numbered", "before", "after"]);
function textOf(v, k) {
  if (k && NON_TEXT.has(k)) return "";
  if (typeof v === "string") return plain(v);
  if (Array.isArray(v)) return v.map((x) => textOf(x)).join("");
  if (v && typeof v === "object") return Object.entries(v).map(([kk, vv]) => textOf(vv, kk)).join("");
  return "";
}

function defaultDuration(s) {
  switch (s.type) {
    case "title": return 3.5;
    case "compare": return 6;
    case "alert": return 3;
    case "diagram": return clamp(3.2 + 1.7 * (s.points || []).length + (s.callout ? 1.6 : 0), 5, 11);
    case "judgment": return clamp(2.4 + 0.8 * (s.cards || []).length + (s.banner ? 1.4 : 0), 4.5, 7);
    case "checklist": return clamp(2.4 + 0.5 * (s.items || []).length + (s.note ? 1 : 0), 4, 7);
    case "whywhy": return clamp(2.6 + (s.gap ?? 0.85) * (s.whys || []).length + 1.6, 5, 10);
    case "result": return clamp(2.2 + 1.3 * (s.metrics || []).length, 4.5, 8);
    case "outro": return 4.5;
    default: return 5;
  }
}

// ---------------------------------------------------------------- assemble
const scenes = [...(spec.scenes || [])];
if (scenes[0]?.type !== "title") scenes.unshift({ type: "title", ...(spec.title?.narration ? { narration: spec.title.narration } : {}) });
if (spec.outro !== false && scenes[scenes.length - 1]?.type !== "outro") scenes.push({ type: "outro", ...(spec.outro || {}) });

// Narration: per-scene segments, real lengths from narrate.py's vo.json, otherwise estimated.
const VO_DIR = path.join(proj, "assets", "vo");
const voJson = fs.existsSync(path.join(VO_DIR, "vo.json")) ? JSON.parse(fs.readFileSync(path.join(VO_DIR, "vo.json"), "utf8")) : null;
const VO_LEAD = 0.5, VO_GAP = 0.3, VO_TAIL = 0.8, VO_EST_CPS = 13; // seconds; base Thai chars/s when estimating
const baseChars = (t) => String(t).replace(/[\u0E31\u0E34-\u0E3A\u0E47-\u0E4E]/g, "").replace(/[^\u0E00-\u0E7Fa-zA-Z0-9]/g, "").length;
const narrated = scenes.some((s) => s.narration);
let estimated = 0;

// pass 1 — durations and narration cue times
const plan = scenes.map((s, i) => {
  const sid = `s${i + 1}`;
  const segs = !s.narration ? [] : [].concat(s.narration).filter(Boolean);
  const real = voJson?.scenes?.[sid];
  const haveAudio = real && real.length === segs.length && segs.every((_, k) => fs.existsSync(path.join(VO_DIR, `${sid}-${k + 1}.mp3`)));
  const lens = segs.map((t, k) => (haveAudio ? real[k] : r3(baseChars(t) / VO_EST_CPS + 0.4)));
  if (segs.length && !haveAudio) estimated++;
  const cues = [];
  let t = s.type === "title" ? 1.2 : VO_LEAD;
  lens.forEach((len) => { cues.push(r3(t)); t += len + VO_GAP; });
  const voEnd = lens.length ? t - VO_GAP + VO_TAIL : 0;
  const textChars = baseChars(textOf(s));
  const auto = defaultDuration(s);
  let dur = s.duration ?? Math.ceil(clamp(Math.max(auto, textChars / READ_CPS), auto, Math.max(auto, 10)) * 10) / 10;
  if (voEnd > dur) {
    if (s.duration != null) warnings.push(`${sid}: narration needs ${voEnd.toFixed(1)}s but duration is ${s.duration}s — extended`);
    dur = Math.ceil(voEnd * 10) / 10;
  }
  return { s, sid, segs, lens, cues, haveAudio, textChars, dur: r3(dur) };
});
if (narrated && estimated) warnings.push(`narration: ${estimated} scene(s) use ESTIMATED speech length (no audio yet) — run narrate.py, then rebuild`);

// optional fixed length (e.g. a 75 s training-clip slot): pad the outro, or report the overrun
if (spec.target_duration) {
  const sum = plan.reduce((a, p) => a + p.dur, 0), diff = r3(spec.target_duration - sum), last = plan[plan.length - 1];
  if (diff > 0 && last.s.type === "outro") last.dur = r3(last.dur + diff);
  else if (diff < -1) warnings.push(`target_duration ${spec.target_duration}s exceeded by ${(-diff).toFixed(1)}s — shorten narration: ` + plan.map((p) => `${p.sid} ${p.dur}s`).join(", "));
}

// pass 2 — render scenes
let base = 0;
const built = [];
const animSeen = new Set();
const sfx = [];
const vo = [];
plan.forEach(({ s, sid, segs, lens, cues, haveAudio, textChars, dur }, i) => {
  if (!R[s.type]) { errors.push(`${sid}: unknown scene type "${s.type}"`); return; }
  CUES = cues;
  const out = R[s.type](s, sid, dur);
  out.T.cues = cues;
  const anims = (s.anim || []).map((a) => {
    const to = { ...(a.to || {}), duration: a.dur ?? 0.5, ease: a.ease ?? "power2.out" };
    if (a.repeat != null) to.repeat = a.repeat;
    if (a.yoyo) to.yoyo = true;
    if (a.stagger != null) to.stagger = a.stagger;
    const at = atOf(a) ?? 0;
    if (a.sfx) out.sfx.push([a.sfx, at]);
    // a later fromTo on the same target must not apply its from-values at build time
    const key = J(a.t);
    if (a.from && animSeen.has(key)) to.immediateRender = false;
    animSeen.add(key);
    return a.from
      ? `tl.fromTo(${J(a.t)}, ${J(a.from)}, ${J(to)}, b + ${r3(at)});`
      : `tl.to(${J(a.t)}, ${J(to)}, b + ${r3(at)});`;
  });
  for (const [name, t] of s.sfx || []) out.sfx.push([name, t]);
  if (i > 0) out.sfx.push(["whoosh", 0]);
  else out.sfx.push(["whoosh", 0.1]);
  for (const [name, t] of out.sfx) {
    if (!SFX_LEN[name]) { errors.push(`${sid}: unknown sfx "${name}" (use ${Object.keys(SFX_LEN).join(", ")})`); continue; }
    if (t > dur) warnings.push(`${sid}: sfx "${name}" at ${t}s is after the scene ends (${dur}s)`);
    sfx.push({ name, t: r3(base + t) });
  }
  if (haveAudio) segs.forEach((_, k) => vo.push({ id: `vo-${sid}-${k + 1}`, src: `assets/vo/${sid}-${k + 1}.mp3`, t: r3(base + cues[k]), len: lens[k] }));
  // on-screen text with a voice reading the detail may be a little denser than silent text
  const cps = textChars / dur, limit = READ_CPS * (segs.length ? 1.6 : 1.35);
  if (s.type !== "title" && s.type !== "outro" && cps > limit)
    warnings.push(`${sid} (${s.type}): ${textChars} chars in ${dur}s = ${cps.toFixed(1)} chars/s — too dense for operators; cut words or set duration ≥ ${Math.ceil(textChars / READ_CPS)}s`);
  if (s.caption && s.type !== "diagram") out.html += `\n      <span class="dg-cap">${md(s.caption)}</span>`;
  // T = when generated elements appear (seconds from scene start), so scene js can sync to them
  const tDecl = `const T = ${J(out.T)};`;
  built.push({ sid, type: s.type, base: r3(base), dur, html: out.html, code: [tDecl, sceneJs(s), ...out.tw, ...anims].filter(Boolean), dark: s.type === "alert", custom: !!(s.js || s.js_file || (s.anim || []).length) });
  base += dur;
});
const TOTAL = r3(base);

const keyCount = (JSON.stringify(spec).match(/!![^!]+!!/g) || []).length;
if (keyCount > 4) warnings.push(`${keyCount} !!key!! (red) highlights — 70:25:5 rule wants red only on the single most important point per scene`);
if (TOTAL > 60 && !spec.target_duration) warnings.push(`total ${TOTAL}s — OPL videos work best at 30–45s (one point only)`);

const fontCssPath = path.join(proj, "assets", "fonts", "fontfaces.css");
if (!fs.existsSync(fontCssPath)) errors.push(`missing ${fontCssPath} — run setup_project.mjs first`);
if (!fs.existsSync(path.join(proj, "assets", "gsap.min.js"))) errors.push("missing assets/gsap.min.js — run setup_project.mjs first");

if (errors.length) {
  console.error("✗ build failed:\n  - " + errors.join("\n  - "));
  process.exit(1);
}

const f = spec.form || {};
const hudMid = [f.no ? `OPL No. ${f.no}` : "", f.machine || "", f.pillar ? `Pillar: ${f.pillar}` : ""].filter(Boolean).join(" · ");

const sectionsHtml = built.map((b) => `
      <section id="${b.sid}" class="clip scene sc-${b.type}${b.dark ? " dark" : ""}" data-start="${b.base}" data-duration="${b.dur}" data-track-index="1">${b.html}
      </section>`).join("\n");

const duck = narrated ? 0.4 : 1; // keep effects under the voice
const audioHtml = sfx
  .sort((a, b) => a.t - b.t)
  .map((x, i) => `      <audio id="sfx-${String(i + 1).padStart(2, "0")}" src="assets/sfx/${x.name}.wav" data-start="${x.t}" data-duration="${SFX_LEN[x.name]}" data-track-index="${SFX_TRACK[x.name]}" data-volume="${r3(SFX_VOL[x.name] * duck)}"></audio>`)
  .concat(vo.map((v) => `      <audio id="${v.id}" src="${v.src}" data-start="${v.t}" data-duration="${v.len}" data-track-index="20" data-volume="1"></audio>`))
  .join("\n");

const sceneCode = built.map((b) => `
        // ---- ${b.sid} ${b.type} (${b.base}s – ${r3(b.base + b.dur)}s)
        { const b = ${b.base}, D = ${b.dur};
          ${b.code.join("\n          ")}
        }`).join("\n");

// Characters that only appear in text created by js (H.text, labels) — put them in the page so the font
// subsets that contain them are loaded before the first frame.
const jsGlyphs = [...new Set((libJs() + built.map((b) => b.code.join("\n")).join("\n")).replace(/[\x00-\x7F]/g, ""))].join("");

const CSS = fs.readFileSync(new URL("./opl_styles.css", import.meta.url), "utf8");
const RUNTIME = fs.readFileSync(new URL("./opl_runtime.js", import.meta.url), "utf8");

const html = `<!doctype html>
<html lang="th">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=1920, height=1080" />
    <title>${esc(plain([spec.title?.line1, spec.title?.line2].filter(Boolean).join(" ")) || "OPL")}</title>
    <script src="assets/gsap.min.js"></script>
    <style>
${fs.readFileSync(fontCssPath, "utf8")}
${CSS}
    </style>
  </head>
  <body>
    <div id="root" data-composition-id="main" data-start="0" data-width="1920" data-height="1080" data-duration="${TOTAL}">
      <div id="bg"></div>
      <div id="hud">
        <span>ONE POINT LESSON · <span class="jp">一点レッスン</span></span>
        <span class="hud-mid">${esc(hudMid)}</span>
        <span>ประเภท: <span class="tag">${type.th} · <span class="jp">${type.jp}</span></span></span>
      </div>
      <div id="progress"><div id="progress-fill"></div></div>
      <span id="font-preload" style="display:none">${esc(jsGlyphs)}</span>
${sectionsHtml}

${audioHtml}
    </div>
    <script>
${RUNTIME}
      function build() {
        const tl = gsap.timeline({ paused: true });
        tl.fromTo("#progress-fill", { scaleX: 0 }, { scaleX: 1, transformOrigin: "0% 50%", ease: "none", duration: ${TOTAL} }, 0);
${libJs()}
${sceneCode}
        window.__timelines["main"] = tl;
      }
      loadFonts().then(build, build);
    </script>
  </body>
</html>
`;

// duplicate id check across the assembled page (user SVG + generated)
const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]);
const dup = [...new Set(ids.filter((x, i) => ids.indexOf(x) !== i))];
if (dup.length) {
  console.error(`✗ duplicate element ids: ${dup.join(", ")} — prefix SVG ids with the scene id (s1-, s2-, …)`);
  process.exit(1);
}

fs.writeFileSync(path.join(proj, "index.html"), html);
fs.writeFileSync(path.join(proj, "opl.spec.json"), JSON.stringify(spec, null, 2));

console.log(`✓ wrote ${path.join(proj, "index.html")}  (${TOTAL}s, ${built.length} scenes, ${sfx.length} sfx)`);
for (const b of built) console.log(`  ${b.sid.padEnd(4)} ${b.type.padEnd(10)} ${String(b.base).padStart(6)}s → ${String(r3(b.base + b.dur)).padStart(6)}s`);
if (warnings.length) console.log("⚠ warnings:\n  - " + warnings.join("\n  - "));
const ends = built.map((b) => r3(b.base + b.dur - 0.3));
const mids = built.filter((b) => b.custom).flatMap((b) => [r3(b.base + b.dur * 0.35), r3(b.base + b.dur * 0.6)]);
const snapCmd = (ts, dir) => {
  const out = [];
  for (let i = 0; i < ts.length; i += 9) out.push(`  npx hyperframes snapshot --at ${ts.slice(i, i + 9).join(",")} --no-end --describe false -o snapshots/${dir}${ts.length > 9 ? "-" + (i / 9 + 1) : ""}`);
  return out.join("\n");
};
console.log(`next:\n  npx hyperframes lint && npx hyperframes check\n  # scene ends\n${snapCmd(ends, "ends")}`);
if (mids.length) console.log(`  # mid-animation (scenes with js/anim)\n${snapCmd(mids, "mid")}`);
