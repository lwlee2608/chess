import type { Position } from '../engine/types'
import { findBestMove } from './search'

self.onmessage = (event: MessageEvent<Position>) => {
  self.postMessage(findBestMove(event.data, 3))
}
