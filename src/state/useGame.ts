import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { Difficulty, SearchRequest } from '../ai/search'
import { createStartingPosition } from '../engine/board'
import { applyMove, getGameStatus, getLegalMoves, hasMatingMaterial } from '../engine/game'
import { toSan } from '../engine/san'
import type { Color, GameStatus, Move, Position, PromotionPiece } from '../engine/types'
import { opposite } from '../engine/types'
import type { GameMode } from '../ui/NewGameDialog'
import { clearSavedGame, loadGame, saveGame } from './persist'
import type { PersistedGame } from './persist'
import { useClock } from './useClock'
import type { ClockState, TimeControl } from './useClock'

interface GameSnapshot {
  position: Position
  move: Move
  clock: ClockState
  san: string
}

function isCapture({ position, move }: GameSnapshot): boolean {
  if (position.board[move.to] !== null) return true
  return position.board[move.from]?.type === 'pawn' && move.from % 8 !== move.to % 8
}

export function useGame() {
  const [initial] = useState<PersistedGame | null>(loadGame)
  const [position, setPosition] = useState(() => initial?.position ?? createStartingPosition())
  const [history, setHistory] = useState<GameSnapshot[]>(() => initial?.history ?? [])
  const [selectedSquare, setSelectedSquare] = useState<number | null>(null)
  const [justMoved, setJustMoved] = useState<Move | null>(null)
  const [pendingPromotion, setPendingPromotion] = useState<Move[] | null>(null)
  const [mode, setMode] = useState<GameMode | null>(null)
  const [timeControl, setTimeControl] = useState<TimeControl>(() => initial?.timeControl ?? 'off')
  const [difficulty, setDifficulty] = useState<Difficulty>(() => initial?.difficulty ?? 'club')
  const [resumeAvailable, setResumeAvailable] = useState(initial !== null)
  const [resumed, setResumed] = useState(false)
  const [searchFailed, setSearchFailed] = useState(false)
  const workerRef = useRef<Worker | null>(null)
  const savedAtLoad = useRef(initial)
  const searchGeneration = useRef(0)
  const engineStatus = useMemo(() => getGameStatus(position), [position])
  const clockRunning = mode !== null && resumed && engineStatus.type === 'playing'
  const { clock, completeMove, flush: flushClock, snapshot: snapshotClock, reset: resetClock, restore: restoreClock } = useClock(
    timeControl,
    position.turn,
    clockRunning,
    initial?.clock,
  )

  const flaggedColor: Color | null = timeControl === 'off'
    ? null
    : clock.whiteMs <= 0 ? 'white' : clock.blackMs <= 0 ? 'black' : null
  let status: GameStatus = engineStatus
  if (flaggedColor !== null && engineStatus.type === 'playing') {
    const winner = opposite(flaggedColor)
    status = { type: 'timeout', winner: hasMatingMaterial(position.board, winner) ? winner : null }
  }

  const humanColor: Color | null = mode === 'ai-white' ? 'white' : mode === 'ai-black' ? 'black' : null
  const legalMoves = useMemo(() => selectedSquare === null ? [] : getLegalMoves(position, selectedSquare), [position, selectedSquare])
  const aiToMove = resumed && mode !== null && humanColor !== null && position.turn !== humanColor && status.type === 'playing'
  const computerTurn = aiToMove && !searchFailed
  const inputBlocked = !resumed || aiToMove || status.type !== 'playing'

  const commitMove = useCallback((move: Move) => {
    const next = applyMove(position, move)
    if (next === position) return
    const settlement = completeMove(position.turn)
    if (!settlement.accepted) return
    setHistory((entries) => [...entries, { position, move, san: toSan(position, move), clock: settlement.beforeIncrement }])
    setPosition(next)
    setSelectedSquare(null)
    setJustMoved(move)
  }, [completeMove, position])

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
    worker.onerror = () => {
      if (generation === searchGeneration.current) setSearchFailed(true)
    }
    worker.postMessage({ position, difficulty } satisfies SearchRequest)
    return () => worker.terminate()
  }, [commitMove, computerTurn, difficulty, position])

  useEffect(() => {
    if (!resumed || mode === null) return
    if (status.type !== 'playing') {
      clearSavedGame()
      return
    }
    saveGame({ position, history, mode, timeControl, difficulty, clock: snapshotClock() })
  }, [difficulty, history, mode, position, resumed, snapshotClock, status.type, timeControl])

  useEffect(() => {
    if (!resumed || mode === null || status.type !== 'playing') return
    const handlePageHide = () => {
      const settledClock = flushClock(position.turn)
      saveGame({ position, history, mode, timeControl, difficulty, clock: settledClock })
    }
    window.addEventListener('pagehide', handlePageHide)
    return () => window.removeEventListener('pagehide', handlePageHide)
  }, [difficulty, flushClock, history, mode, position, resumed, status.type, timeControl])

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

  const startNewGame = (nextMode?: GameMode, nextTimeControl: TimeControl = 'off', nextDifficulty: Difficulty = 'club') => {
    searchGeneration.current += 1
    workerRef.current?.terminate()
    clearSavedGame()
    savedAtLoad.current = null
    setPosition(createStartingPosition())
    setHistory([])
    setSelectedSquare(null)
    setJustMoved(null)
    setPendingPromotion(null)
    setSearchFailed(false)
    setTimeControl(nextTimeControl)
    setDifficulty(nextDifficulty)
    resetClock(nextTimeControl)
    setResumeAvailable(false)
    setResumed(nextMode !== undefined)
    setMode(nextMode ?? null)
  }

  const resumeGame = () => {
    const saved = savedAtLoad.current
    if (!saved) return
    setPosition(saved.position)
    setHistory(saved.history)
    setJustMoved(null)
    setTimeControl(saved.timeControl)
    setDifficulty(saved.difficulty ?? 'club')
    setSearchFailed(false)
    restoreClock(saved.clock)
    setMode(saved.mode)
    setResumeAvailable(false)
    setResumed(true)
  }

  let aiRestoreIndex = -1
  if (humanColor !== null) {
    for (let index = history.length - 1; index >= 0; index -= 1) {
      if (history[index].position.turn === humanColor) {
        aiRestoreIndex = index
        break
      }
    }
  }

  const undo = () => {
    if (history.length === 0 || computerTurn) return
    const restoreIndex = mode === 'local' ? history.length - 1 : aiRestoreIndex
    if (restoreIndex < 0) return
    searchGeneration.current += 1
    workerRef.current?.terminate()
    setSearchFailed(false)
    setPosition(history[restoreIndex].position)
    restoreClock(history[restoreIndex].clock)
    setHistory((entries) => entries.slice(0, restoreIndex))
    setSelectedSquare(null)
    setJustMoved(null)
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
    searchFailed,
    inputBlocked,
    orientation: mode === 'ai-black' ? 'black' as const : 'white' as const,
    moves: history.map(({ san }) => san),
    lastMove: history.at(-1)?.move ?? null,
    animateMove: justMoved,
    animateCapture: justMoved !== null && history.length > 0 && isCapture(history[history.length - 1]),
    canUndo: !computerTurn && (mode === 'local' ? history.length > 0 : aiRestoreIndex >= 0),
    clock,
    timeControl,
    difficulty,
    resumeAvailable,
    resumed,
    chooseSquare,
    selectSquare,
    moveTo,
    promote,
    startNewGame,
    resumeGame,
    undo,
  }
}
