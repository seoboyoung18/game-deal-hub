import { useState, useEffect } from 'react'
import { pickBg, isDayHour, HAS_BG, HAS_TIME_BG } from '../lib/siteBg.js'

// 사이트 전체 고정 배경 (시간대별 자동 전환). 이미지 없으면 아무것도 안 그림(기본 배경색 사용).
export default function SiteBackground() {
  const [hour, setHour] = useState(() => new Date().getHours())

  useEffect(() => {
    if (!HAS_TIME_BG) return
    const t = setInterval(() => setHour(new Date().getHours()), 60000)
    return () => clearInterval(t)
  }, [])

  if (!HAS_BG) return null

  const bg = pickBg(hour)
  const night = HAS_TIME_BG && !isDayHour(hour)

  return (
    <div className={`site-bg ${night ? 'site-bg--night' : ''}`} aria-hidden>
      <div className="site-bg__img" style={{ backgroundImage: `url(${bg})` }} />
      <div className="site-bg__tint" />
    </div>
  )
}
