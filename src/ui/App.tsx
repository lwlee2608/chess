import { isKingInCheck } from '../engine/moves'
import { useGame } from '../state/useGame'
import { Board } from './Board'
import { PromotionDialog } from './PromotionDialog'

export function App() {
  const game = useGame()
  const turn = game.position.turn === 'white' ? 'White' : 'Black'
  const checkedColor = isKingInCheck(game.position, game.position.turn) ? game.position.turn : null

  let heading = `${turn} to move`
  let kicker = checkedColor ? 'Check' : 'Local play'
  if (game.status.type === 'checkmate') {
    heading = `Checkmate — ${game.status.winner === 'white' ? 'White' : 'Black'} wins`
    kicker = 'Game over'
  } else if (game.status.type === 'stalemate') {
    heading = 'Draw — Stalemate'
    kicker = 'Game over'
  } else if (game.status.type === 'draw') {
    heading = `Draw — ${game.status.reason[0].toUpperCase()}${game.status.reason.slice(1)}`
    kicker = 'Game over'
  }

  return (
    <>
      <main className="app-shell" inert={game.pendingPromotion ? true : undefined}>
      <header className="masthead">
        <div>
          <p className="eyebrow">Over the board</p>
          <h1>Chess</h1>
        </div>
        <div className={`turn-indicator turn-indicator--${game.position.turn}`} aria-live="polite">
          <span className="turn-indicator__piece" />
          <span>
            <small>{game.status.type === 'playing' ? 'Now playing' : 'Finished'}</small>
            <strong>{game.status.type === 'playing' ? turn : 'Game over'}</strong>
          </span>
        </div>
      </header>

      <section className="game-stage" aria-label="Local chess game">
        <Board
          position={game.position}
          selectedSquare={game.selectedSquare}
          legalMoves={game.legalMoves}
          checkedColor={checkedColor}
          disabled={game.status.type !== 'playing'}
          onChooseSquare={game.chooseSquare}
          onSelectSquare={game.selectSquare}
          onMoveTo={game.moveTo}
        />
        <aside className="game-note" aria-live="polite">
          <span className="game-note__number">02</span>
          <p>{kicker}</p>
          <h2>{heading}</h2>
          <div className="game-note__rule" />
          {game.status.type === 'playing' ? (
            <p className="game-note__hint">Every move is legal. The king cannot be left in check.</p>
          ) : (
            <button type="button" className="new-game-button" onClick={game.startNewGame}>Play again</button>
          )}
        </aside>
      </section>

      <footer>
        <span>Two players · Full rules</span>
        <span>Local game</span>
      </footer>
      </main>
      {game.pendingPromotion && (
        <PromotionDialog color={game.position.turn} onChoose={game.promote} />
      )}
    </>
  )
}
