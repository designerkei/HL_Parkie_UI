const { test, expect } = require('@playwright/test');
const path = require('node:path');

async function capture(page, label, file) {
  const item = page.locator('nav.pk-scroll [data-nav-id]').filter({ hasText: label }).first();
  await expect(item).toBeVisible();
  await item.click();
  await expect(page.locator('h1')).toContainText(label);
  await page.screenshot({
    path: path.join('test-results', 'review', file),
    fullPage: false,
  });
}

test('capture reference-critical component pages', async ({ page }) => {
  await page.goto('/');
  await capture(page, '버튼', 'button.png');
  await capture(page, '로봇 카드', 'robot-card.png');
  await page.locator('.pk-robot-stack').first().screenshot({
    path: path.join('test-results', 'review', 'robot-card-detail.png'),
  });
  await capture(page, '모달', 'modal.png');
  const emergency = page.locator('.pk-modal-shell--reference-alert');
  await emergency.scrollIntoViewIfNeeded();
  await emergency.screenshot({
    path: path.join('test-results', 'review', 'modal-reference-alert.png'),
  });
  await page.getByRole('tab', { name: '관리자 인증' }).click();
  await page.getByRole('group', { name: '서비스 활성화 인증' }).screenshot({
    path: path.join('test-results', 'review', 'modal-auth.png'),
  });
  await page.getByRole('tab', { name: '점검 항목' }).click();
  await page.locator('.pk-modal-shell--lg').screenshot({
    path: path.join('test-results', 'review', 'modal-checklist.png'),
  });
  await capture(page, '상단 바', 'topbar.png');
  await page.locator('.pk-appbar-stage > .pk-appbar').screenshot({
    path: path.join('test-results', 'review', 'topbar-detail.png'),
  });
  await capture(page, '이벤트 피드 행', 'alert-feed.png');
  await page.locator('.pk-feed-list').first().screenshot({
    path: path.join('test-results', 'review', 'alert-feed-detail.png'),
  });
  await capture(page, '아이콘', 'iconography.png');
  await page.locator('.pk-icon-specs').first().screenshot({
    path: path.join('test-results', 'review', 'iconography-state-matrix.png'),
  });
  await page.locator('.pk-icon-specs').nth(1).scrollIntoViewIfNeeded();
  await page.locator('.pk-icon-specs').nth(1).screenshot({
    path: path.join('test-results', 'review', 'iconography-robot-matrix.png'),
  });
  await page.locator('.pk-icon-row').filter({ hasText: 'Battery' }).screenshot({
    path: path.join('test-results', 'review', 'iconography-battery-semantic-states.png'),
  });
  await page.locator('.pk-domain-grid').first().scrollIntoViewIfNeeded();
  await page.locator('.pk-domain-grid').first().screenshot({
    path: path.join('test-results', 'review', 'iconography-battery-states.png'),
  });
  await capture(page, '미디어·비상 제어', 'media-emergency.png');
  await page.locator('.pk-media-stage').screenshot({
    path: path.join('test-results', 'review', 'camera-feed-detail.png'),
  });
  await page.locator('.pk-camera-state-grid').scrollIntoViewIfNeeded();
  await page.locator('.pk-camera-state-grid').screenshot({
    path: path.join('test-results', 'review', 'camera-state-detail.png'),
  });
  await page.locator('.pk-emergency-control-panel').scrollIntoViewIfNeeded();
  await page.locator('.pk-emergency-control-panel').screenshot({
    path: path.join('test-results', 'review', 'emergency-fab-detail.png'),
  });
  await page.getByRole('button', { name: '비상모드', exact: true }).click();
  await page.getByRole('dialog', { name: '전체 로봇을 즉시 정지합니까?' }).screenshot({
    path: path.join('test-results', 'review', 'emergency-confirm-detail.png'),
  });
});

test('capture System Summary at planned breakpoints', async ({ page }) => {
  const breakpoints = [
    { width: 1920, height: 1080, file: 'system-summary-1920.png' },
    { width: 1400, height: 1000, file: 'system-summary-1400.png' },
    { width: 900, height: 1000, file: 'system-summary-900.png' },
  ];

  await page.goto('/');
  for (const breakpoint of breakpoints) {
    await page.setViewportSize({ width: breakpoint.width, height: breakpoint.height });
    const item = page.locator('nav.pk-scroll [data-nav-id]').filter({ hasText: '전체 요약' }).first();
    await item.click();
    await expect(page.locator('[data-system-summary]')).toBeVisible();
    await page.screenshot({
      path: path.join('test-results', 'review', breakpoint.file),
      fullPage: false,
    });
  }

  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.locator('[data-system-summary]').screenshot({
    path: path.join('test-results', 'review', 'system-summary-full.png'),
  });
  const summarySections = [
    ['identity', 'system-summary-identity.png'],
    ['typography', 'system-summary-typography.png'],
    ['colors', 'system-summary-colors.png'],
    ['iconography', 'system-summary-iconography.png'],
    ['form-controls', 'system-summary-form-controls.png'],
    ['buttons', 'system-summary-buttons.png'],
    ['robot-operations', 'system-summary-robot-operations.png'],
    ['component-index', 'system-summary-component-index.png'],
  ];
  for (const [section, file] of summarySections) {
    await page.locator(`[data-summary-section="${section}"]`).screenshot({
      path: path.join('test-results', 'review', file),
    });
  }
});

test('capture parking-control product compositions', async ({ page }) => {
  await page.goto('/#dashboard');
  await expect(page.locator('[data-dashboard]')).toBeVisible();
  await page.locator('[data-dashboard]').screenshot({
    path: path.join('test-results', 'review', 'control-dashboard.png'),
  });

  await page.goto('/#appshell');
  await expect(page.locator('.pk-shell-frame')).toBeVisible();
  await page.locator('.pk-shell-frame').screenshot({
    path: path.join('test-results', 'review', 'control-app-shell.png'),
  });

  await page.goto('/#robotstatus');
  await expect(page.locator('.pk-status-axis-grid')).toBeVisible();
  await page.locator('.pk-status-axis-grid').screenshot({
    path: path.join('test-results', 'review', 'robot-status-axes.png'),
  });
});

test('capture skeleton-product review surfaces', async ({ page }) => {
  test.setTimeout(180_000);
  const systems = ['goalie', 'cpms'];
  const pages = ['overview', 'colors', 'iconography', 'button', 'input', 'templates', 'brand'];

  for (const system of systems) {
    await page.setViewportSize({ width: 1920, height: 1080 });
    for (const pageId of pages) {
      await page.goto(`/#/${system}/${pageId}`);
      await expect(page.locator('[data-guide-root]')).toHaveAttribute('data-active-system', system);
      await expect(page.locator(`[data-guide-sidebar] [data-nav-id="${pageId}"]`)).toHaveAttribute('aria-current', 'page');
      await page.screenshot({
        path: path.join('test-results', 'review', `${system}-${pageId}.png`),
        fullPage: false,
      });
    }

    for (const pageId of ['overview', 'brand']) {
      await page.setViewportSize({ width: 390, height: 844 });
      await page.goto(`/#/${system}/${pageId}`);
      await expect(page.locator('h1')).toBeVisible();
      await page.screenshot({
        path: path.join('test-results', 'review', `${system}-${pageId}-390.png`),
        fullPage: false,
      });
    }
  }
});
