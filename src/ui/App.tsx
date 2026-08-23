import { useGame } from '../state/useGame'
import { Board } from './Board'

export function App() {
  const game = useGame()
  const turn = game.position.turn === 'white' ? 'White' : 'Black'

  return (
    <main className="app-shell">
      <header className="masthead">
        <div>
          <p className="eyebrow">Over the board</p>
          <h1>Chess</h1>
        </div>
        <div className={`turn-indicator turn-indicator--${game.position.turn}`} aria-live="polite">
          <span className="turn-indicator__piece" />
          <span>
            <small>Now playing</small>
            <strong>{turn}</strong>
          </span>
        </div>
      </header>

      <section className="game-stage" aria-label="Local chess game">
        <Board
          position={game.position}
          selectedSquare={game.selectedSquare}
          legalMoves={game.legalMoves}
          onChooseSquare={game.chooseSquare}
          onSelectSquare={game.selectSquare}
          onMoveTo={game.moveTo}
        />
        <aside className="game-note">
          <span className="game-note__number">01</span>
          <p>Local play</p>
          <h2>{turn} to move</h2>
          <div className="game-note__rule" />
          <p className="game-note__hint">Select a piece, then its destination. Dragging works too.</p>
        </aside>
      </section>

      <footer>
        <span>Two players · One board</span>
        <span>Rules in progress</span>
      </footer>
    </main>
  )
}
