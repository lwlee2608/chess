import { useEffect, useState } from 'react'

const STORAGE_KEY = 'chess.move-history.v1'

function loadVisible(): boolean {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved === 'on') return true
    if (saved === 'off') return false
  } catch {
    return true
  }
  return !window.matchMedia('(max-height: 900px)').matches
}

export function useHistoryPanel() {
  const [visible, setVisible] = useState(loadVisible)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, visible ? 'on' : 'off')
    } catch {
      return
    }
  }, [visible])

  return [visible, () => setVisible((current) => !current)] as const
}
