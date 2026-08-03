/* Records the observable behaviour of every route so a refactor can be proven
   harmless rather than asserted to be.
 *
 *   node tests/tools/route-baseline.js before   # before the change
 *   node tests/tools/route-baseline.js after    # after it
 *   node tests/tools/route-baseline.js --diff before after
 *
 * Requires the dev server: `node tests/server.js`.
 *
 * This is not a spec. A spec states what must be true; this records what *is*
 * true so an unintended change shows up as a diff. It is how the product
 * registry refactor was shown to leave all 75 pre-existing routes untouched. */
const { chromium } = require('playwright');
const fs = require('fs');

const path = require('node:path');

/* Not under test-results/: Playwright clears that directory at the start of
   every run, so a `before` snapshot recorded there vanishes the moment you run
   the suite — which is exactly when you need it to survive. */
const OUT = path.join(process.cwd(), '.route-baseline');
const label = process.argv[2] || 'before';
const BASE = process.env.BASE || 'http://127.0.0.1:4173/index.html';

if (label === '--diff') {
  const [left, right] = process.argv.slice(3);
  const read = (name) => JSON.parse(fs.readFileSync(path.join(OUT, `baseline-${name}.json`), 'utf8'));
  const a = read(left);
  const b = read(right);
  const changed = {};
  for (const route of Object.keys(a)) {
    for (const field of Object.keys(a[route])) {
      if (JSON.stringify(a[route][field]) !== JSON.stringify(b[route]?.[field])) {
        (changed[field] ||= []).push(route);
      }
    }
  }
  const fields = Object.entries(changed);
  console.log(`${Object.keys(a).length} routes compared`);
  if (!fields.length) console.log('  no differences');
  for (const [field, routes] of fields) {
    console.log(`  ${field}: ${routes.length} routes`);
    for (const route of routes.slice(0, 3)) {
      console.log(`    ${route}\n      ${JSON.stringify(a[route][field])}\n   -> ${JSON.stringify(b[route][field])}`);
    }
  }
  process.exit(fields.length ? 1 : 0);
}

const PARKIE = ['overview', 'systemsummary', 'principles', 'changelog', 'colors', 'typography', 'spacing', 'radius', 'elevation', 'iconography', 'button', 'segmented', 'selection', 'input', 'select', 'badge', 'statuslabel', 'alert', 'alertfeed', 'topbar', 'tabs', 'breadcrumb', 'card', 'table', 'avatar', 'robotstatus', 'robotcard', 'media', 'modal', 'alertcenter', 'appshell', 'dashboard', 'brand', 'downloads', 'ms-getstarted', 'ms-intro', 'ms-changelog', 'ms-colors', 'ms-type', 'ms-icons', 'ms-shape', 'ms-layout', 'ms-appstructure', 'ms-tabs', 'ms-personal', 'ms-messaging', 'ms-button', 'ms-checkbox', 'ms-toggle', 'ms-input', 'ms-badge', 'ms-tooltip', 'ms-card', 'ms-alert', 'ms-dropdown', 'ms-radio', 'ms-toast', 'ms-dialog', 'ms-breadcrumb', 'ms-listitem', 'ms-searchbox', 'ms-progress'];
/* patrol and video were missing while the header above claimed every route.
   They are two of the fifteen Goalie pages, both shipped with impl: true, and
   a refactor could have moved either without this noticing. tests/tools/
   goalie-audit.js lists all fifteen; these two lists must not drift apart. */
const GOALIE = ['overview', 'systemsummary', 'principles', 'colors', 'typography', 'spacing', 'iconography', 'button', 'input', 'status', 'navigation', 'patrol', 'video', 'templates', 'brand'];
const CPMS = ['overview', 'systemsummary', 'principles', 'colors', 'typography', 'layout', 'shell', 'controls', 'data-display', 'states', 'permissions', 'accessibility', 'governance'];

(async () => {
  const browser = await chromium.launch({ channel: 'chrome' });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const record = {};

  const routes = [
    ...PARKIE.map((p) => ['parkie', p]),
    ...GOALIE.map((p) => ['goalie', p]),
    ...CPMS.map((p) => ['cpms', p]),
  ];

  for (const [system, pageId] of routes) {
    const key = `${system}/${pageId}`;
    await page.goto(`${BASE}#/${system}/${pageId}`, { waitUntil: 'load' });
    await page.waitForSelector('[data-guide-root] h1', { timeout: 30000 });
    await page.waitForTimeout(180);

    record[key] = await page.evaluate(() => {
      const q = (s) => document.querySelector(s);
      const html = document.documentElement;
      const ws = q('.guide-workspace');
      const tabs = [...document.querySelectorAll('[data-system-nav] [data-system-id]')];
      return {
        title: document.title,
        htmlTheme: html.dataset.theme,
        htmlSystem: html.dataset.system,
        htmlActiveSystem: html.dataset.activeSystem,
        htmlColorMode: html.dataset.colorMode,
        bg: html.style.backgroundColor,
        rootTheme: q('[data-guide-root]')?.dataset.theme,
        rootActive: q('[data-guide-root]')?.dataset.activeSystem,
        h1: q('[data-guide-root] h1')?.textContent?.trim(),
        eyebrow: q('.guide-page-header__eyebrow')?.textContent?.trim(),
        lead: q('.guide-page-header__lead, .pk-page-header__lead')?.textContent?.trim()?.slice(0, 90),
        sidebarSource: q('.guide-nav-source__title')?.textContent?.trim(),
        navIds: document.querySelectorAll('[data-nav-id]').length,
        soon: document.querySelectorAll('.guide-nav-item__soon').length,
        chrome: ws ? Math.round(ws.getBoundingClientRect().top) : null,
        tabs: tabs.map((t) => `${t.dataset.systemId}:${t.getAttribute('aria-current')}:${t.textContent.trim()}`).join('|'),
        mainCount: document.querySelectorAll('main').length,
        h1Count: document.querySelectorAll('[data-guide-root] h1').length,
      };
    });
  }

  fs.mkdirSync(OUT, { recursive: true });
  fs.writeFileSync(path.join(OUT, `baseline-${label}.json`), JSON.stringify(record, null, 2));
  console.log(`${label}: ${Object.keys(record).length} routes recorded`);
  await browser.close();
})();
