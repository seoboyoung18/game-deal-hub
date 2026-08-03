import { Link } from 'react-router-dom'
import StoreBadge from './StoreBadge.jsx'
import DiscountBadge from './DiscountBadge.jsx'
import { tier } from '../lib/tier.js'
import { displayPrice } from '../lib/format.js'

// S1 그리드 카드: 커버(16:9) · 게임명 · 스토어 · ~~정가~~ · 할인가(티어색) · 할인율 뱃지
// currency/rate 로 표시 통화 전환. deal.krwSalePrice 가 있으면(스팀 실가) 그 값을 우선.
export default function DealCard({ deal, currency = 'USD', rate = null }) {
  const t = tier(deal.savings)
  const free = Number(deal.salePrice) === 0
  const saleOpts = { currency, rate, krw: deal.krwSalePrice }
  const normalOpts = { currency, rate, krw: deal.krwNormalPrice }

  return (
    <Link to={`/game/${deal.gameId}`} className="deal-card">
      <div className="deal-card__cover">
        {deal.thumbUrl ? (
          <img src={deal.thumbUrl} alt={deal.title} loading="lazy" />
        ) : (
          <div className="deal-card__cover-empty" aria-hidden>🎮</div>
        )}
        <div className="deal-card__badge">
          <DiscountBadge savings={deal.savings} />
        </div>
      </div>

      <div className="deal-card__body">
        <h3 className="deal-card__title" title={deal.title}>{deal.title}</h3>
        <StoreBadge storeName={deal.storeName} />
        <div className="deal-card__prices">
          {!free && (
            <span className="deal-card__normal">{displayPrice(deal.normalPrice, normalOpts)}</span>
          )}
          <span className="deal-card__sale" style={{ color: t.color }}>
            {free ? '무료' : displayPrice(deal.salePrice, saleOpts)}
          </span>
        </div>
      </div>
    </Link>
  )
}
