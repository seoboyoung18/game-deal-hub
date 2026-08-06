import { useEffect, useState } from 'react'

// 최근 본 게임 — localStorage, 로그인 없이. 상세 페이지 진입 시 기록.
const KEY = 'dealmoa:recent'
const EVT = 'dealmoa:recent-change'
const MAX = 5

export function getRecent() {
  try {
    const v = JSON.parse(localStorage.getItem(KEY))
    return Array.isArray(v) ? v : []
  } catch {
    return []
  }
}

/** game: { gameId, title, thumbUrl, salePrice, krwSalePrice } (가격은 최저가 스냅샷) */
export function recordRecent(game) {
  if (!game?.gameId) return
  const list = getRecent().filter((g) => g.gameId !== game.gameId)
  list.unshift({ ...game, viewedAt: Date.now() })
  try {
    localStorage.setItem(KEY, JSON.stringify(list.slice(0, MAX)))
    window.dispatchEvent(new Event(EVT))
  } catch {
    /* 저장 불가(시크릿 등)면 조용히 무시 */
  }
}

export function useRecentGames() {
  const [list, setList] = useState(getRecent)
  useEffect(() => {
    const sync = () => setList(getRecent())
    window.addEventListener(EVT, sync)
    window.addEventListener('storage', sync)
    return () => {
      window.removeEventListener(EVT, sync)
      window.removeEventListener('storage', sync)
    }
  }, [])
  return list
}
