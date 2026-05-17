'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Medal, Search, Globe, MapPin, Crown } from 'lucide-react';
import Header from '@/components/layout/Header';
import { createClient } from '@/lib/supabase/client';
import { LeaderboardEntry } from '@/types/checkers';

// Mock data for when Supabase is not configured
const MOCK_DATA: LeaderboardEntry[] = [
  { id: '1', username: 'DragonSlayer', avatar_url: null, city: 'Алматы', rating: 2450, games_played: 342, games_won: 290 },
  { id: '2', username: 'CheckerKing99', avatar_url: null, city: 'Астана', rating: 2380, games_played: 218, games_won: 178 },
  { id: '3', username: 'StrategistPro', avatar_url: null, city: 'Алматы', rating: 2310, games_played: 405, games_won: 318 },
  { id: '4', username: 'DiagonalMaster', avatar_url: null, city: 'Шымкент', rating: 2275, games_played: 189, games_won: 144 },
  { id: '5', username: 'NightOwlPlayer', avatar_url: null, city: 'Астана', rating: 2190, games_played: 267, games_won: 198 },
  { id: '6', username: 'CrownHunter', avatar_url: null, city: null, rating: 2155, games_played: 156, games_won: 112 },
  { id: '7', username: 'QueueSniper', avatar_url: null, city: 'Алматы', rating: 2120, games_played: 298, games_won: 210 },
  { id: '8', username: 'StealthMover', avatar_url: null, city: 'Бишкек', rating: 2090, games_played: 445, games_won: 301 },
  { id: '9', username: 'GrandMasterX', avatar_url: null, city: 'Ташкент', rating: 2050, games_played: 512, games_won: 340 },
  { id: '10', username: 'ThunderPawn', avatar_url: null, city: 'Астана', rating: 1980, games_played: 167, games_won: 108 },
  { id: '11', username: 'CalmMind', avatar_url: null, city: 'Алматы', rating: 1945, games_played: 234, games_won: 151 },
  { id: '12', username: 'RapidJumper', avatar_url: null, city: null, rating: 1920, games_played: 188, games_won: 120 },
  { id: '13', username: 'Volkov_S', avatar_url: null, city: 'Москва', rating: 1895, games_played: 523, games_won: 333 },
  { id: '14', username: 'PieceByPiece', avatar_url: null, city: 'Алматы', rating: 1870, games_played: 145, games_won: 90 },
  { id: '15', username: 'IronDefense', avatar_url: null, city: 'Астана', rating: 1840, games_played: 278, games_won: 170 },
];

const CITIES = ['Все города', 'Алматы', 'Астана', 'Шымкент', 'Бишкек', 'Ташкент', 'Москва'];

export default function LeaderboardPage() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>(MOCK_DATA);
  const [filter, setFilter] = useState('Все города');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchLeaderboard() {
      setLoading(true);
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('profiles')
          .select('id, username, avatar_url, city, rating, games_played, games_won')
          .order('rating', { ascending: false })
          .limit(50);

        if (!error && data && data.length > 0) {
          setEntries(data);
        }
      } catch {
        // Use mock data
      } finally {
        setLoading(false);
      }
    }
    fetchLeaderboard();
  }, []);

  const filtered = entries.filter(e => {
    const matchCity = filter === 'Все города' || e.city === filter;
    const matchSearch = !search || e.username.toLowerCase().includes(search.toLowerCase());
    return matchCity && matchSearch;
  });

  const rankIcon = (i: number) => {
    if (i === 0) return <span className="text-yellow-400 text-xl">🥇</span>;
    if (i === 1) return <span className="text-slate-300 text-xl">🥈</span>;
    if (i === 2) return <span className="text-amber-600 text-xl">🥉</span>;
    return <span className="text-slate-500 font-bold text-sm w-6 text-center">{i + 1}</span>;
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <Header />
      <main className="pt-24 px-4 pb-16 max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center mx-auto mb-5">
            <Trophy size={28} className="text-amber-400" />
          </div>
          <h1 className="text-4xl font-black text-white mb-2">Таблица лидеров</h1>
          <p className="text-slate-400">Топ игроков по всему миру</p>
        </motion.div>

        {/* Top 3 highlight */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {filtered.slice(0, 3).map((e, i) => (
            <motion.div
              key={e.id}
              className={`rounded-2xl p-5 text-center border ${
                i === 0 ? 'bg-yellow-500/10 border-yellow-500/30' :
                i === 1 ? 'bg-slate-500/10 border-slate-500/30' :
                'bg-amber-700/10 border-amber-700/30'
              }`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <div className="text-2xl mb-2">{i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉'}</div>
              <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center mx-auto mb-2 text-lg font-bold text-white">
                {e.username[0].toUpperCase()}
              </div>
              <p className="text-white font-bold text-sm truncate">{e.username}</p>
              <p className="text-amber-400 font-black">{e.rating}</p>
              {e.city && <p className="text-slate-500 text-xs mt-1">{e.city}</p>}
            </motion.div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Поиск игрока..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-500 text-sm transition-colors"
            />
          </div>
          <select
            value={filter}
            onChange={e => setFilter(e.target.value)}
            className="px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-amber-500 text-sm transition-colors"
          >
            {CITIES.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>

        {/* Full list */}
        <div className="flex flex-col gap-2">
          {filtered.map((e, i) => {
            const winRate = e.games_played > 0 ? Math.round((e.games_won / e.games_played) * 100) : 0;
            return (
              <motion.div
                key={e.id}
                className="flex items-center gap-4 p-4 rounded-xl bg-slate-900/60 border border-slate-800/50 hover:border-slate-700 transition-colors group"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: Math.min(i * 0.03, 0.5) }}
              >
                <div className="w-8 flex items-center justify-center flex-shrink-0">
                  {rankIcon(i)}
                </div>

                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-600 to-slate-800 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                  {e.username[0].toUpperCase()}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-white font-semibold truncate">{e.username}</p>
                  </div>
                  {e.city && (
                    <div className="flex items-center gap-1 text-xs text-slate-500">
                      <MapPin size={11} />
                      {e.city}
                    </div>
                  )}
                </div>

                <div className="text-right flex-shrink-0">
                  <p className="text-amber-400 font-black text-lg">{e.rating}</p>
                  <p className="text-slate-500 text-xs">{winRate}% побед</p>
                </div>

                <div className="text-right flex-shrink-0 hidden sm:block">
                  <p className="text-white font-semibold">{e.games_won}</p>
                  <p className="text-slate-500 text-xs">из {e.games_played}</p>
                </div>
              </motion.div>
            );
          })}

          {filtered.length === 0 && (
            <div className="text-center py-16 text-slate-500">Игроки не найдены</div>
          )}
        </div>
      </main>
    </div>
  );
}
