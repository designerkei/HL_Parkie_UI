const fs = require('node:fs');
const path = require('node:path');
const { test, expect } = require('@playwright/test');
const AxeBuilder = require('@axe-core/playwright').default;

const TARGET_PAGES = [
  'systemsummary',
  'colors',
  'typography',
  'spacing',
  'radius',
  'elevation',
  'iconography',
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

test('all 17 audited destinations are deep-linkable and fully documented', async ({ page }) => {
  for (const id of TARGET_PAGES) {
    await page.goto(`/#${id}`);
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator(`nav.pk-scroll [data-nav-id="${id}"]`)).toHaveAttribute('aria-current', 'page');
    await expect(page.locator('[data-documentation-contract]')).toHaveCount(1);
    await expect(page.locator('[data-documentation-contract] .pk-doc-contract__item')).toHaveCount(4);
  }

  await page.goto('/#systemsummary');
  const destinations = await page.locator('[data-summary-destination]').evaluateAll((items) => (
    items.map((item) => item.dataset.summaryDestination)
  ));
  expect(destinations).toHaveLength(TARGET_PAGES.length);
  expect(new Set(destinations)).toEqual(new Set(TARGET_PAGES));
});

test('all 17 audited destinations have no automated accessibility violations', async ({ page }) => {
  test.setTimeout(90_000);

  for (const id of TARGET_PAGES) {
    await page.goto(`/#${id}`);
    await expect(page.locator('h1')).toBeVisible();
    const results = await new AxeBuilder({ page }).analyze();
    expect(
      results.violations,
      `${id} accessibility violations:\n${results.violations.map((violation) => (
        `${violation.id}: ${violation.nodes.length}`
      )).join('\n')}`
    ).toEqual([]);
  }
});

test('audited destinations reflow without page-level horizontal overflow', async ({ page }) => {
  test.setTimeout(120_000);
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
  await expect(page).toHaveURL(/#avatar$/);
  await expect(page.locator('h1')).toHaveText('아바타');

  await page.goBack();
  await expect(page).toHaveURL(/#colors$/);
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

  await page.goto('/#systemsummary');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await expect(page.locator('body [data-theme]').first()).toHaveAttribute('data-theme', 'dark');
  const themeControl = page.locator('button[aria-hidden="true"][tabindex="-1"]');
  await expect(themeControl).toBeHidden();
});
