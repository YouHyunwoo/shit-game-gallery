// 구독 상태 확인 및 Firestore 캐싱 (1시간 유효)
import {
    doc, getDoc, setDoc
} from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js';
import { db } from '../auth/firebase-init.js';

// 티어: 'member' | 'subscriber' | 'none'
const CacheExpireMs = 60 * 60 * 1000;

class CustomError extends Error {
    constructor(message, code) {
        super(message);
        this.code = code;
    }
}

export async function getUserTier(uid) {
    try {
        const ref = doc(db, 'users', uid);
        const snap = await getDoc(ref);

        if (snap.exists()) {
            const data = snap.data();
            const age = Date.now() - data.lastChecked?.toMillis();
            // 캐시 유효 시 Firestore 조회 생략
            if (age < CacheExpireMs) return data.tier;
        }
        return null;
    } catch (err) {
        throw new CustomError(err.message, 'sub/fetch-failed');
    }
}

export async function refreshUserTier(uid, accessToken) {
    try {
        const res = await fetch(
            `/api/youtube-check?uid=${uid}`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`,
                },
            }
        );
        if (!res.ok) throw new CustomError('API 오류', 'sub/api-error');

        const { tier } = await res.json();
        await setDoc(doc(db, 'users', uid), {
            tier,
            lastChecked: new Date(),
        }, { merge: true });

        return tier;
    } catch (err) {
        if (err instanceof CustomError) throw err;
        throw new CustomError(err.message, 'sub/refresh-failed');
    }
}

// 캐시 우선 조회, 없으면 API 호출
export async function ensureUserTier(uid, accessToken) {
    const cached = await getUserTier(uid);
    if (cached) return cached;
    return refreshUserTier(uid, accessToken);
}
