import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { updateUserProfile } from '../store/slices/userSlice';
import { toggleTheme } from '../store/slices/uiSlice';
import { logout } from '../store/slices/authSlice';
import { AppDispatch } from '../store/store';
import { userAPI } from '../services/api';
import Card from '../components/shared/Card';
import Button from '../components/shared/Button';
import Input from '../components/shared/Input';
import { toast } from 'react-toastify';

const SettingsPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { theme } = useSelector((state: RootState) => state.ui);
  const { loading } = useSelector((state: RootState) => state.user);

  const [profileData, setProfileData] = useState({
    username: user?.username || '',
    email: user?.email || '',
    role: user?.role || 'beginner',
  });

  const [notifications, setNotifications] = useState({
    email_updates: true,
    learning_reminders: true,
    achievement_alerts: true,
    weekly_reports: true,
  });

  const [apiSettings, setApiSettings] = useState({
    openai_key: '',
  });

  const [showDeleteAccount, setShowDeleteAccount] = useState(false);

  useEffect(() => {
    if (user) {
      setProfileData({
        username: user.username,
        email: user.email,
        role: user.role,
      });
    }
  }, [user]);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await dispatch(updateUserProfile({
        username: profileData.username,
        role: profileData.role,
      })).unwrap();

      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error('Failed to update profile');
    }
  };

  const handleExportData = async () => {
    try {
      const { data } = await userAPI.exportData();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ai-learnixo-progress-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success('Data exported successfully!');
    } catch (error) {
      toast.error('Failed to export data');
    }
  };

  const handleDeleteAccount = async () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      try {
        // In a real app, this would call an API endpoint to delete the account
        toast.success('Account deletion request submitted');
        dispatch(logout());
      } catch (error) {
        toast.error('Failed to delete account');
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
          Settings
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mt-2">
          Manage your account settings and preferences
        </p>
      </div>

      {/* Profile Settings */}
      <Card>
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
          Profile Information
        </h2>
        <form onSubmit={handleProfileUpdate} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Username"
              value={profileData.username}
              onChange={(e) => setProfileData({ ...profileData, username: e.target.value })}
              placeholder="Enter your username"
            />
            <Input
              label="Email"
              type="email"
              value={profileData.email}
              disabled
              helperText="Email cannot be changed"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Experience Level
            </label>
            <select
              value={profileData.role}
              onChange={(e) => setProfileData({ ...profileData, role: e.target.value as any })}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
            >
              <option value="beginner">Beginner - Just starting out</option>
              <option value="intermediate">Intermediate - Some experience</option>
              <option value="expert">Expert - Advanced developer</option>
            </select>
          </div>

          <div className="flex justify-end">
            <Button type="submit" loading={loading}>
              Update Profile
            </Button>
          </div>
        </form>
      </Card>

      {/* Appearance Settings */}
      <Card>
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
          Appearance
        </h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-slate-900 dark:text-white">Theme</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Choose your preferred theme
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-slate-600 dark:text-slate-400">Light</span>
              <button
                onClick={() => dispatch(toggleTheme())}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${theme === 'dark' ? 'bg-primary-600' : 'bg-slate-200'
                  }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${theme === 'dark' ? 'translate-x-6' : 'translate-x-1'
                    }`}
                />
              </button>
              <span className="text-sm text-slate-600 dark:text-slate-400">Dark</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Notification Settings */}
      <Card>
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
          Notifications
        </h2>
        <div className="space-y-4">
          {Object.entries(notifications).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-slate-900 dark:text-white">
                  {key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {key === 'email_updates' && 'Receive updates about new features and improvements'}
                  {key === 'learning_reminders' && 'Get reminded to continue your learning streak'}
                  {key === 'achievement_alerts' && 'Be notified when you unlock new achievements'}
                  {key === 'weekly_reports' && 'Receive weekly progress reports via email'}
                </p>
              </div>
              <button
                onClick={() => setNotifications({ ...notifications, [key]: !value })}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${value ? 'bg-primary-600' : 'bg-slate-200 dark:bg-slate-700'
                  }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${value ? 'translate-x-6' : 'translate-x-1'
                    }`}
                />
              </button>
            </div>
          ))}
        </div>
      </Card>

      {/* API Settings */}
      <Card>
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
          API Configuration
        </h2>
        <div className="space-y-4">
          <Input
            label="OpenAI API Key"
            type="password"
            value={apiSettings.openai_key}
            onChange={(e) => setApiSettings({ ...apiSettings, openai_key: e.target.value })}
            placeholder="sk-..."
            helperText="Optional: Use your own OpenAI API key for unlimited AI assistance"
          />
          <div className="flex justify-end">
            <Button variant="secondary">
              Save API Settings
            </Button>
          </div>
        </div>
      </Card>

      {/* Data & Privacy */}
      <Card>
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
          Data & Privacy
        </h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-slate-900 dark:text-white">Export Data</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Download a copy of all your data
              </p>
            </div>
            <Button variant="secondary" onClick={handleExportData}>
              Export Data
            </Button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-slate-900 dark:text-white">Clear Learning History</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Remove all your learning progress and activity data
              </p>
            </div>
            <Button variant="danger">
              Clear History
            </Button>
          </div>
        </div>
      </Card>

      {/* Account Management */}
      <Card>
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
          Account Management
        </h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-slate-900 dark:text-white">Change Password</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Update your account password
              </p>
            </div>
            <Button variant="secondary">
              Change Password
            </Button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-red-600 dark:text-red-400">Delete Account</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Permanently delete your account and all associated data
              </p>
            </div>
            <Button
              variant="danger"
              onClick={() => setShowDeleteAccount(!showDeleteAccount)}
            >
              Delete Account
            </Button>
          </div>

          {showDeleteAccount && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <h4 className="font-medium text-red-800 dark:text-red-200 mb-2">
                Are you absolutely sure?
              </h4>
              <p className="text-sm text-red-700 dark:text-red-300 mb-4">
                This action cannot be undone. This will permanently delete your account and remove all your data from our servers.
              </p>
              <div className="flex space-x-3">
                <Button variant="danger" size="sm" onClick={handleDeleteAccount}>
                  Yes, delete my account
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setShowDeleteAccount(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Support */}
      <Card>
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
          Support
        </h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-slate-900 dark:text-white">Help Center</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Find answers to common questions
              </p>
            </div>
            <Button variant="ghost">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              Open Help Center
            </Button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-slate-900 dark:text-white">Contact Support</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Get help from our support team
              </p>
            </div>
            <Button variant="ghost">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Contact Support
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default SettingsPage;
