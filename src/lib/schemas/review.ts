import { z } from 'zod'

const MAX_IMAGE_SIZE = 5 * 1024 * 1024 // 5MB
const MAX_IMAGE_COUNT = 5

/**
 * 후기 작성 폼(클라이언트) 스키마
 * 사진은 아직 업로드되지 않은 File 객체 배열
 */
export const reviewFormSchema = z.object({
  title: z
    .string()
    .min(1, '제목을 입력해주세요')
    .max(100, '제목은 최대 100자까지 입력 가능합니다'),
  content: z
    .string()
    .min(1, '내용을 입력해주세요')
    .max(2000, '내용은 최대 2000자까지 입력 가능합니다'),
  images: z
    .array(z.instanceof(File))
    .min(1, '사진을 최소 1장 첨부해주세요')
    .max(
      MAX_IMAGE_COUNT,
      `사진은 최대 ${MAX_IMAGE_COUNT}장까지 첨부 가능합니다`
    )
    .refine(
      files => files.every(file => file.size <= MAX_IMAGE_SIZE),
      '사진 1장당 크기는 5MB 이하여야 합니다'
    )
    .refine(
      files => files.every(file => file.type.startsWith('image/')),
      '이미지 파일만 첨부 가능합니다'
    ),
})

export type ReviewFormData = z.infer<typeof reviewFormSchema>

/**
 * 후기 생성 서버 액션 입력 스키마
 * 사진은 Supabase Storage 업로드가 끝난 뒤의 URL 배열
 */
export const createReviewSchema = z.object({
  title: reviewFormSchema.shape.title,
  content: reviewFormSchema.shape.content,
  images: z
    .array(z.string().url())
    .min(1, '사진을 최소 1장 첨부해주세요')
    .max(
      MAX_IMAGE_COUNT,
      `사진은 최대 ${MAX_IMAGE_COUNT}장까지 첨부 가능합니다`
    ),
})
