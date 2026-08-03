// 통화 토글: $ USD / ₩ KRW (세그먼트 컨트롤)
export default function CurrencyToggle({ value, onChange }) {
  return (
    <div className="currency-toggle" role="group" aria-label="통화 선택">
      <button
        className={`currency-toggle__btn ${value === 'USD' ? 'is-active' : ''}`}
        onClick={() => onChange('USD')}
      >
        $ USD
      </button>
      <button
        className={`currency-toggle__btn ${value === 'KRW' ? 'is-active' : ''}`}
        onClick={() => onChange('KRW')}
      >
        ₩ KRW
      </button>
    </div>
  )
}
