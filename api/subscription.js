// 구독 상태 조회/갱신 서버리스 함수
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

function getAdminApp() {
    if (getApps().length) return getApps()[0];
    const certJson = Buffer.from(
        process.env.FIREBASE_ADMIN_CERT, 'base64'
    ).toString('utf8');
    return initializeApp({ credential: cert(JSON.parse(certJson)) });
}

export default async function handler(req, res) {
    const { uid } = req.query;
    if (!uid) return res.status(400).json({ error: 'uid 필요' });

    try {
        const app = getAdminApp();
        const db = getFirestore(app);

        if (req.method === 'GET') {
            const snap = await db.collection('users').doc(uid).get();
            if (!snap.exists) {
                return res.status(200).json({ tier: 'none' });
            }
            return res.status(200).json({ tier: snap.data().tier });
        }

        if (req.method === 'POST') {
            const { tier } = req.body;
            await db.collection('users').doc(uid).set(
                { tier, lastChecked: new Date() },
                { merge: true }
            );
            return res.status(200).json({ ok: true });
        }

        return res.status(405).json({ error: 'Method Not Allowed' });
    } catch (err) {
        console.error('subscription error:', err.message);
        return res.status(500).json({ error: err.message });
    }
}
