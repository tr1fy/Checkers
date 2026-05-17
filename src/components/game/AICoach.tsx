'use client';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertTriangle, CheckCircle, Info, XCircle, TrendingUp } from 'lucide-react';
import { useGameStore } from '@/stores/gameStore';
import { analyzeGame, buildGameRecords } from '@/lib/checkers/coach';
import { CoachAdvice } from '@/types/checkers';

interface AICoachProps {
  onClose: () => void;
}

const icons = {
  info: <Info size={16} className="text-blue-400" />,
  warning: <AlertTriangle size={16} className="text-amber-400" />,
  error: <XCircle size={16} className="text-red-400" />,
  success: <CheckCircle size={16} className="text-green-400" />,
};

const borders = {
  info: 'border-blue-500/30 bg-blue-500/5',
  warning: 'border-amber-500/30 bg-amber-500/5',
  error: 'border-red-500/30 bg-red-500/5',
  success: 'border-green-500/30 bg-green-500/5',
};

export default function AICoach({ onClose }: AICoachProps) {
  const { state, boardHistory, humanPlayer } = useGameStore();
  const [advice, setAdvice] = useState<CoachAdvice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      const records = buildGameRecords(boardHistory, state.moveHistory, humanPlayer);
      const result = analyzeGame(records);
      setAdvice(result);
      setLoading(false);
    }, 800);
  }, []);

  const score = advice.filter(a => a.severity === 'success').length;
  const errors = advice.filter(a => a.severity === 'error').length;
  const warnings = advice.filter(a => a.severity === 'warning').length;
  const total = state.moveHistory.length;
  const accuracy = total > 0 ? Math.max(0, Math.round(100 - (errors * 20 + warnings * 8))) : 100;

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.7)' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-slate-950 border border-slate-700/50 rounded-2xl w-full max-w-md max-h-[90vh] overflow-hidden flex flex-col"
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
              <TrendingUp size={18} className="text-amber-400" />
            </div>
            <div>
              <h2 className="text-white font-bold">AI Coach</h2>
              <p className="text-slate-500 text-xs">Анализ вашей партии</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        {loading ? (
          <div className="flex-1 flex items-center justify-center p-10">
            <div className="text-center">
              <motion.div
                className="w-12 h-12 border-3 border-amber-400 border-t-transparent rounded-full mx-auto mb-4"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                style={{ borderWidth: 3 }}
              />
              <p className="text-slate-400">Анализирую вашу игру...</p>
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4">
            {/* Score summary */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-slate-900 rounded-xl p-3 text-center">
                <div className="text-2xl font-bold text-amber-400">{accuracy}%</div>
                <div className="text-xs text-slate-500 mt-1">Точность</div>
              </div>
              <div className="bg-slate-900 rounded-xl p-3 text-center">
                <div className="text-2xl font-bold text-white">{total}</div>
                <div className="text-xs text-slate-500 mt-1">Ходов</div>
              </div>
              <div className="bg-slate-900 rounded-xl p-3 text-center">
                <div className="text-2xl font-bold text-green-400">{score}</div>
                <div className="text-xs text-slate-500 mt-1">Отличных</div>
              </div>
            </div>

            {/* Result */}
            <div className="text-center py-2">
              {state.gameStatus === 'player2_wins' ? (
                <p className="text-green-400 font-bold text-lg">🏆 Победа!</p>
              ) : state.gameStatus === 'player1_wins' ? (
                <p className="text-red-400 font-bold text-lg">❌ Поражение</p>
              ) : (
                <p className="text-slate-400 font-bold text-lg">🤝 Ничья</p>
              )}
            </div>

            {/* Advice list */}
            <div className="flex flex-col gap-3">
              {advice.map((a, i) => (
                <motion.div
                  key={i}
                  className={`p-3 rounded-xl border ${borders[a.severity]} flex items-start gap-3`}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <div className="mt-0.5 flex-shrink-0">{icons[a.severity]}</div>
                  <p className="text-sm text-slate-300 leading-relaxed">{a.description}</p>
                </motion.div>
              ))}
            </div>

            {/* Motivational footer */}
            <div className="text-center text-slate-500 text-sm pt-2">
              {accuracy >= 80 ? '🌟 Отличная игра! Продолжайте в том же духе.' :
               accuracy >= 60 ? '💪 Хорошая попытка! Ещё немного практики.' :
               '📚 Каждая партия — урок. Не сдавайтесь!'}
            </div>
          </div>
        )}

        <div className="p-4 border-t border-slate-800">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium transition-colors"
          >
            Закрыть
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
