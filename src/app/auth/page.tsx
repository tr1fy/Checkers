'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, Loader2, Eye, EyeOff, MapPin } from 'lucide-react';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import { createClient } from '@/lib/supabase/client';

export default function AuthPage() {
  const router = useRouter();
  const [tab, setTab] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [city, setCity] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const supabase = createClient();

  async function handleLogin() {
    setLoading(true);
    setError('');
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      router.push('/');
    } catch (e: any) {
      setError(e.message || 'Ошибка входа. Проверьте данные.');
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleLogin() {
    setLoading(true);
    setError('');
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: `${window.location.origin}/auth/callback` },
      });
      if (error) throw error;
    } catch (e: any) {
      setError(e.message || 'Ошибка входа через Google.');
      setLoading(false);
    }
  }

  async function handleSignup() {
    if (!username.trim()) { setError('Введите имя пользователя'); return; }
    setLoading(true);
    setError('');
    try {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) throw error;

      if (data.user) {
        await supabase.from('profiles').insert({
          id: data.user.id,
          username: username.trim(),
          city: city.trim() || null,
          rating: 1000,
          games_played: 0,
          games_won: 0,
        });
      }

      setSuccess('Аккаунт создан! Проверьте email для подтверждения.');
    } catch (e: any) {
      setError(e.message || 'Ошибка регистрации.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <Header />
      <main className="pt-24 px-4 pb-16 flex items-center justify-center min-h-screen">
        <div className="w-full max-w-md">
          {/* Logo */}
          <motion.div
            className="text-center mb-8"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">♟</span>
            </div>
            <h1 className="text-3xl font-black text-white">
              {tab === 'login' ? 'С возвращением!' : 'Создать аккаунт'}
            </h1>
            <p className="text-slate-400 mt-1 text-sm">
              {tab === 'login' ? 'Войдите, чтобы видеть свой рейтинг' : 'Присоединяйтесь к сообществу'}
            </p>
          </motion.div>

          {/* Tab switcher */}
          <div className="flex bg-slate-900 rounded-2xl p-1.5 mb-6">
            {(['login', 'signup'] as const).map(t => (
              <button
                key={t}
                onClick={() => { setTab(t); setError(''); setSuccess(''); }}
                className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  tab === t ? 'bg-amber-500 text-black shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                {t === 'login' ? 'Войти' : 'Регистрация'}
              </button>
            ))}
          </div>

          <motion.div
            key={tab}
            initial={{ opacity: 0, x: tab === 'login' ? -20 : 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-slate-900/60 border border-slate-700/50 rounded-2xl p-6"
          >
            <div className="flex flex-col gap-4">
              {tab === 'signup' && (
                <div>
                  <label className="text-sm text-slate-400 mb-1.5 block">Имя пользователя</label>
                  <div className="relative">
                    <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="text"
                      value={username}
                      onChange={e => setUsername(e.target.value)}
                      placeholder="dragonplayer99"
                      className="w-full pl-9 pr-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-500 transition-colors"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="text-sm text-slate-400 mb-1.5 block">Email</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full pl-9 pr-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm text-slate-400 mb-1.5 block">Пароль</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type={showPw ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && (tab === 'login' ? handleLogin() : handleSignup())}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-10 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-500 transition-colors"
                  />
                  <button
                    onClick={() => setShowPw(!showPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-400 transition-colors"
                  >
                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {tab === 'signup' && (
                <div>
                  <label className="text-sm text-slate-400 mb-1.5 block">Город (необязательно)</label>
                  <div className="relative">
                    <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="text"
                      value={city}
                      onChange={e => setCity(e.target.value)}
                      placeholder="Алматы"
                      className="w-full pl-9 pr-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-500 transition-colors"
                    />
                  </div>
                </div>
              )}

              {error && (
                <motion.p
                  className="text-red-400 text-sm text-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  {error}
                </motion.p>
              )}

              {success && (
                <motion.p
                  className="text-green-400 text-sm text-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  {success}
                </motion.p>
              )}

              <button
                onClick={tab === 'login' ? handleLogin : handleSignup}
                disabled={loading || !email || !password}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-black font-black text-base hover:from-amber-400 hover:to-amber-500 transition-all disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
              >
                {loading && <Loader2 size={18} className="animate-spin" />}
                {tab === 'login' ? 'Войти' : 'Создать аккаунт'}
              </button>

              <div className="flex items-center gap-3 my-1">
                <div className="flex-1 h-px bg-slate-700" />
                <span className="text-slate-600 text-xs">или</span>
                <div className="flex-1 h-px bg-slate-700" />
              </div>

              <button
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full py-3.5 rounded-xl bg-slate-800 border border-slate-700 text-white font-semibold text-base hover:bg-slate-700 hover:border-slate-600 transition-all disabled:opacity-50 flex items-center justify-center gap-3"
              >
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
                  <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
                  <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
                  <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
                </svg>
                Войти через Google
              </button>
            </div>
          </motion.div>

          <p className="text-center text-slate-500 text-xs mt-4">
            Не хочешь регистрироваться?{' '}
            <Link href="/play" className="text-amber-400 hover:text-amber-300 transition-colors">
              Играй без аккаунта
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
