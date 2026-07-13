// 할인율 티어 → 색상/라벨 (figma-design-brief.md 핵심 규칙)
//  10–30% 초록 · 31–50% 앰버 · 51–80% 보라 · 81–99% 빨강 · 100% 파랑(무료)
export function tier(percent) {
  const p = Number(percent) || 0
  if (p >= 100) return { key: 'free', color: 'var(--tier-blue)', label: '무료' }
  if (p >= 81) return { key: 'red', color: 'var(--tier-red)', label: '매우 강함' }
  if (p >= 51) return { key: 'purple', color: 'var(--tier-purple)', label: '강함' }
  if (p >= 31) return { key: 'amber', color: 'var(--tier-amber)', label: '중간' }
  return { key: 'green', color: 'var(--tier-green)', label: '약함' }
}
