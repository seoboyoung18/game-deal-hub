// 스토어 필터 칩. 전체(보라 활성) + 주요 스토어. 브리프: 전체·Steam·Epic·GOG·Humble
const PREFERRED = ['steam', 'epic', 'gog', 'humble', 'fanatical']

function rank(name = '') {
  const n = name.toLowerCase()
  const i = PREFERRED.findIndex((p) => n.includes(p))
  return i === -1 ? 99 : i
}

export default function StoreFilterChips({ stores, value, onChange }) {
  const list = [...stores]
    .filter((s) => rank(s.storeName) < 99)
    .sort((a, b) => rank(a.storeName) - rank(b.storeName))

  return (
    <div className="chips" role="group" aria-label="스토어 필터">
      <button
        className={`chip ${value === '' ? 'chip--active' : ''}`}
        onClick={() => onChange('')}
      >
        전체
      </button>
      {list.map((s) => (
        <button
          key={s.storeId}
          className={`chip ${value === s.storeId ? 'chip--active' : ''}`}
          onClick={() => onChange(s.storeId)}
        >
          {s.storeName}
        </button>
      ))}
    </div>
  )
}
