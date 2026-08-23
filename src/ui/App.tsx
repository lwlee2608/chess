import { isKingInCheck } from '../engine/moves'
import { useGame } from '../state/useGame'
import { Board } from './Board'
import { NewGameDialog } from './NewGameDialog'
import { MoveList } from './MoveList'
import { PromotionDialog } from './PromotionDialog'

export function App() {
  const game = useGame()
  const turn = game.position.turn === 'white' ? 'White' : 'Black'
  const checkedColor = isKingInCheck(game.position, game.position.turn) ? game.position.turn : null

  let heading = game.thinking ? 'Computer is thinking' : `${turn} to move`
  let kicker = game.thinking ? 'Depth 3 search' : checkedColor ? 'Check' : game.mode === 'local' ? 'Local play' : 'Vs computer'
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
      <main className="app-shell" inert={game.pendingPromotion || game.mode === null ? true : undefined}>
        <header className="masthead">
          <div>
            <p className="eyebrow">Over the board</p>
            <h1>Chess</h1>
          </div>
          <div className={`turn-indicator turn-indicator--${game.position.turn}`} aria-live="polite">
            <span className={`turn-indicator__piece${game.thinking ? ' turn-indicator__piece--thinking' : ''}`} />
            <span>
              <small>{game.thinking ? 'Calculating' : game.status.type === 'playing' ? 'Now playing' : 'Finished'}</small>
              <strong>{game.status.type === 'playing' ? turn : 'Game over'}</strong>
            </span>
          </div>
        </header>

        <section className="game-stage" aria-label="Chess game">
          <Board
            position={game.position}
            selectedSquare={game.selectedSquare}
            legalMoves={game.legalMoves}
            lastMove={game.lastMove}
            checkedColor={checkedColor}
            disabled={game.inputBlocked}
            orientation={game.orientation}
            onChooseSquare={game.chooseSquare}
            onSelectSquare={game.selectSquare}
            onMoveTo={game.moveTo}
          />
          <aside className="game-sidebar" aria-live="polite">
            <div className="game-note">
              <span className="game-note__number">04</span>
              <p>{kicker}</p>
              <h2>{heading}</h2>
              <div className="game-note__rule" />
            </div>
            <MoveList moves={game.moves} />
            <button type="button" className="undo-button" disabled={!game.canUndo} onClick={game.undo}>Undo</button>
          </aside>
        </section>

        <footer>
          <span>{game.mode === 'local' ? 'Two players · Full rules' : 'Human vs machine · Depth 3'}</span>
          <button type="button" className="footer-button" onClick={() => game.startNewGame()}>New game</button>
        </footer>
      </main>
      {game.mode === null && <NewGameDialog onChoose={game.startNewGame} />}
      {game.pendingPromotion && <PromotionDialog color={game.position.turn} onChoose={game.promote} />}
    </>
  )
}
