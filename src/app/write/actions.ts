'use server'

import { createReviewSchema } from '@/lib/schemas/review'
import { createReview } from '@/lib/services/review.service'
import type { ActionResult } from '@/types/action-result'

/**
 * 후기 작성 제출 서버 액션
 * 클라이언트에서 이미지 업로드가 끝난 뒤(URL 확보 후) 호출된다.
 * 인증 여부와 Zod 유효성은 여기서 다시 검증한다 (클라이언트 검증을 신뢰하지 않음).
 */
export async function submitReview(input: {
  title: string
  content: string
  images: string[]
}): Promise<ActionResult<{ reviewId: string }>> {
  const validated = createReviewSchema.safeParse(input)

  if (!validated.success) {
    return {
      success: false,
      message: '입력된 정보를 확인해주세요',
      errors: validated.error.flatten().fieldErrors,
    }
  }

  try {
    const review = await createReview(validated.data)

    return {
      success: true,
      message: '후기가 제출되었습니다. 관리자 승인 후 공개됩니다.',
      data: { reviewId: review.id },
    }
  } catch (error) {
    const errorObj = error as Error
    return {
      success: false,
      message: errorObj.message || '후기 제출 중 오류가 발생했습니다',
    }
  }
}
