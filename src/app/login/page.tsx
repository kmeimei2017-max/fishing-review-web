import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { LoginButtons } from '@/components/auth/login-buttons'
import { EmailLoginForm } from '@/components/auth/email-login-form'
import { createClient } from '@/lib/supabase/server'

interface LoginPageProps {
  searchParams: Promise<{
    next?: string
  }>
}

/**
 * 로그인 페이지
 * 이미 로그인한 사용자는 next 파라미터(또는 홈)로 리다이렉트
 */
export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { next } = await searchParams

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    redirect(next || '/')
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-center text-2xl">로그인</CardTitle>
          <p className="text-muted-foreground text-center text-sm">
            소셜 로그인으로 후기를 작성해보세요.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <LoginButtons next={next || '/'} />

          <div className="flex items-center gap-3">
            <Separator className="flex-1" />
            <span className="text-muted-foreground text-xs">또는</span>
            <Separator className="flex-1" />
          </div>

          <EmailLoginForm next={next || '/'} />
        </CardContent>
      </Card>
    </div>
  )
}
