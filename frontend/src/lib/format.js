// 가격/할인율 포맷 + 스토어 뱃지 스타일

// USD 원본가를 선택 통화로 표시.
//  - USD: $12.49
//  - KRW: 실제 원화(krw)가 있으면 그대로(정확), 없으면 USD×환율(대략)
export function displayPrice(usd, { currency = 'USD', rate = null, krw = null } = {}) {
  const n = Number(usd)
  if (currency === 'KRW') {
    if (krw != null && !Number.isNaN(Number(krw))) {
      return '₩' + Math.round(Number(krw)).toLocaleString('ko-KR')
    }
    if (rate) {
      // 물결(~)로 '대략 환산'임을 표시 (스팀 실가와 구분)
      return '~₩' + Math.round(n * rate).toLocaleString('ko-KR')
    }
  }
  if (Number.isNaN(n)) return '-'
  return '$' + n.toFixed(2)
}

// KRW 표시가 '실제 원화'인지(스팀) '대략 환산'인지
export function isRealKrw(currency, krw) {
  return currency === 'KRW' && krw != null && !Number.isNaN(Number(krw))
}

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
