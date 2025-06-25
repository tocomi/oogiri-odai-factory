import type { Metadata } from 'next'
import './globals.css'
import { Analytics } from '@vercel/analytics/next'

export const metadata: Metadata = {
  title: '大喜利ネタ工場',
  description:
    'AIが大量生産する創造的な大喜利お題 - 大喜利ネタ工場。OpenAI、Claude、Geminiの3つのAIを使って多様な大喜利お題を工場のように量産します',
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
        <Analytics />
      </body>
    </html>
  )
}
