import { describe, expect, it } from 'vitest'
import { createStartingPosition } from '../engine/board'
import type { Color, Piece, PieceType } from '../engine/types'
import { squareToIndex } from '../engine/types'
import { evaluate } from './evaluate'

const MIDDLEGAME: Record<string, Piece> = {
  a4: { color: 'white', type: 'queen' },
  b4: { color: 'white', type: 'rook' },
  c4: { color: 'white', type: 'rook' },
  a5: { color: 'black', type: 'queen' },
  b5: { color: 'black', type: 'rook' },
  c5: { color: 'black', type: 'rook' },
}

function pieceScore(color: Color, type: PieceType, square: string, others: Record<string, Piece> = {}): number {
  const position = createStartingPosition()
  const board = Array<Piece | null>(64).fill(null)
  for (const [other, piece] of Object.entries(others)) board[squareToIndex(other)] = piece
  board[squareToIndex(square)] = { color, type }
  return evaluate({ ...position, board }, color)
}

describe('piece-square evaluation', () => {
  it.each([
    ['white', 'g1', 'g8', 'e1', 'd7', 'd2'],
    ['black', 'g8', 'g1', 'e8', 'd2', 'd7'],
  ] as const)('rewards safe kings and seventh-rank rooks for %s', (color, home, enemy, center, seventh, second) => {
    const king = (square: string) => pieceScore(color, 'king', square, MIDDLEGAME)
    expect(king(home)).toBeGreaterThan(king(enemy))
    expect(king(home)).toBeGreaterThan(king(center))
    expect(pieceScore(color, 'rook', seventh)).toBeGreaterThan(pieceScore(color, 'rook', second))
  })

  it.each([
    ['white', 'e4', 'g1'],
    ['black', 'e5', 'g8'],
  ] as const)('centralizes the %s king in the endgame', (color, center, home) => {
    expect(pieceScore(color, 'king', center)).toBeGreaterThan(pieceScore(color, 'king', home))
  })
})
