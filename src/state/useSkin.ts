import { useEffect, useState } from 'react'
import { SKIN_IDS } from '../ui/skins'
import type { SkinId } from '../ui/skins'

const STORAGE_KEY = 'chess.skin.v1'

function loadSkin(): SkinId {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    return SKIN_IDS.find((id) => id === saved) ?? 'classic'
  } catch {
    return 'classic'
  }
}

export function useSkin() {
  const [skin, setSkin] = useState<SkinId>(loadSkin)

  useEffect(() => {
    document.documentElement.dataset.skin = skin
    try {
      localStorage.setItem(STORAGE_KEY, skin)
    } catch {
      return
    }
  }, [skin])

  return [skin, setSkin] as const
}
