'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Users, Monitor, Trophy, TrendingUp, Shield, Zap, ChevronRight } from 'lucide-react';
import VideoIntro from '@/components/intro/VideoIntro';
import Header from '@/components/layout/Header';

export default function HomePage() {
  const [showIntro, setShowIntro] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const seen = sessionStorage.getItem('intro_seen');
    if (seen) setShowIntro(false);
  }, []);

  function handleIntroComplete() {
    sessionStorage.setItem('intro_seen', '1');
    setShowIntro(false);
  }

  if (!mounted) return null;

  return (
    <>
      {showIntro && <VideoIntro onComplete={handleIntroComplete} />}

      <AnimatePresence>
        {!showIntro && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="min-h-screen bg-[#0a0a0f]"
          >
            <Header />

            {/* Hero */}
            <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
              {/* Background grid */}
              <div
                className="absolute inset-0 opacity-20"
                style={{
                  backgroundImage: 'linear-gradient(rgba(245,158,11,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(245,158,11,0.1) 1px, transparent 1px)',
                  backgroundSize: '60px 60px',
                }}
              />

              {/* Radial glow */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-15"
                style={{ background: 'radial-gradient(circle, rgba(245,158,11,0.4) 0%, transparent 70%)' }}
              />

              <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
                {/* Logo mark */}
                <motion.div
                  className="flex justify-center mb-8"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                >
                  <div className="relative">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-400/20 to-amber-600/20 border border-amber-500/30 flex items-center justify-center backdrop-blur-sm">
                      <svg viewBox="0 0 1557 1211" className="w-12 h-10 fill-amber-400">
                        <path fillRule="evenodd" clipRule="evenodd" d="M594.949 57.1444C591.838 57.5158 581.91 59.1823 572.887 60.8471L556.48 63.8768L556.427 155.097L556.374 246.317H652.488H748.601V151.11V55.902L674.603 56.1847C633.905 56.3393 598.06 56.7711 594.949 57.1444ZM369.65 259.986C364.901 284.368 364.19 298.121 364.096 367.448L364 438.618H460.116H556.231L556.229 343.41L556.227 248.202H464.085H371.945L369.65 259.986ZM750.486 343.41V438.618H845.694H940.901V343.41V248.202H845.694H750.486V343.41ZM559.715 441.977C556.772 442.571 556.559 449.777 556.887 537.241L557.243 631.861L652.922 632.349L748.601 632.837V537.025V441.214L655.75 441.274C604.683 441.306 561.466 441.623 559.715 441.977ZM373.447 635.141C373.687 640.882 385.526 671.559 392.919 685.592C419.317 735.701 456.819 772.566 506.981 797.716C549.178 814.573L556.195 815.828L555.776 725.73L555.358 635.631L464.392 635.141C414.36 634.873 373.436 634.873 373.447 635.141ZM751.744 635.946C751.052 636.636 750.486 679.48 750.486 731.154V825.104H824.641C867.741 825.104 903.467 824.28 909.951 823.137C935.044 818.713 940.903 817.187 940.952 815.07C940.999 812.985 940.977 669.101 940.926 645.529L940.901 634.689H846.951C795.277 634.689 752.434 635.254 751.744 635.946Z"/>
                      </svg>
                    </div>
                  </div>
                </motion.div>

                <motion.h1
                  className="text-6xl md:text-8xl font-black text-white mb-4 tracking-tight"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  CHECK<span className="text-amber-400">ERS</span>
                </motion.h1>

                <motion.p
                  className="text-xl md:text-2xl text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  Классическая игра. Современный опыт.<br />
                  <span className="text-amber-400/80">Бросьте вызов AI или другу онлайн.</span>
                </motion.p>

                {/* CTA Buttons */}
                <motion.div
                  className="flex flex-wrap gap-4 justify-center mb-16"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <Link
                    href="/play"
                    className="group flex items-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 text-black font-black text-lg hover:from-amber-400 hover:to-amber-500 transition-all shadow-xl shadow-amber-500/25"
                  >
                    <Bot size={22} />
                    Играть против AI
                    <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <Link
                    href="/multiplayer"
                    className="flex items-center gap-3 px-8 py-4 rounded-2xl border border-slate-600 text-white font-bold text-lg hover:border-amber-500/50 hover:bg-amber-500/5 transition-all"
                  >
                    <Users size={22} />
                    Мультиплеер
                  </Link>
                </motion.div>

                {/* Stats bar */}
                <motion.div
                  className="flex flex-wrap gap-8 justify-center text-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7 }}
                >
                  {[
                    { label: 'Игроков онлайн', value: '1,247' },
                    { label: 'Партий сыграно', value: '89,412' },
                    { label: 'Стран', value: '47' },
                  ].map((s, i) => (
                    <div key={i}>
                      <div className="text-2xl font-black text-amber-400">{s.value}</div>
                      <div className="text-sm text-slate-500">{s.label}</div>
                    </div>
                  ))}
                </motion.div>
              </div>
            </section>

            {/* Features */}
            <section className="py-24 px-4">
              <div className="max-w-5xl mx-auto">
                <motion.div
                  className="text-center mb-16"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                >
                  <h2 className="text-4xl font-black text-white mb-4">Не просто шашки</h2>
                  <p className="text-slate-400 text-lg">Полноценная игровая платформа с умным AI</p>
                </motion.div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[
                    {
                      icon: <Bot size={24} />,
                      title: 'Умный AI',
                      desc: '3 уровня сложности с алгоритмом Minimax. От новичка до гроссмейстера.',
                      color: 'text-blue-400',
                      bg: 'bg-blue-500/10 border-blue-500/20',
                    },
                    {
                      icon: <Users size={24} />,
                      title: 'Мультиплеер',
                      desc: 'Играйте с другом по ссылке в реальном времени через WebSockets.',
                      color: 'text-green-400',
                      bg: 'bg-green-500/10 border-green-500/20',
                    },
                    {
                      icon: <TrendingUp size={24} />,
                      title: 'AI Coach',
                      desc: 'После партии ИИ анализирует ходы и объясняет ошибки.',
                      color: 'text-amber-400',
                      bg: 'bg-amber-500/10 border-amber-500/20',
                    },
                    {
                      icon: <Trophy size={24} />,
                      title: 'Лидерборд',
                      desc: 'Глобальный рейтинг игроков с фильтром по городам.',
                      color: 'text-purple-400',
                      bg: 'bg-purple-500/10 border-purple-500/20',
                    },
                    {
                      icon: <Shield size={24} />,
                      title: 'История партий',
                      desc: 'Сохранение всех игр и возможность пересмотра ходов.',
                      color: 'text-red-400',
                      bg: 'bg-red-500/10 border-red-500/20',
                    },
                    {
                      icon: <Zap size={24} />,
                      title: 'Pro скины',
                      desc: 'Кастомные доски и шашки для уникального стиля игры.',
                      color: 'text-yellow-400',
                      bg: 'bg-yellow-500/10 border-yellow-500/20',
                    },
                  ].map((f, i) => (
                    <motion.div
                      key={i}
                      className={`p-6 rounded-2xl border ${f.bg} backdrop-blur-sm`}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1 }}
                    >
                      <div className={`${f.color} mb-3`}>{f.icon}</div>
                      <h3 className="text-white font-bold text-lg mb-2">{f.title}</h3>
                      <p className="text-slate-400 text-sm leading-relaxed">{f.desc}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </section>

            {/* Board preview / CTA */}
            <section className="py-20 px-4 border-t border-slate-800/50">
              <div className="max-w-2xl mx-auto text-center">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                >
                  <h2 className="text-4xl font-black text-white mb-4">Готов сыграть?</h2>
                  <p className="text-slate-400 mb-8">Регистрация не нужна. Просто нажми и играй.</p>
                  <Link
                    href="/play"
                    className="inline-flex items-center gap-3 px-10 py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 text-black font-black text-xl hover:from-amber-400 hover:to-amber-500 transition-all shadow-2xl shadow-amber-500/30"
                  >
                    Начать игру →
                  </Link>
                </motion.div>
              </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-slate-800/50 py-8 px-4 text-center text-slate-600 text-sm">
              <p>© 2025 Checkers. Создан с ❤️ для nFactorial School.</p>
            </footer>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
