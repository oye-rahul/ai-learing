import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { fetchUserProgress } from '../store/slices/userSlice';
import { fetchRecommendations } from '../store/slices/learningSlice';
import { AppDispatch } from '../store/store';
import { userAPI, learningAPI, bookmarksAPI, aiAPI, badgesAPI, projectsAPI, analyticsAPI } from '../services/api';
import Card from '../components/shared/Card';
import Button from '../components/shared/Button';
import ProgressBar from '../components/shared/ProgressBar';
import SkillRadarChart from '../components/features/SkillRadarChart';
import LoadingSpinner from '../components/shared/LoadingSpinner';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);


interface ActivityItem {
  activity_type: string;
  metadata?: string;
  timestamp: string;
}

const formatTimeAgo = (timestamp: string) => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
};

const activityIcon = (type: string) => {
  if (type === 'lesson_completed' || type === 'module_completed') return '✅';
  if (type === 'module_started') return '🚀';
  if (type === 'project_created' || type === 'project_updated') return '📁';
  if (type === 'lesson_completed') return '📖';
  if (type?.includes('chat') || type?.includes('ai')) return '🤖';
  return '📌';
};

const DEMO_CHALLENGES = [
  {
    title: "Optimize a Loop",
    description: "Analyze your recent code and identify a nested loop. Refactor it using a Hash Map or Set to improve time complexity from O(n²) to O(n).",
    time_estimate: "15 mins",
    points: 50
  },
  {
    title: "Prompt Engineering Master",
    description: "Design a system prompt that forces an AI to only respond in valid JSON format without any conversational filler text.",
    time_estimate: "10 mins",
    points: 40
  },
  {
    title: "Data Cleaning Sprint",
    description: "Correct 5 intentional errors in a provided dataset using Python Pandas. Handle missing values and inconsistent date formats.",
    time_estimate: "20 mins",
    points: 60
  },
  {
    title: "Neural Network Architecture",
    description: "Draw or describe the layers for a CNN optimized for identifying handwritten digits. Explain why you chose the specific pool size.",
    time_estimate: "12 mins",
    points: 45
  },
  {
    title: "SQL Query Tuning",
    description: "A slow query is using multiple JOINs on unindexed columns. Rewrite the query or suggest the correct indexes to speed it up by 10x.",
    time_estimate: "18 mins",
    points: 55
  }
];

const DashboardPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { progress } = useSelector((state: RootState) => state.user);
  const { recommendations } = useSelector((state: RootState) => state.learning);
  const [recentActivities, setRecentActivities] = useState<ActivityItem[]>([]);
  const [certificates, setCertificates] = useState<any[]>([]);
  const [bookmarks, setBookmarks] = useState<any[]>([]);
  const [learningPath, setLearningPath] = useState<any>(null);
  const [aiInsights, setAiInsights] = useState<any>(null);
  const [_leaderboard, setLeaderboard] = useState<any[]>([]);
  const [latestProject, setLatestProject] = useState<any>(null);
  const [weeklyStats, setWeeklyStats] = useState<any>(null);
  const [dailyTask, setDailyTask] = useState<any>(DEMO_CHALLENGES[Math.floor(Math.random() * DEMO_CHALLENGES.length)]);
  const [challengeAccepted, setChallengeAccepted] = useState(false);
  const [_loading, setLoading] = useState(true);

  // Timer State
  const [timerDuration, setTimerDuration] = useState(25);
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [timerActive, setTimerActive] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timerActive && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    } else if (timeLeft === 0) {
      setTimerActive(false);
    }
    return () => clearInterval(interval);
  }, [timerActive, timeLeft]);

  const formatTimer = () => {
    const m = Math.floor(timeLeft / 60).toString().padStart(2, '0');
    const s = (timeLeft % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const setPresetTime = (minutes: number) => {
    setTimerDuration(minutes);
    setTimeLeft(minutes * 60);
    setTimerActive(false);
  };

  useEffect(() => {
    dispatch(fetchUserProgress());
    dispatch(fetchRecommendations());
  }, [dispatch]);

  useEffect(() => {
    learningAPI.getCertificates().then((r) => setCertificates(r.data.certificates || [])).catch(() => { });
    bookmarksAPI.list().then((r) => setBookmarks(r.data.bookmarks || [])).catch(() => { });
    learningAPI.getLearningPath().then((r) => setLearningPath(r.data)).catch(() => { });
  }, []);

  useEffect(() => {
    if (user?.id) {
      aiAPI.getInsights(user.id)
        .then(res => setAiInsights(res.data))
        .catch(err => console.error('Failed to fetch AI insights:', err));
    }
  }, [user]);

  useEffect(() => {
    userAPI
      .getActivity(7)
      .then((res) => setRecentActivities((res.data?.activities || []).slice(0, 8)))
      .catch(() => setRecentActivities([]));
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [leaderboardRes, projectsRes, analyticsRes, practiceRes] = await Promise.all([
          badgesAPI.getLeaderboard('streak').catch(() => ({ data: [] })),
          projectsAPI.getProjects().catch(() => ({ data: { projects: [] } })),
          analyticsAPI.getWeeklyReport().catch(() => ({ data: {} })),
          aiAPI.generatePractice({ skillLevel: 'intermediate', topic: 'coding' }).catch(() => ({ data: { tasks: null } }))
        ]);
        setLeaderboard(Array.isArray(leaderboardRes.data) ? leaderboardRes.data.slice(0, 5) : []);
        if (projectsRes.data?.projects?.length > 0) {
          setLatestProject(projectsRes.data.projects[0]);
        }
        setWeeklyStats(analyticsRes.data);

        const randomChallenge = DEMO_CHALLENGES[Math.floor(Math.random() * DEMO_CHALLENGES.length)];
        setDailyTask(practiceRes.data?.tasks?.[0] || randomChallenge);
      } catch (err) {
        console.error('Failed to fetch advanced dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const quickActions = [
    {
      title: 'Start Learning',
      description: 'Continue your learning path',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
      href: '/learn',
      color: 'bg-blue-500',
    },
    {
      title: 'Code Playground',
      description: 'Practice with AI assistance',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
        </svg>
      ),
      href: '/playground',
      color: 'bg-green-500',
    },
    {
      title: 'Continue Project',
      description: 'Work on your latest project',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      ),
      href: '/projects',
      color: 'bg-purple-500',
    },
    {
      title: 'Ask AI',
      description: 'Get instant help with coding',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      ),
      href: '/ai-learnixo',
      color: 'bg-yellow-500',
    },
  ];

  const activityDisplay = recentActivities.length
    ? recentActivities.map((a, i) => {
      let title = a.activity_type.replace(/_/g, ' ');
      try {
        const meta = typeof a.metadata === 'string' ? JSON.parse(a.metadata || '{}') : a.metadata || {};
        if (meta.moduleTitle) title = `${a.activity_type.includes('completed') ? 'Completed' : 'Started'} "${meta.moduleTitle}"`;
        else if (meta.title) title = `Project "${meta.title}"`;
      } catch (_) { }
      return {
        key: i,
        title,
        time: formatTimeAgo(a.timestamp),
        icon: activityIcon(a.activity_type),
      };
    })
    : [
      { key: 0, title: 'No recent activity yet', time: 'Start learning to see activity here', icon: '📌' },
    ];

  const getChartData = () => {
    if (!weeklyStats?.daily_stats) return null;
    const labels = weeklyStats.daily_stats.map((d: any) => new Date(d.date).toLocaleDateString('en-US', { weekday: 'short' }));
    return {
      labels,
      datasets: [{
        label: 'Learning Minutes',
        data: weeklyStats.daily_stats.map((d: any) => d.duration || 0),
        backgroundColor: 'rgba(99, 102, 241, 0.8)',
        borderRadius: 8,
      }]
    };
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      y: { beginAtZero: true, display: false },
      x: { grid: { display: false } }
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <Card className="bg-gradient-to-r from-primary-600 to-secondary-600 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">
              Welcome back, {user?.username}! 👋
            </h1>
            <p className="text-primary-100 mb-4">
              Ready to continue your coding journey? Here's your daily tip:
            </p>
            <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm">
              <p className="text-sm">
                💡 <strong>Today's Tip:</strong> Use console.time() and console.timeEnd() to measure
                the performance of your code blocks. It's a simple way to identify bottlenecks!
              </p>
            </div>
          </div>
          <div className="hidden md:block">
            <div className="w-32 h-32 bg-white/10 rounded-full flex items-center justify-center">
              <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          </div>
        </div>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <div className="flex items-center">
            <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Active Days</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                {progress?.streak_days || 0}
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Learning hours</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                {(progress?.total_learning_hours ?? 0).toFixed(1)}
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Current Streak</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                {progress?.streak_days ?? 0}
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Points</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                {user?.points || 1250}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Advanced AI Activity & Challenge */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="relative overflow-hidden group">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-primary-100 dark:bg-primary-900/10 rounded-full blur-3xl opacity-50 group-hover:scale-110 transition-transform duration-700"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary-600 rounded-lg text-white shadow-lg">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">AI Daily Challenge</h3>
                    <button
                      onClick={() => {
                        const random = DEMO_CHALLENGES[Math.floor(Math.random() * DEMO_CHALLENGES.length)];
                        setDailyTask(random);
                        setChallengeAccepted(false);
                      }}
                      className="p-1 hover:bg-primary-100 rounded-full transition-colors text-primary-600"
                      title="Shuffle Challenge"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                    </button>
                  </div>
                  <p className="text-xs text-slate-500">Curated specifically for your current skill level</p>
                </div>
              </div>
              <span className="px-2 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 text-xs font-bold rounded-full">
                +{dailyTask?.points || 50} pts
              </span>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-dashed border-primary-200 dark:border-primary-900/30 mb-4 transition-all hover:bg-white dark:hover:bg-slate-800">
              <h4 className="font-bold text-slate-900 dark:text-white mb-2">{dailyTask?.title}</h4>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 leading-relaxed line-clamp-2">
                {dailyTask?.description}
              </p>
              <div className="flex items-center gap-4 text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {dailyTask?.time_estimate || '15 mins'}
                </span>
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Challenge Mode
                </span>
              </div>
            </div>
            {!challengeAccepted ? (
              <Button className="w-full" onClick={() => setChallengeAccepted(true)}>Accept Challenge</Button>
            ) : (
              <div className="mt-4 p-4 bg-primary-50 dark:bg-primary-900/20 rounded-xl border border-primary-200 dark:border-primary-800 animate-fade-in text-left">
                <h4 className="font-bold text-primary-700 dark:text-primary-300 mb-2">Challenge Started!</h4>
                <p className="text-sm text-primary-600 dark:text-primary-400 mb-3">
                  You have {dailyTask?.time_estimate} to complete this task. Submit your solution or notes below.
                </p>
                <textarea
                  className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-3 text-sm mb-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  rows={4}
                  placeholder="Paste your code solution or write your notes here..."
                ></textarea>
                <div className="flex gap-2">
                  <Button className="flex-1" onClick={() => {
                    setChallengeAccepted(false);
                    alert(`Awesome! Challenge submitted. +${dailyTask?.points || 50} points`);
                  }}>Submit Solution</Button>
                  <Button variant="ghost" onClick={() => setChallengeAccepted(false)}>Cancel</Button>
                </div>
              </div>
            )}
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Weekly Activity</h3>
            <Link to="/analytics" className="text-xs text-primary-600 font-bold hover:underline">View All Analytics →</Link>
          </div>
          <div className="h-48 relative">
            {getChartData() ? (
              <Bar data={getChartData()!} options={chartOptions} />
            ) : (
              <div className="flex items-center justify-center h-full text-slate-400 text-sm">
                Collecting learning data...
              </div>
            )}
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2 text-center">
            <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800">
              <p className="text-[10px] text-slate-500 uppercase font-bold">Total</p>
              <p className="text-sm font-bold text-slate-900 dark:text-white">{Math.round((weeklyStats?.summary?.total_duration || 0) / 60)}h</p>
            </div>
            <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800">
              <p className="text-[10px] text-slate-500 uppercase font-bold">Avg/Day</p>
              <p className="text-sm font-bold text-slate-900 dark:text-white">{Math.round((weeklyStats?.summary?.total_duration || 0) / (weeklyStats?.summary?.active_days || 7))}m</p>
            </div>
            <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800">
              <p className="text-[10px] text-slate-500 uppercase font-bold">Active</p>
              <p className="text-sm font-bold text-slate-900 dark:text-white">{weeklyStats?.summary?.active_days || 0}d</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quick Actions */}
          <Card>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
              Quick Actions
            </h2>
            <div className="grid grid-cols-2 gap-4">
              {quickActions.map((action, index) => (
                <Link
                  key={index}
                  to={action.href}
                  className="flex items-center p-4 bg-slate-50 dark:bg-slate-700 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors"
                >
                  <div className={`p-2 ${action.color} rounded-lg text-white mr-3`}>
                    {action.icon}
                  </div>
                  <div>
                    <h3 className="font-medium text-slate-900 dark:text-white">
                      {action.title}
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {action.description}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </Card>

          {/* Skill Progress */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                Skill Mastery
              </h2>
              <div className="flex gap-1">
                <span className="w-2 h-2 rounded-full bg-primary-500"></span>
                <span className="w-2 h-2 rounded-full bg-secondary-500"></span>
                <span className="w-2 h-2 rounded-full bg-green-500"></span>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div className="h-64">
                <SkillRadarChart skills={progress?.skills || {}} />
              </div>
              <div className="space-y-4">
                {Object.entries(progress?.skills || {}).slice(0, 4).map(([skill, value]: [string, any]) => (
                  <div key={skill}>
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-tight">{skill}</span>
                      <span className="text-slate-500 font-medium">{value}%</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-1.5 overflow-hidden">
                      <div className="bg-primary-500 h-full transition-all duration-1000" style={{ width: `${value}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* Project Snapshot */}
          {latestProject && (
            <Card className="bg-gradient-to-br from-slate-900 to-slate-800 text-white border-none">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-bold">Latest project</h3>
                  <p className="text-xs text-slate-400">Continue where you left off</p>
                </div>
                <div className="p-2 bg-white/10 rounded-lg backdrop-blur-md">
                  <svg className="w-5 h-5 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
              </div>
              <div className="p-4 bg-white/5 rounded-2xl border border-white/10 mb-6">
                <h4 className="text-xl font-bold mb-1">{latestProject.title}</h4>
                <p className="text-sm text-slate-400 mb-4 line-clamp-1">{latestProject.description}</p>
                <div className="flex items-center justify-between">
                  <div className="flex -space-x-2">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="w-8 h-8 rounded-full border-2 border-slate-900 bg-slate-700 flex items-center justify-center text-[10px] font-bold">
                        {String.fromCharCode(64 + i)}
                      </div>
                    ))}
                  </div>
                  <span className="text-xs text-slate-400 font-medium">Last edit: {formatTimeAgo(latestProject.updatedAt || latestProject.timestamp)}</span>
                </div>
              </div>
              <Link to={`/projects`}>
                <Button className="w-full bg-white text-slate-900 hover:bg-slate-100 border-none font-bold">Open Project Editor</Button>
              </Link>
            </Card>
          )}

          {/* Recent Activity */}
          <Card>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
              Recent Activity
            </h2>
            <div className="space-y-3">
              {activityDisplay.map((activity) => (
                <div key={activity.key} className="flex items-center p-3 bg-slate-50 dark:bg-slate-700 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors cursor-pointer">
                  <div className="w-10 h-10 flex items-center justify-center bg-white dark:bg-slate-800 rounded-xl shadow-sm mr-4 text-xl">
                    {activity.icon}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-slate-900 dark:text-white">
                      {activity.title}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {activity.time}
                    </p>
                  </div>
                  <svg className="w-4 h-4 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Learning Progress */}
          <Card>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
              Learning Progress
            </h2>
            <div className="space-y-4">
              {learningPath && learningPath.modules && learningPath.modules.filter((m: any) => m.completed || m.current).length > 0 ? (
                learningPath.modules
                  .filter((m: any) => m.completed || m.current)
                  .slice(0, 3)
                  .map((module: any, index: number) => (
                    <div key={module.id || index}>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                          {module.title}
                        </span>
                        <span className="text-sm text-slate-500 dark:text-slate-400">
                          {module.completed ? '100%' : '50%'}
                        </span>
                      </div>
                      <ProgressBar
                        progress={module.completed ? 100 : 50}
                        color={module.completed ? 'success' : 'primary'}
                      />
                    </div>
                  ))
              ) : (
                <>
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        HTML
                      </span>
                      <span className="text-sm text-slate-500 dark:text-slate-400">0%</span>
                    </div>
                    <ProgressBar progress={0} color="primary" />
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        CSS
                      </span>
                      <span className="text-sm text-slate-500 dark:text-slate-400">0%</span>
                    </div>
                    <ProgressBar progress={0} color="primary" />
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        JavaScript
                      </span>
                      <span className="text-sm text-slate-500 dark:text-slate-400">0%</span>
                    </div>
                    <ProgressBar progress={0} color="primary" />
                  </div>
                </>
              )}
            </div>
          </Card>

          {/* Study Focus Timer */}
          <Card className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white border-none shadow-xl overflow-hidden relative">
            <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl"></div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-indigo-500 rounded-lg text-white">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h2 className="text-lg font-bold">Study Focus Timer</h2>
              </div>
            </div>

            <div className="text-center py-2 relative z-10">
              <div className="flex justify-center gap-2 mb-4">
                {[15, 25, 45].map((preset) => (
                  <button
                    key={preset}
                    onClick={() => setPresetTime(preset)}
                    className={`px-3 py-1 rounded-md text-[10px] font-bold transition-all ${timerDuration === preset ? 'bg-indigo-600 text-white shadow-md' : 'bg-white/10 text-indigo-300 hover:bg-white/20'}`}
                  >
                    {preset}m
                  </button>
                ))}
              </div>
              <div className="text-5xl font-black font-mono mb-4 tracking-tighter text-indigo-400">
                {formatTimer()}
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => setTimerActive(!timerActive)}
                  className={`flex-1 border-none text-xs font-bold py-2 shadow-lg transition-all ${timerActive
                      ? 'bg-red-500 hover:bg-red-400 text-white'
                      : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                    }`}
                >
                  {timerActive ? 'Pause Session' : 'Start Session'}
                </Button>
                <Button
                  onClick={() => {
                    setTimerActive(false);
                    setTimeLeft(timerDuration * 60);
                  }}
                  variant="ghost"
                  className="bg-white/5 hover:bg-white/10 text-white border-none text-xs font-bold py-2"
                >
                  Reset
                </Button>
              </div>
              <p className="mt-4 text-[10px] text-slate-400 uppercase tracking-widest font-medium">Pomodoro Technique</p>
            </div>
          </Card>

          {/* Developer Resources */}
          <Card>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
              Developer Resources
            </h2>
            <div className="grid grid-cols-2 gap-2">
              {[
                { name: 'MDN Web Docs', url: 'https://developer.mozilla.org', icon: '🌐' },
                { name: 'React Docs', url: 'https://react.dev', icon: '⚛️' },
                { name: 'Stack Overflow', url: 'https://stackoverflow.com', icon: '🥞' },
                { name: 'Tailwind CSS', url: 'https://tailwindcss.com', icon: '🎨' },
              ].map((res, i) => (
                <a
                  key={i}
                  href={res.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 bg-slate-50 dark:bg-slate-800 rounded-xl hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all border border-slate-100 dark:border-slate-700 flex flex-col items-center text-center"
                >
                  <span className="text-xl mb-1">{res.icon}</span>
                  <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300">{res.name}</span>
                </a>
              ))}
            </div>
          </Card>

          {/* AI Insights Card */}
          <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/20 dark:to-purple-950/20 border-indigo-100 dark:border-indigo-900/30">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg text-white shadow-md">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">AI Learning Insights</h2>
            </div>

            {aiInsights ? (
              <div className="space-y-4">
                <div>
                  <h3 className="text-[10px] font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400 mb-2">My Strengths</h3>
                  <div className="flex flex-wrap gap-2">
                    {aiInsights.strengths?.map((s: string, i: number) => (
                      <span key={i} className="px-2 py-1 bg-white dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-[10px] font-bold rounded-md border border-indigo-100 dark:border-indigo-800/50 shadow-sm">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="text-[10px] font-bold uppercase tracking-widest text-purple-600 dark:text-purple-400 mb-2">Smart Next Steps</h3>
                  <div className="space-y-2">
                    {aiInsights.recommendations?.slice(0, 2).map((r: any, i: number) => (
                      <div key={i} className="p-2.5 bg-white/70 dark:bg-slate-800/50 rounded-xl border border-white dark:border-slate-700/50 shadow-sm">
                        <p className="text-xs font-bold text-slate-800 dark:text-white mb-0.5">{r.title}</p>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">{r.reason}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="pt-2">
                  <div className="flex items-center justify-between text-[10px] mb-1.5">
                    <span className="font-bold text-slate-500 uppercase tracking-tight">Growth Trajectory</span>
                    <span className="font-black text-indigo-600 dark:text-indigo-400">{aiInsights.overallProgress || 0}%</span>
                  </div>
                  <ProgressBar progress={aiInsights.overallProgress || 0} color="primary" />
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <LoadingSpinner size="sm" className="mb-3" />
                <p className="text-xs font-medium text-slate-500 animate-pulse">Analyzing your learning patterns...</p>
              </div>
            )}
          </Card>

          {/* Recommended Modules */}
          <Card>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
              Recommended for You
            </h2>
            <div className="space-y-3">
              {recommendations.slice(0, 3).map((module, index) => (
                <div key={module?.id || index} className="p-3 bg-slate-50 dark:bg-slate-700 rounded-lg group hover:bg-slate-100 dark:hover:bg-slate-600 transition-all">
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-1 group-hover:text-primary-600 transition-colors">
                    {module.title}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mb-2 line-clamp-1">
                    {module.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] px-1.5 py-0.5 bg-slate-200 dark:bg-slate-800 rounded font-bold text-slate-600 dark:text-slate-500 uppercase tracking-wider">
                      {module.estimated_hours}h Course
                    </span>
                    <Link to="/learn">
                      <Button size="sm" variant="ghost" className="text-xs font-bold h-8">
                        Start Now
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Continue from bookmarks */}
          {bookmarks.length > 0 && (
            <Card>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                Continue learning
              </h2>
              <div className="space-y-2">
                {bookmarks.slice(0, 3).map((b) => (
                  <Link
                    key={b.id}
                    to="/learn"
                    className="block p-3 bg-slate-50 dark:bg-slate-700 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-600"
                  >
                    <p className="font-medium text-slate-900 dark:text-white text-sm">{b.module_title}</p>
                    <p className="text-xs text-slate-500">Saved for later</p>
                  </Link>
                ))}
              </div>
            </Card>
          )}

          {/* Certificates */}
          {certificates.length > 0 && (
            <Card>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                📜 Certificates
              </h2>
              <div className="space-y-2">
                {certificates.slice(0, 5).map((c) => (
                  <div key={c.module_id} className="p-3 bg-slate-50 dark:bg-slate-700 rounded-lg flex justify-between items-center">
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white text-sm">{c.title}</p>
                      <p className="text-xs text-slate-500">{c.estimated_hours}h completed</p>
                    </div>
                    <a
                      href={`https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(window.location.origin)}&title=${encodeURIComponent(`I completed ${c.title} on AI Learnixo`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-primary-600 hover:underline"
                    >
                      Share
                    </a>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
