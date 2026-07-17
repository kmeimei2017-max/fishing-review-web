/**
 * 후기 갤러리 그리드 컴포넌트
 * 반응형 카드 그리드로 후기 목록을 표시합니다.
 */

import { ReviewCard } from '@/components/review/ReviewCard'
import type { Review } from '@/types/review'

interface ReviewGridProps {
  reviews: Review[]
}

export function ReviewGrid({ reviews }: ReviewGridProps) {
  if (reviews.length === 0) {
    return (
      <div className="text-muted-foreground flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed py-24 text-center">
        <p className="text-lg font-medium">아직 등록된 후기가 없습니다</p>
        <p className="text-sm">
          검색 조건을 바꿔보시거나 나중에 다시 확인해 주세요.
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {reviews.map(review => (
        <ReviewCard key={review.id} review={review} />
      ))}
    </div>
  )
}
