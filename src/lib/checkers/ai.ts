import { Board, Difficulty, Move, Player } from '@/types/checkers';
import { getAllMoves, applyMove, getOpponent, checkGameStatus } from './engine';

function evaluate(board: Board, aiPlayer: Player): number {
  let score = 0;
  const opp = getOpponent(aiPlayer);

  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const cell = board[r][c];
      if (!cell) continue;

      const isAI = cell.player === aiPlayer;
      const sign = isAI ? 1 : -1;
      const kingVal = cell.type === 'king' ? 3.0 : 1.0;
      score += sign * kingVal;

      if (cell.type === 'man') {
        const advance = cell.player === 1 ? r : 7 - r;
        score += sign * advance * 0.05;
        // Back row protection
        const isBackRow = (cell.player === 1 && r === 0) || (cell.player === 2 && r === 7);
        if (isBackRow) score += sign * 0.3;
        // Center control
        if (c >= 2 && c <= 5 && r >= 2 && r <= 5) score += sign * 0.1;
      } else {
        // Kings prefer center
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
      best = Math.max(best, val);
      alpha = Math.max(alpha, val);
      if (beta <= alpha) break;
    }
    return best;
  } else {
    let best = Infinity;
    for (const move of moves) {
      const val = minimax(applyMove(board, move), depth - 1, alpha, beta, true, aiPlayer);
      best = Math.min(best, val);
      beta = Math.min(beta, val);
      if (beta <= alpha) break;
    }
    return best;
  }
}

export function getBestMove(board: Board, player: Player, difficulty: Difficulty): Move | null {
  const moves = getAllMoves(board, player);
  if (moves.length === 0) return null;
  if (moves.length === 1) return moves[0];

  // Easy: random 40% of the time
  if (difficulty === 'easy' && Math.random() < 0.4) {
    return moves[Math.floor(Math.random() * moves.length)];
  }

  const depth = difficulty === 'easy' ? 2 : difficulty === 'medium' ? 4 : 7;
  let bestMove = moves[0];
  let bestScore = -Infinity;

  // Shuffle for variety on equal scores
  const shuffled = [...moves].sort(() => Math.random() - 0.5);

  for (const move of shuffled) {
    const score = minimax(applyMove(board, move), depth - 1, -Infinity, Infinity, false, player);
    if (score > bestScore) {
      bestScore = score;
      bestMove = move;
    }
  }

  return bestMove;
}
