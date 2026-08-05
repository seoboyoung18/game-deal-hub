// 사이트 배경 이미지 (src/assets/ 에 파일만 넣으면 자동 적용)
//  - hero-bg-day.*   : 아침 06:00 ~ 17:59
//  - hero-bg-night.* : 저녁/밤 18:00 ~ 05:59
//  - hero-bg.*       : 시간 구분 없이 하나만 쓸 때
const first = (mods) => Object.values(mods)[0] || null

const DAY_BG = first(import.meta.glob('../assets/hero-bg-day.{jpg,jpeg,png,webp}', { eager: true, import: 'default' }))
const NIGHT_BG = first(import.meta.glob('../assets/hero-bg-night.{jpg,jpeg,png,webp}', { eager: true, import: 'default' }))
const SINGLE_BG = first(import.meta.glob('../assets/hero-bg.{jpg,jpeg,png,webp}', { eager: true, import: 'default' }))

export const HAS_TIME_BG = !!(DAY_BG || NIGHT_BG)
export const HAS_BG = !!(DAY_BG || NIGHT_BG || SINGLE_BG)

export const isDayHour = (h) => h >= 6 && h < 18 // 06:00~17:59 아침

export function pickBg(hour) {
  if (HAS_TIME_BG) return isDayHour(hour) ? DAY_BG || NIGHT_BG : NIGHT_BG || DAY_BG
  return SINGLE_BG
}
