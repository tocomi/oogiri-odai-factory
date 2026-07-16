import { type NextRequest, NextResponse } from 'next/server'
import { deleteFeedback, recordFeedback } from '@/lib/db'
import type { FeedbackRequest, FeedbackResponse } from '@/types'

const VALID_TYPES = ['like', 'dislike', 'copy', 'skip']

export async function POST(request: NextRequest) {
  try {
    const body: FeedbackRequest = await request.json()
    const { odaiId, type, reasonTag } = body

    if (!odaiId || !VALID_TYPES.includes(type)) {
      return NextResponse.json(
        { success: false, error: 'Invalid request' },
        { status: 400 },
      )
    }

    const eventId = recordFeedback(odaiId, type, reasonTag)

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

// 評価の取り消し（誤操作のUndo用）
export async function DELETE(request: NextRequest) {
  try {
    const { eventId } = await request.json()

    if (typeof eventId !== 'number') {
      return NextResponse.json(
        { success: false, error: 'Invalid request' },
        { status: 400 },
      )
    }

    deleteFeedback(eventId)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Feedback delete error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete feedback' },
      { status: 500 },
    )
  }
}
