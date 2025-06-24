import OpenAI from 'openai'
import type { Category, Difficulty, OdaiResponse } from '@/types'
import { buildPrompt, parseOdaiResponse } from './prompts'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function generateOdaiWithOpenAI(
  category?: Category,
  difficulty?: Difficulty,
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

    const prompt = buildPrompt(
      'openai',
      category,
      difficulty,
      count,
      customPrompt,
    )

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: prompt,
        },
      ],
      max_tokens: 1000,
      temperature: 0.8,
    })

    const content = completion.choices[0]?.message?.content
    if (!content) {
      return {
        success: false,
        error: 'No content received from OpenAI',
      }
    }

    const odais = parseOdaiResponse(content)

    if (odais.length === 0) {
      return {
        success: false,
        error: 'Failed to parse OpenAI response',
      }
    }

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
