import { redirect } from 'next/navigation'
import { Container } from '@/components/layout/container'
import { Footer } from '@/components/layout/footer'
import { ReviewForm } from '@/components/review/review-form'
import { createClient } from '@/lib/supabase/server'

/**
 * 후기 작성 페이지 (로그인 필요)
 */
export default async function WritePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login?next=/write')
  }

  return (
    <div className="flex min-h-screen flex-col">
      <main className="bg-muted/30 flex-1">
        <Container className="py-8 sm:py-12">
          <div className="mx-auto mb-6 max-w-2xl">
            <h1 className="text-foreground text-3xl font-bold sm:text-4xl">
              후기 작성
            </h1>
            <p className="text-muted-foreground mt-2">
              작성하신 후기는 제출 즉시 공개됩니다.
            </p>
          </div>

          <div className="mx-auto max-w-2xl">
            <ReviewForm />
          </div>
        </Container>
      </main>
      <Footer />
    </div>
  )
}
