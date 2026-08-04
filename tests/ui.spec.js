const { test, expect } = require('@playwright/test');

async function openComponent(page, label) {
  const item = page.locator('nav.pk-scroll [data-nav-id]').filter({ hasText: label }).first();
  await expect(item).toBeVisible();
  await item.click();
}

test.beforeEach(async ({ page }) => {
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/');
  await expect(page.locator('h1')).toBeVisible();
  page.__runtimeErrors = errors;
});

test.afterEach(async ({ page }) => {
  expect(page.__runtimeErrors, 'the UI must not throw runtime errors').toEqual([]);
});

test('primary actions use the accessible Parkie action palette', async ({ page }) => {
  await openComponent(page, '버튼');
  const button = page.locator('.pk-control-stage .pk-button').first();
  await expect(button).toBeVisible();
  await expect(button).toHaveCSS('background-color', 'rgb(0, 170, 255)');
  await expect(button).toHaveCSS('color', 'rgb(6, 34, 46)');
  await expect(button).toHaveCSS('height', '36px');

  const disabled = page.locator('.pk-button.is-disabled');
  await expect(disabled).toHaveCSS('background-color', 'rgba(255, 255, 255, 0.1)');
  await expect(page.locator('.pk-button.pk-button--danger')).toHaveCSS(
    'background-color',
    'rgb(223, 0, 0)'
  );
  await expect(page.locator('.pk-button.is-hover')).toHaveCSS(
    'background-color',
    'rgb(22, 220, 242)'
  );
  await expect(page.locator('.pk-button.is-pressed')).toHaveCSS(
    'background-color',
    'rgb(0, 155, 233)'
  );
});

test('icon controls, segment and switch keep their reference geometry', async ({ page }) => {
  await openComponent(page, '버튼');
  const icon = page.locator('.pk-icon-button').first();
  await expect(icon).toHaveCSS('width', '24px');
  await expect(icon).toHaveCSS('height', '24px');

  await openComponent(page, '세그먼트');
  const segment = page.locator('.pk-segmented').first();
  await expect(segment).toHaveCSS('width', '200px');
  await expect(segment).toHaveCSS('height', '36px');

  await openComponent(page, '선택 컨트롤');
  const toggle = page.locator('.pk-switch').first();
  const box = await toggle.boundingBox();
  expect(box.width).toBe(36);
  expect(box.height).toBe(28);
});

test('robot card summary is exactly 266 by 64 and retains expandable controls', async ({ page }) => {
  await openComponent(page, '로봇 카드');
  const card = page.locator('.pk-robot-control-card').first();
  const summary = card.locator('.pk-robot-control-card__summary');
  const cardBox = await card.boundingBox();
  const summaryBox = await summary.boundingBox();
  expect(Math.round(cardBox.width)).toBe(266);
  expect(Math.round(summaryBox.height)).toBe(64);
  await expect(summary.locator('.pk-robot-control-card__signal')).toHaveCSS('width', '32px');

  const expanded = page.locator('.pk-robot-control-card.is-expanded');
  await expect(expanded.locator('.pk-robot-control-card__details')).toBeVisible();
  await expect(expanded.locator('.pk-robot-command__action')).toHaveCount(2);
  /* Weak signal is a degree, not a warning: it was warning yellow and is now
     the neutral ink, with the arc count carrying the strength. Battery below
     has always worked this way, which is where the rule came from. */
  await expect(expanded.locator('.pk-robot-control-card__signal')).toHaveCSS(
    'color',
    'rgba(255, 255, 255, 0.95)'
  );
  await expect(expanded.locator('.pk-robot-control-card__battery')).toHaveCSS(
    'color',
    'rgb(244, 244, 244)'
  );
});

test('compact and emergency modal recipes match supplied dimensions', async ({ page }) => {
  await openComponent(page, '모달');
  const compact = page.locator('.pk-modal-shell--sm').first();
  const compactBox = await compact.boundingBox();
  expect(Math.round(compactBox.width)).toBe(306);
  expect(Math.round(compactBox.height)).toBe(196);

  const emergency = page.locator('.pk-modal-shell--reference-alert');
  const emergencyBox = await emergency.boundingBox();
  expect(Math.round(emergencyBox.width)).toBe(500);
  expect(Math.round(emergencyBox.height)).toBe(320);
  const actionBox = await emergency.locator('.pk-modal-button').boundingBox();
  expect(Math.round(actionBox.width)).toBe(200);
  expect(Math.round(actionBox.height)).toBe(48);
  await expect(emergency.locator('.pk-modal-button')).toHaveCSS('background-color', 'rgb(223, 0, 0)');
  await expect(emergency.locator('.pk-modal-button')).toHaveCSS('color', 'rgb(255, 255, 255)');

  await page.getByRole('tab', { name: '관리자 인증' }).click();
  const authBox = await page.getByRole('group', { name: '서비스 활성화 인증' }).boundingBox();
  expect(Math.round(authBox.width)).toBe(306);
  expect(Math.round(authBox.height)).toBe(196);

  await page.getByRole('tab', { name: '점검 항목' }).click();
  const checklistBox = await page.locator('.pk-modal-shell--lg').boundingBox();
  expect(Math.round(checklistBox.width)).toBe(306);
  expect(Math.round(checklistBox.height)).toBe(240);

  await page.getByRole('tab', { name: '처리 중' }).click();
  const progressBox = await page.getByRole('status', { name: '서비스 초기화 중…' }).boundingBox();
  expect(Math.round(progressBox.width)).toBe(306);
  expect(Math.round(progressBox.height)).toBe(196);

  await page.getByRole('tab', { name: '완료' }).click();
  const resultBox = await page.getByRole('group', { name: '서비스 초기화 완료' }).boundingBox();
  expect(Math.round(resultBox.width)).toBe(306);
  expect(Math.round(resultBox.height)).toBe(196);
});

test('top bar controls and site dropdown follow the supplied shell recipe', async ({ page }) => {
  await openComponent(page, '상단 바');
  const appbar = page.locator('.pk-appbar-stage > .pk-appbar');
  await expect(appbar).toHaveCSS('height', '46px');
  await expect(appbar.locator('.pk-role-segment')).toHaveCSS('width', '200px');
  await expect(appbar.locator('.pk-site-select')).toHaveCSS('width', '270px');
  await expect(appbar.locator('.pk-app-search')).toHaveCSS('width', '460px');
  await expect(appbar.getByText('서비스 활성화')).toBeVisible();
  await expect(appbar.getByText('KOR')).toBeVisible();

  const select = appbar.locator('.pk-site-select-button');
  await select.click();
  await expect(appbar.locator('.pk-site-menu')).toBeVisible();
  await expect(appbar.locator('.pk-site-option')).toHaveCount(3);
});

test('latest event stroke is 50 percent and feed rows keep source sizes', async ({ page }) => {
  await openComponent(page, '이벤트 피드 행');
  const latest = page.locator('.pk-feed-item--latest').first();
  const box = await latest.boundingBox();
  expect(Math.round(box.width)).toBe(448);
  expect(Math.round(box.height)).toBe(48);
  await expect(latest).toHaveCSS('border-color', 'rgba(15, 220, 76, 0.5)');

  const rows = page.locator('.pk-feed-list').first().locator('.pk-feed-item');
  await expect(rows.nth(0).locator('.pk-feed-status')).toHaveCSS('color', 'rgb(15, 220, 76)');
  await expect(rows.nth(1).locator('.pk-feed-status')).toHaveCSS('color', 'rgb(124, 199, 232)');
  await expect(rows.nth(2).locator('.pk-feed-status')).toHaveCSS('color', 'rgb(245, 222, 46)');
  await expect(rows.nth(3)).toHaveCSS('background-color', 'rgba(223, 0, 0, 0.3)');
  await expect(rows.nth(3)).toHaveCSS('color', 'rgb(255, 255, 255)');
});

test('critical views remain usable at a narrower viewport', async ({ page }) => {
  await page.setViewportSize({ width: 900, height: 900 });
  await openComponent(page, '로봇 카드');
  const card = page.locator('.pk-robot-control-card').first();
  await expect(card).toBeVisible();
  expect((await card.boundingBox()).width).toBeLessThanOrEqual(266);

  await openComponent(page, '모달');
  await expect(page.locator('.pk-modal-shell--sm').first()).toBeVisible();
});

test('the operations shell controls update their exposed UI state', async ({ page }) => {
  await openComponent(page, '관제 앱 셸');
  const shell = page.locator('.pk-shell-frame');
  await expect(shell).toBeVisible();

  const service = shell.getByRole('switch', { name: '서비스 활성화' });
  const initialServiceState = await service.getAttribute('aria-checked');
  await service.click();
  await expect(service).toHaveAttribute(
    'aria-checked',
    initialServiceState === 'true' ? 'false' : 'true'
  );

  const siteSelect = shell.locator('.pk-site-select-button');
  await siteSelect.click();
  await expect(shell.locator('.pk-site-menu')).toBeVisible();
  await shell.locator('.pk-site-option').nth(1).click();
  await expect(siteSelect).toContainText('충북도청 운영존');

  const robotToggle = shell.locator('.pk-robot-card-toggle').first();
  const initialExpanded = await robotToggle.getAttribute('aria-expanded');
  await robotToggle.click();
  await expect(robotToggle).toHaveAttribute(
    'aria-expanded',
    initialExpanded === 'true' ? 'false' : 'true'
  );
});

test('Parkie iconography exposes sourced icons and all interaction states', async ({ page }) => {
  await openComponent(page, '아이콘');
  await expect(page.locator('h1')).toContainText('아이콘');

  const rows = page.locator('.pk-icon-row');
  await expect(rows).toHaveCount(30);
  await expect(page.locator('.pk-icon-row.is-interaction-axis')).toHaveCount(24);
  await expect(page.locator('.pk-icon-row.is-semantic-axis')).toHaveCount(6);
  /* Interaction rows carry six states each. Semantic rows are not uniform:
     battery and connection document five states, the four safety rows four
     emphasis levels. It used to read (6 * 4), which is why adding the fifth
     connection state failed here. */
  await expect(page.locator('.pk-icon-state')).toHaveCount((24 * 6) + (2 * 5) + (4 * 4));
  await expect(page.locator('.pk-domain-icon')).toHaveCount(22);

  await expect(page.locator('.pk-icon-source.is-original')).toHaveCount(5);
  await expect(page.locator('.pk-icon-source.is-custom')).toHaveCount(6);
  await expect(page.locator('.pk-icon-source.is-ms')).toHaveCount(19);
  await expect(page.locator('.pk-icon-source.is-ms').first()).toHaveText('Adopted');
  await expect(page.locator('.pk-icon-qa')).toHaveCount(0);
  expect(await page.locator('main').innerText()).not.toMatch(/\bMS\b/);

  const interactionStates = [
    'Default',
    'Hover',
    'Focus',
    'Pressed',
    'Selected / On',
    'Disabled',
  ];
  const firstRow = page.locator('.pk-icon-row.is-interaction-axis').first();
  await expect(firstRow).toBeVisible();
  await expect(firstRow.locator('.pk-icon-spec-state')).toHaveText(interactionStates);
  await expect(firstRow.locator('.is-enabled')).toHaveCSS('color', 'rgba(255, 255, 255, 0.7)');
  await expect(firstRow.locator('.is-hover')).toHaveCSS('color', 'rgba(255, 255, 255, 0.85)');
  await expect(firstRow.locator('.is-focus')).toHaveCSS('color', 'rgba(255, 255, 255, 0.95)');
  await expect(firstRow.locator('.is-pressed')).toHaveCSS('color', 'rgb(255, 255, 255)');
  await expect(firstRow.locator('.is-selected')).toHaveCSS('color', 'rgb(0, 170, 255)');
  await expect(firstRow.locator('.is-disabled')).toHaveCSS('color', 'rgba(255, 255, 255, 0.35)');

  /* Pinning the values above is not enough on its own: they were all 0.95 once,
     and every assertion still passed. Engagement has to actually climb. */
  const stateAlpha = async (className) => {
    const colour = await firstRow.locator(className).evaluate((el) => getComputedStyle(el).color);
    const parts = colour.match(/[\d.]+/g);
    return parts.length > 3 ? Number(parts[3]) : 1;
  };
  const ladder = [
    await stateAlpha('.is-enabled'),
    await stateAlpha('.is-hover'),
    await stateAlpha('.is-focus'),
    await stateAlpha('.is-pressed'),
  ];
  expect(new Set(ladder).size, `enabled/hover/focus/pressed must differ: ${ladder}`).toBe(4);
  expect([...ladder].sort((a, b) => a - b), `engagement must brighten: ${ladder}`).toEqual(ladder);

  const batteryRow = rows.filter({ hasText: 'Battery' });
  await expect(batteryRow).toHaveCount(1);
  await expect(batteryRow).toHaveClass(/is-semantic-axis/);
  /* Both axes carry five states and the same labels the domain grid uses —
     they are generated from one array now, so a divergence here means the two
     surfaces have been written out separately again. */
  await expect(batteryRow.locator('.pk-icon-spec-state')).toHaveText([
    '충분 · 26% 이상',
    '중간 · 25–11%',
    '위험 · 10% 이하',
    '충전 중 · 낮음',
    '충전 중 · 높음',
  ]);
  await expect(batteryRow.locator('.pk-icon-state').nth(0)).toHaveCSS('color', 'rgb(244, 244, 244)');
  await expect(batteryRow.locator('.pk-icon-state').nth(1)).toHaveCSS('color', 'rgb(244, 244, 244)');
  await expect(batteryRow.locator('.pk-icon-state').nth(2)).toHaveCSS('background-color', 'rgb(238, 0, 0)');
  await expect(batteryRow.locator('.pk-icon-state').nth(3)).toHaveCSS('color', 'rgb(0, 192, 0)');
  await expect(batteryRow.locator('.pk-icon-state').nth(4)).toHaveCSS('color', 'rgb(0, 192, 0)');

  const connectionRow = rows.filter({ hasText: 'Connection' });
  await expect(connectionRow).toHaveCount(1);
  await expect(connectionRow).toHaveClass(/is-semantic-axis/);
  await expect(connectionRow.locator('.pk-icon-spec-state')).toHaveText([
    '연결 양호',
    '신호 약함',
    '재연결 중',
    '연결 끊김',
    '오프라인',
  ]);
  /* Degree is neutral, severity is not — and offline is its own glyph now, not
     the lost mark in a different colour. */
  await expect(connectionRow.locator('.pk-icon-state').nth(0)).toHaveCSS('color', 'rgba(255, 255, 255, 0.95)');
  await expect(connectionRow.locator('.pk-icon-state').nth(1)).toHaveCSS('color', 'rgba(255, 255, 255, 0.95)');
  await expect(connectionRow.locator('.pk-icon-state').nth(2)).toHaveCSS('color', 'rgba(255, 255, 255, 0.95)');
  await expect(connectionRow.locator('.pk-icon-state').nth(4)).toHaveCSS('color', 'rgb(161, 161, 170)');

  const batteryStates = page.locator('.pk-domain-grid').first().locator('.pk-domain-icon');
  await expect(batteryStates).toHaveCount(5);
  await expect(batteryStates.nth(0).locator('rect')).toHaveCSS('fill', 'rgb(244, 244, 244)');
  await expect(batteryStates.nth(1).locator('rect')).toHaveCSS('fill', 'rgb(244, 244, 244)');
  await expect(batteryStates.nth(2).locator('rect')).toHaveCSS('fill', 'rgb(238, 0, 0)');
  await expect(batteryStates.nth(3).locator('rect')).toHaveCSS('fill', 'rgb(0, 192, 0)');
  await expect(batteryStates.nth(3).locator('path').last()).toHaveCSS('fill', 'rgb(255, 255, 255)');
  await expect(page.locator('.pk-domain-icon.is-charging circle')).toHaveCount(0);
});

/* Reads the archive without going back through the writer that produced it, so
   a malformed header fails here instead of round-tripping cleanly. Entries are
   stored, never deflated, which is what makes a reader this small correct. */
function readStoredZip(buffer) {
  const entries = new Map();
  let at = 0;
  while (at + 4 <= buffer.length && buffer.readUInt32LE(at) === 0x04034b50) {
    const method = buffer.readUInt16LE(at + 8);
    const size = buffer.readUInt32LE(at + 18);
    const nameLength = buffer.readUInt16LE(at + 26);
    const extraLength = buffer.readUInt16LE(at + 28);
    const name = buffer.subarray(at + 30, at + 30 + nameLength).toString('utf8');
    const start = at + 30 + nameLength + extraLength;
    if (method !== 0) throw new Error(`${name} is not stored`);
    entries.set(name, buffer.subarray(start, start + size).toString('utf8'));
    at = start + size;
  }
  if (!entries.size) throw new Error('no local file headers found');
  return entries;
}

test('the icon page downloads every documented icon as tool-ready SVG', async ({ page }) => {
  await openComponent(page, '아이콘');

  const button = page.locator('[data-icon-download]');
  await expect(button).toBeVisible();

  // One file per icon, not one per state: the label must track the catalogue.
  const documented = await page.locator('.pk-icon-row').count();
  await expect(button).toHaveText(/SVG \d+개 내려받기/);
  const advertised = Number((await button.innerText()).match(/(\d+)/)[1]);
  expect(advertised).toBeGreaterThanOrEqual(documented);

  const [download] = await Promise.all([
    page.waitForEvent('download'),
    button.click(),
  ]);
  expect(download.suggestedFilename()).toBe('parkie-icons.zip');

  const stream = await download.createReadStream();
  const chunks = [];
  for await (const chunk of stream) chunks.push(chunk);
  const entries = readStoredZip(Buffer.concat(chunks));

  const svgNames = [...entries.keys()].filter((name) => name.startsWith('svg/'));
  expect(svgNames.length).toBe(advertised);
  expect(entries.has('README.txt')).toBe(true);

  // currentColor and var() are the two things that do not survive the trip into
  // a design tool; neither may reach the archive.
  const unresolved = svgNames.filter((name) => (
    entries.get(name).includes('currentColor') || entries.get(name).includes('var(')
  ));
  expect(unresolved).toEqual([]);

  for (const name of svgNames) {
    expect(entries.get(name), `${name} must be a standalone svg`).toMatch(/^<svg xmlns="http:\/\/www\.w3\.org\/2000\/svg"/);
    expect(entries.get(name), `${name} must declare a viewBox`).toMatch(/viewBox="[\d\s.]+"/);
  }

  // Semantic fills are the ones that were silently dropping out as var().
  expect(entries.get('svg/BatteryChargingHigh.svg')).toContain('#00C000');
  expect(entries.get('svg/BatteryCritical.svg')).toContain('#EE0000');

  // The manifest has to carry the state colours the geometry cannot.
  const readme = entries.get('README.txt');
  for (const token of ['--parkie-icon-default', '--parkie-icon-hover', '--parkie-icon-pressed', '--parkie-icon-disabled']) {
    expect(readme, `${token} must be documented`).toContain(token);
  }
});

test('the icon page downloads its state matrix as one sheet per category', async ({ page }) => {
  await openComponent(page, '아이콘');

  const button = page.locator('[data-icon-sheet-download]');
  await expect(button).toBeVisible();

  /* The sheets have to hold the whole page between them, so the page is what
     they are measured against — not numbers written down here that would rot
     the next time a row or a category is added. */
  const pageRows = await page.locator('.pk-icon-row').count();
  const pageCells = await page.locator('.pk-icon-state').count();
  const slugs = await page.locator('[data-icon-group]').evaluateAll((sections) => sections
    .filter((section) => section.querySelector('.pk-icon-row'))
    .map((section) => section.dataset.iconGroup));
  const columnLabels = await page.locator('.pk-icon-row.is-interaction-axis').first()
    .locator('.pk-icon-spec-state').allInnerTexts();

  const [download] = await Promise.all([
    page.waitForEvent('download'),
    button.click(),
  ]);
  expect(download.suggestedFilename()).toBe('parkie-icon-sheets.zip');

  const stream = await download.createReadStream();
  const chunks = [];
  for await (const chunk of stream) chunks.push(chunk);
  const entries = readStoredZip(Buffer.concat(chunks));

  const svgNames = [...entries.keys()].filter((name) => name.endsWith('.svg'));
  expect(entries.has('README.txt'), 'the archive must carry its manifest').toBe(true);
  expect(svgNames, 'one sheet per documented category, numbered in page order')
    .toEqual(slugs.map((slug, index) => `${String(index + 1).padStart(2, '0')}-${slug}.svg`));

  // Nothing a design tool cannot read may reach any of the files.
  for (const name of svgNames) {
    const text = entries.get(name);
    expect(text, `${name}: currentColor must be resolved`).not.toContain('currentColor');
    expect(text, `${name}: custom properties must be resolved`).not.toContain('var(');
    expect(text, `${name}: paint attributes carry no alpha channel`)
      .not.toMatch(/(?:fill|stroke)="rgba?\(/);
  }

  const parse = (source) => page.evaluate((text) => {
    const doc = new DOMParser().parseFromString(text, 'image/svg+xml');
    if (doc.querySelector('parsererror')) return { error: 'not well-formed XML' };
    const root = doc.documentElement;
    const cellOf = (id) => root.querySelector(`g[id="${id}"]`);
    const describe = (id) => {
      const cell = cellOf(id);
      if (!cell) return null;
      const rects = [...cell.querySelectorAll(':scope > rect')];
      const paint = [...cell.querySelectorAll('path, rect, circle, ellipse, line, polygon, polyline')]
        .map((node) => `${node.getAttribute('fill') || ''}|${node.getAttribute('fill-opacity') || ''}`
          + `|${node.getAttribute('stroke') || ''}|${node.getAttribute('stroke-opacity') || ''}`)
        .join(';');
      return {
        ring: rects.some((r) => r.getAttribute('fill') === 'none' && r.getAttribute('stroke-width')),
        plate: rects.some((r) => (r.getAttribute('fill') || 'none') !== 'none'),
        paint,
      };
    };
    return {
      blocks: [...root.querySelectorAll(':scope > g[id]')].map((g) => g.id),
      rows: root.querySelectorAll(':scope > g[id] > g[id]').length,
      cells: root.querySelectorAll(':scope > g[id] > g[id] > g[id]').length,
      texts: [...root.querySelectorAll('text')].map((t) => t.textContent.trim()),
      states: ['Default', 'Hover', 'Focus', 'Pressed', 'Selected-On', 'Disabled']
        .map((state) => [state, describe(`Home-${state}`)]),
    };
  }, source);

  const sheets = [];
  for (const name of svgNames) sheets.push([name, await parse(entries.get(name))]);

  for (const [name, sheet] of sheets) {
    expect(sheet.error, `${name} must be well-formed`).toBeUndefined();
    /* One category per file, and the block is named for the category, so a
       sheet cannot quietly carry someone else's rows. */
    expect(sheet.blocks, `${name} must hold exactly its own category`)
      .toEqual([name.replace(/^\d+-|\.svg$/g, '')]);
  }

  /* The assertion that matters most once the export is split. Every individual
     sheet can be perfectly well-formed while a whole category is missing from
     the archive, and nothing above would notice — only the total does. */
  const totalRows = sheets.reduce((sum, [, sheet]) => sum + sheet.rows, 0);
  const totalCells = sheets.reduce((sum, [, sheet]) => sum + sheet.cells, 0);
  expect(totalRows, 'every documented row must reach some sheet').toBe(pageRows);
  expect(totalCells, 'every documented cell must reach some sheet').toBe(pageCells);

  /* Home lives in the first category; its six states are where the chrome is
     checked, because the ring and the plates are container styling that cannot
     travel in a per-icon export at all. That is the reason a sheet exists. */
  const home = sheets.find(([, sheet]) => sheet.states.every(([, cell]) => cell));
  expect(home, 'a sheet must carry the Home row to measure').toBeTruthy();
  const [homeName, homeSheet] = home;
  const states = Object.fromEntries(homeSheet.states);

  expect(states.Focus.ring, 'focus must draw its ring').toBe(true);
  expect(states.Pressed.plate, 'pressed must draw its plate').toBe(true);
  expect(states['Selected-On'].plate, 'selected must draw its plate').toBe(true);
  expect(states.Default.ring, 'default has no ring').toBe(false);
  expect(states.Default.plate, 'default has no plate').toBe(false);

  const paints = homeSheet.states.map(([, cell]) => cell.paint);
  expect(new Set(paints).size, `six states must paint six ways: ${paints.length}`).toBe(6);

  // Labels are what make it readable as a table rather than a pile of glyphs.
  for (const label of columnLabels) {
    expect(homeSheet.texts, `${homeName}: column ${label} must be labelled`).toContain(label.trim());
  }
  expect(homeSheet.texts, 'rows must carry their Korean name').toContain('홈');
  expect(homeSheet.texts, 'rows must carry their English name').toContain('Home');

  /* Every sheet names its category, which is the whole point of splitting. */
  const titles = await page.locator('[data-icon-group] h2').allInnerTexts();
  sheets.forEach(([name, sheet], index) => {
    expect(sheet.texts, `${name} must be titled`).toContain(titles[index].trim());
  });
});

test('Media & Emergency keeps four reference-sized CCTV feeds in a separate wide panel', async ({ page }) => {
  await openComponent(page, '미디어·비상 제어');
  await expect(page.locator('h1')).toContainText('미디어·비상 제어');
  await expect(page.locator('.pk-content-frame')).toHaveClass(/pk-content-frame--wide/);

  const feeds = page.locator('.pk-camera-grid > .pk-camera-card');
  await expect(feeds).toHaveCount(4);
  const firstBox = await feeds.first().boundingBox();
  expect(Math.round(firstBox.width)).toBeGreaterThanOrEqual(360);
  expect(Math.round(firstBox.width)).toBeLessThanOrEqual(376);
  expect(Math.round(firstBox.height)).toBeGreaterThanOrEqual(282);
  expect(Math.round(firstBox.height)).toBeLessThanOrEqual(296);

  await expect(feeds.first().locator('.pk-camera-live-dot')).toHaveCSS('background-color', 'rgb(255, 0, 0)');
  await expect(feeds.first().locator('.pk-camera-card__controls')).toHaveCSS('opacity', '1');
  await expect(feeds.first().getByRole('button', { name: '카메라 1 스트림 새로고침' })).toBeVisible();
  await expect(feeds.first().getByRole('button', { name: '카메라 1 전체 화면' })).toBeVisible();
  await expect(page.locator('.pk-camera-state-sample')).toHaveCount(6);
  await expect(page.locator('.pk-camera-card.is-stale')).toContainText('마지막 프레임 18초 전');
});

test('camera recovery, expanded view, microphone and emergency confirmation are operable', async ({ page }) => {
  await openComponent(page, '미디어·비상 제어');
  const firstFeed = page.locator('.pk-camera-grid > .pk-camera-card').first();

  await firstFeed.getByRole('button', { name: '카메라 1 스트림 새로고침' }).click();
  await expect(firstFeed).toHaveClass(/is-reconnecting/);
  await expect(firstFeed.getByRole('status')).toContainText('스트림 재연결 중');
  await firstFeed.getByRole('button', { name: '카메라 1 재연결 취소' }).click();
  await expect(firstFeed).not.toHaveClass(/is-reconnecting/);

  const expand = firstFeed.getByRole('button', { name: '카메라 1 전체 화면' });
  await expand.click();
  await expect(firstFeed).toHaveClass(/is-fullscreen-demo/);
  await expect(firstFeed.getByRole('button', { name: '카메라 1 전체 화면 해제' })).toHaveAttribute('aria-pressed', 'true');

  const mic = page.getByRole('button', { name: '관제 마이크 켜기' });
  await mic.click();
  await expect(page.getByRole('button', { name: '관제 마이크 끄기' })).toHaveAttribute('aria-pressed', 'true');

  const emergency = page.getByRole('button', { name: '비상모드', exact: true });
  await emergency.click();
  const dialog = page.getByRole('dialog', { name: '전체 로봇을 즉시 정지합니까?' });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole('button', { name: '취소' })).toBeFocused();
  await dialog.getByRole('button', { name: '비상모드 실행' }).focus();
  await page.keyboard.press('Tab');
  await expect(dialog.getByRole('button', { name: '비상모드 확인 닫기' })).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(dialog).toHaveCount(0);
  await expect(emergency).toBeFocused();

  await emergency.click();
  await page.getByRole('dialog').getByRole('button', { name: '비상모드 실행' }).click();
  await expect(page.getByText('문서 데모: 비상모드 활성 상태')).toBeVisible();
  await expect(page.getByRole('button', { name: '비상모드 활성', exact: true })).toHaveAttribute('aria-pressed', 'true');
});

test('CCTV feed layout adapts to two columns and then one column', async ({ page }) => {
  await page.setViewportSize({ width: 1400, height: 1000 });
  await openComponent(page, '미디어·비상 제어');
  let feeds = page.locator('.pk-camera-grid > .pk-camera-card');
  const wideBoxes = await feeds.evaluateAll((nodes) => nodes.map((node) => {
    const rect = node.getBoundingClientRect();
    return { x: Math.round(rect.x), y: Math.round(rect.y) };
  }));
  expect(wideBoxes[0].x).toBe(wideBoxes[2].x);
  expect(wideBoxes[0].y).toBeLessThan(wideBoxes[2].y);
  expect(wideBoxes[0].x).toBeLessThan(wideBoxes[1].x);

  await page.setViewportSize({ width: 900, height: 1000 });
  feeds = page.locator('.pk-camera-grid > .pk-camera-card');
  const narrowBoxes = await feeds.evaluateAll((nodes) => nodes.map((node) => {
    const rect = node.getBoundingClientRect();
    return { x: Math.round(rect.x), y: Math.round(rect.y) };
  }));
  expect(new Set(narrowBoxes.map((box) => box.x)).size).toBe(1);
  expect(narrowBoxes[0].y).toBeLessThan(narrowBoxes[1].y);
});

test('System Summary composes eight live-token sections and links to detail pages', async ({ page }) => {
  await openComponent(page, '전체 요약');
  await expect(page.locator('h1')).toContainText('전체 요약');
  await expect(page.locator('.pk-content-frame')).toHaveClass(/pk-content-frame--summary/);
  await expect(page.locator('.pk-summary-hero')).toHaveCount(0);
  await expect(page.locator('[data-summary-story]')).toHaveCount(3);
  await expect(page.locator('[data-summary-section]')).toHaveCount(8);

  const typeRows = page.locator('[data-summary-type-row]');
  await expect(typeRows).toHaveCount(9);
  await expect(typeRows.first().locator('.pk-summary-type-row__sample')).toHaveCSS(
    'font-family',
    /Pretendard/
  );
  await expect(page.locator('[data-summary-mono-sample]')).toHaveCSS(
    'font-family',
    /Roboto Mono/
  );

  const firstColor = page.locator('[data-summary-color]').first();
  const colorParity = await firstColor.evaluate((chip) => {
    const probe = document.createElement('span');
    probe.style.background = `var(${chip.dataset.token})`;
    document.body.appendChild(probe);
    const result = {
      actual: getComputedStyle(chip).backgroundColor,
      expected: getComputedStyle(probe).backgroundColor,
    };
    probe.remove();
    return result;
  });
  expect(colorParity.actual).toBe(colorParity.expected);

  await expect(page.locator('[data-summary-icon-row]')).toHaveCount(3);
  await expect(page.locator('[data-summary-icon-row] .pk-icon-state')).toHaveCount(18);
  await expect(page.locator('[data-summary-icon-row] .pk-icon-source')).toHaveText([
    'Original',
    'Custom',
    'Adopted',
  ]);
  expect(await page.locator('[data-summary-section="iconography"]').innerText()).not.toMatch(/\bMS\b/);

  await expect(page.locator('.pk-summary-input')).toHaveCount(5);
  await expect(page.locator('.pk-summary-input.is-focus')).toHaveCSS(
    'border-color',
    'rgb(0, 170, 255)'
  );
  await expect(page.locator('[data-summary-section="buttons"] .pk-button--danger')).toHaveCSS(
    'background-color',
    'rgb(223, 0, 0)'
  );
  await expect(page.locator('[data-summary-section="buttons"] .pk-button.is-disabled')).toHaveCSS(
    'background-color',
    'rgba(255, 255, 255, 0.1)'
  );
  await expect(page.locator('[data-summary-operation]')).toHaveCount(5);
  await expect(page.locator('[data-summary-destination]')).toHaveCount(33);

  const unnamedButtons = await page.locator('[data-system-summary] button').evaluateAll((buttons) => (
    buttons
      .filter((button) => !(button.getAttribute('aria-label') || button.textContent.trim()))
      .map((button) => button.outerHTML)
  ));
  expect(unnamedButtons).toEqual([]);

  await page.getByRole('button', { name: 'EN', exact: true }).click();
  await expect(page.locator('h1')).toHaveText('System Summary');
  await expect(page.locator('[data-summary-section="identity"]')).toContainText('Dark fixed');
  await page.getByRole('button', { name: 'KO', exact: true }).click();

  await page
    .locator('[data-summary-section="typography"]')
    .getByRole('button', { name: '타이포그래피 상세 보기' })
    .click();
  await expect(page.locator('h1')).toContainText('타이포그래피');
});

test('System Summary switches from two columns to one without page overflow', async ({ page }) => {
  await page.setViewportSize({ width: 1920, height: 1000 });
  await openComponent(page, '전체 요약');

  for (const [width, expectedColumns] of [[1920, 2], [1400, 2], [900, 1]]) {
    await page.setViewportSize({ width, height: 1000 });
    const pairedCards = page.locator(
      '[data-summary-section="typography"], [data-summary-section="colors"]'
    );
    const positions = await pairedCards.evaluateAll((nodes) => nodes.map((node) => {
      const rect = node.getBoundingClientRect();
      return { x: Math.round(rect.x), y: Math.round(rect.y) };
    }));
    if (expectedColumns === 2) {
      expect(positions[0].x).toBeLessThan(positions[1].x);
      expect(positions[0].y).toBe(positions[1].y);
    } else {
      expect(positions[0].x).toBe(positions[1].x);
      expect(positions[0].y).toBeLessThan(positions[1].y);
    }

    const hasOverflow = await page.locator('[data-system-summary]').evaluate(
      (node) => node.scrollWidth > node.clientWidth + 1
    );
    expect(hasOverflow).toBe(false);
  }
});

test('new icon and media controls retain accessible names, focus disclosure and reduced motion', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await openComponent(page, '미디어·비상 제어');
  const unnamedButtons = await page.locator('.pk-media-doc button').evaluateAll((buttons) => (
    buttons
      .filter((button) => !(button.getAttribute('aria-label') || button.textContent.trim()))
      .map((button) => button.outerHTML)
  ));
  expect(unnamedButtons).toEqual([]);

  const secondControls = page.locator('.pk-camera-grid > .pk-camera-card').nth(1).locator('.pk-camera-card__controls');
  await expect(secondControls).toHaveCSS('opacity', '0');
  await secondControls.getByRole('button', { name: '카메라 2 스트림 새로고침' }).focus();
  await expect(secondControls).toHaveCSS('opacity', '1');

  await expect(page.locator('.pk-camera-live-dot').first()).toHaveCSS('animation-name', 'none');
  await expect(page.locator('.pk-camera-state-spinner').first()).toHaveCSS('animation-name', 'none');

  await openComponent(page, '아이콘');
  const stateLabels = await page.locator('.pk-icon-state').evaluateAll((cells) => (
    cells.filter((cell) => !cell.getAttribute('aria-label')).length
  ));
  expect(stateLabels).toBe(0);
});

/* The icon page's focus specimen departs from the delivered Figma, and the
   reason is a number: the supplied halo is 3px of cyan at 40% alpha, which
   composites to 2.11:1 over this page's surface and misses the 3:1 that WCAG
   2.2 asks a focus indicator for. Thinner alone would have made it worse —
   translucent at 2px loses contrast and area together — so it went opaque and
   thin at once.

   This measures what ships rather than what the note claims, because the note
   is prose and prose drifts. It also pins the floor: SC 2.4.13 wants at least
   the area of a 2px perimeter of the component, and on the 32px plate 2px is
   exactly that, so there is nothing left to shave. The floor is computed from
   the plate the build reports, so resizing the plate moves it automatically. */
test('the icon focus specimen is thin because it is opaque, not despite it', async ({ page }) => {
  await openComponent(page, '아이콘');

  const focus = await page.evaluate(() => {
    const cell = document.querySelector('.pk-icon-state.is-focus');
    if (!cell) return null;
    const style = window.getComputedStyle(cell);
    const parse = (value) => {
      const n = (String(value).match(/[\d.]+/g) || []).map(Number);
      return n.length >= 3 ? { r: n[0], g: n[1], b: n[2], a: n.length > 3 ? n[3] : 1 } : null;
    };
    /* Composited against what is actually behind the cell, not against an
       assumed page colour — this repo has produced a 1.05:1 misreading by
       taking a translucent layer at face value. */
    let behind = null;
    for (let node = cell.parentElement; node; node = node.parentElement) {
      const c = parse(window.getComputedStyle(node).backgroundColor);
      if (!c || c.a === 0) continue;
      behind = behind === null ? c : {
        r: behind.r + (c.r - behind.r) * (1 - behind.a),
        g: behind.g + (c.g - behind.g) * (1 - behind.a),
        b: behind.b + (c.b - behind.b) * (1 - behind.a),
        a: behind.a + c.a * (1 - behind.a),
      };
      if (behind.a >= 0.999) break;
    }
    /* box-shadow is "rgb(0, 170, 255) 0px 0px 0px 2px": scraping digits out of
       the whole string reads the first offset as the alpha channel. The colour
       function has to come out on its own, which is what svg-export's ringOf
       does for the same reason. */
    const shadow = style.boxShadow;
    const colour = shadow.match(/rgba?\([^)]*\)/i);
    const ring = colour ? parse(colour[0]) : null;
    const lengths = (shadow.replace(/rgba?\([^)]*\)/i, '').match(/-?[\d.]+px/g) || []).map(parseFloat);
    return {
      shadow,
      ring,
      spread: lengths.length ? lengths[lengths.length - 1] : 0,
      plate: parseFloat(style.width),
      behind: behind || { r: 255, g: 255, b: 255, a: 1 },
    };
  });

  expect(focus, 'a focus specimen must exist to measure').not.toBeNull();
  expect(focus.ring, `the focus ring must carry a colour: ${focus.shadow}`).not.toBeNull();

  /* Alpha is the dial that was wrong. A wash cannot be made accessible by
     making it thinner, so the ring has to stay opaque. */
  expect(focus.ring.a, `the focus ring must be opaque, got alpha ${focus.ring.a}`).toBe(1);

  /* SC 2.4.13 minimum area: at least the area of a 2px perimeter of the
     component. Below 2px on this plate there is no legal thickness left. */
  expect(focus.spread, `the focus ring is ${focus.spread}px, below the 2px area floor`)
    .toBeGreaterThanOrEqual(2);
  const area = (focus.plate + focus.spread * 2) ** 2 - focus.plate ** 2;
  const floor = (focus.plate + 4) ** 2 - focus.plate ** 2;
  expect(area, `ring area ${area}px² must clear the 2px-perimeter floor ${floor}px²`)
    .toBeGreaterThanOrEqual(floor);

  const lin = (c) => { const v = c / 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
  const lum = (c) => 0.2126 * lin(c.r) + 0.7152 * lin(c.g) + 0.0722 * lin(c.b);
  const over = (fg, bg) => ({
    r: fg.r * fg.a + bg.r * (1 - fg.a),
    g: fg.g * fg.a + bg.g * (1 - fg.a),
    b: fg.b * fg.a + bg.b * (1 - fg.a),
  });
  const composited = over(focus.ring, focus.behind);
  const [hi, lo] = [lum(composited), lum(focus.behind)].sort((a, b) => b - a);
  const contrast = Math.round(((hi + 0.05) / (lo + 0.05)) * 100) / 100;

  expect(contrast, `the focus ring measures ${contrast}:1 against what sits behind it`)
    .toBeGreaterThanOrEqual(3);

  /* And the page has to say it departs, with the numbers the build produces —
     otherwise a reader compares this to the Figma and concludes the build is
     wrong, which is the same trap the Goalie pages document. */
  const note = page.locator('[data-icon-focus-note]');
  await expect(note, 'the departure must be stated on the page').toHaveCount(1);
  await expect(note, 'it must name what the delivered specimen measured').toContainText('2.11');
  await expect(note, 'it must name what ships').toContainText('7.24');
  await expect(note, 'it must say why thinner alone was not the answer').toContainText('0.60');
});
