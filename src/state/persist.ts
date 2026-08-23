import type { Difficulty } from '../ai/search'
import { DIFFICULTIES } from '../ai/search'
import type { Move, Piece, Position } from '../engine/types'
import type { ClockState, TimeControl } from './useClock'
import type { GameMode } from '../ui/NewGameDialog'

const STORAGE_KEY = 'chess.saved-game.v1'
const MODES: readonly GameMode[] = ['local', 'ai-white', 'ai-black']
const CONTROLS: readonly TimeControl[] = ['off', '5+0', '10+0', '15+10']
const COLORS = ['white', 'black'] as const
const PIECES = ['king', 'queen', 'rook', 'bishop', 'knight', 'pawn'] as const

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
  difficulty?: Difficulty
  clock: ClockState
}


function isPiece(value: unknown): value is Piece | null {
  if (value === null) return true
  if (typeof value !== 'object') return false
  const piece = value as Record<string, unknown>
  return COLORS.includes(piece.color as (typeof COLORS)[number])
    && PIECES.includes(piece.type as (typeof PIECES)[number])
}

function isPosition(value: unknown): value is Position {
  if (typeof value !== 'object' || value === null) return false
  const position = value as Record<string, unknown>
  if (!Array.isArray(position.board) || position.board.length !== 64 || !position.board.every(isPiece)) return false
  if (!COLORS.includes(position.turn as (typeof COLORS)[number])) return false
  const castling = position.castling
  if (typeof castling !== 'object' || castling === null) return false
  const rights = castling as Record<string, unknown>
  if (!['whiteKingSide', 'whiteQueenSide', 'blackKingSide', 'blackQueenSide'].every((key) => typeof rights[key] === 'boolean')) return false
  if (position.enPassantTarget !== null && (!Number.isInteger(position.enPassantTarget) || Number(position.enPassantTarget) < 0 || Number(position.enPassantTarget) > 63)) return false
  return Number.isFinite(position.halfmoveClock)
    && Number(position.halfmoveClock) >= 0
    && Array.isArray(position.positionHistory)
    && position.positionHistory.every((entry) => typeof entry === 'string')
}

function isClock(value: unknown): value is ClockState {
  if (typeof value !== 'object' || value === null) return false
  const clock = value as Record<string, unknown>
  return ['whiteMs', 'blackMs', 'incrementMs'].every((key) => Number.isFinite(clock[key]) && Number(clock[key]) >= 0)
}

function isMove(value: unknown): value is Move {
  if (typeof value !== 'object' || value === null) return false
  const move = value as Record<string, unknown>
  if (!Number.isInteger(move.from) || !Number.isInteger(move.to)) return false
  return Number(move.from) >= 0 && Number(move.from) <= 63 && Number(move.to) >= 0 && Number(move.to) <= 63
}

function isPersistedGame(value: unknown): value is PersistedGame {
  if (typeof value !== 'object' || value === null) return false
  const game = value as Record<string, unknown>
  if (!isPosition(game.position) || !isClock(game.clock)) return false
  if (!MODES.includes(game.mode as GameMode) || !CONTROLS.includes(game.timeControl as TimeControl)) return false
  if (game.difficulty !== undefined && !DIFFICULTIES.includes(game.difficulty as Difficulty)) return false
  if (!Array.isArray(game.history)) return false
  return game.history.every((value) => {
    if (typeof value !== 'object' || value === null) return false
    const entry = value as Record<string, unknown>
    return isPosition(entry.position) && isMove(entry.move) && isClock(entry.clock) && typeof entry.san === 'string'
  })
}

export function saveGame(game: PersistedGame): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(game))
  } catch {
    return
  }
}

export function loadGame(): PersistedGame | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const saved: unknown = JSON.parse(raw)
    if (isPersistedGame(saved)) return saved
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    return null
  }
  return null
}

export function clearSavedGame(): void {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    return
  }
}
