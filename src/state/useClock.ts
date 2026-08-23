import { useCallback, useEffect, useRef, useState } from 'react'
import type { Color } from '../engine/types'

export type TimeControl = 'off' | '5+0' | '10+0' | '15+10'

export interface ClockState {
  whiteMs: number
  blackMs: number
  incrementMs: number
}

const PRESETS: Record<TimeControl, ClockState> = {
  off: { whiteMs: 0, blackMs: 0, incrementMs: 0 },
  '5+0': { whiteMs: 300_000, blackMs: 300_000, incrementMs: 0 },
  '10+0': { whiteMs: 600_000, blackMs: 600_000, incrementMs: 0 },
  '15+10': { whiteMs: 900_000, blackMs: 900_000, incrementMs: 10_000 },
}

export function useClock(control: TimeControl, turn: Color, running: boolean) {
  const [clock, setClock] = useState<ClockState>(() => ({ ...PRESETS[control] }))
  const clockRef = useRef(clock)
  const lastTick = useRef(0)
  useEffect(() => {
    clockRef.current = clock
  }, [clock])

  const settle = useCallback((color: Color, addIncrement: boolean): ClockState => {
    if (control === 'off') return clockRef.current
    const now = performance.now()
    const elapsed = lastTick.current === 0 ? 0 : now - lastTick.current
    lastTick.current = now
    const current = clockRef.current
    const remaining = Math.max(0, (color === 'white' ? current.whiteMs : current.blackMs) - elapsed)
    const nextRemaining = remaining > 0 && addIncrement ? remaining + current.incrementMs : remaining
    const next = color === 'white'
      ? { ...current, whiteMs: nextRemaining }
      : { ...current, blackMs: nextRemaining }
    clockRef.current = next
    setClock(next)
    return next
  }, [control])

  useEffect(() => {
    lastTick.current = performance.now()
    if (!running || control === 'off') return

    const interval = window.setInterval(() => {
      const remaining = turn === 'white' ? clockRef.current.whiteMs : clockRef.current.blackMs
      if (remaining <= 0) {
        window.clearInterval(interval)
        return
      }
      settle(turn, false)
    }, 100)

    return () => window.clearInterval(interval)
  }, [control, running, settle, turn])

  const completeMove = useCallback((color: Color): boolean => {
    if (control === 'off') return true
    const settled = settle(color, true)
    return (color === 'white' ? settled.whiteMs : settled.blackMs) > 0
  }, [control, settle])

  const reset = useCallback((nextControl: TimeControl) => {
    const next = { ...PRESETS[nextControl] }
    clockRef.current = next
    lastTick.current = performance.now()
    setClock(next)
  }, [])

  const restore = useCallback((next: ClockState) => {
    clockRef.current = next
    lastTick.current = performance.now()
    setClock(next)
  }, [])

  return { clock, completeMove, reset, restore }
}
