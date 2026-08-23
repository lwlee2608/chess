import { applyMove, getAllLegalMoves, getGameStatus } from './game'
import { isKingInCheck } from './moves'
import type { Move, Position } from './types'
import { FILES, indexToSquare } from './types'

const PIECE_LETTER = { king: 'K', queen: 'Q', rook: 'R', bishop: 'B', knight: 'N', pawn: '' } as const

export function toSan(position: Position, move: Move): string {
  const piece = position.board[move.from]
  if (!piece) return ''

  if (piece.type === 'king' && Math.abs(move.to - move.from) === 2) {
    const next = applyMove(position, move)
    const suffix = getGameStatus(next).type === 'checkmate' ? '#' : ''
    return `${move.to > move.from ? 'O-O' : 'O-O-O'}${suffix}`
  }

  const isEnPassant = piece.type === 'pawn' && move.to === position.enPassantTarget && position.board[move.to] === null
  const isCapture = position.board[move.to] !== null || isEnPassant
  let disambiguation = ''

  if (piece.type !== 'pawn') {
    const alternatives = getAllLegalMoves(position).filter((candidate) => {
      if (candidate.from === move.from || candidate.to !== move.to) return false
      const candidatePiece = position.board[candidate.from]
      return candidatePiece?.color === piece.color && candidatePiece.type === piece.type
    })
    if (alternatives.length > 0) {
      const sameFile = alternatives.some((candidate) => candidate.from % 8 === move.from % 8)
      const sameRank = alternatives.some((candidate) => Math.floor(candidate.from / 8) === Math.floor(move.from / 8))
      disambiguation = !sameFile ? FILES[move.from % 8] : !sameRank ? String(8 - Math.floor(move.from / 8)) : indexToSquare(move.from)
    }
  } else if (isCapture) {
    disambiguation = FILES[move.from % 8]
  }

  const next = applyMove(position, move)
  const nextStatus = getGameStatus(next)
  const suffix = nextStatus.type === 'checkmate' ? '#' : isKingInCheck(next, next.turn) ? '+' : ''
  const promotion = move.promotion ? `=${PIECE_LETTER[move.promotion]}` : ''

  return `${PIECE_LETTER[piece.type]}${disambiguation}${isCapture ? 'x' : ''}${indexToSquare(move.to)}${promotion}${suffix}`
}
