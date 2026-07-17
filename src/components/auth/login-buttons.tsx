/**
 * 소셜 로그인 버튼 컴포넌트
 * Google / 카카오 OAuth 로그인을 트리거합니다.
 */

'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Chrome, Loader2, MessageCircle } from 'lucide-react'

type Provider = 'google' | 'kakao'

interface LoginButtonsProps {
  /** 로그인 성공 후 돌아올 경로 (기본값: 홈) */
  next?: string
}

export function LoginButtons({ next = '/' }: LoginButtonsProps) {
  const [loadingProvider, setLoadingProvider] = useState<Provider | null>(null)

  async function handleLogin(provider: Provider) {
    setLoadingProvider(provider)
    const supabase = createClient()

    const redirectUrl = new URL('/auth/callback', window.location.origin)
    redirectUrl.searchParams.set('next', next)

    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: redirectUrl.toString(),
      },
    })

    if (error) {
      setLoadingProvider(null)
    }
    // 성공 시 브라우저가 OAuth 제공자 페이지로 리다이렉트되므로 별도 처리 불필요
  }

  return (
    <div className="flex flex-col gap-3">
      <Button
        type="button"
        variant="outline"
        size="lg"
        disabled={loadingProvider !== null}
        onClick={() => handleLogin('google')}
      >
        {loadingProvider === 'google' ? (
          <Loader2 className="animate-spin" />
        ) : (
          <Chrome />
        )}
        Google로 계속하기
      </Button>

      <Button
        type="button"
        size="lg"
        disabled={loadingProvider !== null}
        onClick={() => handleLogin('kakao')}
        className="bg-[#FEE500] text-black hover:bg-[#FEE500]/90"
      >
        {loadingProvider === 'kakao' ? (
          <Loader2 className="animate-spin" />
        ) : (
          <MessageCircle />
        )}
        카카오로 계속하기
      </Button>
    </div>
  )
}
