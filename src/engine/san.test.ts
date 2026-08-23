import { describe, expect, it } from 'vitest'
import { createStartingPosition } from './board'
import { applyMove } from './game'
import { toSan } from './san'
import { squareToIndex } from './types'
import type { Move, Position } from './types'

function move(from: string, to: string): Move {
  return { from: squareToIndex(from), to: squareToIndex(to) }
}

function play(position: Position, from: string, to: string): Position {
  return applyMove(position, move(from, to))
}

describe('toSan', () => {
  it('writes the opening demo', () => {
    let position = createStartingPosition()
    expect(toSan(position, move('e2', 'e4'))).toBe('e4')
    position = play(position, 'e2', 'e4')
    expect(toSan(position, move('e7', 'e5'))).toBe('e5')
    position = play(position, 'e7', 'e5')
    expect(toSan(position, move('g1', 'f3'))).toBe('Nf3')
  })

  it('adds mate suffix', () => {
    let position = createStartingPosition()
    for (const [from, to] of [['f2', 'f3'], ['e7', 'e5'], ['g2', 'g4']] as const) position = play(position, from, to)
    expect(toSan(position, move('d8', 'h4'))).toBe('Qh4#')
  })
})
