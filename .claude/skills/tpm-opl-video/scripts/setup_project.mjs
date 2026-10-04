#!/usr/bin/env node
// Prepare a HyperFrames project folder for an OPL video:
//   - installs hyperframes CLI, GSAP and the Thai/Japanese font packages
//   - copies GSAP + only the woff2 files we need into assets/, writes assets/fonts/fontfaces.css
//   - generates the SFX library into assets/sfx/ with FFmpeg (no external audio, no licensing issues)
//   - disables HyperFrames telemetry
// Usage: node setup_project.mjs <project-dir>
// Idempotent: re-running only fills in what is missing.

import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const proj = path.resolve(process.argv[2] || ".");
const isWin = process.platform === "win32";
const PKGS = [
  "hyperframes@^0.8.121",
  "gsap@^3.12.0",
  "@fontsource/noto-sans-thai@^5.3.0",
  "@fontsource/noto-sans-jp@^5.3.0",
];
const THAI_WEIGHTS = [400, 600, 800];
const JP_WEIGHTS = [700];

function run(cmd, args, opts = {}) {
  const r = spawnSync(cmd, args, { cwd: proj, stdio: opts.quiet ? "pipe" : "inherit", shell: opts.shell ?? false, encoding: "utf8" });
  if (r.error) throw new Error(`${cmd} failed: ${r.error.message}`);
  if (r.status !== 0 && !opts.allowFail) throw new Error(`${cmd} ${args.join(" ")} exited ${r.status}\n${r.stderr || ""}`);
  return r;
}

function checkTools() {
  const node = Number(process.versions.node.split(".")[0]);
  if (node < 22) throw new Error(`Node.js ${process.versions.node} found — HyperFrames needs Node 22+`);
  const ff = spawnSync("ffmpeg", ["-version"], { encoding: "utf8" });
  if (ff.error || ff.status !== 0) throw new Error("FFmpeg not found on PATH — install it (winget install ffmpeg / brew install ffmpeg / apt install ffmpeg)");
}

function installPackages() {
  fs.mkdirSync(proj, { recursive: true });
  const pj = path.join(proj, "package.json");
  if (!fs.existsSync(pj)) fs.writeFileSync(pj, JSON.stringify({ name: "opl-video", private: true, type: "module" }, null, 2));
  const missing = PKGS.filter((p) => !fs.existsSync(path.join(proj, "node_modules", p.slice(0, p.lastIndexOf("@")))));
  if (missing.length) {
    console.log(`• npm install ${missing.join(" ")}`);
    run("npm", ["install", "--no-fund", "--no-audit", ...missing], { shell: isWin });
  }
}

// Copy the woff2 files a fontsource weight CSS references and return its @font-face rules
// rewritten to point at assets/fonts/ (woff fallbacks dropped: Chrome renders woff2).
function fontFaces(pkg, weight, outDir) {
  const pkgDir = path.join(proj, "node_modules", pkg);
  const css = fs.readFileSync(path.join(pkgDir, `${weight}.css`), "utf8");
  return css.replace(/src:\s*url\(\.\/files\/([^)]+\.woff2)\)\s*format\('woff2'\)(?:,\s*url\([^)]+\)\s*format\('woff'\))?;/g, (_, file) => {
    const dst = path.join(outDir, file);
    if (!fs.existsSync(dst)) fs.copyFileSync(path.join(pkgDir, "files", file), dst);
    return `src: url(assets/fonts/${file}) format('woff2');`;
  });
}

function copyAssets() {
  const assets = path.join(proj, "assets");
  const fonts = path.join(assets, "fonts");
  fs.mkdirSync(fonts, { recursive: true });
  fs.copyFileSync(path.join(proj, "node_modules", "gsap", "dist", "gsap.min.js"), path.join(assets, "gsap.min.js"));
  let css = "";
  for (const w of THAI_WEIGHTS) css += fontFaces("@fontsource/noto-sans-thai", w, fonts);
  for (const w of JP_WEIGHTS) css += fontFaces("@fontsource/noto-sans-jp", w, fonts);
  fs.writeFileSync(path.join(fonts, "fontfaces.css"), css);
  console.log(`• fonts ready (${fs.readdirSync(fonts).length - 1} woff2 files)`);
}

// name → [ffmpeg lavfi source, audio filter]. Quotes inside the strings are for FFmpeg's
// filter parser (commas inside expressions), not for a shell — we never go through a shell here.
const SFX = {
  whoosh: ["anoisesrc=d=0.45:c=pink:a=0.6", "bandpass=f=1200:w=900,afade=t=in:d=0.2,afade=t=out:st=0.2:d=0.25,volume=0.8"],
  pop: ["sine=f=980:d=0.12", "afade=t=out:st=0.01:d=0.11,volume=0.6"],
  tick: ["sine=f=2000:d=0.05", "afade=t=out:st=0.005:d=0.045,volume=0.5"],
  thud: ["aevalsrc='sin(2*PI*(140-60*t)*t)*exp(-14*t)':d=0.35", "volume=0.9"],
  ok: ["aevalsrc='0.35*(sin(2*PI*880*t)*lt(t,0.14)+sin(2*PI*1320*t)*gte(t,0.12))*exp(-5*t)':d=0.5", "anull"],
  ng: ["aevalsrc='0.3*sgn(sin(2*PI*170*t))*exp(-4*t)':d=0.4", "lowpass=f=1800"],
  alarm: ["aevalsrc='0.28*sin(2*PI*880*t)*lt(mod(t,0.3),0.15)+0.28*sin(2*PI*660*t)*gte(mod(t,0.3),0.15)':d=0.6", "afade=t=out:st=0.45:d=0.15"],
  squeal: ["aevalsrc='0.25*sin(2*PI*2300*t+6*sin(2*PI*9*t))':d=1.0", "afade=t=in:d=0.08,afade=t=out:st=0.6:d=0.4"],
};

function makeSfx() {
  const dir = path.join(proj, "assets", "sfx");
  fs.mkdirSync(dir, { recursive: true });
  for (const [name, [src, af]] of Object.entries(SFX)) {
    const out = path.join(dir, `${name}.wav`);
    if (fs.existsSync(out)) continue;
    run("ffmpeg", ["-hide_banner", "-loglevel", "error", "-y", "-f", "lavfi", "-i", src, "-af", af, "-ar", "44100", out]);
  }
  console.log(`• sfx ready: ${Object.keys(SFX).join(", ")}`);
}

try {
  checkTools();
  installPackages();
  copyAssets();
  makeSfx();
  run("npx", ["hyperframes", "telemetry", "disable"], { shell: isWin, quiet: true, allowFail: true });
  console.log(`✓ project ready: ${proj}\n  next: node build_opl.mjs <spec.json> "${proj}"`);
} catch (e) {
  console.error(`✗ setup failed: ${e.message}`);
  process.exit(1);
}
