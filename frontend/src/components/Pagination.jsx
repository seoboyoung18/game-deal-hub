// 페이지네이션: ‹ 1 2 3 … N ›
export default function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null
  const cur = page + 1 // 표시용 1-base
  const items = window_(cur, totalPages)

  return (
    <nav className="pagination" aria-label="페이지">
      <button className="pagination__arrow" disabled={page <= 0} onClick={() => onChange(page - 1)}>
        ‹
      </button>
      {items.map((p, i) =>
        p === '…' ? (
          <span key={`gap-${i}`} className="pagination__gap">…</span>
        ) : (
          <button
            key={p}
            className={`pagination__num ${p === cur ? 'is-active' : ''}`}
            onClick={() => onChange(p - 1)}
          >
            {p}
          </button>
        ),
      )}
      <button
        className="pagination__arrow"
        disabled={page >= totalPages - 1}
        onClick={() => onChange(page + 1)}
      >
        ›
      </button>
    </nav>
  )
}

function window_(cur, total) {
  const out = []
  const around = 1
  out.push(1)
  if (cur - around > 2) out.push('…')
  for (let p = Math.max(2, cur - around); p <= Math.min(total - 1, cur + around); p++) out.push(p)
  if (cur + around < total - 1) out.push('…')
  if (total > 1) out.push(total)
  return out
}
