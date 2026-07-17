import { z } from 'zod'

const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  VERCEL_URL: z.string().optional(),
  NEXT_PUBLIC_APP_URL: z.string().url().optional(),
  NEXT_PUBLIC_BASE_URL: z
    .string()
    .url()
    .optional()
    .default('http://localhost:3000'),
  NOTION_API_KEY: z
    .string()
    .min(1, 'NOTION_API_KEY는 필수입니다')
    .refine(
      key => key.startsWith('secret_') || key.startsWith('ntn_'),
      'NOTION_API_KEY는 "secret_" 또는 "ntn_"로 시작해야 합니다'
    ),
  NOTION_DATABASE_ID: z
    .string()
    .min(1, 'NOTION_DATABASE_ID는 필수입니다')
    .length(32, 'NOTION_DATABASE_ID는 32자여야 합니다'),
  NEXT_PUBLIC_SUPABASE_URL: z
    .string()
    .url('NEXT_PUBLIC_SUPABASE_URL은 올바른 URL이어야 합니다'),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z
    .string()
    .min(1, 'NEXT_PUBLIC_SUPABASE_ANON_KEY는 필수입니다'),
})

export const env = envSchema.parse({
  NODE_ENV: process.env.NODE_ENV,
  VERCEL_URL: process.env.VERCEL_URL,
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
  NOTION_API_KEY: process.env.NOTION_API_KEY,
  NOTION_DATABASE_ID: process.env.NOTION_DATABASE_ID,
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
})

export type Env = z.infer<typeof envSchema>
