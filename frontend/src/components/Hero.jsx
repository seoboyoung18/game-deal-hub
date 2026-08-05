import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import HeroCharacter from './HeroCharacter.jsx'
import { HAS_BG } from '../lib/siteBg.js'

// 홈 히어로 (2단). 배경은 SiteBackground(사이트 전체)에서 처리 → 배경 있으면 히어로는 투명 오버레이.
export default function Hero() {
  const [q, setQ] = useState('')
  const navigate = useNavigate()

  const submit = (e) => {
    e.preventDefault()
    const term = q.trim()
    if (term) navigate(`/search?q=${encodeURIComponent(term)}`)
  }

  return (
    <section className={`hero ${HAS_BG ? 'hero--overlay' : ''}`}>
      <div className="hero__inner container">
        <div className="hero__text">
          <span className="hero__badge">🔥 여러 스토어 할인을 한 곳에</span>
          <h1 className="hero__title">
            모든 게임 할인을
            <br />
            <span>한눈에</span> 비교하세요
          </h1>

          <form className="hero__search" onSubmit={submit} role="search">
            <span className="hero__search-icon" aria-hidden>🔍</span>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="게임 검색 (예: 사이버펑크 2077)"
              aria-label="게임 검색"
            />
            <button type="submit">검색</button>
          </form>
        </div>

        <div className="hero__visual">
          <HeroCharacter />
        </div>
      </div>
    </section>
  )
}
