# Hydraulic / Pneumatic OPL video series

Motion-graphics training clips (75 s, Thai voice-over) built with the `tpm-opl-video` skill
(`.claude/skills/tpm-opl-video`) from the JIPM-Solutions deck *Equipment Skills Training – Hydraulic / Pneumatic*.
The source PDF is not stored here; attach it again in a session to write episodes 02–31.

| Path | What |
|---|---|
| `SERIES_PLAN.md` | 31 episodes mapped to PDF pages + EP01 narration script |
| `lib/hyd_lib.js` | shared drawings: hydraulic unit, functional-group boxes, component icons, oil-flow animation |
| `ep01/` | EP01 ส่วนประกอบของระบบไฮดรอลิก — spec + scene animation files |

## Status
- EP01: rendered with Thai voice — 75.0 s, Azure th-TH-PremwadeeNeural at +8%, narration trimmed to fit
  (63.6 s of speech). Lint 0 errors, check passed, cues verified on snapshots. Awaiting pilot approval.
- Voice: Azure AI Speech (`AZURE_SPEECH_KEY`, `AZURE_SPEECH_REGION`, host `<region>.tts.speech.microsoft.com`
  allowed in the environment). Edge TTS does not work in the cloud environment (WebSocket blocked).

## Build EP01 with voice
```bash
SK=.claude/skills/tpm-opl-video/scripts
node $SK/setup_project.mjs training/hydraulic-series/ep01
python3 $SK/narrate.py training/hydraulic-series/ep01/spec.json training/hydraulic-series/ep01
node $SK/build_opl.mjs training/hydraulic-series/ep01/spec.json training/hydraulic-series/ep01
cd training/hydraulic-series/ep01 && npx hyperframes lint && npx hyperframes check
npx hyperframes render --fps 30 --quality high --output EP01_Hydraulic_Components.mp4
```
If the narration makes the clip longer than 75 s, the build lists each scene's length: shorten the
narration or set `"voice": {"rate": "+8%"}` in the spec, then narrate + build again.
