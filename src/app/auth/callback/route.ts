import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * OAuth 콜백 라우트
 * 소셜 로그인 제공자가 인증 후 이 경로로 리다이렉트하며,
 * code를 세션으로 교환한 뒤 원래 페이지(next)로 돌려보낸다.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') || '/'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // 실패 시 로그인 페이지로, 에러 안내 쿼리 포함
  return NextResponse.redirect(`${origin}/login?error=auth_failed`)
}
