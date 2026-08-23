import { useEffect, useMemo, useRef, useState } from 'react'
import { createStartingPosition } from '../engine/board'
import { applyMove, getGameStatus, getLegalMoves } from '../engine/game'
import type { Color, Move, PromotionPiece } from '../engine/types'
import type { GameMode } from '../ui/NewGameDialog'

export function useGame() {
  const [position, setPosition] = useState(createStartingPosition)
  const [selectedSquare, setSelectedSquare] = useState<number | null>(null)
  const [pendingPromotion, setPendingPromotion] = useState<Move[] | null>(null)
  const [mode, setMode] = useState<GameMode | null>(null)
  const workerRef = useRef<Worker | null>(null)

  const humanColor: Color | null = mode === 'ai-white' ? 'white' : mode === 'ai-black' ? 'black' : null
  const legalMoves = useMemo(() => {
    if (selectedSquare === null) return []
    return getLegalMoves(position, selectedSquare)
  }, [position, selectedSquare])
  const status = useMemo(() => getGameStatus(position), [position])
  const computerTurn = mode !== null && humanColor !== null && position.turn !== humanColor && status.type === 'playing'
  const inputBlocked = computerTurn || status.type !== 'playing'

  useEffect(() => {
    return () => workerRef.current?.terminate()
  }, [])

  useEffect(() => {
    if (!computerTurn) return

    const worker = new Worker(new URL('../ai/worker.ts', import.meta.url), { type: 'module' })
    workerRef.current?.terminate()
    workerRef.current = worker
    worker.onmessage = (event: MessageEvent<Move | null>) => {
      if (event.data) setPosition((current) => applyMove(current, event.data!))
    }
    worker.postMessage(position)

    return () => worker.terminate()
  }, [computerTurn, position])

  const selectSquare = (square: number) => {
    if (inputBlocked) return
    const piece = position.board[square]
    if (piece?.color === position.turn) setSelectedSquare(square)
  }

  const moveTo = (target: number): boolean => {
    if (inputBlocked) return false
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
    if (inputBlocked) return
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

  const startNewGame = (nextMode?: GameMode) => {
    workerRef.current?.terminate()
    setPosition(createStartingPosition())
    setSelectedSquare(null)
    setPendingPromotion(null)
    setMode(nextMode ?? null)
  }

  return {
    position,
    selectedSquare,
    legalMoves,
    status,
    pendingPromotion,
    mode,
    thinking: computerTurn,
    inputBlocked,
    orientation: mode === 'ai-black' ? 'black' as const : 'white' as const,
    chooseSquare,
    selectSquare,
    moveTo,
    promote,
    startNewGame,
  }
}
