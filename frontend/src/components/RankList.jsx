import { Link } from 'react-router-dom'
import { Trophy } from 'lucide-react'
import { tier } from '../lib/tier.js'
import { displayPrice, roundPct } from '../lib/format.js'

// 홈 R2: 최저가 랭킹 TOP 5 (savings 상위)
export default function RankList({ deals, currency = 'USD', rate = null }) {
  return (
    <aside className="rank" aria-label="최저가 랭킹 TOP 5">
      <h3 className="rank__title">
        <Trophy size={18} strokeWidth={2.4} className="rank__trophy" />
        최저가 랭킹 <em>TOP {deals.length}</em>
      </h3>
      <ol className="rank__list">
        {deals.map((d, i) => {
          const t = tier(d.savings)
          const free = Number(d.salePrice) === 0
          return (
            <li key={d.dealId}>
              <Link to={`/game/${d.gameId}`} className="rank__row">
                <span className={`rank__num rank__num--${i + 1}`}>{i + 1}</span>
                <span className="rank__thumb">
                  {d.thumbUrl ? (
                    <img src={d.thumbUrl} alt="" loading="lazy" />
                  ) : (
                    <span aria-hidden>🎮</span>
                  )}
                </span>
                <span className="rank__info">
                  <span className="rank__name" title={d.title}>{d.title}</span>
                  <span className="rank__meta">
                    <b style={{ color: t.color }}>-{roundPct(d.savings)}%</b>
                    <span className="rank__price">
                      {free ? '무료' : displayPrice(d.salePrice, { currency, rate, krw: d.krwSalePrice })}
                    </span>
                  </span>
                </span>
              </Link>
            </li>
          )
        })}
      </ol>
    </aside>
  )
}
