import type { ComponentType } from 'react'
import type { Piece, PieceType } from '../../engine/types'

export interface PieceProps {
  piece: Piece
}

export interface Skin {
  label: string
  fontsUrl: string
  pieces: Record<PieceType, ComponentType<PieceProps>>
}
