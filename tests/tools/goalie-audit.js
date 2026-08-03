/* Goalie page audit.
 *
 *   node tests/server.js &
 *   node tests/tools/goalie-audit.js
 *
 * This script produced three classes of false positive. All are fixed now, and
 * the fixes are the reason to trust the numbers, so they are written down here
 * rather than left in a commit message nobody will find.
 *
 * FIXED — translucent backgrounds were skipped. The first version accepted a
 * background only above 0.9 alpha and otherwise walked past it to the page
 * background, so the alert history panel's rgba(0,0,0,0.7) was ignored and its
 * white text was judged against white. It reported 1.05:1 on text that is fine.
 * bgOf() composites every layer now, which is what the browser does.
 * index.html's colorProbe() has the same over() calculation.
 *
 * FIXED — color(srgb …) was read as 0..255. color-mix() computes to CSS Color 4
 * syntax, whose channels run 0..1, and scraping digits out of
 * "color(srgb 0.919 0.983 1)" turned the active mission row's pale cyan tint
 * into very nearly black. It reported two contrast failures on text that
 * measures 6.61:1 and 4.97:1. rgba() understands that syntax now.
 *
 * FIXED — border scope. The check measured every border on the page and
 * returned about 290 findings at 1.27:1, nearly all of them --goalie-border:
 * the 1.18:1 hairline that separates cards, sections and table cells. WCAG
 * 1.4.11 covers what identifies a component or a state, not decoration, and
 * darkening every card divider to 3:1 would have made the design worse to
 * satisfy a rule that never applied. The check now looks only at edges that
 * carry a signal, and at the property that actually carries it:
 *
 *   input edges      the border is the only thing showing where the field is
 *   focus rings      drawn with box-shadow, so a border check never saw them
 *   selected/checked aria-selected, aria-checked, .is-selected
 *   toggle tracks    .gl-switch has border:0 and signals through background
 *
 * DELIBERATELY OUT OF SCOPE, with the numbers, so it is excluded rather than
 * hidden:
 *
 *   .gl-badge — its border is 2.40:1. The badge kinds do differ by colour, but
 *   they also differ by text ("Figma 근거 고정" vs "접근성 보정 명시"), so the
 *   border is decoration around a label and the meaning survives without it.
 *
 *   Filled buttons — a contained button's border is set to its own fill, so
 *   measuring the border only restates fill-against-page: cyan enabled is
 *   2.02:1 there. Whether a filled control needs a 3:1 boundary when its label
 *   already carries 4.5:1 is a live reading of 1.4.11 and a decision about the
 *   delivered fills, which the button page already documents. It is not
 *   something this script should settle by asserting one side.
 *
 * A passing check is not evidence by itself. tests/goalie-audit.spec.js is the
 * gate this grew into, and it was mutation-verified before being trusted.
 */
const { chromium } = require('playwright');

const PAGES = ['overview', 'systemsummary', 'principles', 'colors', 'typography',
  'spacing', 'iconography', 'button', 'input', 'status', 'navigation',
  'patrol', 'video', 'templates', 'brand'];

/* Edges that identify a component or a state. Everything else is decoration. */
const STATE_EDGE = [
  'input:not([type="hidden"])', 'select', 'textarea',
  '.gl-select-trigger', '.gl-time-trigger', '.gl-number-stepper',
  '[aria-selected="true"]', '[aria-checked="true"]', '.is-selected',
].join(',');

const FOCUSABLE = 'button:not(:disabled), a[href], input:not([type="hidden"]):not(:disabled), '
  + 'select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])';

const PROBE = { STATE_EDGE, FOCUSABLE };

async function auditPage(page, id) {
  await page.goto(`http://127.0.0.1:4173/index.html#/goalie/${id}`, { waitUntil: 'load' });
  await page.waitForSelector('[data-guide-root] h1', { timeout: 40000 });
  await page.waitForTimeout(250);

  return page.evaluate((sel) => {
    const chan = (v) => { const s = v / 255; return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4); };
    const lum = (c) => 0.2126 * chan(c[0]) + 0.7152 * chan(c[1]) + 0.0722 * chan(c[2]);
    const ratio = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
    /* color-mix() computes to CSS Color 4 syntax — color(srgb 0.92 0.98 1) —
       whose channels are 0..1, not 0..255. Scraping digits out of that read the
       active mission row's pale cyan tint as very nearly black and reported two
       contrast failures on text that is fine. */
    const rgba = (v) => {
      const s = String(v);
      const srgb = s.match(/^color\(srgb\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)(?:\s*\/\s*([\d.]+))?\s*\)/i);
      if (srgb) {
        return {
          r: Number(srgb[1]) * 255,
          g: Number(srgb[2]) * 255,
          b: Number(srgb[3]) * 255,
          a: srgb[4] === undefined ? 1 : Number(srgb[4]),
        };
      }
      const m = s.match(/[\d.]+/g);
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
    const shown = (el) => {
      const cs = getComputedStyle(el);
      if (cs.display === 'none' || cs.visibility === 'hidden' || Number(cs.opacity) < 0.1) return null;
      const box = el.getBoundingClientRect();
      return box.width && box.height ? cs : null;
    };
    const label = (el) => (el.className || '').toString().trim().split(' ')[0] || el.tagName;
    const isDisabled = (el) => el.closest('[disabled],[aria-disabled="true"],.is-disabled') !== null;

    const main = document.querySelector('main');
    const textFails = [];
    const edgeFails = [];
    const focusFails = [];
    const smallTargets = [];
    let decorativeSkipped = 0;
    let focusChecked = 0;

    for (const el of main.querySelectorAll('*')) {
      const cs = shown(el);
      if (!cs) continue;
      const box = el.getBoundingClientRect();

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
          if (got < need - 0.01 && !isDisabled(el)) {
            textFails.push({ t: el.textContent.trim().slice(0, 24), got: got.toFixed(2), need,
              size: Math.round(size), cls: label(el) });
          }
        }
      }

      /* 1.4.11 on edges that identify something, not on card dividers. */
      const isSwitch = el.matches('.gl-switch, [role="switch"]');
      const carriesState = el.matches(sel.STATE_EDGE);
      const off = isDisabled(el);

      if (isSwitch && !off) {
        /* border:0 — the track signals through its own fill. */
        const track = rgba(cs.backgroundColor);
        if (track && track.a > 0.05) {
          const outside = bgOf(el.parentElement || el);
          const got = ratio(over(track, outside), outside);
          if (got < 2.99) edgeFails.push({ cls: label(el), got: got.toFixed(2), what: 'track' });
        }
      } else if (carriesState && !off) {
        for (const side of ['Top', 'Left']) {
          const w = parseFloat(cs[`border${side}Width`]);
          const bc = rgba(cs[`border${side}Color`]);
          if (!(w >= 1 && bc && bc.a > 0.05)) continue;
          const outside = bgOf(el.parentElement || el);
          const got = ratio(over(bc, outside), outside);
          if (got < 2.99) edgeFails.push({ cls: label(el), got: got.toFixed(2), what: `border${side}` });
        }
      } else {
        for (const side of ['Top', 'Left']) {
          const w = parseFloat(cs[`border${side}Width`]);
          const bc = rgba(cs[`border${side}Color`]);
          if (w >= 1 && bc && bc.a > 0.05) decorativeSkipped += 1;
        }
      }

      if (el.matches('button, a[href], input, select, [role="button"], [role="tab"], [role="radio"], [role="switch"]')) {
        if (box.height < 24 || box.width < 24) {
          smallTargets.push({ cls: label(el), h: Math.round(box.height), w: Math.round(box.width) });
        }
      }
    }

    /* The focus ring is a box-shadow, so no border check could ever see it.
       Goalie draws two rings — a white separator, then the focus colour — and
       ships them in both flavours: --goalie-focus-ring sits outside the element,
       --goalie-focus-ring-inset sits inside it. An earlier pass here dropped
       every inset shadow as though it were invisible and reported four controls
       with "no indicator" that draw a perfectly good one, so each ring is judged
       against the surface it actually abuts. The pair also abuts each other,
       which is the whole point of a two-tone ring: on a surface that swallows
       one of them, the other still reads. */
    for (const el of main.querySelectorAll(sel.FOCUSABLE)) {
      if (!shown(el) || isDisabled(el)) continue;
      focusChecked += 1;
      el.focus();
      const cs = getComputedStyle(el);
      const rings = [];
      if (cs.boxShadow && cs.boxShadow !== 'none') {
        for (const m of cs.boxShadow.matchAll(/(rgba?\([^)]*\))([^,]*)/g)) {
          const c = rgba(m[1]);
          if (c && c.a > 0.05) rings.push({ c, inset: /inset/.test(m[2]) });
        }
      }
      if (parseFloat(cs.outlineWidth) >= 1 && cs.outlineStyle !== 'none') {
        const c = rgba(cs.outlineColor);
        if (c && c.a > 0.05) rings.push({ c, inset: false });
      }
      el.blur();

      if (!rings.length) {
        focusFails.push({ cls: label(el), got: '0.00', what: 'no visible indicator' });
        continue;
      }
      const outside = bgOf(el.parentElement || el);
      const inside = bgOf(el);
      const candidates = rings.map((r) => {
        const against = r.inset ? inside : outside;
        return ratio(over(r.c, against), against);
      });
      for (let i = 1; i < rings.length; i += 1) {
        const under = rings[i].inset ? inside : outside;
        candidates.push(ratio(over(rings[i - 1].c, under), over(rings[i].c, under)));
      }
      const best = Math.max(...candidates);
      if (best < 2.99) focusFails.push({ cls: label(el), got: best.toFixed(2), what: 'focus ring' });
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
      edgeFails: dedupe(edgeFails, (f) => `${f.cls}|${f.got}|${f.what}`),
      focusFails: dedupe(focusFails, (f) => `${f.cls}|${f.got}`),
      smallTargets: dedupe(smallTargets, (f) => f.cls),
      skips,
      dupIds: [...counts].filter(([, c]) => c > 1).map(([i]) => i),
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      decorativeSkipped,
      focusChecked,
    };
  }, PROBE);
}

module.exports = { PAGES, PROBE, auditPage };

if (require.main === module) {
  (async () => {
    const browser = await chromium.launch({ channel: 'chrome' });
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
    const all = [];
    for (const id of PAGES) all.push([id, await auditPage(page, id)]);

    const total = (r) => r.textFails.length + r.edgeFails.length + r.focusFails.length
      + r.smallTargets.length + r.skips.length + r.dupIds.length;
    all.sort((a, b) => total(b[1]) - total(a[1]));

    console.log('페이지            텍스트  상태경계  포커스  타깃  제목  중복id  오버플로  (장식제외)');
    for (const [id, r] of all) {
      console.log(`  ${id.padEnd(15)} ${String(r.textFails.length).padStart(5)} ${String(r.edgeFails.length).padStart(8)} `
        + `${String(r.focusFails.length).padStart(6)} ${String(r.smallTargets.length).padStart(5)} `
        + `${String(r.skips.length).padStart(5)} ${String(r.dupIds.length).padStart(6)} `
        + `${String(r.overflow).padStart(8)} ${String(r.decorativeSkipped).padStart(10)}`);
    }
    console.log('\n=== 고유 결함 (중복 제거) ===');
    for (const [id, r] of all) {
      if (!total(r)) continue;
      console.log(`\n  ${id}`);
      r.textFails.slice(0, 8).forEach((f) => console.log(`    텍스트   ${f.got}:1 / ${f.need}  ${f.size}px  .${f.cls}  "${f.t}"`));
      r.edgeFails.slice(0, 8).forEach((f) => console.log(`    상태경계 ${f.got}:1 / 3     .${f.cls}  (${f.what})`));
      r.focusFails.slice(0, 8).forEach((f) => console.log(`    포커스   ${f.got}:1 / 3     .${f.cls}  (${f.what})`));
      r.smallTargets.slice(0, 4).forEach((f) => console.log(`    타깃     ${f.w}x${f.h}px  .${f.cls}`));
      if (r.skips.length) console.log(`    제목 건너뜀 ${r.skips.join(', ')}`);
      if (r.dupIds.length) console.log(`    중복 id ${r.dupIds.join(', ')}`);
    }
    const grand = all.reduce((s, [, r]) => s + total(r), 0);
    const skipped = all.reduce((s, [, r]) => s + r.decorativeSkipped, 0);
    console.log(`\n  고유 결함 합계: ${grand}`);
    console.log(`  장식 경계로 판단해 검사하지 않은 변: ${skipped} (--goalie-border 계열 카드·섹션·표 구분선)`);
    await browser.close();
  })();
}
