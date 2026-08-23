import type { Color } from '../engine/types'

interface ClockProps {
  color: Color
  milliseconds: number
  active: boolean
}

export function Clock({ color, milliseconds, active }: ClockProps) {
  const totalSeconds = Math.ceil(milliseconds / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = String(totalSeconds % 60).padStart(2, '0')

  return (
    <div className={`clock${active ? ' clock--active' : ''}${milliseconds <= 10_000 ? ' clock--low' : ''}`}>
      <span>{color}</span>
      <strong>{minutes}:{seconds}</strong>
    </div>
  )
}
