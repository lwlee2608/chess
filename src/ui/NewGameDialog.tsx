import { useState } from 'react'
import type { Color } from '../engine/types'
import type { TimeControl } from '../state/useClock'
import { ChessPiece } from './pieces'

export type GameMode = 'local' | 'ai-white' | 'ai-black'

interface NewGameDialogProps {
  onChoose: (mode: GameMode, timeControl: TimeControl) => void
  resumeAvailable: boolean
  onResume: () => void
}

const CONTROLS: readonly TimeControl[] = ['off', '5+0', '10+0', '15+10']

function SideIcon({ color }: { color: Color }) {
  return <ChessPiece piece={{ color, type: 'king' }} />
}

export function NewGameDialog({ onChoose, resumeAvailable, onResume }: NewGameDialogProps) {
  const [timeControl, setTimeControl] = useState<TimeControl>('off')

  return (
    <div className="new-game-backdrop">
      <div className="new-game-dialog" role="dialog" aria-modal="true" aria-labelledby="new-game-title">
        <p className="eyebrow">Set the board</p>
        {resumeAvailable && (
          <button type="button" className="resume-button" onClick={onResume}>
            <strong>Resume game</strong>
            <span>Continue the saved position</span>
          </button>
        )}
        <h2 id="new-game-title">Choose your game</h2>
        <fieldset className="time-controls">
          <legend>Clock</legend>
          {CONTROLS.map((control) => (
            <button
              type="button"
              className={timeControl === control ? 'time-control--selected' : ''}
              key={control}
              onClick={() => setTimeControl(control)}
            >
              {control === 'off' ? 'Off' : control}
            </button>
          ))}
        </fieldset>
        <div className="mode-options">
          <button type="button" onClick={() => onChoose('ai-white', timeControl)}>
            <SideIcon color="white" />
            <strong>Play White</strong>
            <span>You make the first move</span>
          </button>
          <button type="button" onClick={() => onChoose('ai-black', timeControl)}>
            <SideIcon color="black" />
            <strong>Play Black</strong>
            <span>The computer opens</span>
          </button>
          <button type="button" onClick={() => onChoose('local', timeControl)}>
            <span className="local-kings"><SideIcon color="white" /><SideIcon color="black" /></span>
            <strong>Two players</strong>
            <span>Share this board</span>
          </button>
        </div>
      </div>
    </div>
  )
}
