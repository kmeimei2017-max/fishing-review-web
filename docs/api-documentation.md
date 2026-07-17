# API 문서

## 📋 목차

1. [환경 변수](#환경-변수)
2. [주요 함수 API](#주요-함수-api)
3. [Notion API 통합](#notion-api-통합)
4. [보안](#보안)
5. [성능](#성능)
6. [에러 처리](#에러-처리)

---

## 🔧 환경 변수

### 필수 환경 변수

#### `NOTION_API_KEY`

- **설명**: Notion Integration Token
- **형식**: `secret_` 또는 `ntn_`으로 시작하는 문자열
- **획득 방법**:
  1. https://www.notion.so/my-integrations 접속
  2. "+ New integration" 클릭
  3. Integration 이름 입력 후 생성
  4. "Internal Integration Token" 복사

**예시**:

```bash
NOTION_API_KEY=secret_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

#### `NOTION_DATABASE_ID`

- **설명**: 후기 데이터베이스 ID
- **형식**: 32자 영숫자 문자열
- **획득 방법**:
  1. Notion 후기 데이터베이스 열기
  2. URL 확인: `https://www.notion.so/[DATABASE_ID]?v=...`
  3. DATABASE_ID 부분 복사

**예시**:

```bash
NOTION_DATABASE_ID=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### 선택 환경 변수

#### `NEXT_PUBLIC_BASE_URL`

- **설명**: 애플리케이션 기본 URL (후기 링크 생성에 사용)
- **형식**: 유효한 URL
- **기본값**: `http://localhost:3000`
- **프로덕션 예시**:

```bash
NEXT_PUBLIC_BASE_URL=https://yourdomain.com
```

---

## 🔌 주요 함수 API

### 링크 생성

#### `generateReviewUrl(reviewId: string): string`

후기 고유 URL 생성

**매개변수**:

- `reviewId`: 후기 ID (Notion Page ID)

**반환값**:

- 후기 전체 URL

**사용 예시**:

```typescript
import { generateReviewUrl } from '@/lib/utils/link-generator'

const url = generateReviewUrl('2856a10d-310b-80e0-8baa-d4445d6baf92')
// 반환: "http://localhost:3000/review/2856a10d-310b-80e0-8baa-d4445d6baf92"
```

---

### 클립보드 복사

#### `useClipboard()`

클립보드 복사 커스텀 훅

**반환값**:

```typescript
{
  copy: (text: string) => Promise<void>,
  isCopied: boolean
}
```

**사용 예시**:

```typescript
'use client'

import { useClipboard } from '@/hooks/use-clipboard'

export function CopyButton({ text }: { text: string }) {
  const { copy, isCopied } = useClipboard()

  return (
    <button onClick={() => copy(text)}>
      {isCopied ? '복사됨!' : '복사'}
    </button>
  )
}
```

**특징**:

- Modern Clipboard API 사용
- 구형 브라우저 폴백 지원
- Sonner 토스트 알림 통합
- 복사 성공 시 2초간 `isCopied: true`

---

## 🔗 Notion API 통합

### 후기 조회

#### `getOptimizedReview(pageId: string): Promise<Review>`

최적화된 후기 조회 (캐싱 + Request Deduplication). "공개" 상태가 아닌 후기는 조회 시 에러를 던집니다.

**캐싱 전략**:

- **캐시 시간**: 60초
- **캐시 키**: `review`
- **재검증**: `revalidateTag('review')`

**Rate Limiting**:

- Notion API 제한: 3 requests/second
- 재시도 로직: 지수 백오프 (1초, 2초, 4초)
- 최대 재시도: 3회

**사용 예시**:

```typescript
import { getOptimizedReview } from '@/lib/services/review.service'

export default async function ReviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const review = await getOptimizedReview(id)

  return <div>{review.title}</div>
}
```

---

### 후기 목록 조회

#### `getReviewsFromNotion(pageSize?: number, startCursor?: string, sortBy?: 'trip_date' | 'rating'): Promise<ReviewListResult>`

Notion 데이터베이스에서 "공개" 상태인 후기 목록만 조회

**매개변수**:

- `pageSize`: 페이지당 항목 수 (기본: 12, 최대: 100)
- `startCursor`: 페이지네이션 커서
- `sortBy`: 정렬 기준

**반환값**:

```typescript
{
  reviews: Review[],
  nextCursor: string | null,
  hasMore: boolean
}
```

**사용 예시**:

```typescript
import { getReviewsFromNotion } from '@/lib/services/review.service'

const { reviews, nextCursor, hasMore } = await getReviewsFromNotion(
  12,
  undefined,
  'trip_date'
)
```

---

### 후기 검색

#### `searchReviews(filters: ReviewFilters, pageSize?: number, startCursor?: string): Promise<ReviewListResult>`

필터 조건으로 후기 검색 ("공개" 상태 필터는 항상 강제 적용됨)

**필터 타입**:

```typescript
interface ReviewFilters {
  query?: string // 제목, 작성자, 배 이름
  fishSpecies?: string // 어종/조황
  rating?: string // 예: "⭐️5"
  dateFrom?: string // ISO 8601 형식: YYYY-MM-DD
  dateTo?: string // ISO 8601 형식: YYYY-MM-DD
}
```

**사용 예시**:

```typescript
import { searchReviews } from '@/lib/services/review.service'

const { reviews } = await searchReviews({
  query: '거문도',
  fishSpecies: '참돔',
  dateFrom: '2025-01-01',
  dateTo: '2025-12-31',
})
```

---

### 이미지 URL 추출

#### `extractImageUrls(files: NotionFileItem[] | undefined | null): string[]`

Notion Files & media 속성에서 이미지 URL 배열을 추출합니다. Notion 내부 호스팅 파일(`type: 'file'`)의 URL은 약 1시간 후 만료되는 signed URL이므로, 상세 페이지를 오래 열어두면 이미지가 깨질 수 있습니다(새로고침 시 재조회되어 정상 복구됨).

```typescript
import { extractImageUrls } from '@/lib/utils/notion-parser'

const images = extractImageUrls(properties.사진?.files)
```

---

## 🔒 보안

### Rate Limiting

- **API 요청**: 분당 10회 (`/api/*` 경로)
- Notion API 제한 준수 (재시도 로직으로 대응)

### 공개 범위 제어

- Notion "공개 여부" 속성이 "공개"가 아닌 후기는 목록/상세 API 모두에서 항상 필터링됨 (`PUBLISHED_ONLY_FILTER`)
- 관리자 인증/로그인 기능은 없음 — 글쓰기는 Notion에서 직접 수행

---

## 📊 성능

### 캐싱 전략

1. **Review 캐싱**: 60초 (`unstable_cache`)
2. **Request Deduplication**: 동일 pageId 동시 요청 병합
3. **병렬 처리**: 목록/검색 조회 시 후기 변환 병렬 처리

### 최적화

- **레이지 로딩**: 컴포넌트 지연 로딩
- **이미지 최적화**: Next.js Image 컴포넌트 + WebP/AVIF 변환
- **코드 분할**: 동적 import

---

## 🐛 에러 처리

### 에러 메시지

```typescript
export const ERROR_MESSAGES = {
  REVIEW_NOT_FOUND: '후기를 찾을 수 없습니다.',
  NOTION_API_ERROR: 'Notion API 연결 오류가 발생했습니다.',
  INVALID_REVIEW_DATA: '유효하지 않은 후기 데이터입니다.',
  MISSING_REQUIRED_FIELD: '필수 필드가 누락되었습니다.',
}
```

### 재시도 로직

- **재시도 횟수**: 최대 3회
- **백오프**: 지수 백오프 (1초, 2초, 4초)
- **재시도 불가**: `REVIEW_NOT_FOUND`, `INVALID_REVIEW_DATA`

---

## 📝 로깅

### 로그 레벨

- **INFO**: 정상 작업 (후기 목록 조회 성공)
- **WARN**: 경고 (재시도 발생)
- **ERROR**: 오류 (API 실패)

### 로그 예시

```typescript
logger.info('후기 목록 조회 성공', {
  count: 12,
  hasMore: true,
  sortBy: 'trip_date',
})
```
