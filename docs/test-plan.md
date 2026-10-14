# 테스트 계획

## 환경
- 로컬: `impls/web/`에서 `vercel dev` (`http://localhost:3000`)
- 자동 검증: 별도 터미널의 `impls/web/`에서 `npm test`
- 프로덕션: `https://shit-game-gallery.vercel.app`

---

## 1. 인증

| 항목 | 방법 | 기대 결과 |
|------|------|-----------|
| Google 로그인 | 로그인 버튼 클릭 | 팝업 후 로그인 성공 |
| 로그아웃 | 로그아웃 버튼 클릭 | 비로그인 상태 전환 |
| Firebase 유저 생성 | 로그인 후 Firebase Auth 확인 | Users 탭에 계정 표시 |

---

## 2. 구독 확인 API (`/api/youtube-check`)

> **주의**: 이 API는 Firebase ID 토큰이 아닌 **Google OAuth Access Token**을 사용합니다.
> Access Token은 로그인 팝업 직후에만 얻을 수 있습니다 (페이지 새로고침 시 소멸).

로그인 직후 브라우저 콘솔에서 실행:

```javascript
// 1. 로그인 후 signIn()이 반환한 accessToken을 변수에 저장해 두었다고 가정
// 2. 또는 google-auth.js의 signIn() 반환값을 콘솔에서 직접 실행:
const { accessToken } = await (await import('/scripts/auth/google-auth.js')).signIn();
const res = await fetch('/api/youtube-check', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${accessToken}` }
});
console.log(await res.json());
```

| 시나리오 | 기대 결과 |
|----------|-----------|
| 비구독자 로그인 | `{ tier: 'none' }` |
| 구독자 로그인 | `{ tier: 'subscriber' }` |
| 멤버십 로그인 | `{ tier: 'member' }` |
| 토큰 없이 호출 | `401` 오류 |

---

## 3. 게임 목록

1. Firestore `games` 컬렉션에 테스트 데이터 직접 입력
2. 갤러리 페이지 접속

| 항목 | 기대 결과 |
|------|-----------|
| 게임 카드 렌더링 | 썸네일, 제목 표시 |
| 비로그인 접속 | 주간 랜덤 3~5개만 표시 |
| 구독자 접속 | 전체 게임 표시 |
| 멤버십 접속 | 얼리 액세스 포함 전체 표시 |

---

## 4. 관리자 페이지 (`/admin`)

| 항목 | 기대 결과 |
|------|-----------|
| 비관리자 접근 | 접근 차단 |
| 관리자 로그인 후 접근 | 업로드 폼 표시 |
| 게임 업로드 | Firestore `games`에 데이터 저장 |

---

## 5. 게임 플레이 (`/play`)

| 항목 | 기대 결과 |
|------|-----------|
| 게임 카드 클릭 | `/play?id=gameId` 이동 |
| iframe 로드 | 게임 정상 실행 |
| 접근 권한 없는 게임 | 접근 차단 메시지 표시 |
