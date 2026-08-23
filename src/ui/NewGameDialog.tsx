import { useState } from 'react'
import type { Difficulty } from '../ai/search'
import { DIFFICULTIES } from '../ai/search'
import type { Color } from '../engine/types'
import type { TimeControl } from '../state/useClock'
import { ChessPiece } from './pieces'

export type GameMode = 'local' | 'ai-white' | 'ai-black'

export const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  rookie: 'Rookie',
  casual: 'Casual',
  club: 'Club',
  master: 'Master',
}

interface NewGameDialogProps {
  onChoose: (mode: GameMode, timeControl: TimeControl, difficulty: Difficulty) => void
  resumeAvailable: boolean
  onResume: () => void
}

const CONTROLS: readonly TimeControl[] = ['off', '5+0', '10+0', '15+10']

function SideIcon({ color }: { color: Color }) {
  return <ChessPiece piece={{ color, type: 'king' }} />
}

export function NewGameDialog({ onChoose, resumeAvailable, onResume }: NewGameDialogProps) {
  const [timeControl, setTimeControl] = useState<TimeControl>('off')
  const [difficulty, setDifficulty] = useState<Difficulty>('club')

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
        <fieldset className="time-controls">
          <legend>Computer level</legend>
          {DIFFICULTIES.map((level) => (
            <button
              type="button"
              className={difficulty === level ? 'time-control--selected' : ''}
              key={level}
              onClick={() => setDifficulty(level)}
            >
              {DIFFICULTY_LABELS[level]}
            </button>
          ))}
        </fieldset>
        <div className="mode-options">
          <button type="button" onClick={() => onChoose('ai-white', timeControl, difficulty)}>
            <SideIcon color="white" />
            <strong>Play White</strong>
            <span>You make the first move</span>
          </button>
          <button type="button" onClick={() => onChoose('ai-black', timeControl, difficulty)}>
            <SideIcon color="black" />
            <strong>Play Black</strong>
            <span>The computer opens</span>
          </button>
          <button type="button" onClick={() => onChoose('local', timeControl, difficulty)}>
            <span className="local-kings"><SideIcon color="white" /><SideIcon color="black" /></span>
            <strong>Two players</strong>
            <span>Share this board</span>
          </button>
        </div>
      </div>
    </div>
  )
}
