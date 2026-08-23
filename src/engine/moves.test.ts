import { describe, expect, it } from 'vitest'
import { createStartingBoard } from './board'
import { getPseudoLegalMoves } from './moves'
import { squareToIndex } from './types'
import type { Board, Piece } from './types'

function boardWith(entries: Record<string, Piece>): Board {
  const board = Array<Piece | null>(64).fill(null)
  for (const [square, piece] of Object.entries(entries)) board[squareToIndex(square)] = piece
  return board
}

describe('getPseudoLegalMoves', () => {
  it('gives each starting pawn one- and two-square advances', () => {
    const board = createStartingBoard()
    expect(getPseudoLegalMoves(board, squareToIndex('e2')).map((move) => move.to)).toEqual([
      squareToIndex('e3'),
      squareToIndex('e4'),
    ])
  })

  it('gives a starting knight both open targets', () => {
    const board = createStartingBoard()
    expect(getPseudoLegalMoves(board, squareToIndex('g1')).map((move) => move.to).sort()).toEqual(
      [squareToIndex('f3'), squareToIndex('h3')].sort(),
    )
  })

  it('slides until a blocker and includes an enemy capture', () => {
    const board = boardWith({
      d4: { color: 'white', type: 'queen' },
      d6: { color: 'white', type: 'pawn' },
      f4: { color: 'black', type: 'rook' },
    })
    const targets = getPseudoLegalMoves(board, squareToIndex('d4')).map((move) => move.to)

    expect(targets).toContain(squareToIndex('d5'))
    expect(targets).not.toContain(squareToIndex('d6'))
    expect(targets).toContain(squareToIndex('f4'))
    expect(targets).not.toContain(squareToIndex('g4'))
  })

  it('allows pawn captures but not diagonal advances', () => {
    const board = boardWith({
      e4: { color: 'white', type: 'pawn' },
      d5: { color: 'black', type: 'bishop' },
    })
    const targets = getPseudoLegalMoves(board, squareToIndex('e4')).map((move) => move.to)

    expect(targets).toContain(squareToIndex('e5'))
    expect(targets).toContain(squareToIndex('d5'))
    expect(targets).not.toContain(squareToIndex('f5'))
  })
})
