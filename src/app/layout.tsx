import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '大喜利お題生成器',
  description:
    '3つのAI（OpenAI、Claude、Gemini）を使って多様な大喜利のお題を生成するアプリ',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ja">
      <body className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
        {children}
      </body>
    </html>
  )
}
