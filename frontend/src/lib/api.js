// 백엔드 REST 클라이언트. 개발 중엔 Vite 프록시(/api → :8080).
const BASE = '/api'

async function get(path, params) {
  const url = new URL(BASE + path, window.location.origin)
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      if (v !== undefined && v !== null && v !== '') {
        url.searchParams.set(k, v)
      }
    }
  }
  const res = await fetch(url)
  if (!res.ok) {
    let message = `요청 실패 (HTTP ${res.status})`
    try {
      const body = await res.json()
      if (body && body.message) message = body.message
    } catch {
      /* ignore */
    }
    throw new Error(message)
  }
  return res.json()
}

export const api = {
  /** 할인 목록: { sort, storeId, minPrice, maxPrice, page, size } */
  getDeals: (params) => get('/deals', params),
  /** 활성 스토어 목록 */
  getStores: () => get('/stores'),
  /** 게임 상세 + 스토어별 가격 비교 */
  getGame: (gameId) => get(`/games/${gameId}`),
  /** 게임 검색: { q, page, size } */
  searchGames: (params) => get('/games/search', params),
}
