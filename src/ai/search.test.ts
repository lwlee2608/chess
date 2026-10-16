import { describe, expect, it, vi } from 'vitest'
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
  it.each(['club', 'master'] as const)('captures a hanging queen at %s level', (difficulty) => {
    const position = positionWith({
      a1: { color: 'white', type: 'king' },
      d4: { color: 'white', type: 'queen' },
      h8: { color: 'black', type: 'king' },
      d8: { color: 'black', type: 'rook' },
    }, 'black')
    expect(findBestMove(position, difficulty, 0)).toMatchObject({
      from: squareToIndex('d8'),
      to: squareToIndex('d4'),
    })
  })

  it.each(['club', 'master'] as const)('chooses only among exactly tied best moves at %s level', (difficulty) => {
    const position = positionWith({
      e4: { color: 'white', type: 'king' },
      c6: { color: 'white', type: 'knight' },
      e5: { color: 'black', type: 'queen' },
      h8: { color: 'black', type: 'king' },
    }, 'white')
    const random = vi.spyOn(Math, 'random')
    try {
      const picks = [0, 0.999999].map((value) => {
        random.mockReturnValue(value)
        return findBestMove(position, difficulty, 0)!
      })
      expect(picks.every((move) => move.to === squareToIndex('e5'))).toBe(true)
      expect(new Set(picks.map((move) => move.from))).toEqual(new Set([squareToIndex('e4'), squareToIndex('c6')]))
    } finally {
      random.mockRestore()
    }
  })

  it('resolves the pawn exchange beyond the Master horizon', () => {
    const position = positionWith({
      g1: { color: 'white', type: 'king' },
      d1: { color: 'white', type: 'rook' },
      d2: { color: 'white', type: 'rook' },
      d4: { color: 'white', type: 'pawn' },
      g8: { color: 'black', type: 'king' },
      d8: { color: 'black', type: 'queen' },
      e5: { color: 'black', type: 'pawn' },
    }, 'white')
    expect(findBestMove(position, 'master', 0)).toMatchObject({
      from: squareToIndex('d4'),
      to: squareToIndex('e5'),
    })
  })

  it('finds checkmate at Master level', () => {
    const position = positionWith({
      f6: { color: 'white', type: 'king' },
      g6: { color: 'white', type: 'queen' },
      h8: { color: 'black', type: 'king' },
    }, 'white')
    const move = findBestMove(position, 'master', 0)!
    expect(getGameStatus(applyMove(position, move))).toEqual({ type: 'checkmate', winner: 'white' })
  })

  it.each(['casual', 'club', 'master'] as const)('prefers checkmate over the fifty-move draw at %s level', (difficulty) => {
    const position = {
      ...positionWith({
        f6: { color: 'white', type: 'king' },
        g6: { color: 'white', type: 'queen' },
        h8: { color: 'black', type: 'king' },
      }, 'white'),
      halfmoveClock: 99,
    }
    const move = findBestMove(position, difficulty, 0)!
    expect(getGameStatus(applyMove(position, move))).toEqual({ type: 'checkmate', winner: 'white' })
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
