import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LoginButtons } from '@/components/auth/login-buttons'
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
        <CardContent>
          <LoginButtons next={next || '/'} />
        </CardContent>
      </Card>
    </div>
  )
}
