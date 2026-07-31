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
});
