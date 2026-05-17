'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, Palette } from 'lucide-react';
import { BoardSkin, PieceSkin } from '@/types/checkers';

interface SkinSelectorProps {
  boardSkin: BoardSkin;
  pieceSkin: PieceSkin;
  onBoardSkin: (s: BoardSkin) => void;
  onPieceSkin: (s: PieceSkin) => void;
  isPro: boolean;
  onUpgrade: () => void;
}

const boardSkins: { id: BoardSkin; label: string; pro: boolean; preview: string }[] = [
  { id: 'classic', label: 'Классика', pro: false, preview: '🪵' },
  { id: 'marble', label: 'Мрамор', pro: false, preview: '⬜' },
  { id: 'neon', label: 'Неон', pro: true, preview: '💚' },
  { id: 'crystal', label: 'Кристалл', pro: true, preview: '💙' },
];

const pieceSkins: { id: PieceSkin; label: string; pro: boolean; preview: string }[] = [
  { id: 'default', label: 'Стандарт', pro: false, preview: '🔴' },
  { id: 'metallic', label: 'Металл', pro: false, preview: '🟠' },
  { id: 'royal', label: 'Роял', pro: true, preview: '🟣' },
  { id: 'cosmic', label: 'Космос', pro: true, preview: '🩷' },
];

export default function SkinSelector({ boardSkin, pieceSkin, onBoardSkin, onPieceSkin, isPro, onUpgrade }: SkinSelectorProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-700 text-slate-400 hover:text-white hover:border-amber-500/40 transition-all text-sm bg-slate-900/50"
      >
        <Palette size={15} />
        <span>Скины</span>
      </button>

      {open && (
        <motion.div
          className="absolute right-0 top-12 bg-slate-950 border border-slate-700/50 rounded-2xl p-4 w-72 z-30 shadow-xl"
          initial={{ opacity: 0, scale: 0.95, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
        >
          <h3 className="text-white font-semibold mb-3 text-sm">Доска</h3>
          <div className="grid grid-cols-2 gap-2 mb-4">
            {boardSkins.map(s => (
              <button
                key={s.id}
                onClick={() => {
                  if (s.pro && !isPro) { onUpgrade(); return; }
                  onBoardSkin(s.id);
                }}
                className={`flex items-center gap-2 p-2.5 rounded-xl border text-sm transition-all ${
                  boardSkin === s.id
                    ? 'border-amber-500 bg-amber-500/10 text-amber-400'
                    : 'border-slate-700 text-slate-400 hover:border-slate-500'
                }`}
              >
                <span>{s.preview}</span>
                <span>{s.label}</span>
                {s.pro && !isPro && <Lock size={11} className="ml-auto text-amber-500" />}
              </button>
            ))}
          </div>

          <h3 className="text-white font-semibold mb-3 text-sm">Шашки</h3>
          <div className="grid grid-cols-2 gap-2">
            {pieceSkins.map(s => (
              <button
                key={s.id}
                onClick={() => {
                  if (s.pro && !isPro) { onUpgrade(); return; }
                  onPieceSkin(s.id);
                }}
                className={`flex items-center gap-2 p-2.5 rounded-xl border text-sm transition-all ${
                  pieceSkin === s.id
                    ? 'border-amber-500 bg-amber-500/10 text-amber-400'
                    : 'border-slate-700 text-slate-400 hover:border-slate-500'
                }`}
              >
                <span>{s.preview}</span>
                <span>{s.label}</span>
                {s.pro && !isPro && <Lock size={11} className="ml-auto text-amber-500" />}
              </button>
            ))}
          </div>

          {!isPro && (
            <button
              onClick={() => { onUpgrade(); setOpen(false); }}
              className="w-full mt-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-black font-bold text-sm hover:from-amber-400 hover:to-amber-500 transition-all"
            >
              ✨ Upgrade to Pro
            </button>
          )}
        </motion.div>
      )}
    </div>
  );
}
