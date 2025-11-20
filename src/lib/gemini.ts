import { GoogleGenerativeAI } from '@google/generative-ai'
import type { Category, Difficulty, OdaiResponse } from '@/types'
import { buildPrompt, parseOdaiResponse } from './prompts'

const GEMINI_MODEL = 'gemini-1.5-flash'

export async function generateOdaiWithGemini(
  category?: Category,
  difficulty?: Difficulty,
  count: number = 5,
  customPrompt?: string,
): Promise<OdaiResponse> {
  try {
    const apiKey = process.env.GEMINI_API_KEY

    if (!apiKey) {
      return {
        success: false,
        error: 'GEMINI_API_KEY is not configured',
      }
    }

    const genAI = new GoogleGenerativeAI(apiKey)

    const model = genAI.getGenerativeModel({
      model: GEMINI_MODEL,
      generationConfig: {
        temperature: 0.8,
        maxOutputTokens: 1000,
      },
    })

    const prompt = buildPrompt({
      category,
      difficulty,
      count,
      customPrompt,
    })

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
        model: GEMINI_MODEL,
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
