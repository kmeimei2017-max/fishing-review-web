/**
 * 이메일/비밀번호 로그인 폼
 * 소셜 로그인(구글/카카오) 연동 전, 관리자 테스트용 임시 로그인 수단
 */

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { emailLoginSchema, type EmailLoginFormData } from '@/lib/schemas/auth'
import { createClient } from '@/lib/supabase/client'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'

interface EmailLoginFormProps {
  /** 로그인 성공 후 돌아올 경로 (기본값: 홈) */
  next?: string
}

export function EmailLoginForm({ next = '/' }: EmailLoginFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<EmailLoginFormData>({
    resolver: zodResolver(emailLoginSchema),
    defaultValues: { email: '', password: '' },
  })

  async function onSubmit(data: EmailLoginFormData) {
    setIsSubmitting(true)

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword(data)

    if (error) {
      toast.error('로그인 실패: 이메일 또는 비밀번호를 확인해주세요')
      setIsSubmitting(false)
      return
    }

    router.push(next)
    router.refresh()
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>이메일</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="admin@test.com"
                  autoComplete="email"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>비밀번호</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  autoComplete="current-password"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          variant="outline"
          size="lg"
          disabled={isSubmitting}
          className="w-full"
        >
          {isSubmitting ? <Loader2 className="animate-spin" /> : null}
          이메일로 로그인
        </Button>
      </form>
    </Form>
  )
}
