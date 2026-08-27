import { Gamepad2 } from 'lucide-react'
import { displayPrice } from '../lib/format.js'
import { useCurrency, useExchangeRate } from '../lib/useCurrency.js'

// 검색 자동완성 드롭다운. 부모(input)가 combobox 역할·키보드 탐색을 담당하고
// 여기는 listbox 렌더만. onPick 은 mousedown 에서 호출해 blur 보다 먼저 처리.
export default function SearchSuggest({ id, q, items, active, onPick, onHover, onAll }) {
  const [currency] = useCurrency()
  const rate = useExchangeRate()

  return (
    <div className="suggest">
      <ul id={id} role="listbox" aria-label="검색 제안">
        {items.map((g, i) => (
          <li key={g.gameId} id={`${id}-${i}`} role="option" aria-selected={i === active}>
            <button
              type="button"
              tabIndex={-1}
              className={`suggest__item ${i === active ? 'is-active' : ''}`}
              onMouseDown={(e) => {
                e.preventDefault()
                onPick(g)
              }}
              onMouseEnter={() => onHover(i)}
            >
              <span className="suggest__thumb" aria-hidden>
                {g.thumbUrl ? <img src={g.thumbUrl} alt="" loading="lazy" /> : <Gamepad2 size={14} />}
              </span>
              <span className="suggest__title">{g.title}</span>
              {g.minSalePrice != null && (
                <span className="suggest__price">
                  최저 {displayPrice(g.minSalePrice, { currency, rate })}~
                </span>
              )}
            </button>
          </li>
        ))}
      </ul>
      <button
        type="button"
        tabIndex={-1}
        className="suggest__all"
        onMouseDown={(e) => {
          e.preventDefault()
          onAll()
        }}
      >
        '{q.trim()}' 전체 결과 보기
      </button>
    </div>
  )
}
