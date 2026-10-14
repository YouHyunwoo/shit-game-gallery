// iframe 기반 게임 로더 (HTML/JS 및 Unity WebGL 지원)
import {
    doc, getDoc
} from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js';
import { db } from '../auth/firebase-init.js';

const JSZipUrl = 'https://esm.sh/jszip@3.10.1';

class CustomError extends Error {
    constructor(message, code) {
        super(message);
        this.code = code;
    }
}

// ZIP에서 index.html 추출 → Blob URL 반환
async function zipToBlobUrl(zipUrl) {
    const { default: JSZip } = await import(JSZipUrl);

    const resp = await fetch(zipUrl);
    if (!resp.ok) throw new CustomError('ZIP 다운로드 실패', 'player/zip-fetch');

    const zip = await JSZip.loadAsync(await resp.arrayBuffer());

    // index.html 탐색 (최상위 우선, 하위 폴더도 허용)
    const entry =
        zip.file('index.html') ??
        zip.file(/\/index\.html$/i)[0] ??
        zip.file(/index\.html$/i)[0];

    if (!entry) {
        throw new CustomError('index.html 없음', 'player/no-index');
    }

    const html = await entry.async('string');
    const blob = new Blob([html], { type: 'text/html' });
    return URL.createObjectURL(blob);
}

export async function loadGame(gameId, container) {
    try {
        const snap = await getDoc(doc(db, 'games', gameId));
        if (!snap.exists()) {
            throw new CustomError('게임을 찾을 수 없음', 'player/not-found');
        }

        const game = snap.data();
        await renderPlayer(container, game);
        return game;
    } catch (err) {
        if (err instanceof CustomError) throw err;
        throw new CustomError(err.message, 'player/load-failed');
    }
}

async function renderPlayer(container, game) {
    const isUnity = game.type === 'unity';

    // HTML/JS 게임: ZIP → Blob URL 변환
    const src = isUnity
        ? game.fileUrl
        : await zipToBlobUrl(game.fileUrl);

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
                    src="${src}"
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
