// Firebase CDN mock 및 API 라우트 설정 헬퍼
import {
    FIREBASE_APP_MOCK,
    FIREBASE_AUTH_MOCK,
    FIREBASE_FIRESTORE_MOCK,
    FIREBASE_STORAGE_MOCK,
} from './mock-content.js';

const FB_BASE = 'https://www.gstatic.com/firebasejs';

// 기본 게임 목록 (비구독자 검증용 5개 일반 + 1개 얼리액세스)
export const MOCK_GAMES = [
    { id: 'game1', title: '게임1', description: '설명1', type: 'html',
        earlyAccess: false, thumbnailUrl: '', fileUrl: 'about:blank',
        createdAt: { seconds: 1000 } },
    { id: 'game2', title: '게임2', description: '설명2', type: 'html',
        earlyAccess: false, thumbnailUrl: '', fileUrl: 'about:blank',
        createdAt: { seconds: 900 } },
    { id: 'game3', title: '게임3', description: '설명3', type: 'html',
        earlyAccess: false, thumbnailUrl: '', fileUrl: 'about:blank',
        createdAt: { seconds: 800 } },
    { id: 'game4', title: '게임4', description: '설명4', type: 'html',
        earlyAccess: false, thumbnailUrl: '', fileUrl: 'about:blank',
        createdAt: { seconds: 700 } },
    { id: 'game5', title: '게임5', description: '설명5', type: 'html',
        earlyAccess: false, thumbnailUrl: '', fileUrl: 'about:blank',
        createdAt: { seconds: 600 } },
    { id: 'early1', title: '얼리액세스게임', description: '멤버십전용',
        type: 'html', earlyAccess: true, thumbnailUrl: '',
        fileUrl: 'about:blank', createdAt: { seconds: 500 } },
];

// Firebase CDN 요청 → mock 모듈 반환
async function routeFirebase(page) {
    await page.route(`${FB_BASE}/**`, route => {
        const url = route.request().url();
        let body;
        if (url.includes('firebase-auth')) body = FIREBASE_AUTH_MOCK;
        else if (url.includes('firebase-firestore')) body = FIREBASE_FIRESTORE_MOCK;
        else if (url.includes('firebase-storage')) body = FIREBASE_STORAGE_MOCK;
        else body = FIREBASE_APP_MOCK;
        route.fulfill({ status: 200, contentType: 'application/javascript', body });
    });
}

/**
 * @param {import('@playwright/test').Page} page
 * @param {{ user?, games?, userTier?, youtubeTier?, isAdmin? }} opts
 */
export async function setupFirebaseMock(page, opts = {}) {
    const {
        user = null,
        games = MOCK_GAMES,
        userTier = 'none',
        youtubeTier = 'none',
        isAdmin = false,
    } = opts;

    // window 전역 변수 주입 (페이지 스크립트보다 먼저 실행)
    await page.addInitScript(({ userJson, gamesJson, tier }) => {
        const u = userJson ? {
            ...JSON.parse(userJson),
            getIdToken: async () => 'mock-id-token',
        } : null;
        window.__mockUser = u;
        const users = u ? [{
            id: u.uid,
            tier,
            lastChecked: { toMillis: () => Date.now() - 100 },
        }] : [];
        window.__mockFirestore = { games: JSON.parse(gamesJson), users };
    }, {
        userJson: user ? JSON.stringify(user) : null,
        gamesJson: JSON.stringify(games),
        tier: userTier,
    });

    await routeFirebase(page);

    // YouTube 구독 확인 API mock
    await page.route(/\/api\/youtube-check/, route => {
        route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({ tier: youtubeTier }),
        });
    });

    // 게임 업로드 API mock (관리자 확인 GET + 업로드 POST)
    await page.route(/\/api\/game-upload/, route => {
        if (route.request().method() === 'GET') {
            route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({ isAdmin }),
            });
        } else {
            route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({ ok: true, gameId: 'mock-game-id' }),
            });
        }
    });
}
