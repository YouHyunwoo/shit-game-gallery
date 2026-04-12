// YouTube 구독/멤버십 확인 서버리스 함수
const CHANNEL_ID = process.env.YOUTUBE_CHANNEL_ID;

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const accessToken = req.headers.authorization?.replace('Bearer ', '');
    if (!accessToken) {
        return res.status(401).json({ error: '인증 토큰 없음' });
    }

    try {
        const tier = await checkYoutubeTier(accessToken);
        return res.status(200).json({ tier });
    } catch (err) {
        console.error('YouTube check error:', err.message);
        return res.status(500).json({ error: err.message });
    }
}

async function checkYoutubeTier(accessToken) {
    // 멤버십 확인 (채널 멤버십 활성화된 경우)
    try {
        const memberRes = await fetch(
            `https://www.googleapis.com/youtube/v3/members`
            + `?part=snippet&mode=listMembers`,
            { headers: { Authorization: `Bearer ${accessToken}` } }
        );
        if (memberRes.ok) {
            const data = await memberRes.json();
            if (data.items?.length > 0) return 'member';
        }
    } catch (_) { /* 멤버십 API 미지원 채널은 스킵 */ }

    // 일반 구독 확인 (OAuth 전용, API key 혼용 금지)
    const subRes = await fetch(
        `https://www.googleapis.com/youtube/v3/subscriptions`
        + `?part=snippet&mine=true&forChannelId=${CHANNEL_ID}`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    if (!subRes.ok) return 'none';
    const subData = await subRes.json();
    return subData.items?.length > 0 ? 'subscriber' : 'none';
}
