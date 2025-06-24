import { GoogleGenerativeAI } from '@google/generative-ai'
import type { Category, Difficulty, OdaiResponse } from '@/types'
import { buildPrompt, parseOdaiResponse } from './prompts'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

export async function generateOdaiWithGemini(
  category?: Category,
  difficulty?: Difficulty,
  count: number = 5,
  customPrompt?: string,
): Promise<OdaiResponse> {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return {
        success: false,
        error: 'GEMINI_API_KEY is not configured',
      }
    }

    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      generationConfig: {
        temperature: 0.8,
        maxOutputTokens: 1000,
      },
    })

    const prompt = buildPrompt(
      'gemini',
      category,
      difficulty,
      count,
      customPrompt,
    )

    const result = await model.generateContent(prompt)
    const response = await result.response
    const content = response.text()

    if (!content) {
      return {
        success: false,
        error: 'No content received from Gemini',
      }
    }

    const odais = parseOdaiResponse(content)

    if (odais.length === 0) {
      return {
        success: false,
        error: 'Failed to parse Gemini response',
      }
    }

    return {
      success: true,
      data: {
        odais,
        source: 'gemini',
        model: 'gemini-2.0-flash',
        tokens: response.usageMetadata?.totalTokenCount,
      },
    }
  } catch (error) {
    console.error('Gemini API error:', error)

    if (error instanceof Error) {
      if (
        error.message.includes('rate limit') ||
        error.message.includes('quota')
      ) {
        return {
          success: false,
          error: 'API_RATE_LIMIT',
        }
      }

      if (error.message.includes('API key')) {
        return {
          success: false,
          error: 'Invalid API key',
        }
      }

      return {
        success: false,
        error: `Gemini API error: ${error.message}`,
      }
    }

    return {
      success: false,
      error: 'Unknown Gemini API error',
    }
  }
}
