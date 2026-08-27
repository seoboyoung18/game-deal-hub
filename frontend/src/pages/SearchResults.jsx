import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import Header from '../components/Header.jsx'
import Footer from '../components/Footer.jsx'
import GameCard from '../components/GameCard.jsx'
import Pagination from '../components/Pagination.jsx'
import { CardGridSkeleton } from '../components/Skeleton.jsx'
import { api } from '../lib/api.js'
import { useCurrency, useExchangeRate } from '../lib/useCurrency.js'

const SIZE = 18

// S2 검색 결과 — 페이지도 URL 쿼리로 (새 검색어 이동 시 page 쿼리가 없어 자연히 1페이지부터).
export default function SearchResults() {
  const [params, setParams] = useSearchParams()
  const q = params.get('q') || ''
  const page = Math.max(0, (parseInt(params.get('page'), 10) || 1) - 1)
  const [games, setGames] = useState([])
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [retryTick, setRetryTick] = useState(0)
  const [currency] = useCurrency()
  const rate = useExchangeRate()

  const onPage = (p) => {
    const next = new URLSearchParams(params)
    if (p <= 0) next.delete('page')
    else next.set('page', String(p + 1))
    setParams(next)
  }

  useEffect(() => {
    if (!q) {
      setGames([])
      setTotal(0)
      setTotalPages(0)
      setLoading(false)
      return
    }
    let alive = true
    setLoading(true)
    setError(null)
    api
      .searchGames({ q, page, size: SIZE })
      .then((res) => {
        if (!alive) return
        setGames(res.content)
        setTotal(res.totalElements)
        setTotalPages(res.totalPages)
      })
      .catch((e) => alive && setError(e.message))
      .finally(() => alive && setLoading(false))
    return () => {
      alive = false
    }
  }, [q, page, retryTick])

  return (
    <>
      <Header key={q} initialQuery={q} showSearch />
      <main className="container search">
        <div className="search__head">
          <h1 className="search__title">
            <strong>'{q}'</strong> 검색 결과
          </h1>
          {!loading && !error && <span className="search__count">{total.toLocaleString()}건</span>}
        </div>

        {loading && <CardGridSkeleton count={6} className="game-grid" />}
        {error && (
          <div className="state state--error">
            {error}
            <button className="state__retry" onClick={() => setRetryTick((t) => t + 1)}>
              다시 시도
            </button>
          </div>
        )}
        {!loading && !error && games.length === 0 && (
          <div className="state">
            {q ? '찾는 게임이 없어요.' : '검색어를 입력해 주세요.'}
            {q && <p className="state__hint">게임 제목의 영문 표기로 다시 검색해 보세요.</p>}
          </div>
        )}
        {!loading && !error && games.length > 0 && (
          <section className="game-grid">
            {games.map((g) => (
              <GameCard key={g.gameId} game={g} currency={currency} rate={rate} />
            ))}
          </section>
        )}

        <Pagination page={page} totalPages={totalPages} onChange={onPage} />
      </main>
      <Footer />
    </>
  )
}
