import { describe, expect, it } from 'vitest'
import type { CastlingRights, Piece, Position } from '../engine/types'
import { squareToIndex } from '../engine/types'
import { findBestMove } from './search'

const noCastling: CastlingRights = {
  whiteKingSide: false,
  whiteQueenSide: false,
  blackKingSide: false,
  blackQueenSide: false,
}

function positionWith(entries: Record<string, Piece>, turn: Position['turn']): Position {
  const board = Array<Piece | null>(64).fill(null)
  for (const [square, piece] of Object.entries(entries)) board[squareToIndex(square)] = piece
  return { board, turn, castling: noCastling, enPassantTarget: null, halfmoveClock: 0, positionHistory: [] }
}

describe('findBestMove', () => {
  it('captures a hanging queen at depth three', () => {
    const position = positionWith({
      a1: { color: 'white', type: 'king' },
      d4: { color: 'white', type: 'queen' },
      h8: { color: 'black', type: 'king' },
      d8: { color: 'black', type: 'rook' },
    }, 'black')
    expect(findBestMove(position, 3)).toMatchObject({
      from: squareToIndex('d8'),
      to: squareToIndex('d4'),
    })
  })
})
