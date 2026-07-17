/**
 * Supabase 브라우저 클라이언트
 * 클라이언트 컴포넌트('use client')에서만 사용
 */

import { createBrowserClient } from '@supabase/ssr'
import { clientEnv } from '@/lib/env.client'

export function createClient() {
  return createBrowserClient(
    clientEnv.NEXT_PUBLIC_SUPABASE_URL,
    clientEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )
}
