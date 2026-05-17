import { Board, CoachAdvice, Move, Player } from '@/types/checkers';
import { getAllMoves, applyMove, getOpponent } from './engine';
import { getBestMove } from './ai';

interface GameRecord {
  board: Board;
  move: Move;
  player: Player;
}

export function analyzeGame(records: GameRecord[]): CoachAdvice[] {
  const advice: CoachAdvice[] = [];

  for (let i = 0; i < records.length; i++) {
    const { board, move, player } = records[i];
    const allMoves = getAllMoves(board, player);

    // Missed mandatory capture: player had captures but picked a non-capture? (shouldn't happen with proper engine, but check chain length)
    const maxCaptures = Math.max(0, ...allMoves.map(m => m.captures.length));
    if (move.captures.length > 0 && move.captures.length < maxCaptures) {
      advice.push({
        moveIndex: i,
        type: 'missed_capture',
        description: `Ход ${i + 1}: Вы взяли ${move.captures.length} шашку, но могли взять ${maxCaptures}! Всегда ищите самую длинную цепочку.`,
        severity: 'warning',
      });
    }

    // Missed king promotion
    const hadKingMove = allMoves.some(m => m.isKingPromotion);
    if (hadKingMove && !move.isKingPromotion) {
      advice.push({
        moveIndex: i,
        type: 'missed_king',
        description: `Ход ${i + 1}: Вы могли провести шашку в дамки! Дамки в 3× сильнее обычных шашек.`,
        severity: 'warning',
      });
    }

    // Check if the move left a piece vulnerable
    const newBoard = applyMove(board, move);
    const oppMoves = getAllMoves(newBoard, getOpponent(player));
    const captureAfter = oppMoves.filter(m => m.captures.length > 0);
    if (captureAfter.length > 0 && move.captures.length === 0) {
      const maxOppCaptures = Math.max(...captureAfter.map(m => m.captures.length));
      if (maxOppCaptures >= 2) {
        advice.push({
          moveIndex: i,
          type: 'vulnerable_piece',
          description: `Ход ${i + 1}: Этот ход оставил шашку под угрозой — соперник может взять ${maxOppCaptures} ваших шашки!`,
          severity: 'error',
        });
      } else {
        advice.push({
          moveIndex: i,
          type: 'vulnerable_piece',
          description: `Ход ${i + 1}: Осторожно! Этот ход оставил шашку без защиты.`,
          severity: 'warning',
        });
      }
    }

    // Good move: captured + opponent has fewer responses
    if (move.captures.length >= 2) {
      advice.push({
        moveIndex: i,
        type: 'good_move',
        description: `Ход ${i + 1}: Отличный ход! Двойное взятие — вы значительно улучшили позицию.`,
        severity: 'success',
      });
    }
  }

  // Summary advice
  if (advice.length === 0 && records.length > 5) {
    advice.push({
      moveIndex: -1,
      type: 'good_move',
      description: 'Партия сыграна чисто — значительных ошибок не обнаружено.',
      severity: 'success',
    });
  }

  return advice.slice(0, 8); // Return top 8 most important pieces of advice
}

export function buildGameRecords(
  boardHistory: Board[],
  moves: Move[],
  humanPlayer: Player
): GameRecord[] {
  const records: GameRecord[] = [];
  for (let i = 0; i < moves.length && i < boardHistory.length; i++) {
    const player: Player = i % 2 === 0 ? humanPlayer : getOpponent(humanPlayer);
    records.push({ board: boardHistory[i], move: moves[i], player });
  }
  return records;
}
