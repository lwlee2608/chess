import { describe, expect, it } from 'vitest'
import type { CastlingRights, Piece, Position } from '../engine/types'
import { squareToIndex } from '../engine/types'
import { applyMove, getGameStatus } from '../engine/game'
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
  it('captures a hanging queen at club level', () => {
    const position = positionWith({
      a1: { color: 'white', type: 'king' },
      d4: { color: 'white', type: 'queen' },
      h8: { color: 'black', type: 'king' },
      d8: { color: 'black', type: 'rook' },
    }, 'black')
    expect(findBestMove(position, 'club')).toMatchObject({
      from: squareToIndex('d8'),
      to: squareToIndex('d4'),
    })
  })

  it('never finishes the game at rookie level while quiet moves remain', () => {
    const position = positionWith({
      a1: { color: 'white', type: 'king' },
      h7: { color: 'white', type: 'queen' },
      g1: { color: 'white', type: 'rook' },
      a8: { color: 'black', type: 'king' },
    }, 'white')
    for (let attempt = 0; attempt < 40; attempt += 1) {
      const move = findBestMove(position, 'rookie')!
      expect(getGameStatus(applyMove(position, move)).type).toBe('playing')
    }
  })
})
