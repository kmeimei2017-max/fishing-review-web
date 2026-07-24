/**
 * 공용 헤더
 * 로고/홈 링크, 글쓰기 링크, 로그인 상태(서버에서 조회)를 표시
 */

import Link from 'next/link'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { SignOutButton } from '@/components/auth/signout-button'
import { createClient } from '@/lib/supabase/server'
import { Container } from '@/components/layout/container'
import { PenLine } from 'lucide-react'

export async function Header() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const displayName =
    (user?.user_metadata?.full_name as string | undefined) ||
    (user?.user_metadata?.name as string | undefined) ||
    user?.email ||
    ''
  const avatarUrl = user?.user_metadata?.avatar_url as string | undefined

  return (
    <header className="bg-background/80 sticky top-0 z-40 border-b backdrop-blur">
      <Container className="flex h-14 items-center justify-between">
        <Link href="/" className="font-semibold">
          선상낚시 후기
        </Link>

        <div className="flex items-center gap-2">
          {user ? (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/write">
                  <PenLine />
                  글쓰기
                </Link>
              </Button>
              <Avatar className="size-7">
                <AvatarImage src={avatarUrl} alt={displayName} />
                <AvatarFallback>{displayName.slice(0, 1)}</AvatarFallback>
              </Avatar>
              <SignOutButton />
            </>
          ) : (
            <Button variant="outline" size="sm" asChild>
              <Link href="/login?next=/write">로그인</Link>
            </Button>
          )}
        </div>
      </Container>
    </header>
  )
}
