import { Footer } from '@/components/layout/footer'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

/**
 * 후기 페이지 로딩 UI
 * Next.js App Router의 loading.tsx는 자동으로 Suspense 경계를 생성합니다.
 */
export default function ReviewLoading() {
  return (
    <div className="flex min-h-screen flex-col">
      <main className="bg-muted/30 flex-1">
        <div className="container mx-auto px-4 py-8 sm:py-12">
          <div className="mb-6 space-y-2">
            <Skeleton className="h-9 w-40 sm:h-10" />
            <Skeleton className="h-5 w-64" />
          </div>

          <div className="mx-auto max-w-3xl space-y-6">
            <Card>
              <CardHeader className="space-y-1">
                <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                  <Skeleton className="h-8 w-48 sm:h-9" />
                  <Skeleton className="h-5 w-24" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-6 w-full" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-24" />
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {[...Array(6)].map((_, i) => (
                    <Skeleton key={i} className="aspect-square w-full" />
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
