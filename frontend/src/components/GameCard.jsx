import { Link } from 'react-router-dom'
import StoreBadge from './StoreBadge.jsx'
import { displayPrice } from '../lib/format.js'

// S2 검색 카드: 커버 · 게임명 · "최저 $X~"(초록) · 판매 스토어 뱃지들
export default function GameCard({ game, currency, rate }) {
  const stores = (game.storeNames || '').split('|').filter(Boolean)

  return (
    <Link to={`/game/${game.gameId}`} className="game-card">
      <div className="game-card__cover">
        {game.thumbUrl ? (
          <img src={game.thumbUrl} alt={game.title} loading="lazy" />
        ) : (
          <div className="game-card__cover-empty" aria-hidden>🎮</div>
        )}
      </div>
      <div className="game-card__body">
        <h3 className="game-card__title" title={game.title}>{game.title}</h3>
        <div className="game-card__low">
          최저 {displayPrice(game.minSalePrice, { currency, rate })}~
        </div>
        <div className="game-card__stores">
          {stores.slice(0, 4).map((s) => (
            <StoreBadge key={s} storeName={s} showName={false} />
          ))}
          {stores.length > 4 && <span className="game-card__more">+{stores.length - 4}</span>}
        </div>
      </div>
    </Link>
  )
}
