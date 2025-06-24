import { type NextRequest, NextResponse } from 'next/server'
import { generateOdaiWithGemini } from '@/lib/gemini'
import type { OdaiRequest } from '@/types'

export async function POST(request: NextRequest) {
  try {
    const body: OdaiRequest = await request.json()

    const { category, difficulty, count = 5, customPrompt } = body

    // バリデーション
    if (count < 1 || count > 10) {
      return NextResponse.json(
        { success: false, error: 'Count must be between 1 and 10' },
        { status: 400 },
      )
    }

    const result = await generateOdaiWithGemini(
      category,
      difficulty,
      count,
      customPrompt,
    )

    if (!result.success) {
      const statusCode =
        result.error === 'API_RATE_LIMIT'
          ? 429
          : result.error === 'API_QUOTA_EXCEEDED'
            ? 402
            : 500

      return NextResponse.json(result, { status: statusCode })
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Gemini API route error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 },
    )
  }
}

export async function GET() {
  return NextResponse.json(
    { message: 'Gemini API endpoint - Use POST method' },
    { status: 405 },
  )
}
