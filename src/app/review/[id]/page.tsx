import { Footer } from '@/components/layout/footer'
import { ReviewHeader } from '@/components/review/ReviewHeader'
import { ReviewGallery } from '@/components/review/ReviewGallery'
import { ReviewSkeleton } from '@/components/review/ReviewSkeleton'
import { getOptimizedReview } from '@/lib/services/review.service'
import { notFound } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Suspense } from 'react'
import type { Metadata } from 'next'

interface ReviewPageProps {
  params: Promise<{
    id: string
  }>
}

/**
 * Open Graph 메타데이터 생성
 * 링크 미리보기에 후기 정보 표시
 */
export async function generateMetadata({
  params,
}: ReviewPageProps): Promise<Metadata> {
  const { id } = await params

  try {
    const review = await getOptimizedReview(id)

    return {
      title: review.title,
      description: `${review.author}님의 낚시 후기`,
      openGraph: {
        title: review.title,
        description: `${review.author}님의 낚시 후기`,
        images: review.images[0] ? [review.images[0]] : undefined,
        type: 'article',
      },
    }
  } catch {
    return {
      title: '후기 조회',
      description: '선상낚시 후기를 확인하세요',
    }
  }
}

/**
 * 후기 콘텐츠 컴포넌트 (Async Server Component)
 *
 * 데이터 페칭 로직을 분리하여 Suspense 경계 내에서 실행되도록 함
 */
async function ReviewContent({ id }: { id: string }) {
  let review
  try {
    review = await getOptimizedReview(id)
  } catch (error) {
    console.error('후기 조회 실패:', error)
    notFound()
  }

  if (!review) {
    notFound()
  }

  return (
    <div className="flex min-h-screen flex-col">
      <main className="bg-muted/30 flex-1">
        <div className="container mx-auto px-4 py-8 sm:py-12">
          <div className="mx-auto mb-6 max-w-3xl">
            <h1 className="text-foreground text-3xl font-bold sm:text-4xl">
              후기 상세보기
            </h1>
            <p className="text-muted-foreground mt-2">
              방문자가 남긴 선상낚시 후기를 확인하실 수 있습니다.
            </p>
          </div>

          <div className="mx-auto max-w-3xl space-y-8">
            <ReviewHeader review={review} />

            <Card>
              <CardHeader>
                <CardTitle>사진</CardTitle>
              </CardHeader>
              <CardContent>
                <ReviewGallery images={review.images} title={review.title} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>후기 내용</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-foreground whitespace-pre-wrap">
                  {review.content || '작성된 내용이 없습니다.'}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

/**
 * 후기 상세 페이지
 *
 * Suspense를 사용하여 점진적 로딩을 구현
 */
export default async function ReviewPage({ params }: ReviewPageProps) {
  const { id } = await params

  return (
    <Suspense fallback={<ReviewSkeleton />}>
      <ReviewContent id={id} />
    </Suspense>
  )
}
