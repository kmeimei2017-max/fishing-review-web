/**
 * 애플리케이션 전역 상수 정의
 * as const 패턴을 사용하여 타입 리터럴 보장
 */

/**
 * 후기 공개 상태 상수
 * Notion 데이터 기반: "공개", "비공개(작성중)"
 */
export const REVIEW_VISIBILITY = {
  PUBLISHED: 'published',
  DRAFT: 'draft',
} as const

export type ReviewVisibilityKey = keyof typeof REVIEW_VISIBILITY
export type ReviewVisibilityValue =
  (typeof REVIEW_VISIBILITY)[ReviewVisibilityKey]

/**
 * 한글 공개 여부값을 영문 상태값으로 변환
 */
export const KOREAN_TO_VISIBILITY_MAP = {
  공개: 'published',
  '비공개(작성중)': 'draft',
} as const

/**
 * Notion "공개 여부" 속성에서 공개 상태를 나타내는 실제 값
 * 목록/검색 조회 시 이 값으로 필터링하여 비공개 후기가 노출되지 않도록 강제한다.
 */
export const PUBLISHED_VISIBILITY_VALUE = '공개'

/**
 * 에러 메시지 상수
 */
export const ERROR_MESSAGES = {
  REVIEW_NOT_FOUND: '후기를 찾을 수 없습니다.',
  NOTION_API_ERROR: 'Notion API 연결 오류가 발생했습니다.',
  INVALID_REVIEW_DATA: '유효하지 않은 후기 데이터입니다.',
  MISSING_REQUIRED_FIELD: '필수 필드가 누락되었습니다.',
} as const
