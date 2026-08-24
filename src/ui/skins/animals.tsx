import type { ReactNode } from 'react'
import type { PieceProps, Skin } from './types'

const GOLD = '#f2b94a'
const GOLD_STROKE = '#5a2c50'

interface Palette {
  fill: string
  stroke: string
  detail: string
}

const PALETTES: Record<PieceProps['piece']['color'], Palette> = {
  white: { fill: '#fff7fb', stroke: '#5a2c50', detail: '#5a2c50' },
  black: { fill: '#5a2c50', stroke: '#d29ec3', detail: '#fff7fb' },
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

function Eyes({ detail, y = 17.5, spread = 4, tall = false }: { detail: string; y?: number; spread?: number; tall?: boolean }) {
  return (
    <g fill={detail} stroke="none">
      <ellipse cx={22.5 - spread} cy={y} rx="1.4" ry={tall ? 1.9 : 1.4} />
      <ellipse cx={22.5 + spread} cy={y} rx="1.4" ry={tall ? 1.9 : 1.4} />
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

function Gold({ d }: { d: string }) {
  return <path d={d} fill={GOLD} stroke={GOLD_STROKE} strokeWidth="1" />
}

function Hamster(props: PieceProps) {
  const { detail } = palette(props)

  return (
    <Svg {...props}>
      <Body x={15.5} width={14} />
      <circle cx="16.5" cy="16" r="2.6" />
      <circle cx="28.5" cy="16" r="2.6" />
      <ellipse cx="22.5" cy="22.5" rx="8.5" ry="7.5" />
      <Eyes detail={detail} y={21.5} spread={3.2} />
      <ellipse cx="22.5" cy="25" rx="1.3" ry="1" fill={detail} stroke="none" />
      <path fill="none" stroke={detail} strokeWidth="1.1" d="M20.8 26.4c.9 1.2 2.5 1.2 3.4 0" />
    </Svg>
  )
}

function Puppy(props: PieceProps) {
  const { detail } = palette(props)

  return (
    <Svg {...props}>
      <Body />
      <ellipse cx="11.5" cy="21" rx="3.6" ry="8.5" transform="rotate(10 11.5 21)" />
      <ellipse cx="33.5" cy="21" rx="3.6" ry="8.5" transform="rotate(-10 33.5 21)" />
      <circle cx="22.5" cy="21" r="10.5" />
      <Eyes detail={detail} y={19.5} />
      <Snout detail={detail} y={24.5} />
      <Gold d="M16.5 13.5c0-6 3-11 6-12.5 3 1.5 6 6.5 6 12.5z" />
      <path d="M22.5 3v10" fill="none" stroke={GOLD_STROKE} strokeWidth="1" />
    </Svg>
  )
}

function Horse(props: PieceProps) {
  const { detail } = palette(props)

  return (
    <Svg {...props}>
      <Body />
      <path d="M14.5 15l1.5-8.5 5 5.5zM30.5 15l-1.5-8.5-5 5.5z" />
      <ellipse cx="22.5" cy="19" rx="10" ry="9" />
      <path d="M15.5 13.5c1.5-1.5 3-4 4.5-3.5s1.5 2 3 1.5 2-2.5 3.5-1.5 1.5 3 3 4" fill={detail} stroke="none" opacity="0.35" />
      <Eyes detail={detail} y={17} spread={4.8} />
      <ellipse cx="22.5" cy="24.5" rx="6.5" ry="4.5" />
      <g fill={detail} stroke="none">
        <ellipse cx="20" cy="25" rx="1.2" ry="0.9" />
        <ellipse cx="25" cy="25" rx="1.2" ry="0.9" />
      </g>
      <path d="M15 30c2 1.5 13 1.5 15 0" fill="none" stroke={GOLD} strokeWidth="2.2" />
      <circle cx="22.5" cy="32" r="1.8" fill={GOLD} stroke={GOLD_STROKE} strokeWidth="1" />
    </Svg>
  )
}

function Kitten(props: PieceProps) {
  const { detail } = palette(props)

  return (
    <Svg {...props}>
      <Body x={10} width={25} />
      <path d="M11 19.5l.5-10.5 9.5 4.5zM34 19.5l-.5-10.5-9.5 4.5z" />
      <circle cx="22.5" cy="21" r="11.5" />
      <Eyes detail={detail} y={19.5} spread={4.8} tall />
      <path d="M20.8 24h3.4l-1.7 1.9z" fill={detail} stroke="none" />
      <path fill="none" stroke={detail} strokeWidth="1.1" d="M22.5 25.9c-.8 1.4-1.8 1.6-3 .9M22.5 25.9c.8 1.4 1.8 1.6 3 .9" />
      <Whiskers detail={detail} />
      <Gold d="M14.5 10l1.8-7.5 6.2 4 6.2-4 1.8 7.5z" />
      <circle cx="22.5" cy="6.8" r="1.8" fill="#ff5aa0" stroke={GOLD_STROKE} strokeWidth="0.8" />
    </Svg>
  )
}

function Bear(props: PieceProps) {
  const { detail } = palette(props)

  return (
    <Svg {...props}>
      <Body x={11.5} width={22} />
      <circle cx="13.5" cy="13.5" r="3.6" />
      <circle cx="31.5" cy="13.5" r="3.6" />
      <circle cx="22.5" cy="21" r="10.5" />
      <Eyes detail={detail} y={19} />
      <Snout detail={detail} y={24} />
      <Gold d="M15.5 12.5V4.5h2.8v3h2.8v-3h2.8v3h2.8v-3h2.8v8z" />
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
      <Body x={9.5} width={26} />
      <path d={manePath(22.5, 21, 14, 12)} />
      <circle cx="22.5" cy="21" r="10.5" />
      <Eyes detail={detail} y={19} />
      <Snout detail={detail} y={24} />
      <Gold d="M13 11.5L14.5 1l4.8 5.2 3.2-5.7 3.2 5.7L30.5 1 32 11.5z" />
    </Svg>
  )
}

export const animals: Skin = {
  label: 'Animals',
  pieces: { pawn: Hamster, knight: Horse, bishop: Puppy, rook: Bear, queen: Kitten, king: Lion },
}
