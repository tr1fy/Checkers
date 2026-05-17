'use client';
import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Camera, Save, Loader2, Trophy, Flame, Target, TrendingUp, MapPin, User } from 'lucide-react';
import Header from '@/components/layout/Header';
import { createClient } from '@/lib/supabase/client';

interface Profile {
  id: string;
  username: string;
  avatar_url: string | null;
  city: string | null;
  rating: number;
  games_played: number;
  games_won: number;
  current_streak: number;
  best_streak: number;
}

export default function ProfilePage() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [username, setUsername] = useState('');
  const [city, setCity] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      const sb = createClient();
      const { data: { user } } = await sb.auth.getUser();
      if (!user) { router.push('/auth'); return; }

      const { data } = await sb.from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (data) {
        setProfile(data);
        setUsername(data.username || '');
        setCity(data.city || '');
        setAvatarUrl(data.avatar_url);
      }
    }
    load();
  }, []);

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !profile) return;

    setUploading(true);
    setError('');
    try {
      const sb = createClient();
      const ext = file.name.split('.').pop();
      const path = `${profile.id}/avatar.${ext}`;

      const { error: uploadError } = await sb.storage
        .from('avatars')
        .upload(path, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = sb.storage.from('avatars').getPublicUrl(path);
      const url = `${publicUrl}?t=${Date.now()}`;

      await sb.from('profiles').update({ avatar_url: url }).eq('id', profile.id);
      setAvatarUrl(url);
      setMessage('Аватарка обновлена!');
    } catch (e: any) {
      setError('Ошибка загрузки. Проверьте что бакет avatars создан в Supabase Storage.');
    } finally {
      setUploading(false);
    }
  }

  async function handleSave() {
    if (!profile) return;
    if (!username.trim()) { setError('Никнейм не может быть пустым'); return; }

    setSaving(true);
    setError('');
    setMessage('');
    try {
      const sb = createClient();
      const { error: err } = await sb.from('profiles').update({
        username: username.trim(),
        city: city.trim() || null,
      }).eq('id', profile.id);

      if (err) throw err;
      setMessage('Профиль сохранён!');
      setProfile(p => p ? { ...p, username: username.trim(), city: city.trim() || null } : p);
    } catch (e: any) {
      setError(e.message?.includes('unique') ? 'Этот никнейм уже занят' : 'Ошибка сохранения');
    } finally {
      setSaving(false);
    }
  }

  const winRate = profile && profile.games_played > 0
    ? Math.round((profile.games_won / profile.games_played) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <Header />
      <main className="pt-24 px-4 pb-16 max-w-2xl mx-auto">
        <motion.h1
          className="text-3xl font-black text-white mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          Мой профиль
        </motion.h1>

        {!profile ? (
          <div className="flex justify-center py-24">
            <Loader2 size={32} className="animate-spin text-amber-400" />
          </div>
        ) : (
          <div className="flex flex-col gap-6">

            {/* Avatar + basic info */}
            <motion.div
              className="bg-slate-900/60 border border-slate-700/50 rounded-2xl p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex items-start gap-6">
                {/* Avatar */}
                <div className="relative flex-shrink-0">
                  <div
                    className="w-24 h-24 rounded-2xl bg-gradient-to-br from-amber-500/20 to-amber-600/20 border-2 border-amber-500/30 flex items-center justify-center overflow-hidden cursor-pointer group"
                    onClick={() => fileRef.current?.click()}
                  >
                    {avatarUrl ? (
                      <img src={avatarUrl} alt="avatar" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-4xl font-black text-amber-400">
                        {profile.username[0].toUpperCase()}
                      </span>
                    )}
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl">
                      {uploading
                        ? <Loader2 size={20} className="animate-spin text-white" />
                        : <Camera size={20} className="text-white" />
                      }
                    </div>
                  </div>
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarUpload}
                  />
                </div>

                {/* Fields */}
                <div className="flex-1 flex flex-col gap-3">
                  <div>
                    <label className="text-xs text-slate-500 mb-1 block">Никнейм</label>
                    <div className="relative">
                      <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                      <input
                        type="text"
                        value={username}
                        onChange={e => setUsername(e.target.value)}
                        maxLength={20}
                        className="w-full pl-8 pr-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:border-amber-500 transition-colors"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 mb-1 block">Город</label>
                    <div className="relative">
                      <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                      <input
                        type="text"
                        value={city}
                        onChange={e => setCity(e.target.value)}
                        placeholder="Алматы"
                        maxLength={30}
                        className="w-full pl-8 pr-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm placeholder:text-slate-600 focus:outline-none focus:border-amber-500 transition-colors"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {error && <p className="text-red-400 text-sm mt-3">{error}</p>}
              {message && <p className="text-green-400 text-sm mt-3">{message}</p>}

              <button
                onClick={handleSave}
                disabled={saving}
                className="mt-4 w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-black font-bold text-sm hover:from-amber-400 hover:to-amber-500 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                Сохранить
              </button>
            </motion.div>

            {/* Stats */}
            <motion.div
              className="grid grid-cols-2 sm:grid-cols-4 gap-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              {[
                { icon: <Trophy size={20} className="text-amber-400" />, label: 'Рейтинг', value: profile.rating, bg: 'bg-amber-500/10 border-amber-500/20' },
                { icon: <Flame size={20} className="text-orange-400" />, label: 'Стрик', value: profile.current_streak ?? 0, suffix: '🔥', bg: 'bg-orange-500/10 border-orange-500/20' },
                { icon: <Target size={20} className="text-green-400" />, label: 'Побед', value: `${winRate}%`, bg: 'bg-green-500/10 border-green-500/20' },
                { icon: <TrendingUp size={20} className="text-blue-400" />, label: 'Партий', value: profile.games_played, bg: 'bg-blue-500/10 border-blue-500/20' },
              ].map((s, i) => (
                <div key={i} className={`rounded-2xl border p-4 text-center ${s.bg}`}>
                  <div className="flex justify-center mb-2">{s.icon}</div>
                  <div className="text-2xl font-black text-white">
                    {s.value}{s.suffix}
                  </div>
                  <div className="text-xs text-slate-500 mt-1">{s.label}</div>
                </div>
              ))}
            </motion.div>

            {/* Best streak */}
            {(profile.best_streak ?? 0) > 0 && (
              <motion.div
                className="bg-slate-900/60 border border-slate-700/50 rounded-2xl p-4 flex items-center gap-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <div className="w-12 h-12 rounded-xl bg-orange-500/20 border border-orange-500/30 flex items-center justify-center text-2xl">
                  🏆
                </div>
                <div>
                  <p className="text-white font-bold">Лучший стрик</p>
                  <p className="text-orange-400 text-2xl font-black">{profile.best_streak} побед подряд</p>
                </div>
              </motion.div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
