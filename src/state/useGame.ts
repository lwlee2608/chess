import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { createStartingPosition } from '../engine/board'
import { applyMove, getGameStatus, getLegalMoves } from '../engine/game'
import { toSan } from '../engine/san'
import type { Color, Move, Position, PromotionPiece } from '../engine/types'
import type { GameMode } from '../ui/NewGameDialog'

interface GameSnapshot {
  position: Position
  move: Move
  san: string
}

export function useGame() {
  const [position, setPosition] = useState(createStartingPosition)
  const [history, setHistory] = useState<GameSnapshot[]>([])
  const [selectedSquare, setSelectedSquare] = useState<number | null>(null)
  const [pendingPromotion, setPendingPromotion] = useState<Move[] | null>(null)
  const [mode, setMode] = useState<GameMode | null>(null)
  const workerRef = useRef<Worker | null>(null)
  const searchGeneration = useRef(0)

  const humanColor: Color | null = mode === 'ai-white' ? 'white' : mode === 'ai-black' ? 'black' : null
  const legalMoves = useMemo(() => selectedSquare === null ? [] : getLegalMoves(position, selectedSquare), [position, selectedSquare])
  const status = useMemo(() => getGameStatus(position), [position])
  const computerTurn = mode !== null && humanColor !== null && position.turn !== humanColor && status.type === 'playing'
  const inputBlocked = computerTurn || status.type !== 'playing'

  const commitMove = useCallback((move: Move) => {
    const next = applyMove(position, move)
    if (next === position) return
    setHistory((entries) => [...entries, { position, move, san: toSan(position, move) }])
    setPosition(next)
    setSelectedSquare(null)
  }, [position])

  useEffect(() => () => workerRef.current?.terminate(), [])

  useEffect(() => {
    if (!computerTurn) return
    const generation = ++searchGeneration.current
    const worker = new Worker(new URL('../ai/worker.ts', import.meta.url), { type: 'module' })
    workerRef.current?.terminate()
    workerRef.current = worker
    worker.onmessage = (event: MessageEvent<Move | null>) => {
      if (generation !== searchGeneration.current || !event.data) return
      commitMove(event.data)
    }
    worker.postMessage(position)
    return () => worker.terminate()
  }, [commitMove, computerTurn, position])

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
    commitMove(candidates[0])
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
    commitMove(move)
    setPendingPromotion(null)
  }

  const startNewGame = (nextMode?: GameMode) => {
    searchGeneration.current += 1
    workerRef.current?.terminate()
    setPosition(createStartingPosition())
    setHistory([])
    setSelectedSquare(null)
    setPendingPromotion(null)
    setMode(nextMode ?? null)
  }

  const undo = () => {
    if (history.length === 0 || computerTurn) return
    searchGeneration.current += 1
    workerRef.current?.terminate()
    const plies = mode === 'local' ? 1 : Math.min(2, history.length)
    const restoreIndex = history.length - plies
    setPosition(history[restoreIndex].position)
    setHistory((entries) => entries.slice(0, restoreIndex))
    setSelectedSquare(null)
    setPendingPromotion(null)
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
    moves: history.map(({ san }) => san),
    lastMove: history.at(-1)?.move ?? null,
    canUndo: history.length > 0 && !computerTurn,
    chooseSquare,
    selectSquare,
    moveTo,
    promote,
    startNewGame,
    undo,
  }
}
