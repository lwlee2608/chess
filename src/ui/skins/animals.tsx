import type { ReactNode } from 'react'
import type { PieceProps, Skin } from './types'

const GOLD = '#f2b94a'

interface Palette {
  fill: string
  stroke: string
  detail: string
}

const PALETTES: Record<PieceProps['piece']['color'], Palette> = {
  white: { fill: '#fff7fb', stroke: '#5a2c50', detail: '#5a2c50' },
  black: { fill: '#5a2c50', stroke: '#a56a97', detail: '#fff7fb' },
}

function palette({ piece }: PieceProps): Palette {
  return PALETTES[piece.color]
}

function Svg({ piece, children }: PieceProps & { children: ReactNode }) {
  const { fill, stroke } = PALETTES[piece.color]

  return (
    <svg
      aria-hidden="true"
      className={`piece piece--${piece.color}`}
      viewBox="0 0 45 45"
      fill={fill}
      stroke={stroke}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.5"
    >
      {children}
    </svg>
  )
}

function Body({ x = 12, width = 21 }: { x?: number; width?: number }) {
  const left = x + 5
  const right = x + width - 5

  return (
    <>
      <rect x={x} y="26" width={width} height="14" rx={width / 3} />
      <circle cx={left} cy="38" r="2.6" />
      <circle cx={right} cy="38" r="2.6" />
    </>
  )
}

function Eyes({ detail, y = 17.5, tall = false }: { detail: string; y?: number; tall?: boolean }) {
  return (
    <g fill={detail} stroke="none">
      <ellipse cx="18.5" cy={y} rx="1.4" ry={tall ? 1.9 : 1.4} />
      <ellipse cx="26.5" cy={y} rx="1.4" ry={tall ? 1.9 : 1.4} />
    </g>
  )
}

function Snout({ detail, y = 22.5, muzzle = true }: { detail: string; y?: number; muzzle?: boolean }) {
  return (
    <>
      {muzzle && <ellipse cx="22.5" cy={y + 1.5} rx="5" ry="3.5" />}
      <ellipse cx="22.5" cy={y} rx="2" ry="1.5" fill={detail} stroke="none" />
      <path fill="none" stroke={detail} strokeWidth="1.1" d={`M22.5 ${y + 1.5}v1.5M20.3 ${y + 3.6}c1.2 1 3.2 1 4.4 0`} />
    </>
  )
}

function Whiskers({ detail }: { detail: string }) {
  return <path fill="none" stroke={detail} strokeWidth="0.9" d="M9 19.5h5.5M9.5 23l5-1.5M30.5 19.5H36M30.5 21.5l5 1.5" />
}

function Hamster(props: PieceProps) {
  const { detail } = palette(props)

  return (
    <Svg {...props}>
      <Body x={13.5} width={18} />
      <circle cx="15" cy="12.5" r="3.2" />
      <circle cx="30" cy="12.5" r="3.2" />
      <ellipse cx="22.5" cy="21" rx="10.5" ry="9" />
      <Eyes detail={detail} y={19.5} />
      <ellipse cx="22.5" cy="24" rx="1.5" ry="1.2" fill={detail} stroke="none" />
      <path fill="none" stroke={detail} strokeWidth="1.1" d="M20.5 25.5c1 1.4 3 1.4 4 0" />
      <Whiskers detail={detail} />
    </Svg>
  )
}

function Puppy(props: PieceProps) {
  const { detail } = palette(props)

  return (
    <Svg {...props}>
      <Body />
      <ellipse cx="11.5" cy="19" rx="3.6" ry="8.5" transform="rotate(10 11.5 19)" />
      <ellipse cx="33.5" cy="19" rx="3.6" ry="8.5" transform="rotate(-10 33.5 19)" />
      <circle cx="22.5" cy="19" r="10.5" />
      <Eyes detail={detail} y={17.5} />
      <Snout detail={detail} y={22.5} />
    </Svg>
  )
}

function Kitten(props: PieceProps) {
  const { detail } = palette(props)

  return (
    <Svg {...props}>
      <Body />
      <path d="M13 16l.5-10 8.5 4.5zM32 16l-.5-10-8.5 4.5z" />
      <path d="M15 13.5l.2-4.5 4 2.2zM30 13.5l-.2-4.5-4 2.2z" fill={detail} stroke="none" opacity="0.35" />
      <circle cx="22.5" cy="19.5" r="10.5" />
      <Eyes detail={detail} y={18} tall />
      <path d="M20.8 22.3h3.4l-1.7 1.9z" fill={detail} stroke="none" />
      <path fill="none" stroke={detail} strokeWidth="1.1" d="M22.5 24.2c-.8 1.4-1.8 1.6-3 .9M22.5 24.2c.8 1.4 1.8 1.6 3 .9" />
      <Whiskers detail={detail} />
    </Svg>
  )
}

function Bear(props: PieceProps) {
  const { detail } = palette(props)

  return (
    <Svg {...props}>
      <Body x={10.5} width={24} />
      <circle cx="13" cy="11" r="4.2" />
      <circle cx="32" cy="11" r="4.2" />
      <circle cx="13" cy="11" r="1.8" fill={detail} stroke="none" opacity="0.35" />
      <circle cx="32" cy="11" r="1.8" fill={detail} stroke="none" opacity="0.35" />
      <circle cx="22.5" cy="19.5" r="11.5" />
      <Eyes detail={detail} y={17.5} />
      <Snout detail={detail} y={23} />
    </Svg>
  )
}

function Fox(props: PieceProps) {
  const { detail } = palette(props)

  return (
    <Svg {...props}>
      <Body />
      <path d="M11.5 18l2-12 8.5 7.5zM33.5 18l-2-12-8.5 7.5z" />
      <path d="M14 15.5l.8-6.5 4.5 4.2zM31 15.5l-.8-6.5-4.5 4.2z" fill={detail} stroke="none" opacity="0.35" />
      <path d="M11.5 17c0-5.5 5-8.5 11-8.5s11 3 11 8.5c0 6.5-6.5 12-11 13-4.5-1-11-6.5-11-13z" />
      <Eyes detail={detail} y={17.5} tall />
      <ellipse cx="22.5" cy="25" rx="1.9" ry="1.5" fill={detail} stroke="none" />
      <path d="M17 6.5l1.6-3.5 3.9 2.3 3.9-2.3 1.6 3.5z" fill={GOLD} stroke="#5a2c50" strokeWidth="1" />
    </Svg>
  )
}

function manePath(cx: number, cy: number, r: number, bumps: number): string {
  const step = (Math.PI * 2) / bumps
  const points = Array.from({ length: bumps }, (_, i) => {
    const angle = i * step
    return [cx + r * Math.cos(angle), cy + r * Math.sin(angle)]
  })
  return points
    .map(([x, y], i) => `${i === 0 ? 'M' : 'A'}${i === 0 ? '' : `${r * 0.36} ${r * 0.36} 0 0 1 `}${x.toFixed(2)} ${y.toFixed(2)}`)
    .join('') + `A${r * 0.36} ${r * 0.36} 0 0 1 ${points[0][0].toFixed(2)} ${points[0][1].toFixed(2)}z`
}

function Lion(props: PieceProps) {
  const { detail } = palette(props)

  return (
    <Svg {...props}>
      <Body x={11} width={23} />
      <path d={manePath(22.5, 20, 13, 12)} />
      <circle cx="14" cy="12" r="3.2" />
      <circle cx="31" cy="12" r="3.2" />
      <circle cx="22.5" cy="20" r="10" />
      <Eyes detail={detail} y={18} />
      <Snout detail={detail} y={23} />
      <path d="M16 8.5l1.5-6 5 3.8 5-3.8 1.5 6z" fill={GOLD} stroke="#5a2c50" strokeWidth="1" />
    </Svg>
  )
}

export const animals: Skin = {
  label: 'Animals',
  pieces: { pawn: Hamster, knight: Puppy, bishop: Kitten, rook: Bear, queen: Fox, king: Lion },
}
