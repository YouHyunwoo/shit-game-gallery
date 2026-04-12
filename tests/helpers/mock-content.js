// Firebase CDN 모듈 mock 문자열 (page.route에서 서빙)

export const FIREBASE_APP_MOCK = `
export function initializeApp(config) { return { _config: config }; }
export function getApps() { return []; }
export function getApp() { return {}; }
`;

export const FIREBASE_AUTH_MOCK = `
let _user = null;
let _cbs = [];

export class GoogleAuthProvider {
    constructor() { this._scopes = []; }
    addScope(s) { this._scopes.push(s); }
    static credentialFromResult(result) {
        return { accessToken: window.__mockAccessToken || 'mock-access-token' };
    }
}

export function getAuth() {
    return { get currentUser() { return _user; } };
}

export function onAuthStateChanged(auth, cb) {
    _cbs.push(cb);
    _user = typeof window.__mockUser !== 'undefined' ? window.__mockUser : null;
    setTimeout(() => cb(_user), 0);
    return () => { _cbs = _cbs.filter(c => c !== cb); };
}

export async function signInWithPopup(auth, provider) {
    _user = window.__mockUser ?? null;
    _cbs.forEach(c => c(_user));
    return { user: _user };
}

export async function signOut(auth) {
    _user = null;
    _cbs.forEach(c => c(null));
}
`;

export const FIREBASE_FIRESTORE_MOCK = `
export function getFirestore() { return {}; }
export function collection(db, name) { return { _name: name }; }
export function query(ref) { return ref; }
export function orderBy() { return {}; }
export function doc(db, col, id) { return { _col: col, _id: id }; }

function findItem(col, id) {
    const items = (window.__mockFirestore || {})[col] || [];
    return items.find(x => x.id === id);
}

export async function getDocs(ref) {
    const items = (window.__mockFirestore || {})[ref._name] || [];
    return {
        docs: items.map(item => ({
            id: item.id,
            data() { const { id, ...rest } = item; return rest; }
        }))
    };
}

export async function getDoc(ref) {
    const item = findItem(ref._col, ref._id);
    return {
        exists() { return !!item; },
        data() {
            if (!item) return null;
            const { id, ...rest } = item;
            return rest;
        }
    };
}

export async function setDoc(ref, data) {
    if (!window.__mockFirestore) window.__mockFirestore = {};
    const arr = window.__mockFirestore[ref._col] || [];
    window.__mockFirestore[ref._col] = arr;
    const i = arr.findIndex(x => x.id === ref._id);
    const entry = { id: ref._id, ...data };
    if (i >= 0) arr[i] = entry; else arr.push(entry);
}
`;

export const FIREBASE_STORAGE_MOCK = `
export function getStorage() { return {}; }
export function ref(storage, path) { return { _path: path }; }
export function uploadBytesResumable(storageRef, data) {
    const snap = { ref: storageRef };
    return {
        snapshot: snap,
        on(event, progress, error, complete) {
            setTimeout(() => {
                if (progress) progress({ bytesTransferred: 100, totalBytes: 100 });
                if (complete) complete();
            }, 10);
        }
    };
}
export async function getDownloadURL(ref) {
    return 'https://mock-storage.test/' + (ref._path || 'file');
}
`;
