const fs = require('node:fs');
const path = require('node:path');
const { test, expect } = require('@playwright/test');
const AxeBuilder = require('@axe-core/playwright').default;

const AUTHORED_PAGES = [
  'overview', 'systemsummary', 'principles', 'colors', 'typography', 'spacing',
  'iconography', 'button', 'input', 'status', 'navigation', 'patrol', 'video', 'templates',
];

async function openAuthoredGoalie(page, pageId) {
  await page.goto('/#/parkie/overview');
  await page.evaluate((target) => {
    window.__GUIDE_SYSTEMS.goalie.skeleton = false;
    window.location.hash = `#/goalie/${target}`;
  }, pageId);
  await expect(page).toHaveURL(new RegExp(`#\/goalie\/${pageId}$`));
  await expect(page.locator('[data-goalie-pages]')).toHaveAttribute('data-goalie-page', pageId);
  await expect(page.locator('[data-goalie-pages]')).toHaveAttribute('lang', 'ko');
}

test('authored Goalie foundation and component pages render behind the release gate', async ({ page }) => {
  test.setTimeout(120_000);
  for (const pageId of AUTHORED_PAGES) {
    await openAuthoredGoalie(page, pageId);
    await expect(page.locator('.ps-root')).toHaveCount(0);
    await expect(page.locator('[data-goalie-pages] .gl-doc__truthbar')).toBeVisible();
    await expect(page.locator('[data-goalie-pages] h2').first()).toBeVisible();
  }

  const registry = await page.evaluate(() => window.__GUIDE_SYSTEMS.goalie);
  expect(registry.tokens).toBe('tokens/goalie-tokens.css');
  expect(registry.theme).toBe('light');
});

test('Goalie Button and Switch expose complete state axes and operable semantics', async ({ page }) => {
  await openAuthoredGoalie(page, 'button');
  await expect(page.locator('.gl-button-matrix')).toHaveCount(2);
  await expect(page.locator('.gl-button-matrix__row')).toHaveCount(8);
  await expect(page.locator('.gl-button-matrix__row .gl-button')).toHaveCount(32);

  const driveMode = page.locator('.gl-switch:not(:disabled)').first();
  await expect(driveMode).toHaveAttribute('role', 'switch');
  await expect(driveMode).toHaveAttribute('aria-checked', 'true');
  await driveMode.click();
  await expect(driveMode).toHaveAttribute('aria-checked', 'false');
  await expect(page.locator('.gl-switch[aria-disabled="true"]')).toHaveCount(2);
});

test('Goalie feedback keeps severity, disclosure and modal decisions independent', async ({ page }) => {
  await openAuthoredGoalie(page, 'status');
  await expect(page.locator('.gl-alert-banner')).toHaveCount(2);
  await expect(page.locator('.gl-alert-banner--danger')).toHaveAttribute('role', 'alert');

  const disclosure = page.locator('.gl-alert-banner:not(.gl-alert-banner--danger) .gl-alert-expand');
  await expect(disclosure).toHaveAttribute('aria-expanded', 'true');
  await expect(page.locator('#gl-alert-history-info')).toBeVisible();
  await disclosure.click();
  await expect(disclosure).toHaveAttribute('aria-expanded', 'false');
  await expect(page.locator('#gl-alert-history-info')).toHaveCount(0);

  await expect(page.locator('.gl-modal')).toHaveCount(3);
  await expect(page.locator('.gl-scrollbar-specimen')).toHaveCount(3);
});

test('Goalie robot domain keeps operation, battery, audio and safety signals independent', async ({ page }) => {
  await openAuthoredGoalie(page, 'iconography');
  await expect(page.locator('.gl-robot-panel')).toBeVisible();
  await expect(page.locator('.gl-mission-row')).toHaveCount(3);
  await expect(page.locator('.gl-mission-row--active')).toHaveCount(1);
  await expect(page.locator('.gl-battery-gallery .gl-battery-indicator')).toHaveCount(5);
  await expect(page.locator('.gl-marker-gallery article')).toHaveCount(4);

  const audio = page.locator('.gl-audio-control');
  await expect(audio).toHaveAttribute('aria-pressed', 'false');
  await audio.click();
  await expect(audio).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('.gl-emergency-control')).toHaveAccessibleName('비상모드');
  await expect(page.locator('#gl-emergency-contract')).toContainText('onRequestEmergency');
});

test('Goalie shell and quick toolbar expose location, disclosure and selection independently', async ({ page }) => {
  await openAuthoredGoalie(page, 'navigation');
  const navigation = page.locator('.gl-side-nav');
  await expect(navigation).toHaveAttribute('aria-label', '주요 메뉴');
  await expect(navigation.locator('.gl-side-nav__item')).toHaveCount(5);
  await expect(navigation.locator('[aria-current="page"]')).toHaveCount(1);
  await navigation.locator('[data-section="patrol"]').click();
  await expect(navigation.locator('[data-section="patrol"]')).toHaveAttribute('aria-current', 'page');

  const picker = page.locator('.gl-camera-layout-picker');
  await expect(picker).toHaveAttribute('role', 'radiogroup');
  await expect(picker.locator('[role="radio"]')).toHaveCount(4);
  await expect(picker.locator('[aria-checked="true"]')).toHaveCount(1);
  await picker.locator('[data-layout="six"]').click();
  await expect(picker.locator('[data-layout="six"]')).toHaveAttribute('aria-checked', 'true');

  const microphone = page.locator('.gl-quick-tool[aria-pressed]');
  await expect(microphone).toHaveAttribute('aria-pressed', 'false');
  await microphone.click();
  await expect(microphone).toHaveAttribute('aria-pressed', 'true');
  await page.locator('.gl-quick-toolbar__collapse').click();
  await expect(page.locator('.gl-edge-handle')).toHaveAttribute('aria-expanded', 'false');
  await page.locator('.gl-edge-handle').click();
  await expect(page.locator('.gl-quick-toolbar')).toBeVisible();
});

test('Goalie patrol inputs keep value, disclosure, period and duration independent', async ({ page }) => {
  await openAuthoredGoalie(page, 'input');

  const course = page.locator('.gl-select-trigger');
  await expect(course).toHaveAttribute('aria-expanded', 'false');
  await course.click();
  await expect(course).toHaveAttribute('aria-expanded', 'true');
  await expect(page.locator('#gl-course-list [role="option"]')).toHaveCount(4);
  await page.locator('#gl-course-list [data-value="2단지 A코스"]').click();
  await expect(course).toContainText('2단지 A코스');
  await expect(course).toHaveAttribute('aria-expanded', 'false');

  const periods = page.locator('.gl-segmented');
  await expect(periods.locator('[aria-checked="true"]')).toHaveCount(1);
  await periods.locator('[data-meridiem="am"]').click();
  await expect(periods.locator('[data-meridiem="am"]')).toHaveAttribute('aria-checked', 'true');

  const time = page.locator('.gl-time-trigger');
  await time.click();
  await page.locator('#gl-time-list [data-value="02 : 00"]').click();
  await expect(time).toContainText('02 : 00');

  const minuteOutput = page.locator('.gl-number-stepper output').first();
  await page.locator('.gl-number-stepper__actions [data-unit="minute"][data-delta="1"]').click();
  await expect(minuteOutput).toHaveText('1');
  await expect(page.locator('.gl-mission-card')).toHaveCount(4);
  await expect(page.locator('.gl-mission-card[aria-pressed="true"]')).toHaveCount(2);
});

test('Goalie patrol pattern preserves list selection, edit session and map context', async ({ page }) => {
  await openAuthoredGoalie(page, 'patrol');
  await expect(page.locator('.gl-course-list-card > button')).toHaveCount(3);
  await expect(page.locator('.gl-course-list-card > button[aria-pressed="true"]')).toHaveCount(1);
  await page.locator('.gl-course-list-card > button[data-course-id="1단지 B코스"]').click();
  await expect(page.locator('.gl-course-list-card > button[data-course-id="1단지 B코스"]')).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('.gl-patrol-editor .gl-mission-card')).toHaveCount(4);
  await expect(page.locator('.gl-patrol-map > img')).toBeVisible();
});

test('Goalie video pattern keeps query tree selection and player filename synchronized', async ({ page }) => {
  await openAuthoredGoalie(page, 'video');
  await expect(page.locator('.gl-video-tree [role="treeitem"]')).toHaveCount(11);
  const target = page.locator('.gl-video-tree [data-file="2024-05-23_00:33:24"]');
  await target.click();
  await expect(target).toHaveAttribute('aria-selected', 'true');
  await expect(page.locator('#gl-video-filename')).toHaveText('2024-05-23_00:33:24');
  await expect(page.locator('.gl-video-player__media')).toBeVisible();
});

test('Goalie operational templates change operation, audio and safety without changing shell composition', async ({ page }) => {
  await openAuthoredGoalie(page, 'templates');
  const picker = page.locator('.gl-template-mode-picker');
  await expect(picker.locator('[role="radio"]')).toHaveCount(4);
  await picker.locator('[data-template-mode="speaking"]').click();
  await expect(page.locator('.gl-ops-template')).toHaveAttribute('data-mode', 'speaking');
  await expect(page.locator('.gl-ops-mic')).toBeVisible();
  await picker.locator('[data-template-mode="emergency"]').click();
  await expect(page.locator('.gl-ops-template')).toHaveAttribute('data-mode', 'emergency');
  await expect(page.locator('.gl-camera-composition figure')).toHaveCount(4);
  await expect(page.locator('.gl-ops-map__marker')).toHaveAttribute('src', './assets/goalie/map-marker-emergency-glow.svg');
});

test('authored Goalie pages pass axe and remain bounded at review widths', async ({ page }) => {
  test.setTimeout(120_000);
  for (const width of [1280, 390, 320]) {
    await page.setViewportSize({ width, height: 900 });
    for (const pageId of ['colors', 'iconography', 'button', 'input', 'status', 'navigation', 'patrol', 'video', 'templates']) {
      await openAuthoredGoalie(page, pageId);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      expect(overflow, `${pageId} overflows at ${width}px`).toBeLessThanOrEqual(1);
      const results = await new AxeBuilder({ page }).include('[data-goalie-pages]').analyze();
      expect(results.violations, `${pageId} axe violations at ${width}px`).toEqual([]);
    }
  }
});

test('Goalie release assets are local and component tokens resolve', async () => {
  const root = process.cwd();
  const assetNames = [
    'icon-plus-primary-sm.svg', 'icon-plus-danger-sm.svg', 'switch-knob-manual.svg',
    'alert-info-base.svg', 'alert-chevron.svg', 'notification-bell.svg',
    'modal-divider-horizontal.svg', 'header-logo.png', 'nav-home.svg',
    'nav-statistics.png', 'toolbar-layout.png', 'layout-six-selected.png',
    'handle-expand-default.png', 'signal-bars.png', 'battery-20.svg',
    'map-marker-emergency-glow.svg', 'microphone-on-white.svg',
    'emergency-icon.png',
    'select-chevron-down.svg', 'select-chevron-up.svg', 'time-clock.svg',
    'time-chevron-down.svg', 'time-chevron-up.svg', 'spinner-up.svg', 'spinner-down.svg',
    'patrol-map-routes.png', 'patrol-route-line.svg', 'patrol-alternate-line.svg',
    'video-park.jpg', 'video-calendar.svg', 'video-timeline.svg', 'map-campus.jpg',
    'camera-front.jpg', 'camera-left.jpg', 'camera-rear.jpg', 'camera-right.jpg',
  ];
  for (const name of assetNames) {
    const asset = path.join(root, 'assets', 'goalie', name);
    expect(fs.existsSync(asset), `${name} must be committed locally`).toBe(true);
    expect(fs.statSync(asset).size, `${name} must not be empty`).toBeGreaterThan(20);
  }

  const tokens = fs.readFileSync(path.join(root, 'tokens', 'goalie-tokens.css'), 'utf8');
  const component = fs.readFileSync(path.join(root, 'components', 'goalie.css'), 'utf8');
  const declared = new Set([...tokens.matchAll(/(--goalie-[\w-]+)\s*:/g)].map((match) => match[1]));
  const referenced = new Set([...component.matchAll(/var\((--goalie-[\w-]+)/g)].map((match) => match[1]));
  expect([...referenced].filter((token) => !declared.has(token)).sort()).toEqual([]);
});
