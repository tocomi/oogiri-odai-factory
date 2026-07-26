import OpenAI from 'openai'
import type { Category, OdaiResponse } from '@/types'
import { persistGeneratedOdais } from './db'
import { buildPrompt, parseOdaiResponse } from './prompts'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

const OPENAI_MODEL = 'gpt-5.6-luna'

export async function generateOdaiWithOpenAI(
  category?: Category,
  count: number = 5,
  customPrompt?: string,
): Promise<OdaiResponse> {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return {
        success: false,
        error: 'OPENAI_API_KEY is not configured',
      }
    }

    const { prompt, techniqueVariant, presentedTechniques } = buildPrompt({
      category,
      count,
      customPrompt,
    })

    const completion = await openai.chat.completions.create({
      model: OPENAI_MODEL,
      // Claude / Gemini と同じく単一の user ターンとして渡す。
      // system に入れるとモデルの追従度が変わり、provider 間の評価差に
      // 「モデルの差」と「注入層の差」が混ざってしまう
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      max_completion_tokens: 2000,
      temperature: 1,
    })

    const content = completion.choices[0]?.message?.content
    if (!content) {
      return {
        success: false,
        error: 'No content received from OpenAI',
      }
    }

    const parsed = parseOdaiResponse(content)

    if (parsed.length === 0) {
      return {
        success: false,
        error: 'Failed to parse OpenAI response',
      }
    }

    const odais = await persistGeneratedOdais({
      parsed,
      provider: 'openai',
      model: completion.model,
      category,
      keyword: customPrompt,
      promptText: prompt,
      techniqueVariant,
      presentedTechniques,
      tokens: completion.usage?.total_tokens,
    })

    return {
      success: true,
      data: {
        odais,
        source: 'openai',
        model: completion.model,
        tokens: completion.usage?.total_tokens,
      },
    }
  } catch (error) {
    console.error('OpenAI API error:', error)

    if (error instanceof Error) {
      if (error.message.includes('rate limit')) {
        return {
          success: false,
          error: 'API_RATE_LIMIT',
        }
      }

      if (error.message.includes('quota')) {
        return {
          success: false,
          error: 'API_QUOTA_EXCEEDED',
        }
      }

      return {
        success: false,
        error: `OpenAI API error: ${error.message}`,
      }
    }

    return {
      success: false,
      error: 'Unknown OpenAI API error',
    }
  }
}
