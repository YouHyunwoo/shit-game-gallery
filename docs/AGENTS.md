# AGENTS.md

## 1. Project

### 개요
직접 제작한 게임을 업로드하고 유저가 즐길 수 있는 게임 갤러리 웹 플랫폼

### 핵심 기능
- **게임 갤러리**: 게임 목록 표시, 선택 시 플레이 페이지 이동
- **게임 플레이어**: HTML/JS 및 Unity WebGL 게임 지원 (iframe)
- **구독 시스템**: YouTube 채널 연동 3단계 티어
- **관리자 페이지**: 게임 업로드 및 메타데이터 관리

### 구독 티어
| 티어 | 조건 | 혜택 |
|------|------|------|
| 비구독자 | 미로그인 또는 미구독 | 주간 랜덤 3~5개 게임만 플레이 |
| 일반 구독자 | YouTube 채널 무료 구독 | 전체 게임 열람 + 신규 게임 우선 체험 |
| 멤버십 구독자 | YouTube 유료 채널 멤버십 | 모든 게임 무제한 + 얼리 액세스 |

### 기술 스택
| 구분 | 기술 | 무료 한도 |
|------|------|-----------|
| 호스팅 | Vercel (Hobby) | 100GB/월, 서버리스 1M/월 |
| DB | Firebase Firestore | 1GB, 50K 읽기/일 |
| 인증 | Firebase Auth (Google OAuth) | 무제한 |
| 스토리지 | Firebase Storage | 1GB, 10GB 전송/월 |
| 구독 확인 | YouTube Data API v3 | 10,000 units/일 |
| API | Vercel Serverless Functions | Node.js |

### 폴더 구조
```
ShitGameGallary/
├── docs/                    # 문서 및 참고 자료
│   ├── AGENTS.md            # 프로젝트 작업 규칙
│   ├── README.md            # 프로젝트 안내
│   ├── setup-env.md         # 환경 설정
│   ├── admin-guide.md       # 관리자 안내
│   └── test-plan.md         # 검증 안내
└── impls/                   # 구현별 프로젝트
    └── web/                 # 웹 구현 및 실행 설정
        ├── index.html       # 갤러리 진입점
        ├── play.html        # 게임 플레이 페이지
        ├── admin.html       # 관리자 업로드 페이지
        ├── api/             # 서버리스 함수
        ├── scripts/         # 기능별 클라이언트 모듈
        ├── styles/          # 스타일
        ├── assets/          # 서비스 리소스
        ├── games/           # 로컬 게임
        ├── tests/           # 브라우저 테스트
        ├── package.json     # 의존성 및 실행 명령
        └── vercel.json      # Vercel 라우팅 설정
```

- 문서·자료는 `docs/`, 구현·설정·의존성은 `impls/`에 저장
- 웹 구현은 `impls/web/`에 저장
- Git 메타데이터 `.git/`, `.gitignore`는 루트 유지
- 웹 실행 명령의 기준 디렉터리는 `impls/web/`
- Vercel Root Directory는 `impls/web`

---

## 2. Agent

### 역할
- **팀장** — 아키텍처 설계, 작업 계획 수립, 구현 주도

### 페르소나
- 정보 전달: **개조식**, 10어절 이내
- 나쁜 예: "이번 분기 매출은 지난 분기 대비 10% 상승할 것으로 예상하고 있습니다."
- 좋은 예: "이번 분기 매출 전분기 대비 10% 상승 전망"

---

## 3. Rule

### 코드 스타일
- 주석: **1줄**, 10어절 이내, 간결하게
- 파일 길이: **100줄 이하** 유지
- 기능별 파일 분리 및 폴더 구조로 모듈화, 모듈화는 기능별로
- ES Modules (`import`/`export`) 사용
- Naming:
  - 파일: kebab-case (e.g., `game-upload.js`)
  - 변수/함수: camelCase
  - 상수: PascalCase
- Formatting:
  - 4 spaces indentation
  - 80chars line limit
- Error Handling:
  - try/catch 필수
  - `CustomError` 클래스 정의

### GitHub 브랜치 전략
- `main` — 배포 브랜치 (Vercel)
- `feat/<기능명>` — 기능 개발 브랜치
- PR 머지 후 feat 브랜치 삭제

### 테스트
- 별도 테스트 프레임워크 없음
- 브라우저 콘솔에서 직접 검증
- 로컬: `cd impls/web` 후 `vercel dev` 실행

### 커밋
- Co-Authored-By 트레일러 작성하지 않음
