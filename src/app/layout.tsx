import type { Metadata } from 'next'
import { Shippori_Mincho_B1, Zen_Kaku_Gothic_New } from 'next/font/google'
import './globals.css'
import { Analytics } from '@vercel/analytics/next'

const shipporiMincho = Shippori_Mincho_B1({
  weight: ['500', '700'],
  subsets: ['latin'],
  variable: '--font-shippori',
  display: 'swap',
})

const zenKakuGothic = Zen_Kaku_Gothic_New({
  weight: ['400', '500', '700'],
  subsets: ['latin'],
  variable: '--font-zen',
  display: 'swap',
})

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
      <body
        className={`${shipporiMincho.variable} ${zenKakuGothic.variable} min-h-dvh bg-paper font-gothic text-ink antialiased`}
      >
        {children}
        <Analytics />
      </body>
    </html>
  )
}
