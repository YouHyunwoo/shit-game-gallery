// 테스트 섹션 4: 관리자 페이지
import { test, expect } from '@playwright/test';
import { setupFirebaseMock } from './helpers/setup-firebase.js';

const ADMIN_USER = { uid: 'admin-uid', email: 'admin@test.com', displayName: '관리자' };
const NORMAL_USER = { uid: 'user-uid', email: 'user@test.com', displayName: '일반유저' };

test.describe('관리자 페이지', () => {
    test('비로그인 - 로그인 안내 메시지 표시', async ({ page }) => {
        await setupFirebaseMock(page, { user: null });
        await page.goto('/admin');

        await expect(page.locator('#admin-gate')).toBeVisible();
        await expect(page.locator('#admin-gate')).toContainText('관리자 계정으로 로그인하세요');
        await expect(page.locator('#upload-section')).toBeHidden();
    });

    test('비관리자 로그인 - 접근 차단 메시지', async ({ page }) => {
        await setupFirebaseMock(page, { user: NORMAL_USER, isAdmin: false });
        await page.goto('/admin');

        await expect(page.locator('#admin-gate .error'))
            .toContainText('관리자 계정이 아닙니다', { timeout: 6000 });
        await expect(page.locator('#upload-section')).toBeHidden();
    });

    test('관리자 로그인 - 업로드 폼 표시', async ({ page }) => {
        await setupFirebaseMock(page, { user: ADMIN_USER, isAdmin: true });
        await page.goto('/admin');

        await expect(page.locator('#upload-section')).toBeVisible({ timeout: 6000 });
        await expect(page.locator('#admin-gate')).toBeHidden();
        await expect(page.locator('#upload-form')).toBeVisible();
    });

    test('관리자 - 필수 폼 필드 렌더링 확인', async ({ page }) => {
        await setupFirebaseMock(page, { user: ADMIN_USER, isAdmin: true });
        await page.goto('/admin');
        await expect(page.locator('#upload-section')).toBeVisible({ timeout: 6000 });

        await expect(page.locator('[name="title"]')).toBeVisible();
        await expect(page.locator('[name="description"]')).toBeVisible();
        await expect(page.locator('[name="type"]')).toBeVisible();
        await expect(page.locator('[name="thumbnail"]')).toBeVisible();
        await expect(page.locator('[name="gameFile"]')).toBeVisible();
        await expect(page.locator('#btn-submit')).toBeVisible();
    });

    test('관리자 - 썸네일 미리보기 초기 숨김', async ({ page }) => {
        await setupFirebaseMock(page, { user: ADMIN_USER, isAdmin: true });
        await page.goto('/admin');
        await expect(page.locator('#upload-section')).toBeVisible({ timeout: 6000 });

        await expect(page.locator('#thumbnail-preview')).toBeHidden();
    });
});
