// Google OAuth 로그인/로그아웃 및 사용자 상태 관리
import {
    GoogleAuthProvider,
    signInWithPopup,
    signOut,
    onAuthStateChanged,
} from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js';
import { auth } from './firebase-init.js';

class CustomError extends Error {
    constructor(message, code) {
        super(message);
        this.code = code;
    }
}

// YouTube 구독 확인용 스코프 포함 provider
const provider = new GoogleAuthProvider();
provider.addScope('https://www.googleapis.com/auth/youtube.readonly');

export async function signIn() {
    try {
        const result = await signInWithPopup(auth, provider);
        const credential = GoogleAuthProvider.credentialFromResult(result);
        // accessToken: YouTube API 호출에 사용
        return {
            user: result.user,
            accessToken: credential.accessToken,
        };
    } catch (err) {
        throw new CustomError(err.message, err.code);
    }
}

export async function signOutUser() {
    try {
        await signOut(auth);
    } catch (err) {
        throw new CustomError(err.message, err.code);
    }
}

// 인증 상태 변화 콜백 등록
export function onAuthChange(callback) {
    return onAuthStateChanged(auth, callback);
}

export function getCurrentUser() {
    return auth.currentUser;
}
