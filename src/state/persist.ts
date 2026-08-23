import type { Move, Position } from '../engine/types'
import type { ClockState, TimeControl } from './useClock'
import type { GameMode } from '../ui/NewGameDialog'

const STORAGE_KEY = 'chess.saved-game.v1'

export interface PersistedSnapshot {
  position: Position
  move: Move
  clock: ClockState
  san: string
}

export interface PersistedGame {
  position: Position
  history: PersistedSnapshot[]
  mode: GameMode
  timeControl: TimeControl
  clock: ClockState
}

export function saveGame(game: PersistedGame): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(game))
}

export function loadGame(): PersistedGame | null {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return null

  try {
    const saved = JSON.parse(raw) as PersistedGame
    if (!saved.position?.board || saved.position.board.length !== 64 || !Array.isArray(saved.history)) return null
    return saved
  } catch {
    localStorage.removeItem(STORAGE_KEY)
    return null
  }
}

export function clearSavedGame(): void {
  localStorage.removeItem(STORAGE_KEY)
}
