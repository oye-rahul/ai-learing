import React, { useState, useEffect } from 'react';
import { badgesAPI } from '../services/api';

interface Badge {
  id: string;
  name: string;
  icon: string;
  description: string;
  earned_at?: string;
}

interface LeaderboardEntry {
  rank: number;
  username: string;
  streak_days: number;
  total_learning_hours: number;
  completed_count: number;
}

const BadgesPage: React.FC = () => {
  const [badges, setBadges] = useState<Badge[]>([]);
  const [definitions, setDefinitions] = useState<Badge[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [leaderboardBy, setLeaderboardBy] = useState<'streak' | 'lessons'>('streak');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const [badgesRes, defRes, leadRes] = await Promise.all([
          badgesAPI.getMine().catch(() => ({ data: { badges: [] } })),
          badgesAPI.getDefinitions().catch(() => ({ data: { badges: [] } })),
          badgesAPI.getLeaderboard(leaderboardBy).catch(() => ({ data: { leaderboard: [] } })),
        ]);
        setBadges(Array.isArray(badgesRes?.data?.badges) ? badgesRes.data.badges : []);
        setDefinitions(Array.isArray(defRes?.data?.badges) ? defRes.data.badges : []);
        setLeaderboard(Array.isArray(leadRes?.data?.leaderboard) ? leadRes.data.leaderboard : []);
      } catch (err: any) {
        const message = err?.response?.data?.message || err?.response?.data?.error || err?.message || 'Failed to load badges';
        setError(message);
      }
      setLoading(false);
    };
    load();
  }, [leaderboardBy]);

  const earnedIds = new Set((badges || []).map((b) => b.id).filter(Boolean));

  return (
    <div className="p-4 md:p-8 space-y-12 bg-[#0a0c10] min-h-screen text-white">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent mb-2">
            Achievements & Hall of Fame
          </h1>
          <p className="text-slate-400 text-lg">Track your progress and climb the global ranks.</p>
        </div>
        <div className="flex bg-slate-800/50 p-1 rounded-2xl border border-white/10 backdrop-blur-xl">
          <button
            onClick={() => setLeaderboardBy('streak')}
            className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${leaderboardBy === 'streak' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-400 hover:text-white'}`}
          >
            Streak Rank
          </button>
          <button
            onClick={() => setLeaderboardBy('lessons')}
            className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${leaderboardBy === 'lessons' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-400 hover:text-white'}`}
          >
            Learning Rank
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 p-6 rounded-3xl backdrop-blur-xl">
          <p className="text-red-400 font-medium">{error}</p>
        </div>
      )}

      {/* Earned Badges Section */}
      <section className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-[32px] blur opacity-25 group-hover:opacity-40 transition-opacity"></div>
        <div className="relative bg-[#161b22] border border-white/10 rounded-[32px] p-8 md:p-12 overflow-hidden">
          {/* Decorative element */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-[80px] -mr-32 -mt-32"></div>

          <h2 className="text-2xl font-bold mb-8 flex items-center gap-3">
            <span className="p-2 bg-yellow-500/20 rounded-xl">🥇</span>
            Your Prestige Collection
          </h2>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8 text-white">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="aspect-square bg-white/5 rounded-3xl animate-pulse"></div>
              ))}
            </div>
          ) : badges.length === 0 ? (
            <div className="text-center py-16 bg-white/5 rounded-3xl border border-dashed border-white/10">
              <div className="text-5xl mb-4">✨</div>
              <h3 className="text-xl font-bold mb-2">No Trophies Yet</h3>
              <p className="text-slate-400">Complete HTML, CSS and JS modules to unlock your first badge!</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-8">
              {badges.map((b) => (
                <div key={b.id} className="group/badge relative flex flex-col items-center">
                  <div className="relative w-full aspect-square mb-4">
                    {/* Holographic Ring */}
                    <div className="absolute -inset-2 bg-gradient-to-br from-cyan-400 via-indigo-500 to-purple-600 rounded-full opacity-0 group-hover/badge:opacity-100 group-hover/badge:rotate-180 transition-all duration-700 blur"></div>

                    {/* Badge Plate */}
                    <div className="relative w-full h-full bg-[#1c2128] rounded-[2rem] p-1 shadow-2xl overflow-hidden border border-white/10">
                      {/* Gradient overlay */}
                      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent"></div>

                      <div className="relative h-full w-full rounded-[1.8rem] bg-gradient-to-br from-[#2d333b] to-[#22272e] flex flex-col items-center justify-center p-4">
                        <div className="relative mb-2">
                          <span className="text-5xl block animate-float">{b.icon}</span>
                          <div className="absolute inset-0 bg-white blur-2xl opacity-20 animate-pulse"></div>
                        </div>
                        <p className="text-xs font-black text-center uppercase tracking-widest text-[#adbac7] group-hover/badge:text-white transition-colors">
                          {b.name}
                        </p>
                      </div>

                      {/* Moving light effect */}
                      <div className="absolute inset-0 translate-x-[-100%] group-hover/badge:translate-x-[100%] transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12"></div>
                    </div>
                  </div>

                  <div className="text-center space-y-1">
                    <p className="text-sm font-bold text-slate-200">{b.description}</p>
                    <p className="text-[10px] text-indigo-400 font-mono flex items-center justify-center gap-1">
                      <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse"></span>
                      EARNED {new Date(b.earned_at || Date.now()).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Leaderboard & Available Badges Grid */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Available Badges */}
        <section className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold flex items-center gap-3">
              <span className="p-2 bg-blue-500/20 rounded-xl">🔮</span>
              Unlockable Assets
            </h2>
            <span className="text-sm text-slate-500 font-mono">{definitions.length} Total Badges</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 px-1">
            {definitions.map((d) => {
              const earned = earnedIds.has(d.id);
              return (
                <div key={d.id} className={`group/slot relative p-4 rounded-3xl border transition-all duration-500 ${earned ? 'bg-indigo-500/5 border-indigo-500/20' : 'bg-slate-800/20 border-white/5 grayscale saturate-50 opacity-40 hover:opacity-100'}`}>
                  <div className="relative w-16 h-16 mx-auto mb-3">
                    <span className={`text-4xl block text-center ${earned ? '' : 'filter blur-[1px]'}`}>{d.icon}</span>
                    {!earned && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <svg className="w-6 h-6 text-slate-400/50" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" /></svg>
                      </div>
                    )}
                  </div>
                  <h3 className="text-sm font-bold text-center mb-1">{d.name}</h3>
                  <p className="text-[10px] text-slate-400 text-center leading-relaxed px-2 line-clamp-2">{d.description}</p>

                  {earned && <div className="absolute top-2 right-2 w-2 h-2 bg-green-500 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>}
                </div>
              );
            })}
          </div>
        </section>

        {/* Improved Leaderboard */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold flex items-center gap-3">
            <span className="p-2 bg-purple-500/20 rounded-xl">⚡</span>
            Global Rank
          </h2>

          <div className="bg-[#161b22] border border-white/10 rounded-[32px] overflow-hidden p-6 shadow-2xl">
            <div className="space-y-3">
              {leaderboard.map((row, i) => (
                <div
                  key={row.rank}
                  className={`relative group/row flex items-center justify-between p-4 rounded-2xl transition-all ${i === 0 ? 'bg-gradient-to-r from-yellow-500/10 to-transparent border border-yellow-500/20' : 'hover:bg-white/5 border border-transparent hover:border-white/10'}`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm ${i === 0 ? 'bg-yellow-500 text-black' :
                      i === 1 ? 'bg-slate-300 text-black' :
                        i === 2 ? 'bg-amber-600 text-white' : 'text-slate-500'
                      }`}>
                      {row.rank}
                    </div>
                    <div>
                      <p className={`font-bold ${i === 0 ? 'text-yellow-500' : 'text-white'}`}>{row.username}</p>
                      <p className="text-[10px] text-slate-500 uppercase tracking-tighter">
                        {row.completed_count} Modules • {Number(row.total_learning_hours).toFixed(0)}h Learning
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-xs font-black text-indigo-400">{row.streak_days} DAY STREAK</p>
                    <div className="h-1 w-full bg-slate-800 rounded-full mt-1 overflow-hidden">
                      <div
                        className={`h-full bg-gradient-to-r ${i === 0 ? 'from-yellow-400 to-yellow-600' : 'from-indigo-400 to-purple-500'}`}
                        style={{ width: `${Math.min(100, (row.streak_days / 30) * 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button className="w-full mt-6 py-4 rounded-2xl bg-white/5 hover:bg-white/10 text-slate-400 text-xs font-black uppercase tracking-widest transition-all">
              View Full Standings
            </button>
          </div>
        </section>
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
      `}} />
    </div>
  );
};

export default BadgesPage;
