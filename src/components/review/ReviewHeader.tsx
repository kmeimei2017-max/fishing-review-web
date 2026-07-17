/**
 * 후기 헤더 컴포넌트
 * 후기 제목과 작성자를 표시합니다.
 */

import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import type { Review } from '@/types/review'
import { cn } from '@/lib/utils'

interface ReviewHeaderProps {
  review: Review
  className?: string
}

export function ReviewHeader({ review, className }: ReviewHeaderProps) {
  return (
    <Card
      className={cn(
        'shadow-md transition-shadow duration-200 hover:shadow-lg',
        className
      )}
    >
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold sm:text-3xl">
          {review.title}
        </CardTitle>
        <p className="text-muted-foreground text-sm">
          {review.author}님의 후기
        </p>
      </CardHeader>
    </Card>
  )
}
