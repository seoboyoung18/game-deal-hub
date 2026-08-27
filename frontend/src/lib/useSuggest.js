import { useEffect, useState } from 'react'
import { api } from './api.js'

// 검색 자동완성 — 300ms 디바운스, 2자 이상일 때만 조회, 늦게 온 응답은 버림.
// 한글 질의는 백엔드가 스팀 한국어 검색으로 매칭하므로 그대로 통과시킨다.
export function useSuggest(q) {
  const [items, setItems] = useState([])

  useEffect(() => {
    const term = q.trim()
    if (term.length < 2) {
      setItems([])
      return
    }
    let alive = true
    const t = setTimeout(() => {
      api
        .searchGames({ q: term, size: 5 })
        .then((res) => alive && setItems(res.content))
        .catch(() => alive && setItems([]))
    }, 300)
    return () => {
      alive = false
      clearTimeout(t)
    }
  }, [q])

  return items
}

// 제안 목록 키보드 탐색 (↑↓ 이동 · Enter 선택 · Escape 닫기).
// active === -1 이면 Enter 는 폼 제출(전체 검색)로 흘러간다.
export function useSuggestNav(items, onPick) {
  const [active, setActive] = useState(-1)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    setActive(-1)
  }, [items])

  const onKeyDown = (e) => {
    if (!open || items.length === 0) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActive((a) => (a + 1) % items.length)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActive((a) => (a <= 0 ? items.length - 1 : a - 1))
    } else if (e.key === 'Escape') {
      setOpen(false)
    } else if (e.key === 'Enter' && active >= 0) {
      e.preventDefault()
      onPick(items[active])
    }
  }

  return { active, setActive, open, setOpen, onKeyDown }
}
