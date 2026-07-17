# Development Guidelines

AI Agent 전용 프로젝트 표준 문서. 노션을 헤드리스 CMS로 쓰는 선상낚시 후기 게시판(읽기 전용 공개 사이트, 관리자는 노션에서만 작성)이며, 회원 규모가 커지면 Supabase(PostgreSQL)로 전환될 예정이다. 이 문서는 코드 수정 시 반드시 지켜야 할 프로젝트 고유 규칙만 담는다. 일반적인 Next.js/React/TypeScript 지식은 다루지 않는다.

## 노션 접근 계층 구조 (최우선 규칙)

### 계층을 우회하지 말 것

- 데이터 흐름은 반드시 `Page/Component → src/lib/services/review.service.ts → src/lib/notion.ts (Client) → src/lib/utils/notion-parser.ts (변환) → src/types/notion.ts (타입)` 순서를 따른다.
- **금지**: `src/app/**`, `src/components/**` 안에서 `@notionhq/client`를 직접 import하거나 `notion.pages.retrieve`, `notion.dataSources.query` 등을 직접 호출하는 것.
- **허용**: 페이지/컴포넌트는 오직 `src/lib/services/review.service.ts`가 export하는 함수(`getOptimizedReview`, `getReviewsFromNotion`, `searchReviews`)만 호출한다.
- 이유: 2단계 스케일업 시 `review.service.ts` 내부 구현만 Supabase 쿼리로 교체하고 UI 코드는 그대로 유지하기 위함(`CLAUDE.md` 참조).
- 새로운 노션 조회 기능이 필요하면 `review.service.ts`에 함수를 추가하고, 노션 SDK 호출은 그 안에서만 수행한다.

### data_source_id 사용 (database_id 아님)

- Notion API v5(`notionVersion: '2025-09-03'`, `src/lib/notion.ts`)에서 데이터베이스를 쿼리할 때는 `database_id`가 아니라 `data_source_id`를 사용해야 한다.
- `data_source_id`는 반드시 `src/lib/notion.ts`의 `getDataSourceId()`를 통해 조회한다. 이 함수는 모듈 스코프 변수 `cachedDataSourceId`에 결과를 캐싱하므로, 직접 `notion.databases.retrieve()`를 호출해 값을 재계산하지 않는다.
- `notion.dataSources.query({ data_source_id, ... })` 형태로만 데이터베이스를 조회한다. `notion.databases.query()`(v4 방식)를 사용하지 않는다.

## 노션 속성 스키마 동기화 (다중 파일 연쇄 수정 필수)

- 노션 데이터베이스의 한글 속성명(`후기 제목`, `작성자`, `사진`, `후기 내용`, `공개 여부`)은 `src/types/notion.ts`의 `ReviewPageProperties` 인터페이스에 리터럴 키로 하드코딩되어 있다.
- 노션 DB의 속성명(한글 라벨) 또는 속성 타입이 변경되면 아래 3개 파일을 **동시에** 수정해야 한다. 하나만 고치면 런타임에 조용히 빈 값(`''`, `[]`, `'draft'`)이 반환된다.
  1. `src/types/notion.ts` — `ReviewPageProperties` 키/타입, `isReviewPage()` 타입가드의 체크 키
  2. `src/lib/utils/notion-parser.ts` — `transformNotionToReview()`에서 `props['속성명']` 접근 부분
  3. 공개여부 값이 바뀐 경우 `src/lib/constants.ts` — `KOREAN_TO_VISIBILITY_MAP`, `PUBLISHED_VISIBILITY_VALUE`
- 새 노션 속성(예: 배 이름, 평점, 어종)을 UI에 노출하려면 `ReviewPageProperties`에 필드를 추가하고, `notion-parser.ts`의 `transformNotionToReview()`와 `src/types/review.ts`의 `Review` 인터페이스도 함께 확장한다. 셋 중 하나라도 누락하면 타입은 통과하지만 데이터가 누락된다.

## 비공개 후기 노출 차단 (보안 규칙, 예외 없음)

- "공개 여부"가 "공개"(`PUBLISHED_VISIBILITY_VALUE`, `src/lib/constants.ts`)가 아닌 후기는 절대로 웹에 노출되면 안 된다.
- 목록/검색 함수(`getReviewsFromNotion`, `searchReviews`, `review.service.ts`)를 추가/수정할 때는 반드시 `PUBLISHED_ONLY_FILTER`를 Notion 쿼리 필터에 포함시킨다(단독이거나 `and` 배열의 첫 항목으로).
- 상세 조회(`fetchReviewPage`, `review.service.ts`)는 페이지를 가져온 뒤 `page.properties['공개 여부']?.select?.name !== PUBLISHED_VISIBILITY_VALUE`일 때 `ERROR_MESSAGES.REVIEW_NOT_FOUND`를 던져 비공개 후기가 직접 URL 접근으로도 노출되지 않도록 이중 방어한다. 이 체크를 제거하거나 우회하는 수정은 금지한다.
- 새로 추가하는 모든 노션 조회 함수(목록/검색/상세 무관)는 이 두 가지 방어 패턴 중 하나를 반드시 포함해야 한다.

## 환경변수/외부 설정

- 모든 환경변수는 `src/lib/env.ts`의 `envSchema`(zod)로만 접근한다. `process.env.X`를 다른 파일에서 직접 읽지 않는다.
- 새 환경변수를 추가할 때는 `envSchema`에 zod 필드를 추가하고 `env` export 객체의 `envSchema.parse({...})` 호출부에도 키를 추가한다. 둘 중 하나만 하면 값이 `undefined`로 유실된다.
- `NOTION_API_KEY`는 `secret_` 또는 `ntn_` 접두사, `NOTION_DATABASE_ID`는 정확히 32자여야 하는 검증 규칙을 유지한다(노션 API 키 포맷 변경 시에만 수정).
- 노션 파일 호스팅 도메인이 추가/변경되면(예: 새 리전 S3 버킷) `next.config.ts`의 `images.remotePatterns`에 해당 hostname을 추가해야 한다. 누락 시 `next/image`가 해당 이미지를 렌더링하지 못하고 에러를 던진다. 현재 등록된 도메인: `prod-files-secure.s3.us-west-2.amazonaws.com`, `prod-files-secure-apne2.s3.ap-northeast-2.amazonaws.com`, `www.notion.so`, `s3.us-west-2.amazonaws.com`.

## 로깅

- API/서버 로직에서 `console.log`/`console.error`를 직접 사용하지 않는다. `src/lib/logger.ts`의 `logger.info`/`logger.warn`/`logger.error`를 사용한다.
- `logger`는 컨텍스트 객체의 키 이름에 `apikey`, `password`, `token`, `secret`, `auth`, `credential`, `private` 문자열이 포함되면 값을 자동으로 `[REDACTED]`로 마스킹한다(`sanitizeContext`, `src/lib/logger.ts`). 민감하지 않은 값을 로그로 남기고 싶다면 이 키워드들을 포함하지 않는 키 이름을 사용한다.
- Notion API 에러를 로깅할 때는 기존 함수들(`fetchReviewPage`, `getReviewsFromNotion`, `searchReviews`)처럼 `logger.error(메시지, { 관련 컨텍스트 })` 패턴을 따르고, `ERROR_MESSAGES`(`src/lib/constants.ts`)에 정의된 사용자 노출용 메시지와 내부 로그 메시지를 분리 유지한다.

## 캐싱

- 후기 상세 조회는 `src/lib/cache.ts`의 `createCachedReviewFetcher`(60초 `unstable_cache`, 태그 `'review'`)와 `getReviewWithDedup`(동시 요청 중복 제거)로 이중 래핑되어 `getOptimizedReview`로 노출된다(`review.service.ts`). 상세 페이지(`src/app/review/[id]/page.tsx`)는 반드시 `getOptimizedReview`를 사용하고, `getReviewFromNotion`을 직접 호출하지 않는다.
- 목록/검색(`getReviewsFromNotion`, `searchReviews`)은 현재 이 캐싱 래퍼를 거치지 않는다(요청마다 노션에서 직접 조회). 목록에도 캐싱을 추가하려면 `cache.ts`에 동일한 `unstable_cache` 패턴으로 새 래퍼를 만들고, 캐시 태그를 재사용하지 말고 구분되는 태그를 부여한다(무효화 범위 충돌 방지).

## 문서 신뢰도 — 기존 가이드 문서 중 실제와 다른 부분

- `docs/guides/project-structure.md`는 이 프로젝트가 아닌 범용 스타터킷(`claude-nextjs-starters`) 템플릿 문서이며 다음 내용은 **이 프로젝트에 존재하지 않는다**: `src/app/login/`, `src/app/signup/`, `src/components/navigation/`, `src/components/sections/`, 그리고 `@/ui`, `@/utils`, `@/hooks`(alias) 등 다중 경로 별칭. 실제 `tsconfig.json`에 정의된 별칭은 `@/*` → `./src/*` 하나뿐이다. 폴더 구조나 경로 별칭 관련 결정을 할 때 이 문서를 근거로 삼지 말고, `src/` 실제 구조와 `tsconfig.json`/`components.json`을 직접 확인한다.
- `README.md`의 "노션 데이터베이스 구조" 절에는 배 이름/출조 날짜/어종/평점/조황 마릿수/포인트 등 속성이 나열되어 있지만, 현재 `src/types/notion.ts`와 `notion-parser.ts`는 이 중 제목/작성자/사진/내용/공개여부 5개만 실제로 파싱한다. 나머지 속성을 다루는 코드가 있다고 가정하지 말고, 필요 시 위 "노션 속성 스키마 동기화" 규칙에 따라 직접 추가한다.

## 테스트

- 테스트 프레임워크가 구성되어 있지 않다(`tests/e2e/`는 빈 디렉터리, `package.json`에 test 스크립트 없음). 존재하지 않는 `npm test`/`npm run test:e2e` 등의 명령을 실행하거나 문서에 기재하지 않는다.
- 작업 완료 확인은 `npm run check-all`(typecheck + lint + format:check)과 `npm run build`로 수행한다(`CLAUDE.md` 체크리스트).

## API 라우트 추가 시

- `src/middleware.ts`는 `/api/:path*` 경로에만 분당 10회 IP 기준 rate limit(`src/lib/rate-limit.ts`)을 자동 적용한다. 현재 프로젝트에는 `src/app/api/` 라우트가 하나도 없다.
- `src/app/api/` 아래에 새 라우트를 추가하면 이 rate limit이 자동으로 걸린다는 점을 감안하고, 필요 시 `src/middleware.ts`의 `RATE_LIMIT_CONFIG`에서 한도를 조정한다(별도 미들웨어 재구현 금지, 기존 `checkRateLimit` 재사용).

## 금지 사항

- `src/app/**`, `src/components/**`에서 `@notionhq/client` 직접 import 금지.
- `notion.databases.query()`(v4 방식) 사용 금지 — `notion.dataSources.query()` + `getDataSourceId()`만 사용.
- 목록/검색/상세 조회 함수 추가 시 `PUBLISHED_ONLY_FILTER` 또는 동등한 공개여부 체크 누락 금지.
- `src/types/notion.ts`, `notion-parser.ts`, `constants.ts` 중 일부만 수정하고 노션 속성 스키마 변경을 반영했다고 간주하는 것 금지.
- `process.env.X` 직접 접근 금지 — `src/lib/env.ts`의 `env` 객체만 사용.
- `console.log`/`console.error` 직접 사용 금지 — `src/lib/logger.ts`의 `logger` 사용.
- 존재하지 않는 테스트 명령을 지어내거나 실행 금지.
- `docs/guides/project-structure.md`의 폴더 구조/별칭 내용을 이 프로젝트의 실제 구조로 인용 금지.
