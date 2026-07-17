import { Skeleton } from '@/components/ui/skeleton'
import { Footer } from '@/components/layout/footer'

/**
 * 후기 상세 페이지 로딩 중 표시되는 스켈레톤 UI
 */
export function ReviewSkeleton() {
  return (
    <div className="flex min-h-screen flex-col">
      <main className="bg-muted/30 flex-1">
        <div className="container mx-auto px-4 py-8 sm:py-12">
          <div className="mx-auto mb-6 max-w-3xl">
            <Skeleton className="h-10 w-48 sm:h-12" />
            <Skeleton className="mt-2 h-6 w-96" />
          </div>

          <div className="mx-auto max-w-3xl space-y-8">
            {/* 헤더 스켈레톤 */}
            <div className="bg-card rounded-lg border p-6 shadow-sm">
              <Skeleton className="h-8 w-48" />
              <div className="mt-4 grid gap-6 sm:grid-cols-2">
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-full" />
              </div>
            </div>

            {/* 사진 갤러리 스켈레톤 */}
            <div className="bg-card rounded-lg border p-6 shadow-sm">
              <Skeleton className="h-6 w-24" />
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {[...Array(6)].map((_, i) => (
                  <Skeleton key={i} className="aspect-square w-full" />
                ))}
              </div>
            </div>

            {/* 본문 스켈레톤 */}
            <div className="bg-card rounded-lg border p-6 shadow-sm">
              <Skeleton className="h-6 w-24" />
              <div className="mt-4 space-y-2">
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-2/3" />
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
