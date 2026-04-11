// 날짜 시드 기반 비구독자 주간 랜덤 게임 선택
const GameCount = { min: 3, max: 5 };

// 시드 기반 결정론적 난수 (같은 주 = 동일 결과)
function seededRandom(seed) {
    let s = seed;
    return () => {
        s = (s * 1664525 + 1013904223) & 0xffffffff;
        return (s >>> 0) / 0x100000000;
    };
}

function getWeekSeed() {
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const week = Math.ceil(
        ((now - startOfYear) / 86400000 + startOfYear.getDay() + 1) / 7
    );
    return now.getFullYear() * 100 + week;
}

// games: Firestore에서 가져온 전체 게임 배열
export function pickWeeklyGames(games) {
    const rand = seededRandom(getWeekSeed());
    const count = GameCount.min
        + Math.floor(rand() * (GameCount.max - GameCount.min + 1));

    const shuffled = [...games];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(rand() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    return shuffled.slice(0, count);
}
