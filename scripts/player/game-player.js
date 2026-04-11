// iframe 기반 게임 로더 (HTML/JS 및 Unity WebGL 지원)
import {
    doc, getDoc
} from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js';
import { db } from '../auth/firebase-init.js';

class CustomError extends Error {
    constructor(message, code) {
        super(message);
        this.code = code;
    }
}

export async function loadGame(gameId, container) {
    try {
        const snap = await getDoc(doc(db, 'games', gameId));
        if (!snap.exists()) {
            throw new CustomError('게임을 찾을 수 없음', 'player/not-found');
        }

        const game = snap.data();
        renderPlayer(container, game);
        return game;
    } catch (err) {
        if (err instanceof CustomError) throw err;
        throw new CustomError(err.message, 'player/load-failed');
    }
}

function renderPlayer(container, game) {
    const isUnity = game.type === 'unity';
    container.innerHTML = `
        <div class="player-wrapper${isUnity ? ' unity' : ''}">
            <div class="player-header">
                <h2>${game.title}</h2>
                <button id="btn-fullscreen">전체화면</button>
            </div>
            <div class="player-frame-wrap">
                ${isUnity
        ? '<div class="unity-loader"><span>로딩 중...</span></div>'
        : ''}
                <iframe
                    id="game-frame"
                    src="${game.fileUrl}"
                    allowfullscreen
                    allow="autoplay; fullscreen"
                    sandbox="allow-scripts allow-same-origin allow-forms"
                ></iframe>
            </div>
            <p class="player-desc">${game.description}</p>
        </div>
    `;

    const frame = document.getElementById('game-frame');
    const btn = document.getElementById('btn-fullscreen');

    frame.addEventListener('load', () => {
        const loader = container.querySelector('.unity-loader');
        if (loader) loader.remove();
    });

    btn.addEventListener('click', () => {
        if (frame.requestFullscreen) frame.requestFullscreen();
    });
}
