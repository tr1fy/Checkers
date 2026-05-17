'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Link2, Users, Plus, ArrowRight, Loader2 } from 'lucide-react';
import Header from '@/components/layout/Header';
import { createClient } from '@/lib/supabase/client';

function generateCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

export default function MultiplayerPage() {
  const router = useRouter();
  const [tab, setTab] = useState<'create' | 'join'>('create');
  const [joinCode, setJoinCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleCreate() {
    setLoading(true);
    setError('');
    try {
      const supabase = createClient();
      const code = generateCode();
      const { data, error: err } = await supabase
        .from('rooms')
        .insert({ code, status: 'waiting', game_state: null })
        .select()
        .single();

      if (err) throw err;
      router.push(`/multiplayer/${data.id}?host=1`);
    } catch (e: any) {
      // Fallback: create local room ID without DB
      const fakeId = `local-${generateCode()}`;
      router.push(`/multiplayer/${fakeId}?host=1&code=${generateCode()}`);
    } finally {
      setLoading(false);
    }
  }

  async function handleJoin() {
    if (!joinCode.trim()) { setError('Введите код комнаты'); return; }
    setLoading(true);
    setError('');
    try {
      const supabase = createClient();
      const { data, error: err } = await supabase
        .from('rooms')
        .select()
        .eq('code', joinCode.toUpperCase())
        .eq('status', 'waiting')
        .single();

      if (err || !data) { setError('Комната не найдена или уже занята'); return; }
      router.push(`/multiplayer/${data.id}`);
    } catch {
      setError('Не удалось подключиться. Проверьте код.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <Header />
      <main className="pt-24 px-4 pb-16">
        <div className="max-w-lg mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <div className="w-16 h-16 rounded-2xl bg-green-500/20 border border-green-500/30 flex items-center justify-center mx-auto mb-5">
              <Users size={28} className="text-green-400" />
            </div>
            <h1 className="text-4xl font-black text-white mb-3">Мультиплеер</h1>
            <p className="text-slate-400">Играйте с другом в реальном времени</p>
          </motion.div>

          {/* Tabs */}
          <div className="flex bg-slate-900 rounded-2xl p-1.5 mb-6">
            {(['create', 'join'] as const).map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex-1 py-3 rounded-xl font-semibold text-sm transition-all ${
                  tab === t
                    ? 'bg-amber-500 text-black shadow-lg'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {t === 'create' ? '+ Создать комнату' : 'Войти по коду'}
              </button>
            ))}
          </div>

          <motion.div
            key={tab}
            initial={{ opacity: 0, x: tab === 'create' ? -20 : 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-slate-900/60 border border-slate-700/50 rounded-2xl p-8"
          >
            {tab === 'create' ? (
              <div className="text-center">
                <div className="w-14 h-14 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center mx-auto mb-5">
                  <Plus size={24} className="text-amber-400" />
                </div>
                <h3 className="text-white font-bold text-xl mb-2">Новая комната</h3>
                <p className="text-slate-400 text-sm mb-8 leading-relaxed">
                  Создайте комнату и поделитесь кодом с другом. Он войдёт по этому коду и игра начнётся.
                </p>
                <button
                  onClick={handleCreate}
                  disabled={loading}
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-black font-black text-lg hover:from-amber-400 hover:to-amber-500 transition-all disabled:opacity-50 flex items-center justify-center gap-3"
                >
                  {loading ? <Loader2 size={20} className="animate-spin" /> : <Plus size={20} />}
                  Создать комнату
                </button>
              </div>
            ) : (
              <div>
                <div className="w-14 h-14 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center mx-auto mb-5">
                  <Link2 size={24} className="text-green-400" />
                </div>
                <h3 className="text-white font-bold text-xl mb-2 text-center">Войти по коду</h3>
                <p className="text-slate-400 text-sm mb-6 text-center">Введите код комнаты, который прислал друг</p>

                <input
                  type="text"
                  value={joinCode}
                  onChange={e => setJoinCode(e.target.value.toUpperCase())}
                  onKeyDown={e => e.key === 'Enter' && handleJoin()}
                  placeholder="ABC123"
                  maxLength={6}
                  className="w-full py-4 px-5 rounded-xl bg-slate-800 border border-slate-700 text-white text-center text-2xl font-bold tracking-[0.4em] placeholder:text-slate-600 focus:outline-none focus:border-amber-500 transition-colors mb-4"
                />

                {error && (
                  <motion.p
                    className="text-red-400 text-sm text-center mb-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    {error}
                  </motion.p>
                )}

                <button
                  onClick={handleJoin}
                  disabled={loading || joinCode.length < 6}
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-green-500 to-green-600 text-white font-black text-lg hover:from-green-400 hover:to-green-500 transition-all disabled:opacity-50 flex items-center justify-center gap-3"
                >
                  {loading ? <Loader2 size={20} className="animate-spin" /> : <ArrowRight size={20} />}
                  Войти
                </button>
              </div>
            )}
          </motion.div>

          <p className="text-center text-slate-600 text-xs mt-6">
            Требуется подключение к интернету · Работает через WebSockets (Supabase Realtime)
          </p>
        </div>
      </main>
    </div>
  );
}
