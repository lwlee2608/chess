import { useMemo, useState } from 'react'
import { createStartingPosition } from '../engine/board'
import { applyMove } from '../engine/game'
import { getPseudoLegalMoves } from '../engine/moves'
import type { Move } from '../engine/types'

export function useGame() {
  const [position, setPosition] = useState(createStartingPosition)
  const [selectedSquare, setSelectedSquare] = useState<number | null>(null)

  const legalMoves = useMemo(() => {
    if (selectedSquare === null) return []
    return getPseudoLegalMoves(position.board, selectedSquare)
  }, [position.board, selectedSquare])

  const selectSquare = (square: number) => {
    const piece = position.board[square]
    if (piece?.color === position.turn) setSelectedSquare(square)
  }

  const moveTo = (target: number): boolean => {
    const move = legalMoves.find(({ to }) => to === target)
    if (!move) return false

    setPosition((current) => applyMove(current, move))
    setSelectedSquare(null)
    return true
  }

  const chooseSquare = (square: number) => {
    if (selectedSquare === square) {
      setSelectedSquare(null)
      return
    }

    if (moveTo(square)) return

    const piece = position.board[square]
    setSelectedSquare(piece?.color === position.turn ? square : null)
  }

  const playMove = (move: Move) => {
    setPosition((current) => applyMove(current, move))
    setSelectedSquare(null)
  }

  return {
    position,
    selectedSquare,
    legalMoves,
    chooseSquare,
    selectSquare,
    moveTo,
    playMove,
  }
}
