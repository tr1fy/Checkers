import { Board, Cell, Move, Piece, Player, Position, GameStatus } from '@/types/checkers';

export function initBoard(): Board {
  const board: Board = Array(8).fill(null).map(() => Array(8).fill(null));
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 8; col++) {
      if (isPlayable(row, col)) board[row][col] = { player: 1, type: 'man' };
    }
  }
  for (let row = 5; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      if (isPlayable(row, col)) board[row][col] = { player: 2, type: 'man' };
    }
  }
  return board;
}

export function isPlayable(row: number, col: number): boolean {
  return (row + col) % 2 === 1;
}

function inBounds(row: number, col: number): boolean {
  return row >= 0 && row < 8 && col >= 0 && col < 8;
}

export function getOpponent(player: Player): Player {
  return player === 1 ? 2 : 1;
}

export function cloneBoard(board: Board): Board {
  return board.map(row => row.map(cell => (cell ? { ...cell } : null)));
}

function wouldBeKing(piece: Piece, toRow: number): boolean {
  if (piece.type === 'king') return false;
  return (piece.player === 1 && toRow === 7) || (piece.player === 2 && toRow === 0);
}

function moveDirs(piece: Piece): [number, number][] {
  if (piece.type === 'king') return [[-1, -1], [-1, 1], [1, -1], [1, 1]];
  return piece.player === 1 ? [[1, -1], [1, 1]] : [[-1, -1], [-1, 1]];
}

// NO board cloning — uses position tracking for visited squares instead.
// This is the key performance fix: cloning 8x8 boards recursively was the RAM killer.
function getCaptureChains(
  board: Board,
  row: number,
  col: number,
  capturedSoFar: Position[],
  visitedSquares: Position[],
  piece: Piece,
  from: Position
): Move[] {
  const result: Move[] = [];
  const dirs: [number, number][] = [[-1, -1], [-1, 1], [1, -1], [1, 1]];

  if (piece.type === 'king') {
    for (const [dr, dc] of dirs) {
      // Scan along diagonal; already-captured pieces are transparent
      let scanRow = row + dr;
      let scanCol = col + dc;
      let opponentPos: Position | null = null;

      while (inBounds(scanRow, scanCol)) {
        const cell = board[scanRow][scanCol];
        const alreadyCaptured = capturedSoFar.some(p => p.row === scanRow && p.col === scanCol);

        if (cell === null || alreadyCaptured) {
          scanRow += dr;
          scanCol += dc;
          continue;
        }

        if (cell.player !== piece.player) {
          opponentPos = { row: scanRow, col: scanCol };
        }
        break;
      }

      if (!opponentPos) continue;

      // King can land on any empty square beyond the captured piece
      let landRow = opponentPos.row + dr;
      let landCol = opponentPos.col + dc;

      while (inBounds(landRow, landCol)) {
        const landCell = board[landRow][landCol];
        const alreadyCaptured = capturedSoFar.some(p => p.row === landRow && p.col === landCol);
        const isOriginalFrom = landRow === from.row && landCol === from.col;
        const alreadyVisited = visitedSquares.some(v => v.row === landRow && v.col === landCol);

        if (!isOriginalFrom && !alreadyCaptured && landCell !== null) break;
        if (!alreadyVisited) {
          const newCaptured: Position[] = [...capturedSoFar, opponentPos];
          const newVisited: Position[] = [...visitedSquares, { row: landRow, col: landCol }];
          const continuations = getCaptureChains(board, landRow, landCol, newCaptured, newVisited, piece, from);

          if (continuations.length > 0) {
            result.push(...continuations);
          } else {
            result.push({ from, to: { row: landRow, col: landCol }, captures: newCaptured, isKingPromotion: false });
          }
        }

        landRow += dr;
        landCol += dc;
      }
    }
    return result;
  }

  // Men (шашка): 1-square jump only
  for (const [dr, dc] of dirs) {
    const midRow = row + dr;
    const midCol = col + dc;
    const toRow = row + 2 * dr;
    const toCol = col + 2 * dc;

    if (!inBounds(toRow, toCol)) continue;

    const midCell = board[midRow][midCol];
    if (!midCell || midCell.player === piece.player) continue;
    if (capturedSoFar.some(p => p.row === midRow && p.col === midCol)) continue;

    const isOriginalFrom = toRow === from.row && toCol === from.col;
    if (!isOriginalFrom) {
      if (board[toRow][toCol] !== null) continue;
      if (visitedSquares.some(v => v.row === toRow && v.col === toCol)) continue;
    }

    const newCaptured: Position[] = [...capturedSoFar, { row: midRow, col: midCol }];
    const becameKing = wouldBeKing(piece, toRow);

    if (becameKing) {
      result.push({ from, to: { row: toRow, col: toCol }, captures: newCaptured, isKingPromotion: true });
      continue;
    }

    const newVisited: Position[] = [...visitedSquares, { row: toRow, col: toCol }];
    const continuations = getCaptureChains(board, toRow, toCol, newCaptured, newVisited, piece, from);

    if (continuations.length > 0) {
      result.push(...continuations);
    } else {
      result.push({ from, to: { row: toRow, col: toCol }, captures: newCaptured, isKingPromotion: false });
    }
  }

  return result;
}

function getRegularMoves(board: Board, row: number, col: number, piece: Piece): Move[] {
  const moves: Move[] = [];
  if (piece.type === 'king') {
    // King slides along the entire diagonal
    for (const [dr, dc] of [[-1,-1],[-1,1],[1,-1],[1,1]] as [number,number][]) {
      let nr = row + dr, nc = col + dc;
      while (inBounds(nr, nc) && board[nr][nc] === null) {
        moves.push({ from: { row, col }, to: { row: nr, col: nc }, captures: [], isKingPromotion: false });
        nr += dr;
        nc += dc;
      }
    }
    return moves;
  }
  for (const [dr, dc] of moveDirs(piece)) {
    const nr = row + dr;
    const nc = col + dc;
    if (inBounds(nr, nc) && board[nr][nc] === null) {
      moves.push({
        from: { row, col },
        to: { row: nr, col: nc },
        captures: [],
        isKingPromotion: wouldBeKing(piece, nr),
      });
    }
  }
  return moves;
}

export function getAllMoves(board: Board, player: Player): Move[] {
  const captures: Move[] = [];
  const regulars: Move[] = [];

  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = board[r][c];
      if (!piece || piece.player !== player) continue;
      const from: Position = { row: r, col: c };
      captures.push(...getCaptureChains(board, r, c, [], [from], piece, from));
      regulars.push(...getRegularMoves(board, r, c, piece));
    }
  }

  return captures.length > 0 ? captures : regulars;
}

export function applyMove(board: Board, move: Move): Board {
  const newBoard = cloneBoard(board);
  const piece = newBoard[move.from.row][move.from.col]!;

  newBoard[move.to.row][move.to.col] = move.isKingPromotion ? { ...piece, type: 'king' } : piece;
  newBoard[move.from.row][move.from.col] = null;

  for (const cap of move.captures) {
    newBoard[cap.row][cap.col] = null;
  }

  return newBoard;
}

export function checkGameStatus(board: Board, currentPlayer: Player): GameStatus {
  const moves = getAllMoves(board, currentPlayer);
  if (moves.length === 0) {
    return currentPlayer === 1 ? 'player2_wins' : 'player1_wins';
  }

  let p1 = 0, p2 = 0;
  for (const row of board) {
    for (const cell of row) {
      if (cell?.player === 1) p1++;
      if (cell?.player === 2) p2++;
    }
  }

  if (p1 === 0) return 'player2_wins';
  if (p2 === 0) return 'player1_wins';

  return 'playing';
}

export function countPieces(board: Board): { 1: number; 2: number } {
  let p1 = 0, p2 = 0;
  for (const row of board) {
    for (const cell of row) {
      if (cell?.player === 1) p1++;
      if (cell?.player === 2) p2++;
    }
  }
  return { 1: p1, 2: p2 };
}
