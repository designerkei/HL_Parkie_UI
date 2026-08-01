const { test, expect } = require('@playwright/test');
const AxeBuilder = require('@axe-core/playwright').default;

const GOALIE_PAGES = [
  'overview',
  'systemsummary',
  'principles',
  'colors',
  'typography',
  'spacing',
  'iconography',
  'button',
  'input',
  'status',
  'navigation',
  'templates',
  'brand',
];

const THEMES = {
  parkie: 'dark',
  goalie: 'light',
};

const canonicalUrl = (system, pageId) => `/#/${system}/${pageId}`;

const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

function guideRoot(page) {
  return page.locator('[data-guide-root]');
}

function systemControl(page, system) {
  return page.locator(`[data-system-nav] [data-system-id="${system}"]`);
}

function sidebar(page) {
  return page.locator('[data-guide-sidebar]');
}

function navigationSearch(page) {
  return page.locator('[data-navigation-search]');
}

async function expectRuntimeReady(page) {
  await expect(guideRoot(page)).toBeVisible();
  await expect(page.locator('h1')).toBeVisible();
}

async function expectSystemRoute(page, system, pageId) {
  const theme = THEMES[system];
  const root = guideRoot(page);

  await expectRuntimeReady(page);
  await expect(root).toHaveAttribute('data-active-system', system);
  await expect(root).toHaveAttribute('data-theme', theme);
  await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
  await expect(page).toHaveURL(new RegExp(`${escapeRegExp(canonicalUrl(system, pageId))}$`));

  await expect(page.locator('[data-product-root]')).toHaveCount(1);
  await expect(page.locator(`[data-product-root][data-system="${system}"]`)).toBeVisible();
  await expect(page.locator(`[data-product-root]:not([data-system="${system}"])`)).toHaveCount(0);

  await expect(page.locator('[data-system-nav]')).toBeVisible();
  await expect(page.locator('[data-system-nav] [data-system-id]')).toHaveCount(2);
  await expect(systemControl(page, system)).toHaveCount(1);
  await expect(systemControl(page, system)).toHaveAttribute('aria-current', 'page');

  await expect(sidebar(page)).toBeVisible();
  const activeItem = sidebar(page).locator(`[data-nav-id="${pageId}"]`);
  await expect(activeItem).toHaveCount(1);
  await expect(activeItem).toHaveAttribute('aria-current', 'page');

  const colorScheme = await root.evaluate((node) => getComputedStyle(node).colorScheme);
  expect(colorScheme.split(/\s+/), `${system} must expose a ${theme} CSS color-scheme`).toContain(theme);
}

async function openSystem(page, system) {
  const control = systemControl(page, system);
  await expect(control).toHaveCount(1);
  await control.click();
  await expect(guideRoot(page)).toHaveAttribute('data-active-system', system);
}

async function expectTokenIsolation(page, system) {
  const foreignSystem = system === 'parkie' ? 'goalie' : 'parkie';
  const productRoot = page.locator(`[data-product-root][data-system="${system}"]`);
  const contract = await productRoot.evaluate((node, names) => {
    const computed = getComputedStyle(node);
    const probe = document.createElement('span');
    probe.style.position = 'absolute';
    probe.style.visibility = 'hidden';
    probe.style.backgroundColor = `var(--${names.system}-bg)`;
    probe.style.color = `var(--${names.system}-text)`;
    node.appendChild(probe);
    const probeStyle = getComputedStyle(probe);
    const ownBackgroundResolved = probeStyle.backgroundColor;
    const ownTextResolved = probeStyle.color;

    probe.style.backgroundColor = `var(--${names.foreignSystem}-bg)`;
    probe.style.color = `var(--${names.foreignSystem}-text)`;
    const foreignBackgroundResolved = probeStyle.backgroundColor;
    const foreignTextResolved = probeStyle.color;
    probe.remove();

    return {
      ownBackground: computed.getPropertyValue(`--${names.system}-bg`).trim(),
      ownText: computed.getPropertyValue(`--${names.system}-text`).trim(),
      actualBackground: computed.backgroundColor,
      actualText: computed.color,
      ownBackgroundResolved,
      ownTextResolved,
      foreignBackgroundResolved,
      foreignTextResolved,
      foreignInlineConsumers: [...node.querySelectorAll('[style]')]
        .filter((child) => child.getAttribute('style').includes(`--${names.foreignSystem}-`))
        .map((child) => child.outerHTML.slice(0, 240)),
    };
  }, { system, foreignSystem });

  expect(contract.ownBackground, `${system} must define its own background token`).not.toBe('');
  expect(contract.ownText, `${system} must define its own text token`).not.toBe('');
  expect(contract.actualBackground, `${system} root must paint its own canvas token`)
    .toBe(contract.ownBackgroundResolved);
  expect(contract.actualText, `${system} root must paint its own text token`)
    .toBe(contract.ownTextResolved);

  if (
    contract.foreignBackgroundResolved
    && contract.foreignBackgroundResolved !== 'rgba(0, 0, 0, 0)'
    && contract.foreignBackgroundResolved !== contract.ownBackgroundResolved
  ) {
    expect(contract.actualBackground, `${system} must not paint the ${foreignSystem} canvas`)
      .not.toBe(contract.foreignBackgroundResolved);
  }
  if (contract.foreignTextResolved && contract.foreignTextResolved !== contract.ownTextResolved) {
    expect(contract.actualText, `${system} must not paint the ${foreignSystem} text color`)
      .not.toBe(contract.foreignTextResolved);
  }
  expect(contract.foreignInlineConsumers, `${system} inline styles must not consume ${foreignSystem} tokens`).toEqual([]);
}

test.beforeEach(async ({ page }) => {
  const runtimeErrors = [];
  page.on('pageerror', (error) => runtimeErrors.push(`pageerror: ${error.message}`));
  page.on('console', (message) => {
    if (message.type() === 'error') runtimeErrors.push(`console: ${message.text()}`);
  });
  page.__multiSystemRuntimeErrors = runtimeErrors;
});

test.afterEach(async ({ page }) => {
  expect(
    page.__multiSystemRuntimeErrors,
    'the multi-system guide must not emit runtime or console errors'
  ).toEqual([]);
});

test('the theme bootstrap is a deterministic first-paint contract', async ({ request }) => {
  const response = await request.get('/');
  expect(response.status()).toBe(200);
  const source = await response.text();

  const bootstrapIndex = source.search(/<script\b[^>]*data-guide-theme-bootstrap\b[^>]*>/i);
  const stylesheetIndexes = [
    source.search(/<link\b[^>]*rel=["']stylesheet["'][^>]*>/i),
    source.search(/<style\b[^>]*>/i),
  ].filter((index) => index >= 0);

  expect(bootstrapIndex, 'a marked synchronous theme bootstrap must exist').toBeGreaterThanOrEqual(0);
  expect(stylesheetIndexes.length, 'the guide must load at least one stylesheet').toBeGreaterThan(0);
  expect(
    bootstrapIndex,
    'the theme bootstrap must execute before the first stylesheet can paint'
  ).toBeLessThan(Math.min(...stylesheetIndexes));

  const bootstrapEnd = source.indexOf('</script>', bootstrapIndex);
  const bootstrapSource = source.slice(bootstrapIndex, bootstrapEnd);
  expect(bootstrapSource).toMatch(/location\.hash/);
  expect(bootstrapSource).toMatch(/goalie/);
  expect(bootstrapSource).toMatch(/light/);
  expect(source).not.toMatch(/<html\b[^>]*data-theme=["']dark["']/i);
  expect(source).toMatch(/data-guide-root/);
});

test('Parkie remains a canonical peer under the guide hierarchy', async ({ page }) => {
  await page.goto(canonicalUrl('parkie', 'overview'));
  await expectSystemRoute(page, 'parkie', 'overview');
  await expect(guideRoot(page).getByText('UX/UI Design Guide System', { exact: true })).toBeVisible();
  await expect(systemControl(page, 'parkie')).toHaveAttribute('href', /#\/parkie\/overview$/);
  await expect(systemControl(page, 'goalie')).toHaveAttribute('href', /#\/goalie\/overview$/);
});

test('every declared Goalie page supports a direct canonical load and refresh', async ({ page }) => {
  test.setTimeout(120_000);

  for (const pageId of GOALIE_PAGES) {
    await page.goto('about:blank');
    await page.goto(canonicalUrl('goalie', pageId));
    await expectSystemRoute(page, 'goalie', pageId);
    await expect(page.locator('h1')).not.toHaveText('');

    await page.reload();
    await expectSystemRoute(page, 'goalie', pageId);
  }
});

test('legacy Parkie hashes canonicalize without adding a second history entry', async ({ page }) => {
  await page.goto(canonicalUrl('parkie', 'overview'));
  await expectSystemRoute(page, 'parkie', 'overview');
  const historyBeforeLegacyNavigation = await page.evaluate(() => history.length);

  await page.evaluate(() => {
    window.location.hash = '#colors';
  });
  await expectSystemRoute(page, 'parkie', 'colors');

  const historyAfterCanonicalization = await page.evaluate(() => history.length);
  expect(
    historyAfterCanonicalization - historyBeforeLegacyNavigation,
    'legacy navigation should add one entry and replace it with the canonical URL'
  ).toBe(1);

  await page.goBack();
  await expectSystemRoute(page, 'parkie', 'overview');
});

test('system and page history restore route, theme, navigation and active product', async ({ page }) => {
  await page.goto(canonicalUrl('parkie', 'colors'));
  await expectSystemRoute(page, 'parkie', 'colors');

  await openSystem(page, 'goalie');
  await expectSystemRoute(page, 'goalie', 'overview');

  await sidebar(page).locator('[data-nav-id="button"]').click();
  await expectSystemRoute(page, 'goalie', 'button');

  await page.goBack();
  await expectSystemRoute(page, 'goalie', 'overview');
  await page.goBack();
  await expectSystemRoute(page, 'parkie', 'colors');
  await page.goForward();
  await expectSystemRoute(page, 'goalie', 'overview');
  await page.goForward();
  await expectSystemRoute(page, 'goalie', 'button');
});

test('language is guide-global and keeps html language and document title synchronized', async ({ page }) => {
  await page.goto(canonicalUrl('goalie', 'colors'));
  await expectSystemRoute(page, 'goalie', 'colors');

  const en = guideRoot(page).getByRole('button', { name: 'EN', exact: true });
  const ko = guideRoot(page).getByRole('button', { name: 'KO', exact: true });
  await expect(en).toHaveCount(1);
  await expect(ko).toHaveCount(1);

  await en.click();
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect(page.locator('h1')).toHaveText('Colors');
  await expect(page).toHaveTitle(/Goalie UI.*Colors|Colors.*Goalie UI/i);

  await openSystem(page, 'parkie');
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect(page).toHaveTitle(/Parkie UI/i);

  await page.goBack();
  await expectSystemRoute(page, 'goalie', 'colors');
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect(page.locator('h1')).toHaveText('Colors');

  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect(page.locator('h1')).toHaveText('Colors');

  const englishTitle = await page.title();
  await ko.click();
  await expect(page.locator('html')).toHaveAttribute('lang', 'ko');
  await expect(page).not.toHaveTitle(englishTitle);
});

test('search is isolated to the active product and indexes both product manifests', async ({ page }) => {
  await page.goto(canonicalUrl('goalie', 'overview'));
  await expectSystemRoute(page, 'goalie', 'overview');
  await expect(navigationSearch(page)).toHaveCount(1);

  await navigationSearch(page).fill('navigation');
  await expect(sidebar(page).locator('[data-nav-id="navigation"]')).toBeVisible();
  await expect(sidebar(page).locator('[data-nav-id="robotcard"]')).toHaveCount(0);

  await navigationSearch(page).fill('robotcard');
  await expect(sidebar(page).locator('[data-nav-id="robotcard"]')).toHaveCount(0);

  await openSystem(page, 'parkie');
  await navigationSearch(page).fill('robotcard');
  await expect(sidebar(page).locator('[data-nav-id="robotcard"]')).toBeVisible();
  await expect(sidebar(page).locator('[data-nav-id="navigation"]')).toHaveCount(0);

  await navigationSearch(page).fill('not-a-page-in-either-system');
  await expect(sidebar(page).getByRole('status')).toHaveCount(1);
  await navigationSearch(page).fill('');
  await expect(sidebar(page).getByRole('status')).toHaveCount(0);
});

test('fixed themes and token namespaces remain isolated through repeated switching', async ({ page }) => {
  await page.goto(canonicalUrl('parkie', 'overview'));
  await expectSystemRoute(page, 'parkie', 'overview');
  await expectTokenIsolation(page, 'parkie');

  for (let iteration = 0; iteration < 10; iteration += 1) {
    const system = iteration % 2 === 0 ? 'goalie' : 'parkie';
    await openSystem(page, system);
    await expectSystemRoute(page, system, 'overview');
    await expectTokenIsolation(page, system);
  }
});

test('a cold Goalie deep link never exposes a dark first-paint frame', async ({ page }) => {
  await page.addInitScript(() => {
    window.__guideThemeFrames = [];

    const capture = () => {
      const html = document.documentElement;
      const body = document.body;
      const root = document.querySelector('[data-guide-root]');
      window.__guideThemeFrames.push({
        htmlTheme: html ? html.dataset.theme || '' : '',
        htmlSystem: html ? html.dataset.activeSystem || html.dataset.system || '' : '',
        rootTheme: root ? root.dataset.theme || '' : '',
        rootSystem: root ? root.dataset.activeSystem || '' : '',
        bodyExists: Boolean(body),
        bodyBackground: body ? getComputedStyle(body).backgroundColor : '',
      });
    };

    const observer = new MutationObserver(capture);
    observer.observe(document, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: ['data-theme', 'data-system', 'data-active-system', 'class', 'style'],
    });

    let frameCount = 0;
    const onFrame = () => {
      capture();
      frameCount += 1;
      if (frameCount < 40) requestAnimationFrame(onFrame);
    };
    requestAnimationFrame(onFrame);
  });

  await page.goto(canonicalUrl('goalie', 'overview'), { waitUntil: 'domcontentloaded' });
  await expectSystemRoute(page, 'goalie', 'overview');
  await page.evaluate(() => new Promise((resolve) => {
    requestAnimationFrame(() => requestAnimationFrame(resolve));
  }));

  const frames = await page.evaluate(() => window.__guideThemeFrames || []);
  const paintedFrames = frames.filter((frame) => frame.bodyExists);
  expect(paintedFrames.length, 'the first-paint trace must capture body frames').toBeGreaterThan(0);
  expect(
    paintedFrames.filter((frame) => frame.htmlTheme === 'dark' || frame.rootTheme === 'dark'),
    'Goalie must never publish a dark theme during cold startup'
  ).toEqual([]);
  expect(
    paintedFrames.filter((frame) => ['rgb(15, 15, 17)', 'rgb(19, 19, 21)'].includes(frame.bodyBackground)),
    'Goalie must never paint a Parkie dark canvas during cold startup'
  ).toEqual([]);
  expect(paintedFrames[0].htmlTheme, 'the first body frame must already be light').toBe('light');
});

test('the guide remains bounded and operable at 390px and 320px', async ({ page }) => {
  test.setTimeout(240_000);
  const cases = [
    { width: 390, height: 844, system: 'parkie', pageId: 'overview' },
    { width: 390, height: 844, system: 'goalie', pageId: 'templates' },
    { width: 320, height: 760, system: 'parkie', pageId: 'colors' },
    ...GOALIE_PAGES.map((pageId) => ({
      width: 320,
      height: 760,
      system: 'goalie',
      pageId,
    })),
  ];

  for (const current of cases) {
    await page.setViewportSize({ width: current.width, height: current.height });
    await page.goto(canonicalUrl(current.system, current.pageId));
    await expectSystemRoute(page, current.system, current.pageId);
    await expect(navigationSearch(page)).toBeVisible();

    const layout = await page.evaluate(() => {
      const product = document.querySelector('[data-product-root]');
      const criticalNodes = [
        ...document.querySelectorAll('[data-system-nav] [data-system-id]'),
        document.querySelector('[data-navigation-search]'),
        document.querySelector('[data-guide-sidebar]'),
        document.querySelector('h1'),
      ].filter(Boolean);

      return {
        documentOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
        productOverflow: product ? product.scrollWidth - product.clientWidth : 0,
        clippedCriticalNodes: criticalNodes.flatMap((node) => {
          const rect = node.getBoundingClientRect();
          const style = getComputedStyle(node);
          if (style.display === 'none' || style.visibility === 'hidden') return [];
          if (rect.right <= innerWidth + 1 && rect.left >= -1) return [];
          return [{
            node: node.outerHTML.slice(0, 180),
            left: Math.round(rect.left),
            right: Math.round(rect.right),
            viewport: innerWidth,
          }];
        }),
      };
    });

    expect(layout.documentOverflow, `${current.system}/${current.pageId} document overflow`).toBeLessThanOrEqual(1);
    expect(layout.productOverflow, `${current.system}/${current.pageId} product overflow`).toBeLessThanOrEqual(1);
    expect(layout.clippedCriticalNodes, `${current.system}/${current.pageId} clips critical controls`).toEqual([]);
  }
});

test('representative Parkie and every Goalie route have complete accessible structure', async ({ page }) => {
  test.setTimeout(300_000);
  const routes = [
    ['parkie', 'overview'],
    ['parkie', 'colors'],
    ['parkie', 'button'],
    ...GOALIE_PAGES.map((pageId) => ['goalie', pageId]),
  ];

  for (const [system, pageId] of routes) {
    await page.goto(canonicalUrl(system, pageId));
    await expectSystemRoute(page, system, pageId);
    await expect(page.locator('main')).toHaveCount(1);
    await expect(page.locator('h1')).toHaveCount(1);

    const duplicateIds = await page.evaluate(() => {
      const counts = [...document.querySelectorAll('[id]')].reduce((result, node) => {
        result.set(node.id, (result.get(node.id) || 0) + 1);
        return result;
      }, new Map());
      return [...counts].filter(([, count]) => count > 1);
    });
    expect(duplicateIds, `${system}/${pageId} must not render duplicate IDs`).toEqual([]);

    const results = await new AxeBuilder({ page })
      .include('[data-guide-root]')
      .analyze();
    expect(results.violations, `${system}/${pageId} axe violations`).toEqual([]);
  }
});

/* The chrome contract introduced when the product switcher moved into the top
   bar. Height is asserted at several widths because the previous flex-wrap
   layout was correct at one width and broken at the next: 390px produced 151px
   while 320px produced 112px, from the same rules. */
test('the global chrome is one band and holds its height across widths', async ({ page }) => {
  const WIDE = 64;
  const NARROW_MAX = 100;

  for (const system of ['parkie', 'goalie']) {
    for (const width of [1440, 1100, 901, 700, 640, 480, 390, 360, 320]) {
      await page.setViewportSize({ width, height: 820 });
      await page.goto(canonicalUrl(system, 'overview'));
      await expectSystemRoute(page, system, 'overview');

      const chrome = await page.evaluate(() => {
        const bar = document.querySelector('.guide-topbar');
        const nav = document.querySelector('[data-system-nav]');
        const workspace = document.querySelector('.guide-workspace');
        const active = document.querySelector('.guide-system-link.is-active');
        const style = getComputedStyle(active);
        const underline = getComputedStyle(active, '::after');
        const tabs = [...document.querySelectorAll('[data-system-nav] [data-system-id]')];
        return {
          // Everything above the workspace, however the bar nests internally.
          height: Math.round(workspace.getBoundingClientRect().top),
          navInsideTopbar: bar.contains(nav),
          background: style.backgroundColor,
          borderWidth: style.borderTopWidth,
          underlineHeight: underline.height,
          smallestTab: Math.min(...tabs.map((tab) => Math.round(tab.getBoundingClientRect().height))),
          tabMinHeight: parseFloat(style.minHeight) || 0,
          tabCount: tabs.length,
        };
      });

      const label = `${system}@${width}px`;

      /* One band: the tabs are inside the top bar, not a second stacked nav. */
      expect(chrome.navInsideTopbar, `${label} product tabs must live in the top bar`).toBe(true);
      expect(chrome.tabCount, `${label} both products must be reachable`).toBe(2);

      if (width >= 901) {
        expect(chrome.height, `${label} wide chrome height`).toBe(WIDE);
      } else {
        expect(chrome.height, `${label} narrow chrome must stay compact`)
          .toBeLessThanOrEqual(NARROW_MAX);
      }

      /* Active state is an underline alone. Stacking background + border + colour
         reads as a pressed button rather than a location. */
      expect(chrome.background, `${label} active tab must not be filled`)
        .toBe('rgba(0, 0, 0, 0)');
      expect(chrome.borderWidth, `${label} active tab must not be outlined`).toBe('0px');
      expect(chrome.underlineHeight, `${label} active tab needs its underline`).toBe('2px');

      /* WCAG 2.2 target size. The tab collapsed to a 16px text box once it
         wrapped onto a line of its own under the old flex layout. */
      expect(chrome.smallestTab, `${label} tab target size`).toBeGreaterThanOrEqual(24);

      /* The grid layout currently sizes the tab row from its taller sibling, so
         the rendered height alone would stay compliant even if the floor were
         deleted. Assert the floor directly: it is what keeps the target legal
         if the search field is ever moved, resized, or removed. */
      expect(chrome.tabMinHeight, `${label} tab must keep an intrinsic target floor`)
        .toBeGreaterThanOrEqual(24);
    }
  }
});

/* The product name used to appear three times at once — top tab, sidebar source
   heading, and the page eyebrow. The eyebrow now carries navigation group, the
   one piece of location the other two do not provide. */
test('the page eyebrow locates the page in the IA rather than repeating the product', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });

  const cases = [
    ['parkie', 'overview', '시작하기'],
    ['parkie', 'colors', '파운데이션'],
    ['parkie', 'robotcard', '로봇 운영'],
    ['goalie', 'overview', '시작하기'],
    ['goalie', 'brand', '리소스'],
  ];

  for (const [system, pageId, group] of cases) {
    await page.goto(canonicalUrl(system, pageId));
    await expectSystemRoute(page, system, pageId);
    const eyebrow = page.locator('.guide-page-header__eyebrow');
    await expect(eyebrow, `${system}/${pageId} eyebrow must name its nav group`).toContainText(group);
    await expect(eyebrow, `${system}/${pageId} eyebrow must not repeat the product`)
      .not.toContainText(system === 'goalie' ? 'Goalie UI' : 'Parkie UI');
  }

  /* Secondary sources keep their prefix: "which library am I reading" is a real
     distinction for the MS reference set. */
  await page.goto(canonicalUrl('parkie', 'ms-button'));
  await expect(page.locator('.guide-page-header__eyebrow')).toContainText('MS 참조');
});
