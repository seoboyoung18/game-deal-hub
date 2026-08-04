import StoreBadge from './StoreBadge.jsx'
import DiscountBadge from './DiscountBadge.jsx'
import { tier } from '../lib/tier.js'
import { displayPrice } from '../lib/format.js'

// S3 스토어별 가격 비교 행. 최저가 하이라이트 + 스토어로 가기(CheapShark 리다이렉트).
export default function StorePriceRow({ row, currency, rate }) {
  const t = tier(row.savings)
  const free = Number(row.salePrice) === 0
  const dealUrl = `https://www.cheapshark.com/redirect?dealID=${row.dealId}`

  return (
    <div className={`price-row ${row.best ? 'price-row--best' : ''}`}>
      <div className="price-row__store">
        <StoreBadge storeName={row.storeName} />
        {row.best && <span className="price-row__best-tag">최저가</span>}
      </div>

      <div className="price-row__prices">
        {!free && (
          <span className="price-row__normal">
            {displayPrice(row.normalPrice, { currency, rate, krw: row.krwNormalPrice })}
          </span>
        )}
        <span className="price-row__sale" style={{ color: t.color }}>
          {free ? '무료' : displayPrice(row.salePrice, { currency, rate, krw: row.krwSalePrice })}
        </span>
        <DiscountBadge savings={row.savings} />
      </div>

      <a className="price-row__go" href={dealUrl} target="_blank" rel="noopener noreferrer">
        스토어로 가기 ↗
      </a>
    </div>
  )
}
