'use client';
import { useEffect, useState, useCallback, use } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Copy, Check, Loader2, Users, Clock } from 'lucide-react';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Board from '@/components/board/Board';
import GamePanel from '@/components/game/GamePanel';
import { useGameStore } from '@/stores/gameStore';
import { createClient } from '@/lib/supabase/client';
import { GameState, Move, Player } from '@/types/checkers';
import { applyMove, getAllMoves, checkGameStatus, getOpponent } from '@/lib/checkers/engine';

interface Props { params: Promise<{ roomId: string }> }

export default function RoomPage({ params }: Props) {
  const { roomId } = use(params);
  const searchParams = useSearchParams();
  const isHost = searchParams.get('host') === '1';
  const urlCode = searchParams.get('code');

  const { state, startGame, makeMove, humanPlayer } = useGameStore();
  const [roomCode, setRoomCode] = useState(urlCode || roomId.slice(0, 6).toUpperCase());
  const [copied, setCopied] = useState(false);
  const [status, setStatus] = useState<'waiting' | 'playing' | 'finished' | 'error'>('waiting');
  const [myPlayer] = useState<Player>(isHost ? 1 : 2);
  const [channelRef, setChannelRef] = useState<any>(null);
  const [opponentConnected, setOpponentConnected] = useState(false);

  useEffect(() => {
    startGame('multiplayer', 'medium', myPlayer);
    if (!isHost) setStatus('playing');

    const sb = createClient();
    const channel = sb.channel(`room:${roomId}`, {
      config: { broadcast: { self: false } },
    });

    let pingInterval: ReturnType<typeof setInterval> | null = null;
    let pollInterval: ReturnType<typeof setInterval> | null = null;

    channel
      .on('broadcast', { event: 'move' }, ({ payload }) => {
        if (payload.player !== myPlayer) {
          useGameStore.getState().makeMove(payload.move as Move);
        }
      })
      .on('broadcast', { event: 'pong' }, () => {
        // Host receives pong from guest → start game
        if (isHost) {
          setOpponentConnected(true);
          setStatus('playing');
          if (pingInterval) { clearInterval(pingInterval); pingInterval = null; }
        }
      })
      .on('broadcast', { event: 'ping' }, () => {
        // Guest receives ping from host → host is connected, respond
        if (!isHost) {
          setOpponentConnected(true);
          channel.send({ type: 'broadcast', event: 'pong', payload: {} });
        }
      })
      .on('broadcast', { event: 'left' }, () => setOpponentConnected(false))
      .subscribe(async (subStatus) => {
        if (subStatus !== 'SUBSCRIBED') return;

        if (isHost) {
          // Host pings every 1.5s, guest responds with pong
          pingInterval = setInterval(() => {
            channel.send({ type: 'broadcast', event: 'ping', payload: {} });
          }, 1500);

          // Also poll DB as backup
          pollInterval = setInterval(async () => {
            const { data } = await sb.from('rooms').select('status').eq('id', roomId).maybeSingle();
            if (data?.status === 'playing') {
              setOpponentConnected(true);
              setStatus('playing');
              if (pingInterval) { clearInterval(pingInterval); pingInterval = null; }
              if (pollInterval) { clearInterval(pollInterval); pollInterval = null; }
            }
          }, 3000);
        } else {
          // Guest: update DB status and immediately send pong
          await sb.from('rooms').update({ status: 'playing' }).eq('id', roomId);
          channel.send({ type: 'broadcast', event: 'pong', payload: {} });
        }
      });

    setChannelRef(channel);

    return () => {
      channel.send({ type: 'broadcast', event: 'left', payload: {} });
      sb.removeChannel(channel);
      if (pingInterval) clearInterval(pingInterval);
      if (pollInterval) clearInterval(pollInterval);
    };
  }, [roomId]);

  // Override makeMove to broadcast
  const handleCellClick = useCallback(() => {
    // Move broadcasting is handled in store override below
  }, []);

  // Rating update after game ends
  useEffect(() => {
    if (state.gameStatus === 'playing' || status !== 'playing') return;
    const updateRating = async () => {
      const sb = createClient();
      const { data: { user } } = await sb.auth.getUser();
      if (!user) return;
      const won = (state.gameStatus === 'player1_wins' && myPlayer === 1) ||
                  (state.gameStatus === 'player2_wins' && myPlayer === 2);
      const { data: profile } = await sb.from('profiles').select('rating, games_played, games_won').eq('id', user.id).single();
      if (profile) {
        await sb.from('profiles').update({
          rating: Math.max(0, profile.rating + (won ? 25 : -20)),
          games_played: profile.games_played + 1,
          games_won: won ? profile.games_won + 1 : profile.games_won,
        }).eq('id', user.id);
      }
    };
    updateRating();
  }, [state.gameStatus, status]);

  // Patch: intercept moves via store subscription
  useEffect(() => {
    const unsub = useGameStore.subscribe((newState, prevState) => {
      if (newState.state.moveHistory.length > prevState.state.moveHistory.length) {
        const lastMove = newState.state.moveHistory[newState.state.moveHistory.length - 1];
        // Only broadcast if it was our turn
        const prevPlayer = prevState.state.currentPlayer;
        if (prevPlayer === myPlayer && channelRef) {
          channelRef.send({
            type: 'broadcast',
            event: 'move',
            payload: { move: lastMove, player: myPlayer },
          });
        }
      }
    });
    return unsub;
  }, [channelRef, myPlayer]);

  function copyCode() {
    navigator.clipboard.writeText(roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const isMyTurn = state.currentPlayer === myPlayer;

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <Header />
      <main className="pt-20 px-4 pb-10">

        {/* Waiting for opponent */}
        {status === 'waiting' && isHost && (
          <motion.div
            className="max-w-md mx-auto py-24 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="w-16 h-16 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center mx-auto mb-6">
              <Loader2 size={28} className="text-amber-400 animate-spin" />
            </div>
            <h2 className="text-2xl font-black text-white mb-3">Ждём соперника...</h2>
            <p className="text-slate-400 mb-8">Поделитесь кодом комнаты с другом</p>

            <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 mb-6">
              <p className="text-slate-500 text-sm mb-3">Код комнаты</p>
              <div className="flex items-center justify-center gap-3">
                <span className="text-4xl font-black text-amber-400 tracking-[0.3em]">{roomCode}</span>
                <button onClick={copyCode} className="text-slate-400 hover:text-amber-400 transition-colors">
                  {copied ? <Check size={20} className="text-green-400" /> : <Copy size={20} />}
                </button>
              </div>
            </div>

            <p className="text-slate-500 text-sm">
              Вы играете за <span className="text-red-400 font-bold">🔴 Красных</span>
            </p>
          </motion.div>
        )}

        {/* Playing */}
        {(status === 'playing' || (status === 'waiting' && !isHost)) && (
          <motion.div
            className="max-w-6xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {/* Header bar */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className={`w-2.5 h-2.5 rounded-full ${opponentConnected ? 'bg-green-400' : 'bg-red-400'} animate-pulse`} />
                <span className="text-sm text-slate-400">
                  {opponentConnected ? 'Соперник подключён' : 'Ожидание соперника...'}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-slate-500">Код:</span>
                <span className="text-amber-400 font-bold tracking-wider">{roomCode}</span>
                <button onClick={copyCode} className="text-slate-500 hover:text-amber-400 transition-colors">
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                </button>
              </div>
            </div>

            {/* Turn indicator */}
            <AnimatePresence mode="wait">
              <motion.div
                key={isMyTurn ? 'my' : 'opp'}
                className="text-center mb-4"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
              >
                <span className={`text-sm font-bold px-4 py-1.5 rounded-full ${
                  isMyTurn ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-slate-800 text-slate-400'
                }`}>
                  {isMyTurn ? '🎯 Ваш ход' : '⏳ Ход соперника'}
                </span>
              </motion.div>
            </AnimatePresence>

            {/* Game */}
            <div className="flex flex-col lg:flex-row gap-6 items-start justify-center">
              <div className="flex-shrink-0" style={{ width: 'min(90vw, 560px)' }}>
                <Board flipped={myPlayer === 1} />
              </div>
              <GamePanel />
            </div>

            <div className="mt-6 text-center">
              <Link href="/multiplayer" className="text-slate-500 hover:text-slate-400 text-sm transition-colors">
                ← Вернуться в лобби
              </Link>
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
}
