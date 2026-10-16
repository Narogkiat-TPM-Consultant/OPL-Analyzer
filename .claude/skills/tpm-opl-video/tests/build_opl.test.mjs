import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const builder = fileURLToPath(new URL('../scripts/build_opl.mjs', import.meta.url));
function build(t, overrides = {}) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'opl-regression-'));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  // Build-only fixtures: intentionally not a render/runtime validation.
  fs.mkdirSync(path.join(dir, 'assets/fonts'), { recursive: true });
  fs.writeFileSync(path.join(dir, 'assets/fonts/fontfaces.css'), '');
  fs.writeFileSync(path.join(dir, 'assets/gsap.min.js'), '');
  fs.writeFileSync(path.join(dir, 'spec.json'), JSON.stringify({
    opl_type: 'trouble', title: { line1: 'ทดสอบ' }, outro: false,
    scenes: [{ type: 'diagram', heading: 'ทดสอบ' }], ...overrides,
  }));
  const result = spawnSync(process.execPath, [builder, path.join(dir, 'spec.json'), dir], { encoding: 'utf8' });
  assert.ifError(result.error);
  return { ...result, html: fs.existsSync(path.join(dir, 'index.html')) ? fs.readFileSync(path.join(dir, 'index.html'), 'utf8') : null };
}
for (const opl_type of [undefined, 'invalid', 'toString', '__proto__']) {
  test(`invalid OPL type ${opl_type} fails cleanly before output`, t => {
    const r = build(t, { opl_type });
    assert.equal(r.status, 1);
    assert.match(r.stderr, /opl_type must be one of basic \| trouble \| kaizen/);
    assert.doesNotMatch(r.stderr, /TypeError/);
    assert.equal(r.html, null);
  });
}
for (const quotes of [['"', '"'], ["'", "'"], ['"', "'"]]) {
  test(`duplicate SVG IDs rejected: ${quotes.join(' / ')}`, t => {
    const [a, b] = quotes;
    const r = build(t, { scenes: [{ type: 'diagram', svg: { body: `<g id=${a}s2-v-part${a}></g><g id=${b}s2-v-part${b}></g>` } }] });
    assert.equal(r.status, 1);
    assert.match(r.stderr, /duplicate element ids: s2-v-part/);
    assert.equal(r.html, null);
  });
}
test('unique mixed-quote SVG IDs build and generated JS parses', t => {
  const r = build(t, { scenes: [{ type: 'diagram', svg: { body: `<g id='s2-v-a'></g><g id="s2-v-b"></g>` } }] });
  assert.equal(r.status, 0, r.stderr);
  for (const [, js] of r.html.matchAll(/<script>([\s\S]*?)<\/script>/g)) new vm.Script(js);
});
function timeline(t, scene) {
  const r = build(t, { scenes: [{ type: 'whywhy', duration: 10, phenomenon: 'หยุด', whys: ['A', 'B', 'C'], root: 'มาตรฐาน', ...scene }] });
  assert.equal(r.status, 0, r.stderr);
  const maps = [...r.html.matchAll(/const T = (.*?);/g)].map(m => JSON.parse(m[1]));
  return { r, T: maps.find(m => m.whys) };
}
test('default Why timeline remains unchanged', t => {
  const { T } = timeline(t, {});
  assert.deepEqual(T.whys, [1.1, 1.95, 2.8]);
  assert.equal(T.root, 3.85);
});
for (const whys of [['A', 'B', { text: 'C', at: 5.8 }], [{ text: 'A', at: 5.8 }, 'B', 'C']]) {
  test('root follows latest resolved Why override', t => {
    const { r, T } = timeline(t, { whys });
    assert.equal(T.root, 6.85);
    assert.ok(T.root > Math.max(...T.whys) + 0.35);
    assert.match(r.html, /tl.fromTo\("#s2-root".*b \+ 6.85\);/);
    assert.match(r.html, /src="assets\/sfx\/thud.wav" data-start="10.35"/);
  });
}
test('explicit root timing stays authoritative', t => {
  assert.equal(timeline(t, { root_at: 8, whys: ['A', { text: 'B', at: 5.8 }] }).T.root, 8);
});
test('narration cue overrides participate in root scheduling', t => {
  const { T } = timeline(t, { narration: ['AAAA', 'BBBB'], whys: ['A', { text: 'B', cue: 2 }] });
  assert.equal(T.whys[1], Math.round((T.cues[1] + 0.1) * 1000) / 1000);
  assert.equal(T.root, Math.round((Math.max(...T.whys) + 1.05) * 1000) / 1000);
});
