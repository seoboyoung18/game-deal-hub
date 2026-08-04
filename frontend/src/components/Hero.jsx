import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const STORES = ['Steam', 'Epic Games', 'GOG', 'Humble', 'Fanatical']

// 홈 히어로 배너: 그라데이션 + 카피 + 검색 + 스토어 칩
export default function Hero() {
  const [q, setQ] = useState('')
  const navigate = useNavigate()

  const submit = (e) => {
    e.preventDefault()
    const t = q.trim()
    if (t) navigate(`/search?q=${encodeURIComponent(t)}`)
  }

  return (
    <section className="hero">
      <div className="hero__inner container">
        <span className="hero__badge">🔥 여러 스토어 할인을 한 곳에</span>
        <h1 className="hero__title">
          모든 게임 할인을
          <br />
          <span>한눈에</span> 비교하세요
        </h1>
        <p className="hero__sub">
          스팀·에픽·GOG 등 여러 상점의 가격을 모아, 지금 어디가 제일 싼지 바로 보여드려요.
        </p>

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

        <div className="hero__stores">
          {STORES.map((s) => (
            <span key={s} className="hero__store">{s}</span>
          ))}
        </div>
      </div>
    </section>
  )
}
