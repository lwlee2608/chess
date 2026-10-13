import type { Move, PromotionPiece } from '../engine/types'
import { indexToSquare, squareToIndex } from '../engine/types'

const PROMOTION_CODES: Record<PromotionPiece, string> = { queen: 'q', rook: 'r', bishop: 'b', knight: 'n' }

export function toUci(move: Move): string {
  return indexToSquare(move.from) + indexToSquare(move.to) + (move.promotion ? PROMOTION_CODES[move.promotion] : '')
}

export function parseUci(text: string): Move | null {
  if (!/^[a-h][1-8][a-h][1-8][qrbn]?$/.test(text)) return null
  const promotion = (Object.keys(PROMOTION_CODES) as PromotionPiece[]).find((piece) => PROMOTION_CODES[piece] === text[4])
  return { from: squareToIndex(text.slice(0, 2)), to: squareToIndex(text.slice(2, 4)), ...(promotion && { promotion }) }
}
