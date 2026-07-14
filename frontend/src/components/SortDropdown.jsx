export default function SortDropdown({ value, onChange }) {
  return (
    <select
      className="sort-select"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      aria-label="정렬"
    >
      <option value="rating">추천순</option>
      <option value="savings">할인율 높은 순</option>
      <option value="price">가격 낮은 순</option>
    </select>
  )
}
