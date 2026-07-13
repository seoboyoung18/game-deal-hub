import { useEffect, useState } from 'react'

// 가격대 필터. (브리프의 듀얼 슬라이더는 추후, MVP는 최소~최대 입력)
export default function PriceRangeFilter({ value, onChange }) {
  const [min, setMin] = useState(value.min)
  const [max, setMax] = useState(value.max)

  useEffect(() => {
    setMin(value.min)
    setMax(value.max)
  }, [value.min, value.max])

  const apply = () => onChange({ min, max })
  const onKey = (e) => e.key === 'Enter' && apply()

  return (
    <div className="price-filter">
      <span className="price-filter__unit">$</span>
      <input
        type="number"
        min="0"
        className="price-filter__input"
        placeholder="최소"
        value={min}
        onChange={(e) => setMin(e.target.value)}
        onKeyDown={onKey}
        aria-label="최소 가격"
      />
      <span className="price-filter__dash">–</span>
      <input
        type="number"
        min="0"
        className="price-filter__input"
        placeholder="최대"
        value={max}
        onChange={(e) => setMax(e.target.value)}
        onKeyDown={onKey}
        aria-label="최대 가격"
      />
      <button className="price-filter__apply" onClick={apply}>적용</button>
    </div>
  )
}
