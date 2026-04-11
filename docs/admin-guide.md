# 관리자 게임 업로드 가이드

## 1. 관리자 계정 설정

### Firebase UID 확인 방법

1. [admin 페이지](/admin.html) 접속 → Google 로그인
2. 브라우저 개발자 도구 콘솔에서 UID 확인:

```js
// 콘솔에 입력
import { getAuth } from 'firebase/auth';
console.log(getAuth().currentUser.uid);
```

3. 또는 Firebase Console > **Authentication** > **사용자** 탭에서 확인

### 환경 변수 등록

확인한 UID를 Vercel 환경 변수에 등록:

```bash
vercel env add ADMIN_UID
# 프롬프트에 UID 입력
```

> Firestore/Storage 보안 규칙의 `YOUR_ADMIN_UID`도 동일하게 교체 필요
> → `docs/setup-env.md` 4번 항목 참고

---

## 2. 게임 파일 준비

### HTML/JS 게임

```
my-game/
├── index.html      # 게임 진입점 (필수)
├── game.js         # 게임 로직
├── style.css       # 게임 스타일
└── assets/         # 이미지, 사운드 등
```

- 진입점 파일명: **반드시 `index.html`**
- 게임 폴더 전체를 ZIP으로 압축: `my-game.zip`

### Unity WebGL 게임

Unity Build 설정:
1. **File > Build Settings** → **WebGL** 선택
2. **Player Settings** → **Compression Format**: `Disabled` 권장
   (Gzip/Brotli는 서버 설정 필요)
3. **Build** 클릭 → Build 폴더 생성

```
Build/
├── index.html
├── Build/
│   ├── game.loader.js
│   ├── game.data
│   ├── game.framework.js
│   └── game.wasm
└── TemplateData/
```

- Build 폴더 전체를 ZIP으로 압축: `my-unity-game.zip`
- 주의: Unity WebGL 빌드는 **50MB~200MB** 이상일 수 있음
  → Firebase Storage 무료 한도(1GB) 고려 필요

---

## 3. 썸네일 이미지 준비

| 항목 | 규격 |
|------|------|
| 형식 | JPG 또는 PNG |
| 권장 크기 | 400 × 300px (4:3 비율) |
| 최대 용량 | 500KB 이하 |

---

## 4. 게임 업로드 절차

### 4-1. 관리자 페이지 접속

1. `/admin.html` 접속
2. Google 로그인 (관리자 계정만 접근 가능)
3. 비관리자 접근 시 → 자동으로 갤러리 페이지로 이동

### 4-2. 메타데이터 입력

| 항목 | 필수 | 설명 |
|------|------|------|
| 게임 제목 | ✅ | 갤러리에 표시될 이름 |
| 게임 설명 | ✅ | 간단한 게임 소개 (2~3줄) |
| 게임 타입 | ✅ | `html` 또는 `unity` 선택 |
| 썸네일 | ✅ | 400×300px 이미지 파일 |
| 태그 | ❌ | 쉼표 구분 (예: `액션, 퍼즐, 2D`) |
| 얼리 액세스 | ❌ | 체크 시 멤버십 구독자만 플레이 가능 |

### 4-3. 파일 업로드

1. **썸네일 선택** → 미리보기 확인
2. **게임 파일 선택** → ZIP 파일 선택
3. **업로드** 버튼 클릭
4. 진행 표시줄 완료 대기 (파일 크기에 따라 수~수십 초)

### 4-4. 업로드 완료 확인

업로드 성공 시:
- 성공 메시지 표시
- Firebase Storage: `games/<gameId>/` 에 파일 저장
- Firebase Firestore: `games/<gameId>` 문서 생성

---

## 5. 업로드 후 확인 방법

### 갤러리 페이지 확인

1. `/index.html` (갤러리) 접속
2. 새로 업로드한 게임 카드 확인
3. 클릭 → 플레이 페이지에서 정상 로드 확인

### Firebase Console 확인

**Firestore**:
- `games` 컬렉션 > 새 문서 확인
- 필드: `title`, `description`, `type`, `fileUrl`, `thumbnailUrl`, `createdAt`, `tags`

**Storage**:
- `games/<gameId>/` 폴더에 ZIP 파일 확인
- `thumbnails/<gameId>` 파일 확인

---

## 6. 게임 수정 방법

현재 UI에서 직접 수정 불가 → Firebase Console에서 수동 수정:

1. Firebase Console > **Firestore** > `games` 컬렉션
2. 수정할 게임 문서 클릭
3. 필드 값 직접 편집

> 게임 파일 교체가 필요한 경우:
> 1. 기존 게임 삭제 후 재업로드
> 2. 또는 Storage에서 직접 파일 교체 후 Firestore URL 수동 업데이트

---

## 7. 게임 삭제 방법

Firebase Console에서 수동 삭제:

1. **Firestore** > `games` 컬렉션 > 해당 문서 선택 > **문서 삭제**
2. **Storage** > `games/<gameId>/` 폴더 > 삭제
3. **Storage** > `thumbnails/<gameId>` > 삭제

> 삭제 후 갤러리 페이지 새로고침으로 반영 확인

---

## 8. 주의 사항

- Unity WebGL Compression이 `Gzip`인 경우 Vercel에서 별도 헤더 설정 필요
- 게임 파일은 Firebase Storage에 저장 → 무료 한도(1GB) 초과 시 과금 발생
- `index.html`이 없는 게임 파일은 플레이 불가
- 관리자 UID 변경 시 Firestore/Storage 보안 규칙도 함께 업데이트
