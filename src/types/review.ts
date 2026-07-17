/**
 * 낚시 후기 비즈니스 도메인 타입 정의
 */

/**
 * 후기 공개 상태 타입
 */
export type ReviewVisibility = 'published' | 'draft'

/**
 * 낚시 후기 인터페이스
 */
export interface Review {
  /** 후기 고유 ID (Notion Page ID) */
  id: string
  /** 후기 제목 */
  title: string
  /** 작성자 (표시용 닉네임) */
  author: string
  /** 사진 URL 목록 */
  images: string[]
  /** 후기 내용 */
  content: string
  /** 공개 상태 */
  visibility: ReviewVisibility
}
