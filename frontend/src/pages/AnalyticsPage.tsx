import React, { useEffect, useState } from 'react';
import Card from '../components/shared/Card';
import { analyticsAPI } from '../services/api';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

interface DailyStats {
  date: string;
  activities: any[];
  ai_interactions: any[];
  current_streak: number;
  total_duration: number;
  total_ai_tokens: number;
}

interface WeeklyReport {
  start_date: string;
  end_date: string;
  daily_stats: any[];
  summary: {
    total_activities: number;
    total_duration: number;
    total_ai_interactions: number;
    total_ai_tokens: number;
    active_days: number;
  };
}

const AnalyticsPage: React.FC = () => {
  const [dailyStats, setDailyStats] = useState<DailyStats | null>(null);
  const [weeklyReport, setWeeklyReport] = useState<WeeklyReport | null>(null);
  const [skillProgression, setSkillProgression] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState('7');

  useEffect(() => {
    fetchAnalytics();
  }, [timeframe]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const [dailyResponse, weeklyResponse, skillsResponse] = await Promise.all([
        analyticsAPI.getDailyStats(),
        analyticsAPI.getWeeklyReport(),
        analyticsAPI.getSkillProgression(),
      ]);

      setDailyStats(dailyResponse.data);
      setWeeklyReport(weeklyResponse.data);
      setSkillProgression(skillsResponse.data);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActivityChartData = () => {
    if (!weeklyReport) return null;

    const labels = weeklyReport.daily_stats.map(day =>
      new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })
    );

    return {
      labels,
      datasets: [
        {
          label: 'Activities',
          data: weeklyReport.daily_stats.map(day => day.activities),
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          tension: 0.4,
        },
        {
          label: 'AI Interactions',
          data: weeklyReport.daily_stats.map(day => day.ai_interactions),
          borderColor: 'rgb(16, 185, 129)',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          tension: 0.4,
        },
      ],
    };
  };

  const getLearningTimeData = () => {
    if (!weeklyReport) return null;

    const labels = weeklyReport.daily_stats.map(day =>
      new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    );

    return {
      labels,
      datasets: [
        {
          label: 'Learning Time (minutes)',
          data: weeklyReport.daily_stats.map(day => day.duration),
          backgroundColor: 'rgba(139, 92, 246, 0.8)',
          borderColor: 'rgb(139, 92, 246)',
          borderWidth: 1,
        },
      ],
    };
  };

  const getSkillDistributionData = () => {
    if (!skillProgression?.current_skills || Object.keys(skillProgression.current_skills).length === 0) {
      // Fallback data if no skills are available
      return {
        labels: ['JavaScript', 'Python', 'HTML/CSS', 'React', 'Node.js', 'SQL'],
        datasets: [
          {
            data: [25, 20, 18, 15, 12, 10],
            backgroundColor: [
              '#3B82F6',
              '#10B981',
              '#F59E0B',
              '#EF4444',
              '#8B5CF6',
              '#06B6D4',
            ],
            borderWidth: 2,
            borderColor: '#ffffff',
          },
        ],
      };
    }

    const skills = Object.keys(skillProgression.current_skills);
    const values = Object.values(skillProgression.current_skills) as number[];

    return {
      labels: skills.map(skill => skill.charAt(0).toUpperCase() + skill.slice(1)),
      datasets: [
        {
          data: values,
          backgroundColor: [
            '#3B82F6',
            '#10B981',
            '#F59E0B',
            '#EF4444',
            '#8B5CF6',
            '#06B6D4',
            '#EC4899',
            '#F97316',
          ],
          borderWidth: 2,
          borderColor: '#ffffff',
        },
      ],
    };
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
    },
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-24 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-64 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            Analytics Dashboard
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2">
            Track your learning progress and coding activity
          </p>
        </div>
        <div className="mt-4 md:mt-0">
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value)}
            className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
          </select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Current Streak</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                {dailyStats?.current_streak || 0} days
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Time</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                {Math.round((weeklyReport?.summary.total_duration || 0) / 60)}h
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">AI Interactions</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                {weeklyReport?.summary.total_ai_interactions || 0}
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Active Days</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                {weeklyReport?.summary.active_days || 0}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Activity Chart */}
        <Card>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
            Daily Activity
          </h3>
          <div className="h-64">
            {getActivityChartData() && (
              <Line data={getActivityChartData()!} options={chartOptions} />
            )}
          </div>
        </Card>

        {/* Learning Time Chart */}
        <Card>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
            Learning Time
          </h3>
          <div className="h-64">
            {getLearningTimeData() && (
              <Bar data={getLearningTimeData()!} options={chartOptions} />
            )}
          </div>
        </Card>

        {/* Skill Distribution */}
        <Card>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
            Skill Distribution
          </h3>
          <div className="h-64 flex items-center justify-center">
            {getSkillDistributionData() ? (
              <Doughnut data={getSkillDistributionData()!} options={doughnutOptions} />
            ) : (
              <div className="text-center text-slate-500">
                <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <p className="text-sm">No skill data available</p>
              </div>
            )}
          </div>
        </Card>

        {/* Weekly Summary */}
        <Card>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
            Weekly Summary
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-slate-600 dark:text-slate-400">Total Activities</span>
              <span className="font-semibold text-slate-900 dark:text-white">
                {weeklyReport?.summary.total_activities || 0}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-600 dark:text-slate-400">Learning Hours</span>
              <span className="font-semibold text-slate-900 dark:text-white">
                {Math.round((weeklyReport?.summary.total_duration || 0) / 60)}h
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-600 dark:text-slate-400">AI Tokens Used</span>
              <span className="font-semibold text-slate-900 dark:text-white">
                {weeklyReport?.summary.total_ai_tokens?.toLocaleString() || 0}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-600 dark:text-slate-400">Active Days</span>
              <span className="font-semibold text-slate-900 dark:text-white">
                {weeklyReport?.summary.active_days || 0}/7
              </span>
            </div>
          </div>
        </Card>
      </div>

      {/* Goals and Achievements */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
            Learning Goals
          </h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Weekly Learning Time
                </span>
                <span className="text-sm text-slate-500 dark:text-slate-400">
                  {Math.round((weeklyReport?.summary.total_duration || 0) / 60)}/10h
                </span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${Math.min(100, ((weeklyReport?.summary.total_duration || 0) / 60) / 10 * 100)}%`
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Daily Streak Goal
                </span>
                <span className="text-sm text-slate-500 dark:text-slate-400">
                  {dailyStats?.current_streak || 0}/30 days
                </span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                <div
                  className="bg-green-600 h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${Math.min(100, ((dailyStats?.current_streak || 0) / 30) * 100)}%`
                  }}
                />
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
            Recent Achievements
          </h3>
          <div className="space-y-3">
            <div className="flex items-center p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <span className="text-2xl mr-3">🏆</span>
              <div>
                <p className="font-medium text-slate-900 dark:text-white">First Week Complete!</p>
                <p className="text-sm text-slate-600 dark:text-slate-400">Completed your first week of learning</p>
              </div>
            </div>

            <div className="flex items-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <span className="text-2xl mr-3">🤖</span>
              <div>
                <p className="font-medium text-slate-900 dark:text-white">AI Explorer</p>
                <p className="text-sm text-slate-600 dark:text-slate-400">Used AI assistance 10+ times</p>
              </div>
            </div>

            <div className="flex items-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <span className="text-2xl mr-3">📚</span>
              <div>
                <p className="font-medium text-slate-900 dark:text-white">Knowledge Seeker</p>
                <p className="text-sm text-slate-600 dark:text-slate-400">Completed first learning module</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AnalyticsPage;
