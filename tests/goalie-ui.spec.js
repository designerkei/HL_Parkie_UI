const fs = require('node:fs');
const path = require('node:path');
const { test, expect } = require('@playwright/test');
const AxeBuilder = require('@axe-core/playwright').default;

const AUTHORED_PAGES = [
  'overview', 'systemsummary', 'principles', 'colors', 'typography', 'spacing',
  'iconography', 'button', 'input', 'status', 'navigation', 'patrol', 'video', 'templates', 'brand',
];

async function openAuthoredGoalie(page, pageId) {
  await page.goto(`/#/goalie/${pageId}`);
  await expect(page).toHaveURL(new RegExp(`#\/goalie\/${pageId}$`));
  await expect(page.locator('[data-goalie-pages]')).toHaveAttribute('data-goalie-page', pageId);
  await expect(page.locator('[data-goalie-pages]')).toHaveAttribute('lang', 'ko');
}

test('authored Goalie foundation and component pages render on public routes', async ({ page }) => {
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
  expect(registry.skeleton).toBe(false);
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
  await expect(page.locator('.gl-patrol-map > img')).toHaveCount(3);
  await expect(page.locator('.gl-patrol-map__base')).toBeVisible();
  await expect(page.locator('.gl-patrol-map__route')).toBeVisible();
  await expect(page.locator('.gl-patrol-map__alternate')).toBeVisible();
});

test('Goalie video pattern keeps query tree selection and player filename synchronized', async ({ page }) => {
  await openAuthoredGoalie(page, 'video');
  await expect(page.locator('.gl-video-tree [role="treeitem"]')).toHaveCount(11);
  await expect(page.locator('.gl-video-tree [role="treeitem"][tabindex="0"]')).toHaveCount(1);
  const initial = page.locator('.gl-video-tree [data-file="2024-05-23_00:23:24"]');
  await initial.focus();
  await initial.press('ArrowDown');
  await expect(page.locator('.gl-video-tree [data-file="2024-05-23_00:28:24"]')).toBeFocused();
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

test('Goalie composite controls implement roving focus and arrow-key selection', async ({ page }) => {
  await openAuthoredGoalie(page, 'input');
  const inputPeriods = page.locator('.gl-segmented [role="radio"]');
  await expect(inputPeriods).toHaveCount(2);
  await expect(page.locator('.gl-segmented [role="radio"][tabindex="0"]')).toHaveCount(1);
  const pm = page.locator('.gl-segmented [data-meridiem="pm"]');
  await pm.focus();
  await pm.press('ArrowLeft');
  const am = page.locator('.gl-segmented [data-meridiem="am"]');
  await expect(am).toHaveAttribute('aria-checked', 'true');
  await expect(am).toBeFocused();

  await openAuthoredGoalie(page, 'navigation');
  const single = page.locator('.gl-camera-layout-picker [data-layout="single"]');
  await single.focus();
  await single.press('ArrowRight');
  const quad = page.locator('.gl-camera-layout-picker [data-layout="quad"]');
  await expect(quad).toHaveAttribute('aria-checked', 'true');
  await expect(quad).toBeFocused();
  await expect(page.locator('.gl-camera-layout-picker [role="radio"][tabindex="0"]')).toHaveCount(1);

  await openAuthoredGoalie(page, 'templates');
  const home = page.locator('.gl-template-mode-picker [data-template-mode="home"]');
  await home.focus();
  await home.press('End');
  const emergency = page.locator('.gl-template-mode-picker [data-template-mode="emergency"]');
  await expect(emergency).toHaveAttribute('aria-checked', 'true');
  await expect(emergency).toBeFocused();
  const templateSwitch = page.locator('.gl-ops-side-panel .gl-switch');
  await expect(templateSwitch).toHaveAttribute('aria-checked', 'true');
  await templateSwitch.press('Space');
  await expect(templateSwitch).toHaveAttribute('aria-checked', 'false');
});

test('authored Goalie routes have no runtime, resource, image or ID-reference failures', async ({ page }) => {
  test.setTimeout(120_000);
  const consoleErrors = [];
  const pageErrors = [];
  const failedResponses = [];
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => pageErrors.push(error.message));
  page.on('response', (response) => {
    if (response.status() >= 400) failedResponses.push(`${response.status()} ${response.url()}`);
  });

  for (const pageId of AUTHORED_PAGES) {
    await openAuthoredGoalie(page, pageId);
    await page.waitForLoadState('networkidle');
    const audit = await page.locator('[data-goalie-pages]').evaluate((root) => {
      const all = Array.from(root.querySelectorAll('*'));
      const ids = all.map((element) => element.id).filter(Boolean);
      const duplicateIds = [...new Set(ids.filter((id, index) => ids.indexOf(id) !== index))];
      const brokenImages = all
        .filter((element) => element instanceof HTMLImageElement && (!element.complete || element.naturalWidth === 0))
        .map((image) => image.getAttribute('src'));
      const missingReferences = [];
      for (const element of all) {
        for (const attribute of ['aria-labelledby', 'aria-describedby', 'aria-controls']) {
          const value = element.getAttribute(attribute);
          if (!value) continue;
          for (const id of value.trim().split(/\s+/)) {
            if (!document.getElementById(id)) missingReferences.push(`${attribute}:${id}`);
          }
        }
      }
      return { duplicateIds, brokenImages, missingReferences };
    });
    expect(audit, `${pageId} DOM integrity`).toEqual({ duplicateIds: [], brokenImages: [], missingReferences: [] });
  }

  expect(consoleErrors, 'console errors').toEqual([]);
  expect(pageErrors, 'uncaught page errors').toEqual([]);
  expect(failedResponses, 'HTTP failures').toEqual([]);
});

test('Goalie interactive targets meet the WCAG 2.2 minimum target size', async ({ page }) => {
  test.setTimeout(120_000);
  for (const width of [1280, 390, 320]) {
    await page.setViewportSize({ width, height: 900 });
    for (const pageId of AUTHORED_PAGES) {
      await openAuthoredGoalie(page, pageId);
      const undersized = await page.locator('[data-goalie-pages]').evaluate((root) => Array.from(root.querySelectorAll('button, [href], input, select, textarea'))
        .filter((element) => {
          const style = getComputedStyle(element);
          const rect = element.getBoundingClientRect();
          return !element.disabled && element.getAttribute('aria-disabled') !== 'true' && style.display !== 'none' && style.visibility !== 'hidden' && rect.width > 0 && rect.height > 0 && (rect.width < 24 || rect.height < 24);
        })
        .map((element) => {
          const rect = element.getBoundingClientRect();
          return `${element.tagName.toLowerCase()}.${element.className || '(no-class)'} ${Math.round(rect.width)}x${Math.round(rect.height)}`;
        }));
      expect(undersized, `${pageId} undersized targets at ${width}px`).toEqual([]);
    }
  }
});

test('authored Goalie pages pass axe and remain bounded at review widths', async ({ page }) => {
  test.setTimeout(120_000);
  for (const width of [1280, 390, 320]) {
    await page.setViewportSize({ width, height: 900 });
    for (const pageId of ['colors', 'iconography', 'button', 'input', 'status', 'navigation', 'patrol', 'video', 'templates', 'brand']) {
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
    'mission-delete.png', 'patrol-map-routes.png', 'patrol-route-line.svg', 'patrol-alternate-line.svg',
    'patrol-route-overlay.svg', 'patrol-alternate-overlay.svg', 'patrol-waypoint.svg',
    'video-park.jpg', 'video-calendar.svg', 'video-timeline.svg', 'video-clock.svg',
    'video-folder.svg', 'video-folder-active.svg', 'video-tree-chevron-up.svg',
    'video-tree-chevron-down.svg', 'video-tree-chevron-active.svg', 'video-play.svg',
    'video-skip.svg', 'video-playback-chevron.svg', 'map-campus.png',
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

/* The guide departs from the delivered Figma in exactly one place: filled
   buttons and alert banners carry dark ink where the spec sets white. Used as
   given, white lands between 1.73:1 and 3.51:1 over the delivered fills — short
   of 4.5:1 on every state, red included. The departure is correct; leaving it
   unstated is not, because a reader comparing the two concludes the build is
   wrong. This asserts the statement exists and still names real numbers. */
test('the deliberate departure from the delivered button spec is stated on the page', async ({ page }) => {
  for (const pageId of ['button', 'status']) {
    await page.goto(`/#/goalie/${pageId}`);
    await expect(page.locator('[data-guide-root] h1')).toBeVisible();

    const note = page.locator('[data-spec-deviation]');
    await expect(note, `${pageId} must state the departure`).toHaveCount(1);
    await expect(note).toContainText('흰색');

    /* The first version of this note said white failed on every filled state,
       which was wrong: red pressed reaches 4.49:1 and clears the 3:1 large-text
       threshold, and dark ink is actually worse there at 3.61:1. A note that
       over-claims is as misleading as no note, so the gate now requires the
       statement to be state-specific and to admit the unresolved case. */
    await expect(note, 'the note must distinguish states, not generalise')
      .toContainText('4.49');
    await expect(note, 'it must say dark ink is worse on pressed')
      .toContainText('3.61');

    const evidence = await page.locator('[data-spec-deviation] ~ code').textContent();
    for (const ratio of ['2.02', '2.93', '3.51', '4.49', '8.02', '5.54', '4.62', '3.61']) {
      expect(evidence, `${pageId} evidence must quote ${ratio}:1`).toContain(ratio);
    }
    /* Large text is judged at 3:1, and omitting that is how the first version
       reached a wrong conclusion. */
    expect(evidence, 'the large-text threshold must be stated').toMatch(/3:1/);
  }

  /* And the build must actually be doing what the note claims — dark ink, not
     white — so the statement cannot drift away from the implementation. */
  await page.goto('/#/goalie/button');
  await expect(page.locator('[data-guide-root] h1')).toBeVisible();
  const filled = await page.evaluate(() => {
    const el = [...document.querySelectorAll('main button, main [class*="gl-button"]')]
      .find((n) => {
        const bg = getComputedStyle(n).backgroundColor;
        const m = bg.match(/\d+/g);
        return m && Number(m[2]) > 200 && Number(m[0]) < 60;
      });
    return el ? getComputedStyle(el).color : null;
  });
  expect(filled, 'a filled cyan button must exist to check').not.toBeNull();
  const channels = (filled.match(/\d+/g) || []).map(Number);
  expect(
    channels.every((c) => c < 120),
    `filled label should be dark ink as the note states, got ${filled}`,
  ).toBe(true);
});
