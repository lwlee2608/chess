import { useLayoutEffect, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import type { Move, Position } from '../engine/types'
import { FILES, indexToSquare } from '../engine/types'
import { ChessPiece } from './pieces'

interface BoardProps {
  position: Position
  selectedSquare: number | null
  legalMoves: Move[]
  lastMove: Move | null
  animateMove: Move | null
  animateCapture: boolean
  checkedColor: Position['turn'] | null
  disabled: boolean
  orientation: Position['turn']
  onChooseSquare: (square: number) => void
  onSelectSquare: (square: number) => void
  onMoveTo: (square: number) => boolean
}

function slideOrigins(position: Position, move: Move | null): Map<number, number> {
  if (!move) return new Map()
  const origins = new Map([[move.to, move.from]])
  const piece = position.board[move.to]
  if (piece?.type === 'king' && Math.abs((move.to % 8) - (move.from % 8)) === 2) {
    const kingSide = move.to > move.from
    origins.set(kingSide ? move.to - 1 : move.to + 1, kingSide ? move.to + 1 : move.to - 2)
  }
  return origins
}

export function Board({
  position,
  selectedSquare,
  legalMoves,
  lastMove,
  animateMove,
  animateCapture,
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
  const dragNode = useRef<HTMLElement | null>(null)
  const pendingDrop = useRef<Move | null | undefined>(undefined)
  const droppedMove = useRef<Move | null>(null)
  const suppressNextClick = useRef(false)
  const [activeOrigins, setActiveOrigins] = useState<Map<number, number>>(() => new Map())
  const animatedMove = useRef<Move | null>(null)
  const legalTargets = new Set(legalMoves.map(({ to }) => to))
  const flip = orientation === 'white' ? 1 : -1

  if (pendingDrop.current !== undefined && animateMove !== pendingDrop.current) {
    droppedMove.current = animateMove
    pendingDrop.current = undefined
  }

  useLayoutEffect(() => {
    if (animateMove === animatedMove.current) return
    animatedMove.current = animateMove
    if (!animateMove) {
      setActiveOrigins(new Map())
      return
    }
    if (animateMove === droppedMove.current) return
    const incoming = slideOrigins(position, animateMove)
    setActiveOrigins((current) => {
      const next = new Map<number, number>()
      current.forEach((from, to) => {
        if (position.board[to] !== null) next.set(to, from)
      })
      incoming.forEach((from, to) => next.set(to, from))
      return next
    })
  }, [animateMove, position])

  const origins = activeOrigins

  const releaseDrag = () => {
    dragNode.current?.style.removeProperty('--drag-x')
    dragNode.current?.style.removeProperty('--drag-y')
    dragNode.current = null
    pointerStart.current = null
    setDraggingSquare(null)
  }

  const finishPointer = (event: React.PointerEvent<HTMLButtonElement>) => {
    const start = pointerStart.current
    releaseDrag()
    if (!start || start.id !== event.pointerId) return

    const distance = Math.hypot(event.clientX - start.x, event.clientY - start.y)
    if (distance < 8) {
      if (start.wasSelected) onChooseSquare(start.square)
      return
    }

    const target = document.elementFromPoint(event.clientX, event.clientY)?.closest<HTMLElement>('[data-square]')
    const targetSquare = Number(target?.dataset.square)
    if (Number.isInteger(targetSquare) && onMoveTo(targetSquare)) pendingDrop.current = animateMove
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
          const isCaptured = animateCapture && animateMove?.to === square
          const slideFrom = origins.get(square)
          const slideStyle = slideFrom === undefined ? undefined : ({
            '--slide-x': String(flip * ((slideFrom % 8) - file)),
            '--slide-y': String(flip * (Math.floor(slideFrom / 8) - rank)),
          } as CSSProperties)

          return (
            <button
              type="button"
              role="gridcell"
              aria-label={`${indexToSquare(square)}${piece ? `, ${piece.color} ${piece.type}` : ''}`}
              aria-selected={isSelected}
              className={`square square--${isLight ? 'light' : 'dark'}${isSelected ? ' square--selected' : ''}${isTarget ? ' square--target' : ''}${isCapture ? ' square--capture' : ''}${isCheckedKing ? ' square--check' : ''}${isLastMove ? ' square--last' : ''}${isCaptured ? ' square--captured' : ''}`}
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
                dragNode.current = event.currentTarget.querySelector<HTMLElement>('.piece-wrap')
                event.currentTarget.setPointerCapture(event.pointerId)
                if (selectedSquare !== square) onSelectSquare(square)
              }}
              onPointerMove={(event) => {
                const start = pointerStart.current
                if (!start || start.id !== event.pointerId) return
                const offsetX = event.clientX - start.x
                const offsetY = event.clientY - start.y
                if (Math.hypot(offsetX, offsetY) < 8) return
                setDraggingSquare(start.square)
                dragNode.current?.style.setProperty('--drag-x', `${offsetX}px`)
                dragNode.current?.style.setProperty('--drag-y', `${offsetY}px`)
              }}
              onPointerUp={finishPointer}
              onPointerCancel={releaseDrag}
            >
              {displayFile === 0 && <span className="coordinate coordinate--rank">{8 - rank}</span>}
              {displayRank === 7 && <span className="coordinate coordinate--file">{FILES[file]}</span>}
              {piece && (
                <span
                  className={`piece-wrap${draggingSquare === square ? ' piece-wrap--dragging' : ''}${slideFrom === undefined ? '' : ' piece-wrap--slide'}`}
                  style={slideStyle}
                  onAnimationEnd={(event) => {
                    if (event.animationName !== 'piece-slide') return
                    setActiveOrigins((current) => {
                      if (!current.has(square)) return current
                      const next = new Map(current)
                      next.delete(square)
                      return next
                    })
                  }}
                >
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
