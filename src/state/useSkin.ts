import { useEffect, useState } from 'react'
import { SKIN_IDS, SKINS } from '../ui/skins'
import type { SkinId } from '../ui/skins'

const STORAGE_KEY = 'chess.skin.v1'
const FONTS_LINK_ID = 'skin-fonts'

function loadSkin(): SkinId {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    return SKIN_IDS.find((id) => id === saved) ?? 'classic'
  } catch {
    return 'classic'
  }
}

function loadFonts(href: string) {
  let link = document.getElementById(FONTS_LINK_ID) as HTMLLinkElement | null
  if (!link) {
    link = document.createElement('link')
    link.id = FONTS_LINK_ID
    link.rel = 'stylesheet'
    document.head.appendChild(link)
  }
  if (link.href !== href) link.href = href
}

export function useSkin() {
  const [skin, setSkin] = useState<SkinId>(loadSkin)

  useEffect(() => {
    document.documentElement.dataset.skin = skin
    loadFonts(SKINS[skin].fontsUrl)
    try {
      localStorage.setItem(STORAGE_KEY, skin)
    } catch {
      return
    }
  }, [skin])

  return [skin, setSkin] as const
}
