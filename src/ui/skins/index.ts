import { animals } from './animals'
import { classic } from './classic'
import type { Skin } from './types'

export const SKINS = { classic, animals } satisfies Record<string, Skin>

export type SkinId = keyof typeof SKINS

export const SKIN_IDS = Object.keys(SKINS) as SkinId[]
