import { describe, expect, it } from 'vitest'
import { createStartingPosition } from './board'
import { applyMove, castlingRookSquare, getGameStatus, getLegalMoves, hasInsufficientMaterial } from './game'
import type { CastlingRights, Piece, Position, PromotionPiece } from './types'
import { squareToIndex } from './types'

const noCastling: CastlingRights = {
  whiteKingSide: false,
  whiteQueenSide: false,
  blackKingSide: false,
  blackQueenSide: false,
}

function positionWith(entries: Record<string, Piece>, turn: Position['turn'] = 'white'): Position {
  const board = Array<Piece | null>(64).fill(null)
  for (const [square, piece] of Object.entries(entries)) board[squareToIndex(square)] = piece
  return { board, turn, castling: noCastling, enPassantTarget: null, halfmoveClock: 0, positionHistory: [] }
}

function play(position: Position, from: string, to: string, promotion?: PromotionPiece): Position {
  return applyMove(position, { from: squareToIndex(from), to: squareToIndex(to), promotion })
}

describe('complete chess rules', () => {
  it('detects Fool’s Mate', () => {
    let position = createStartingPosition()
    position = play(position, 'f2', 'f3')
    position = play(position, 'e7', 'e5')
    position = play(position, 'g2', 'g4')
    position = play(position, 'd8', 'h4')

    expect(getGameStatus(position)).toEqual({ type: 'checkmate', winner: 'black' })
  })

  it('rejects moves that expose the king', () => {
    const position = positionWith({
      e1: { color: 'white', type: 'king' },
      e2: { color: 'white', type: 'rook' },
      e8: { color: 'black', type: 'rook' },
      a8: { color: 'black', type: 'king' },
    })
    expect(getLegalMoves(position, squareToIndex('e2')).map((move) => move.to)).not.toContain(squareToIndex('d2'))
  })

  it('moves the rook while castling', () => {
    const position = positionWith({
      e1: { color: 'white', type: 'king' },
      h1: { color: 'white', type: 'rook' },
      e8: { color: 'black', type: 'king' },
    })
    position.castling.whiteKingSide = true
    const castled = play(position, 'e1', 'g1')
    expect(castled.board[squareToIndex('g1')]).toEqual({ color: 'white', type: 'king' })
    expect(castled.board[squareToIndex('f1')]).toEqual({ color: 'white', type: 'rook' })
  })

  it('castles queen side and maps the rook square to the castling move', () => {
    const position = positionWith({
      e1: { color: 'white', type: 'king' },
      a1: { color: 'white', type: 'rook' },
      e8: { color: 'black', type: 'king' },
    })
    position.castling.whiteQueenSide = true
    const castle = getLegalMoves(position, squareToIndex('e1')).find((move) => move.to === squareToIndex('c1'))
    expect(castle && castlingRookSquare(position, castle)).toBe(squareToIndex('a1'))
    const castled = play(position, 'e1', 'c1')
    expect(castled.board[squareToIndex('c1')]).toEqual({ color: 'white', type: 'king' })
    expect(castled.board[squareToIndex('d1')]).toEqual({ color: 'white', type: 'rook' })
    expect(castled.board[squareToIndex('a1')]).toBeNull()
  })

  it('captures en passant', () => {
    let position = positionWith({
      e1: { color: 'white', type: 'king' },
      e5: { color: 'white', type: 'pawn' },
      d7: { color: 'black', type: 'pawn' },
      e8: { color: 'black', type: 'king' },
    }, 'black')
    position = play(position, 'd7', 'd5')
    position = play(position, 'e5', 'd6')
    expect(position.board[squareToIndex('d6')]).toEqual({ color: 'white', type: 'pawn' })
    expect(position.board[squareToIndex('d5')]).toBeNull()
  })

  it('promotes to the chosen piece', () => {
    const position = positionWith({
      e1: { color: 'white', type: 'king' },
      a7: { color: 'white', type: 'pawn' },
      e8: { color: 'black', type: 'king' },
    })
    expect(play(position, 'a7', 'a8', 'knight').board[squareToIndex('a8')]).toEqual({
      color: 'white',
      type: 'knight',
    })
  })

  it('recognizes material that cannot produce mate', () => {
    const board = positionWith({
      e1: { color: 'white', type: 'king' },
      c1: { color: 'white', type: 'bishop' },
      e8: { color: 'black', type: 'king' },
      f8: { color: 'black', type: 'bishop' },
    }).board
    expect(hasInsufficientMaterial(board)).toBe(true)
  })
})
