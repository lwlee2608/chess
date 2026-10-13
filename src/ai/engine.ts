import type { Move, Position } from '../engine/types'
import type { Difficulty } from './difficulty'
import type { SearchRequest } from './search'
import { parseUci, toUci } from './uci'

const STOCKFISH_URL = `${import.meta.env.BASE_URL}stockfish/stockfish-19-lite-single.js`
const STOCKFISH_MOVETIME_MS = 2000

export interface MoveRequest {
  position: Position
  moves: readonly Move[]
  difficulty: Difficulty
}

export function requestMove(
  { position, moves, difficulty }: MoveRequest,
  onMove: (move: Move | null) => void,
  onError: () => void,
): () => void {
  if (difficulty === 'grandmaster') {
    const worker = new Worker(STOCKFISH_URL)
    worker.onmessage = (event: MessageEvent<string>) => {
      const best = /^bestmove (\S+)/.exec(event.data)
      if (best) onMove(parseUci(best[1]))
    }
    worker.onerror = onError
    worker.postMessage('uci')
    worker.postMessage(['position startpos', ...(moves.length > 0 ? ['moves', ...moves.map(toUci)] : [])].join(' '))
    worker.postMessage(`go movetime ${STOCKFISH_MOVETIME_MS}`)
    return () => worker.terminate()
  }

  const worker = new Worker(new URL('./worker.ts', import.meta.url), { type: 'module' })
  worker.onmessage = (event: MessageEvent<Move | null>) => onMove(event.data)
  worker.onerror = onError
  worker.postMessage({ position, difficulty } satisfies SearchRequest)
  return () => worker.terminate()
}
