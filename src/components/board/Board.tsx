'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/stores/gameStore';
import { Board as BoardType, Move, Position, BoardSkin, PieceSkin } from '@/types/checkers';
import Piece from './Piece';
import { isPlayable } from '@/lib/checkers/engine';

const boardSkins: Record<BoardSkin, { light: string; dark: string; border: string }> = {
  classic: { light: '#e8c87a', dark: '#7c4a1e', border: '#5c3311' },
  marble: { light: '#e8e8e8', dark: '#4a4a6a', border: '#2a2a4a' },
  neon: { light: '#0d1f0d', dark: '#001a00', border: '#00ff44' },
  crystal: { light: '#cce8ff', dark: '#1a3a5c', border: '#0a2a4c' },
};

interface BoardProps {
  boardSkin?: BoardSkin;
  pieceSkin?: PieceSkin;
}

export default function Board({ boardSkin = 'classic', pieceSkin = 'default' }: BoardProps) {
  const { state, selectPiece, aiThinking, humanPlayer, mode } = useGameStore();
  const { board, selectedPos, validMoves, currentPlayer, gameStatus } = state;

  const skin = boardSkins[boardSkin];

  const validDests = new Set(validMoves.map(m => `${m.to.row},${m.to.col}`));
  const selectedMoves = selectedPos
    ? validMoves.filter(m => m.from.row === selectedPos.row && m.from.col === selectedPos.col)
    : [];
  const selectedDests = new Set(selectedMoves.map(m => `${m.to.row},${m.to.col}`));

  function handleCellClick(row: number, col: number) {
    if (gameStatus !== 'playing') return;
    if (aiThinking) return;
    if ((mode === 'vs_ai' || mode === 'multiplayer') && currentPlayer !== humanPlayer) return;
    selectPiece({ row, col });
  }

  return (
    <div className="relative select-none w-full">
      {/* Board shadow/frame */}
      <div
        className="rounded-2xl overflow-hidden p-3"
        style={{ background: skin.border, boxShadow: '0 20px 60px rgba(0,0,0,0.7), 0 0 40px rgba(0,0,0,0.5)' }}
      >
        {/* Row labels */}
        <div className="grid grid-cols-[20px_1fr] gap-0">
          <div className="flex flex-col justify-around py-1">
            {[0,1,2,3,4,5,6,7].map(r => (
              <div key={r} className="text-xs text-amber-200/60 text-center h-[calc(100%/8)] flex items-center justify-center" style={{ height: '12.5%' }}>
                {8 - r}
              </div>
            ))}
          </div>

          <div>
            {/* Col labels top */}
            <div className="grid grid-cols-8 mb-1">
              {['a','b','c','d','e','f','g','h'].map(c => (
                <div key={c} className="text-xs text-amber-200/60 text-center">{c}</div>
              ))}
            </div>

            {/* Board grid */}
            <div
              className="grid grid-cols-8"
              style={{ border: `2px solid ${skin.border}` }}
            >
              {board.map((row, rIdx) =>
                row.map((cell, cIdx) => {
                  const isLight = (rIdx + cIdx) % 2 === 0;
                  const isSelected = selectedPos?.row === rIdx && selectedPos?.col === cIdx;
                  const isValidDest = selectedDests.has(`${rIdx},${cIdx}`);
                  const hasMovableFrom = isPlayable(rIdx, cIdx) && cell?.player === currentPlayer &&
                    validMoves.some(m => m.from.row === rIdx && m.from.col === cIdx);

                  let bg = isLight ? skin.light : skin.dark;
                  if (isSelected) bg = '#3b82f6';
                  if (isValidDest && !cell) bg = isLight ? '#86efac' : '#4ade80';

                  return (
                    <div
                      key={`${rIdx}-${cIdx}`}
                      onClick={() => handleCellClick(rIdx, cIdx)}
                      className="relative aspect-square cursor-pointer transition-colors duration-100"
                      style={{
                        background: bg,
                        minWidth: 0,
                        boxShadow: isSelected ? 'inset 0 0 12px rgba(59,130,246,0.6)' : undefined,
                      }}
                    >
                      {/* Valid move indicator */}
                      {isValidDest && !cell && (
                        <motion.div
                          className="absolute inset-0 flex items-center justify-center"
                          initial={{ opacity: 0, scale: 0 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0 }}
                        >
                          <div className="w-[35%] h-[35%] rounded-full bg-green-400 opacity-80" />
                        </motion.div>
                      )}

                      {/* Hover highlight for movable pieces */}
                      {hasMovableFrom && !isSelected && (
                        <div
                          className="absolute inset-0 rounded-sm opacity-0 hover:opacity-30 transition-opacity"
                          style={{ background: 'rgba(255,255,255,0.3)' }}
                        />
                      )}

                      {/* Piece */}
                      {cell && (
                        <AnimatePresence>
                          <motion.div
                            className="absolute inset-0 flex items-center justify-center"
                            initial={{ scale: 0.5, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0, opacity: 0, rotate: 180 }}
                            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                            layout
                          >
                            <Piece
                              player={cell.player}
                              isKing={cell.type === 'king'}
                              isSelected={isSelected}
                              skin={pieceSkin}
                            />
                          </motion.div>
                        </AnimatePresence>
                      )}

                      {/* Valid capture indicator */}
                      {isValidDest && cell && (
                        <motion.div
                          className="absolute inset-0 rounded-sm"
                          style={{ background: 'rgba(220,38,38,0.4)', border: '3px solid #ef4444' }}
                          animate={{ opacity: [0.5, 1, 0.5] }}
                          transition={{ duration: 1, repeat: Infinity }}
                        />
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>

      {/* AI Thinking overlay */}
      {aiThinking && (
        <motion.div
          className="absolute inset-0 flex items-center justify-center rounded-2xl"
          style={{ background: 'rgba(0,0,0,0.2)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="bg-slate-900/90 border border-amber-500/30 rounded-xl px-6 py-3 flex items-center gap-3">
            <motion.div
              className="w-3 h-3 bg-amber-400 rounded-full"
              animate={{ scale: [1, 1.5, 1] }}
              transition={{ duration: 0.6, repeat: Infinity }}
            />
            <span className="text-amber-300 font-medium text-sm">AI думает...</span>
          </div>
        </motion.div>
      )}
    </div>
  );
}
