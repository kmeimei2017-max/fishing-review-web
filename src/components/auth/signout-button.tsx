'use client'

import { Button } from '@/components/ui/button'
import { LogOut } from 'lucide-react'
import { signOut } from '@/app/auth/actions'

export function SignOutButton() {
  return (
    <form action={signOut}>
      <Button type="submit" variant="ghost" size="sm">
        <LogOut />
        로그아웃
      </Button>
    </form>
  )
}
