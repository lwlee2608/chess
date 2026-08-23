import type { Move, Position } from './types'
import { opposite } from './types'

export function applyMove(position: Position, move: Move): Position {
  const piece = position.board[move.from]

  if (!piece || piece.color !== position.turn) {
    return position
  }

  const board = [...position.board]
  board[move.to] = piece
  board[move.from] = null

  return {
    board,
    turn: opposite(position.turn),
  }
}
