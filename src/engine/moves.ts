import type { Board, Move, Piece } from './types'

const KNIGHT_STEPS = [
  [-2, -1],
  [-2, 1],
  [-1, -2],
  [-1, 2],
  [1, -2],
  [1, 2],
  [2, -1],
  [2, 1],
] as const

const KING_STEPS = [
  [-1, -1],
  [-1, 0],
  [-1, 1],
  [0, -1],
  [0, 1],
  [1, -1],
  [1, 0],
  [1, 1],
] as const

const ROOK_DIRECTIONS = [
  [-1, 0],
  [0, -1],
  [0, 1],
  [1, 0],
] as const

const BISHOP_DIRECTIONS = [
  [-1, -1],
  [-1, 1],
  [1, -1],
  [1, 1],
] as const

function isOnBoard(rank: number, file: number): boolean {
  return rank >= 0 && rank < 8 && file >= 0 && file < 8
}

function canLand(piece: Piece, target: Piece | null): boolean {
  return target === null || target.color !== piece.color
}

function addStepMoves(
  board: Board,
  from: number,
  piece: Piece,
  steps: readonly (readonly [number, number])[],
  moves: Move[],
): void {
  const rank = Math.floor(from / 8)
  const file = from % 8

  for (const [rankDelta, fileDelta] of steps) {
    const targetRank = rank + rankDelta
    const targetFile = file + fileDelta

    if (!isOnBoard(targetRank, targetFile)) continue

    const to = targetRank * 8 + targetFile
    if (canLand(piece, board[to])) moves.push({ from, to })
  }
}

function addSlidingMoves(
  board: Board,
  from: number,
  piece: Piece,
  directions: readonly (readonly [number, number])[],
  moves: Move[],
): void {
  const rank = Math.floor(from / 8)
  const file = from % 8

  for (const [rankDelta, fileDelta] of directions) {
    let targetRank = rank + rankDelta
    let targetFile = file + fileDelta

    while (isOnBoard(targetRank, targetFile)) {
      const to = targetRank * 8 + targetFile
      const target = board[to]

      if (target === null) {
        moves.push({ from, to })
      } else {
        if (target.color !== piece.color) moves.push({ from, to })
        break
      }

      targetRank += rankDelta
      targetFile += fileDelta
    }
  }
}

function addPawnMoves(board: Board, from: number, piece: Piece, moves: Move[]): void {
  const rank = Math.floor(from / 8)
  const file = from % 8
  const direction = piece.color === 'white' ? -1 : 1
  const startRank = piece.color === 'white' ? 6 : 1
  const oneRank = rank + direction
  const oneStep = oneRank * 8 + file

  if (isOnBoard(oneRank, file) && board[oneStep] === null) {
    moves.push({ from, to: oneStep })

    const twoRank = rank + direction * 2
    const twoStep = twoRank * 8 + file
    if (rank === startRank && board[twoStep] === null) moves.push({ from, to: twoStep })
  }

  for (const fileDelta of [-1, 1]) {
    const targetFile = file + fileDelta
    if (!isOnBoard(oneRank, targetFile)) continue

    const to = oneRank * 8 + targetFile
    const target = board[to]
    if (target !== null && target.color !== piece.color) moves.push({ from, to })
  }
}

export function getPseudoLegalMoves(board: Board, from: number): Move[] {
  const piece = board[from]
  if (!piece) return []

  const moves: Move[] = []

  switch (piece.type) {
    case 'pawn':
      addPawnMoves(board, from, piece, moves)
      break
    case 'knight':
      addStepMoves(board, from, piece, KNIGHT_STEPS, moves)
      break
    case 'bishop':
      addSlidingMoves(board, from, piece, BISHOP_DIRECTIONS, moves)
      break
    case 'rook':
      addSlidingMoves(board, from, piece, ROOK_DIRECTIONS, moves)
      break
    case 'queen':
      addSlidingMoves(board, from, piece, [...ROOK_DIRECTIONS, ...BISHOP_DIRECTIONS], moves)
      break
    case 'king':
      addStepMoves(board, from, piece, KING_STEPS, moves)
      break
  }

  return moves
}
