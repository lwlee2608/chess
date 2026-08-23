import type { Color } from '../engine/types'
import { ChessPiece } from './pieces'

export type GameMode = 'local' | 'ai-white' | 'ai-black'

interface NewGameDialogProps {
  onChoose: (mode: GameMode) => void
}

function SideIcon({ color }: { color: Color }) {
  return <ChessPiece piece={{ color, type: 'king' }} />
}

export function NewGameDialog({ onChoose }: NewGameDialogProps) {
  return (
    <div className="new-game-backdrop">
      <div className="new-game-dialog" role="dialog" aria-modal="true" aria-labelledby="new-game-title">
        <p className="eyebrow">Set the board</p>
        <h2 id="new-game-title">Choose your side</h2>
        <div className="mode-options">
          <button type="button" onClick={() => onChoose('ai-white')}>
            <SideIcon color="white" />
            <strong>Play White</strong>
            <span>You make the first move</span>
          </button>
          <button type="button" onClick={() => onChoose('ai-black')}>
            <SideIcon color="black" />
            <strong>Play Black</strong>
            <span>The computer opens</span>
          </button>
          <button type="button" onClick={() => onChoose('local')}>
            <span className="local-kings"><SideIcon color="white" /><SideIcon color="black" /></span>
            <strong>Two players</strong>
            <span>Share this board</span>
          </button>
        </div>
      </div>
    </div>
  )
}
