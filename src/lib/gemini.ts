import { GoogleGenAI } from '@google/genai'
import type { Category, Difficulty, OdaiResponse } from '@/types'
import { buildPrompt, parseOdaiResponse } from './prompts'

const GEMINI_MODEL = 'gemini-2.0-flash'

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

    const ai = new GoogleGenAI({ apiKey })

    const prompt = buildPrompt({
      category,
      difficulty,
      count,
      customPrompt,
    })

    const { text: content, usageMetadata } = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: prompt,
    })

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
        tokens: usageMetadata?.totalTokenCount,
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
