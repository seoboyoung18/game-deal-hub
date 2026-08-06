import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Flame, Search } from 'lucide-react'
import HeroCharacter from './HeroCharacter.jsx'
import { HAS_BG } from '../lib/siteBg.js'
import { api } from '../lib/api.js'

// 히어로 스트립에 보여줄 대표 스토어 (실보유 데이터만 — 콘솔 스토어 없음)
const PREFERRED = ['steam', 'epic', 'gog', 'humble', 'fanatical']
const rank = (name = '') => {
  const i = PREFERRED.findIndex((p) => name.toLowerCase().includes(p))
  return i === -1 ? 99 : i
}

// 홈 히어로 (2단). 배경은 SiteBackground(사이트 전체)에서 처리 → 배경 있으면 히어로는 투명 오버레이.
export default function Hero() {
  const [q, setQ] = useState('')
  const [stores, setStores] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    api.getStores().then(setStores).catch(() => {})
  }, [])

  const major = [...stores].filter((s) => rank(s.storeName) < 99).sort((a, b) => rank(a.storeName) - rank(b.storeName))
  const restCount = stores.length - major.length

  const submit = (e) => {
    e.preventDefault()
    const term = q.trim()
    if (term) navigate(`/search?q=${encodeURIComponent(term)}`)
  }

  return (
    <section className={`hero ${HAS_BG ? 'hero--overlay' : ''}`}>
      <div className="hero__inner container">
        <div className="hero__text">
          <span className="hero__badge"><Flame size={15} strokeWidth={2.4} /> 여러 스토어 할인을 한 곳에</span>
          <h1 className="hero__title">
            모든 게임 할인을
            <br />
            <span>한눈에</span> 비교하세요
          </h1>
          <p className="hero__sub">
            여러 스토어의 가격을 비교하고
            <br />
            최고의 할인 혜택을 놓치지 마세요.
          </p>

          <form className="hero__search" onSubmit={submit} role="search">
            <span className="hero__search-icon" aria-hidden><Search size={20} strokeWidth={2.2} /></span>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="게임 검색 (예: TEKKEN 7 )"
              aria-label="게임 검색"
            />
            <button type="submit">검색</button>
          </form>

          {major.length > 0 && (
            <div className="hero__stores" aria-label="비교 중인 스토어">
              {major.map((s) => (
                <span key={s.storeId} className="hero__store">
                  {s.iconUrl && <img src={s.iconUrl} alt="" loading="lazy" />}
                  {s.storeName}
                </span>
              ))}
              {restCount > 0 && <span className="hero__store">외 {restCount}곳</span>}
            </div>
          )}
        </div>

        <div className="hero__visual">
          <HeroCharacter />
        </div>
      </div>
    </section>
  )
}
