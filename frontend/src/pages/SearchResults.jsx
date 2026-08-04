import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import Header from '../components/Header.jsx'
import Footer from '../components/Footer.jsx'
import GameCard from '../components/GameCard.jsx'
import Pagination from '../components/Pagination.jsx'
import { api } from '../lib/api.js'
import { useCurrency, useExchangeRate } from '../lib/useCurrency.js'

const SIZE = 18

// S2 검색 결과
export default function SearchResults() {
  const [params] = useSearchParams()
  const q = params.get('q') || ''
  const [games, setGames] = useState([])
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [page, setPage] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [currency] = useCurrency()
  const rate = useExchangeRate()

  useEffect(() => {
    setPage(0)
  }, [q])

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
  }, [q, page])

  return (
    <>
      <Header key={q} initialQuery={q} />
      <main className="container search">
        <div className="search__head">
          <h1 className="search__title">
            <strong>'{q}'</strong> 검색 결과
          </h1>
          {!loading && !error && <span className="search__count">{total.toLocaleString()}건</span>}
        </div>

        {loading && <div className="state">검색 중…</div>}
        {error && <div className="state state--error">{error}</div>}
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

        <Pagination page={page} totalPages={totalPages} onChange={setPage} />
      </main>
      <Footer />
    </>
  )
}
