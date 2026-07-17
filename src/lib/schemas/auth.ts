import { z } from 'zod'

/**
 * 이메일/비밀번호 로그인 폼 스키마
 * (테스트/관리자용 - 소셜 로그인 연동 전 임시 로그인 수단)
 */
export const emailLoginSchema = z.object({
  email: z
    .string()
    .min(1, '이메일을 입력해주세요')
    .email('올바른 이메일 형식이 아닙니다'),
  password: z.string().min(1, '비밀번호를 입력해주세요'),
})

export type EmailLoginFormData = z.infer<typeof emailLoginSchema>
