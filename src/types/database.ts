/**
 * Supabase 데이터베이스 테이블 타입 정의
 * SQL 스키마(docs/notion-guide.md 대체 - 향후 docs/supabase-guide.md 참조)와 1:1 매칭
 */

import type { ReviewStatus } from '@/types/review'

/**
 * reviews 테이블 row 타입 (snake_case, Supabase 컬럼명과 동일)
 */
export interface ReviewRow {
  id: string
  title: string
  content: string
  images: string[]
  author: string
  author_id: string
  status: ReviewStatus
  created_at: string
}

/**
 * reviews 테이블 insert 시 필요한 필드 (id, created_at은 DB 기본값 사용)
 */
export type ReviewInsert = Omit<ReviewRow, 'id' | 'created_at' | 'status'> & {
  status?: ReviewStatus
}
