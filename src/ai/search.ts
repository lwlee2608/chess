import { applyMoveUnchecked, getAllLegalMoves, getCandidateMoves, getDrawStatus, getGameStatus } from '../engine/game'
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
const MASTER_TIME_MS = 2000
const MAX_DEPTH = 12
const TIME_CHECK_INTERVAL = 1024
const TIMEOUT = Symbol('timeout')

export interface SearchRequest {
  position: Position
  difficulty: SearchDifficulty
}

interface ScoredMove {
  move: Move
  next: Position
  score: number
}

interface Search {
  perspective: Color
  extendTactics: boolean
  deadline: number
  nodes: number
  killers: Move[][]
  history: number[]
}

function createSearch(perspective: Color, extendTactics: boolean): Search {
  return { perspective, extendTactics, deadline: Infinity, nodes: 0, killers: [], history: Array<number>(64 * 64).fill(0) }
}

function isCapture(position: Position, move: Move): boolean {
  return position.board[move.to] !== null
    || (position.board[move.from]?.type === 'pawn' && move.to === position.enPassantTarget)
}

function isTactical(position: Position, move: Move): boolean {
  return isCapture(position, move) || move.promotion !== undefined
}

function captureValue(position: Position, move: Move): number {
  const victim = position.board[move.to]
  const captured = victim ? MATERIAL[victim.type] : isCapture(position, move) ? MATERIAL.pawn : 0
  const promotion = move.promotion ? MATERIAL[move.promotion] - MATERIAL.pawn : 0
  return captured + promotion - (captured ? MATERIAL[position.board[move.from]!.type] / 100 : 0)
}

function sameMove(a: Move, b: Move): boolean {
  return a.from === b.from && a.to === b.to && a.promotion === b.promotion
}

function orderValue(position: Position, move: Move, killers: readonly Move[], history: readonly number[]): number {
  if (isTactical(position, move)) return 2e9 + captureValue(position, move)
  if (killers.some((killer) => sameMove(killer, move))) return 1e9
  return history[move.from * 64 + move.to]
}

function ordered(position: Position, moves: Move[], killers: readonly Move[] = [], history?: readonly number[]): Move[] {
  return moves
    .map((move) => ({ move, value: history ? orderValue(position, move, killers, history) : captureValue(position, move) }))
    .sort((a, b) => b.value - a.value)
    .map(({ move }) => move)
}

function recordCutoff(search: Search, position: Position, move: Move, ply: number, depth: number): void {
  if (isTactical(position, move)) return
  const killers = search.killers[ply] ??= []
  if (!killers.some((killer) => sameMove(killer, move))) search.killers[ply] = [move, ...killers].slice(0, 2)
  search.history[move.from * 64 + move.to] += depth * depth
}

function mateScore(position: Position, depth: number, perspective: Color): number {
  return position.turn === perspective ? -MATE_SCORE - depth : MATE_SCORE + depth
}

function leafScore(position: Position, depth: number, perspective: Color): number {
  const status = getGameStatus(position)
  if (status.type === 'checkmate') return mateScore(position, depth, perspective)
  if (status.type !== 'playing') return 0
  return evaluate(position, perspective)
}

function minimax(
  position: Position,
  depth: number,
  ply: number,
  alpha: number,
  beta: number,
  search: Search,
): number {
  search.nodes += 1
  if (search.nodes % TIME_CHECK_INTERVAL === 0 && performance.now() > search.deadline) throw TIMEOUT

  const { perspective } = search
  if (depth <= 0 && !search.extendTactics) return leafScore(position, depth, perspective)
  if (getDrawStatus(position)) return 0

  const inCheck = isKingInCheck(position, position.turn)
  const quiescent = depth <= 0 && !inCheck
  const maximizing = position.turn === perspective
  let best = maximizing ? -Infinity : Infinity
  let moves = getCandidateMoves(position)

  if (quiescent) {
    best = evaluate(position, perspective)
    if (depth <= -QUIESCENCE_DEPTH) return best
    if (maximizing) alpha = Math.max(alpha, best)
    else beta = Math.min(beta, best)
    if (beta <= alpha) return best
    moves = moves.filter((move) => isTactical(position, move))
  }

  let legalMoves = 0
  for (const move of ordered(position, moves, search.killers[ply], search.history)) {
    const next = applyMoveUnchecked(position, move)
    if (isKingInCheck(next, position.turn)) continue
    legalMoves += 1

    const score = minimax(next, depth - 1, ply + 1, alpha, beta, search)
    if (maximizing) {
      best = Math.max(best, score)
      alpha = Math.max(alpha, best)
    } else {
      best = Math.min(best, score)
      beta = Math.min(beta, best)
    }
    if (beta <= alpha) {
      recordCutoff(search, position, move, ply, depth)
      break
    }
  }

  if (legalMoves === 0 && !quiescent) return inCheck ? mateScore(position, depth, perspective) : 0
  return best
}

function pickRandom<T>(candidates: readonly T[]): T {
  return candidates[Math.floor(Math.random() * candidates.length)]
}

function pickRookie(scored: ScoredMove[]): Move {
  const unfinished = scored.filter(({ next }) => getGameStatus(next).type === 'playing')
  const pool = unfinished.length > 0 ? unfinished : scored
  return pickRandom([...pool].sort((a, b) => a.score - b.score).slice(0, ROOKIE_CHOICES)).move
}

interface RootResult {
  best: number
  candidates: Move[]
  ranked: Move[]
}

function searchRoot(position: Position, moves: readonly Move[], depth: number, search: Search): RootResult {
  let best = -Infinity
  let candidates: Move[] = []
  const scores = new Map<Move, number>()
  for (const move of moves) {
    // Scores are integers. Keeping alpha below best makes tied scores exact.
    const score = minimax(applyMoveUnchecked(position, move), depth - 1, 1, best - 1, Infinity, search)
    scores.set(move, score)
    if (score > best) {
      best = score
      candidates = [move]
    } else if (score === best) {
      candidates.push(move)
    }
  }
  const ranked = [...moves].sort((a, b) => scores.get(b)! - scores.get(a)!)
  return { best, candidates, ranked }
}

function searchDeepening(position: Position, moves: Move[], depth: number, maxDepth: number, timeMs: number): Move {
  const start = performance.now()
  const search = createSearch(position.turn, true)
  let result = searchRoot(position, moves, depth, search)
  search.deadline = start + timeMs

  for (let next = depth + 1; next <= maxDepth; next += 1) {
    if (Math.abs(result.best) > MATE_SCORE / 2 || performance.now() - start > timeMs / 2) break
    try {
      result = searchRoot(position, result.ranked, next, search)
    } catch (error) {
      if (error !== TIMEOUT) throw error
      break
    }
  }

  return pickRandom(result.candidates)
}

export function findBestMove(
  position: Position,
  difficulty: SearchDifficulty = 'club',
  timeMs = MASTER_TIME_MS,
): Move | null {
  const moves = ordered(position, getAllLegalMoves(position))
  if (moves.length === 0) return null

  const depth = DEPTH[difficulty]
  if (difficulty === 'club') return searchDeepening(position, moves, depth, depth, 0)
  if (difficulty === 'master') return searchDeepening(position, moves, depth, MAX_DEPTH, timeMs)

  const search = createSearch(position.turn, false)
  const scored = moves.map((move) => {
    const next = applyMoveUnchecked(position, move)
    return { move, next, score: minimax(next, depth - 1, 1, -Infinity, Infinity, search) }
  })

  if (difficulty === 'rookie') return pickRookie(scored)

  const best = Math.max(...scored.map(({ score }) => score))
  return pickRandom(scored.filter(({ score }) => score >= best - CASUAL_SLACK)).move
}
