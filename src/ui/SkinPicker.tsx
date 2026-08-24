import { SKIN_IDS, SKINS } from './skins'
import type { SkinId } from './skins'

interface SkinPickerProps {
  skin: SkinId
  onChange: (skin: SkinId) => void
}

export function SkinPicker({ skin, onChange }: SkinPickerProps) {
  return (
    <div className="skin-picker" role="group" aria-label="Piece skin">
      {SKIN_IDS.map((id) => (
        <button
          type="button"
          key={id}
          className={`footer-button${skin === id ? ' footer-button--selected' : ''}`}
          aria-pressed={skin === id}
          onClick={() => onChange(id)}
        >
          {SKINS[id].label}
        </button>
      ))}
    </div>
  )
}
