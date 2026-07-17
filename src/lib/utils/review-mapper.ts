/**
 * Supabase row 데이터 파싱 및 변환 유틸리티
 * DB row(snake_case)를 비즈니스 도메인 타입(camelCase)으로 변환
 */

import type { ReviewRow } from '@/types/database'
import type { Review } from '@/types/review'

/**
 * Supabase reviews row를 Review 객체로 변환
 * @param row - Supabase reviews 테이블 row
 * @returns 변환된 Review 객체
 */
export function mapRowToReview(row: ReviewRow): Review {
  return {
    id: row.id,
    title: row.title,
    author: row.author,
    authorId: row.author_id,
    images: row.images,
    content: row.content,
    status: row.status,
    createdAt: row.created_at,
  }
}
