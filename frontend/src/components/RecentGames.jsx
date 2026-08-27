import { Link } from 'react-router-dom'
import { History, Gamepad2 } from 'lucide-react'
import { useRecentGames } from '../lib/recentGames.js'
import { displayPrice } from '../lib/format.js'

// 목록 사이드바: 최근 본 게임 (localStorage). 본 게임이 없으면 안 그림.
export default function RecentGames({ currency = 'USD', rate = null }) {
  const list = useRecentGames()
  if (list.length === 0) return null

  return (
    <aside className="rank recent" aria-label="최근 본 게임">
      <h3 className="rank__title">
        <History size={18} strokeWidth={2.4} className="recent__icon" /> 최근 본 게임
      </h3>
      <ol className="rank__list">
        {list.map((g) => (
          <li key={g.gameId}>
            <Link to={`/game/${g.gameId}`} className="rank__row">
              <span className="rank__thumb">
                {g.thumbUrl ? (
                  <img src={g.thumbUrl} alt="" loading="lazy" />
                ) : (
                  <Gamepad2 size={18} aria-hidden />
                )}
              </span>
              <span className="rank__info">
                <span className="rank__name" title={g.title}>{g.title}</span>
                {g.salePrice != null && (
                  <span className="rank__meta">
                    <span className="rank__price">
                      {Number(g.salePrice) === 0
                        ? '무료'
                        : displayPrice(g.salePrice, { currency, rate, krw: g.krwSalePrice })}
                    </span>
                  </span>
                )}
              </span>
            </Link>
          </li>
        ))}
      </ol>
    </aside>
  )
}
