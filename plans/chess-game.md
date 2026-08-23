# Chess Game (Web)

## Destination
A browser chess game with rules written from scratch: legal moves, checkmate and every draw rule, playable hot-seat or against a built-in AI, with move history, undo, an optional clock, and a game that survives a page refresh.

## Decisions
- **Opponent in v1?** — Human vs a built-in AI, and hot-seat two-player on the same board.
- **Stack?** — React + TypeScript + Vite, static build, no server. `research` Node 22.21 / npm 10.9 installed; repo is empty so nothing constrains the choice.
- **Rules engine?** — Written from scratch in TypeScript. No chess.js.
- **How to move a piece?** — Click source then target, *and* drag-and-drop, sharing one selection state.
- **AI strength?** — Minimax with alpha-beta pruning, fixed depth 3, evaluating material plus piece-square tables.
- **Where does the AI run?** — In a Web Worker. `research` A depth-3 search on the main thread blocks React from repainting, so the board would freeze mid-move; a Worker is the only way to keep the UI live without changing the search.
- **Piece art?** — Inline SVG components, Cburnett public-domain shapes. No binary assets.
- **Side choice?** — New Game screen picks White, Black, or two-player-local. Board flips when playing Black.
- **Draw rules?** — All of them: stalemate, threefold repetition, fifty-move, insufficient material.
- **Clock?** — Optional, off by default, presets Off / 5+0 / 10+0 / 15+10.
- **Extras in scope?** — Algebraic move history, undo/takeback, save across refresh, chess clock. All four confirmed.

## Progress
Phase 6 of 6 · 35/35 tasks

### Phase 1 — Move pieces around a real board
Two people can push pieces on screen and every piece moves the way it should, though nothing stops an illegal king capture yet.
- [x] Scaffold the Vite + React + TS app (package.json, vite.config.ts, index.html, src/main.tsx)
- [x] Define square, piece, and position types plus the starting board (src/engine/types.ts, src/engine/board.ts)
- [x] Generate pseudo-legal moves for all six piece types (src/engine/moves.ts)
- [x] Build the inline SVG piece set as React components (src/ui/pieces.tsx)
- [x] Render the 8x8 board with rank/file coordinates and pieces (src/ui/Board.tsx)
- [x] Click to select a piece and highlight its legal targets (src/ui/Board.tsx, src/state/useGame.ts)
- [x] Add drag-and-drop that reuses the same selection state, with a touch fallback (src/ui/Board.tsx)
- [x] Apply the move, alternate the turn, and show whose move it is (src/engine/game.ts, src/ui/App.tsx)
**Demo:** `npm run dev`, open http://localhost:5173 — play 1. e4 e5 2. Nf3 Nc6 by clicking, then move a knight back by dragging it.

### Phase 2 — Play a game that actually ends
The board now enforces real chess: you cannot leave your king in check, and the game announces mate, stalemate, or a draw.
- [x] Add square-attack detection and an is-king-in-check test (src/engine/moves.ts)
- [x] Filter out pseudo-legal moves that leave your own king in check (src/engine/game.ts)
- [x] Implement castling with rights tracking, empty-square and pass-through-check rules (src/engine/game.ts)
- [x] Implement the en-passant target square and capture (src/engine/moves.ts, src/engine/game.ts)
- [x] Implement promotion in the engine and add the piece-picker dialog (src/engine/game.ts, src/ui/PromotionDialog.tsx)
- [x] Detect checkmate and stalemate and show a game-over banner (src/engine/game.ts, src/ui/App.tsx)
- [x] Detect threefold repetition, the fifty-move rule, and insufficient material (src/engine/game.ts)
- [x] Highlight the king's square while it is in check (src/ui/Board.tsx)
**Demo:** Play 1. f3 e5 2. g4 Qh4# — the banner reads "Checkmate — Black wins". Then start over and castle kingside; the rook jumps with the king.

### Phase 3 — Play against the computer
Pick a color from a New Game screen and the machine answers your moves.
- [x] Write the position evaluation: material plus piece-square tables (src/ai/evaluate.ts)
- [x] Implement minimax with alpha-beta pruning to depth 3 (src/ai/search.ts)
- [x] Run the search inside a Web Worker and post the chosen move back (src/ai/worker.ts)
- [x] Build the New Game screen: play White, play Black, or two-player-local (src/ui/NewGameDialog.tsx)
- [x] Flip the board when playing Black and let the AI open as White (src/ui/Board.tsx, src/state/useGame.ts)
- [x] Show a thinking indicator and block input while the AI searches (src/ui/App.tsx)
**Demo:** New Game → Play as Black. The computer opens for White, the board is flipped, and hanging your queen on the next move gets it taken.

### Phase 4 — Follow the game and take a move back
A notation panel records the game and a button walks a bad move back.
- [x] Generate SAN including disambiguation, capture, check and mate suffixes, and O-O (src/engine/san.ts)
- [x] Build the move-history panel, paired by move number (src/ui/MoveList.tsx)
- [x] Keep an undoable move stack in engine state instead of mutating the board (src/engine/game.ts)
- [x] Wire the Undo button: one ply in hot-seat, two plies against the AI (src/ui/App.tsx)
- [x] Highlight the from/to squares of the last move played (src/ui/Board.tsx)
**Demo:** Play 1. e4 e5 2. Nf3 — the panel reads `1. e4 e5  2. Nf3`. Hit Undo against the AI and both its reply and your move disappear.

### Phase 5 — Play with a clock
Games can be timed, and running out of time loses.
- [x] Add time-control presets to the New Game screen (Off / 5+0 / 10+0 / 15+10) (src/ui/NewGameDialog.tsx)
- [x] Count down the side to move and apply the increment on move completion (src/state/useClock.ts)
- [x] Display both clocks, highlighting the one that is running (src/ui/Clock.tsx)
- [x] End the game on flag fall — a draw instead if the winner has insufficient material (src/engine/game.ts, src/ui/App.tsx)
**Demo:** New Game → 5+0 → play a few moves and watch your clock tick only on your turn. Let one side sit until it hits 0:00; the banner reads "White wins on time".

### Phase 6 — Come back to an unfinished game
Closing the tab no longer throws the game away.
- [x] Serialize position, history, mode, and clock state to localStorage after every move (src/state/persist.ts)
- [x] Restore the saved game on load with both clocks paused (src/state/persist.ts, src/state/useGame.ts)
- [x] Offer "Resume game" or "New game" on load when a save exists (src/ui/App.tsx)
- [x] Clear the save when the game ends or a new game starts (src/state/persist.ts)
**Demo:** Play five moves, refresh the browser, choose Resume — the same position, move list, and clock times come back.

## Notes
- The engine is pure TypeScript with no React imports, so the Web Worker in Phase 3 can import it directly and the UI stays a thin layer over it.
- Phase 4's move stack is what makes undo cheap; Phase 2's repetition detection needs a per-position key, so both argue for storing history rather than mutating a single board.
- Visual direction is not locked. Default to a clean two-tone board and a neutral UI; restyling is a one-file change.

## Out of scope
- Online multiplayer — needs a server, rooms, and reconnection handling; nothing in the local game blocks adding it later.
- PGN import/export and engine analysis — SAN generation in Phase 4 is the groundwork, but neither is needed to play.
- Opening book, deeper or time-budgeted search — depth 3 is the agreed strength; iterative deepening can replace src/ai/search.ts without touching the UI.
- Accounts, ratings, and saved game archives — a single in-progress game in localStorage is the agreed persistence.
