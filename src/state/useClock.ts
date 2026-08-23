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
  const lastTick = useRef(0)


  useEffect(() => {
    lastTick.current = performance.now()
    if (!running || control === 'off') return

    const interval = window.setInterval(() => {
      const now = performance.now()
      const elapsed = now - lastTick.current
      lastTick.current = now
      setClock((current) => turn === 'white'
        ? { ...current, whiteMs: Math.max(0, current.whiteMs - elapsed) }
        : { ...current, blackMs: Math.max(0, current.blackMs - elapsed) })
    }, 100)

    return () => window.clearInterval(interval)
  }, [control, running, turn])

  const completeMove = useCallback((color: Color) => {
    if (control === 'off') return
    setClock((current) => color === 'white'
      ? { ...current, whiteMs: current.whiteMs + current.incrementMs }
      : { ...current, blackMs: current.blackMs + current.incrementMs })
  }, [control])

  const reset = useCallback((nextControl: TimeControl) => setClock({ ...PRESETS[nextControl] }), [])

  return { clock, completeMove, reset }
}
