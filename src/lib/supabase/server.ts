/**
 * Supabase 서버 클라이언트
 * 서버 컴포넌트, 서버 액션, 라우트 핸들러에서만 사용
 */

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { env } from '@/lib/env'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Server Component에서 호출된 경우 - 미들웨어가 세션 갱신을 담당하므로 무시 가능
          }
        },
      },
    }
  )
}
