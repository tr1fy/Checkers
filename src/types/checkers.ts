export type Player = 1 | 2;
export type PieceType = 'man' | 'king';

export interface Piece {
  player: Player;
  type: PieceType;
}

export type Cell = Piece | null;
export type Board = Cell[][];

export interface Position {
  row: number;
  col: number;
}

export interface Move {
  from: Position;
  to: Position;
  captures: Position[];
  isKingPromotion: boolean;
}

export type GameStatus = 'playing' | 'player1_wins' | 'player2_wins' | 'draw';
export type Difficulty = 'easy' | 'medium' | 'hard';
export type GameMode = 'vs_ai' | 'local' | 'multiplayer';
export type BoardSkin = 'classic' | 'marble' | 'neon' | 'crystal';
export type PieceSkin = 'default' | 'metallic' | 'royal' | 'cosmic';

export interface GameState {
  board: Board;
  currentPlayer: Player;
  selectedPos: Position | null;
  validMoves: Move[];
  gameStatus: GameStatus;
  moveHistory: Move[];
  capturedCount: { 1: number; 2: number };
  turnCount: number;
  startTime: number | null;
  endTime: number | null;
}

export interface RoomData {
  id: string;
  code: string;
  host_id: string;
  guest_id: string | null;
  status: 'waiting' | 'playing' | 'finished';
  game_state: GameState | null;
  host_player: Player;
}

export interface LeaderboardEntry {
  id: string;
  username: string;
  avatar_url: string | null;
  city: string | null;
  rating: number;
  games_played: number;
  games_won: number;
}

export interface CoachAdvice {
  moveIndex: number;
  type: 'missed_capture' | 'vulnerable_piece' | 'good_move' | 'missed_king' | 'blunder';
  description: string;
  severity: 'info' | 'warning' | 'error' | 'success';
}

export interface UserProfile {
  id: string;
  username: string;
  avatar_url: string | null;
  city: string | null;
  rating: number;
  games_played: number;
  games_won: number;
  created_at: string;
}
