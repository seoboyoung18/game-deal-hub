import { Link } from 'react-router-dom'
import StoreBadge from './StoreBadge.jsx'
import DiscountBadge from './DiscountBadge.jsx'
import { tier } from '../lib/tier.js'
import { formatPrice } from '../lib/format.js'

// S1 그리드 카드: 커버(16:9) · 게임명 · 스토어 · ~~정가~~ · 할인가(티어색) · 할인율 뱃지
export default function DealCard({ deal }) {
  const t = tier(deal.savings)
  const free = Number(deal.salePrice) === 0

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
            <span className="deal-card__normal">{formatPrice(deal.normalPrice, deal.currency)}</span>
          )}
          <span className="deal-card__sale" style={{ color: t.color }}>
            {free ? '무료' : formatPrice(deal.salePrice, deal.currency)}
          </span>
        </div>
      </div>
    </Link>
  )
}
