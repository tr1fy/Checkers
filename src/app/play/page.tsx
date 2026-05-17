'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Users, Monitor, ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Board from '@/components/board/Board';
import GamePanel from '@/components/game/GamePanel';
import AICoach from '@/components/game/AICoach';
import WinScreen from '@/components/game/WinScreen';
import SkinSelector from '@/components/game/SkinSelector';
import UpgradeModal from '@/components/ui/UpgradeModal';
import { useGameStore } from '@/stores/gameStore';
import { Difficulty, Player, BoardSkin, PieceSkin } from '@/types/checkers';

type SetupStep = 'mode' | 'ai_difficulty' | 'playing';

export default function PlayPage() {
  const { startGame, state, mode } = useGameStore();
  const [step, setStep] = useState<SetupStep>('mode');
  const [selectedMode, setSelectedMode] = useState<'vs_ai' | 'local'>('vs_ai');
  const [selectedDiff, setSelectedDiff] = useState<Difficulty>('medium');
  const [showCoach, setShowCoach] = useState(false);
  const [showWin, setShowWin] = useState(false);
  const [boardSkin, setBoardSkin] = useState<BoardSkin>('classic');
  const [pieceSkin, setPieceSkin] = useState<PieceSkin>('default');
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [isPro] = useState(false);

  useEffect(() => {
    if (state.gameStatus !== 'playing' && step === 'playing') {
      setTimeout(() => setShowWin(true), 600);
    }
  }, [state.gameStatus]);

  function handleStart(modeChoice: 'vs_ai' | 'local') {
    setSelectedMode(modeChoice);
    if (modeChoice === 'local') {
      startGame('local', 'medium', 2);
      setStep('playing');
    } else {
      setStep('ai_difficulty');
    }
  }

  function handleDifficultySelect(diff: Difficulty) {
    setSelectedDiff(diff);
    startGame('vs_ai', diff, 2);
    setStep('playing');
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <Header />

      <main className="pt-20 px-4 pb-10">
        <AnimatePresence mode="wait">

          {/* Step 1: Mode selection */}
          {step === 'mode' && (
            <motion.div
              key="mode"
              className="max-w-2xl mx-auto py-16"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="text-center mb-12">
                <h1 className="text-4xl font-black text-white mb-3">Выберите режим</h1>
                <p className="text-slate-400">Как вы хотите сыграть?</p>
              </div>

              <div className="grid sm:grid-cols-2 gap-6">
                <button
                  onClick={() => handleStart('vs_ai')}
                  className="group p-8 rounded-2xl border border-slate-700 hover:border-amber-500/50 bg-slate-900/50 hover:bg-amber-500/5 transition-all text-left"
                >
                  <div className="w-12 h-12 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                    <Bot size={24} className="text-blue-400" />
                  </div>
                  <h3 className="text-white font-bold text-xl mb-2">Против AI</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    Сыграйте против умного компьютерного игрока. 3 уровня сложности.
                  </p>
                </button>

                <button
                  onClick={() => handleStart('local')}
                  className="group p-8 rounded-2xl border border-slate-700 hover:border-amber-500/50 bg-slate-900/50 hover:bg-amber-500/5 transition-all text-left"
                >
                  <div className="w-12 h-12 rounded-xl bg-green-500/20 border border-green-500/30 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                    <Monitor size={24} className="text-green-400" />
                  </div>
                  <h3 className="text-white font-bold text-xl mb-2">Два игрока</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    Играйте вдвоём на одном экране. Передавайте ход друг другу.
                  </p>
                </button>
              </div>

              <div className="mt-6 text-center">
                <Link href="/multiplayer" className="inline-flex items-center gap-2 text-amber-400 hover:text-amber-300 transition-colors font-medium">
                  <Users size={18} />
                  Играть с другом онлайн →
                </Link>
              </div>
            </motion.div>
          )}

          {/* Step 2: Difficulty */}
          {step === 'ai_difficulty' && (
            <motion.div
              key="difficulty"
              className="max-w-lg mx-auto py-16"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <button
                onClick={() => setStep('mode')}
                className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-8 text-sm"
              >
                <ChevronLeft size={18} /> Назад
              </button>

              <div className="text-center mb-10">
                <h1 className="text-4xl font-black text-white mb-3">Сложность AI</h1>
                <p className="text-slate-400">Выберите уровень противника</p>
              </div>

              <div className="flex flex-col gap-4">
                {[
                  { id: 'easy' as Difficulty, label: 'Лёгкий', emoji: '😊', desc: 'Для знакомства с игрой. AI делает ошибки.', color: 'border-green-500/40 hover:border-green-500' },
                  { id: 'medium' as Difficulty, label: 'Средний', emoji: '🧠', desc: 'Сбалансированный опыт. AI играет неплохо.', color: 'border-amber-500/40 hover:border-amber-500' },
                  { id: 'hard' as Difficulty, label: 'Сложный', emoji: '🔥', desc: 'Почти идеальная игра. Победить непросто!', color: 'border-red-500/40 hover:border-red-500' },
                ].map(d => (
                  <button
                    key={d.id}
                    onClick={() => handleDifficultySelect(d.id)}
                    className={`flex items-center gap-5 p-5 rounded-2xl border bg-slate-900/50 transition-all text-left group ${d.color}`}
                  >
                    <span className="text-3xl">{d.emoji}</span>
                    <div>
                      <p className="text-white font-bold text-lg group-hover:text-amber-400 transition-colors">{d.label}</p>
                      <p className="text-slate-400 text-sm">{d.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Step 3: Playing */}
          {step === 'playing' && (
            <motion.div
              key="playing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="max-w-6xl mx-auto"
            >
              {/* Top bar */}
              <div className="flex items-center justify-between mb-6">
                <button
                  onClick={() => setStep('mode')}
                  className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm"
                >
                  <ChevronLeft size={18} /> Выйти из игры
                </button>
                <SkinSelector
                  boardSkin={boardSkin}
                  pieceSkin={pieceSkin}
                  onBoardSkin={setBoardSkin}
                  onPieceSkin={setPieceSkin}
                  isPro={isPro}
                  onUpgrade={() => setShowUpgrade(true)}
                />
              </div>

              {/* Game layout */}
              <div className="flex flex-col lg:flex-row gap-6 items-start justify-center">
                <div className="flex-shrink-0" style={{ width: 'min(90vw, 560px)' }}>
                  <Board boardSkin={boardSkin} pieceSkin={pieceSkin} />
                </div>
                <GamePanel onAnalyze={() => setShowCoach(true)} />
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </main>

      {/* Overlays */}
      <AnimatePresence>
        {showWin && step === 'playing' && (
          <WinScreen onAnalyze={() => { setShowWin(false); setShowCoach(true); }} />
        )}
        {showCoach && (
          <AICoach onClose={() => setShowCoach(false)} />
        )}
        {showUpgrade && (
          <UpgradeModal
            onClose={() => setShowUpgrade(false)}
            onUpgrade={() => { alert('Stripe integration coming soon!'); setShowUpgrade(false); }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
