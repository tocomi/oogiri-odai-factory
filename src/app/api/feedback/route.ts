import { type NextRequest, NextResponse } from 'next/server'
import { recordFeedback } from '@/lib/db'
import type { FeedbackRequest, FeedbackResponse } from '@/types'

const VALID_TYPES = ['like', 'dislike', 'copy', 'skip']

export async function POST(request: NextRequest) {
  try {
    const body: FeedbackRequest = await request.json()
    const { odaiId, type } = body

    if (!odaiId || !VALID_TYPES.includes(type)) {
      return NextResponse.json(
        { success: false, error: 'Invalid request' },
        { status: 400 },
      )
    }

    const eventId = await recordFeedback(odaiId, type)

    const response: FeedbackResponse = { success: true, eventId }
    return NextResponse.json(response)
  } catch (error) {
    console.error('Feedback API error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to record feedback' },
      { status: 500 },
    )
  }
}
