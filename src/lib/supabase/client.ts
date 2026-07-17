/**
 * Supabase 브라우저 클라이언트
 * 클라이언트 컴포넌트('use client')에서만 사용
 */

import { createBrowserClient } from '@supabase/ssr'
import { env } from '@/lib/env'

export function createClient() {
  return createBrowserClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )
}
