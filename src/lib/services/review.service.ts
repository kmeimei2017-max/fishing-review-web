/**
 * Notion API 서비스 레이어
 * 낚시 후기 데이터 조회 및 처리 로직
 */

import { createCachedReviewFetcher, getReviewWithDedup } from '@/lib/cache'
import { ERROR_MESSAGES, PUBLISHED_VISIBILITY_VALUE } from '@/lib/constants'
import { logger } from '@/lib/logger'
import { getDataSourceId, notion } from '@/lib/notion'
import { transformNotionToReview } from '@/lib/utils/notion-parser'
import type { Review } from '@/types/review'
import type { ReviewPageProperties, NotionPage } from '@/types/notion'
import { isReviewPage } from '@/types/notion'

/**
 * 후기 검색 필터 인터페이스
 */
export interface ReviewFilters {
  /** 제목, 작성자 검색어 */
  query?: string
}

/**
 * 공개된 후기만 노출되도록 강제하는 필터
 * 목록/검색 조회 시 항상 적용되어 "비공개(작성중)" 후기가 새어나가지 않도록 한다.
 */
const PUBLISHED_ONLY_FILTER = {
  property: '공개 여부',
  select: { equals: PUBLISHED_VISIBILITY_VALUE },
}

/**
 * 후기 페이지 조회
 * @param pageId - Notion 페이지 ID
 * @returns Review 페이지 데이터
 * @throws Error - 페이지를 찾을 수 없거나 유효하지 않은 경우
 */
async function fetchReviewPage(
  pageId: string
): Promise<NotionPage & { properties: ReviewPageProperties }> {
  try {
    const response = await notion.pages.retrieve({ page_id: pageId })

    // PartialPageObjectResponse 제외 (아카이브된 페이지 등)
    if (!('properties' in response)) {
      throw new Error(ERROR_MESSAGES.INVALID_REVIEW_DATA)
    }

    const page = response as NotionPage

    // 타입 가드를 사용한 유효성 검증
    if (!isReviewPage(page)) {
      throw new Error(ERROR_MESSAGES.INVALID_REVIEW_DATA)
    }

    // 비공개 후기는 상세 페이지에서도 노출되지 않도록 차단
    if (
      page.properties['공개 여부']?.select?.name !== PUBLISHED_VISIBILITY_VALUE
    ) {
      throw new Error(ERROR_MESSAGES.REVIEW_NOT_FOUND)
    }

    return page
  } catch (error) {
    const errorObj = error as { code?: string; message?: string }
    logger.error('Notion API 오류', {
      pageId,
      errorCode: errorObj.code,
    })

    // Notion API 에러 코드 처리
    if (errorObj.code === 'object_not_found') {
      throw new Error(ERROR_MESSAGES.REVIEW_NOT_FOUND)
    }

    // 커스텀 에러 메시지가 있으면 그대로 전달
    if (
      errorObj.message &&
      Object.values(ERROR_MESSAGES).includes(
        errorObj.message as (typeof ERROR_MESSAGES)[keyof typeof ERROR_MESSAGES]
      )
    ) {
      throw error
    }

    // 기타 에러
    throw new Error(ERROR_MESSAGES.NOTION_API_ERROR)
  }
}

/**
 * 재시도 로직 구현
 * @param fn - 실행할 비동기 함수
 * @param maxRetries - 최대 재시도 횟수 (기본값: 3)
 * @returns 함수 실행 결과
 * @throws Error - 최대 재시도 횟수 초과 시
 */
async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3
): Promise<T> {
  let lastError: Error | undefined

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error as Error

      // 마지막 시도이거나 재시도 불가능한 에러인 경우
      if (
        i === maxRetries - 1 ||
        lastError.message === ERROR_MESSAGES.REVIEW_NOT_FOUND ||
        lastError.message === ERROR_MESSAGES.INVALID_REVIEW_DATA
      ) {
        throw lastError
      }

      // 지수 백오프: 1초, 2초, 4초...
      const delay = Math.min(1000 * Math.pow(2, i), 5000)
      logger.warn('API 재시도', {
        attempt: i + 1,
        maxRetries: maxRetries - 1,
        delayMs: delay,
      })
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }

  throw lastError || new Error('Retry failed')
}

/**
 * Notion에서 후기 데이터 조회 (메인 export 함수)
 * @param pageId - 후기 페이지 ID
 * @returns 변환된 Review 객체
 * @throws Error - 조회 실패 시
 */
export async function getReviewFromNotion(pageId: string): Promise<Review> {
  return withRetry(async () => {
    const page = await fetchReviewPage(pageId)
    return transformNotionToReview(page)
  })
}

/**
 * 캐싱이 적용된 후기 조회 함수
 * unstable_cache로 60초간 캐싱됩니다.
 */
const getCachedReviewFromNotion = createCachedReviewFetcher(getReviewFromNotion)

/**
 * 최적화된 후기 조회 (캐싱 + Request Deduplication)
 * 외부에서 사용하는 메인 함수
 *
 * @param pageId - 후기 페이지 ID
 * @returns Review 객체
 *
 * @example
 * ```typescript
 * // 페이지 컴포넌트에서 사용
 * const review = await getOptimizedReview(pageId)
 * ```
 */
export async function getOptimizedReview(pageId: string): Promise<Review> {
  return getReviewWithDedup(pageId, getCachedReviewFromNotion)
}

/**
 * 후기 목록 조회 결과 인터페이스
 */
export interface ReviewListResult {
  /** 후기 배열 */
  reviews: Review[]
  /** 다음 페이지 커서 */
  nextCursor: string | null
  /** 다음 페이지 존재 여부 */
  hasMore: boolean
}

/**
 * Notion 데이터베이스에서 후기 목록 조회
 * "공개" 상태인 후기만 조회하도록 항상 필터가 적용됩니다.
 * @param pageSize - 페이지당 항목 수 (기본값: 12, 최대: 100)
 * @param startCursor - 페이지네이션 시작 커서
 * @returns ReviewListResult 객체
 * @throws Error - 조회 실패 시
 */
export async function getReviewsFromNotion(
  pageSize: number = 12,
  startCursor?: string
): Promise<ReviewListResult> {
  try {
    const limitedPageSize = Math.min(pageSize, 100)

    const dataSourceId = await getDataSourceId()

    const response = await notion.dataSources.query({
      data_source_id: dataSourceId,
      page_size: limitedPageSize,
      start_cursor: startCursor || undefined,
      filter: PUBLISHED_ONLY_FILTER,
      sorts: [
        {
          timestamp: 'created_time',
          direction: 'descending',
        },
      ],
    })

    const reviews = response.results
      .filter((page): page is NotionPage => 'properties' in page)
      .filter(isReviewPage)
      .map(transformNotionToReview)

    logger.info('후기 목록 조회 성공', {
      count: reviews.length,
      hasMore: response.has_more,
    })

    return {
      reviews,
      nextCursor: response.next_cursor,
      hasMore: response.has_more,
    }
  } catch (error) {
    const errorObj = error as Error
    logger.error('후기 목록 조회 실패', {
      error: errorObj.message,
      stack: errorObj.stack,
      name: errorObj.name,
    })
    throw new Error('후기 목록을 불러올 수 없습니다')
  }
}

/**
 * Notion 데이터베이스에서 후기 검색
 * "공개" 상태인 후기만 검색되도록 항상 필터가 적용됩니다.
 * @param filters - 검색 필터 (검색어)
 * @param pageSize - 페이지당 항목 수 (기본값: 12, 최대: 100)
 * @param startCursor - 페이지네이션 시작 커서
 * @returns ReviewListResult 객체
 * @throws Error - 검색 실패 시
 */
export async function searchReviews(
  filters: ReviewFilters,
  pageSize: number = 12,
  startCursor?: string
): Promise<ReviewListResult> {
  try {
    const limitedPageSize = Math.min(pageSize, 100)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const notionFilters: any[] = [PUBLISHED_ONLY_FILTER]

    // 제목, 작성자 검색
    if (filters.query) {
      notionFilters.push({
        or: [
          { property: '후기 제목', title: { contains: filters.query } },
          { property: '작성자', rich_text: { contains: filters.query } },
        ],
      })
    }

    const dataSourceId = await getDataSourceId()

    const response = await notion.dataSources.query({
      data_source_id: dataSourceId,
      page_size: limitedPageSize,
      start_cursor: startCursor || undefined,
      filter: { and: notionFilters },
      sorts: [
        {
          timestamp: 'created_time',
          direction: 'descending',
        },
      ],
    })

    const reviews = response.results
      .filter((page): page is NotionPage => 'properties' in page)
      .filter(isReviewPage)
      .map(transformNotionToReview)

    logger.info('후기 검색 성공', {
      count: reviews.length,
      hasMore: response.has_more,
      filters,
    })

    return {
      reviews,
      nextCursor: response.next_cursor,
      hasMore: response.has_more,
    }
  } catch (error) {
    const errorObj = error as Error
    logger.error('후기 검색 실패', {
      filters,
      error: errorObj.message,
      stack: errorObj.stack,
      name: errorObj.name,
    })
    throw new Error('후기 검색에 실패했습니다')
  }
}
