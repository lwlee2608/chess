import { describe, expect, it } from 'vitest'
import { createStartingPosition } from '../engine/board'
import type { Color, PieceType } from '../engine/types'
import { squareToIndex } from '../engine/types'
import { evaluate } from './evaluate'

function pieceScore(color: Color, type: PieceType, square: string): number {
  const position = createStartingPosition()
  const board = Array(64).fill(null)
  board[squareToIndex(square)] = { color, type }
  return evaluate({ ...position, board }, color)
}

describe('piece-square evaluation', () => {
  it.each([
    ['white', 'g1', 'g8', 'e1', 'd7', 'd2'],
    ['black', 'g8', 'g1', 'e8', 'd2', 'd7'],
  ] as const)('rewards safe kings and seventh-rank rooks for %s', (color, home, enemy, center, seventh, second) => {
    expect(pieceScore(color, 'king', home)).toBeGreaterThan(pieceScore(color, 'king', enemy))
    expect(pieceScore(color, 'king', home)).toBeGreaterThan(pieceScore(color, 'king', center))
    expect(pieceScore(color, 'rook', seventh)).toBeGreaterThan(pieceScore(color, 'rook', second))
  })
})
