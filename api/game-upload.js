// 게임 메타데이터 Firestore 등록 (관리자 전용)
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

const AdminUid = process.env.ADMIN_UID;

function getAdminApp() {
    if (getApps().length) return getApps()[0];
    const certJson = Buffer.from(
        process.env.FIREBASE_ADMIN_CERT, 'base64'
    ).toString('utf8');
    return initializeApp({ credential: cert(JSON.parse(certJson)) });
}

async function verifyAdmin(req) {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) return false;
    const app = getAdminApp();
    const decoded = await getAuth(app).verifyIdToken(token);
    return decoded.uid === AdminUid;
}

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        const isAdmin = await verifyAdmin(req);
        if (!isAdmin) {
            return res.status(403).json({ error: '관리자 권한 없음' });
        }

        const {
            gameId, title, description, type,
            earlyAccess, tags, thumbnailUrl, fileUrl,
        } = req.body;

        if (!gameId || !title || !type || !fileUrl) {
            return res.status(400).json({ error: '필수 필드 누락' });
        }

        const app = getAdminApp();
        const db = getFirestore(app);

        await db.collection('games').doc(gameId).set({
            title,
            description: description || '',
            type,
            earlyAccess: !!earlyAccess,
            tags: tags || [],
            thumbnailUrl: thumbnailUrl || '',
            fileUrl,
            createdAt: Timestamp.now(),
        });

        return res.status(200).json({ ok: true, gameId });
    } catch (err) {
        console.error('game-upload error:', err.message);
        return res.status(500).json({ error: err.message });
    }
}
