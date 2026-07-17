/**
 * 후기 카드 컴포넌트
 * 갤러리 목록에서 대표 사진과 제목을 표시합니다.
 */

import Image from 'next/image'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import type { Review } from '@/types/review'
import { ImageOff } from 'lucide-react'

interface ReviewCardProps {
  review: Review
}

export function ReviewCard({ review }: ReviewCardProps) {
  const coverImage = review.images[0]

  return (
    <Link href={`/review/${review.id}`} className="block">
      <Card className="overflow-hidden py-0 transition-shadow duration-200 hover:shadow-lg">
        <div className="bg-muted relative aspect-4/3 w-full">
          {coverImage ? (
            <Image
              src={coverImage}
              alt={review.title}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover"
            />
          ) : (
            <div className="text-muted-foreground flex h-full w-full items-center justify-center">
              <ImageOff className="h-10 w-10" />
            </div>
          )}
        </div>

        <CardContent className="space-y-2 pb-6">
          <h3 className="truncate text-lg font-semibold">{review.title}</h3>
        </CardContent>
      </Card>
    </Link>
  )
}
