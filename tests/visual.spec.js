const { test, expect } = require('@playwright/test');
const path = require('node:path');

async function capture(page, label, file) {
  const item = page.locator('nav.pk-scroll button').filter({ hasText: label }).first();
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
  await page.locator('.pk-icon-matrix').first().screenshot({
    path: path.join('test-results', 'review', 'iconography-state-matrix.png'),
  });
  await page.locator('.pk-icon-matrix').nth(1).scrollIntoViewIfNeeded();
  await page.locator('.pk-icon-matrix').nth(1).screenshot({
    path: path.join('test-results', 'review', 'iconography-robot-matrix.png'),
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
