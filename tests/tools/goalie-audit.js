/* Goalie page audit — NOT yet a gate. Read this header before trusting output.
 *
 *   node tests/server.js &
 *   node tests/tools/goalie-audit.js
 *
 * This script has produced two classes of false positive. One is fixed, one is
 * not. Do not act on its numbers until the second is fixed.
 *
 * FIXED — translucent backgrounds were skipped. The first version accepted a
 * background only above 0.9 alpha and otherwise walked past it to the page
 * background, so the alert history panel's rgba(0,0,0,0.7) was ignored and its
 * white text was judged against white. It reported 1.05:1 on text that is
 * actually fine. bgOf() now composites every layer, which is what the browser
 * does. index.html's colorProbe() has the same over() calculation.
 *
 * NOT FIXED — border scope. Roughly 114 findings remain at 1.27:1 and most are
 * not defects: --goalie-border is a 1.18:1 decorative hairline used for card and
 * section dividers, and WCAG 1.4.11 applies to borders that identify components
 * and states, not to decoration. Fixing all of them would put heavy borders on
 * every card and make the design worse.
 *
 * TO MAKE THIS A GATE:
 *   1. Restrict the border check to state-conveying edges — input borders, focus
 *      rings, selected states, toggle tracks, status badges (.gl-badge carries
 *      --evidence / --queued, so it may qualify).
 *   2. Prove no false positives in reverse: add a normal decorative hairline and
 *      confirm the audit still passes.
 *   3. Only then move it to tests/goalie-audit.spec.js, and mutation-verify it —
 *      break what it claims to protect and confirm it fails.
 *
 * A passing check is not evidence by itself. This file is the proof.
 */
const { chromium } = require('playwright');

const PAGES = ['overview', 'systemsummary', 'principles', 'colors', 'typography',
  'spacing', 'iconography', 'button', 'input', 'status', 'navigation',
  'patrol', 'video', 'templates', 'brand'];

(async () => {
  const browser = await chromium.launch({ channel: 'chrome' });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  const all = [];

  for (const id of PAGES) {
    await page.goto(`http://127.0.0.1:4173/index.html#/goalie/${id}`, { waitUntil: 'load' });
    await page.waitForSelector('[data-guide-root] h1', { timeout: 40000 });
    await page.waitForTimeout(250);

    const r = await page.evaluate(() => {
      const chan = (v) => { const s = v / 255; return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4); };
      const lum = (c) => 0.2126 * chan(c[0]) + 0.7152 * chan(c[1]) + 0.0722 * chan(c[2]);
      const ratio = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
      const rgba = (v) => {
        const m = String(v).match(/[\d.]+/g);
        if (!m) return null;
        const p = m.map(Number);
        return { r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1 };
      };
      const over = (fg, bg) => [
        fg.a * fg.r + (1 - fg.a) * bg[0],
        fg.a * fg.g + (1 - fg.a) * bg[1],
        fg.a * fg.b + (1 - fg.a) * bg[2],
      ];
      /* Composite from the page background downward, so a translucent panel
         contributes instead of being skipped. */
      const bgOf = (el) => {
        const layers = [];
        let n = el;
        while (n && n !== document.documentElement) {
          const c = rgba(getComputedStyle(n).backgroundColor);
          if (c && c.a > 0.001) layers.push(c);
          n = n.parentElement;
        }
        const root = rgba(getComputedStyle(document.documentElement).backgroundColor);
        let acc = root && root.a > 0.5 ? [root.r, root.g, root.b] : [255, 255, 255];
        for (let i = layers.length - 1; i >= 0; i -= 1) acc = over(layers[i], acc);
        return acc;
      };

      const main = document.querySelector('main');
      const textFails = [];
      const borderFails = [];
      const smallTargets = [];

      for (const el of main.querySelectorAll('*')) {
        const cs = getComputedStyle(el);
        if (cs.display === 'none' || cs.visibility === 'hidden' || Number(cs.opacity) < 0.1) continue;
        const box = el.getBoundingClientRect();
        if (!box.width || !box.height) continue;

        const hasOwnText = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim());
        if (hasOwnText) {
          const fgc = rgba(cs.color);
          if (fgc) {
            const bg = bgOf(el);
            const fg = over(fgc, bg);
            const size = parseFloat(cs.fontSize);
            const large = size >= 24 || (size >= 18.66 && Number(cs.fontWeight) >= 700);
            const need = large ? 3 : 4.5;
            const got = ratio(fg, bg);
            /* Disabled controls are exempt from 1.4.3. */
            const disabled = el.closest('[disabled],[aria-disabled="true"],.is-disabled') !== null;
            if (got < need - 0.01 && !disabled) {
              textFails.push({ t: el.textContent.trim().slice(0, 24), got: got.toFixed(2), need, size: Math.round(size),
                cls: (el.className || '').toString().split(' ')[0] });
            }
          }
        }

        for (const side of ['Top', 'Left']) {
          const w = parseFloat(cs[`border${side}Width`]);
          const bc = rgba(cs[`border${side}Color`]);
          if (w >= 1 && bc && bc.a > 0.05) {
            const outside = bgOf(el.parentElement || el);
            const edge = over(bc, outside);
            const got = ratio(edge, outside);
            if (got < 2.99) {
              borderFails.push({ cls: (el.className || '').toString().split(' ')[0] || el.tagName, got: got.toFixed(2) });
            }
          }
        }

        if (el.matches('button, a[href], input, select, [role="button"], [role="tab"], [role="radio"], [role="switch"]')) {
          if (box.height < 24 || box.width < 24) {
            smallTargets.push({ cls: (el.className || '').toString().split(' ')[0], h: Math.round(box.height), w: Math.round(box.width) });
          }
        }
      }

      const levels = [...main.querySelectorAll('h1,h2,h3,h4,h5,h6')].map((h) => Number(h.tagName[1]));
      const skips = [];
      for (let i = 1; i < levels.length; i += 1) if (levels[i] - levels[i - 1] > 1) skips.push(`h${levels[i - 1]}→h${levels[i]}`);

      const counts = new Map();
      for (const n of document.querySelectorAll('[id]')) counts.set(n.id, (counts.get(n.id) || 0) + 1);

      const dedupe = (list, key) => {
        const seen = new Map();
        for (const item of list) { const k = key(item); if (!seen.has(k)) seen.set(k, item); }
        return [...seen.values()];
      };

      return {
        textFails: dedupe(textFails, (f) => `${f.cls}|${f.got}`),
        borderFails: dedupe(borderFails, (f) => `${f.cls}|${f.got}`),
        smallTargets: dedupe(smallTargets, (f) => f.cls),
        skips,
        dupIds: [...counts].filter(([, c]) => c > 1).map(([i]) => i),
        overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      };
    });
    all.push([id, r]);
  }

  const total = (r) => r.textFails.length + r.borderFails.length + r.smallTargets.length + r.skips.length + r.dupIds.length;
  all.sort((a, b) => total(b[1]) - total(a[1]));

  console.log('페이지            텍스트  경계  타깃  제목  중복id  오버플로');
  for (const [id, r] of all) {
    console.log(`  ${id.padEnd(15)} ${String(r.textFails.length).padStart(5)} ${String(r.borderFails.length).padStart(6)} ${String(r.smallTargets.length).padStart(5)} ${String(r.skips.length).padStart(5)} ${String(r.dupIds.length).padStart(6)} ${String(r.overflow).padStart(8)}`);
  }
  console.log('\n=== 고유 결함 (중복 제거) ===');
  for (const [id, r] of all) {
    if (!total(r)) continue;
    console.log(`\n  ${id}`);
    r.textFails.slice(0, 6).forEach((f) => console.log(`    텍스트 ${f.got}:1 / ${f.need}  ${f.size}px  .${f.cls}  "${f.t}"`));
    r.borderFails.slice(0, 6).forEach((f) => console.log(`    경계   ${f.got}:1 / 3     .${f.cls}`));
    r.smallTargets.slice(0, 4).forEach((f) => console.log(`    타깃   ${f.w}x${f.h}px  .${f.cls}`));
    if (r.skips.length) console.log(`    제목 건너뜀 ${r.skips.join(', ')}`);
    if (r.dupIds.length) console.log(`    중복 id ${r.dupIds.join(', ')}`);
  }
  const grand = all.reduce((s, [, r]) => s + total(r), 0);
  console.log(`\n  고유 결함 합계: ${grand}`);
  await browser.close();
})();
