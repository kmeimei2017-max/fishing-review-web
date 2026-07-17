import type { Metadata } from 'next'
import { Geist_Mono, Noto_Sans_KR } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/providers/theme-provider'
import { Toaster } from '@/components/ui/sonner'
import { Header } from '@/components/layout/header'

// 한글 폰트 최적화: Noto Sans KR (Google Fonts)
const notoSansKR = Noto_Sans_KR({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-noto-sans-kr',
  preload: true,
  fallback: ['system-ui', 'sans-serif'],
  weight: ['400', '500', '700'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: '선상낚시 후기 게시판',
  description: '선상낚시 후기 게시판 - 배낚시 조황과 후기를 웹에서 확인하세요',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ko" suppressHydrationWarning className={notoSansKR.variable}>
      <body className={`${geistMono.variable} font-sans antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Header />
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
