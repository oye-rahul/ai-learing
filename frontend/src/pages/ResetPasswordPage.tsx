import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { authAPI } from '../services/api';
import Button from '../components/shared/Button';
import Input from '../components/shared/Input';
import { toast } from 'react-toastify';

const ResetPasswordPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      toast.error('Invalid reset link');
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    if (password !== confirm) {
      toast.error('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      await authAPI.resetPasswordWithToken(token, password);
      setSuccess(true);
      toast.success('Password reset successfully. You can now log in.');
      setTimeout(() => navigate('/auth/login'), 2000);
    } catch (err: any) {
      toast.error(err.response?.data?.error || err.response?.data?.message || 'Reset failed');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="w-full max-w-md mx-auto">
        <div className="bg-white dark:bg-slate-800 py-8 px-6 shadow-xl rounded-xl border border-slate-200 dark:border-slate-700 text-center">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Password reset!</h2>
          <p className="text-slate-600 dark:text-slate-400 mb-4">Redirecting you to login...</p>
          <Link to="/auth/login">
            <Button className="w-full">Go to login</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="w-full max-w-md mx-auto">
        <div className="bg-white dark:bg-slate-800 py-8 px-6 shadow-xl rounded-xl border border-slate-200 dark:border-slate-700 text-center">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Invalid link</h2>
          <p className="text-slate-600 dark:text-slate-400 mb-4">This reset link is invalid or expired.</p>
          <Link to="/auth/forgot-password">
            <Button variant="secondary" className="w-full">Request a new link</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white dark:bg-slate-800 py-8 px-6 shadow-xl rounded-xl border border-slate-200 dark:border-slate-700">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Set new password</h2>
        <p className="text-slate-600 dark:text-slate-400 mb-6">Enter your new password below.</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="New password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Min 6 characters"
            minLength={6}
            required
          />
          <Input
            label="Confirm password"
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="Repeat password"
            required
          />
          <Button type="submit" loading={loading} className="w-full" size="lg">
            Reset password
          </Button>
        </form>
        <p className="mt-6 text-center text-sm text-slate-600 dark:text-slate-400">
          <Link to="/auth/login" className="font-medium text-primary-600 hover:text-primary-500">
            Back to login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
