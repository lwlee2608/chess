import { findBestMove } from './search'
import type { SearchRequest } from './search'

self.onmessage = (event: MessageEvent<SearchRequest>) => {
  self.postMessage(findBestMove(event.data.position, event.data.difficulty))
}
