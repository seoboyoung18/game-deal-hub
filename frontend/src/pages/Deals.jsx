import { useEffect, useState } from 'react'
import { Flame, TrendingUp, Heart } from 'lucide-react'
import Header from '../components/Header.jsx'
import Footer from '../components/Footer.jsx'
import StoreFilterChips from '../components/StoreFilterChips.jsx'
import SortDropdown from '../components/SortDropdown.jsx'
import CurrencyToggle from '../components/CurrencyToggle.jsx'
import PriceRangeFilter from '../components/PriceRangeFilter.jsx'
import DealCard from '../components/DealCard.jsx'
import RankList from '../components/RankList.jsx'
import RecentGames from '../components/RecentGames.jsx'
import Pagination from '../components/Pagination.jsx'
import { api } from '../lib/api.js'
import { useCurrency, useExchangeRate } from '../lib/useCurrency.js'
import { useWishlist } from '../lib/wishlist.js'

const SIZE = 20

// 게임 목록 (헤더 '게임' 탭) — 좌: 필터·정렬·페이징 목록 / 우: 트렌드·최근 본 게임 사이드바.
// '위시리스트' 탭은 localStorage 스냅샷을 그대로 렌더 (저장 시점 가격).
export default function Deals() {
  const [stores, setStores] = useState([])
  const [deals, setDeals] = useState([])
  const [trend, setTrend] = useState([])
  const [tab, setTab] = useState('all') // all | wish
  const [sort, setSort] = useState('rating')
  const [storeId, setStoreId] = useState('')
  const [price, setPrice] = useState({ min: '', max: '' })
  const [currency, setCurrency] = useCurrency()
  const rate = useExchangeRate()
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const wishlist = useWishlist()

  useEffect(() => {
    api.getStores().then(setStores).catch(() => {})
    api
      .getDeals({ sort: 'rating', size: 5 })
      .then((res) => setTrend(res.content))
      .catch(() => {})
  }, [])

  useEffect(() => {
    let alive = true
    setLoading(true)
    setError(null)
    api
      .getDeals({ sort, storeId, minPrice: price.min, maxPrice: price.max, page, size: SIZE })
      .then((res) => {
        if (!alive) return
        setDeals(res.content)
        setTotalPages(res.totalPages)
        setTotal(res.totalElements)
      })
      .catch((e) => alive && setError(e.message))
      .finally(() => alive && setLoading(false))
    return () => {
      alive = false
    }
  }, [sort, storeId, price.min, price.max, page])

  const onStore = (id) => {
    setStoreId(id)
    setPage(0)
  }
  const onSort = (s) => {
    setSort(s)
    setPage(0)
  }
  const onPrice = (p) => {
    setPrice(p)
    setPage(0)
  }

  const showAll = tab === 'all'

  return (
    <>
      <Header showSearch />
      <main className="container home">
        <div className="home__head">
          <h2 className="section-title">
            <Flame size={20} strokeWidth={2.4} style={{ color: '#ff7043' }} /> 지금 뜨는 할인
          </h2>
          {showAll && !loading && !error && (
            <span className="home__count"><strong>{total.toLocaleString()}</strong>개</span>
          )}
        </div>

        <div className="chips listing__tabs" role="tablist" aria-label="목록 전환">
          <button
            role="tab"
            aria-selected={showAll}
            className={`chip ${showAll ? 'chip--active' : ''}`}
            onClick={() => setTab('all')}
          >
            전체 게임
          </button>
          <button
            role="tab"
            aria-selected={!showAll}
            className={`chip chip--wish ${!showAll ? 'chip--active' : ''}`}
            onClick={() => setTab('wish')}
          >
            <Heart size={14} strokeWidth={2.6} /> 위시리스트{wishlist.length > 0 && <b>{wishlist.length}</b>}
          </button>
        </div>

        <div className="listing">
          <div className="listing__main">
            {showAll && (
              <>
                <div className="home__toolbar">
                  <StoreFilterChips stores={stores} value={storeId} onChange={onStore} />
                  <div className="home__controls">
                    <CurrencyToggle value={currency} onChange={setCurrency} />
                    <PriceRangeFilter value={price} onChange={onPrice} />
                    <SortDropdown value={sort} onChange={onSort} />
                  </div>
                </div>

                {currency === 'KRW' && (
                  <p className="home__krw-note">
                    ₩ <strong>스팀</strong>은 실제 원화, 그 외 상점은 환율{rate ? ` ₩${Math.round(rate).toLocaleString('ko-KR')}` : ''} 기준 <strong>대략 환산(~ 표시)</strong>이에요 · 실제 결제가와 다를 수 있어요
                  </p>
                )}

                {loading && <div className="state">불러오는 중…</div>}
                {error && <div className="state state--error">데이터를 불러오지 못했어요 · {error}</div>}
                {!loading && !error && deals.length === 0 && (
                  <div className="state">조건에 맞는 할인이 없어요.</div>
                )}

                {!loading && !error && deals.length > 0 && (
                  <section className="deal-grid deal-grid--listing">
                    {deals.map((d) => (
                      <DealCard key={d.dealId} deal={d} currency={currency} rate={rate} />
                    ))}
                  </section>
                )}

                <Pagination page={page} totalPages={totalPages} onChange={setPage} />
              </>
            )}

            {!showAll &&
              (wishlist.length === 0 ? (
                <div className="state">
                  아직 담은 게임이 없어요.
                  <p className="state__hint">카드의 ♥ 를 누르면 여기에 모여요.</p>
                </div>
              ) : (
                <>
                  <p className="home__krw-note">
                    가격은 <strong>담은 시점</strong> 기준이에요 · 카드를 열면 현재 최저가를 확인할 수 있어요
                  </p>
                  <section className="deal-grid deal-grid--listing">
                    {wishlist.map((d) => (
                      <DealCard key={d.gameId} deal={d} currency={currency} rate={rate} />
                    ))}
                  </section>
                </>
              ))}
          </div>

          <aside className="listing__side">
            {trend.length > 0 && (
              <RankList
                deals={trend}
                currency={currency}
                rate={rate}
                title="트렌드 게임"
                icon={<TrendingUp size={18} strokeWidth={2.4} className="rank__trend" />}
              />
            )}
            <RecentGames currency={currency} rate={rate} />
          </aside>
        </div>
      </main>
      <Footer />
    </>
  )
}
