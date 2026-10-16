import { applyMove, getAllLegalMoves, getGameStatus } from '../engine/game'
import { isKingInCheck } from '../engine/moves'
import type { Color, Move, Position } from '../engine/types'
import type { Difficulty } from './difficulty'
import { MATERIAL, evaluate } from './evaluate'

export type SearchDifficulty = Exclude<Difficulty, 'grandmaster'>

const MATE_SCORE = 1_000_000
const DEPTH: Record<SearchDifficulty, number> = { rookie: 1, casual: 2, club: 3, master: 4 }
const CASUAL_SLACK = 120
const ROOKIE_CHOICES = 5
const QUIESCENCE_DEPTH = 8

export interface SearchRequest {
  position: Position
  difficulty: SearchDifficulty
}

interface ScoredMove {
  move: Move
  next: Position
  score: number
}

function isCapture(position: Position, move: Move): boolean {
  return position.board[move.to] !== null
    || (position.board[move.from]?.type === 'pawn' && move.to === position.enPassantTarget)
}

function captureValue(position: Position, move: Move): number {
  const victim = position.board[move.to]
  const captured = victim ? MATERIAL[victim.type] : isCapture(position, move) ? MATERIAL.pawn : 0
  const promotion = move.promotion ? MATERIAL[move.promotion] - MATERIAL.pawn : 0
  return captured + promotion - (captured ? MATERIAL[position.board[move.from]!.type] / 100 : 0)
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
  extendTactics: boolean,
): number {
  const status = getGameStatus(position)
  if (status.type === 'checkmate') return status.winner === perspective ? MATE_SCORE + depth : -MATE_SCORE - depth
  if (status.type !== 'playing') return 0
  const maximizing = position.turn === perspective
  let best = maximizing ? -Infinity : Infinity
  let moves = getAllLegalMoves(position)

  if (depth <= 0) {
    if (!extendTactics) return evaluate(position, perspective)
    const inCheck = isKingInCheck(position, position.turn)
    if (!inCheck) {
      best = evaluate(position, perspective)
      if (depth <= -QUIESCENCE_DEPTH) return best
      if (maximizing) alpha = Math.max(alpha, best)
      else beta = Math.min(beta, best)
      if (beta <= alpha) return best
      moves = moves.filter((move) => isCapture(position, move) || move.promotion)
    }
  }

  for (const move of ordered(position, moves)) {
    const score = minimax(applyMove(position, move), depth - 1, alpha, beta, perspective, extendTactics)
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

export function findBestMove(position: Position, difficulty: SearchDifficulty = 'club'): Move | null {
  const moves = ordered(position, getAllLegalMoves(position))
  if (moves.length === 0) return null

  const depth = DEPTH[difficulty]
  const scored = moves.map((move) => {
    const next = applyMove(position, move)
    return { move, next, score: minimax(next, depth - 1, -Infinity, Infinity, position.turn, difficulty === 'club' || difficulty === 'master') }
  })

  if (difficulty === 'rookie') return pickRookie(scored)

  const best = Math.max(...scored.map(({ score }) => score))
  const slack = difficulty === 'casual' ? CASUAL_SLACK : 0
  return pickRandom(scored.filter(({ score }) => score >= best - slack))
}
