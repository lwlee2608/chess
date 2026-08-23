import { applyMove, getAllLegalMoves, getGameStatus } from '../engine/game'
import type { Color, Move, Position } from '../engine/types'
import { evaluate } from './evaluate'

const MATE_SCORE = 1_000_000

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

  for (const move of getAllLegalMoves(position)) {
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

export function findBestMove(position: Position, depth = 3): Move | null {
  const moves = getAllLegalMoves(position)
  if (moves.length === 0) return null

  let bestMove = moves[0]
  let bestScore = -Infinity
  for (const move of moves) {
    const score = minimax(applyMove(position, move), depth - 1, -Infinity, Infinity, position.turn)
    if (score > bestScore) {
      bestScore = score
      bestMove = move
    }
  }
  return bestMove
}
