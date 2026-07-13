import { storeStyle } from '../lib/format.js'

// 스토어 뱃지: 색상 칩(이니셜) + 이름
export default function StoreBadge({ storeName, showName = true }) {
  const { initial, color } = storeStyle(storeName)
  return (
    <span className="store-badge">
      <span className="store-badge__chip" style={{ background: color }}>
        {initial}
      </span>
      {showName && <span className="store-badge__name">{storeName}</span>}
    </span>
  )
}
