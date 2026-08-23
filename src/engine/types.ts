export type Color = 'white' | 'black'

export type PieceType = 'king' | 'queen' | 'rook' | 'bishop' | 'knight' | 'pawn'

export interface Piece {
  color: Color
  type: PieceType
}

export type Board = readonly (Piece | null)[]

export interface Position {
  board: Board
  turn: Color
}

export interface Move {
  from: number
  to: number
}

export const FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'] as const

export function squareToIndex(square: string): number {
  const file = FILES.indexOf(square[0] as (typeof FILES)[number])
  const rank = Number(square[1])

  if (file < 0 || rank < 1 || rank > 8) {
    throw new Error(`Invalid square: ${square}`)
  }

  return (8 - rank) * 8 + file
}

export function indexToSquare(index: number): string {
  if (index < 0 || index > 63) {
    throw new Error(`Invalid square index: ${index}`)
  }

  return `${FILES[index % 8]}${8 - Math.floor(index / 8)}`
}

export function opposite(color: Color): Color {
  return color === 'white' ? 'black' : 'white'
}
