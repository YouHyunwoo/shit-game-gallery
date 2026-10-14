# shit-game-gallery

직접 제작한 게임을 업로드하고 플레이하는 웹 플랫폼.

## 폴더 구조

```text
ShitGameGallary/
├── docs/                   # 문서 및 참고 자료
│   ├── AGENTS.md            # 프로젝트 작업 규칙
│   ├── README.md            # 프로젝트 안내
│   ├── setup-env.md         # 환경 설정
│   ├── admin-guide.md       # 관리자 안내
│   └── test-plan.md         # 검증 안내
└── impls/                  # 구현별 프로젝트
    └── web/                # 웹 구현 및 실행 설정
        ├── api/            # 서버리스 함수
        ├── scripts/        # 클라이언트 모듈
        ├── styles/         # 스타일
        ├── assets/         # 서비스 리소스
        ├── games/          # 로컬 게임 및 ZIP
        ├── tests/          # 브라우저 테스트
        ├── index.html      # 갤러리
        ├── play.html       # 게임 플레이어
        ├── admin.html      # 관리자 페이지
        ├── package.json    # 의존성 및 명령
        └── vercel.json     # 라우팅 설정
```

- 문서, 기획, 참고 자료는 `docs/`에 저장.
- 웹 코드, 실행 리소스, 설정, 의존성은 `impls/web/`에 저장.
- `.git/`, `.gitignore`는 저장소 루트에 유지.
- 작업 규칙은 [AGENTS.md](AGENTS.md) 참고.

## 로컬 실행

저장소 루트에서 실행:

```sh
cd impls/web
npm ci
vercel dev
```

- 로컬 환경 변수: `impls/web/.env.local`.
- Vercel 연결 정보: `impls/web/.vercel/`.
- 별도 터미널에서 `cd impls/web` 후 `npm test` 실행.
- 앱과 API의 URL은 기존 경로 유지.

## Vercel 배포

프로젝트 Settings → Build and Deployment → Root Directory를
`impls/web`으로 설정하고 저장한 뒤 배포.

[Vercel Root Directory 안내](https://vercel.com/docs/builds/configure-a-build#root-directory)

## 문서

- [환경 변수 설정](setup-env.md)
- [관리자 업로드](admin-guide.md)
- [테스트 계획](test-plan.md)
