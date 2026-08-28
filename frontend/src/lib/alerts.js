import { useEffect, useState } from 'react'
import { api } from './api.js'

// 가격 알림 — 로그인이 없어 브라우저(localStorage)에 목표가를 담아두고,
// 페이지를 열 때마다 백엔드에서 현재 최저가를 받아 목표 도달을 판정한다.
// 목표가는 항상 USD 기준으로 저장한다(백엔드 sale_price 와 같은 단위).
const KEY = 'dealmoa:alerts'
const EVT = 'dealmoa:alerts-change'
const MAX = 50 // 백엔드 GameService.MAX_PRICE_IDS 와 맞춤
const CHECK_INTERVAL_MS = 10 * 60 * 1000 // 같은 탭에서 재확인 최소 간격

export function getAlerts() {
  try {
    const v = JSON.parse(localStorage.getItem(KEY))
    return Array.isArray(v) ? v : []
  } catch {
    return []
  }
}

function save(list) {
  try {
    localStorage.setItem(KEY, JSON.stringify(list.slice(0, MAX)))
    window.dispatchEvent(new Event(EVT))
  } catch {
    /* 저장 불가(시크릿 등)면 조용히 무시 */
  }
}

export function getAlert(gameId) {
  return getAlerts().find((a) => a.gameId === gameId) || null
}

/**
 * 알림 등록/수정. targetPrice 는 USD.
 * game: { gameId, title, thumbUrl }, basePrice: 설정 당시 최저가(USD)
 */
export function setAlert(game, targetPrice, basePrice = null) {
  const target = Number(targetPrice)
  if (!game?.gameId || !Number.isFinite(target) || target <= 0) return
  const list = getAlerts().filter((a) => a.gameId !== game.gameId)
  list.unshift({
    gameId: game.gameId,
    title: game.title,
    thumbUrl: game.thumbUrl ?? null,
    // 원화로 입력하면 USD 로 환산해 담기므로 소수점 2자리로 자르면 되돌릴 때 값이 틀어진다
    targetPrice: Number(target.toFixed(4)),
    basePrice: basePrice != null ? Number(basePrice) : null,
    currentPrice: basePrice != null ? Number(basePrice) : null,
    storeName: null,
    createdAt: Date.now(),
    checkedAt: null,
    triggeredAt: null,
    triggeredPrice: null,
    seen: true,
  })
  save(list)
}

export function removeAlert(gameId) {
  save(getAlerts().filter((a) => a.gameId !== gameId))
}

/** 벨을 열어 확인함 — 미확인 뱃지 해제 */
export function markAlertsSeen() {
  const list = getAlerts()
  if (!list.some((a) => a.triggeredAt && !a.seen)) return
  save(list.map((a) => (a.triggeredAt && !a.seen ? { ...a, seen: true } : a)))
}

export function unseenCount(list = getAlerts()) {
  return list.filter((a) => a.triggeredAt && !a.seen).length
}

/**
 * 최저가 스냅샷을 받아 목표 도달 여부를 갱신.
 * - 목표 이하  → 도달 기록(이미 도달했어도 더 싸지면 갱신하며 다시 알림)
 * - 목표 초과  → 도달 해제(다음에 다시 떨어지면 새 알림)
 * 스냅샷에 없는 게임(할인 종료로 딜이 사라짐)은 현재가를 비우고 도달을 해제한다.
 */
function applySnapshots(snapshots) {
  const byId = new Map(snapshots.map((s) => [s.gameId, s]))
  const now = Date.now()
  let changed = false

  const next = getAlerts().map((a) => {
    const snap = byId.get(a.gameId)
    const price = snap ? Number(snap.salePrice) : null
    const hit = price != null && price <= a.targetPrice
    const fresh = hit && (!a.triggeredAt || price < Number(a.triggeredPrice))

    const updated = {
      ...a,
      title: snap?.title ?? a.title,
      thumbUrl: snap?.thumbUrl ?? a.thumbUrl,
      currentPrice: price,
      krwSalePrice: snap?.krwSalePrice ?? null,
      storeName: snap?.storeName ?? null,
      checkedAt: now,
      triggeredAt: hit ? (fresh ? now : a.triggeredAt) : null,
      triggeredPrice: hit ? price : null,
      seen: fresh ? false : hit ? a.seen : true,
    }
    if (
      updated.currentPrice !== a.currentPrice ||
      updated.triggeredAt !== a.triggeredAt ||
      updated.seen !== a.seen ||
      updated.storeName !== a.storeName
    ) {
      changed = true
    }
    return updated
  })

  // 가격만 같고 checkedAt 만 바뀐 경우는 렌더를 흔들 필요가 없어 저장도 생략
  if (changed) save(next)
}

let lastCheck = 0
let inFlight = null

/** 알림 목록의 현재가를 갱신. force 가 아니면 10분에 한 번만 실제 호출. */
export function refreshAlerts({ force = false } = {}) {
  const ids = getAlerts().map((a) => a.gameId)
  if (ids.length === 0) return Promise.resolve()
  if (inFlight) return inFlight
  if (!force && Date.now() - lastCheck < CHECK_INTERVAL_MS) return Promise.resolve()

  lastCheck = Date.now()
  inFlight = api
    .getPrices(ids)
    .then(applySnapshots)
    .catch(() => {
      lastCheck = 0 // 실패했으면 다음 기회에 다시
    })
    .finally(() => {
      inFlight = null
    })
  return inFlight
}

/** 알림 목록 + 변화 구독. watch 를 켜면 마운트 시 현재가를 갱신한다. */
export function useAlerts({ watch = false } = {}) {
  const [list, setList] = useState(getAlerts)

  useEffect(() => {
    const sync = () => setList(getAlerts())
    window.addEventListener(EVT, sync)
    window.addEventListener('storage', sync)
    return () => {
      window.removeEventListener(EVT, sync)
      window.removeEventListener('storage', sync)
    }
  }, [])

  useEffect(() => {
    if (watch) refreshAlerts()
  }, [watch])

  return list
}

/** 상세 페이지 폼용 — 이 게임의 알림 + 변화 구독 */
export function useAlert(gameId) {
  const [alert, setAlertState] = useState(() => getAlert(gameId))
  useEffect(() => {
    const sync = () => setAlertState(getAlert(gameId))
    sync()
    window.addEventListener(EVT, sync)
    window.addEventListener('storage', sync)
    return () => {
      window.removeEventListener(EVT, sync)
      window.removeEventListener('storage', sync)
    }
  }, [gameId])
  return alert
}
