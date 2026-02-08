import React, { useState, useEffect } from 'react';
import { badgesAPI } from '../services/api';
import Card from '../components/shared/Card';

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
        setBadges([]);
        setDefinitions([]);
        setLeaderboard([]);
      }
      setLoading(false);
    };
    load();
  }, [leaderboardBy]);

  const earnedIds = new Set((badges || []).map((b) => b.id).filter(Boolean));

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Badges & Leaderboard</h1>

      {error && (
        <Card className="border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20">
          <p className="text-red-700 dark:text-red-300">{error}</p>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">Ensure the backend is running and you are logged in.</p>
        </Card>
      )}

      <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-slate-800 dark:to-slate-900">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
          <span className="text-3xl">🏆</span>
          Your Earned Badges
        </h2>
        {loading ? (
          <div className="flex gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="w-32 h-32 bg-slate-200 dark:bg-slate-700 rounded-2xl animate-pulse"></div>
            ))}
          </div>
        ) : badges.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🎯</div>
            <p className="text-slate-600 dark:text-slate-400 text-lg">Complete lessons, projects, and keep streaks to earn badges!</p>
          </div>
        ) : (
          <div className="flex flex-wrap gap-6">
            {(badges || []).map((b) => (
              <div
                key={b.id || b.earned_at || Math.random()}
                className="group relative flex flex-col items-center"
              >
                {/* 3D Badge Container */}
                <div className="relative w-36 h-36 transform transition-all duration-300 hover:scale-110 hover:-rotate-6">
                  {/* Shadow layers for 3D effect */}
                  <div className="absolute inset-0 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity"></div>
                  <div className="absolute inset-0 bg-gradient-to-br from-yellow-300 to-orange-400 rounded-2xl transform translate-y-2 translate-x-2"></div>
                  
                  {/* Main badge */}
                  <div className="relative bg-gradient-to-br from-yellow-400 via-yellow-500 to-orange-500 rounded-2xl p-1 shadow-2xl">
                    <div className="bg-gradient-to-br from-white to-yellow-50 dark:from-slate-800 dark:to-slate-900 rounded-xl h-full flex flex-col items-center justify-center p-4 border-2 border-yellow-300/50">
                      <span className="text-5xl mb-2 filter drop-shadow-lg animate-bounce">{b.icon}</span>
                      <p className="font-bold text-slate-900 dark:text-white text-center text-sm leading-tight">{b.name}</p>
                    </div>
                  </div>
                  
                  {/* Shine effect */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white to-transparent opacity-0 group-hover:opacity-30 rounded-2xl transition-opacity pointer-events-none"></div>
                </div>
                
                {/* Description below badge */}
                <div className="mt-3 text-center max-w-[144px]">
                  <p className="text-sm text-slate-700 dark:text-slate-300 font-medium mb-1">{b.description}</p>
                  {b.earned_at && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center justify-center gap-1">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {new Date(b.earned_at).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
          <span className="text-3xl">🎖️</span>
          All Available Badges
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {(definitions || []).map((d) => {
            const isEarned = earnedIds.has(d.id);
            return (
              <div
                key={d.id}
                className={`group relative flex flex-col items-center transform transition-all duration-300 hover:scale-105 ${isEarned ? '' : 'grayscale opacity-60 hover:opacity-80'}`}
              >
                {/* 3D Badge Container */}
                <div className="relative w-full aspect-square">
                  {/* Shadow for 3D effect */}
                  <div className={`absolute inset-0 rounded-2xl blur-lg transition-opacity ${
                    isEarned 
                      ? 'bg-gradient-to-br from-blue-400 to-purple-500 opacity-40 group-hover:opacity-60' 
                      : 'bg-slate-400 opacity-20'
                  }`}></div>
                  
                  {/* Badge layers */}
                  <div className={`absolute inset-0 rounded-2xl transform translate-y-1 translate-x-1 ${
                    isEarned 
                      ? 'bg-gradient-to-br from-blue-300 to-purple-400' 
                      : 'bg-slate-300 dark:bg-slate-700'
                  }`}></div>
                  
                  {/* Main badge */}
                  <div className={`relative rounded-2xl p-1 shadow-xl ${
                    isEarned 
                      ? 'bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600' 
                      : 'bg-gradient-to-br from-slate-400 to-slate-500'
                  }`}>
                    <div className={`rounded-xl h-full flex flex-col items-center justify-center p-4 ${
                      isEarned 
                        ? 'bg-gradient-to-br from-white to-blue-50 dark:from-slate-800 dark:to-slate-900 border-2 border-blue-300/50' 
                        : 'bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 border-2 border-slate-300/50'
                    }`}>
                      <span className={`text-4xl mb-2 filter drop-shadow-md ${isEarned ? 'animate-pulse' : ''}`}>{d.icon}</span>
                      <p className="font-bold text-slate-900 dark:text-white text-center text-xs leading-tight">{d.name}</p>
                    </div>
                  </div>
                  
                  {/* Shine effect for earned badges */}
                  {isEarned && (
                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white to-transparent opacity-0 group-hover:opacity-20 rounded-2xl transition-opacity pointer-events-none"></div>
                  )}
                  
                  {/* Lock icon for unearned badges */}
                  {!isEarned && (
                    <div className="absolute top-2 right-2 bg-slate-700 dark:bg-slate-600 rounded-full p-1.5 shadow-lg">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>
                
                {/* Description below badge */}
                <div className="mt-2 text-center px-2">
                  <p className={`text-xs leading-tight ${
                    isEarned 
                      ? 'text-slate-700 dark:text-slate-300' 
                      : 'text-slate-500 dark:text-slate-400'
                  }`}>
                    {d.description}
                  </p>
                  {!isEarned && (
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 flex items-center justify-center gap-1">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                      </svg>
                      Locked
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      <Card>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Leaderboard</h2>
          <select
            value={leaderboardBy}
            onChange={(e) => setLeaderboardBy(e.target.value as 'streak' | 'lessons')}
            className="rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white px-3 py-2 text-sm"
          >
            <option value="streak">By streak</option>
            <option value="lessons">By learning hours</option>
          </select>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-2 text-slate-600 dark:text-slate-400">Rank</th>
                <th className="text-left py-2 text-slate-600 dark:text-slate-400">User</th>
                <th className="text-right py-2 text-slate-600 dark:text-slate-400">Streak</th>
                <th className="text-right py-2 text-slate-600 dark:text-slate-400">Hours</th>
                <th className="text-right py-2 text-slate-600 dark:text-slate-400">Modules</th>
              </tr>
            </thead>
            <tbody>
              {(leaderboard || []).map((row) => (
                <tr key={row.rank} className="border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/30">
                  <td className="py-2 font-medium text-slate-900 dark:text-white">#{row.rank}</td>
                  <td className="py-2 text-slate-700 dark:text-slate-300">{row.username}</td>
                  <td className="py-2 text-right">{row.streak_days} days</td>
                  <td className="py-2 text-right">{Number(row.total_learning_hours).toFixed(1)}h</td>
                  <td className="py-2 text-right">{row.completed_count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default BadgesPage;
