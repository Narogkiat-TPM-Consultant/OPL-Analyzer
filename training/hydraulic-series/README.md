# Hydraulic / Pneumatic OPL video series

Motion-graphics training clips (75 s, Thai voice-over) built with the `tpm-opl-video` skill
(`.claude/skills/tpm-opl-video`) from the JIPM-Solutions deck *Equipment Skills Training – Hydraulic / Pneumatic*.
The source PDF is not stored here; attach it again in a session to revise an episode.

| Path | What |
|---|---|
| `SERIES_PLAN.md` | 31 episodes mapped to PDF pages + EP01 narration script |
| `lib/hyd_lib.js` | shared drawings: hydraulic unit, functional-group boxes, component icons, oil-flow animation |
| `ep01/` … `ep08/` | Part A (hydraulic basics, OPL 5-A-1 … 5-A-10): spec, scene animation files, episode `lib.js` |
| `ep09/` … `ep12/` | Part B (hydraulic trouble, OPL 5-B-1 … 5-B-4): troubleshooting-type OPLs (symptom → cause → countermeasure; no Why-Why invented) |
| `ep13/` … `ep21/` | Part C (hydraulic inspection, OPL 5-C-1 … 5-C-13): check item + OK/NG with the deck's criteria, for AM check sheets |
| `ep22/` … `ep31/` | Part D (pneumatics, OPL 5'-A-1 … 5'-C-5): air basics, FRL set, drain, lubrication, periodic checks, tube binding |
| `am/` | AM check sheets (Excel): hydraulic unit from Part C (EP13–21), pneumatic system from Part D (EP28–31 + FRL EP23–25); Know My Machine for the hydraulic unit (EP01–21) and the pneumatic system (EP22–31), built by `kmm_common.py` |

## Status
- Part A EP01–EP08 rendered: 75.0 s each, Azure th-TH-PremwadeeNeural at +8%, lint 0 errors, check passed,
  snapshots reviewed. EP01 approved as pilot. Facts flagged for confirmation are listed per episode in the
  delivery notes (proposal captions `* ข้อเสนอ — ให้หัวหน้างานยืนยัน` on screen).
- Part B EP09–EP12 rendered the same way (`opl_type: trouble`).
- Part C EP13–EP21 rendered the same way (`opl_type: basic`, OK/NG cards with the deck's exact criteria).
- Video library (private claude.ai page with players and MP4 save buttons): https://claude.ai/artifact/Gd2jwcZSmHLigisBJR5xqz
- Part D EP22–EP31 rendered the same way (pneumatics, PDF p.35–49; form machine `Equipment Skills Training · Pneumatic`).
  All 31 episodes are on the video library page.
- Voice: Azure AI Speech (`AZURE_SPEECH_KEY`, `AZURE_SPEECH_REGION`, host `<region>.tts.speech.microsoft.com`
  allowed in the environment). Edge TTS does not work in the cloud environment (WebSocket blocked).

## Build an episode with voice (EP01 shown; same for every `epNN`)
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
