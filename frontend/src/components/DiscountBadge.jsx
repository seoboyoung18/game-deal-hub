import { tier } from '../lib/tier.js'
import { roundPct } from '../lib/format.js'

// 할인율 뱃지 — 티어 색상 규칙 적용
export default function DiscountBadge({ savings }) {
  const t = tier(savings)
  return (
    <span className="discount-badge" style={{ background: t.color }}>
      -{roundPct(savings)}%
    </span>
  )
}
