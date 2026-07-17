/**
 * Next.js Middleware
 * API 라우트에 대한 Rate Limiting + 전체 라우트의 Supabase 세션 갱신
 */

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { checkRateLimit } from '@/lib/rate-limit'
import { updateSession } from '@/lib/supabase/middleware'

/**
 * Rate Limit 설정
 */
const RATE_LIMIT_CONFIG = {
  /** 분당 최대 요청 횟수 */
  MAX_REQUESTS: 10,
  /** 시간 윈도우 (밀리초) - 60초 */
  WINDOW_MS: 60000,
} as const

/**
 * Middleware 함수
 * API 라우트에 Rate Limiting 적용
 */
export async function middleware(request: NextRequest) {
  // API 라우트에만 Rate Limiting 적용
  if (request.nextUrl.pathname.startsWith('/api/')) {
    // IP 주소 추출 (프록시 환경 고려)
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
      request.headers.get('x-real-ip') ||
      'unknown'

    // Rate Limit 검사
    const rateLimitResult = checkRateLimit(
      ip,
      RATE_LIMIT_CONFIG.MAX_REQUESTS,
      RATE_LIMIT_CONFIG.WINDOW_MS
    )

    // 제한 초과 시 429 응답
    if (!rateLimitResult.allowed) {
      return new NextResponse(
        JSON.stringify({
          error: '요청 한도를 초과했습니다.',
          message: `분당 최대 ${RATE_LIMIT_CONFIG.MAX_REQUESTS}회 요청 가능합니다.`,
          retryAfter: rateLimitResult.retryAfter,
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': String(rateLimitResult.retryAfter || 60),
            'X-RateLimit-Limit': String(RATE_LIMIT_CONFIG.MAX_REQUESTS),
            'X-RateLimit-Remaining': '0',
          },
        }
      )
    }

    // 정상 요청 - Rate Limit 헤더 추가
    const response = NextResponse.next()
    response.headers.set(
      'X-RateLimit-Limit',
      String(RATE_LIMIT_CONFIG.MAX_REQUESTS)
    )
    response.headers.set(
      'X-RateLimit-Remaining',
      String(rateLimitResult.remaining)
    )

    return response
  }

  // API 라우트가 아닌 경우 Supabase 세션 갱신
  return updateSession(request)
}

/**
 * Middleware 적용 경로 설정
 * 정적 파일(_next/static, _next/image, 이미지 등)을 제외한 모든 경로에 적용
 */
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
