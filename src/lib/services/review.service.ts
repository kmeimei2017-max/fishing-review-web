/**
 * Supabase 서비스 레이어
 * 낚시 후기 데이터 조회 및 처리 로직
 * (1단계 노션 연동 코드는 src/lib/notion.ts, src/lib/utils/notion-parser.ts에 레거시로 남아있으나 더 이상 사용하지 않음)
 */

import { createCachedReviewFetcher, getReviewWithDedup } from '@/lib/cache'
import { ERROR_MESSAGES } from '@/lib/constants'
import { logger } from '@/lib/logger'
import { createClient } from '@/lib/supabase/server'
import { mapRowToReview } from '@/lib/utils/review-mapper'
import type { Review } from '@/types/review'
import type { ReviewRow } from '@/types/database'

/**
 * 후기 검색 필터 인터페이스
 */
export interface ReviewFilters {
  /** 제목, 작성자 검색어 */
  query?: string
}

/**
 * 후기 목록 조회 결과 인터페이스
 */
export interface ReviewListResult {
  /** 후기 배열 */
  reviews: Review[]
  /** 다음 페이지 커서 (offset 문자열) */
  nextCursor: string | null
  /** 다음 페이지 존재 여부 */
  hasMore: boolean
}

/**
 * 후기 상세 조회 (내부 함수)
 * 캐싱 계층(unstable_cache)을 거치므로, 호출자의 로그인 여부와 무관하게
 * 항상 "공개(published)" 상태만 반환하도록 쿼리 자체에서 강제한다
 * (RLS만 믿지 않고 명시적으로 재확인하는 이중 방어).
 *
 * @param reviewId - 후기 ID (uuid)
 * @returns Review 객체
 * @throws Error - 존재하지 않거나 비공개인 경우
 */
async function fetchPublishedReview(reviewId: string): Promise<Review> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .eq('id', reviewId)
    .eq('status', 'published')
    .single<ReviewRow>()

  if (error || !data) {
    logger.error('후기 조회 실패', { reviewId, error: error?.message })
    throw new Error(ERROR_MESSAGES.REVIEW_NOT_FOUND)
  }

  return mapRowToReview(data)
}

/**
 * Supabase에서 후기 데이터 조회 (메인 export 함수)
 * @param reviewId - 후기 ID
 * @returns 변환된 Review 객체
 * @throws Error - 조회 실패 시
 */
export async function getReviewById(reviewId: string): Promise<Review> {
  return fetchPublishedReview(reviewId)
}

/**
 * 캐싱이 적용된 후기 조회 함수
 * unstable_cache로 60초간 캐싱됩니다.
 */
const getCachedReview = createCachedReviewFetcher(getReviewById)

/**
 * 최적화된 후기 조회 (캐싱 + Request Deduplication)
 * 외부에서 사용하는 메인 함수
 *
 * @param reviewId - 후기 ID
 * @returns Review 객체
 */
export async function getOptimizedReview(reviewId: string): Promise<Review> {
  return getReviewWithDedup(reviewId, getCachedReview)
}

/**
 * Supabase에서 공개(published) 후기 목록 조회
 * @param pageSize - 페이지당 항목 수 (기본값: 12, 최대: 100)
 * @param startCursor - 페이지네이션 시작 오프셋 (문자열 숫자)
 * @returns ReviewListResult 객체
 * @throws Error - 조회 실패 시
 */
export async function getPublishedReviews(
  pageSize: number = 12,
  startCursor?: string
): Promise<ReviewListResult> {
  try {
    const limitedPageSize = Math.min(pageSize, 100)
    const offset = startCursor ? Number(startCursor) || 0 : 0

    const supabase = await createClient()

    const { data, error, count } = await supabase
      .from('reviews')
      .select('*', { count: 'exact' })
      .eq('status', 'published')
      .order('created_at', { ascending: false })
      .range(offset, offset + limitedPageSize - 1)
      .returns<ReviewRow[]>()

    if (error) {
      throw error
    }

    const reviews = (data || []).map(mapRowToReview)
    const nextOffset = offset + limitedPageSize
    const hasMore = (count ?? 0) > nextOffset

    logger.info('후기 목록 조회 성공', {
      count: reviews.length,
      hasMore,
    })

    return {
      reviews,
      nextCursor: hasMore ? String(nextOffset) : null,
      hasMore,
    }
  } catch (error) {
    const errorObj = error as Error
    logger.error('후기 목록 조회 실패', {
      error: errorObj.message,
      stack: errorObj.stack,
    })
    throw new Error(ERROR_MESSAGES.DATABASE_ERROR)
  }
}

/**
 * Supabase에서 후기 검색
 * "공개(published)" 상태인 후기만 검색되도록 항상 필터가 적용됩니다.
 * @param filters - 검색 필터 (검색어)
 * @param pageSize - 페이지당 항목 수 (기본값: 12, 최대: 100)
 * @param startCursor - 페이지네이션 시작 오프셋
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
    const offset = startCursor ? Number(startCursor) || 0 : 0

    const supabase = await createClient()

    let queryBuilder = supabase
      .from('reviews')
      .select('*', { count: 'exact' })
      .eq('status', 'published')

    if (filters.query) {
      // 제목 또는 작성자에 검색어가 포함된 행 검색
      queryBuilder = queryBuilder.or(
        `title.ilike.%${filters.query}%,author.ilike.%${filters.query}%`
      )
    }

    const { data, error, count } = await queryBuilder
      .order('created_at', { ascending: false })
      .range(offset, offset + limitedPageSize - 1)
      .returns<ReviewRow[]>()

    if (error) {
      throw error
    }

    const reviews = (data || []).map(mapRowToReview)
    const nextOffset = offset + limitedPageSize
    const hasMore = (count ?? 0) > nextOffset

    logger.info('후기 검색 성공', {
      count: reviews.length,
      hasMore,
      filters,
    })

    return {
      reviews,
      nextCursor: hasMore ? String(nextOffset) : null,
      hasMore,
    }
  } catch (error) {
    const errorObj = error as Error
    logger.error('후기 검색 실패', {
      filters,
      error: errorObj.message,
      stack: errorObj.stack,
    })
    throw new Error(ERROR_MESSAGES.DATABASE_ERROR)
  }
}

/**
 * 후기 작성 입력 인터페이스
 */
export interface CreateReviewInput {
  title: string
  content: string
  images: string[]
}

/**
 * 새 후기 생성 (로그인 필요)
 * 항상 status: 'pending'으로 저장되며, author/author_id는 현재 로그인한 사용자 정보로
 * 서버에서 직접 채운다 (클라이언트가 임의로 다른 사용자 행세를 하거나 즉시 공개 처리하는 것을 방지).
 *
 * @param input - 제목/내용/사진 URL 목록
 * @returns 생성된 Review 객체
 * @throws Error - 로그인하지 않았거나 저장 실패 시
 */
export async function createReview(input: CreateReviewInput): Promise<Review> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error(ERROR_MESSAGES.UNAUTHORIZED)
  }

  const authorName =
    (user.user_metadata?.full_name as string | undefined) ||
    (user.user_metadata?.name as string | undefined) ||
    user.email ||
    '익명'

  const { data, error } = await supabase
    .from('reviews')
    .insert({
      title: input.title,
      content: input.content,
      images: input.images,
      author: authorName,
      author_id: user.id,
      status: 'pending',
    })
    .select('*')
    .single<ReviewRow>()

  if (error || !data) {
    logger.error('후기 작성 실패', {
      userId: user.id,
      error: error?.message,
    })
    throw new Error(ERROR_MESSAGES.DATABASE_ERROR)
  }

  logger.info('후기 작성 성공 (승인 대기)', { reviewId: data.id })

  return mapRowToReview(data)
}
