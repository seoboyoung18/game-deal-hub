// 로딩 스켈레톤 — 실제 카드/상세와 같은 골격을 미리 그려 로딩 중 레이아웃 출렁임을 막는다.

export function CardGridSkeleton({ count = 8, className = 'deal-grid' }) {
  return (
    <div className={className} aria-hidden>
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="skel-card">
          <div className="skel-card__cover" />
          <div className="skel-card__body">
            <span className="skel-line" />
            <span className="skel-line skel-line--w60" />
            <span className="skel-line skel-line--w40" />
          </div>
        </div>
      ))}
    </div>
  )
}

export function DetailSkeleton() {
  return (
    <div aria-hidden>
      <div className="skel-banner" />
      <span className="skel-line skel-line--title" />
      <span className="skel-line skel-line--w40" />
      <div className="skel-rows">
        {Array.from({ length: 3 }, (_, i) => (
          <div key={i} className="skel-row" />
        ))}
      </div>
    </div>
  )
}
