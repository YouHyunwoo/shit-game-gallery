// 테스트 섹션 5: 게임 플레이
import { test, expect } from '@playwright/test';
import { setupFirebaseMock, MOCK_GAMES } from './helpers/setup-firebase.js';

const SUB_USER = { uid: 'sub-uid', email: 'sub@test.com', displayName: '구독자' };
const ACCESSIBLE_GAME = MOCK_GAMES.find(g => !g.earlyAccess);  // game1
const EARLY_GAME = MOCK_GAMES.find(g => g.earlyAccess);         // early1

test.describe('게임 플레이', () => {
    test('게임 ID 없이 /play 접근 → 오류 메시지', async ({ page }) => {
        await setupFirebaseMock(page, { user: null });
        await page.goto('/play');

        await expect(page.locator('.error')).toContainText('게임 ID가 없습니다', { timeout: 5000 });
    });

    test('권한 없는 게임 접근 → 구독자 전용 메시지', async ({ page }) => {
        // 비구독자로 얼리액세스 게임 접근 시도
        await setupFirebaseMock(page, { user: null });
        await page.goto(`/play?id=${EARLY_GAME.id}`);

        await expect(page.locator('.access-denied'))
            .toContainText('구독자 전용', { timeout: 6000 });
        await expect(page.locator('.access-denied a'))
            .toHaveAttribute('href', '/');
    });

    test('접근 가능 게임 → iframe 렌더링', async ({ page }) => {
        await setupFirebaseMock(page, {
            user: SUB_USER,
            userTier: 'subscriber',
        });
        await page.goto(`/play?id=${ACCESSIBLE_GAME.id}`);

        await expect(page.locator('#game-frame')).toBeVisible({ timeout: 6000 });
        await expect(page.locator('#game-frame'))
            .toHaveAttribute('src', ACCESSIBLE_GAME.fileUrl);
    });

    test('접근 가능 게임 → 제목 헤더 업데이트', async ({ page }) => {
        await setupFirebaseMock(page, {
            user: SUB_USER,
            userTier: 'subscriber',
        });
        await page.goto(`/play?id=${ACCESSIBLE_GAME.id}`);

        await expect(page.locator('#game-title'))
            .toHaveText(ACCESSIBLE_GAME.title, { timeout: 6000 });
    });

    test('멤버십 사용자 - 얼리액세스 게임 플레이 가능', async ({ page }) => {
        await setupFirebaseMock(page, {
            user: { uid: 'mem-uid', email: 'mem@test.com', displayName: '멤버' },
            userTier: 'member',
        });
        await page.goto(`/play?id=${EARLY_GAME.id}`);

        await expect(page.locator('#game-frame')).toBeVisible({ timeout: 6000 });
    });

    test('전체화면 버튼 존재 확인', async ({ page }) => {
        await setupFirebaseMock(page, {
            user: SUB_USER,
            userTier: 'subscriber',
        });
        await page.goto(`/play?id=${ACCESSIBLE_GAME.id}`);

        await expect(page.locator('#btn-fullscreen')).toBeVisible({ timeout: 6000 });
    });
});
