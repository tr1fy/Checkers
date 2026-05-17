'use client';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/stores/gameStore';
import { countPieces } from '@/lib/checkers/engine';
import { RotateCcw, Undo2, TrendingUp, Clock, Shield, Crown } from 'lucide-react';

interface GamePanelProps {
  onAnalyze?: () => void;
}

export default function GamePanel({ onAnalyze }: GamePanelProps) {
  const { state, resetGame, undoMove, mode, humanPlayer, difficulty, aiThinking } = useGameStore();
  const { gameStatus, capturedCount, currentPlayer, moveHistory, turnCount, startTime } = state;
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!startTime || gameStatus !== 'playing') return;
    const id = setInterval(() => setElapsed(Date.now() - startTime), 1000);
    return () => clearInterval(id);
  }, [startTime, gameStatus]);

  function formatTime(ms: number) {
    const s = Math.floor(ms / 1000);
    return `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;
  }

  const diffLabel = { easy: 'Лёгкий', medium: 'Средний', hard: 'Сложный' }[difficulty];

  const pieces = countPieces(state.board);
  const p1Pieces = pieces[1];
  const p2Pieces = pieces[2];

  const statusMessage = () => {
    if (gameStatus === 'player1_wins') return mode === 'vs_ai' && humanPlayer === 2 ? '❌ AI победил' : '🏆 Красные победили!';
    if (gameStatus === 'player2_wins') return mode === 'vs_ai' && humanPlayer === 2 ? '🏆 Вы победили!' : '🏆 Чёрные победили!';
    if (aiThinking) return '🤖 AI думает...';
    if (mode === 'vs_ai') return currentPlayer === humanPlayer ? '🎯 Ваш ход' : '⏳ Ход AI';
    return `${currentPlayer === 1 ? '🔴 Красные' : '⚫ Чёрные'} ходят`;
  };

  return (
    <div className="flex flex-col gap-4 w-full max-w-xs">
      {/* Status card */}
      <motion.div
        className="bg-slate-900/80 border border-slate-700/50 rounded-2xl p-4 backdrop-blur-sm"
        layout
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={statusMessage()}
            className="text-center"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
          >
            <p className={`text-lg font-bold ${
              gameStatus !== 'playing' ? 'text-amber-400' : 'text-white'
            }`}>
              {statusMessage()}
            </p>
          </motion.div>
        </AnimatePresence>

        {/* Timer */}
        <div className="flex items-center justify-center gap-2 mt-2 text-slate-400 text-sm">
          <Clock size={14} />
          <span>{formatTime(elapsed)}</span>
          <span className="text-slate-600">·</span>
          <span>Ход {turnCount}</span>
        </div>

        {mode === 'vs_ai' && (
          <div className="mt-2 text-center">
            <span className="text-xs text-amber-500/70 bg-amber-500/10 px-2 py-0.5 rounded-full">
              AI: {diffLabel}
            </span>
          </div>
        )}
      </motion.div>

      {/* Pieces count */}
      <div className="bg-slate-900/80 border border-slate-700/50 rounded-2xl p-4 backdrop-blur-sm">
        <h3 className="text-xs text-slate-500 uppercase tracking-wider mb-3 text-center">Шашки на доске</h3>

        {/* Player 2 (Black) */}
        <div className="flex items-center gap-3 mb-3">
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-slate-600 to-slate-900 border-2 border-slate-400 shadow-md flex-shrink-0" />
          <div className="flex-1">
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm text-slate-300">{mode === 'vs_ai' && humanPlayer === 2 ? 'Вы' : 'Чёрные'}</span>
              <span className="text-amber-400 font-bold">{p2Pieces}</span>
            </div>
            <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-slate-500 to-slate-300 rounded-full"
                animate={{ width: `${(p2Pieces / 12) * 100}%` }}
                transition={{ duration: 0.4 }}
              />
            </div>
          </div>
        </div>

        {/* Player 1 (Red) */}
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-red-500 to-red-800 border-2 border-red-300 shadow-md flex-shrink-0" />
          <div className="flex-1">
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm text-slate-300">{mode === 'vs_ai' && humanPlayer === 1 ? 'Вы' : mode === 'vs_ai' ? 'AI' : 'Красные'}</span>
              <span className="text-amber-400 font-bold">{p1Pieces}</span>
            </div>
            <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-red-700 to-red-400 rounded-full"
                animate={{ width: `${(p1Pieces / 12) * 100}%` }}
                transition={{ duration: 0.4 }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Move history */}
      <div className="bg-slate-900/80 border border-slate-700/50 rounded-2xl p-4 backdrop-blur-sm flex-1 max-h-48 overflow-hidden">
        <h3 className="text-xs text-slate-500 uppercase tracking-wider mb-2">История ходов</h3>
        <div className="overflow-y-auto max-h-32 flex flex-col gap-1 scrollbar-thin">
          {moveHistory.slice(-12).reverse().map((m, i) => {
            const cols = 'abcdefgh';
            const from = `${cols[m.from.col]}${8 - m.from.row}`;
            const to = `${cols[m.to.col]}${8 - m.to.row}`;
            const moveNum = moveHistory.length - i;
            return (
              <div key={i} className="flex items-center gap-2 text-xs">
                <span className="text-slate-600 w-4">{moveNum}.</span>
                <span className="text-slate-400">
                  {from}→{to}
                  {m.captures.length > 0 && <span className="text-red-400 ml-1">×{m.captures.length}</span>}
                  {m.isKingPromotion && <span className="text-amber-400 ml-1">♛</span>}
                </span>
              </div>
            );
          })}
          {moveHistory.length === 0 && (
            <p className="text-slate-600 text-xs">Игра только началась...</p>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="flex gap-2">
        <button
          onClick={undoMove}
          disabled={moveHistory.length === 0 || gameStatus !== 'playing' || aiThinking}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-slate-700 text-slate-400 hover:text-white hover:border-slate-500 disabled:opacity-30 disabled:cursor-not-allowed transition-all text-sm bg-slate-900/50"
        >
          <Undo2 size={15} /> Отмена
        </button>
        <button
          onClick={resetGame}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-slate-700 text-slate-400 hover:text-white hover:border-amber-500/50 hover:text-amber-400 transition-all text-sm bg-slate-900/50"
        >
          <RotateCcw size={15} /> Заново
        </button>
      </div>

      {/* Analyze button (after game) */}
      {gameStatus !== 'playing' && onAnalyze && (
        <motion.button
          onClick={onAnalyze}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-black font-bold hover:from-amber-400 hover:to-amber-500 transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <TrendingUp size={18} />
          AI Coach — Анализ партии
        </motion.button>
      )}
    </div>
  );
}
