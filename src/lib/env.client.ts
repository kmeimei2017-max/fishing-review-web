import { z } from 'zod'

/**
 * 브라우저에서 접근 가능한 환경 변수 (NEXT_PUBLIC_* 만 포함)
 * 서버 전용 시크릿(NOTION_API_KEY 등)은 절대 이 파일에 추가하지 말 것 -
 * 클라이언트 컴포넌트('use client')에서 사용하는 모듈은 반드시 이 파일을 사용한다.
 */
const clientEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z
    .string()
    .url('NEXT_PUBLIC_SUPABASE_URL은 올바른 URL이어야 합니다'),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z
    .string()
    .min(1, 'NEXT_PUBLIC_SUPABASE_ANON_KEY는 필수입니다'),
})

export const clientEnv = clientEnvSchema.parse({
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
})
