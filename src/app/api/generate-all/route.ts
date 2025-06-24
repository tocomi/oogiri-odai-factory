import { type NextRequest, NextResponse } from 'next/server'
import { generateOdaiWithClaude } from '@/lib/claude'
import { generateOdaiWithGemini } from '@/lib/gemini'
import { generateOdaiWithOpenAI } from '@/lib/openai'
import type { GenerateAllRequest, GenerateAllResponse } from '@/types'

export async function POST(request: NextRequest) {
  try {
    const body: GenerateAllRequest = await request.json()

    const { category, difficulty, count = 3, customPrompt } = body

    // バリデーション
    if (count < 1 || count > 10) {
      return NextResponse.json(
        { success: false, error: 'Count must be between 1 and 10' },
        { status: 400 },
      )
    }

    // 3つのAIから並行してお題を生成
    const [openaiResult, claudeResult, geminiResult] = await Promise.allSettled(
      [
        generateOdaiWithOpenAI(category, difficulty, count, customPrompt),
        generateOdaiWithClaude(category, difficulty, count, customPrompt),
        generateOdaiWithGemini(category, difficulty, count, customPrompt),
      ],
    )

    const response: GenerateAllResponse = {
      success: true,
      data: {
        openai: [],
        claude: [],
        gemini: [],
        totalCount: 0,
      },
      errors: {},
    }

    // OpenAI結果を処理
    if (
      openaiResult.status === 'fulfilled' &&
      openaiResult.value.success &&
      openaiResult.value.data
    ) {
      response.data!.openai = openaiResult.value.data.odais
    } else {
      const errorMessage =
        openaiResult.status === 'fulfilled'
          ? openaiResult.value.error || 'Unknown error'
          : 'Request failed'
      response.errors!.openai = errorMessage
    }

    // Claude結果を処理
    if (
      claudeResult.status === 'fulfilled' &&
      claudeResult.value.success &&
      claudeResult.value.data
    ) {
      response.data!.claude = claudeResult.value.data.odais
    } else {
      const errorMessage =
        claudeResult.status === 'fulfilled'
          ? claudeResult.value.error || 'Unknown error'
          : 'Request failed'
      response.errors!.claude = errorMessage
    }

    // Gemini結果を処理
    if (
      geminiResult.status === 'fulfilled' &&
      geminiResult.value.success &&
      geminiResult.value.data
    ) {
      response.data!.gemini = geminiResult.value.data.odais
    } else {
      const errorMessage =
        geminiResult.status === 'fulfilled'
          ? geminiResult.value.error || 'Unknown error'
          : 'Request failed'
      response.errors!.gemini = errorMessage
    }

    // 総数を計算
    response.data!.totalCount =
      response.data!.openai.length +
      response.data!.claude.length +
      response.data!.gemini.length

    // 全て失敗した場合はエラーレスポンス
    if (response.data!.totalCount === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'All AI services failed to generate content',
          errors: response.errors,
        },
        { status: 500 },
      )
    }

    // エラーがない場合は errors プロパティを削除
    if (Object.keys(response.errors!).length === 0) {
      delete response.errors
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Generate-all API route error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 },
    )
  }
}

export async function GET() {
  return NextResponse.json(
    { message: 'Generate-all API endpoint - Use POST method' },
    { status: 405 },
  )
}
