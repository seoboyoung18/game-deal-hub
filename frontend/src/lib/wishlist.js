import { useEffect, useState } from 'react'

// 위시리스트 — localStorage, 로그인 없이. 딜 스냅샷(저장 시점 가격) 보관.
const KEY = 'dealmoa:wishlist'
const EVT = 'dealmoa:wishlist-change'
const MAX = 100

export function getWishlist() {
  try {
    const v = JSON.parse(localStorage.getItem(KEY))
    return Array.isArray(v) ? v : []
  } catch {
    return []
  }
}

export function inWishlist(gameId) {
  return getWishlist().some((d) => d.gameId === gameId)
}

/** deal: DealResponse 형태 그대로 저장 (DealCard 재사용을 위해) */
export function toggleWishlist(deal) {
  if (!deal?.gameId) return
  const list = getWishlist()
  const idx = list.findIndex((d) => d.gameId === deal.gameId)
  if (idx >= 0) {
    list.splice(idx, 1)
  } else {
    const { dealId, gameId, title, storeName, salePrice, normalPrice, savings, currency, krwSalePrice, krwNormalPrice, thumbUrl } = deal
    list.unshift({
      dealId, gameId, title, storeName, salePrice, normalPrice, savings,
      currency, krwSalePrice, krwNormalPrice, thumbUrl, savedAt: Date.now(),
    })
  }
  try {
    localStorage.setItem(KEY, JSON.stringify(list.slice(0, MAX)))
    window.dispatchEvent(new Event(EVT))
  } catch {
    /* 저장 불가면 조용히 무시 */
  }
}

export function useWishlist() {
  const [list, setList] = useState(getWishlist)
  useEffect(() => {
    const sync = () => setList(getWishlist())
    window.addEventListener(EVT, sync)
    window.addEventListener('storage', sync)
    return () => {
      window.removeEventListener(EVT, sync)
      window.removeEventListener('storage', sync)
    }
  }, [])
  return list
}

/** 카드 하트용 — 이 게임이 위시에 있는지 + 변화 구독 */
export function useWished(gameId) {
  const [wished, setWished] = useState(() => inWishlist(gameId))
  useEffect(() => {
    const sync = () => setWished(inWishlist(gameId))
    sync()
    window.addEventListener(EVT, sync)
    window.addEventListener('storage', sync)
    return () => {
      window.removeEventListener(EVT, sync)
      window.removeEventListener('storage', sync)
    }
  }, [gameId])
  return wished
}
