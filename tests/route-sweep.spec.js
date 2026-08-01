/* Every route of every product, checked for the failures that are cheap to
   detect and expensive to ship: a page that throws, an asset that 404s, a
   duplicate id, a missing or empty heading, a product frame that paints
   nothing, or horizontal overflow.
 *
 * The other specs sample Parkie — 33 destinations for axe, a handful for
 * structure — because those checks are slow. This one is fast enough to walk
 * all 62 Parkie routes plus the Goalie skeleton and authored CPMS routes, so a defect confined to one
 * unsampled page cannot hide. It was written as an ad-hoc script during review
 * and is a spec now so the next regression does not need finding by hand.
 */
const { test, expect } = require('@playwright/test');

const PARKIE_PAGES = [
  'overview', 'systemsummary', 'principles', 'changelog', 'colors', 'typography',
  'spacing', 'radius', 'elevation', 'iconography', 'button', 'segmented', 'selection',
  'input', 'select', 'badge', 'statuslabel', 'alert', 'alertfeed', 'topbar', 'tabs',
  'breadcrumb', 'card', 'table', 'avatar', 'robotstatus', 'robotcard', 'media', 'modal',
  'alertcenter', 'appshell', 'dashboard', 'brand', 'downloads',
  'ms-getstarted', 'ms-intro', 'ms-changelog', 'ms-colors', 'ms-type', 'ms-icons',
  'ms-shape', 'ms-layout', 'ms-appstructure', 'ms-tabs', 'ms-personal', 'ms-messaging',
  'ms-button', 'ms-checkbox', 'ms-toggle', 'ms-input', 'ms-badge', 'ms-tooltip',
  'ms-card', 'ms-alert', 'ms-dropdown', 'ms-radio', 'ms-toast', 'ms-dialog',
  'ms-breadcrumb', 'ms-listitem', 'ms-searchbox', 'ms-progress',
];

const SKELETON_PAGES = [
  'overview', 'systemsummary', 'principles', 'colors', 'typography', 'spacing',
  'iconography', 'button', 'input', 'status', 'navigation', 'templates', 'brand',
];

const SKELETON_SYSTEMS = ['goalie'];

const CPMS_PAGES = [
  'overview', 'systemsummary', 'principles', 'colors', 'typography', 'layout',
  'shell', 'controls', 'data-display', 'states', 'permissions', 'accessibility',
  'governance',
];

test('every route of every product loads clean', async ({ page }) => {
  test.setTimeout(600_000);

  const runtimeErrors = [];
  const failedRequests = new Set();
  page.on('pageerror', (error) => runtimeErrors.push(`pageerror: ${error.message}`));
  page.on('console', (message) => {
    if (message.type() === 'error') runtimeErrors.push(`console: ${message.text()}`);
  });
  page.on('response', (response) => {
    if (response.status() >= 400) failedRequests.add(`${response.status()} ${response.url()}`);
  });

  const routes = [
    ...PARKIE_PAGES.map((pageId) => ['parkie', pageId]),
    ...SKELETON_SYSTEMS.flatMap((system) => SKELETON_PAGES.map((pageId) => [system, pageId])),
    ...CPMS_PAGES.map((pageId) => ['cpms', pageId]),
  ];

  const defects = [];
  for (const [system, pageId] of routes) {
    await page.goto(`/#/${system}/${pageId}`);
    await page.locator('[data-guide-root] h1').waitFor();

    const state = await page.evaluate(() => {
      const counts = new Map();
      for (const node of document.querySelectorAll('[id]')) {
        counts.set(node.id, (counts.get(node.id) || 0) + 1);
      }
      const heading = document.querySelector('[data-guide-root] h1');
      const frame = document.querySelector('[data-product-root]');
      return {
        duplicateIds: [...counts].filter(([, count]) => count > 1).map(([id]) => id),
        headings: document.querySelectorAll('[data-guide-root] h1').length,
        mains: document.querySelectorAll('main').length,
        emptyHeading: !heading || !heading.textContent.trim(),
        overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
        /* A product registered without a token file paints nothing — the
           intended visible failure, which must never reach a shipped route. */
        frameBackground: frame ? getComputedStyle(frame).backgroundColor : null,
      };
    });

    const issues = [];
    if (state.duplicateIds.length) issues.push(`duplicate ids: ${state.duplicateIds.slice(0, 3).join(', ')}`);
    if (state.headings !== 1) issues.push(`${state.headings} h1 elements`);
    if (state.mains !== 1) issues.push(`${state.mains} main elements`);
    if (state.emptyHeading) issues.push('empty h1');
    if (state.overflow > 1) issues.push(`horizontal overflow ${state.overflow}px`);
    if (state.frameBackground === 'rgba(0, 0, 0, 0)') issues.push('product frame paints nothing');
    if (issues.length) defects.push(`${system}/${pageId}: ${issues.join('; ')}`);
  }

  expect(routes.length, 'the sweep must cover every declared route').toBe(88);
  expect(defects, 'structural defects').toEqual([]);
  expect([...new Set(runtimeErrors)], 'runtime and console errors').toEqual([]);
  expect([...failedRequests], 'requests that returned 4xx or 5xx').toEqual([]);
});
