'use client';
import { motion } from 'framer-motion';
import { Trophy, RotateCcw, TrendingUp, Home } from 'lucide-react';
import { useGameStore } from '@/stores/gameStore';
import Link from 'next/link';

interface WinScreenProps {
  onAnalyze: () => void;
}

export default function WinScreen({ onAnalyze }: WinScreenProps) {
  const { state, resetGame, mode, humanPlayer } = useGameStore();
  const { gameStatus, moveHistory, startTime, endTime, capturedCount } = state;

  const humanWon =
    (gameStatus === 'player1_wins' && humanPlayer === 1) ||
    (gameStatus === 'player2_wins' && humanPlayer === 2);

  const duration = startTime && endTime ? Math.floor((endTime - startTime) / 1000) : 0;
  const mins = Math.floor(duration / 60);
  const secs = duration % 60;

  const title = mode === 'local'
    ? gameStatus === 'player1_wins' ? '🔴 Красные победили!' : '⚫ Чёрные победили!'
    : humanWon ? '🏆 Победа!' : '❌ Поражение';

  const subtitle = humanWon
    ? 'Отличная игра! Вы сыграли мастерски.'
    : mode === 'local' ? 'Хорошая партия!' : 'Не расстраивайтесь! Попробуйте снова.';

  return (
    <motion.div
      className="fixed inset-0 z-40 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.75)' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <motion.div
        className="bg-slate-950 border border-slate-700/50 rounded-3xl p-8 w-full max-w-sm text-center"
        initial={{ scale: 0.8, y: 30 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
      >
        {/* Trophy animation */}
        <motion.div
          className="text-6xl mb-4"
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
        >
          {humanWon ? '🏆' : mode === 'local' ? '🏆' : '😔'}
        </motion.div>

        <h2 className={`text-3xl font-black mb-2 ${humanWon || mode === 'local' ? 'text-amber-400' : 'text-slate-400'}`}>
          {title}
        </h2>
        <p className="text-slate-400 mb-6 text-sm">{subtitle}</p>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-slate-900 rounded-xl p-3">
            <div className="text-xl font-bold text-white">{moveHistory.length}</div>
            <div className="text-xs text-slate-500">Ходов</div>
          </div>
          <div className="bg-slate-900 rounded-xl p-3">
            <div className="text-xl font-bold text-amber-400">
              {mins}:{secs.toString().padStart(2, '0')}
            </div>
            <div className="text-xs text-slate-500">Время</div>
          </div>
          <div className="bg-slate-900 rounded-xl p-3">
            <div className="text-xl font-bold text-red-400">
              {capturedCount[humanPlayer]}
            </div>
            <div className="text-xs text-slate-500">Взято</div>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <button
            onClick={onAnalyze}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-black font-bold hover:from-amber-400 hover:to-amber-500 transition-all flex items-center justify-center gap-2"
          >
            <TrendingUp size={18} /> AI Coach — Анализ
          </button>
          <button
            onClick={resetGame}
            className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium transition-colors flex items-center justify-center gap-2"
          >
            <RotateCcw size={16} /> Играть снова
          </button>
          <Link
            href="/"
            className="w-full py-3 rounded-xl border border-slate-700 text-slate-400 hover:text-white hover:border-slate-500 transition-colors flex items-center justify-center gap-2 text-sm"
          >
            <Home size={16} /> На главную
          </Link>
        </div>
      </motion.div>
    </motion.div>
  );
}
