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
  await expect(expanded.locator('.pk-robot-control-card__signal')).toHaveCSS(
    'color',
    'rgb(245, 222, 46)'
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
  await expect(page.locator('.pk-icon-state')).toHaveCount((24 * 6) + (6 * 4));
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
  await expect(firstRow.locator('.is-hover')).toHaveCSS('color', 'rgba(255, 255, 255, 0.95)');
  await expect(firstRow.locator('.is-focus')).toHaveCSS('color', 'rgba(255, 255, 255, 0.95)');
  await expect(firstRow.locator('.is-pressed')).toHaveCSS('color', 'rgba(255, 255, 255, 0.95)');
  await expect(firstRow.locator('.is-selected')).toHaveCSS('color', 'rgb(0, 170, 255)');
  await expect(firstRow.locator('.is-disabled')).toHaveCSS('color', 'rgba(255, 255, 255, 0.35)');

  const batteryRow = rows.filter({ hasText: 'Battery' });
  await expect(batteryRow).toHaveCount(1);
  await expect(batteryRow).toHaveClass(/is-semantic-axis/);
  await expect(batteryRow.locator('.pk-icon-spec-state')).toHaveText([
    '정상 26% 이상',
    '부족 25–11%',
    '위험 10% 이하',
    '충전 중',
  ]);
  await expect(batteryRow.locator('.pk-icon-state').nth(0)).toHaveCSS('color', 'rgb(244, 244, 244)');
  await expect(batteryRow.locator('.pk-icon-state').nth(1)).toHaveCSS('color', 'rgb(244, 244, 244)');
  await expect(batteryRow.locator('.pk-icon-state').nth(2)).toHaveCSS('background-color', 'rgb(238, 0, 0)');
  await expect(batteryRow.locator('.pk-icon-state').nth(3)).toHaveCSS('color', 'rgb(0, 192, 0)');

  const connectionRow = rows.filter({ hasText: 'Connection' });
  await expect(connectionRow).toHaveCount(1);
  await expect(connectionRow).toHaveClass(/is-semantic-axis/);
  await expect(connectionRow.locator('.pk-icon-spec-state')).toHaveText([
    '양호',
    '약함',
    '끊김',
    '재연결 중',
  ]);

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

test('the icon page downloads each icon as one folder of interaction states', async ({ page }) => {
  await openComponent(page, '아이콘');

  const button = page.locator('[data-icon-state-download]');
  await expect(button).toBeVisible();

  const [download] = await Promise.all([
    page.waitForEvent('download'),
    button.click(),
  ]);
  expect(download.suggestedFilename()).toBe('parkie-icons-states.zip');

  const stream = await download.createReadStream();
  const chunks = [];
  for await (const chunk of stream) chunks.push(chunk);
  const entries = readStoredZip(Buffer.concat(chunks));

  const svgNames = [...entries.keys()].filter((name) => name.endsWith('.svg'));
  const folders = new Map();
  for (const name of svgNames) {
    const [folder, file] = name.split('/');
    expect(file, `${name} must sit one level down`).toBeTruthy();
    folders.set(folder, [...(folders.get(folder) || []), file].sort());
  }
  expect(folders.size).toBeGreaterThan(0);
  for (const [folder, files] of folders) {
    expect(files, `${folder} must carry all four states`).toEqual([
      'Disabled.svg', 'Enabled.svg', 'Hover.svg', 'Pressed.svg',
    ]);
  }
  expect(svgNames.length).toBe(folders.size * 4);

  // rgba() in a paint attribute is the failure that design tools reject; the
  // alpha has to travel as a separate opacity instead.
  for (const name of svgNames) {
    const text = entries.get(name);
    expect(text, `${name} must not carry rgba() paint`).not.toMatch(/(?:fill|stroke)="rgba?\(/);
    expect(text, `${name} must resolve currentColor`).not.toContain('currentColor');
    expect(text, `${name} must resolve custom properties`).not.toContain('var(');
  }

  // Each state must actually differ where the tokens differ.
  const enabled = entries.get('Home/Enabled.svg');
  const disabled = entries.get('Home/Disabled.svg');
  expect(enabled).toMatch(/fill="#FFFFFF"/);
  expect(enabled).toMatch(/fill-opacity="0\.7"/);
  expect(disabled).toMatch(/fill-opacity="0\.35"/);
  expect(enabled).not.toEqual(disabled);

  // Stroked icons take the state on the stroke, not the fill.
  expect(entries.get('Monitoring/Enabled.svg')).toMatch(/stroke="#FFFFFF"/);
  expect(entries.get('Monitoring/Enabled.svg')).toMatch(/stroke-opacity="0\.7"/);

  // The battery outline already carried fill-opacity 0.95, so the state alpha
  // multiplies into it rather than replacing it.
  expect(entries.get('BatteryFull/Enabled.svg')).toMatch(/fill-opacity="0\.665"/);

  // Literal artwork colour is not state paint and must survive untouched.
  const charging = entries.get('BatteryChargingHigh/Enabled.svg');
  expect(charging).toContain('#00C000');
  expect(charging).toContain('fill="white"');

  const readme = entries.get('README.txt');
  for (const token of ['--parkie-icon-default', '--parkie-icon-hover', '--parkie-icon-pressed', '--parkie-icon-disabled']) {
    expect(readme, `${token} must be documented`).toContain(token);
  }
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
