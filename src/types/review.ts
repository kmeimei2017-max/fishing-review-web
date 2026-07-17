/**
 * 낚시 후기 비즈니스 도메인 타입 정의
 */

/**
 * 후기 공개 상태 타입
 * pending: 작성 완료, 관리자 승인 대기 중
 * published: 관리자 승인 후 공개
 */
export type ReviewStatus = 'pending' | 'published'

/**
 * 낚시 후기 인터페이스
 */
export interface Review {
  /** 후기 고유 ID (Supabase reviews.id, uuid) */
  id: string
  /** 후기 제목 */
  title: string
  /** 작성자 (표시용 닉네임, 작성 시점 스냅샷) */
  author: string
  /** 작성자 계정 ID (Supabase auth.users.id) - 소유권 확인용 */
  authorId: string
  /** 사진 URL 목록 */
  images: string[]
  /** 후기 내용 */
  content: string
  /** 공개 상태 */
  status: ReviewStatus
  /** 작성일시 (ISO 8601) */
  createdAt: string
}
