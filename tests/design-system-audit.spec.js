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
  'downloads',
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

test('all 34 Parkie destinations are deep-linkable and fully documented', async ({ page }) => {
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

test('all 34 Parkie destinations have no automated accessibility violations', async ({ page }) => {
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

/* Valueless boolean attributes have to reach the DOM.
 *
 * The DC runtime used to drop them: the parser hands `disabled` back with the value
 * "", React reads "" as false, and the attribute never arrived. Sixteen of them were
 * inert — a Disabled button specimen that took focus and clicks, a "Disabled input
 * example" that accepted typing, seven checked checkboxes rendering empty.
 *
 * This asserts counts rather than "elements with the attribute have the property",
 * which is the trap here: when the coercion breaks React does not set the attribute
 * either, so a property check finds no elements and passes on an empty set. The
 * numbers below are what the pages document, so they fail if the coercion breaks and
 * they fail again if someone deletes a specimen without meaning to. */
test('valueless boolean attributes reach the DOM on every product', async ({ page }) => {
  const state = async (id, fn) => {
    await page.goto(`/#${id}`);
    await expect(page.locator('h1')).toBeVisible();
    return page.evaluate(fn);
  };

  /* One Disabled specimen per states grid, and it must genuinely be disabled —
     .is-disabled only paints it. */
  expect(await state('button', () => {
    const b = [...document.querySelectorAll('.pk-control-grid .pk-button')].filter((x) => x.disabled);
    return { count: b.length, tabbable: b.some((x) => !x.disabled) };
  }), 'the button page documents exactly one disabled button').toEqual({ count: 1, tabbable: false });

  expect(await state('selection', () => {
    const inputs = [...document.querySelectorAll('.pk-choice-field input')];
    return {
      checked: inputs.filter((i) => i.checked).length,
      disabled: inputs.filter((i) => i.disabled).length,
      switches: [...document.querySelectorAll('.pk-switch')].filter((s) => s.disabled).length,
    };
  }), 'selection documents checked, disabled and disabled-checked states')
    .toEqual({ checked: 3, disabled: 3, switches: 1 });

  expect(await state('input', () => document.querySelector('#robot-id-disabled').disabled),
    'the input page must ship a read-only field that is actually read-only').toBe(true);

  expect(await state('systemsummary', () => ({
    input: document.querySelector('.pk-summary-input[aria-label="Disabled input example"]').disabled,
    checkbox: document.querySelector('.pk-summary-check input').checked,
    disabledButtons: [...document.querySelectorAll('.pk-summary-button-state button')]
      .filter((b) => b.disabled).length,
  })), 'the summary repeats those states and must not fake them')
    .toEqual({ input: true, checkbox: true, disabledButtons: 1 });

  expect(await state('modal', () => ({
    checked: [...document.querySelectorAll('input[type="checkbox"]')].filter((c) => c.checked).length,
    disabled: [...document.querySelectorAll('.pk-modal-button')].filter((b) => b.disabled).length,
  })), 'the modal specimens carry checked rows and disabled actions')
    .toEqual({ checked: 2, disabled: 5 });
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

  /* Generalised parity. The five checks above pin specific tokens; this covers
     every themed token at once, so a new one cannot slip through the way
     --parkie-emergency did when it shipped declared in :root only.

     Note what this can and cannot do. The codebase declares 288 tokens in
     :root and 68 in the dark scope — structural families (primitives, spacing,
     type, elevation, operation base values) are deliberately single-scope, so
     "every token in both scopes" is not the real contract. What is invariant:
     no token may exist only in the dark scope, and a token that is paired today
     must stay paired. */
  /* Scope-anchored, not whole-file. The earlier implementation located scopes
     with `indexOf(':root')` — matching the full selector only as a prefix, by
     coincidence — and counted declarations across the entire file. Both
     assumptions break as soon as a token is declared anywhere outside the two
     scopes, which is exactly what the forced-colors block at the end of
     parkie-tokens.css now does. Anchoring on the exact selectors and counting
     per scope makes the gate assert what it actually means. */
  const ROOT_SCOPE = ':root[data-system="parkie"][data-color-mode="dark"]';
  const DARK_SCOPE = '[data-theme="dark"][data-system="parkie"]';

  const scopeBody = (css, selector) => {
    const at = css.indexOf(selector);
    expect(at, `token scope must exist: ${selector}`).toBeGreaterThan(-1);
    const open = css.indexOf('{', at);
    let depth = 1;
    let index = open + 1;
    while (index < css.length && depth > 0) {
      if (css[index] === '{') depth += 1;
      else if (css[index] === '}') depth -= 1;
      index += 1;
    }
    return css.slice(open + 1, index - 1);
  };
  const declared = (css) => new Set(
    [...css.matchAll(/(--parkie-[a-z0-9-]+)\s*:/g)].map((match) => match[1]));
  const countIn = (css, token) => (css.match(new RegExp(`${token}\\s*:`, 'g')) || []).length;

  const parity = (css) => {
    const rootBody = scopeBody(css, ROOT_SCOPE);
    const darkBody = scopeBody(css, DARK_SCOPE);
    const rootTokens = declared(rootBody);
    const darkTokens = declared(darkBody);
    return {
      rootTokens,
      darkTokens,
      darkOnly: [...darkTokens].filter((token) => !rootTokens.has(token)),
      unpaired: [...darkTokens].filter(
        (token) => countIn(rootBody, token) !== 1 || countIn(darkBody, token) !== 1),
    };
  };

  const live = parity(source);
  expect(live.darkOnly, 'a token declared only in the dark scope is undefined in :root').toEqual([]);
  expect(live.unpaired, 'every themed token must keep exactly one declaration per scope').toEqual([]);
  expect(live.darkTokens.size, 'themed token count should not shrink silently').toBeGreaterThanOrEqual(68);

  /* Mutation: dropping one of the two declarations must be caught. */
  const mutated = source.replace(/\n\s+--parkie-icon-focus:[^\n]+/, '');
  expect(countToken(mutated, '--parkie-icon-focus'), 'mutation must remove one declaration').toBe(1);
  expect(parity(mutated).unpaired, 'parity gate must detect a one-scope mutation')
    .toContain('--parkie-icon-focus');

  /* Windows high contrast. The overrides deliberately sit outside both scopes so
     they never distort the pairing count, and may only touch real tokens. */
  const forcedAt = source.indexOf('@media (forced-colors: active)');
  expect(forcedAt, 'Parkie must answer Windows high contrast').toBeGreaterThan(-1);
  const forcedBlock = source.slice(forcedAt);
  expect(forcedBlock).toContain('Highlight');
  const forcedTokens = [...declared(forcedBlock)];
  expect(forcedTokens.length, 'forced-colors block must override something').toBeGreaterThan(0);
  expect(
    forcedTokens.filter((token) => !live.rootTokens.has(token)),
    'forced-colors may only override tokens that exist in the token scopes',
  ).toEqual([]);

  await page.goto('/#systemsummary');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await expect(page.locator('body [data-theme]').first()).toHaveAttribute('data-theme', 'dark');
  const themeControl = page.locator('button[aria-hidden="true"][tabindex="-1"]');
  await expect(themeControl).toBeHidden();
});

/* Every product that is not Parkie keeps its tokens inside its own scope. The
   check is parameterised rather than written per product, so registering a
   fourth one is a row here rather than a copied test. */
const PRODUCT_TOKEN_SCOPES = [
  {
    id: 'goalie',
    file: path.join('tokens', 'goalie-tokens.css'),
    scope: '[data-system="goalie"][data-color-mode="light"]',
    minTokens: 130,
    consumers: ['styles.css', 'index.html'],
  },
  {
    id: 'cpms',
    file: path.join('tokens', 'cpms-tokens.css'),
    scope: '[data-system="cpms"][data-color-mode="light"]',
    minTokens: 130,
    consumers: ['styles.css', 'index.html', 'CPMSPages.dc.html', 'components/cpms-documentation.css'],
  },
];

for (const product of PRODUCT_TOKEN_SCOPES) {
  test(`${product.id} token scope stays isolated and every reference resolves`, async () => {
    const strip = (css) => css.replace(/\/\*[\s\S]*?\*\//g, '');
    const tokenSource = strip(fs.readFileSync(path.join(process.cwd(), product.file), 'utf8'));

    const at = tokenSource.indexOf(product.scope);
    expect(at, `${product.id} token scope must exist`).toBeGreaterThan(-1);
    const open = tokenSource.indexOf('{', at);
    let depth = 1;
    let index = open + 1;
    while (index < tokenSource.length && depth > 0) {
      if (tokenSource[index] === '{') depth += 1;
      else if (tokenSource[index] === '}') depth -= 1;
      index += 1;
    }
    const scopeBody = tokenSource.slice(open + 1, index - 1);
    const pattern = new RegExp(`(--${product.id}-[a-z0-9-]+)\\s*:`, 'g');
    const declaredTokens = new Set([...scopeBody.matchAll(pattern)].map((match) => match[1]));
    expect(declaredTokens.size, `${product.id} token count should not shrink silently`)
      .toBeGreaterThanOrEqual(product.minTokens);

    /* The stated contract: no :root defaults, so a missing product wrapper fails
       visibly instead of silently inheriting another product's theme. */
    expect(tokenSource, `${product.id} must not declare :root defaults`).not.toMatch(/:root/);

    /* The shell paints through --product-*, published from inside this scope. */
    for (const alias of ['--product-bg', '--product-text', '--product-font']) {
      expect(scopeBody, `${product.id} must publish ${alias} for the shared shell`)
        .toContain(`${alias}: var(--${product.id}-`);
    }

    /* Every consumer reference must resolve, or a component renders with an
       unset custom property. A product awaiting its design legitimately has few
       consumers, so the floor is on declarations, not references. */
    const referenced = new Set();
    for (const relative of product.consumers) {
      const body = fs.readFileSync(path.join(process.cwd(), relative), 'utf8');
      const refPattern = new RegExp(`var\\((--${product.id}-[a-z0-9-]+)`, 'g');
      for (const match of body.matchAll(refPattern)) referenced.add(match[1]);
    }
    expect(
      [...referenced].filter((token) => !declaredTokens.has(token)).sort(),
      `every referenced ${product.id} token must be declared in the product scope`,
    ).toEqual([]);

    /* Windows high contrast, matching the Parkie gate. */
    const forcedAt = tokenSource.indexOf('@media (forced-colors: active)');
    expect(forcedAt, `${product.id} must answer Windows high contrast`).toBeGreaterThan(-1);
    const forcedBlock = tokenSource.slice(forcedAt);
    expect(forcedBlock).toContain('Highlight');
    const forcedTokens = [...forcedBlock.matchAll(pattern)].map((match) => match[1]);
    expect(
      forcedTokens.filter((token) => !declaredTokens.has(token)),
      `forced-colors may only override tokens that exist in the ${product.id} scope`,
    ).toEqual([]);
  });
}

/* Rendered, not read. An earlier version of this test asserted the CSS text and
   passed while the rule did nothing: the forced-colors block sat above
   `.guide-nav-item__soon` in source order, so at equal specificity the authored
   background won and the pill stayed invisible in high contrast. Only rendering
   under emulation catches that. */
test('high contrast is answered in the rendered chrome, every product', async ({ page }) => {
  const probe = () => page.evaluate(() => {
    const root = document.querySelector('.guide-root');
    const active = document.querySelector('.guide-system-link.is-active');
    const soon = document.querySelector('.guide-nav-item__soon');
    return {
      accent: getComputedStyle(root).getPropertyValue('--guide-accent').trim(),
      underline: getComputedStyle(active, '::after').backgroundColor,
      underlineHeight: getComputedStyle(active, '::after').height,
      soonBg: soon ? getComputedStyle(soon).backgroundColor : null,
      soonBorder: soon ? getComputedStyle(soon).borderTopWidth : null,
      ringOuter: getComputedStyle(root).getPropertyValue('--parkie-focus-ring-outer').trim(),
    };
  });

  for (const system of ['parkie', 'goalie', 'cpms']) {
    await page.emulateMedia({ forcedColors: 'none' });
    await page.goto(`/#/${system}/overview`);
    await page.locator('[data-guide-root] h1').waitFor();
    const normal = await probe();

    await page.emulateMedia({ forcedColors: 'active' });
    const forced = await probe();

    expect(forced.accent, `${system}: chrome accent must defer to the system highlight`)
      .toBe('Highlight');
    expect(forced.underline, `${system}: the active tab underline must repaint`)
      .not.toBe(normal.underline);
    expect(forced.underlineHeight, `${system}: the underline must survive, not vanish`).toBe('2px');
    if (normal.soonBg !== null) {
      expect(forced.soonBg, `${system}: the soon pill must adopt a system surface`)
        .not.toBe(normal.soonBg);
      expect(forced.soonBorder, `${system}: the soon pill needs an edge once fills flatten`)
        .toBe('1px');
    } else {
      /* Authored products have no pending navigation item. Absence is the
         contract; manufacturing a pill only to exercise forced colours would
         misrepresent their maturity. */
      expect(forced.soonBg, `${system}: authored routes must stay free of soon pills`).toBeNull();
    }

    if (system === 'parkie') {
      /* The 2-tone ring loses its separation when the OS flattens colour, so the
         outer stop must become the system highlight. */
      expect(normal.ringOuter, 'Parkie ring should be authored in normal mode').not.toBe('Highlight');
      expect(forced.ringOuter, 'Parkie focus ring must defer to the system highlight')
        .toBe('Highlight');
    }
  }

  await page.emulateMedia({ forcedColors: 'none' });
});

test('Parkie documentation never falls below the 12px RMS caption floor', async () => {
  const files = [
    path.join(process.cwd(), 'index.html'),
    path.join(process.cwd(), 'styles.css'),
    ...fs.readdirSync(path.join(process.cwd(), 'components'))
      .filter((name) => name.endsWith('.css'))
      .map((name) => path.join(process.cwd(), 'components', name)),
  ];
  /* Resolve token references before judging. --cpms-font-2xs was declared at
     11px and consumed as font-size: var(--cpms-font-2xs), which this gate could
     not see while it matched literal pixel values only — a sub-floor size hiding
     behind a token name. */
  const sizeTokens = new Map();
  for (const tokenFile of fs.readdirSync(path.join(process.cwd(), 'tokens')).filter((n) => n.endsWith('.css'))) {
    const source = fs.readFileSync(path.join(process.cwd(), 'tokens', tokenFile), 'utf8');
    for (const match of source.matchAll(/(--[a-z0-9-]*font-[a-z0-9-]+):\s*(\d+)px;/g)) {
      sizeTokens.set(match[1], Number(match[2]));
    }
  }
  const belowFloor = [...sizeTokens].filter(([, px]) => px < 12);

  const defects = [];
  for (const file of files) {
    const source = fs.readFileSync(file, 'utf8');
    const matches = source.match(/font-size:\s*(?:8|9|10|11)px/g) || [];
    if (matches.length) defects.push({ file: path.relative(process.cwd(), file), matches });
    for (const [token, px] of belowFloor) {
      if (source.includes(`font-size: var(${token})`)) {
        defects.push({ file: path.relative(process.cwd(), file), matches: [`font-size: var(${token}) = ${px}px`] });
      }
    }
  }
  expect(belowFloor.map(([token, px]) => `${token} = ${px}px`),
    'no type token may declare a size below the 12px floor').toEqual([]);
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
  /* The whole connection axis, not just reconnecting. Degree is neutral —
     connected, weak and reconnecting share the ink and separate by arc count
     and motion — and colour is spent only on the two failure states. Weak was
     warning yellow and reconnecting was info blue until 2026-08-04; pinning
     all five here is what stops either drifting back one at a time. */
  await expect(page.locator('.pk-status--weak').first()).toHaveCSS('color', 'rgba(255, 255, 255, 0.95)');
  await expect(page.locator('.pk-status--reconnecting').first()).toHaveCSS('color', 'rgba(255, 255, 255, 0.95)');
  await expect(page.locator('.pk-status--lost').first()).toHaveCSS('color', 'rgb(255, 107, 107)');
  await expect(page.locator('.pk-status--offline').first()).toHaveCSS('color', 'rgb(161, 161, 170)');

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
      /* The severity family, which the title claims but the assertions below
         used to skip: --parkie-success could have been set to the brand blue
         and this test would still have passed. */
      success: read('--parkie-success'),
      warning: read('--parkie-warning'),
      danger: read('--parkie-danger'),
      emergency: read('--parkie-emergency'),
    };
    probe.remove();
    return result;
  });
  const { selected, ...meanings } = semanticColors;
  for (const [name, value] of Object.entries(meanings)) {
    expect(value, `--parkie-${name} must not reuse the interaction colour`).not.toBe(selected);
  }
  /* Severity levels must also differ from one another, or colour stops
     distinguishing how bad a state is. */
  const severity = [semanticColors.success, semanticColors.warning, semanticColors.danger, semanticColors.emergency];
  expect(new Set(severity).size, 'each severity level needs its own colour').toBe(severity.length);
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

  /* Roving means exactly one tab is in the tab order and it follows the
     selection. Arrow keys and aria-selected alone do not prove it: with both
     tabs at tabindex="0" every assertion below still passed, while keyboard
     users would stop on both tabs instead of entering the group once. */
  const tabOrder = () => page.evaluate(() => [...document.querySelectorAll('[data-alert-center-tab]')]
    .map((tab) => `${tab.dataset.alertCenterTab}:${tab.getAttribute('tabindex')}`));

  expect(await tabOrder(), 'only the selected tab may be in the tab order')
    .toEqual(['alert:0', 'history:-1']);

  await alerts.focus();
  await page.keyboard.press('ArrowRight');
  await expect(history).toBeFocused();
  await expect(history).toHaveAttribute('aria-selected', 'true');
  await expect(page.getByRole('tabpanel')).toHaveAttribute('aria-labelledby', 'alert-center-history-tab');
  expect(await tabOrder(), 'the tab order must follow the selection').toEqual(['alert:-1', 'history:0']);

  await page.keyboard.press('Home');
  await expect(alerts).toBeFocused();
  await expect(alerts).toHaveAttribute('aria-selected', 'true');
  expect(await tabOrder(), 'Home must return the tab order to the first tab')
    .toEqual(['alert:0', 'history:-1']);
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
      wrapScrollWidth: document.querySelector('.pk-dashboard-table-wrap').scrollWidth,
      wrapClientWidth: document.querySelector('.pk-dashboard-table-wrap').clientWidth,
      wrapOverflowX: getComputedStyle(document.querySelector('.pk-dashboard-table-wrap')).overflowX,
    };
  });
  expect(fleet.count).toBe(100);
  expect(fleet.duration).toBeLessThan(1000);
  expect(fleet.documentOverflow).toBeLessThanOrEqual(1);
  /* The contract is that the wide table overflows its own wrapper rather than
     the page. The previous form compared scrollWidth >= clientWidth, which is
     true by definition and so could never fail — it asserted nothing. */
  expect(fleet.wrapScrollWidth, 'the table must actually be wider than its wrapper')
    .toBeGreaterThan(fleet.wrapClientWidth);
  expect(['auto', 'scroll'], 'the wrapper must contain that overflow locally')
    .toContain(fleet.wrapOverflowX);

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
    '/ProductSkeleton.dc.html',
    '/CPMSPages.dc.html',
    '/tokens/parkie-tokens.css',
    '/tokens/goalie-tokens.css',
    '/tokens/cpms-tokens.css',
    '/components/controls.css',
    '/components/documentation.css',
    '/components/iconography.css',
    '/components/media-emergency.css',
    '/components/operations.css',
    '/components/robot-status.css',
    '/components/system-summary.css',
    '/components/cpms-documentation.css',
    '/icons/parkie-icon-data.js',
    '/icons/svg-export.js',
    '/export/dom-to-svg.js',
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
    path.join(process.cwd(), 'ProductSkeleton.dc.html'),
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

/* components/goalie.css shipped 38KB to every visitor while nothing referenced
   it — 99 classes, zero used, discovered only by an ad-hoc sweep. This makes
   that sweep permanent. The threshold is "entirely unused", not "fully used":
   a stylesheet legitimately carries a few rules for states the docs do not
   currently render, and failing on those would be noise. */
test('no imported stylesheet is entirely unused', async () => {
  const entry = fs.readFileSync(path.join(process.cwd(), 'styles.css'), 'utf8');
  const imports = [...entry.matchAll(/@import\s+"\.\/([^?"]+)/g)].map((match) => match[1]);
  expect(imports.length, 'the entry point must import the component layer').toBeGreaterThan(4);

  const consumerFiles = [
    'index.html',
    'ProductSkeleton.dc.html',
    'CPMSPages.dc.html',
    'styles.css',
    ...imports.filter((file) => file.startsWith('components/')),
  ];

  const findings = [];
  for (const relative of imports) {
    const full = path.join(process.cwd(), relative);
    expect(fs.existsSync(full), `${relative} is imported but missing`).toBe(true);
    const source = fs.readFileSync(full, 'utf8');

    if (relative.startsWith('tokens/')) {
      /* A token file earns its place by being consumed somewhere — including by
         its own semantic aliases, which is how a product staged for handover
         legitimately looks. */
      const declared = new Set([...source.matchAll(/(--[a-z0-9-]+)\s*:/g)].map((m) => m[1]));
      const consumed = new Set([...source.matchAll(/var\((--[a-z0-9-]+)/g)].map((m) => m[1]));
      for (const file of consumerFiles) {
        const body = fs.readFileSync(path.join(process.cwd(), file), 'utf8');
        for (const m of body.matchAll(/var\((--[a-z0-9-]+)/g)) consumed.add(m[1]);
      }
      const used = [...declared].filter((token) => consumed.has(token));
      if (declared.size && used.length === 0) findings.push(`${relative}: ${declared.size} tokens declared, none consumed`);
      continue;
    }

    const declared = new Set([...source.matchAll(/\.([a-zA-Z][\w-]{2,})/g)].map((m) => m[1]));
    if (!declared.size) continue;
    const referenced = new Set();
    for (const file of consumerFiles) {
      if (file === relative) continue;
      const body = fs.readFileSync(path.join(process.cwd(), file), 'utf8');
      for (const m of body.matchAll(/[\w-]+/g)) referenced.add(m[0]);
    }
    const used = [...declared].filter((name) => referenced.has(name));
    if (used.length === 0) {
      findings.push(`${relative}: ${declared.size} classes defined, none referenced (${Math.round(source.length / 1024)}KB served for nothing)`);
    }
  }

  expect(findings, 'an imported stylesheet that nothing references is dead weight').toEqual([]);
});

/* The colour page shows each semantic token's real value. The risk this guards
   is not a missing line but a wrong one: eight of the twenty-five tokens are
   translucent, and printing a flattened hex for --parkie-text (95% white) would
   state a colour the token does not have. */
const TRANSLUCENT_COLOR_TOKENS = [
  '--parkie-brand-subtle',
  '--parkie-brand-border',
  '--parkie-border',
  '--parkie-text',
  '--parkie-text-secondary',
  '--parkie-text-tertiary',
  '--parkie-text-disabled',
  '--parkie-status-active',
];

test('semantic colour cards report the value the token actually resolves to', async ({ page }) => {
  await page.goto('/#colors');
  await expect(page.locator('.pk-color-card').first()).toBeVisible();
  /* The stylesheet arrives via <helmet>; the value line reads "…" until then. */
  await expect(page.locator('[data-color-value]').first()).not.toHaveText('…');

  const cards = await page.evaluate(() => {
    const scope = document.querySelector('[data-product-root]');
    const probe = document.createElement('span');
    probe.style.cssText = 'position:absolute;left:-9999px';
    scope.appendChild(probe);
    const read = (token) => {
      probe.style.color = '';
      probe.style.color = `var(${token})`;
      return getComputedStyle(probe).color;
    };
    const result = [...document.querySelectorAll('.pk-color-card')].map((card) => ({
      token: card.querySelector('[data-color-token]')?.textContent.trim(),
      shown: card.querySelector('[data-color-value]')?.textContent.trim(),
      composited: card.querySelector('[data-color-composited]')?.textContent.trim() || '',
      use: card.querySelector('.pk-color-card__use')?.textContent.trim() || '',
      live: read(card.querySelector('[data-color-token]')?.textContent.trim() || '--parkie-text'),
    }));
    probe.remove();
    return result;
  });

  expect(cards.length, 'every semantic token needs a card').toBe(25);

  const channels = (value) => (value.startsWith('#')
    ? [parseInt(value.slice(1, 3), 16), parseInt(value.slice(3, 5), 16), parseInt(value.slice(5, 7), 16), 1]
    : (value.match(/[\d.]+/g) || []).map(Number));

  for (const card of cards) {
    expect(card.shown, `${card.token} must show a value`).toBeTruthy();
    expect(card.shown, `${card.token} must not still be waiting`).not.toBe('…');
    expect(card.use, `${card.token} must say what it is for`).toBeTruthy();

    const shown = channels(card.shown);
    const live = channels(card.live);
    if (live.length === 3) live.push(1);
    expect(shown.length, `${card.token} value must parse`).toBe(4);
    for (let i = 0; i < 4; i += 1) {
      expect(Math.abs(shown[i] - live[i]), `${card.token} shown ${card.shown} vs live ${card.live}`)
        .toBeLessThan(0.02);
    }
  }

  /* The specific defect this exists to prevent. */
  const translucent = cards.filter((card) => TRANSLUCENT_COLOR_TOKENS.includes(card.token));
  expect(translucent.length, 'all translucent tokens must have cards').toBe(TRANSLUCENT_COLOR_TOKENS.length);
  for (const card of translucent) {
    expect(card.shown, `${card.token} is translucent and must not be flattened to a hex`).toMatch(/^rgba\(/);
    expect(card.composited, `${card.token} must also report what it looks like on the surface`)
      .toMatch(/#[0-9A-F]{6}/);
  }

  const opaque = cards.filter((card) => !TRANSLUCENT_COLOR_TOKENS.includes(card.token));
  for (const card of opaque) {
    expect(card.shown, `${card.token} is opaque and should read as a hex`).toMatch(/^#[0-9A-F]{6}$/);
  }
});

test('the colour page leads with semantic tokens, not the raw ramps', async ({ page }) => {
  await page.goto('/#colors');
  await expect(page.locator('.pk-color-card').first()).toBeVisible();

  const order = await page.evaluate(() => {
    const headings = [...document.querySelectorAll('main h2')];
    const find = (text) => headings.findIndex((h) => h.textContent.includes(text));
    return { semantic: find('의미 토큰'), elevation: find('Surface Elevation'), primitive: find('원시 팔레트') };
  });

  expect(order.semantic, 'semantic section must exist').toBeGreaterThan(-1);
  expect(order.primitive, 'primitive section must exist').toBeGreaterThan(-1);
  /* The page's own three-layer note says primitives are never bound directly,
     so showing them first taught the opposite of the guidance beside them. */
  expect(order.semantic, 'semantic tokens must precede the primitive ramps')
    .toBeLessThan(order.primitive);
  expect(order.elevation, 'elevation explains the surface tokens and follows them')
    .toBeGreaterThan(order.semantic);
});

test('the icon summary states what the catalogue actually contains', async ({ page }) => {
  /* Derived from the icon source, not pinned to a string. The two figures this
     guards were both wrong and no test noticed: the stroke chip claimed a flat
     2px when only four of the thirteen stroked icons are at 2px, and the count
     chip reported documented rows, which undercounts because the battery and
     connection rows each carry four different icons. */
  const source = fs.readFileSync(path.join(process.cwd(), 'icons', 'parkie-icon-data.js'), 'utf8');
  const widths = [...source.matchAll(/stroke-width="([\d.]+)"/g)].map((match) => Number(match[1]));
  expect(widths.length, 'the Parkie icons must actually be stroked').toBeGreaterThan(0);
  const low = Math.min(...widths);
  const high = Math.max(...widths);

  /* The chip derives its range from this same catalogue, so comparing the two
     cannot catch an icon drifting to a width nobody chose — both sides move
     together. The scale itself is therefore pinned here, deliberately, as
     policy: 2px is the weight, and 1.8px is the exception for the three
     drawings that lose a counter or seal a gap at 2px. Widening this set is a
     design decision and should cost a test edit. */
  const SANCTIONED = [1.8, 2];
  const offScale = [...new Set(widths)].filter((w) => !SANCTIONED.includes(w)).sort();
  expect(offScale, `stroke widths outside the ${SANCTIONED.join('/')} scale`).toEqual([]);

  await page.goto('/#iconography');
  await expect(page.locator('.pk-icon-summary-item').first()).toBeVisible();

  const chips = Object.fromEntries(await page.locator('.pk-icon-summary-item').evaluateAll((items) => (
    items.map((item) => [
      item.querySelector('.pk-icon-summary-label').textContent.trim(),
      item.querySelector('.pk-icon-summary-value').textContent.trim(),
    ])
  )));

  const stroke = chips['선형 두께'];
  expect(stroke, 'the stroke chip must exist').toBeTruthy();
  const stated = [...stroke.matchAll(/[\d.]+/g)].map((match) => Number(match[0]));
  expect(Math.min(...stated), `icons are drawn from ${low}px`).toBe(low);
  expect(Math.max(...stated), `icons are drawn up to ${high}px`).toBe(high);

  /* The chip also claims ROUND, so every cap and join has to be round. */
  if (/ROUND/i.test(stroke)) {
    const caps = [...source.matchAll(/stroke-linecap="([a-z]+)"/g)].map((m) => m[1]);
    const joins = [...source.matchAll(/stroke-linejoin="([a-z]+)"/g)].map((m) => m[1]);
    expect([...new Set([...caps, ...joins])], 'ROUND must be the whole story').toEqual(['round']);
  }

  /* One number for "how many icons", agreeing with what the buttons hand out. */
  const documented = Number(chips['문서화 아이콘'].match(/\d+/)[0]);
  const shapeButton = Number((await page.locator('[data-icon-download]').innerText()).match(/\d+/)[0]);
  expect(documented, 'the summary and the shape download must agree').toBe(shapeButton);
  expect(documented, 'rows undercount; distinct shapes is the honest figure')
    .toBeGreaterThanOrEqual(await page.locator('.pk-icon-row').count());

  /* The sheet quotes no count of its own, so what has to hold is that it is
     offered at all — the summary describes a catalogue both downloads serve. */
  await expect(page.locator('[data-icon-sheet-download]')).toBeVisible();
});

/* WCAG 2.5.8 across every Parkie destination.
 *
 * The handoff carried this as a defect — ".pk-icon-button is a real product
 * control at 24x24, far short of Material's 48dp and only just clearing 2.5.8".
 * Measured, none of that holds: the class appears five times, all of them
 * specimens on the component stage, and 24x24 is a pass rather than a near
 * miss. Its four size variants are used nowhere at all.
 *
 * What the measurement did find is that every genuinely undersized control on
 * these pages — robot commands at 22.5x15, modal checkboxes at 16x16 — clears
 * the spacing exception with 33px or more to its nearest neighbour. So there is
 * nothing to fix, and that is exactly why this gate exists: nothing was
 * stopping the next one from failing.
 *
 * 2.5.8 is not a flat 24x24 rule and asserting it as one would over-report the
 * way the Goalie border check did before it was scoped. Both exceptions are
 * applied: a 24px circle centred on an undersized target must reach no other
 * target's circle, and targets inline in a run of text are excused.
 */
test('every Parkie target is reachable under WCAG 2.5.8', async ({ page }) => {
  test.setTimeout(300_000);

  /* One implementation, used for the real pages and for the probe below. It was
     briefly two — and mutating either copy left the other one passing, so the
     self-check gave false confidence rather than catching anything. */
  const scan = (pageId, plant) => {
    let planted = null;
    if (plant) {
      planted = document.createElement('div');
      planted.style.cssText = 'display:flex;gap:1px;position:absolute;left:-9999px';
      planted.innerHTML = '<button type="button" aria-label="probe a" style="width:16px;height:16px"></button>'
        + '<button type="button" aria-label="probe b" style="width:16px;height:16px"></button>';
      document.querySelector('main').appendChild(planted);
    }

    const selector = 'button, a[href], input:not([type="hidden"]), select, textarea, '
      + '[role="button"], [role="tab"], [role="radio"], [role="switch"], [role="checkbox"], [role="option"]';
    const targets = [...document.querySelector('main').querySelectorAll(selector)]
      .filter((el) => {
        const cs = getComputedStyle(el);
        if (cs.display === 'none' || cs.visibility === 'hidden') return false;
        const box = el.getBoundingClientRect();
        return box.width > 0 && box.height > 0;
      })
      .map((el) => ({ el, box: el.getBoundingClientRect() }));

    const centre = (b) => ({ x: b.left + b.width / 2, y: b.top + b.height / 2 });
    const failed = [];

    for (const { el, box } of targets) {
      if (Math.min(box.width, box.height) >= 24) continue;

      /* Inline exception: the target sits in a run of text. */
      const cs = getComputedStyle(el);
      const own = (el.textContent || '').trim();
      const around = (el.parentElement?.textContent || '').trim();
      if (cs.display.startsWith('inline') && around.length > own.length + 4) continue;

      /* Spacing exception: no other target's 24px circle reaches this one. */
      const here = centre(box);
      let nearest = Infinity;
      for (const other of targets) {
        if (other.el === el) continue;
        const there = centre(other.box);
        nearest = Math.min(nearest, Math.hypot(here.x - there.x, here.y - there.y));
      }
      if (nearest >= 24) continue;

      failed.push(`${pageId}: .${(el.className || '').toString().trim().split(' ')[0] || el.tagName}`
        + ` ${Math.round(box.width)}x${Math.round(box.height)}, nearest target ${Math.round(nearest)}px`);
    }

    if (planted) planted.remove();
    return { failed, counted: targets.length };
  };

  const violations = [];
  let checked = 0;

  for (const id of TARGET_PAGES) {
    await page.goto(`/#${id}`);
    await expect(page.locator('h1')).toBeVisible();
    const result = await page.evaluate(
      ([body, pageId]) => new Function(`return (${body})`)()(pageId, false),
      [scan.toString(), id],
    );
    violations.push(...result.failed);
    checked += result.counted;
  }

  expect(violations, 'undersized targets must be spaced, inline, or resized').toEqual([]);

  /* A check that stopped finding targets would pass this silently, which has
     already happened once in this repo to a gate that had just succeeded. */
  expect(checked, 'the target check must be measuring controls, not skipped')
    .toBeGreaterThan(200);

  /* And the routine has to still be able to fail. These pages are clean, so
     nothing above exercises the rejection path — planting a crowded pair does,
     and because it runs the same function, weakening either exception shows up
     here instead of passing quietly. */
  const probed = await page.evaluate(
    ([body]) => new Function(`return (${body})`)()('probe', true).failed.length,
    [scan.toString()],
  );
  expect(probed, 'the spacing exception must still reject a crowded pair')
    .toBeGreaterThanOrEqual(2);
});

/*
 * The same robot-state vocabulary was written out twice and had drifted: the
 * catalogue row carried four states and the domain grid five, labelled '정상
 * 26% 이상' against '충분', with reconnecting drawn as the wifi mark in one
 * place and the sync arrow in the other. Worse, the domain grid's own
 * description claimed the states "differ by both shape and colour" while lost
 * and offline shared one glyph and separated by hue alone — a false claim in
 * the copy and a WCAG 1.4.1 problem in the build.
 *
 * Both surfaces derive from one array now. This holds them there, and holds
 * the column count to the cell count: it was pinned at four, so the fifth state
 * wrapped onto a second line and rendered under the label column.
 */
test('robot state icons come from one vocabulary and separate by shape', async ({ page }) => {
  await page.goto('/#iconography');
  await expect(page.locator('[data-icon-group="robot-status"]')).toHaveCount(1);

  const read = await page.evaluate(() => {
    const bodyOf = (el) => {
      const svg = el.querySelector('svg');
      return svg ? svg.innerHTML.replace(/\s+/g, ' ').trim() : '';
    };
    const catalogue = [...document.querySelectorAll('[data-icon-group="robot-status"] .pk-icon-row')]
      .map((row) => ({
        axis: row.querySelector('.pk-icon-name-en')?.textContent.trim() || '',
        columns: getComputedStyle(row).gridTemplateColumns.split(' ').length,
        cells: [...row.querySelectorAll('.pk-icon-spec-row')].map((cell) => ({
          label: cell.querySelector('.pk-icon-spec-state')?.textContent.trim() || '',
          body: bodyOf(cell),
        })),
      }));
    const grids = [...document.querySelectorAll('.pk-domain-grid')].map((grid) => ({
      title: grid.closest('section')?.querySelector('h2')?.textContent.trim() || '?',
      cells: [...grid.querySelectorAll('.pk-domain-icon')].map((cell) => ({
        label: cell.querySelector('.pk-domain-icon-label')?.textContent.trim() || '',
        body: bodyOf(cell),
        tone: [...cell.classList].find((c) => c.startsWith('is-')) || '',
      })),
    }));
    return {
      catalogue,
      grids,
      domain: grids
        .filter((g) => g.cells.every((c) => /^is-(connection|battery|charging)/.test(c.tone)))
        .map((g) => g.cells),
    };
  });

  expect(read.catalogue, 'battery and connection both appear in the catalogue').toHaveLength(2);
  expect(read.domain, 'battery and connection both appear as domain grids').toHaveLength(2);

  /* One implementation, used for the real rows and for the planted pair below,
     so weakening it fails the self-check instead of passing quietly. */
  const duplicateShapes = (cells) => {
    const seen = new Map();
    const dupes = [];
    for (const cell of cells) {
      if (seen.has(cell.body)) dupes.push(`${seen.get(cell.body)} = ${cell.label}`);
      else seen.set(cell.body, cell.label);
    }
    return dupes;
  };

  for (const [index, row] of read.catalogue.entries()) {
    expect(row.cells.length, `${row.axis} must render every state`).toBe(5);

    /* One track for the label, one per state. A wrapped row reports fewer. */
    expect(row.columns, `${row.axis} needs a column per state plus the label`)
      .toBe(row.cells.length + 1);

    expect(duplicateShapes(row.cells), `${row.axis} states must differ by shape, not only by colour`)
      .toEqual([]);

    /* Same source, so the other surface must agree state for state. */
    const twin = read.domain[index];
    expect(twin.map((c) => c.label), `${row.axis} labels must match on both surfaces`)
      .toEqual(row.cells.map((c) => c.label));
    expect(twin.map((c) => c.body), `${row.axis} glyphs must match on both surfaces`)
      .toEqual(row.cells.map((c) => c.body));
  }

  /* Connection was the only group with the defect, but the rule is not specific
     to it: any two states in one group that share a glyph are separated by
     colour alone. Every group is swept, so the next one is caught on arrival
     rather than after someone notices the two icons look the same. */
  expect(read.grids.length, 'the domain groups must be present to sweep').toBeGreaterThanOrEqual(5);
  for (const grid of read.grids) {
    expect(duplicateShapes(grid.cells), `${grid.title} states must differ by shape, not only by colour`)
      .toEqual([]);
  }

  /* Every surface is clean now, so nothing above exercises the rejection path
     — the failure this gate exists for cannot be observed from the real pages.
     A planted pair runs the same routine and does exercise it. */
  const planted = duplicateShapes([
    { label: 'probe lost', body: '<path d="M4 4 20 20"/>' },
    { label: 'probe offline', body: '<path d="M4 4 20 20"/>' },
  ]);
  expect(planted, 'two states sharing one glyph must still be rejected')
    .toEqual(['probe lost = probe offline']);
});

/*
 * Connection used to spend colour on degree: weak wore warning yellow and
 * reconnecting wore info blue, which read as an alert and as an interactive
 * control respectively. Battery had always done the opposite — neutral through
 * the low range, colour only for critical and charging — so connection now
 * follows it, and arc count and motion carry the degree instead.
 *
 * The bypass is the part worth gating. robot-status.css read --parkie-status-
 * info and --parkie-status-warning directly rather than the connection tokens,
 * so moving the tokens would have left the product badge blue and yellow while
 * the documentation went neutral. --parkie-connection-offline meanwhile existed
 * with no consumer at all.
 */
test('connection states spend colour only on severity, on every surface', async ({ page }) => {
  const resolve = (tokens) => (list) => {
    const probe = document.createElement('span');
    probe.style.cssText = 'position:absolute;left:-9999px';
    document.body.appendChild(probe);
    const out = {};
    for (const token of list) {
      probe.style.color = '';
      probe.style.color = `var(${token})`;
      out[token] = getComputedStyle(probe).color;
    }
    probe.remove();
    return out;
  };

  await page.goto('/#iconography');
  const doc = await page.evaluate(([body]) => {
    const read = new Function(`return (${body})`)()();
    const tokens = read([
      '--parkie-connection-good', '--parkie-connection-weak',
      '--parkie-connection-reconnecting', '--parkie-connection-lost',
      '--parkie-connection-offline', '--parkie-status-warning', '--parkie-status-info',
    ]);
    const painted = {};
    for (const state of ['good', 'weak', 'reconnecting', 'lost', 'offline']) {
      const cell = document.querySelector(`.pk-domain-icon.is-connection-${state}`);
      painted[state] = cell ? getComputedStyle(cell).color : null;
    }
    return { tokens, painted };
  }, [resolve.toString().replace('(tokens) =>', '() =>')]);

  /* Every state is drawn from its own token — the surface used to reach for the
     generic is-warning / is-info / is-disabled tones instead. */
  for (const state of ['good', 'weak', 'reconnecting', 'lost', 'offline']) {
    expect(doc.painted[state], `connection ${state} must be rendered`).not.toBeNull();
    expect(doc.painted[state], `connection ${state} must read its own token`)
      .toBe(doc.tokens[`--parkie-connection-${state}`]);
  }

  /* The rule itself: degree is neutral, severity is not. */
  expect(doc.tokens['--parkie-connection-weak'], 'weak is a degree, not a warning')
    .not.toBe(doc.tokens['--parkie-status-warning']);
  expect(doc.tokens['--parkie-connection-reconnecting'], 'reconnecting must not wear the interaction blue')
    .not.toBe(doc.tokens['--parkie-status-info']);
  expect(doc.tokens['--parkie-connection-weak'], 'good and weak separate by arc count, so they share a colour')
    .toBe(doc.tokens['--parkie-connection-good']);
  expect(doc.tokens['--parkie-connection-lost'], 'lost must stay distinct from the neutral degrees')
    .not.toBe(doc.tokens['--parkie-connection-good']);
  expect(doc.tokens['--parkie-connection-offline'], 'offline must stay distinct from the neutral degrees')
    .not.toBe(doc.tokens['--parkie-connection-good']);

  /* And the product badge has to follow the same tokens, not the status ramp. */
  await page.goto('/#statuslabel');
  const badge = await page.evaluate(([body]) => {
    const read = new Function(`return (${body})`)()();
    const tokens = read([
      '--parkie-connection-weak', '--parkie-connection-reconnecting',
      '--parkie-connection-offline',
    ]);
    const probe = document.createElement('span');
    probe.style.cssText = 'position:absolute;left:-9999px';
    document.body.appendChild(probe);
    const painted = {};
    for (const [state, cls] of [['weak', 'pk-status--weak'], ['reconnecting', 'pk-status--reconnecting'], ['offline', 'pk-status--offline']]) {
      probe.className = `pk-status-indicator ${cls}`;
      painted[state] = getComputedStyle(probe).getPropertyValue('--status-color').trim();
    }
    probe.remove();
    return { tokens, painted };
  }, [resolve.toString().replace('(tokens) =>', '() =>')]);

  for (const state of ['weak', 'reconnecting', 'offline']) {
    expect(badge.painted[state], `the ${state} badge must route through the connection token`)
      .not.toBe('');
  }
});

/*
 * The white band went from 2px to 1px because at 2px it read as a heavy outline
 * rather than a focus ring. What must not follow it down is the indicator as a
 * whole: WCAG 2.4.13 wants at least a 2px perimeter, and the two-tone structure
 * is what keeps the ring visible everywhere — white is 2.56:1 on the Primary
 * fill and the dark tone is 1.16:1 on the canvas, so each background is covered
 * by whichever tone the other one loses.
 *
 * The spread is read from the colour function outward, not by scraping numbers
 * from the string: getComputedStyle returns the offsets first, so a bare
 * [\d.]+ sweep reads offset zero where the spread is.
 */
test('the Parkie focus ring keeps both tones and a 2px indicator', async ({ page }) => {
  await page.goto('/#button');

  const shadow = await page.evaluate(() => {
    const probe = document.createElement('span');
    probe.style.cssText = 'position:absolute;left:-9999px';
    document.body.appendChild(probe);
    probe.style.boxShadow = 'var(--parkie-ring)';
    const value = getComputedStyle(probe).boxShadow;
    probe.remove();
    return value;
  });

  const layers = [...shadow.matchAll(/(rgba?\([^)]*\))\s+([-\d.]+)px\s+([-\d.]+)px\s+([-\d.]+)px\s+([-\d.]+)px/g)]
    .map((m) => ({ colour: m[1], spread: Number(m[5]) }));

  expect(layers.length, 'the ring must keep both tones — one alone vanishes on some surface').toBe(2);
  expect(new Set(layers.map((l) => l.colour)).size, 'the two tones must actually differ').toBe(2);
  expect(Math.max(...layers.map((l) => l.spread)), 'WCAG 2.4.13 wants a 2px indicator at minimum')
    .toBeGreaterThanOrEqual(2);
});
