// 테스트 섹션 2: 구독 확인 API (/api/youtube-check)
// 실제 vercel dev 서버 필요 - 서버 없으면 각 테스트 실패
import { test, expect } from '@playwright/test';

test.describe('YouTube 구독 확인 API', () => {
    test('토큰 없이 호출 → 401', async ({ request }) => {
        const res = await request.post('/api/youtube-check');
        expect(res.status()).toBe(401);

        const body = await res.json();
        expect(body).toHaveProperty('error');
    });

    test('Authorization 헤더 없이 호출 → 401', async ({ request }) => {
        const res = await request.post('/api/youtube-check', {
            headers: { 'Content-Type': 'application/json' },
        });
        expect(res.status()).toBe(401);
    });

    test('GET 메서드 → 405', async ({ request }) => {
        const res = await request.get('/api/youtube-check');
        expect(res.status()).toBe(405);
    });

    test('게임 업로드 API - 토큰 없이 GET → isAdmin false', async ({ request }) => {
        const res = await request.get('/api/game-upload');
        expect(res.status()).toBe(200);

        const body = await res.json();
        expect(body.isAdmin).toBe(false);
    });

    test('게임 업로드 API - 토큰 없이 POST → 403', async ({ request }) => {
        const res = await request.post('/api/game-upload', {
            data: { gameId: 'test', title: '테스트', type: 'html', fileUrl: 'url' },
        });
        expect(res.status()).toBe(403);
    });
});
