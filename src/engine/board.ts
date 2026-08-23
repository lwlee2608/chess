import type { Board, Color, Piece, PieceType, Position } from './types'

const BACK_RANK: readonly PieceType[] = [
  'rook',
  'knight',
  'bishop',
  'queen',
  'king',
  'bishop',
  'knight',
  'rook',
]

function rank(color: Color, pieces: readonly PieceType[]): Piece[] {
  return pieces.map((type) => ({ color, type }))
}

export function createStartingBoard(): Board {
  return [
    ...rank('black', BACK_RANK),
    ...rank('black', Array<PieceType>(8).fill('pawn')),
    ...Array<null>(32).fill(null),
    ...rank('white', Array<PieceType>(8).fill('pawn')),
    ...rank('white', BACK_RANK),
  ]
}

export function createStartingPosition(): Position {
  return {
    board: createStartingBoard(),
    turn: 'white',
    castling: {
      whiteKingSide: true,
      whiteQueenSide: true,
      blackKingSide: true,
      blackQueenSide: true,
    },
    enPassantTarget: null,
    halfmoveClock: 0,
    positionHistory: [],
  }
}
