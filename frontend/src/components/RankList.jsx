import { Link } from 'react-router-dom'
import { Trophy, Gamepad2 } from 'lucide-react'
import { tier } from '../lib/tier.js'
import { displayPrice, roundPct } from '../lib/format.js'

// 사이드 랭킹 위젯. 기본은 '최저가 랭킹'(홈), title/icon 을 바꿔 '트렌드 게임'(목록) 등으로 재사용.
export default function RankList({
  deals,
  currency = 'USD',
  rate = null,
  title = '최저가 랭킹',
  icon = <Trophy size={18} strokeWidth={2.4} className="rank__trophy" />,
}) {
  return (
    <aside className="rank" aria-label={`${title} TOP ${deals.length}`}>
      <h3 className="rank__title">
        {icon}
        {title} <em>TOP {deals.length}</em>
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
                    <Gamepad2 size={18} aria-hidden />
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
