import { env } from '@/lib/env'

/**
 * 후기 고유 URL 생성
 * @param reviewId - 후기 ID
 * @returns 후기 전체 URL
 */
export function generateReviewUrl(reviewId: string): string {
  return `${env.NEXT_PUBLIC_BASE_URL}/review/${reviewId}`
}

/**
 * 짧은 URL 표시용 (선택사항)
 * @param reviewId - 후기 ID
 * @returns 짧게 표시할 ID
 */
export function generateShortUrl(reviewId: string): string {
  const shortId = reviewId.substring(0, 8)
  return `...${shortId}`
}
