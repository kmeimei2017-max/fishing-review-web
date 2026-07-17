/**
 * 후기 작성 폼 컴포넌트
 * 사진은 Supabase Storage(review-images 버킷)에 클라이언트에서 직접 업로드한 뒤,
 * 확보한 URL과 함께 서버 액션(submitReview)을 호출한다.
 */

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { reviewFormSchema, type ReviewFormData } from '@/lib/schemas/review'
import { submitReview } from '@/app/write/actions'
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
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { ImageOff, Loader2, X } from 'lucide-react'

const IMAGE_BUCKET = 'review-images'

export function ReviewForm() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [previews, setPreviews] = useState<string[]>([])

  const form = useForm<ReviewFormData>({
    resolver: zodResolver(reviewFormSchema),
    defaultValues: {
      title: '',
      content: '',
      images: [],
    },
  })

  function handleFilesSelected(fileList: FileList | null) {
    const files = fileList ? Array.from(fileList) : []
    form.setValue('images', files, { shouldValidate: true })

    previews.forEach(url => URL.revokeObjectURL(url))
    setPreviews(files.map(file => URL.createObjectURL(file)))
  }

  function removeImage(index: number) {
    const currentFiles = form.getValues('images')
    const nextFiles = currentFiles.filter((_, i) => i !== index)
    form.setValue('images', nextFiles, { shouldValidate: true })

    URL.revokeObjectURL(previews[index])
    setPreviews(previews.filter((_, i) => i !== index))
  }

  async function uploadImages(files: File[]): Promise<string[]> {
    const supabase = createClient()

    const uploads = files.map(async file => {
      const path = `${crypto.randomUUID()}-${file.name}`
      const { error } = await supabase.storage
        .from(IMAGE_BUCKET)
        .upload(path, file)

      if (error) {
        throw new Error(`사진 업로드 실패: ${error.message}`)
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from(IMAGE_BUCKET).getPublicUrl(path)

      return publicUrl
    })

    return Promise.all(uploads)
  }

  async function onSubmit(data: ReviewFormData) {
    setIsSubmitting(true)

    try {
      const imageUrls = await uploadImages(data.images)

      const result = await submitReview({
        title: data.title,
        content: data.content,
        images: imageUrls,
      })

      if (!result.success) {
        toast.error(result.message)
        if (result.errors) {
          Object.entries(result.errors).forEach(([field, messages]) => {
            if (messages?.[0]) {
              form.setError(field as keyof ReviewFormData, {
                type: 'server',
                message: messages[0],
              })
            }
          })
        }
        return
      }

      toast.success(result.message)
      router.push('/')
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : '후기 제출 중 오류가 발생했습니다'
      toast.error(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>제목</FormLabel>
              <FormControl>
                <Input placeholder="후기 제목을 입력하세요" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>내용</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="낚시 후기를 자유롭게 작성해주세요"
                  className="min-h-[200px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="images"
          render={() => (
            <FormItem>
              <FormLabel>사진 (최대 5장)</FormLabel>
              <FormControl>
                <Input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={e => handleFilesSelected(e.target.files)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {previews.length > 0 ? (
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
            {previews.map((url, index) => (
              <div
                key={url}
                className="bg-muted relative aspect-square overflow-hidden rounded-lg"
              >
                {/* 로컬 blob: 미리보기라 next/image 대신 img를 그대로 사용 */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={url}
                  alt={`첨부 사진 ${index + 1}`}
                  className="h-full w-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="bg-background/80 hover:bg-background absolute top-1 right-1 rounded-full p-1"
                  aria-label="사진 제거"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-muted-foreground bg-muted/50 flex h-24 items-center justify-center gap-2 rounded-lg border border-dashed text-sm">
            <ImageOff className="h-4 w-4" />
            첨부된 사진이 없습니다
          </div>
        )}

        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? (
            <>
              <Loader2 className="animate-spin" />
              제출 중...
            </>
          ) : (
            '후기 제출'
          )}
        </Button>
      </form>
    </Form>
  )
}
