'use client';
import { create } from 'zustand';
import { Board, Difficulty, GameMode, GameState, GameStatus, Move, Player, Position } from '@/types/checkers';
import { initBoard, getAllMoves, applyMove, checkGameStatus, getOpponent } from '@/lib/checkers/engine';
import { getBestMove } from '@/lib/checkers/ai';

interface GameStore {
  mode: GameMode;
  difficulty: Difficulty;
  humanPlayer: Player;
  aiThinking: boolean;
  boardHistory: Board[];
  state: GameState;

  setMode: (mode: GameMode) => void;
  setDifficulty: (d: Difficulty) => void;
  startGame: (mode: GameMode, difficulty?: Difficulty, humanPlayer?: Player) => void;
  selectPiece: (pos: Position) => void;
  makeMove: (move: Move) => void;
  resetGame: () => void;
  undoMove: () => void;
  triggerAI: () => void;
}

function makeInitialState(): GameState {
  const board = initBoard();
  return {
    board,
    currentPlayer: 1,
    selectedPos: null,
    validMoves: getAllMoves(board, 1),
    gameStatus: 'playing',
    moveHistory: [],
    capturedCount: { 1: 0, 2: 0 },
    turnCount: 0,
    startTime: null,
    endTime: null,
  };
}

export const useGameStore = create<GameStore>((set, get) => ({
  mode: 'vs_ai',
  difficulty: 'medium',
  humanPlayer: 2,
  aiThinking: false,
  boardHistory: [],
  state: makeInitialState(),

  setMode: (mode) => set({ mode }),
  setDifficulty: (difficulty) => set({ difficulty }),

  startGame: (mode, difficulty, humanPlayer = 2) => {
    const board = initBoard();
    const state: GameState = {
      board,
      currentPlayer: 1,
      selectedPos: null,
      validMoves: getAllMoves(board, 1),
      gameStatus: 'playing',
      moveHistory: [],
      capturedCount: { 1: 0, 2: 0 },
      turnCount: 0,
      startTime: Date.now(),
      endTime: null,
    };
    set({
      mode,
      difficulty: difficulty ?? get().difficulty,
      humanPlayer,
      state,
      boardHistory: [board],
      aiThinking: false,
    });

    // If AI goes first
    if (mode === 'vs_ai' && humanPlayer !== 1) {
      setTimeout(() => get().triggerAI(), 500);
    }
  },

  selectPiece: (pos) => {
    const { state, mode, humanPlayer } = get();
    if (state.gameStatus !== 'playing') return;
    if (mode === 'vs_ai' && state.currentPlayer !== humanPlayer) return;

    const piece = state.board[pos.row][pos.col];

    // If clicking a valid move destination
    if (state.selectedPos) {
      const move = state.validMoves.find(
        m => m.to.row === pos.row && m.to.col === pos.col
      );
      if (move) {
        get().makeMove(move);
        return;
      }
    }

    // Selecting a piece
    if (piece && piece.player === state.currentPlayer) {
      const allMoves = getAllMoves(state.board, state.currentPlayer);
      const movesForPiece = allMoves.filter(m => m.from.row === pos.row && m.from.col === pos.col);
      if (movesForPiece.length > 0) {
        set(s => ({ state: { ...s.state, selectedPos: pos, validMoves: movesForPiece } }));
      } else {
        // Piece can't move (mandatory captures exist elsewhere) — just deselect
        set(s => ({ state: { ...s.state, selectedPos: null, validMoves: allMoves } }));
      }
    } else {
      set(s => ({
        state: { ...s.state, selectedPos: null, validMoves: getAllMoves(s.state.board, s.state.currentPlayer) },
      }));
    }
  },

  makeMove: (move) => {
    const { state, mode, humanPlayer, boardHistory, difficulty } = get();
    const newBoard = applyMove(state.board, move);
    const nextPlayer = getOpponent(state.currentPlayer);
    const status = checkGameStatus(newBoard, nextPlayer);
    const capturedCount = {
      1: state.capturedCount[1] + move.captures.filter(c => state.board[c.row][c.col]?.player === 2).length,
      2: state.capturedCount[2] + move.captures.filter(c => state.board[c.row][c.col]?.player === 1).length,
    };

    const newState: GameState = {
      board: newBoard,
      currentPlayer: nextPlayer,
      selectedPos: null,
      validMoves: getAllMoves(newBoard, nextPlayer),
      gameStatus: status,
      moveHistory: [...state.moveHistory, move],
      capturedCount,
      turnCount: state.turnCount + 1,
      startTime: state.startTime,
      endTime: status !== 'playing' ? Date.now() : null,
    };

    set({ state: newState, boardHistory: [...boardHistory, newBoard] });

    if (status === 'playing' && mode === 'vs_ai' && nextPlayer !== humanPlayer) {
      set({ aiThinking: true });
      setTimeout(() => get().triggerAI(), 400);
    }
  },

  triggerAI: () => {
    const { state, difficulty, humanPlayer } = get();
    const aiPlayer = getOpponent(humanPlayer);
    const move = getBestMove(state.board, aiPlayer, difficulty);
    set({ aiThinking: false });
    if (move) get().makeMove(move);
  },

  resetGame: () => {
    const { mode, difficulty, humanPlayer } = get();
    get().startGame(mode, difficulty, humanPlayer);
  },

  undoMove: () => {
    const { boardHistory, state, mode, humanPlayer } = get();
    const stepsBack = mode === 'vs_ai' ? 2 : 1;
    if (boardHistory.length <= stepsBack) return;

    const newHistory = boardHistory.slice(0, -stepsBack);
    const newBoard = newHistory[newHistory.length - 1];
    const newMoveHistory = state.moveHistory.slice(0, -stepsBack);
    const prevPlayer = newMoveHistory.length % 2 === 0 ? (1 as Player) : (2 as Player);

    set({
      boardHistory: newHistory,
      state: {
        ...state,
        board: newBoard,
        currentPlayer: prevPlayer,
        selectedPos: null,
        validMoves: getAllMoves(newBoard, prevPlayer),
        gameStatus: 'playing',
        moveHistory: newMoveHistory,
      },
      aiThinking: false,
    });
  },
}));

