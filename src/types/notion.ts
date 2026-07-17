/**
 * Notion API 응답 타입 정의
 * @notionhq/client SDK 공식 타입을 재사용하여 중복 방지
 */

import type {
  PageObjectResponse,
  DatabaseObjectResponse,
} from '@notionhq/client/build/src/api-endpoints'

/**
 * Notion Page 타입 (SDK 재사용)
 */
export type NotionPage = PageObjectResponse

/**
 * Notion Database 타입 (SDK 재사용)
 */
export type NotionDatabase = DatabaseObjectResponse

/**
 * Notion Files & media 속성의 개별 파일 항목
 * - type: 'file'인 경우 Notion 내부 호스팅(약 1시간 후 만료되는 signed URL)
 * - type: 'external'인 경우 고정 외부 URL
 */
export type NotionFileItem =
  | { type: 'file'; name: string; file: { url: string; expiry_time: string } }
  | { type: 'external'; name: string; external: { url: string } }

/**
 * 낚시 후기 페이지 속성 타입
 * Notion 데이터베이스의 실제 한글 속성명을 반영
 */
export interface ReviewPageProperties {
  /** 후기 제목 (Title 속성) */
  '후기 제목': {
    type: 'title'
    title: Array<{ plain_text: string }>
  }
  /** 작성자 (Rich Text 속성) */
  작성자: {
    type: 'rich_text'
    rich_text: Array<{ plain_text: string }>
  }
  /** 사진 (Files & media 속성) */
  사진: {
    type: 'files'
    files: NotionFileItem[]
  }
  /** 후기 내용 (Rich Text 속성) */
  '후기 내용': {
    type: 'rich_text'
    rich_text: Array<{ plain_text: string }>
  }
  /** 공개 여부 (Select 속성: 공개/비공개(작성중)) */
  '공개 여부': {
    type: 'select'
    select: { name: string } | null
  }
}

/**
 * Notion 페이지를 Review 속성으로 타입 캐스팅하기 위한 타입 가드
 */
export function isReviewPage(
  page: NotionPage
): page is NotionPage & { properties: ReviewPageProperties } {
  return 'properties' in page && '후기 제목' in page.properties
}
