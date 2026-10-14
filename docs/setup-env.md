# 환경 변수 설정 가이드

## 1. Firebase 프로젝트 생성

1. [Firebase Console](https://console.firebase.google.com/) 접속
2. **프로젝트 추가** 클릭 → 프로젝트 이름 입력
3. Google Analytics 설정 (선택 사항) → **프로젝트 만들기**

### 필요 서비스 활성화

| 서비스 | 활성화 경로 |
|--------|------------|
| Authentication | Build > Authentication > 시작하기 |
| Firestore | Build > Firestore Database > 데이터베이스 만들기 |
| Storage | Build > Storage > 시작하기 |

#### Authentication 설정
- **로그인 방법** 탭 → **Google** 활성화
- 프로젝트 지원 이메일 선택 → 저장

#### Firestore 설정
- 프로덕션 모드로 시작 (보안 규칙 수동 설정 필요)
- 위치: `asia-northeast3` (서울) 권장

#### Firestore 보안 규칙

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /games/{gameId} {
      allow read: if true;
      allow write: if request.auth != null
        && request.auth.uid == 'YOUR_ADMIN_UID';
    }
    match /users/{uid} {
      allow read, write: if request.auth != null
        && request.auth.uid == uid;
    }
  }
}
```

#### Storage 보안 규칙

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /games/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null
        && request.auth.uid == 'YOUR_ADMIN_UID';
    }
    match /thumbnails/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null
        && request.auth.uid == 'YOUR_ADMIN_UID';
    }
  }
}
```

---

## 2. Firebase 클라이언트 설정값 확인

1. Firebase Console > **프로젝트 설정** (톱니바퀴)
2. **일반** 탭 > 하단 **내 앱** > 웹 앱 추가 (없으면 `</>` 클릭)
3. 앱 닉네임 입력 후 **앱 등록**
4. 아래 값들을 복사

```js
// 예시 값 (실제 값으로 교체)
const firebaseConfig = {
    apiKey: "AIza...",
    authDomain: "your-project.firebaseapp.com",
    projectId: "your-project-id",
    storageBucket: "your-project.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:abc123"
};
```

---

## 3. Firebase Admin SDK 서비스 계정 키 발급

1. Firebase Console > **프로젝트 설정** > **서비스 계정** 탭
2. **새 비공개 키 생성** 클릭 → JSON 파일 다운로드
3. JSON 파일을 Base64로 인코딩:

```bash
# macOS/Linux
base64 -i serviceAccountKey.json

# Windows PowerShell
[Convert]::ToBase64String(
  [IO.File]::ReadAllBytes("serviceAccountKey.json")
)
```

4. 인코딩된 문자열 → `FIREBASE_ADMIN_CERT` 환경 변수에 저장

---

## 4. YouTube Data API v3 설정

1. [Google Cloud Console](https://console.cloud.google.com/) 접속
2. Firebase와 동일한 프로젝트 선택
3. **API 및 서비스** > **라이브러리** 검색: `YouTube Data API v3` → 활성화
4. **API 및 서비스** > **사용자 인증 정보** > **사용자 인증 정보 만들기**

### API 키 생성 (서버용)
- **API 키** 선택
- 키 제한: HTTP 레퍼러 제한 또는 IP 제한 권장
- 생성된 키 → `YOUTUBE_API_KEY` 환경 변수

### OAuth 2.0 클라이언트 ID (이미 Firebase에서 처리됨)
- Firebase Auth Google 로그인 사용 시 별도 OAuth 클라이언트 불필요
- Firebase가 Google OAuth를 내부적으로 처리

### YouTube 채널 ID 확인
1. YouTube 채널 페이지 접속
2. URL: `youtube.com/channel/UCxxxxxxxxxx` → `UCxxxxxxxxxx` 부분이 채널 ID
3. 또는 YouTube Studio > **채널 맞춤설정** > URL에서 확인

---

## 5. 관리자 UID 확인

1. Firebase Console > **Authentication** > **사용자** 탭
2. 관리자 Google 계정으로 앱에 로그인
3. 로그인 후 사용자 목록에서 UID 복사 (예: `abc123xyz...`)
4. 브라우저 콘솔에서도 확인 가능:

```js
import { getAuth } from 'firebase/auth';
console.log(getAuth().currentUser.uid);
```

---

## 6. Vercel 환경 변수 등록

### CLI 방법

```bash
# Vercel CLI 설치
npm i -g vercel

# 로그인 및 프로젝트 연결
cd impls/web
vercel login
vercel link

# 환경 변수 등록 (하나씩 입력)
vercel env add FIREBASE_PROJECT_ID
vercel env add FIREBASE_API_KEY
vercel env add FIREBASE_AUTH_DOMAIN
vercel env add FIREBASE_STORAGE_BUCKET
vercel env add FIREBASE_ADMIN_CERT
vercel env add YOUTUBE_API_KEY
vercel env add YOUTUBE_CHANNEL_ID
vercel env add ADMIN_UID
```

### 대시보드 방법
1. [Vercel Dashboard](https://vercel.com/dashboard) > 프로젝트 선택
2. **Settings** > **Environment Variables**
3. 아래 표의 변수를 하나씩 추가

### 배포 기준 경로

Settings > Build and Deployment > Root Directory를 `impls/web`으로 설정.
`impls/web/vercel.json`과 `impls/web/package.json`을 기준으로 배포.

---

## 7. 환경 변수 전체 목록

| 변수명 | 설명 | 사용 위치 |
|--------|------|-----------|
| `FIREBASE_PROJECT_ID` | Firebase 프로젝트 ID | 클라이언트 + 서버 |
| `FIREBASE_API_KEY` | Firebase 웹 API 키 | 클라이언트 |
| `FIREBASE_AUTH_DOMAIN` | Firebase Auth 도메인 | 클라이언트 |
| `FIREBASE_STORAGE_BUCKET` | Storage 버킷 주소 | 클라이언트 |
| `FIREBASE_MESSAGING_SENDER_ID` | FCM Sender ID | 클라이언트 |
| `FIREBASE_APP_ID` | Firebase 앱 ID | 클라이언트 |
| `FIREBASE_ADMIN_CERT` | Admin SDK JSON (Base64) | 서버 전용 |
| `YOUTUBE_API_KEY` | YouTube Data API 키 | 서버 전용 |
| `YOUTUBE_CHANNEL_ID` | 구독 확인 대상 채널 ID | 서버 전용 |
| `ADMIN_UID` | 관리자 Firebase UID | 서버 전용 |

> **주의**: `FIREBASE_ADMIN_CERT`, `YOUTUBE_API_KEY`, `ADMIN_UID`는
> 절대 클라이언트 코드에 노출 금지. Vercel 서버리스 함수에서만 사용.

---

## 8. 로컬 개발 환경 설정

`impls/web/.env.local` 파일 생성 (루트 `.gitignore`에 포함됨):

```env
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_API_KEY=AIza...
FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
FIREBASE_STORAGE_BUCKET=your-project.appspot.com
FIREBASE_MESSAGING_SENDER_ID=123456789
FIREBASE_APP_ID=1:123456789:web:abc123
FIREBASE_ADMIN_CERT=base64encodedstring...
YOUTUBE_API_KEY=AIza...
YOUTUBE_CHANNEL_ID=UCxxxxxxxxxx
ADMIN_UID=abc123xyz...
```

로컬 실행:

```bash
cd impls/web
vercel dev
# http://localhost:3000 에서 서버리스 함수 포함 실행
```
