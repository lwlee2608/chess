import { describe, expect, it } from 'vitest'
import { squareToIndex } from '../engine/types'
import { parseUci, toUci } from './uci'

describe('uci', () => {
  it('round-trips castling and promotion moves', () => {
    const castle = { from: squareToIndex('e1'), to: squareToIndex('g1') }
    const promote = { from: squareToIndex('b7'), to: squareToIndex('a8'), promotion: 'knight' as const }
    expect(toUci(castle)).toBe('e1g1')
    expect(toUci(promote)).toBe('b7a8n')
    expect(parseUci('e1g1')).toEqual(castle)
    expect(parseUci('b7a8n')).toEqual(promote)
  })

  it('rejects a missing best move', () => {
    expect(parseUci('(none)')).toBeNull()
  })
})
