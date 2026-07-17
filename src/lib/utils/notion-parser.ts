/**
 * Notion API 응답 데이터 파싱 및 변환 유틸리티 (1단계 레거시, 현재 미사용)
 * Supabase 전환(2단계)으로 review.service.ts에서 더 이상 이 파일을 참조하지 않는다.
 * ROADMAP.md 5단계의 별도 정리 작업 전까지 참고용으로만 남겨둔다.
 */

import type {
  NotionPage,
  NotionFileItem,
  ReviewPageProperties,
} from '@/types/notion'
import type { ReviewVisibilityValue } from '@/lib/constants'
import { KOREAN_TO_VISIBILITY_MAP } from '@/lib/constants'

/**
 * 레거시 Notion 기반 후기 객체 (현재 Review 도메인 타입과는 무관, 참고용)
 */
interface LegacyNotionReview {
  id: string
  title: string
  author: string
  images: string[]
  content: string
  visibility: ReviewVisibilityValue
}

/**
 * Notion 후기 페이지를 레거시 후기 객체로 변환 (현재 미사용)
 * @param page - Notion 후기 페이지
 * @returns 변환된 레거시 후기 객체
 */
export function transformNotionToReview(
  page: NotionPage & { properties: ReviewPageProperties }
): LegacyNotionReview {
  const props = page.properties

  // null 체크와 기본값 처리
  const title = extractPlainText(props['후기 제목']?.title) || '제목 없음'
  const author = extractPlainText(props.작성자?.rich_text) || '익명'
  const images = extractImageUrls(props.사진?.files)
  const content = extractPlainText(props['후기 내용']?.rich_text)
  const visibility = mapKoreanVisibility(props['공개 여부']?.select?.name)

  return {
    id: page.id,
    title,
    author,
    images,
    content,
    visibility,
  }
}

/**
 * Notion Files & media 속성에서 이미지 URL 배열 추출
 * - type: 'file'인 경우 Notion 내부 호스팅 signed URL (약 1시간 후 만료)
 * - type: 'external'인 경우 고정 외부 URL
 * @param files - Notion 파일 속성 배열
 * @returns 이미지 URL 배열
 */
export function extractImageUrls(
  files: NotionFileItem[] | undefined | null
): string[] {
  if (!files || files.length === 0) {
    return []
  }

  return files.map(file =>
    file.type === 'file' ? file.file.url : file.external.url
  )
}

/**
 * 한글 공개 여부값을 공개 상태값으로 매핑
 * @param koreanVisibility - 한글 공개 여부값 (공개/비공개(작성중))
 * @returns 영문 공개 상태값
 */
function mapKoreanVisibility(
  koreanVisibility: string | null | undefined
): ReviewVisibilityValue {
  if (!koreanVisibility) {
    return 'draft'
  }

  const mappedVisibility =
    KOREAN_TO_VISIBILITY_MAP[
      koreanVisibility as keyof typeof KOREAN_TO_VISIBILITY_MAP
    ]
  return (mappedVisibility as ReviewVisibilityValue) || 'draft'
}

/**
 * Notion 텍스트 배열에서 plain text 추출
 * @param textArray - Notion 텍스트 객체 배열
 * @returns 결합된 plain text 문자열
 */
function extractPlainText(
  textArray: Array<{ plain_text: string }> | undefined | null
): string {
  if (!textArray || textArray.length === 0) {
    return ''
  }

  return textArray.map(text => text.plain_text).join('')
}

/**
 * 숫자 값 안전하게 파싱
 * @param value - 변환할 값
 * @param defaultValue - 기본값
 * @returns 파싱된 숫자
 */
export function parseNumber(value: unknown, defaultValue: number = 0): number {
  if (typeof value === 'number' && !isNaN(value)) {
    return value
  }

  if (typeof value === 'string') {
    const parsed = parseFloat(value)
    if (!isNaN(parsed)) {
      return parsed
    }
  }

  return defaultValue
}
