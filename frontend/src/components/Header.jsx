import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import ThemeToggle from './ThemeToggle.jsx'

// 헤더: 로고(좌) · [검색바(옵션)] · 테마 토글(우).
// 홈은 히어로에 큰 검색이 있어 헤더 검색 숨김(showSearch=false). 검색결과/상세는 showSearch로 유지.
export default function Header({ initialQuery = '', showSearch = false }) {
  const [q, setQ] = useState(initialQuery)
  const navigate = useNavigate()

  const onSubmit = (e) => {
    e.preventDefault()
    const term = q.trim()
    if (term) navigate(`/search?q=${encodeURIComponent(term)}`)
  }

  return (
    <header className="site-header">
      <div className="container site-header__inner">
        <Link to="/" className="wordmark">딜모아</Link>

        {showSearch && (
          <form className="searchbar" onSubmit={onSubmit} role="search">
            <span className="searchbar__icon" aria-hidden>🔍</span>
            <input
              className="searchbar__input"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="게임 제목으로 검색"
              aria-label="게임 검색"
            />
            {q && (
              <button type="button" className="searchbar__clear" onClick={() => setQ('')} aria-label="지우기">
                ✕
              </button>
            )}
          </form>
        )}

        <ThemeToggle />
      </div>
    </header>
  )
}
