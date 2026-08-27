import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { Search, X } from 'lucide-react'
import ThemeToggle from './ThemeToggle.jsx'
import SearchSuggest from './SearchSuggest.jsx'
import { useSuggest, useSuggestNav } from '../lib/useSuggest.js'

// 헤더: 로고+내비 탭(좌) · [검색바(옵션)] · 테마 토글(우).
// 홈은 히어로에 큰 검색이 있어 헤더 검색 숨김(showSearch=false). 목록/검색결과/상세는 showSearch로 유지.
export default function Header({ initialQuery = '', showSearch = false }) {
  const [q, setQ] = useState(initialQuery)
  const navigate = useNavigate()
  const items = useSuggest(q)
  const nav = useSuggestNav(items, (g) => navigate(`/game/${g.gameId}`))
  const showSuggest = nav.open && items.length > 0 && q.trim().length >= 2

  const onSubmit = (e) => {
    e.preventDefault()
    const term = q.trim()
    if (term) navigate(`/search?q=${encodeURIComponent(term)}`)
  }

  const navClass = ({ isActive }) => `nav-link${isActive ? ' is-active' : ''}`

  return (
    <header className="site-header">
      <div className="container site-header__inner">
        <div className="site-header__left">
          <Link to="/" className="wordmark">딜모아</Link>
          <nav className="site-header__nav" aria-label="주요 메뉴">
            <NavLink to="/" end className={navClass}>홈</NavLink>
            <NavLink to="/games" className={navClass}>게임</NavLink>
          </nav>
        </div>

        {showSearch && (
          <form className="searchbar" onSubmit={onSubmit} role="search">
            <span className="searchbar__icon" aria-hidden><Search size={15} strokeWidth={2.4} /></span>
            <input
              className="searchbar__input"
              role="combobox"
              aria-expanded={showSuggest}
              aria-controls="hd-suggest"
              aria-activedescendant={nav.active >= 0 ? `hd-suggest-${nav.active}` : undefined}
              aria-autocomplete="list"
              value={q}
              onChange={(e) => {
                setQ(e.target.value)
                nav.setOpen(true)
              }}
              onFocus={() => nav.setOpen(true)}
              onBlur={() => nav.setOpen(false)}
              onKeyDown={nav.onKeyDown}
              placeholder="게임 검색 (예: 사이버펑크)"
              aria-label="게임 검색"
            />
            {q && (
              <button type="button" className="searchbar__clear" onClick={() => setQ('')} aria-label="지우기">
                <X size={14} strokeWidth={2.4} />
              </button>
            )}
            {showSuggest && (
              <SearchSuggest
                id="hd-suggest"
                q={q}
                items={items}
                active={nav.active}
                onPick={(g) => navigate(`/game/${g.gameId}`)}
                onHover={nav.setActive}
                onAll={() => navigate(`/search?q=${encodeURIComponent(q.trim())}`)}
              />
            )}
          </form>
        )}

        <ThemeToggle />
      </div>
    </header>
  )
}
