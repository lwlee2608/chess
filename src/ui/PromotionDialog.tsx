import type { Color, PromotionPiece } from '../engine/types'
import { ChessPiece } from './pieces'

const OPTIONS: readonly PromotionPiece[] = ['queen', 'rook', 'bishop', 'knight']

interface PromotionDialogProps {
  color: Color
  onChoose: (piece: PromotionPiece) => void
}

export function PromotionDialog({ color, onChoose }: PromotionDialogProps) {
  return (
    <div className="promotion-backdrop" role="presentation">
      <div className="promotion-dialog" role="dialog" aria-modal="true" aria-labelledby="promotion-title">
        <p className="eyebrow">Pawn promotion</p>
        <h2 id="promotion-title">Choose a piece</h2>
        <div className="promotion-options">
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
