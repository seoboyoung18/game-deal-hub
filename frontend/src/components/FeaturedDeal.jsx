import { Link } from 'react-router-dom'
import { Zap, ArrowRight, Gamepad2 } from 'lucide-react'
import StoreBadge from './StoreBadge.jsx'
import DiscountBadge from './DiscountBadge.jsx'
import { tier } from '../lib/tier.js'
import { displayPrice } from '../lib/format.js'
import { hiResCard, fallbackTo } from '../lib/steamImg.js'

// 홈 R2: 오늘의 핫딜 대형 피처 카드 (rating 1위 딜)
export default function FeaturedDeal({ deal, currency = 'USD', rate = null }) {
  const t = tier(deal.savings)
  const free = Number(deal.salePrice) === 0

  return (
    <Link to={`/game/${deal.gameId}`} className="featured">
      <div className="featured__cover">
        {deal.thumbUrl ? (
          <img src={hiResCard(deal.thumbUrl)} onError={fallbackTo(deal.thumbUrl)} alt={deal.title} />
        ) : (
          <div className="featured__cover-empty" aria-hidden><Gamepad2 size={48} /></div>
        )}
        <div className="featured__badge">
          <DiscountBadge savings={deal.savings} />
        </div>
      </div>

      <div className="featured__body">
        <span className="featured__label">
          <Zap size={14} strokeWidth={2.6} /> 오늘의 핫딜
        </span>
        <h3 className="featured__title" title={deal.title}>{deal.title}</h3>
        <StoreBadge storeName={deal.storeName} />
        <div className="featured__foot">
          <div className="featured__prices">
            {!free && (
              <span className="featured__normal">
                {displayPrice(deal.normalPrice, { currency, rate, krw: deal.krwNormalPrice })}
              </span>
            )}
            <span className="featured__sale" style={{ color: t.color }}>
              {free ? '무료' : displayPrice(deal.salePrice, { currency, rate, krw: deal.krwSalePrice })}
            </span>
          </div>
          <span className="featured__cta">
            최저가 보기 <ArrowRight size={16} strokeWidth={2.4} />
          </span>
        </div>
      </div>
    </Link>
  )
}
