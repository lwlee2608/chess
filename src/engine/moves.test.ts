import { describe, expect, it } from 'vitest'
import { createStartingPosition } from './board'
import { getPseudoLegalMoves, isSquareAttacked } from './moves'
import { squareToIndex } from './types'
import type { CastlingRights, Piece, Position } from './types'

const noCastling: CastlingRights = {
  whiteKingSide: false,
  whiteQueenSide: false,
  blackKingSide: false,
  blackQueenSide: false,
}

function positionWith(entries: Record<string, Piece>): Position {
  const board = Array<Piece | null>(64).fill(null)
  for (const [square, piece] of Object.entries(entries)) board[squareToIndex(square)] = piece
  return { board, turn: 'white', castling: noCastling, enPassantTarget: null, halfmoveClock: 0, positionHistory: [] }
}

describe('getPseudoLegalMoves', () => {
  it('gives each starting pawn one- and two-square advances', () => {
    const position = createStartingPosition()
    expect(getPseudoLegalMoves(position, squareToIndex('e2')).map((move) => move.to)).toEqual([
      squareToIndex('e3'), squareToIndex('e4'),
    ])
  })

  it('gives a starting knight both open targets', () => {
    const position = createStartingPosition()
    expect(getPseudoLegalMoves(position, squareToIndex('g1')).map((move) => move.to).sort()).toEqual(
      [squareToIndex('f3'), squareToIndex('h3')].sort(),
    )
  })

  it('slides until a blocker and includes an enemy capture', () => {
    const position = positionWith({
      d4: { color: 'white', type: 'queen' },
      d6: { color: 'white', type: 'pawn' },
      f4: { color: 'black', type: 'rook' },
    })
    const targets = getPseudoLegalMoves(position, squareToIndex('d4')).map((move) => move.to)
    expect(targets).toContain(squareToIndex('d5'))
    expect(targets).not.toContain(squareToIndex('d6'))
    expect(targets).toContain(squareToIndex('f4'))
    expect(targets).not.toContain(squareToIndex('g4'))
  })

  it('detects pawn and sliding attacks', () => {
    const position = positionWith({
      d4: { color: 'white', type: 'pawn' },
      h5: { color: 'black', type: 'bishop' },
    })
    expect(isSquareAttacked(position.board, squareToIndex('c5'), 'white')).toBe(true)
    expect(isSquareAttacked(position.board, squareToIndex('e2'), 'black')).toBe(true)
  })
})
