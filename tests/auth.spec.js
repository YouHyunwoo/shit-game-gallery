// 테스트 섹션 1: 인증 (Google 로그인 / 로그아웃)
import { test, expect } from '@playwright/test';
import { setupFirebaseMock } from './helpers/setup-firebase.js';

const MOCK_USER = { uid: 'test-uid', email: 'test@example.com', displayName: '테스트유저' };

test.describe('인증', () => {
    test('비로그인 시 Google 로그인 버튼 표시', async ({ page }) => {
        await setupFirebaseMock(page, { user: null });
        await page.goto('/');
        await expect(page.locator('#btn-auth')).toHaveText('Google 로그인');
    });

    test('로그인 후 로그아웃 버튼으로 변경', async ({ page }) => {
        await setupFirebaseMock(page, { user: null });
        await page.goto('/');

        // 버튼 클릭 전 window.__mockUser 주입 (signInWithPopup이 읽음)
        await page.evaluate(user => { window.__mockUser = user; }, {
            ...MOCK_USER,
            getIdToken: null, // 직렬화 불가 - mock에서 string으로 처리됨
        });

        await page.locator('#btn-auth').click();
        await expect(page.locator('#btn-auth')).toHaveText('로그아웃', { timeout: 5000 });
    });

    test('로그아웃 후 로그인 버튼 복귀', async ({ page }) => {
        // 이미 로그인 상태로 시작
        await setupFirebaseMock(page, { user: MOCK_USER });
        await page.goto('/');
        await expect(page.locator('#btn-auth')).toHaveText('로그아웃', { timeout: 5000 });

        await page.locator('#btn-auth').click();
        await expect(page.locator('#btn-auth')).toHaveText('Google 로그인', { timeout: 5000 });
    });

    test('로그인 후 티어 뱃지 표시', async ({ page }) => {
        await setupFirebaseMock(page, {
            user: MOCK_USER,
            userTier: 'subscriber',
        });
        await page.goto('/');
        await expect(page.locator('#tier-badge')).toHaveText('일반 구독자', { timeout: 5000 });
    });

    test('비로그인 시 비구독자 뱃지 표시', async ({ page }) => {
        await setupFirebaseMock(page, { user: null });
        await page.goto('/');
        // 게임 로드 대기 후 tier 확인
        await expect(page.locator('#game-grid .game-card').first()).toBeVisible({ timeout: 5000 });
        await expect(page.locator('#tier-badge')).toHaveText('비구독자');
    });
});
