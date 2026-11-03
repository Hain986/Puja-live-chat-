import React, { useState, useEffect } from 'react';
import { LeaderboardEntry } from '../types';
import { Trophy, Crown, Medal, Sparkles, Diamond, Flame, UserCheck } from 'lucide-react';
import { LOVE_CHAT_LOGO } from '../assets/logo';

export const LeaderboardView: React.FC = () => {
  const [timeframe, setTimeframe] = useState<'Daily' | 'Weekly' | 'AllTime'>('Daily');
  const [boardType, setBoardType] = useState<'gifters' | 'earners'>('gifters');
  const [topGifters, setTopGifters] = useState<LeaderboardEntry[]>([]);
  const [topEarners, setTopEarners] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function fetchLeaderboard() {
      setIsLoading(true);
      try {
        const res = await fetch('/api/leaderboard');
        const data = await res.json();
        if (data.success) {
          setTopGifters(data.topGifters || []);
          setTopEarners(data.topEarners || []);
        }
      } catch (e) {
        console.error('Failed to load leaderboard:', e);
      } finally {
        setIsLoading(false);
      }
    }
    fetchLeaderboard();
  }, [timeframe]);

  const activeList = boardType === 'gifters' ? topGifters : topEarners;

  // Fallback demo entries if list is fresh
  const displayList = activeList.length > 0 ? activeList : [
    { userId: 'u_1', name: 'Aarav Patel (Devotee)', total: 4250, vip: 4 },
    { userId: 'u_2', name: 'Vikramaditya Roy', total: 2800, vip: 3 },
    { userId: 'u_3', name: 'Priya Sundaram', total: 1550, vip: 2 },
    { userId: 'u_4', name: 'Ananya Deshmukh', total: 950, vip: 1 },
    { userId: 'u_5', name: 'Gaurav K.', total: 600, vip: 1 }
  ];

  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-6 space-y-6 text-stone-100">
      
      {/* Header Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-pink-950/80 via-stone-900 to-amber-950/80 border border-pink-500/40 text-center shadow-xl relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-20 bg-pink-500/20 blur-2xl pointer-events-none" />
        
        <div className="w-12 h-12 rounded-2xl overflow-hidden mx-auto mb-2.5 border-2 border-pink-400 shadow-[0_0_20px_rgba(244,63,94,0.4)]">
          <img src={LOVE_CHAT_LOGO} alt="Love Chat Logo" className="w-full h-full object-cover" />
        </div>

        <h1 className="text-xl sm:text-2xl font-black bg-gradient-to-r from-pink-300 via-rose-200 to-amber-200 bg-clip-text text-transparent">
          Love Chat Hall of Fame
        </h1>
        <p className="text-xs text-stone-300 mt-1">
          Honoring the most generous supporters and top earning live broadcasters
        </p>

        {/* Timeframe selector */}
        <div className="flex justify-center space-x-1.5 mt-4">
          {(['Daily', 'Weekly', 'AllTime'] as const).map(tf => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`px-3 py-1 rounded-full text-xs font-bold transition ${
                timeframe === tf
                  ? 'bg-amber-400 text-stone-950 shadow-sm'
                  : 'bg-stone-800 text-stone-400 hover:text-stone-200'
              }`}
            >
              {tf === 'AllTime' ? 'All-Time' : tf}
            </button>
          ))}
        </div>
      </div>

      {/* Board Type Switcher */}
      <div className="flex p-1 rounded-xl bg-stone-900 border border-stone-800">
        <button
          onClick={() => setBoardType('gifters')}
          className={`flex-1 py-2 rounded-lg text-xs font-bold transition flex items-center justify-center space-x-2 ${
            boardType === 'gifters'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-400/40 shadow-xs'
              : 'text-stone-400 hover:text-stone-200'
          }`}
        >
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>Top Devotee Gifters</span>
        </button>

        <button
          onClick={() => setBoardType('earners')}
          className={`flex-1 py-2 rounded-lg text-xs font-bold transition flex items-center justify-center space-x-2 ${
            boardType === 'earners'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-400/40 shadow-xs'
              : 'text-stone-400 hover:text-stone-200'
          }`}
        >
          <Crown className="w-4 h-4 text-yellow-400" />
          <span>Top Broadcasters</span>
        </button>
      </div>

      {/* Top 3 Podium */}
      {displayList.length >= 3 && (
        <div className="grid grid-cols-3 gap-2 sm:gap-4 items-end pt-4 pb-2">
          
          {/* 2nd Place */}
          <div className="p-3 rounded-t-2xl bg-stone-900/90 border border-stone-700/60 flex flex-col items-center text-center">
            <div className="w-8 h-8 rounded-full bg-slate-400/20 border border-slate-300 text-slate-200 flex items-center justify-center font-black text-xs mb-2">
              2
            </div>
            <div className="text-2xl mb-1">🥈</div>
            <div className="font-bold text-xs text-stone-200 line-clamp-1">{displayList[1].name}</div>
            <div className="text-xs font-extrabold text-cyan-300 mt-1">
              {displayList[1].total.toLocaleString()} 💎
            </div>
            <span className="text-[10px] text-stone-400 mt-0.5">Silver Patron</span>
          </div>

          {/* 1st Place (Crown) */}
          <div className="p-4 rounded-t-2xl bg-gradient-to-b from-amber-950/80 to-stone-900 border-2 border-amber-400 flex flex-col items-center text-center shadow-[0_0_25px_rgba(251,191,36,0.25)] relative">
            <div className="absolute -top-3 w-7 h-7 rounded-full bg-amber-400 text-stone-950 flex items-center justify-center font-black text-xs shadow-md">
              👑
            </div>
            <div className="text-3xl my-1">🥇</div>
            <div className="font-extrabold text-xs text-amber-100 line-clamp-1">{displayList[0].name}</div>
            <div className="text-sm font-black text-amber-300 mt-1">
              {displayList[0].total.toLocaleString()} 💎
            </div>
            <span className="text-[10px] text-amber-400 font-bold mt-0.5">Maha Patron</span>
          </div>

          {/* 3rd Place */}
          <div className="p-3 rounded-t-2xl bg-stone-900/90 border border-stone-700/60 flex flex-col items-center text-center">
            <div className="w-8 h-8 rounded-full bg-amber-800/30 border border-amber-700 text-amber-400 flex items-center justify-center font-black text-xs mb-2">
              3
            </div>
            <div className="text-2xl mb-1">🥉</div>
            <div className="font-bold text-xs text-stone-200 line-clamp-1">{displayList[2].name}</div>
            <div className="text-xs font-extrabold text-cyan-300 mt-1">
              {displayList[2].total.toLocaleString()} 💎
            </div>
            <span className="text-[10px] text-stone-400 mt-0.5">Bronze Patron</span>
          </div>
        </div>
      )}

      {/* Rest of the List (Rank 4+) */}
      <div className="space-y-2">
        {displayList.slice(3).map((entry, index) => (
          <div
            key={entry.userId || index}
            className="p-3 rounded-xl bg-stone-900/70 border border-stone-800/80 flex items-center justify-between text-xs hover:bg-stone-800/50 transition"
          >
            <div className="flex items-center space-x-3">
              <span className="w-5 font-bold text-stone-500 text-center">{index + 4}</span>
              <div className="w-7 h-7 rounded-full bg-stone-800 border border-stone-700 flex items-center justify-center text-xs font-bold text-amber-300">
                {entry.name[0]}
              </div>
              <div>
                <div className="font-bold text-stone-200">{entry.name}</div>
                {entry.vip && (
                  <span className="text-[9px] text-purple-400 font-semibold">VIP Level {entry.vip}</span>
                )}
              </div>
            </div>

            <div className="text-right">
              <div className="font-black text-cyan-300 text-xs">
                {entry.total.toLocaleString()} 💎
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
