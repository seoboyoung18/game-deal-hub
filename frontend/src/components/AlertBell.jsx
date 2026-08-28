import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Bell, Gamepad2, X } from 'lucide-react'
import { useAlerts, unseenCount, markAlertsSeen, removeAlert } from '../lib/alerts.js'
import { useCurrency, useExchangeRate } from '../lib/useCurrency.js'
import { displayPrice } from '../lib/format.js'

// 헤더 가격 알림 벨. 목록은 브라우저에 저장되고(로그인 없음), 열 때마다 현재가를 갱신한다.
export default function AlertBell() {
  const alerts = useAlerts({ watch: true })
  const [open, setOpen] = useState(false)
  const [fresh, setFresh] = useState(() => new Set()) // 이번에 새로 도달한 것 강조
  const [currency] = useCurrency()
  const rate = useExchangeRate()
  const wrapRef = useRef(null)

  const unseen = unseenCount(alerts)

  useEffect(() => {
    if (!open) return
    const onDown = (e) => {
      if (!wrapRef.current?.contains(e.target)) setOpen(false)
    }
    const onKey = (e) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const toggle = () => {
    if (open) {
      setOpen(false)
      return
    }
    // 열 때 미확인 항목을 기억해 두고 바로 '확인함' 처리 (뱃지는 사라지되 강조는 남김)
    setFresh(new Set(alerts.filter((a) => a.triggeredAt && !a.seen).map((a) => a.gameId)))
    markAlertsSeen()
    setOpen(true)
  }

  const hit = alerts.filter((a) => a.triggeredAt)
  const waiting = alerts.filter((a) => !a.triggeredAt)

  return (
    <div className="alertbell" ref={wrapRef}>
      <button
        type="button"
        className={`alertbell__btn ${unseen > 0 ? 'has-unseen' : ''}`}
        onClick={toggle}
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-label={unseen > 0 ? `가격 알림 ${unseen}건 도달` : '가격 알림'}
      >
        <Bell size={16} strokeWidth={2.2} />
        {unseen > 0 && <span className="alertbell__badge">{unseen > 9 ? '9+' : unseen}</span>}
      </button>

      {open && (
        <div className="alertpanel" role="dialog" aria-label="가격 알림">
          <div className="alertpanel__head">
            <strong>가격 알림</strong>
            <span className="alertpanel__count">{alerts.length}개</span>
          </div>

          {alerts.length === 0 ? (
            <p className="alertpanel__empty">
              아직 등록한 알림이 없어요.
              <br />
              게임 상세에서 <strong>목표 가격</strong>을 정해두면 그 밑으로 내려갈 때 여기에 표시돼요.
            </p>
          ) : (
            <ul className="alertpanel__list">
              {[...hit, ...waiting].map((a) => (
                <li
                  key={a.gameId}
                  className={`alertrow ${a.triggeredAt ? 'is-hit' : ''} ${fresh.has(a.gameId) ? 'is-fresh' : ''}`}
                >
                  <Link className="alertrow__main" to={`/game/${a.gameId}`} onClick={() => setOpen(false)}>
                    <span className="alertrow__thumb" aria-hidden>
                      {a.thumbUrl ? <img src={a.thumbUrl} alt="" loading="lazy" /> : <Gamepad2 size={14} />}
                    </span>
                    <span className="alertrow__body">
                      <span className="alertrow__title">{a.title}</span>
                      <span className="alertrow__prices">
                        {a.triggeredAt ? (
                          <strong className="alertrow__now">
                            {displayPrice(a.triggeredPrice, { currency, rate, krw: a.krwSalePrice })} 도달
                          </strong>
                        ) : (
                          <span className="alertrow__now">
                            현재{' '}
                            {a.currentPrice != null
                              ? displayPrice(a.currentPrice, { currency, rate, krw: a.krwSalePrice })
                              : '할인 종료'}
                          </span>
                        )}
                        <span className="alertrow__target">
                          목표 {displayPrice(a.targetPrice, { currency, rate })} 이하
                        </span>
                        {a.storeName && <span className="alertrow__store">{a.storeName}</span>}
                      </span>
                    </span>
                  </Link>
                  <button
                    type="button"
                    className="alertrow__del"
                    onClick={() => removeAlert(a.gameId)}
                    aria-label={`${a.title} 알림 삭제`}
                  >
                    <X size={13} strokeWidth={2.4} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
