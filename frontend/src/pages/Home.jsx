import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Sparkles, ArrowRight } from 'lucide-react'
import Header from '../components/Header.jsx'
import Hero from '../components/Hero.jsx'
import Footer from '../components/Footer.jsx'
import DealCard from '../components/DealCard.jsx'
import FeaturedDeal from '../components/FeaturedDeal.jsx'
import RankList from '../components/RankList.jsx'
import PerkStrip from '../components/PerkStrip.jsx'
import { api } from '../lib/api.js'
import { useCurrency, useExchangeRate } from '../lib/useCurrency.js'

// S1 홈 — 스포트라이트(핫딜·랭킹·추천)와 기능 소개.
// 전체 목록(필터·페이징)은 헤더 '게임' 탭의 /games (Deals.jsx)로 분리.
export default function Home() {
  const [currency] = useCurrency()
  const rate = useExchangeRate()
  // 스포트라이트(핫딜·랭킹·추천) — 첫 진입 시 1회
  const [spot, setSpot] = useState(null)

  useEffect(() => {
    let alive = true
    Promise.all([
      api.getDeals({ sort: 'rating', size: 12 }),
      api.getDeals({ sort: 'savings', size: 5 }),
    ])
      .then(([rated, cheapest]) => {
        if (!alive) return
        const featured = rated.content[0] ?? null
        // 추천 특가: 핫딜·랭킹에 이미 보인 게임은 제외 (한 화면 안 반복 방지)
        const shown = new Set(
          [featured?.gameId, ...cheapest.content.map((d) => d.gameId)].filter(Boolean)
        )
        const picks = []
        for (const d of rated.content.slice(1)) {
          if (shown.has(d.gameId)) continue
          shown.add(d.gameId)
          picks.push(d)
          if (picks.length === 4) break
        }
        setSpot({ featured, picks, ranking: cheapest.content })
      })
      .catch(() => alive && setSpot({ featured: null, picks: [], ranking: [] }))
    return () => {
      alive = false
    }
  }, [])

  return (
    <>
      <Header />
      <Hero />
      <main className="container home">
        {/* ① 오늘의 핫딜 + ② 최저가 랭킹 */}
        {spot === null && (
          <div className="spotlight spotlight--skel" aria-hidden>
            <div />
            <div />
          </div>
        )}
        {spot?.featured && (
          <section className="spotlight">
            <FeaturedDeal deal={spot.featured} currency={currency} rate={rate} />
            {spot.ranking.length > 0 && (
              <RankList deals={spot.ranking} currency={currency} rate={rate} />
            )}
          </section>
        )}

        {/* ③ 추천 특가 */}
        {spot?.picks?.length > 0 && (
          <section className="picks">
            <div className="home__head home__head--split">
              <h2 className="section-title">
                <Sparkles size={20} strokeWidth={2.4} style={{ color: 'var(--brand)' }} /> 추천 특가
              </h2>
              <Link to="/games" className="more-link">
                전체 할인 보기 <ArrowRight size={15} strokeWidth={2.4} />
              </Link>
            </div>
            <div className="deal-grid">
              {spot.picks.map((d) => (
                <DealCard key={d.dealId} deal={d} currency={currency} rate={rate} />
              ))}
            </div>
          </section>
        )}

        {/* ④ 기능 소개 */}
        <PerkStrip />
      </main>
      <Footer />
    </>
  )
}
