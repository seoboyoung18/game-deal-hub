import { useMemo, useRef, useState } from 'react'
import { displayPrice } from '../lib/format.js'

// 가격 추이 스파크라인 (일 단위 최저가, USD 원본 → 표시 통화 환산).
// 데이터가 2일치 미만이면 아무것도 그리지 않는다 — 수집이 쌓이면 자연히 나타남.
const W = 640
const H = 150
const PAD_X = 6
const PAD_TOP = 14
const PAD_BOT = 20

export default function PriceHistoryChart({ points, currency = 'USD', rate = null }) {
  const [hover, setHover] = useState(null)
  const svgRef = useRef(null)

  const data = useMemo(
    () => (points || []).map((p) => ({ day: p.day, price: Number(p.price) })),
    [points]
  )
  if (data.length < 2) return null

  const prices = data.map((d) => d.price)
  const min = Math.min(...prices)
  const max = Math.max(...prices)
  const span = max - min || 1
  const x = (i) => PAD_X + (i / (data.length - 1)) * (W - PAD_X * 2)
  const y = (v) => PAD_TOP + (1 - (v - min) / span) * (H - PAD_TOP - PAD_BOT)
  const line = data
    .map((d, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(d.price).toFixed(1)}`)
    .join(' ')
  const area = `${line} L${x(data.length - 1).toFixed(1)},${H - PAD_BOT} L${x(0).toFixed(1)},${H - PAD_BOT} Z`
  const minIdx = prices.indexOf(min)
  const last = data.length - 1

  const fmt = (v) => displayPrice(v, { currency, rate })
  const fmtDay = (iso) => {
    const d = new Date(iso)
    return `${d.getMonth() + 1}월 ${d.getDate()}일`
  }

  const onMove = (e) => {
    const rect = svgRef.current.getBoundingClientRect()
    const px = ((e.clientX - rect.left) / rect.width) * W
    const i = Math.round(((px - PAD_X) / (W - PAD_X * 2)) * (data.length - 1))
    setHover(Math.max(0, Math.min(last, i)))
  }

  const tipLeft = hover != null ? Math.min(88, Math.max(12, (x(hover) / W) * 100)) : 0

  return (
    <figure
      className="pricechart"
      aria-label={`가격 추이 ${fmtDay(data[0].day)}부터 ${fmtDay(data[last].day)}까지 · 최저 ${fmt(min)} · 최고 ${fmt(max)}`}
    >
      <figcaption className="pricechart__head">
        <span className="pricechart__title">가격 추이</span>
        <span className="pricechart__range">
          {fmtDay(data[0].day)} ~ {fmtDay(data[last].day)} · 일 최저가 기준
        </span>
      </figcaption>

      <div className="pricechart__plot">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${W} ${H}`}
          onMouseMove={onMove}
          onMouseLeave={() => setHover(null)}
          role="img"
          aria-hidden
        >
          {/* 상·하한 기준선 (은은하게) */}
          <line className="pricechart__grid" x1={PAD_X} y1={y(max)} x2={W - PAD_X} y2={y(max)} />
          <line className="pricechart__grid" x1={PAD_X} y1={y(min)} x2={W - PAD_X} y2={y(min)} />
          <text className="pricechart__axis" x={W - PAD_X} y={y(max) - 4} textAnchor="end">
            {fmt(max)}
          </text>

          <path className="pricechart__area" d={area} />
          <path className="pricechart__line" d={line} />

          {/* 크로스헤어 */}
          {hover != null && (
            <line
              className="pricechart__cross"
              x1={x(hover)}
              y1={PAD_TOP}
              x2={x(hover)}
              y2={H - PAD_BOT}
            />
          )}

          {/* 최저점 강조 + 라벨 (선택적 직접 라벨) */}
          <circle className="pricechart__dot" cx={x(minIdx)} cy={y(min)} r={4} />
          <text
            className="pricechart__axis pricechart__axis--min"
            x={x(minIdx)}
            y={H - 6}
            textAnchor={minIdx < data.length / 6 ? 'start' : minIdx > (data.length * 5) / 6 ? 'end' : 'middle'}
          >
            최저 {fmt(min)}
          </text>

          {/* 마지막 점 (현재) */}
          <circle className="pricechart__dot" cx={x(last)} cy={y(data[last].price)} r={3.5} />

          {hover != null && (
            <circle className="pricechart__dot" cx={x(hover)} cy={y(data[hover].price)} r={4.5} />
          )}
        </svg>

        {hover != null && (
          <div className="pricechart__tip" style={{ left: `${tipLeft}%` }}>
            {fmtDay(data[hover].day)} · <b>{fmt(data[hover].price)}</b>
          </div>
        )}
      </div>
    </figure>
  )
}
