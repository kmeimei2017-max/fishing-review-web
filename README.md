# 선상낚시 후기 게시판

노션을 데이터베이스로 활용하여 선상낚시 후기를 관리하고, 누구나 웹에서 조회할 수 있는 공개 게시판입니다.

## 🎯 프로젝트 개요

**목적**: 노션 데이터베이스를 활용한 간편한 낚시 후기 발행 및 조회 시스템
**작성자**: 관리자(운영자)가 노션에서 직접 후기 작성
**방문자**: 누구나 웹사이트에서 전체 후기 갤러리를 조회
**핵심 가치**: 별도의 관리 시스템 없이 노션으로 후기를 관리하고, 방문자는 갤러리 형태로 편하게 조회

## 📱 주요 페이지

1. **홈페이지** (`/`) - 전체 후기 갤러리 목록 (검색/필터/페이지네이션)
2. **후기 상세 페이지** (`/review/[id]`) - 고유 URL로 특정 후기 조회 (사진 갤러리 포함)
3. **404 에러 페이지** - 존재하지 않거나 비공개 후기 접근 시 안내

## ⚡ 핵심 기능

- **노션 API 연동**: Notion 데이터베이스에서 후기 데이터 실시간 조회
- **갤러리 목록**: 전체 공개 후기를 카드 그리드로 조회
- **사진 갤러리**: 후기별 여러 장의 사진을 그리드 + 확대(라이트박스)로 표시
- **검색 및 필터**: 제목/작성자/배 이름 검색, 어종·평점·출조일 필터
- **비공개 글 차단**: "공개 여부" 속성이 "공개"인 후기만 노출
- **다크모드**: 라이트/다크/시스템 테마 지원
- **성능 최적화**: API 캐싱(60초) + Request Deduplication

## 🛠️ 기술 스택

- **Framework**: Next.js 15.5.3 (App Router + Turbopack)
- **Runtime**: React 19
- **Language**: TypeScript 5.x
- **Styling**: TailwindCSS v4
- **UI Components**: shadcn/ui (Radix UI)
- **External API**: @notionhq/client (Notion API 공식 SDK)

## 🚀 시작하기

### 1. 노션 데이터베이스 준비

`docs/notion-guide.md` 문서를 참고하여 노션에 후기 데이터베이스를 먼저 만들어주세요.

### 2. 의존성 설치

```bash
npm install
```

### 3. 환경 변수 설정

`.env.local.example`을 `.env.local`로 복사하고 아래 내용을 채워주세요:

```bash
NOTION_API_KEY=secret_xxxxxxxxxxxxx
NOTION_DATABASE_ID=xxxxxxxxxxxxx
```

### 4. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000) 접속

### 5. 빌드 및 배포

```bash
npm run build
npm start
```

## 📖 문서

- [PRD 문서](./docs/PRD.md) - 상세 요구사항 및 기능 명세
- [노션 작성 가이드](./docs/notion-guide.md) - 노션에서 후기 작성하는 방법
- [개발 가이드](./CLAUDE.md) - 개발 지침 및 규칙

## 🗄️ 노션 데이터베이스 구조

### Reviews (후기 데이터베이스)

- 후기 제목 (Title)
- 작성자 (Text)
- 배 이름 (Text)
- 출조 날짜 (Date)
- 어종/조황 (Multi-select)
- 평점 (Select: ⭐️1~⭐️5)
- 사진 (Files & media)
- 후기 내용 (Text)
- 공개 여부 (Select: 공개/비공개(작성중))
- 조황 마릿수 (Number, 선택)
- 포인트/지역 (Text, 선택)

## 📦 주요 스크립트

```bash
npm run dev         # 개발 서버 실행 (Turbopack)
npm run build       # 프로덕션 빌드
npm run start       # 프로덕션 서버 실행
npm run lint        # ESLint 실행
npm run format      # Prettier 포맷팅
npm run typecheck   # TypeScript 타입 체크
npm run check-all   # 모든 검사 통합 실행
```

## 📝 라이선스

MIT
