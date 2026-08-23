import { useEffect, useRef } from 'react'

interface MoveListProps {
  moves: readonly string[]
}

export function MoveList({ moves }: MoveListProps) {
  const listRef = useRef<HTMLDivElement>(null)
  const rows = Array.from({ length: Math.ceil(moves.length / 2) }, (_, index) => ({
    number: index + 1,
    white: moves[index * 2],
    black: moves[index * 2 + 1],
  }))

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight })
  }, [moves.length])

  const latest = moves.length - 1

  return (
    <div className="move-list" ref={listRef} aria-label="Move history">
      <div className="move-list__header">
        <span>Move history</span>
        <span>{moves.length} ply</span>
      </div>
      <ol>
        {rows.map((row, index) => (
          <li key={row.number}>
            <span>{row.number}.</span>
            <strong className={index * 2 === latest ? 'move--latest' : ''}>{row.white}</strong>
            <strong className={index * 2 + 1 === latest ? 'move--latest' : ''}>{row.black}</strong>
          </li>
        ))}
      </ol>
    </div>
  )
}
