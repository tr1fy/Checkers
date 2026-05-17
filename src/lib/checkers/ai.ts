import { Board, Difficulty, Move, Player } from '@/types/checkers';
import { getAllMoves, applyMove, getOpponent, checkGameStatus } from './engine';

// Node budget: prevents exponential blowup on complex positions
const NODE_BUDGET = { easy: 500, medium: 5_000, hard: 30_000 };
let nodeCount = 0;

function evaluate(board: Board, aiPlayer: Player): number {
  let score = 0;

  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const cell = board[r][c];
      if (!cell) continue;

      const sign = cell.player === aiPlayer ? 1 : -1;
      const kingVal = cell.type === 'king' ? 3.0 : 1.0;
      score += sign * kingVal;

      if (cell.type === 'man') {
        const advance = cell.player === 1 ? r : 7 - r;
        score += sign * advance * 0.05;
        // Back row guard bonus
        const isBackRow = (cell.player === 1 && r === 0) || (cell.player === 2 && r === 7);
        if (isBackRow) score += sign * 0.3;
        // Center control
        if (c >= 2 && c <= 5 && r >= 2 && r <= 5) score += sign * 0.1;
      } else {
        // Kings like the center
        const cd = Math.abs(3.5 - r) + Math.abs(3.5 - c);
        score += sign * (0.2 - cd * 0.02);
      }
    }
  }

  return score;
}

function minimax(
  board: Board,
  depth: number,
  alpha: number,
  beta: number,
  maximizing: boolean,
  aiPlayer: Player
): number {
  nodeCount++;
  if (nodeCount > NODE_BUDGET.hard) return evaluate(board, aiPlayer); // budget exceeded

  const currentPlayer: Player = maximizing ? aiPlayer : getOpponent(aiPlayer);
  const status = checkGameStatus(board, currentPlayer);

  if (status !== 'playing') {
    if (status === 'player1_wins') return aiPlayer === 1 ? 1000 + depth : -1000 - depth;
    if (status === 'player2_wins') return aiPlayer === 2 ? 1000 + depth : -1000 - depth;
    return 0;
  }

  if (depth === 0) return evaluate(board, aiPlayer);

  const moves = getAllMoves(board, currentPlayer);

  if (maximizing) {
    let best = -Infinity;
    for (const move of moves) {
      const val = minimax(applyMove(board, move), depth - 1, alpha, beta, false, aiPlayer);
      if (val > best) best = val;
      if (val > alpha) alpha = val;
      if (beta <= alpha) break;
    }
    return best;
  } else {
    let best = Infinity;
    for (const move of moves) {
      const val = minimax(applyMove(board, move), depth - 1, alpha, beta, true, aiPlayer);
      if (val < best) best = val;
      if (val < beta) beta = val;
      if (beta <= alpha) break;
    }
    return best;
  }
}

// Depths: easy=2, medium=4, hard=6.
// Combined with the node budget these are safe for all positions.
const DEPTHS: Record<Difficulty, number> = { easy: 2, medium: 4, hard: 6 };

export function getBestMove(board: Board, player: Player, difficulty: Difficulty): Move | null {
  const moves = getAllMoves(board, player);
  if (moves.length === 0) return null;
  if (moves.length === 1) return moves[0];

  // Easy mode: 40% random
  if (difficulty === 'easy' && Math.random() < 0.4) {
    return moves[Math.floor(Math.random() * moves.length)];
  }

  nodeCount = 0; // reset budget for this search
  const depth = DEPTHS[difficulty];
  let bestMove = moves[0];
  let bestScore = -Infinity;

  // Shuffle for variety among equal-scored moves
  const shuffled = [...moves].sort(() => Math.random() - 0.5);

  for (const move of shuffled) {
    if (nodeCount > NODE_BUDGET[difficulty]) break;
    const score = minimax(applyMove(board, move), depth - 1, -Infinity, Infinity, false, player);
    if (score > bestScore) {
      bestScore = score;
      bestMove = move;
    }
  }

  return bestMove;
}
