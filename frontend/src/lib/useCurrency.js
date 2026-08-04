import { useEffect, useState } from 'react'
import { api } from './api.js'

// 통화 선택을 localStorage 에 저장 → 홈/상세 등 페이지를 넘어가도 유지.
export function useCurrency() {
  const [currency, setCurrency] = useState(() => localStorage.getItem('currency') || 'USD')
  useEffect(() => {
    localStorage.setItem('currency', currency)
  }, [currency])
  return [currency, setCurrency]
}

// 환율은 한 번만 받아와 모듈 캐시에 보관.
let cachedRate = null
export function useExchangeRate() {
  const [rate, setRate] = useState(cachedRate)
  useEffect(() => {
    if (cachedRate != null) {
      setRate(cachedRate)
      return
    }
    api
      .getExchangeRate()
      .then((r) => {
        cachedRate = r.rate
        setRate(r.rate)
      })
      .catch(() => {})
  }, [])
  return rate
}
