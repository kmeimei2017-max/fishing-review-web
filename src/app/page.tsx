import { Suspense } from 'react'
import { Footer } from '@/components/layout/footer'
import { Container } from '@/components/layout/container'
import { ReviewGrid } from '@/components/review/ReviewGrid'
import { Pagination } from '@/components/review/pagination'
import { SearchBar } from '@/components/review/search-bar'
import { Skeleton } from '@/components/ui/skeleton'
import {
  getReviewsFromNotion,
  searchReviews,
  type ReviewFilters,
} from '@/lib/services/review.service'

interface HomePageProps {
  searchParams: Promise<{
    page?: string
    cursor?: string
    query?: string
  }>
}

/**
 * 후기 갤러리 콘텐츠 컴포넌트
 * Server Component로 데이터 페칭 수행
 */
async function ReviewGalleryContent({
  page,
  cursor,
  filters,
}: {
  page: number
  cursor?: string
  filters: ReviewFilters
}) {
  const hasFilters = !!filters.query

  const { reviews, nextCursor, hasMore } = hasFilters
    ? await searchReviews(filters, 12, cursor)
    : await getReviewsFromNotion(12, cursor)

  return (
    <div className="space-y-8">
      <ReviewGrid reviews={reviews} />
      {reviews.length > 0 && (
        <Pagination
          currentPage={page}
          hasNext={hasMore}
          nextCursor={nextCursor}
        />
      )}
    </div>
  )
}

function ReviewGallerySkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {[...Array(6)].map((_, i) => (
        <Skeleton key={i} className="aspect-4/3 w-full rounded-xl" />
      ))}
    </div>
  )
}

/**
 * 홈페이지 = 선상낚시 후기 갤러리 목록
 */
export default async function HomePage({ searchParams }: HomePageProps) {
  const params = await searchParams
  const page = Number(params.page) || 1
  const cursor = params.cursor

  const filters: ReviewFilters = {
    query: params.query,
  }

  return (
    <div className="flex min-h-screen flex-col">
      <main className="bg-muted/30 flex-1">
        <Container className="py-8 sm:py-12">
          <div className="mb-8">
            <h1 className="text-foreground text-3xl font-bold sm:text-4xl">
              선상낚시 후기
            </h1>
            <p className="text-muted-foreground mt-2">
              다녀온 배낚시 조황과 후기를 확인해 보세요.
            </p>
          </div>

          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <SearchBar defaultValue={filters.query} />
          </div>

          <Suspense fallback={<ReviewGallerySkeleton />}>
            <ReviewGalleryContent
              page={page}
              cursor={cursor}
              filters={filters}
            />
          </Suspense>
        </Container>
      </main>
      <Footer />
    </div>
  )
}
