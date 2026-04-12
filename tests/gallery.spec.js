// 테스트 섹션 3: 게임 목록
import { test, expect } from '@playwright/test';
import { setupFirebaseMock, MOCK_GAMES } from './helpers/setup-firebase.js';

const TOTAL = MOCK_GAMES.length;       // 6
const EARLY_COUNT = MOCK_GAMES.filter(g => g.earlyAccess).length;  // 1
const NORMAL_COUNT = TOTAL - EARLY_COUNT;                           // 5

async function waitForCards(page) {
    await expect(page.locator('#game-grid .game-card').first())
        .toBeVisible({ timeout: 6000 });
}

test.describe('게임 목록', () => {
    test('게임 카드 렌더링 - 썸네일·제목 표시', async ({ page }) => {
        await setupFirebaseMock(page, { user: null });
        await page.goto('/');
        await waitForCards(page);

        const cards = page.locator('#game-grid .game-card');
        await expect(cards).toHaveCount(TOTAL);
        // 첫 번째 카드 제목 확인
        await expect(cards.first().locator('h3')).toBeVisible();
    });

    test('비로그인 - 주간 랜덤 3~5개만 잠금 해제', async ({ page }) => {
        await setupFirebaseMock(page, { user: null });
        await page.goto('/');
        await waitForCards(page);

        const unlocked = await page.locator('#game-grid .game-card:not(.locked)').count();
        expect(unlocked).toBeGreaterThanOrEqual(3);
        expect(unlocked).toBeLessThanOrEqual(5);

        // 안내 메시지 표시 확인
        await expect(page.locator('#gallery-info')).toBeVisible();
        await expect(page.locator('#info-text')).toContainText('이번 주 무료 게임');
    });

    test('구독자 - 얼리액세스 제외 전체 게임 접근', async ({ page }) => {
        await setupFirebaseMock(page, {
            user: { uid: 'sub-uid', email: 'sub@test.com', displayName: '구독자' },
            userTier: 'subscriber',
        });
        await page.goto('/');
        await waitForCards(page);

        const unlocked = await page.locator('#game-grid .game-card:not(.locked)').count();
        expect(unlocked).toBe(NORMAL_COUNT);   // 얼리액세스 1개 제외 = 5

        // 얼리액세스 카드는 잠금
        const locked = await page.locator('#game-grid .game-card.locked').count();
        expect(locked).toBe(EARLY_COUNT);
    });

    test('멤버십 - 얼리액세스 포함 전체 접근', async ({ page }) => {
        await setupFirebaseMock(page, {
            user: { uid: 'mem-uid', email: 'mem@test.com', displayName: '멤버' },
            userTier: 'member',
        });
        await page.goto('/');
        await waitForCards(page);

        const unlocked = await page.locator('#game-grid .game-card:not(.locked)').count();
        expect(unlocked).toBe(TOTAL);  // 모두 접근 가능

        const locked = await page.locator('#game-grid .game-card.locked').count();
        expect(locked).toBe(0);
    });

    test('잠금 카드에 구독 필요 뱃지 표시', async ({ page }) => {
        await setupFirebaseMock(page, { user: null });
        await page.goto('/');
        await waitForCards(page);

        await expect(page.locator('.badge.locked').first()).toBeVisible();
    });

    test('잠금 해제 카드 클릭 → /play.html 이동', async ({ page }) => {
        await setupFirebaseMock(page, {
            user: { uid: 'sub-uid', email: 'sub@test.com', displayName: '구독자' },
            userTier: 'subscriber',
        });
        await page.goto('/');
        await waitForCards(page);

        const firstUnlocked = page.locator('#game-grid .game-card:not(.locked)').first();
        await firstUnlocked.click();
        await expect(page).toHaveURL(/\/play\.html\?id=/);
    });
});
