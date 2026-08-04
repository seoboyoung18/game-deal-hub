import { useEffect, useState } from 'react'
import Header from '../components/Header.jsx'
import Hero from '../components/Hero.jsx'
import Footer from '../components/Footer.jsx'
import StoreFilterChips from '../components/StoreFilterChips.jsx'
import SortDropdown from '../components/SortDropdown.jsx'
import CurrencyToggle from '../components/CurrencyToggle.jsx'
import PriceRangeFilter from '../components/PriceRangeFilter.jsx'
import DealCard from '../components/DealCard.jsx'
import Pagination from '../components/Pagination.jsx'
import { api } from '../lib/api.js'
import { useCurrency, useExchangeRate } from '../lib/useCurrency.js'

const SIZE = 20

// S1 홈 · 통합 할인 목록
export default function Home() {
  const [stores, setStores] = useState([])
  const [deals, setDeals] = useState([])
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

  useEffect(() => {
    api.getStores().then(setStores).catch(() => {})
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

  return (
    <>
      <Header />
      <Hero />
      <main className="container home">
        <div className="home__head">
          <h2 className="section-title">🔥 지금 뜨는 할인</h2>
          {!loading && !error && (
            <span className="home__count"><strong>{total.toLocaleString()}</strong>개</span>
          )}
        </div>

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
          <section className="deal-grid">
            {deals.map((d) => (
              <DealCard key={d.dealId} deal={d} currency={currency} rate={rate} />
            ))}
          </section>
        )}

        <Pagination page={page} totalPages={totalPages} onChange={setPage} />
      </main>
      <Footer />
    </>
  )
}
