const fs = require('node:fs');
const path = require('node:path');
const { test, expect } = require('@playwright/test');
const AxeBuilder = require('@axe-core/playwright').default;

const TARGET_PAGES = [
  'overview',
  'systemsummary',
  'principles',
  'changelog',
  'colors',
  'typography',
  'spacing',
  'radius',
  'elevation',
  'iconography',
  'button',
  'segmented',
  'selection',
  'input',
  'select',
  'badge',
  'statuslabel',
  'alert',
  'alertfeed',
  'topbar',
  'tabs',
  'breadcrumb',
  'card',
  'table',
  'avatar',
  'robotstatus',
  'robotcard',
  'media',
  'modal',
  'alertcenter',
  'appshell',
  'dashboard',
  'brand',
];

test.describe.configure({ mode: 'serial' });

test.beforeEach(async ({ page }) => {
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.__runtimeErrors = errors;
});

test.afterEach(async ({ page }) => {
  expect(page.__runtimeErrors, 'audited pages must not throw runtime errors').toEqual([]);
});

test('all 33 Parkie destinations are deep-linkable and fully documented', async ({ page }) => {
  for (const id of TARGET_PAGES) {
    await page.goto(`/#${id}`);
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator(`nav.pk-scroll [data-nav-id="${id}"]`)).toHaveAttribute('aria-current', 'page');
    await expect(page.locator('[data-documentation-contract]')).toHaveCount(1);
    await expect(page.locator('[data-documentation-contract] .pk-doc-contract__item')).toHaveCount(4);
    const duplicateIds = await page.evaluate(() => {
      const counts = [...document.querySelectorAll('[id]')].reduce((map, node) => {
        map.set(node.id, (map.get(node.id) || 0) + 1);
        return map;
      }, new Map());
      return [...counts].filter(([, count]) => count > 1);
    });
    expect(duplicateIds, `${id} must not render duplicate IDs`).toEqual([]);
  }

  await page.goto('/#systemsummary');
  const destinations = await page.locator('[data-summary-destination]').evaluateAll((items) => (
    items.map((item) => item.dataset.summaryDestination)
  ));
  expect(destinations).toHaveLength(TARGET_PAGES.length);
  expect(new Set(destinations)).toEqual(new Set(TARGET_PAGES));
});

test('all 33 Parkie destinations have no automated accessibility violations', async ({ page }) => {
  test.setTimeout(180_000);

  const defects = [];

  for (const id of TARGET_PAGES) {
    await page.goto(`/#${id}`);
    await expect(page.locator('h1')).toBeVisible();
    const results = await new AxeBuilder({ page }).analyze();
    for (const violation of results.violations) {
      defects.push({
        page: id,
        rule: violation.id,
        impact: violation.impact,
        nodes: violation.nodes.map((node) => ({
          target: node.target,
          summary: node.failureSummary,
        })),
      });
    }
  }

  expect(defects, JSON.stringify(defects, null, 2)).toEqual([]);
});

test('audited destinations reflow without page-level horizontal overflow', async ({ page }) => {
  test.setTimeout(240_000);
  const viewports = [
    { width: 1440, height: 1000 },
    { width: 900, height: 1000 },
    { width: 390, height: 844 },
  ];

  for (const viewport of viewports) {
    await page.setViewportSize(viewport);
    for (const id of TARGET_PAGES) {
      await page.goto(`/#${id}`);
      await expect(page.locator('h1')).toBeVisible();
      const overflow = await page.evaluate(() => ({
        document: document.documentElement.scrollWidth - window.innerWidth,
        main: document.querySelector('[data-scroll]').scrollWidth
          - document.querySelector('[data-scroll]').clientWidth,
      }));
      expect(overflow.document, `${id} overflows document at ${viewport.width}px`).toBeLessThanOrEqual(1);
      expect(overflow.main, `${id} overflows main at ${viewport.width}px`).toBeLessThanOrEqual(1);
    }
  }
});

test('search, deep links, history and language preserve information architecture', async ({ page }) => {
  await page.goto('/#colors');
  await expect(page.locator('h1')).toHaveText('색상');

  const search = page.locator('[data-navigation-search]');
  await search.fill('아바타');
  await expect(page.locator('nav.pk-scroll [data-nav-id="avatar"]')).toBeVisible();
  await expect(page.locator('nav.pk-scroll [data-nav-id="colors"]')).toHaveCount(0);
  await page.locator('nav.pk-scroll [data-nav-id="avatar"]').click();
  await expect(page).toHaveURL(/#\/parkie\/avatar$/);
  await expect(page.locator('h1')).toHaveText('아바타');

  await page.goBack();
  await expect(page).toHaveURL(/#\/parkie\/colors$/);
  await expect(page.locator('h1')).toHaveText('색상');

  await search.fill('not-a-component');
  await expect(page.getByRole('status')).toContainText('맞는 문서가 없습니다');
  await search.fill('');

  await page.getByRole('button', { name: 'EN', exact: true }).click();
  await expect(page.locator('h1')).toHaveText('Colors');
  await expect(page.locator('[data-documentation-contract]')).toContainText('Accessibility');
});

test('operation controls and structural components expose complete semantics', async ({ page }) => {
  await page.goto('/#topbar');
  const engineer = page.getByRole('radio', { name: '엔지니어' });
  await engineer.focus();
  await page.keyboard.press('ArrowLeft');
  await expect(page.getByRole('radio', { name: '관리자' })).toHaveAttribute('aria-checked', 'true');

  const siteSelect = page.getByRole('combobox', { name: '사이트 선택' });
  await siteSelect.focus();
  await page.keyboard.press('ArrowDown');
  await expect(siteSelect).toHaveAttribute('aria-expanded', 'true');
  await expect(siteSelect).toHaveAttribute('aria-activedescendant', 'topbar-site-option-chungbuk');
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  await page.keyboard.press('Enter');
  await expect(siteSelect).toContainText('충북도청 운영존');

  await page.goto('/#tabs');
  const selectedTab = page.getByRole('tab', { selected: true });
  await expect(selectedTab).toHaveText('전체');
  await selectedTab.focus();
  await page.keyboard.press('ArrowRight');
  await expect(page.getByRole('tab', { selected: true })).toHaveText('운행중');
  await expect(page.getByRole('tabpanel')).toContainText('운행중');

  await page.goto('/#breadcrumb');
  await expect(page.getByRole('navigation', { name: '로봇 상세 경로' }).locator('[aria-current="page"]')).toHaveText('PK-001');
  await expect(page.getByRole('navigation', { name: '압축 위치 경로' }).locator('[aria-current="page"]')).toHaveText('대기구역');

  await page.goto('/#table');
  await expect(page.locator('table caption')).toHaveText('로봇 운영 상태 현황');
  await expect(page.locator('thead th[scope="col"]')).toHaveCount(5);

  await page.goto('/#avatar');
  await expect(page.locator('main [role="img"]')).toHaveCount(7);
});

test('dark fixed token contract and hidden theme control remain intact', async ({ page }) => {
  const tokenPath = path.join(process.cwd(), 'tokens', 'parkie-tokens.css');
  const source = fs.readFileSync(tokenPath, 'utf8');
  expect(source.match(/--parkie-text-tertiary:\s*rgba\(255,255,255,0\.50\);/g)).toHaveLength(2);
  expect(source.match(/--parkie-action-danger-hover-fg:\s*#000000;/g)).toHaveLength(2);
  expect(source.match(/--parkie-icon-focus:\s*rgba\(255,255,255,0\.95\);/g)).toHaveLength(2);
  expect(source.match(/--parkie-icon-selected:\s*var\(--parkie-color-brand-500\);/g)).toHaveLength(2);
  expect(source.match(/--parkie-info:\s*#7CC7E8;/g)).toHaveLength(2);

  const countToken = (css, token) => (css.match(new RegExp(`${token}:`, 'g')) || []).length;
  const mutated = source.replace(/\s+--parkie-icon-focus:[^\n]+\n/, '\n');
  expect(countToken(mutated, '--parkie-icon-focus'), 'parity gate must detect a one-scope mutation').toBe(1);

  /* Generalised parity. The five checks above pin specific tokens; this covers
     every themed token at once, so a new one cannot slip through the way
     --parkie-emergency did when it shipped declared in :root only.

     Note what this can and cannot do. The codebase declares 288 tokens in
     :root and 68 in the dark scope — structural families (primitives, spacing,
     type, elevation, operation base values) are deliberately single-scope, so
     "every token in both scopes" is not the real contract. What is invariant:
     no token may exist only in the dark scope, and a token that is paired today
     must stay paired. */
  const scopeBody = (selector) => {
    const at = source.indexOf(selector);
    const open = source.indexOf('{', at);
    const close = source.indexOf('\n}', open);
    return source.slice(open, close);
  };
  const declared = (css) => new Set(
    [...css.matchAll(/(--parkie-[a-z0-9-]+)\s*:/g)].map((match) => match[1]));
  const rootTokens = declared(scopeBody(':root'));
  const darkTokens = declared(scopeBody('[data-theme="dark"]'));

  const darkOnly = [...darkTokens].filter((token) => !rootTokens.has(token));
  expect(darkOnly, 'a token declared only in the dark scope is undefined in :root').toEqual([]);

  const unpaired = [...darkTokens].filter((token) => countToken(source, token) !== 2);
  expect(unpaired, 'every themed token must keep exactly one declaration per scope').toEqual([]);
  expect(darkTokens.size, 'themed token count should not shrink silently').toBeGreaterThanOrEqual(68);

  await page.goto('/#systemsummary');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await expect(page.locator('body [data-theme]').first()).toHaveAttribute('data-theme', 'dark');
  const themeControl = page.locator('button[aria-hidden="true"][tabindex="-1"]');
  await expect(themeControl).toBeHidden();
});

test('Parkie documentation never falls below the 12px RMS caption floor', async () => {
  const files = [
    path.join(process.cwd(), 'index.html'),
    path.join(process.cwd(), 'styles.css'),
    ...fs.readdirSync(path.join(process.cwd(), 'components'))
      .filter((name) => name.endsWith('.css'))
      .map((name) => path.join(process.cwd(), 'components', name)),
  ];
  const defects = [];
  for (const file of files) {
    const source = fs.readFileSync(file, 'utf8');
    const matches = source.match(/font-size:\s*(?:8|9|10|11)px/g) || [];
    if (matches.length) defects.push({ file: path.relative(process.cwd(), file), matches });
  }
  expect(defects).toEqual([]);
});

test('interaction, operation and severity colors remain independent', async ({ page }) => {
  await page.goto('/#robotstatus');
  await expect(page.locator('.pk-status--connected').first()).toHaveCSS('color', 'rgba(255, 255, 255, 0.95)');
  await expect(page.locator('.pk-status--running').first()).toHaveCSS('color', 'rgba(255, 255, 255, 0.95)');
  await expect(page.locator('.pk-status--paused').first()).toHaveCSS('color', 'rgba(255, 255, 255, 0.6)');
  await expect(page.locator('.pk-status--battery-normal').first()).toHaveCSS('color', 'rgba(255, 255, 255, 0.95)');
  await expect(page.locator('.pk-status--battery-low').first()).toHaveCSS('color', 'rgb(244, 244, 244)');
  await expect(page.locator('.pk-status--charging').first()).toHaveCSS('color', 'rgb(0, 192, 0)');
  await expect(page.locator('.pk-status--reconnecting').first()).toHaveCSS('color', 'rgb(124, 199, 232)');

  const semanticColors = await page.evaluate(() => {
    const probe = document.createElement('span');
    document.body.appendChild(probe);
    const read = (token) => {
      probe.style.color = `var(${token})`;
      return getComputedStyle(probe).color;
    };
    const result = {
      selected: read('--parkie-interaction-selected'),
      info: read('--parkie-info'),
      running: read('--parkie-motion-running'),
      charging: read('--parkie-battery-charging'),
    };
    probe.remove();
    return result;
  });
  expect(semanticColors.info).not.toBe(semanticColors.selected);
  expect(semanticColors.running).not.toBe(semanticColors.selected);
  expect(semanticColors.charging).not.toBe(semanticColors.selected);
});

test('parking-control templates expose freshness, independent state axes and actionable alerts', async ({ page }) => {
  await page.goto('/#dashboard');
  await expect(page.locator('[data-dashboard]')).toBeVisible();
  await expect(page.locator('.pk-dashboard-freshness')).toContainText('2초 전');
  await expect(page.locator('.pk-dashboard-metric')).toHaveCount(5);
  await expect(page.locator('.pk-dashboard-table thead th')).toHaveCount(7);
  await expect(page.locator('.pk-dashboard-table tbody tr')).toHaveCount(4);
  await expect(page.locator('.pk-dashboard-alert')).toHaveCount(2);
  await expect(page.locator('.pk-dashboard-alert dt')).toHaveText([
    '원인', '영향', '권장 조치', '원인', '영향', '권장 조치',
  ]);
  await expect(page.locator('.pk-dashboard-alert button')).toHaveCount(2);

  await page.goto('/#media');
  await expect(page.locator('.pk-camera-state-sample')).toHaveCount(6);
  await expect(page.locator('.pk-camera-card.is-stale')).toContainText('18초 전');

  await page.goto('/#appshell');
  await expect(page.locator('.pk-nav-rail-icon svg')).toHaveCount(5);
  const shellText = await page.locator('.pk-shell-frame').innerText();
  expect(shellText).not.toMatch(/[▣▱↯●⚙♧]/);
});

test('alert-center tabs use roving keyboard focus and preserve panel relationships', async ({ page }) => {
  await page.goto('/#alertcenter');
  const alerts = page.getByRole('tab', { name: '알림' });
  const history = page.getByRole('tab', { name: '주차기록' });
  await alerts.focus();
  await page.keyboard.press('ArrowRight');
  await expect(history).toBeFocused();
  await expect(history).toHaveAttribute('aria-selected', 'true');
  await expect(page.getByRole('tabpanel')).toHaveAttribute('aria-labelledby', 'alert-center-history-tab');
  await page.keyboard.press('Home');
  await expect(alerts).toBeFocused();
  await expect(alerts).toHaveAttribute('aria-selected', 'true');
});

test('fleet and alarm specimens remain bounded with 100 robots and 200 alarms', async ({ page }) => {
  test.setTimeout(60_000);
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/#dashboard');
  const fleet = await page.evaluate(() => {
    const start = performance.now();
    const body = document.querySelector('.pk-dashboard-table tbody');
    const sourceRows = [...body.children];
    while (body.children.length < 100) {
      body.appendChild(sourceRows[body.children.length % sourceRows.length].cloneNode(true));
    }
    return {
      count: body.children.length,
      duration: performance.now() - start,
      documentOverflow: document.documentElement.scrollWidth - innerWidth,
      localScroll: document.querySelector('.pk-dashboard-table-wrap').scrollWidth
        >= document.querySelector('.pk-dashboard-table-wrap').clientWidth,
    };
  });
  expect(fleet.count).toBe(100);
  expect(fleet.duration).toBeLessThan(1000);
  expect(fleet.documentOverflow).toBeLessThanOrEqual(1);
  expect(fleet.localScroll).toBe(true);

  await page.goto('/#alertcenter');
  const alarms = await page.evaluate(() => {
    const start = performance.now();
    const list = document.querySelector('.pk-alert-center-body .pk-feed-list');
    const sourceRows = [...list.children];
    while (list.children.length < 200) {
      list.appendChild(sourceRows[list.children.length % sourceRows.length].cloneNode(true));
    }
    const panel = document.querySelector('.pk-alert-center-body');
    return {
      count: list.children.length,
      duration: performance.now() - start,
      scrollable: panel.scrollHeight > panel.clientHeight,
      documentOverflow: document.documentElement.scrollWidth - innerWidth,
    };
  });
  expect(alarms.count).toBe(200);
  expect(alarms.duration).toBeLessThan(1000);
  expect(alarms.scrollable).toBe(true);
  expect(alarms.documentOverflow).toBeLessThanOrEqual(1);
});

test('all release-critical local assets are served and all Parkie token references resolve', async ({ request }) => {
  const requiredAssets = [
    '/support.js',
    '/styles.css',
    '/GoaliePages.dc.html',
    '/tokens/parkie-tokens.css',
    '/tokens/goalie-tokens.css',
    '/components/goalie.css',
    '/components/controls.css',
    '/components/documentation.css',
    '/components/iconography.css',
    '/components/media-emergency.css',
    '/components/operations.css',
    '/components/robot-status.css',
    '/components/system-summary.css',
    '/icons/parkie-icon-data.js',
    '/ms/icon-data.js',
    '/ms/Components.bundle.js',
    '/ms2/Components.bundle.js',
    '/ms3/Components.bundle.js',
    '/ms4/Components.bundle.js',
    '/ms6/Components.bundle.js',
    '/brand/logo.svg',
    '/brand/hl-robotics-symbol.svg',
    '/brand/hl-robotics-wordmark-white.svg',
    '/brand/hl-robotics-wordmark-black.svg',
  ];
  for (const asset of requiredAssets) {
    const response = await request.get(asset);
    expect(response.status(), `${asset} must be served`).toBe(200);
  }

  const sourceFiles = [
    path.join(process.cwd(), 'index.html'),
    path.join(process.cwd(), 'styles.css'),
    ...fs.readdirSync(path.join(process.cwd(), 'components'))
      .filter((name) => name.endsWith('.css'))
      .map((name) => path.join(process.cwd(), 'components', name)),
  ];
  const tokenSource = fs.readFileSync(path.join(process.cwd(), 'tokens', 'parkie-tokens.css'), 'utf8');
  const defined = new Set([...tokenSource.matchAll(/(--parkie-[\w-]+)\s*:/g)].map((match) => match[1]));
  const referenced = new Set(sourceFiles.flatMap((file) => (
    [...fs.readFileSync(file, 'utf8').matchAll(/var\((--parkie-[\w-]+)/g)].map((match) => match[1])
  )));
  const missing = [...referenced]
    .filter((token) => !token.endsWith('-')) // JavaScript template prefixes resolve at runtime.
    .filter((token) => !defined.has(token))
    .sort();
  expect(missing).toEqual([]);

  const goalieTokenSource = fs.readFileSync(path.join(process.cwd(), 'tokens', 'goalie-tokens.css'), 'utf8');
  const goalieDefined = new Set(
    [...goalieTokenSource.matchAll(/(--goalie-[\w-]+)\s*:/g)].map((match) => match[1]));
  const goalieSourceFiles = [
    path.join(process.cwd(), 'GoaliePages.dc.html'),
    path.join(process.cwd(), 'components', 'goalie.css'),
  ];
  const goalieReferenced = new Set(goalieSourceFiles.flatMap((file) => (
    [...fs.readFileSync(file, 'utf8').matchAll(/var\((--goalie-[\w-]+)/g)].map((match) => match[1])
  )));
  const missingGoalieTokens = [...goalieReferenced]
    .filter((token) => !token.endsWith('-')) // JavaScript template prefixes resolve at runtime.
    .filter((token) => !goalieDefined.has(token))
    .sort();
  expect(missingGoalieTokens).toEqual([]);
});

test('button state contrast and focus ring visibility are enforced', async ({ page }) => {
  await page.goto('/#button');
  await expect(page.locator('h1')).toContainText('버튼');
  await expect(page.locator('.pk-token-table')).toHaveCount(3);
  await expect.poll(() => page.evaluate(() => (
    getComputedStyle(document.documentElement)
      .getPropertyValue('--parkie-focus-ring-inner')
      .trim()
  ))).not.toBe('');

  /* The page computes these from the live CSS, so asserting on what it renders
     also asserts that the tokens themselves still pass. Danger hover used to
     sit at 4.29:1 under white text. */
  const verdicts = page.locator('.pk-token-verdict');
  await expect(verdicts).toHaveCount(12);
  await expect(page.locator('.pk-token-verdict.is-fail')).toHaveCount(0);

  /* WCAG 2.2 Focus Appearance wants 3:1 against the adjacent colour. A single
     translucent ring cannot hold that everywhere — the previous one measured
     1.00:1 on the Primary button, where it composited into the button and
     vanished. Two tones satisfy it because at least one always contrasts. */
  const rings = await page.evaluate(() => {
    const probe = document.createElement('span');
    probe.style.cssText = 'position:absolute;left:-9999px';
    document.body.appendChild(probe);
    const read = (token) => {
      probe.style.color = '';
      probe.style.color = 'var(' + token + ')';
      return getComputedStyle(probe).color;
    };
    const parse = (value) => {
      const source = String(value).trim();
      const rgb = source.match(/rgba?\(([^)]+)\)/i);
      if (rgb) {
        const p = rgb[1].split(/[\s,\/]+/).filter(Boolean).map(Number);
        return { r: p[0], g: p[1], b: p[2] };
      }
      const srgb = source.match(/color\(srgb\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)/i);
      if (srgb) {
        return { r: Number(srgb[1]) * 255, g: Number(srgb[2]) * 255, b: Number(srgb[3]) * 255 };
      }
      throw new Error('Unsupported computed colour: ' + source);
    };
    const lum = (c) => {
      const ch = (v) => {
        const s = v / 255;
        return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
      };
      return 0.2126 * ch(c.r) + 0.7152 * ch(c.g) + 0.0722 * ch(c.b);
    };
    const ratio = (a, b) => {
      const la = lum(a);
      const lb = lum(b);
      return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
    };
    const inner = parse(read('--parkie-focus-ring-inner'));
    const outer = parse(read('--parkie-focus-ring-outer'));
    const backgrounds = [
      '--parkie-bg', '--parkie-surface', '--parkie-surface-elevation-12',
      '--parkie-action-primary-bg', '--parkie-action-danger-bg',
      '--parkie-action-danger-bg-hover', '--parkie-warning', '--parkie-success',
    ];
    const pair = ratio(inner, outer);
    const worst = Math.min(...backgrounds.map((token) => {
      const bg = parse(read(token));
      return Math.max(ratio(inner, bg), ratio(outer, bg));
    }));
    probe.remove();
    return { pair, worst };
  });
  expect(rings.pair, 'the two ring tones must separate from each other').toBeGreaterThanOrEqual(3);
  expect(rings.worst, 'one ring tone must clear 3:1 on every adjacent surface').toBeGreaterThanOrEqual(3);
});
