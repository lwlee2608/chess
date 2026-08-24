import { createContext, useContext } from 'react'
import type { Piece } from '../engine/types'
import { SKINS } from './skins'
import type { SkinId } from './skins'

export const SkinContext = createContext<SkinId>('classic')

export function ChessPiece({ piece }: { piece: Piece }) {
  const Component = SKINS[useContext(SkinContext)].pieces[piece.type]
  return <Component piece={piece} />
}
