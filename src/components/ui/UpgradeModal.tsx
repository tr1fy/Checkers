'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Zap, Crown, Palette, BarChart3, Globe } from 'lucide-react';

interface UpgradeModalProps {
  onClose: () => void;
  onUpgrade: () => void;
}

const features = [
  { icon: <Palette size={18} />, title: 'Эксклюзивные скины', desc: 'Нeon, Crystal, Royal и Cosmic темы' },
  { icon: <BarChart3 size={18} />, title: 'Расширенная аналитика', desc: 'Детальный разбор каждого хода' },
  { icon: <Globe size={18} />, title: 'Глобальный рейтинг', desc: 'Конкурируйте с игроками по всему миру' },
  { icon: <Crown size={18} />, title: 'Pro-значок', desc: 'Выделяйтесь в таблице лидеров' },
];

export default function UpgradeModal({ onClose, onUpgrade }: UpgradeModalProps) {
  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ background: 'rgba(0,0,0,0.8)' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="bg-slate-950 border border-amber-500/30 rounded-3xl p-8 w-full max-w-sm relative overflow-hidden"
          initial={{ scale: 0.85, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.85, y: 20 }}
        >
          {/* Glow bg */}
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          <button onClick={onClose} className="absolute top-4 right-4 text-slate-600 hover:text-slate-400 transition-colors">
            <X size={20} />
          </button>

          <div className="text-center mb-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-amber-500/30">
              <Zap size={28} className="text-black" />
            </div>
            <h2 className="text-2xl font-black text-white mb-1">Checkers Pro</h2>
            <p className="text-slate-400 text-sm">Разблокируйте весь потенциал</p>
          </div>

          <div className="flex flex-col gap-3 mb-6">
            {features.map((f, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="text-amber-400 mt-0.5 flex-shrink-0">{f.icon}</div>
                <div>
                  <p className="text-white text-sm font-medium">{f.title}</p>
                  <p className="text-slate-500 text-xs">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mb-4">
            <span className="text-3xl font-black text-white">$4.99</span>
            <span className="text-slate-500 text-sm ml-1">/ месяц</span>
          </div>

          <button
            onClick={onUpgrade}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-600 text-black font-black text-lg hover:from-amber-300 hover:to-amber-500 transition-all shadow-lg shadow-amber-500/30"
          >
            ✨ Получить Pro
          </button>
          <p className="text-center text-slate-600 text-xs mt-3">Отмена в любое время · Безопасная оплата</p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
