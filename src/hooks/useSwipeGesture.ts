'use client'

import { type PointerEvent, useRef, useState } from 'react'

/** 横に掴むまでの移動量。接地直後の縦揺れが先に出ても、ここまでは未決のまま待つ */
const GRAB_X = 10
/** 縦操作として捨てる移動量。明確な縦操作だけをブラウザのスクロール意図とみなす */
const DROP_Y = 28
/** 確定に必要な横移動量。カード幅に対する割合で決め、広い画面で遠くまで運ばせない */
const THRESHOLD_RATIO = 0.25
const THRESHOLD_MAX = 96
/** 向きを見せ始める進捗。少し動いただけで決裁済みに見せない */
const DIRECTION_START = 0.15

export type SwipeDirection = 'like' | 'dislike'

/** 掴んでいる間だけ持つ、描画に関わらない指の情報 */
type Gesture = {
  pointerId: number
  startX: number
  startY: number
  /** 横移動と判断して掴んだか。掴むまでは中のボタンの click を邪魔しない */
  holding: boolean
  /** 掴んだ時点の幅から決めるので、途中で画面幅が変わってもぶれない */
  threshold: number
}

/** 掴んでいる間の見た目 */
type DragState = {
  offsetX: number
  threshold: number
}

/**
 * 要素を横にドラッグして左右どちらかへ確定する操作。
 *
 * タッチ・ペン・マウスを pointer events でまとめて扱い、
 * 閾値を超えて離したときだけ一度 `onSwipe` を呼ぶ。
 * 閾値未満・縦方向の操作・pointer cancel では何も起こさず元の位置へ戻す
 */
export function useSwipeGesture({
  onSwipe,
}: {
  onSwipe: (direction: SwipeDirection, offsetX: number) => void
}) {
  const gestureRef = useRef<Gesture | null>(null)
  const [drag, setDrag] = useState<DragState | null>(null)

  const handlePointerDown = (e: PointerEvent<HTMLElement>) => {
    // 主ボタン以外と、追加で触れた指は無視する
    if (e.button !== 0 || gestureRef.current) return
    // ボタン（コピー等）の操作はドラッグの開始として扱わない
    if (e.target instanceof Element && e.target.closest('button')) return

    gestureRef.current = {
      pointerId: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      holding: false,
      threshold: Math.min(
        THRESHOLD_MAX,
        e.currentTarget.getBoundingClientRect().width * THRESHOLD_RATIO,
      ),
    }
  }

  const handlePointerMove = (e: PointerEvent<HTMLElement>) => {
    const gesture = gestureRef.current
    if (!gesture || gesture.pointerId !== e.pointerId) return

    const offsetX = e.clientX - gesture.startX
    const offsetY = e.clientY - gesture.startY

    if (!gesture.holding) {
      // 縦方向が明確に勝ったときだけスクロール等の意図とみなし、以降は手を出さない。
      // 小さな縦揺れは未決のまま保持し、後続の横移動で掴めるようにする
      if (
        Math.abs(offsetY) > DROP_Y &&
        Math.abs(offsetY) > Math.abs(offsetX) * 1.5
      ) {
        gestureRef.current = null
        return
      }
      if (Math.abs(offsetX) <= GRAB_X) return

      gesture.holding = true
      // 掴んでから捕捉する。pointerdown の時点で捕捉すると
      // click が捕捉先へ逸れて、中のボタンが反応しなくなる
      e.currentTarget.setPointerCapture(e.pointerId)
      setDrag({ offsetX, threshold: gesture.threshold })
      return
    }

    setDrag((current) => (current ? { ...current, offsetX } : current))
  }

  /** 捕捉を解いて指の情報を捨てる。掴んでいた場合だけその情報を返す */
  const releaseGesture = (e: PointerEvent<HTMLElement>): Gesture | null => {
    const gesture = gestureRef.current
    if (!gesture || gesture.pointerId !== e.pointerId) return null

    gestureRef.current = null
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId)
    }
    return gesture
  }

  const handlePointerUp = (e: PointerEvent<HTMLElement>) => {
    const gesture = releaseGesture(e)
    // 掴む前に離したならタップ。click をそのまま通す
    if (!gesture?.holding) return

    const offsetX = e.clientX - gesture.startX
    if (Math.abs(offsetX) >= gesture.threshold) {
      // 離した位置も渡して、確定後の演出をそこから続けられるようにする
      onSwipe(offsetX > 0 ? 'like' : 'dislike', offsetX)
    }
    // 閾値未満ならそのまま元の位置へ戻る
    setDrag(null)
  }

  const handlePointerCancel = (e: PointerEvent<HTMLElement>) => {
    if (!releaseGesture(e)) return
    setDrag(null)
  }

  const offsetX = drag?.offsetX ?? 0
  const progress = drag ? Math.min(Math.abs(offsetX) / drag.threshold, 1) : 0

  return {
    /** 掴む対象の要素にそのまま広げる */
    handlers: {
      onPointerDown: handlePointerDown,
      onPointerMove: handlePointerMove,
      onPointerUp: handlePointerUp,
      onPointerCancel: handlePointerCancel,
    },
    /** 掴んでいる間の横移動量。掴んでいなければ 0 */
    offsetX,
    holding: drag !== null,
    /** 確定までの進捗（0〜1） */
    progress,
    /** 進捗が一定を超えてから決まる向き。それまでは null */
    direction:
      progress > DIRECTION_START
        ? ((offsetX > 0 ? 'like' : 'dislike') as SwipeDirection)
        : null,
  }
}
