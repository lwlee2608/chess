import type { ReactNode, SVGProps } from 'react'
import type { Piece } from '../../engine/types'
import type { Skin } from './types'

interface PieceShapeProps extends SVGProps<SVGSVGElement> {
  piece: Piece
}

function Svg({ piece, children, ...props }: PieceShapeProps & { children: ReactNode }) {
  const white = piece.color === 'white'

  return (
    <svg
      {...props}
      aria-hidden="true"
      className={`piece piece--${piece.color}`}
      viewBox="0 0 45 45"
      fill={white ? '#f5efe2' : '#1c1d1a'}
      stroke={white ? '#1c1d1a' : '#080907'}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.5"
    >
      {children}
    </svg>
  )
}

const pawnPath = 'M22.5 9a4 4 0 0 0-3.22 6.38 6.48 6.48 0 0 0-.87 10.65C15.41 27.09 11 31.58 11 39.5h23c0-7.92-4.41-12.41-7.41-13.47a6.46 6.46 0 0 0-.87-10.65A4.01 4.01 0 0 0 22.5 9z'

function Pawn(props: PieceShapeProps) {
  return (
    <Svg {...props}>
      <path d={pawnPath} />
    </Svg>
  )
}

function Knight(props: PieceShapeProps) {
  const white = props.piece.color === 'white'
  const detail = white ? '#1c1d1a' : '#f5efe2'

  return (
    <Svg {...props}>
      <path d="M22 10c10.5 1 16.5 8 16 29H15c0-9 10-6.5 8-21" />
      <path d="M24 18c.38 2.91-5.55 7.37-8 9-3 2-2.82 4.34-5 4-1.04-.94 1.41-3.04 0-3-1 0 .19 1.23-1 2-1 0-4 1-4-4 0-2 6-12 6-12s1.89-1.9 2-3.5c-.73-1-.5-2-.5-3 1-1 3 2.5 3 2.5h2s.78-2 2.5-3c1 0 1 3 1 3" />
      <path fill={detail} stroke={detail} d="M9.5 25.5a.5.5 0 1 1-1 0 .5.5 0 1 1 1 0m5.43-9.75a.5 1.5 30 1 1-.86-.5.5 1.5 30 1 1 .86.5" />
    </Svg>
  )
}

function Bishop(props: PieceShapeProps) {
  const detail = props.piece.color === 'white' ? '#1c1d1a' : '#f5efe2'

  return (
    <Svg {...props}>
      <path d="M9 36c3.4-1 10.1.4 13.5-2 3.4 2.4 10.1 1 13.5 2 0 0 1.6.5 3 2-.7 1-1.6 1-3 .5-3.4-1-10.1.5-13.5-1-3.4 1.5-10.1 0-13.5 1-1.4.5-2.3.5-3-.5 1.4-2 3-2 3-2z" />
      <path d="M15 32c2.5 2.5 12.5 2.5 15 0 .5-1.5 0-2 0-2 0-2.5-2.5-4-2.5-4 5.5-1.5 6-11.5-5-15.5-11 4-10.5 14-5 15.5 0 0-2.5 1.5-2.5 4 0 0-.5.5 0 2z" />
      <circle cx="22.5" cy="8" r="2.5" />
      <path fill="none" stroke={detail} d="M17.5 26h10M15 30h15m7.5-14.5v5M20 18h5" />
    </Svg>
  )
}

function Rook(props: PieceShapeProps) {
  return (
    <Svg {...props}>
      <path d="M9 39h27v-3H9zm3-3v-4h21v4zm-1-22V9h4v2h5V9h5v2h5V9h4v5" />
      <path d="m34 14-3 3H14l-3-3M31 17v12.5H14V17m17 12.5 1.5 2.5h-20l1.5-2.5" />
    </Svg>
  )
}

function Queen(props: PieceShapeProps) {
  return (
    <Svg {...props}>
      <circle cx="6" cy="12" r="2.25" />
      <circle cx="14" cy="9" r="2.25" />
      <circle cx="22.5" cy="8" r="2.25" />
      <circle cx="31" cy="9" r="2.25" />
      <circle cx="39" cy="12" r="2.25" />
      <path d="M9 26c8.5-1.5 21-1.5 27 0l2-12-7 11V11l-5.5 13.5-3-15-3 15-5.5-14V25L7 14zM9 26c0 2 1.5 2 2.5 4 1 1.5 1 1 .5 3.5-1.5 1-1.5 2.5-1.5 2.5-1.5 1.5.5 2.5.5 2.5 6.5 1 16.5 1 23 0 0 0 1.5-1 0-2.5 0 0 .5-1.5-1-2.5-.5-2.5-.5-2 .5-3.5 1-2 2.5-2 2.5-4z" />
      <path fill="none" d="M11.5 30c3.5-1 18.5-1 22 0M12 33.5c6-1 15-1 21 0" />
    </Svg>
  )
}

function King(props: PieceShapeProps) {
  return (
    <Svg {...props}>
      <path fill="none" d="M22.5 11.6V6M20 8h5" />
      <path d="M22.5 25s4.5-7.5 3-10.5c0 0-1-2.5-3-2.5s-3 2.5-3 2.5c-1.5 3 3 10.5 3 10.5M11.5 37c5.5 3.5 15.5 3.5 21 0v-7s9-4.5 6-10.5c-4-6.5-13.5-3.5-16 4V27v-3.5c-3.5-7.5-13-10.5-16-4-3 6 5 10 5 10z" />
      <path fill="none" d="M11.5 30c5.5-3 15.5-3 21 0m-21 3.5c5.5-3 15.5-3 21 0m-21 3.5c5.5-3 15.5-3 21 0" />
    </Svg>
  )
}

export const classic: Skin = {
  label: 'Classic',
  fontsUrl: 'https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Playfair+Display:ital,wght@0,600;1,600&display=swap',
  pieces: { pawn: Pawn, knight: Knight, bishop: Bishop, rook: Rook, queen: Queen, king: King },
}
