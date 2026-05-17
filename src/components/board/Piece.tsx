'use client';
import { motion } from 'framer-motion';
import { Player, PieceSkin } from '@/types/checkers';

interface PieceProps {
  player: Player;
  isKing: boolean;
  isSelected: boolean;
  skin?: PieceSkin;
}

const skinStyles: Record<PieceSkin, { p1: string; p2: string }> = {
  default: {
    p1: 'from-red-500 via-red-600 to-red-800 border-red-300',
    p2: 'from-slate-600 via-slate-700 to-slate-900 border-slate-400',
  },
  metallic: {
    p1: 'from-orange-400 via-red-500 to-red-700 border-orange-300',
    p2: 'from-zinc-400 via-zinc-600 to-zinc-800 border-zinc-300',
  },
  royal: {
    p1: 'from-purple-400 via-purple-600 to-purple-900 border-purple-300',
    p2: 'from-blue-400 via-blue-600 to-blue-900 border-blue-300',
  },
  cosmic: {
    p1: 'from-pink-400 via-fuchsia-600 to-purple-900 border-pink-300',
    p2: 'from-cyan-400 via-teal-600 to-cyan-900 border-cyan-300',
  },
};

export default function Piece({ player, isKing, isSelected, skin = 'default' }: PieceProps) {
  const style = skinStyles[skin];
  const colorClass = player === 1 ? style.p1 : style.p2;

  return (
    <motion.div
      className="relative w-full h-full flex items-center justify-center"
      animate={isSelected ? { scale: 1.15 } : { scale: 1 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
    >
      {/* Outer glow when selected */}
      {isSelected && (
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{ background: 'rgba(96,165,250,0.35)', boxShadow: '0 0 20px rgba(96,165,250,0.8)' }}
          animate={{ opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 1.2, repeat: Infinity }}
        />
      )}

      {/* Piece body */}
      <div
        className={`
          relative w-[78%] h-[78%] rounded-full
          bg-gradient-to-br ${colorClass}
          border-2 shadow-lg cursor-pointer
          flex items-center justify-center
          transition-all duration-150
        `}
        style={{
          boxShadow: isSelected
            ? '0 0 16px 4px rgba(96,165,250,0.7), 0 4px 8px rgba(0,0,0,0.5)'
            : '0 4px 10px rgba(0,0,0,0.6), inset 0 2px 4px rgba(255,255,255,0.2)',
        }}
      >
        {/* Highlight reflection */}
        <div
          className="absolute top-[10%] left-[15%] w-[35%] h-[25%] rounded-full opacity-40"
          style={{ background: 'radial-gradient(ellipse, rgba(255,255,255,0.9) 0%, transparent 70%)' }}
        />

        {/* King crown */}
        {isKing && (
          <motion.div
            className="text-yellow-300 select-none drop-shadow-lg"
            style={{ fontSize: '1.1em', lineHeight: 1, textShadow: '0 0 8px rgba(251,191,36,0.9)' }}
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            ♛
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
