import Anthropic from '@anthropic-ai/sdk'
import type { Category, Difficulty, OdaiResponse } from '@/types'
import { buildPrompt, parseOdaiResponse } from './prompts'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export async function generateOdaiWithClaude(
  category?: Category,
  difficulty?: Difficulty,
  count: number = 5,
  customPrompt?: string,
): Promise<OdaiResponse> {
  try {
    if (!process.env.ANTHROPIC_API_KEY) {
      return {
        success: false,
        error: 'ANTHROPIC_API_KEY is not configured',
      }
    }

    const prompt = buildPrompt({
      category,
      difficulty,
      count,
      customPrompt,
    })

    const message = await anthropic.messages.create({
      model: 'claude-3-7-sonnet-latest',
      max_tokens: 1000,
      temperature: 0.8,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    })

    const content = message.content[0]
    if (content.type !== 'text') {
      return {
        success: false,
        error: 'Unexpected response type from Claude',
      }
    }

    const odais = parseOdaiResponse(content.text)

    if (odais.length === 0) {
      return {
        success: false,
        error: 'Failed to parse Claude response',
      }
    }

    return {
      success: true,
      data: {
        odais,
        source: 'claude',
        model: message.model,
        tokens: message.usage?.input_tokens + message.usage?.output_tokens,
      },
    }
  } catch (error) {
    console.error('Claude API error:', error)

    if (error instanceof Error) {
      if (error.message.includes('rate limit')) {
        return {
          success: false,
          error: 'API_RATE_LIMIT',
        }
      }

      if (error.message.includes('quota') || error.message.includes('credit')) {
        return {
          success: false,
          error: 'API_QUOTA_EXCEEDED',
        }
      }

      return {
        success: false,
        error: `Claude API error: ${error.message}`,
      }
    }

    return {
      success: false,
      error: 'Unknown Claude API error',
    }
  }
}
