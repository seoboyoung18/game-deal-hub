import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import Header from '../components/Header.jsx'
import Footer from '../components/Footer.jsx'
import CurrencyToggle from '../components/CurrencyToggle.jsx'
import StorePriceRow from '../components/StorePriceRow.jsx'
import { api } from '../lib/api.js'
import { useCurrency, useExchangeRate } from '../lib/useCurrency.js'
import { recordRecent } from '../lib/recentGames.js'
import { hiResHero, fallbackTo } from '../lib/steamImg.js'

// S3 게임 상세 · 스토어별 가격 비교
export default function GameDetail() {
  const { gameId } = useParams()
  const [game, setGame] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [currency, setCurrency] = useCurrency()
  const rate = useExchangeRate()

  useEffect(() => {
    let alive = true
    setLoading(true)
    setError(null)
    api
      .getGame(gameId)
      .then((g) => {
        if (!alive) return
        setGame(g)
        // 최근 본 게임 기록 (최저가는 첫 행 = sale_price ASC)
        const low = g.deals?.[0]
        recordRecent({
          gameId: g.gameId,
          title: g.title,
          thumbUrl: g.thumbUrl,
          salePrice: low?.salePrice ?? null,
          krwSalePrice: low?.krwSalePrice ?? null,
        })
      })
      .catch((e) => alive && setError(e.message))
      .finally(() => alive && setLoading(false))
    return () => {
      alive = false
    }
  }, [gameId])

  const year = game?.releaseDate ? new Date(game.releaseDate).getFullYear() : null
  const deals = game?.deals ?? []

  return (
    <>
      <Header showSearch />
      <main className="container detail">
        {loading && <div className="state">불러오는 중…</div>}
        {error && <div className="state state--error">게임 정보를 불러오지 못했어요 · {error}</div>}

        {!loading && !error && game && (
          <>
            <nav className="breadcrumb">
              <Link to="/">홈</Link>
              <span aria-hidden>/</span>
              <span>{game.title}</span>
            </nav>

            <div className="detail__hero">
              {game.thumbUrl && (
                <img
                  src={hiResHero(game.thumbUrl)}
                  onError={fallbackTo(game.thumbUrl)}
                  alt={game.title}
                />
              )}
            </div>

            <div className="detail__head">
              <h1 className="detail__title">{game.title}</h1>
              <div className="detail__meta">
                {game.metacriticScore ? (
                  <span className="meta-badge meta-badge--mc">메타크리틱 {game.metacriticScore}</span>
                ) : null}
                {game.steamRatingPct ? (
                  <span className="meta-badge meta-badge--steam">스팀 {game.steamRatingPct}%</span>
                ) : null}
                {year && <span className="meta-badge">{year}</span>}
                {game.genres &&
                  game.genres.split('|').map((g) => (
                    <span key={g} className="meta-badge meta-badge--genre">{g}</span>
                  ))}
              </div>
              {game.shortDescKo && <p className="detail__desc">{game.shortDescKo}</p>}
            </div>

            <div className="detail__pricehead">
              <h2>
                스토어별 가격<span className="detail__count">{deals.length}개 스토어</span>
              </h2>
              <CurrencyToggle value={currency} onChange={setCurrency} />
            </div>
            {currency === 'KRW' && (
              <p className="home__krw-note">
                ₩ <strong>스팀</strong>은 실제 원화, 그 외 상점은 환율 <strong>대략 환산(~ 표시)</strong>이에요
              </p>
            )}

            <div className="price-list">
              {deals.map((row) => (
                <StorePriceRow key={row.dealId} row={row} currency={currency} rate={rate} />
              ))}
            </div>
          </>
        )}
      </main>
      <Footer />
    </>
  )
}
