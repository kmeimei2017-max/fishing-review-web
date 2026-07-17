/**
 * Supabase 공개 데이터 조회 전용 클라이언트
 * 쿠키(cookies())에 의존하지 않으므로 unstable_cache 등 dynamic API가
 * 금지된 스코프에서도 사용 가능. 공개(published) 후기 등 로그인 여부와
 * 무관한 데이터 조회에만 사용할 것 (인증이 필요한 작업에는 사용 금지).
 */

import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { env } from '@/lib/env'

export function createPublicClient() {
  return createSupabaseClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )
}
