import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { fetchUserProgress } from '../store/slices/userSlice';
import { fetchRecommendations } from '../store/slices/learningSlice';
import { AppDispatch } from '../store/store';
import { userAPI, learningAPI, bookmarksAPI } from '../services/api';
import Card from '../components/shared/Card';
import Button from '../components/shared/Button';
import ProgressBar from '../components/shared/ProgressBar';
import SkillRadarChart from '../components/features/SkillRadarChart';
import ActivityCalendar from '../components/features/ActivityCalendar';

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

const DashboardPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { progress } = useSelector((state: RootState) => state.user);
  const { recommendations } = useSelector((state: RootState) => state.learning);
  const [recentActivities, setRecentActivities] = useState<ActivityItem[]>([]);
  const [certificates, setCertificates] = useState<any[]>([]);
  const [bookmarks, setBookmarks] = useState<any[]>([]);
  const [learningPath, setLearningPath] = useState<any>(null);

  useEffect(() => {
    dispatch(fetchUserProgress());
    dispatch(fetchRecommendations());
  }, [dispatch]);

  useEffect(() => {
    learningAPI.getCertificates().then((r) => setCertificates(r.data.certificates || [])).catch(() => {});
    bookmarksAPI.list().then((r) => setBookmarks(r.data.bookmarks || [])).catch(() => {});
    learningAPI.getLearningPath().then((r) => setLearningPath(r.data)).catch(() => {});
  }, []);

  useEffect(() => {
    userAPI
      .getActivity(7)
      .then((res) => setRecentActivities((res.data?.activities || []).slice(0, 8)))
      .catch(() => setRecentActivities([]));
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
        } catch (_) {}
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
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Highest Streak</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">5</p>
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
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
              Skill Progress
            </h2>
            <SkillRadarChart skills={progress?.skills || {}} />
          </Card>

          {/* Recent Activity */}
          <Card>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
              Recent Activity
            </h2>
            <div className="space-y-3">
              {activityDisplay.map((activity) => (
                <div key={activity.key} className="flex items-center p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                  <span className="text-2xl mr-3">{activity.icon}</span>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-900 dark:text-white">
                      {activity.title}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {activity.time}
                    </p>
                  </div>
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

          {/* Activity Calendar */}
          <Card>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
              Activity Calendar
            </h2>
            <ActivityCalendar />
          </Card>

          {/* Recommended Modules */}
          <Card>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
              Recommended for You
            </h2>
            <div className="space-y-3">
              {recommendations.slice(0, 3).map((module, index) => (
                <div key={module?.id || index} className="p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                  <h3 className="font-medium text-slate-900 dark:text-white text-sm mb-1">
                    {module.title}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mb-2">
                    {module.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      {module.estimated_hours}h
                    </span>
                    <Link to="/learn">
                      <Button size="sm" variant="ghost">
                        Start
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
