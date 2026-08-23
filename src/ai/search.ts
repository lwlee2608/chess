import { applyMove, getAllLegalMoves, getGameStatus } from '../engine/game'
import type { Color, Move, Position } from '../engine/types'
import { MATERIAL, evaluate } from './evaluate'

export type Difficulty = 'rookie' | 'casual' | 'club' | 'master'

export const DIFFICULTIES: readonly Difficulty[] = ['rookie', 'casual', 'club', 'master']

const MATE_SCORE = 1_000_000
const DEPTH: Record<Difficulty, number> = { rookie: 1, casual: 2, club: 3, master: 4 }
const CASUAL_SLACK = 120
const ROOKIE_CHOICES = 5

export interface SearchRequest {
  position: Position
  difficulty: Difficulty
}

interface ScoredMove {
  move: Move
  next: Position
  score: number
}

function captureValue(position: Position, move: Move): number {
  const victim = position.board[move.to]
  if (!victim) return 0
  return MATERIAL[victim.type] - MATERIAL[position.board[move.from]!.type] / 100
}

function ordered(position: Position, moves: Move[]): Move[] {
  return moves.sort((a, b) => captureValue(position, b) - captureValue(position, a))
}

function minimax(
  position: Position,
  depth: number,
  alpha: number,
  beta: number,
  perspective: Color,
): number {
  const status = getGameStatus(position)
  if (status.type === 'checkmate') return status.winner === perspective ? MATE_SCORE + depth : -MATE_SCORE - depth
  if (status.type !== 'playing') return 0
  if (depth === 0) return evaluate(position, perspective)

  const maximizing = position.turn === perspective
  let best = maximizing ? -Infinity : Infinity

  for (const move of ordered(position, getAllLegalMoves(position))) {
    const score = minimax(applyMove(position, move), depth - 1, alpha, beta, perspective)
    if (maximizing) {
      best = Math.max(best, score)
      alpha = Math.max(alpha, best)
    } else {
      best = Math.min(best, score)
      beta = Math.min(beta, best)
    }
    if (beta <= alpha) break
  }

  return best
}

function pickRandom(candidates: ScoredMove[]): Move {
  return candidates[Math.floor(Math.random() * candidates.length)].move
}

function pickRookie(scored: ScoredMove[]): Move {
  const unfinished = scored.filter(({ next }) => getGameStatus(next).type === 'playing')
  const pool = unfinished.length > 0 ? unfinished : scored
  return pickRandom([...pool].sort((a, b) => a.score - b.score).slice(0, ROOKIE_CHOICES))
}

export function findBestMove(position: Position, difficulty: Difficulty = 'club'): Move | null {
  const moves = ordered(position, getAllLegalMoves(position))
  if (moves.length === 0) return null

  const depth = DEPTH[difficulty]
  const scored = moves.map((move) => {
    const next = applyMove(position, move)
    return { move, next, score: minimax(next, depth - 1, -Infinity, Infinity, position.turn) }
  })

  if (difficulty === 'rookie') return pickRookie(scored)

  const best = Math.max(...scored.map(({ score }) => score))
  const slack = difficulty === 'casual' ? CASUAL_SLACK : 0
  return pickRandom(scored.filter(({ score }) => score >= best - slack))
}
