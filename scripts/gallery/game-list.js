// Firestore 게임 목록 조회 및 카드 UI 렌더링
import {
    collection, getDocs, orderBy, query
} from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js';
import { db } from '../auth/firebase-init.js';
import { pickWeeklyGames } from './weekly-games.js';

class CustomError extends Error {
    constructor(message, code) {
        super(message);
        this.code = code;
    }
}

export async function fetchGames() {
    try {
        const q = query(
            collection(db, 'games'),
            orderBy('createdAt', 'desc')
        );
        const snap = await getDocs(q);
        return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (err) {
        throw new CustomError(err.message, 'gallery/fetch-failed');
    }
}

// tier에 따라 접근 가능한 게임 필터링
export function filterByTier(games, tier) {
    if (tier === 'member') return games;
    if (tier === 'subscriber') {
        return games.filter(g => !g.earlyAccess);
    }
    // 비구독자: 주간 랜덤 3~5개 (얼리 액세스 제외)
    const eligible = games.filter(g => !g.earlyAccess);
    return pickWeeklyGames(eligible);
}

function createGameCard(game, locked) {
    const card = document.createElement('div');
    card.className = `game-card${locked ? ' locked' : ''}`;
    card.innerHTML = `
        <img src="${game.thumbnailUrl}" alt="${game.title}" loading="lazy">
        <div class="card-info">
            <h3>${game.title}</h3>
            <p>${game.description}</p>
            ${game.earlyAccess
        ? '<span class="badge early">얼리 액세스</span>'
        : ''}
            ${locked ? '<span class="badge locked">구독 필요</span>' : ''}
        </div>
    `;
    if (!locked) {
        card.addEventListener('click', () => {
            location.href = `/play.html?id=${game.id}`;
        });
    }
    return card;
}

export function renderGameList(container, allGames, accessibleIds) {
    container.innerHTML = '';
    const accessSet = new Set(accessibleIds);
    allGames.forEach(game => {
        const locked = !accessSet.has(game.id);
        container.appendChild(createGameCard(game, locked));
    });
}
