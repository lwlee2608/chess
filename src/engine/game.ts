import { getPseudoLegalMoves, isKingInCheck, isSquareAttacked } from './moves'
import type { Board, CastlingRights, Color, GameStatus, Move, Piece, Position } from './types'
import { opposite } from './types'

const ROOK_RIGHT_BY_SQUARE = {
  0: 'blackQueenSide',
  7: 'blackKingSide',
  56: 'whiteQueenSide',
  63: 'whiteKingSide',
} as const

function disableRookRight(castling: CastlingRights, square: number): void {
  const right = ROOK_RIGHT_BY_SQUARE[square as keyof typeof ROOK_RIGHT_BY_SQUARE]
  if (right) castling[right] = false
}

export function castlingRookSquare(position: Position, move: Move): number | null {
  if (position.board[move.from]?.type !== 'king' || Math.abs(move.to - move.from) !== 2) return null
  return move.to > move.from ? move.from + 3 : move.from - 4
}

// Skips legality checks: search applies pseudo-legal moves and rejects results that leave the king in check.
export function applyMoveUnchecked(position: Position, move: Move, trackHistory = true): Position {
  const piece = position.board[move.from]
  if (!piece) return position

  const capturedPiece = position.board[move.to]
  const board = [...position.board]
  board[move.from] = null

  const isEnPassant = piece.type === 'pawn' && move.to === position.enPassantTarget && capturedPiece === null
  if (isEnPassant) board[move.to + (piece.color === 'white' ? 8 : -8)] = null

  const rookFrom = castlingRookSquare(position, move)
  if (rookFrom !== null) {
    const rookTo = (move.from + move.to) / 2
    board[rookTo] = board[rookFrom]
    board[rookFrom] = null
  }

  board[move.to] = move.promotion ? { color: piece.color, type: move.promotion } : piece

  const castling = { ...position.castling }
  if (piece.type === 'king') {
    if (piece.color === 'white') {
      castling.whiteKingSide = false
      castling.whiteQueenSide = false
    } else {
      castling.blackKingSide = false
      castling.blackQueenSide = false
    }
  }
  if (piece.type === 'rook') disableRookRight(castling, move.from)
  if (capturedPiece?.type === 'rook') disableRookRight(castling, move.to)

  const isPawnDoubleMove = piece.type === 'pawn' && Math.abs(move.to - move.from) === 16
  const isIrreversible = piece.type === 'pawn' || capturedPiece !== null
  const next: Position = {
    board,
    turn: opposite(position.turn),
    castling,
    enPassantTarget: isPawnDoubleMove ? (move.from + move.to) / 2 : null,
    halfmoveClock: isIrreversible ? 0 : position.halfmoveClock + 1,
    positionHistory: !trackHistory
      ? position.positionHistory
      : isIrreversible ? [] : [...position.positionHistory, positionKey(position)],
  }

  return next
}

function addCastlingMoves(position: Position, from: number, moves: Move[]): void {
  const piece = position.board[from]
  if (!piece || piece.type !== 'king' || isKingInCheck(position, piece.color)) return

  const enemy = opposite(piece.color)
  const home = piece.color === 'white' ? 60 : 4
  if (from !== home) return

  const kingSideRight = piece.color === 'white' ? position.castling.whiteKingSide : position.castling.blackKingSide
  const queenSideRight = piece.color === 'white' ? position.castling.whiteQueenSide : position.castling.blackQueenSide

  if (
    kingSideRight
    && position.board[home + 1] === null
    && position.board[home + 2] === null
    && position.board[home + 3]?.type === 'rook'
    && position.board[home + 3]?.color === piece.color
    && !isSquareAttacked(position.board, home + 1, enemy)
    && !isSquareAttacked(position.board, home + 2, enemy)
  ) {
    moves.push({ from, to: home + 2 })
  }

  if (
    queenSideRight
    && position.board[home - 1] === null
    && position.board[home - 2] === null
    && position.board[home - 3] === null
    && position.board[home - 4]?.type === 'rook'
    && position.board[home - 4]?.color === piece.color
    && !isSquareAttacked(position.board, home - 1, enemy)
    && !isSquareAttacked(position.board, home - 2, enemy)
  ) {
    moves.push({ from, to: home - 2 })
  }
}

function getCandidateMovesFrom(position: Position, from: number): Move[] {
  if (position.board[from]?.color !== position.turn) return []
  const candidates = getPseudoLegalMoves(position, from)
  addCastlingMoves(position, from, candidates)
  return candidates
}

function isLegalAfter(position: Position, next: Position): boolean {
  return !isKingInCheck(next, position.turn)
}

export function getLegalMoves(position: Position, from: number): Move[] {
  return getCandidateMovesFrom(position, from)
    .filter((move) => isLegalAfter(position, applyMoveUnchecked(position, move, false)))
}

export function getCandidateMoves(position: Position): Move[] {
  const moves: Move[] = []
  for (let from = 0; from < 64; from += 1) moves.push(...getCandidateMovesFrom(position, from))
  return moves
}

export function getAllLegalMoves(position: Position): Move[] {
  return getCandidateMoves(position)
    .filter((move) => isLegalAfter(position, applyMoveUnchecked(position, move, false)))
}

export function applyMove(position: Position, move: Move): Position {
  const legal = getLegalMoves(position, move.from).some(
    (candidate) => candidate.to === move.to && candidate.promotion === move.promotion,
  )
  return legal ? applyMoveUnchecked(position, move) : position
}

const PIECE_CODES = { king: 'k', queen: 'q', rook: 'r', bishop: 'b', knight: 'n', pawn: 'p' } as const

function pieceCode(piece: Piece | null): string {
  if (!piece) return '.'
  const code = PIECE_CODES[piece.type]
  return piece.color === 'white' ? code.toUpperCase() : code
}

function hasEffectiveEnPassant(position: Position): boolean {
  const target = position.enPassantTarget
  if (target === null) return false

  const targetFile = target % 8
  const sourceRank = Math.floor(target / 8) + (position.turn === 'white' ? 1 : -1)
  for (const fileDelta of [-1, 1]) {
    const sourceFile = targetFile + fileDelta
    if (sourceFile < 0 || sourceFile > 7 || sourceRank < 0 || sourceRank > 7) continue
    const from = sourceRank * 8 + sourceFile
    const pawn = position.board[from]
    if (pawn?.color !== position.turn || pawn.type !== 'pawn') continue
    const candidate = { from, to: target }
    if (!isKingInCheck(applyMoveUnchecked(position, candidate, false), position.turn)) return true
  }
  return false
}

export function positionKey(position: Position): string {
  const rights = [
    position.castling.whiteKingSide ? 'K' : '',
    position.castling.whiteQueenSide ? 'Q' : '',
    position.castling.blackKingSide ? 'k' : '',
    position.castling.blackQueenSide ? 'q' : '',
  ].join('') || '-'
  const enPassant = hasEffectiveEnPassant(position) ? String(position.enPassantTarget) : '-'
  let board = ''
  for (const piece of position.board) board += pieceCode(piece)
  return `${board} ${position.turn} ${rights} ${enPassant}`
}

export function hasInsufficientMaterial(board: Board): boolean {
  const minors: number[] = []
  let hasKnight = false
  for (let square = 0; square < 64; square += 1) {
    const piece = board[square]
    if (!piece || piece.type === 'king') continue
    if (piece.type !== 'bishop' && piece.type !== 'knight') return false
    if (piece.type === 'knight') hasKnight = true
    minors.push(square)
  }

  if (minors.length <= 1) return true
  if (hasKnight) return false

  const squareColor = (square: number) => (Math.floor(square / 8) + square % 8) % 2
  return minors.every((square) => squareColor(square) === squareColor(minors[0]))
}

export function hasMatingMaterial(board: Board, color: Color): boolean {
  const pieces = board.filter((piece) => piece?.color === color && piece.type !== 'king') as Piece[]
  if (pieces.some((piece) => piece.type === 'pawn' || piece.type === 'rook' || piece.type === 'queen')) return true
  const bishops = pieces.filter((piece) => piece.type === 'bishop').length
  const knights = pieces.filter((piece) => piece.type === 'knight').length
  return bishops >= 2 || (bishops >= 1 && knights >= 1) || knights >= 2
}

export function getGameStatus(position: Position): GameStatus {
  const legalMoves = getAllLegalMoves(position)
  if (legalMoves.length === 0) {
    return isKingInCheck(position, position.turn)
      ? { type: 'checkmate', winner: opposite(position.turn) }
      : { type: 'stalemate' }
  }

  return getDrawStatus(position) ?? { type: 'playing' }
}

export function getDrawStatus(position: Position): GameStatus | null {
  if (position.halfmoveClock >= 100) return { type: 'draw', reason: 'fifty-move rule' }
  if (isThreefoldRepetition(position)) return { type: 'draw', reason: 'threefold repetition' }
  if (hasInsufficientMaterial(position.board)) return { type: 'draw', reason: 'insufficient material' }
  return null
}

function isThreefoldRepetition(position: Position): boolean {
  if (position.positionHistory.length < 8) return false
  const key = positionKey(position)
  return position.positionHistory.filter((entry) => entry === key).length >= 2
}
