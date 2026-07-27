'use client'

import { useCallback, useEffect, useState } from 'react'
import type { GeneratedOdai } from '@/types'

const STORAGE_KEY = 'oogiri-liked-odais'

/**
 * いいねの保持件数。新しいものが先頭なので、超過分は古いものから捨てる。
 *
 * localStorage の容量上限に当たって書き込みごと失敗するのを防ぐための上限で、
 * 見返す用途としてもこれ以上遡ることはないという想定。
 */
export const MAX_LIKED_ODAIS = 100

/** いいね一覧を localStorage へ書き出す。書き込めない環境では黙って諦める */
function write(odais: GeneratedOdai[]) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(odais))
  } catch {
    // ストレージが利用できない場合でも、現在の画面では見返せるようにする
  }
}

/**
 * いいねしたお題を localStorage に永続化して保持するフック。
 * 新しいものが先頭に積まれ、{@link MAX_LIKED_ODAIS} を超えた分は落とす。
 *
 * @returns `likedOdais` は新しい順。`like` は同じお題を重複させず、
 *   `unlike` は id 一致で取り除く（いずれも state と localStorage の両方を更新する）
 */
export function useLikedOdais() {
  const [likedOdais, setLikedOdais] = useState<GeneratedOdai[]>([])

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY)
      if (!saved) return

      const parsed: unknown = JSON.parse(saved)
      if (Array.isArray(parsed)) {
        // 上限を下げた場合や上限導入前のデータが残っている場合に備えて読み込み時も切り詰める
        setLikedOdais((parsed as GeneratedOdai[]).slice(0, MAX_LIKED_ODAIS))
      }
    } catch {
      window.localStorage.removeItem(STORAGE_KEY)
    }
  }, [])

  const like = useCallback((odai: GeneratedOdai) => {
    setLikedOdais((previous) => {
      const next = previous.some((item) => item.id === odai.id)
        ? previous
        : [odai, ...previous].slice(0, MAX_LIKED_ODAIS)

      write(next)

      return next
    })
  }, [])

  const unlike = useCallback((id: string) => {
    setLikedOdais((previous) => {
      const next = previous.filter((item) => item.id !== id)

      write(next)

      return next
    })
  }, [])

  return { likedOdais, like, unlike }
}
