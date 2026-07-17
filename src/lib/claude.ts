import Anthropic from '@anthropic-ai/sdk'
import type { Category, Difficulty, OdaiResponse } from '@/types'
import { persistGeneratedOdais } from './db'
import { buildPrompt, parseOdaiResponse } from './prompts'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

const CLAUDE_MODEL = 'claude-sonnet-5'

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

    const { prompt } = buildPrompt({
      category,
      difficulty,
      count,
      customPrompt,
      aiProvider: 'claude',
    })

    const message = await anthropic.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: 2000,
      // Sonnet 5 は thinking 省略時に adaptive thinking が有効になり
      // max_tokens を消費するため、従来挙動を維持する目的で無効化
      thinking: { type: 'disabled' },
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

    const parsed = parseOdaiResponse(content.text)

    if (parsed.length === 0) {
      return {
        success: false,
        error: 'Failed to parse Claude response',
      }
    }

    const tokens = message.usage?.input_tokens + message.usage?.output_tokens

    const odais = await persistGeneratedOdais({
      parsed,
      provider: 'claude',
      model: message.model,
      category,
      difficulty,
      keyword: customPrompt,
      promptText: prompt,
      tokens,
    })

    return {
      success: true,
      data: {
        odais,
        source: 'claude',
        model: message.model,
        tokens,
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
