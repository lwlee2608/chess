import { useEffect, useRef } from 'react'
import type { Color, PromotionPiece } from '../engine/types'
import { ChessPiece } from './pieces'

const OPTIONS: readonly PromotionPiece[] = ['queen', 'rook', 'bishop', 'knight']

interface PromotionDialogProps {
  color: Color
  onChoose: (piece: PromotionPiece) => void
}

export function PromotionDialog({ color, onChoose }: PromotionDialogProps) {
  const optionsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const invokingElement = document.activeElement instanceof HTMLElement ? document.activeElement : null
    optionsRef.current?.querySelector('button')?.focus()
    return () => {
      window.setTimeout(() => invokingElement?.focus())
    }
  }, [])

  const containFocus = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'Tab') return
    const buttons = Array.from(optionsRef.current?.querySelectorAll('button') ?? [])
    const first = buttons[0]
    const last = buttons.at(-1)
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault()
      last?.focus()
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault()
      first?.focus()
    }
  }
  return (
    <div className="promotion-backdrop" role="presentation">
      <div className="promotion-dialog" role="dialog" aria-modal="true" aria-labelledby="promotion-title">
        <p className="eyebrow">Pawn promotion</p>
        <h2 id="promotion-title">Choose a piece</h2>
        <div className="promotion-options" ref={optionsRef} onKeyDown={containFocus}>
          {OPTIONS.map((type) => (
            <button type="button" key={type} onClick={() => onChoose(type)} aria-label={`Promote to ${type}`}>
              <ChessPiece piece={{ color, type }} />
              <span>{type}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
