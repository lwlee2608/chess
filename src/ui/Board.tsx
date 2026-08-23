import { useRef, useState } from 'react'
import type { Move, Position } from '../engine/types'
import { FILES, indexToSquare } from '../engine/types'
import { ChessPiece } from './pieces'

interface BoardProps {
  position: Position
  selectedSquare: number | null
  legalMoves: Move[]
  onChooseSquare: (square: number) => void
  onSelectSquare: (square: number) => void
  onMoveTo: (square: number) => boolean
}

export function Board({
  position,
  selectedSquare,
  legalMoves,
  onChooseSquare,
  onSelectSquare,
  onMoveTo,
}: BoardProps) {
  const [draggingSquare, setDraggingSquare] = useState<number | null>(null)
  const pointerStart = useRef<{ id: number; square: number; x: number; y: number } | null>(null)
  const suppressNextClick = useRef(false)
  const legalTargets = new Set(legalMoves.map(({ to }) => to))

  const finishPointer = (event: React.PointerEvent<HTMLButtonElement>) => {
    const start = pointerStart.current
    pointerStart.current = null
    setDraggingSquare(null)
    if (!start || start.id !== event.pointerId) return

    const distance = Math.hypot(event.clientX - start.x, event.clientY - start.y)
    if (distance < 8) return

    const target = document.elementFromPoint(event.clientX, event.clientY)?.closest<HTMLElement>('[data-square]')
    const targetSquare = Number(target?.dataset.square)
    if (Number.isInteger(targetSquare)) onMoveTo(targetSquare)
  }

  return (
    <div className="board-frame">
      <div className="board" role="grid" aria-label="Chess board">
        {position.board.map((piece, square) => {
          const rank = Math.floor(square / 8)
          const file = square % 8
          const isLight = (rank + file) % 2 === 0
          const isSelected = selectedSquare === square
          const isTarget = legalTargets.has(square)
          const isCapture = isTarget && piece !== null

          return (
            <button
              type="button"
              role="gridcell"
              aria-label={`${indexToSquare(square)}${piece ? `, ${piece.color} ${piece.type}` : ''}`}
              aria-selected={isSelected}
              className={`square square--${isLight ? 'light' : 'dark'}${isSelected ? ' square--selected' : ''}${isTarget ? ' square--target' : ''}${isCapture ? ' square--capture' : ''}`}
              data-square={square}
              key={square}
              onClick={() => {
                if (suppressNextClick.current) {
                  suppressNextClick.current = false
                  return
                }
                onChooseSquare(square)
              }}
              onPointerDown={(event) => {
                if (!piece || piece.color !== position.turn) return
                suppressNextClick.current = true
                pointerStart.current = {
                  id: event.pointerId,
                  square,
                  x: event.clientX,
                  y: event.clientY,
                }
                event.currentTarget.setPointerCapture(event.pointerId)
                if (selectedSquare === square) onChooseSquare(square)
                else onSelectSquare(square)
              }}
              onPointerMove={(event) => {
                const start = pointerStart.current
                if (!start || start.id !== event.pointerId) return
                if (Math.hypot(event.clientX - start.x, event.clientY - start.y) >= 8) {
                  setDraggingSquare(start.square)
                }
              }}
              onPointerUp={finishPointer}
              onPointerCancel={() => {
                pointerStart.current = null
                setDraggingSquare(null)
              }}
            >
              {file === 0 && <span className="coordinate coordinate--rank">{8 - rank}</span>}
              {rank === 7 && <span className="coordinate coordinate--file">{FILES[file]}</span>}
              {piece && (
                <span className={draggingSquare === square ? 'piece-wrap piece-wrap--dragging' : 'piece-wrap'}>
                  <ChessPiece piece={piece} />
                </span>
              )}
              {isTarget && <span className="target-marker" />}
            </button>
          )
        })}
      </div>
    </div>
  )
}
