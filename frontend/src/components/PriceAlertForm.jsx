import { useEffect, useState } from 'react'
import { BellRing, BellOff, Check } from 'lucide-react'
import { useAlert, setAlert, removeAlert } from '../lib/alerts.js'
import { displayPrice } from '../lib/format.js'

// 상세 페이지 목표가 설정. 저장은 항상 USD 기준(백엔드 sale_price 와 같은 단위)이고,
// 입력·표시만 선택 통화로 환산한다. KRW 입력은 환율 기반이라 대략값이다.
export default function PriceAlertForm({ game, lowest, currency, rate }) {
  const alert = useAlert(game.gameId)
  const [editing, setEditing] = useState(false)
  const [input, setInput] = useState('')
  const [touched, setTouched] = useState(false) // 사용자가 손댄 뒤엔 자동 채움을 멈춤
  const [error, setError] = useState(null)

  const krwMode = currency === 'KRW' && !!rate
  const toUsd = (v) => (krwMode ? Number(v) / rate : Number(v))
  const fromUsd = (usd) => (krwMode ? Math.round(usd * rate) : Number(usd.toFixed(2)))

  // 기본 제안: 현재 최저가의 10% 아래
  const suggested = lowest != null ? fromUsd(Number(lowest) * 0.9) : null

  useEffect(() => {
    // 폼이 보이는 동안, 아직 손대지 않았다면 현재 통화 기준 제안값으로 채워둔다
    if (alert && !editing) return
    if (touched) return
    const base = alert ? Number(alert.targetPrice) : lowest != null ? Number(lowest) * 0.9 : null
    setInput(base != null ? String(fromUsd(base)) : '')
  }, [editing, currency, rate, alert, lowest, touched]) // eslint-disable-line react-hooks/exhaustive-deps

  const presets = []
  if (lowest != null) {
    presets.push({ label: '10% 더 싸지면', usd: Number(lowest) * 0.9 })
    presets.push({ label: '20% 더 싸지면', usd: Number(lowest) * 0.8 })
  }
  if (game.allTimeLow != null && lowest != null && Number(game.allTimeLow) < Number(lowest)) {
    presets.push({ label: '역대 최저가', usd: Number(game.allTimeLow) })
  }

  const submit = (e) => {
    e.preventDefault()
    const usd = toUsd(input)
    if (!Number.isFinite(usd) || usd <= 0) {
      setError('0보다 큰 금액을 입력해 주세요')
      return
    }
    setAlert(game, usd, lowest != null ? Number(lowest) : null)
    setEditing(false)
    setTouched(false)
  }

  // 이미 등록된 상태 — 요약 + 수정/해제
  if (alert && !editing) {
    const reached = alert.triggeredAt != null
    return (
      <div className={`alertform alertform--set ${reached ? 'is-hit' : ''}`}>
        <span className="alertform__icon" aria-hidden>
          {reached ? <Check size={16} strokeWidth={2.6} /> : <BellRing size={16} strokeWidth={2.2} />}
        </span>
        <p className="alertform__summary">
          {reached ? (
            <>
              목표가 도달! 지금 <strong>{displayPrice(alert.triggeredPrice, { currency, rate })}</strong>
              {alert.storeName && ` · ${alert.storeName}`}
            </>
          ) : (
            <>
              <strong>{displayPrice(alert.targetPrice, { currency, rate })}</strong> 이하가 되면 알려드릴게요
            </>
          )}
        </p>
        <div className="alertform__actions">
          <button type="button" className="alertform__btn" onClick={() => setEditing(true)}>
            목표가 수정
          </button>
          <button
            type="button"
            className="alertform__btn alertform__btn--ghost"
            onClick={() => removeAlert(game.gameId)}
          >
            <BellOff size={13} strokeWidth={2.2} /> 알림 해제
          </button>
        </div>
      </div>
    )
  }

  // 미등록 또는 편집 중 — 입력 폼
  return (
    <form className="alertform" onSubmit={submit}>
      <span className="alertform__icon" aria-hidden>
        <BellRing size={16} strokeWidth={2.2} />
      </span>
      <div className="alertform__field">
        <label className="alertform__label" htmlFor="alert-target">
          목표 가격 알림
          {lowest != null && (
            <span className="alertform__hint">
              현재 최저 {displayPrice(lowest, { currency, rate })}
            </span>
          )}
        </label>
        <div className="alertform__inputrow">
          <span className="alertform__unit" aria-hidden>
            {krwMode ? '₩' : '$'}
          </span>
          <input
            id="alert-target"
            className="alertform__input"
            type="number"
            inputMode="decimal"
            min="0"
            step={krwMode ? '100' : '0.01'}
            value={input}
            onChange={(e) => {
              setInput(e.target.value)
              setTouched(true)
              setError(null)
            }}
            placeholder={suggested != null ? String(suggested) : '목표 금액'}
            aria-describedby={error ? 'alert-target-err' : undefined}
          />
          <span className="alertform__suffix">이하</span>
          <button type="submit" className="alertform__btn alertform__btn--primary">
            {alert ? '수정' : '알림 받기'}
          </button>
          {editing && (
            <button
              type="button"
              className="alertform__btn alertform__btn--ghost"
              onClick={() => {
                setEditing(false)
                setTouched(false)
              }}
            >
              취소
            </button>
          )}
        </div>
        {presets.length > 0 && (
          <div className="alertform__presets">
            {presets.map((p) => (
              <button
                key={p.label}
                type="button"
                className="alertform__preset"
                onClick={() => {
                  setInput(String(fromUsd(p.usd)))
                  setTouched(true)
                  setError(null)
                }}
              >
                {p.label} · {displayPrice(p.usd, { currency, rate })}
              </button>
            ))}
          </div>
        )}
        {error && (
          <p className="alertform__err" id="alert-target-err" role="alert">
            {error}
          </p>
        )}
        <p className="alertform__note">
          알림은 이 브라우저에만 저장돼요. 딜모아를 다시 열 때 목표가 도달을 확인해 헤더 벨에 표시합니다.
          {krwMode && ' 원화 입력은 환율 기준 대략값이에요.'}
        </p>
      </div>
    </form>
  )
}
