import { useRef, useState } from 'react'
import type { Move, Position } from '../engine/types'
import { FILES, indexToSquare } from '../engine/types'
import { ChessPiece } from './pieces'

interface BoardProps {
  position: Position
  selectedSquare: number | null
  legalMoves: Move[]
  lastMove: Move | null
  checkedColor: Position['turn'] | null
  disabled: boolean
  orientation: Position['turn']
  onChooseSquare: (square: number) => void
  onSelectSquare: (square: number) => void
  onMoveTo: (square: number) => boolean
}

export function Board({
  position,
  selectedSquare,
  legalMoves,
  lastMove,
  checkedColor,
  disabled,
  orientation,
  onChooseSquare,
  onSelectSquare,
  onMoveTo,
}: BoardProps) {
  const [draggingSquare, setDraggingSquare] = useState<number | null>(null)
  const pointerStart = useRef<{
    id: number
    square: number
    x: number
    y: number
    wasSelected: boolean
  } | null>(null)
  const suppressNextClick = useRef(false)
  const legalTargets = new Set(legalMoves.map(({ to }) => to))

  const finishPointer = (event: React.PointerEvent<HTMLButtonElement>) => {
    const start = pointerStart.current
    pointerStart.current = null
    setDraggingSquare(null)
    if (!start || start.id !== event.pointerId) return

    const distance = Math.hypot(event.clientX - start.x, event.clientY - start.y)
    if (distance < 8) {
      if (start.wasSelected) onChooseSquare(start.square)
      return
    }

    const target = document.elementFromPoint(event.clientX, event.clientY)?.closest<HTMLElement>('[data-square]')
    const targetSquare = Number(target?.dataset.square)
    if (Number.isInteger(targetSquare)) onMoveTo(targetSquare)
  }

  return (
    <div className="board-frame">
      <div className="board" role="grid" aria-label="Chess board">
        {(orientation === 'white' ? position.board.map((_, square) => square) : position.board.map((_, square) => 63 - square)).map((square, displayIndex) => {
          const piece = position.board[square]
          const rank = Math.floor(square / 8)
          const file = square % 8
          const displayRank = Math.floor(displayIndex / 8)
          const displayFile = displayIndex % 8
          const isLight = (rank + file) % 2 === 0
          const isSelected = selectedSquare === square
          const isTarget = legalTargets.has(square)
          const isCapture = isTarget && piece !== null
          const isCheckedKing = piece?.type === 'king' && piece.color === checkedColor
          const isLastMove = lastMove?.from === square || lastMove?.to === square

          return (
            <button
              type="button"
              role="gridcell"
              aria-label={`${indexToSquare(square)}${piece ? `, ${piece.color} ${piece.type}` : ''}`}
              aria-selected={isSelected}
              className={`square square--${isLight ? 'light' : 'dark'}${isSelected ? ' square--selected' : ''}${isTarget ? ' square--target' : ''}${isCapture ? ' square--capture' : ''}${isCheckedKing ? ' square--check' : ''}${isLastMove ? ' square--last' : ''}`}
              data-square={square}
              disabled={disabled}
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
                  wasSelected: selectedSquare === square,
                }
                event.currentTarget.setPointerCapture(event.pointerId)
                if (selectedSquare !== square) onSelectSquare(square)
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
              {displayFile === 0 && <span className="coordinate coordinate--rank">{8 - rank}</span>}
              {displayRank === 7 && <span className="coordinate coordinate--file">{FILES[file]}</span>}
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
