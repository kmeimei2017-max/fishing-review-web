/**
 * 후기 상세 페이지 사진 갤러리 컴포넌트
 * 사진 그리드를 보여주고, 클릭 시 확대(라이트박스)로 전환합니다.
 */

'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, ImageOff } from 'lucide-react'

interface ReviewGalleryProps {
  images: string[]
  title: string
}

export function ReviewGallery({ images, title }: ReviewGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)

  if (images.length === 0) {
    return (
      <div className="text-muted-foreground bg-muted/50 flex h-48 items-center justify-center rounded-lg border border-dashed">
        <div className="flex flex-col items-center gap-2">
          <ImageOff className="h-8 w-8" />
          <p className="text-sm">등록된 사진이 없습니다</p>
        </div>
      </div>
    )
  }

  function showPrevious() {
    setSelectedIndex(current =>
      current === null ? null : (current - 1 + images.length) % images.length
    )
  }

  function showNext() {
    setSelectedIndex(current =>
      current === null ? null : (current + 1) % images.length
    )
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {images.map((imageUrl, index) => (
          <button
            key={imageUrl + index}
            type="button"
            onClick={() => setSelectedIndex(index)}
            className="bg-muted relative aspect-square overflow-hidden rounded-lg"
          >
            <Image
              src={imageUrl}
              alt={`${title} 사진 ${index + 1}`}
              fill
              sizes="(max-width: 640px) 50vw, 33vw"
              className="object-cover transition-transform duration-200 hover:scale-105"
            />
          </button>
        ))}
      </div>

      <Dialog
        open={selectedIndex !== null}
        onOpenChange={open => !open && setSelectedIndex(null)}
      >
        <DialogContent className="max-w-3xl p-2 sm:p-4">
          <DialogTitle className="sr-only">{title} 사진 확대보기</DialogTitle>
          {selectedIndex !== null && (
            <div className="relative">
              <div className="relative aspect-4/3 w-full overflow-hidden rounded-md">
                <Image
                  src={images[selectedIndex]}
                  alt={`${title} 사진 ${selectedIndex + 1}`}
                  fill
                  sizes="100vw"
                  className="object-contain"
                />
              </div>

              {images.length > 1 && (
                <div className="mt-2 flex items-center justify-between">
                  <Button variant="outline" size="sm" onClick={showPrevious}>
                    <ChevronLeft className="mr-1 h-4 w-4" />
                    이전
                  </Button>
                  <span className="text-muted-foreground text-sm">
                    {selectedIndex + 1} / {images.length}
                  </span>
                  <Button variant="outline" size="sm" onClick={showNext}>
                    다음
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
