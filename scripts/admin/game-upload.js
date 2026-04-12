// 관리자 게임 업로드 UI 처리
import {
    ref, uploadBytesResumable, getDownloadURL
} from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-storage.js';
import { storage } from '../auth/firebase-init.js';

class CustomError extends Error {
    constructor(message, code) {
        super(message);
        this.code = code;
    }
}

// 파일 → Firebase Storage 업로드 (진행률 콜백)
export function uploadFile(path, file, onProgress) {
    return new Promise((resolve, reject) => {
        const storageRef = ref(storage, path);
        const task = uploadBytesResumable(storageRef, file);

        task.on(
            'state_changed',
            snap => {
                const pct = (snap.bytesTransferred / snap.totalBytes) * 100;
                if (onProgress) onProgress(Math.round(pct));
            },
            err => reject(new CustomError(err.message, 'upload/failed')),
            async () => {
                const url = await getDownloadURL(task.snapshot.ref);
                resolve(url);
            }
        );
    });
}

// 업로드 폼 제출 처리 (idToken: Firebase ID 토큰)
export async function handleUploadSubmit(formData, onProgress, idToken) {
    const { title, description, type, earlyAccess,
        tags, thumbnailFile, gameFile } = formData;

    const gameId = `${Date.now()}-${Math.random().toString(36).slice(2)}`;

    // 썸네일 업로드
    onProgress('thumbnail', 0);
    const thumbnailUrl = await uploadFile(
        `thumbnails/${gameId}`,
        thumbnailFile,
        pct => onProgress('thumbnail', pct)
    );

    // 게임 파일 업로드
    onProgress('game', 0);
    const fileUrl = await uploadFile(
        `games/${gameId}/${gameFile.name}`,
        gameFile,
        pct => onProgress('game', pct)
    );

    // 메타데이터 Firestore 등록 (API 경유)
    const res = await fetch('/api/game-upload', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${idToken}`,
        },
        body: JSON.stringify({
            gameId, title, description, type,
            earlyAccess: !!earlyAccess,
            tags: tags.split(',').map(t => t.trim()).filter(Boolean),
            thumbnailUrl,
            fileUrl,
        }),
    });

    if (!res.ok) {
        const { error } = await res.json();
        throw new CustomError(error || '등록 실패', 'upload/register-failed');
    }

    return gameId;
}
