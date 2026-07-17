import { type NextRequest, NextResponse } from 'next/server'
import { deleteFeedback, recordFeedback } from '@/lib/db'
import type {
  FeedbackDeleteRequest,
  FeedbackRequest,
  FeedbackResponse,
} from '@/types'

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

// 評価の取り消し。POST 時に返した eventId を指定して削除する
export async function DELETE(request: NextRequest) {
  try {
    const body: FeedbackDeleteRequest = await request.json()
    const eventId = Number(body?.eventId)

    if (!Number.isInteger(eventId) || eventId <= 0) {
      return NextResponse.json(
        { success: false, error: 'Invalid request' },
        { status: 400 },
      )
    }

    await deleteFeedback(eventId)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Feedback delete API error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete feedback' },
      { status: 500 },
    )
  }
}
