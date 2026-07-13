// 가격/할인율 포맷 + 스토어 뱃지 스타일

export function formatPrice(value, currency = 'USD') {
  const n = Number(value)
  if (Number.isNaN(n)) return '-'
  if (currency === 'USD') return '$' + n.toFixed(2)
  return n.toFixed(2) + ' ' + currency
}

export function roundPct(value) {
  return Math.round(Number(value) || 0)
}

// 스토어 뱃지: 이니셜 + 색 (브리프). storeName 부분일치로 매핑.
const STORE_STYLE = {
  steam: { initial: 'S', color: 'var(--store-steam)' },
  epic: { initial: 'E', color: 'var(--store-epic)' },
  gog: { initial: 'G', color: 'var(--store-gog)' },
  humble: { initial: 'H', color: 'var(--store-humble)' },
  fanatical: { initial: 'F', color: 'var(--store-fanatical)' },
}

export function storeStyle(storeName = '') {
  const n = storeName.toLowerCase()
  if (n.includes('steam')) return STORE_STYLE.steam
  if (n.includes('epic')) return STORE_STYLE.epic
  if (n.includes('gog')) return STORE_STYLE.gog
  if (n.includes('humble')) return STORE_STYLE.humble
  if (n.includes('fanatical')) return STORE_STYLE.fanatical
  return { initial: (storeName[0] || '?').toUpperCase(), color: 'var(--store-neutral)' }
}
