interface MoveListProps {
  moves: readonly string[]
}

export function MoveList({ moves }: MoveListProps) {
  const rows = Array.from({ length: Math.ceil(moves.length / 2) }, (_, index) => ({
    number: index + 1,
    white: moves[index * 2],
    black: moves[index * 2 + 1],
  }))

  return (
    <div className="move-list" aria-label="Move history">
      <div className="move-list__header">
        <span>Move history</span>
        <span>{moves.length} ply</span>
      </div>
      <ol>
        {rows.map((row) => (
          <li key={row.number}>
            <span>{row.number}.</span>
            <strong>{row.white}</strong>
            <strong>{row.black}</strong>
          </li>
        ))}
      </ol>
    </div>
  )
}
