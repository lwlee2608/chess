import { useMemo, useState } from 'react'
import { createStartingPosition } from '../engine/board'
import { applyMove, getGameStatus, getLegalMoves } from '../engine/game'
import type { Move, PromotionPiece } from '../engine/types'

export function useGame() {
  const [position, setPosition] = useState(createStartingPosition)
  const [selectedSquare, setSelectedSquare] = useState<number | null>(null)
  const [pendingPromotion, setPendingPromotion] = useState<Move[] | null>(null)

  const legalMoves = useMemo(() => {
    if (selectedSquare === null) return []
    return getLegalMoves(position, selectedSquare)
  }, [position, selectedSquare])
  const status = useMemo(() => getGameStatus(position), [position])

  const selectSquare = (square: number) => {
    if (status.type !== 'playing') return
    const piece = position.board[square]
    if (piece?.color === position.turn) setSelectedSquare(square)
  }

  const moveTo = (target: number): boolean => {
    const candidates = legalMoves.filter(({ to }) => to === target)
    if (candidates.length === 0) return false
    if (candidates.length > 1 && candidates.every((move) => move.promotion)) {
      setPendingPromotion(candidates)
      return true
    }

    setPosition((current) => applyMove(current, candidates[0]))
    setSelectedSquare(null)
    return true
  }

  const chooseSquare = (square: number) => {
    if (status.type !== 'playing') return
    if (selectedSquare === square) {
      setSelectedSquare(null)
      return
    }
    if (moveTo(square)) return

    const piece = position.board[square]
    setSelectedSquare(piece?.color === position.turn ? square : null)
  }

  const promote = (promotion: PromotionPiece) => {
    const move = pendingPromotion?.find((candidate) => candidate.promotion === promotion)
    if (!move) return
    setPosition((current) => applyMove(current, move))
    setPendingPromotion(null)
    setSelectedSquare(null)
  }

  const startNewGame = () => {
    setPosition(createStartingPosition())
    setSelectedSquare(null)
    setPendingPromotion(null)
  }

  const playMove = (move: Move) => {
    setPosition((current) => applyMove(current, move))
    setSelectedSquare(null)
  }

  return {
    position,
    selectedSquare,
    legalMoves,
    status,
    pendingPromotion,
    chooseSquare,
    selectSquare,
    moveTo,
    promote,
    startNewGame,
    playMove,
  }
}
