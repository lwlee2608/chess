import type { Board, Color, Move, Piece, Position, PromotionPiece } from './types'

const KNIGHT_STEPS = [
  [-2, -1], [-2, 1], [-1, -2], [-1, 2],
  [1, -2], [1, 2], [2, -1], [2, 1],
] as const

const KING_STEPS = [
  [-1, -1], [-1, 0], [-1, 1], [0, -1],
  [0, 1], [1, -1], [1, 0], [1, 1],
] as const

const ROOK_DIRECTIONS = [[-1, 0], [0, -1], [0, 1], [1, 0]] as const
const BISHOP_DIRECTIONS = [[-1, -1], [-1, 1], [1, -1], [1, 1]] as const
const PROMOTIONS: readonly PromotionPiece[] = ['queen', 'rook', 'bishop', 'knight']

function isOnBoard(rank: number, file: number): boolean {
  return rank >= 0 && rank < 8 && file >= 0 && file < 8
}

function canLand(piece: Piece, target: Piece | null): boolean {
  return target === null || (target.color !== piece.color && target.type !== 'king')
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
        if (target.color !== piece.color && target.type !== 'king') moves.push({ from, to })
        break
      }

      targetRank += rankDelta
      targetFile += fileDelta
    }
  }
}

function addPawnMove(moves: Move[], from: number, to: number): void {
  const targetRank = Math.floor(to / 8)
  if (targetRank === 0 || targetRank === 7) {
    for (const promotion of PROMOTIONS) moves.push({ from, to, promotion })
  } else {
    moves.push({ from, to })
  }
}

function addPawnMoves(position: Position, from: number, piece: Piece, moves: Move[]): void {
  const rank = Math.floor(from / 8)
  const file = from % 8
  const direction = piece.color === 'white' ? -1 : 1
  const startRank = piece.color === 'white' ? 6 : 1
  const oneRank = rank + direction
  const oneStep = oneRank * 8 + file

  if (isOnBoard(oneRank, file) && position.board[oneStep] === null) {
    addPawnMove(moves, from, oneStep)

    const twoStep = (rank + direction * 2) * 8 + file
    if (rank === startRank && position.board[twoStep] === null) moves.push({ from, to: twoStep })
  }

  for (const fileDelta of [-1, 1]) {
    const targetFile = file + fileDelta
    if (!isOnBoard(oneRank, targetFile)) continue

    const to = oneRank * 8 + targetFile
    const target = position.board[to]
    if ((target !== null && target.color !== piece.color && target.type !== 'king') || to === position.enPassantTarget) {
      addPawnMove(moves, from, to)
    }
  }
}

export function getPseudoLegalMoves(position: Position, from: number): Move[] {
  const piece = position.board[from]
  if (!piece) return []

  const moves: Move[] = []

  switch (piece.type) {
    case 'pawn':
      addPawnMoves(position, from, piece, moves)
      break
    case 'knight':
      addStepMoves(position.board, from, piece, KNIGHT_STEPS, moves)
      break
    case 'bishop':
      addSlidingMoves(position.board, from, piece, BISHOP_DIRECTIONS, moves)
      break
    case 'rook':
      addSlidingMoves(position.board, from, piece, ROOK_DIRECTIONS, moves)
      break
    case 'queen':
      addSlidingMoves(position.board, from, piece, [...ROOK_DIRECTIONS, ...BISHOP_DIRECTIONS], moves)
      break
    case 'king':
      addStepMoves(position.board, from, piece, KING_STEPS, moves)
      break
  }

  return moves
}

function hasStepAttack(
  board: Board,
  square: number,
  color: Color,
  type: 'king' | 'knight',
  steps: readonly (readonly [number, number])[],
): boolean {
  const rank = Math.floor(square / 8)
  const file = square % 8

  return steps.some(([rankDelta, fileDelta]) => {
    const sourceRank = rank + rankDelta
    const sourceFile = file + fileDelta
    if (!isOnBoard(sourceRank, sourceFile)) return false
    const piece = board[sourceRank * 8 + sourceFile]
    return piece?.color === color && piece.type === type
  })
}

function hasSlidingAttack(
  board: Board,
  square: number,
  color: Color,
  directions: readonly (readonly [number, number])[],
  types: readonly Piece['type'][],
): boolean {
  const rank = Math.floor(square / 8)
  const file = square % 8

  for (const [rankDelta, fileDelta] of directions) {
    let sourceRank = rank + rankDelta
    let sourceFile = file + fileDelta

    while (isOnBoard(sourceRank, sourceFile)) {
      const piece = board[sourceRank * 8 + sourceFile]
      if (piece) {
        if (piece.color === color && types.includes(piece.type)) return true
        break
      }
      sourceRank += rankDelta
      sourceFile += fileDelta
    }
  }

  return false
}

export function isSquareAttacked(board: Board, square: number, byColor: Color): boolean {
  const rank = Math.floor(square / 8)
  const file = square % 8
  const pawnSourceRank = rank + (byColor === 'white' ? 1 : -1)

  for (const fileDelta of [-1, 1]) {
    const pawnFile = file + fileDelta
    if (!isOnBoard(pawnSourceRank, pawnFile)) continue
    const pawn = board[pawnSourceRank * 8 + pawnFile]
    if (pawn?.color === byColor && pawn.type === 'pawn') return true
  }

  return hasStepAttack(board, square, byColor, 'knight', KNIGHT_STEPS)
    || hasStepAttack(board, square, byColor, 'king', KING_STEPS)
    || hasSlidingAttack(board, square, byColor, ROOK_DIRECTIONS, ['rook', 'queen'])
    || hasSlidingAttack(board, square, byColor, BISHOP_DIRECTIONS, ['bishop', 'queen'])
}

export function isKingInCheck(position: Position, color: Color): boolean {
  const kingSquare = position.board.findIndex((piece) => piece?.color === color && piece.type === 'king')
  return kingSquare >= 0 && isSquareAttacked(position.board, kingSquare, color === 'white' ? 'black' : 'white')
}
