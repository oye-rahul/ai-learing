import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { login, clearError } from '../store/slices/authSlice';
import { AppDispatch } from '../store/store';
import Button from '../components/shared/Button';
import Input from '../components/shared/Input';
import { toast } from 'react-toastify';
import { Mail, Lock, LogIn, ArrowRight } from 'lucide-react';

const LoginPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state: RootState) => state.auth);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [formErrors, setFormErrors] = useState({
    email: '',
    password: '',
  });

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const validateForm = () => {
    const errors = {
      email: '',
      password: '',
    };

    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Invalid email format';
    }

    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }

    setFormErrors(errors);
    return !errors.email && !errors.password;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      await dispatch(login(formData)).unwrap();
      toast.success('Login successful');
      navigate('/dashboard', { replace: true });
    } catch (error) {
      toast.error('Invalid email or password');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    if (formErrors[name as keyof typeof formErrors]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  return (
    <div className="w-full">
      {/* Enhanced Glass Card */}
      <div className="relative p-10 rounded-[2.5rem] glass-premium animate-fade-in overflow-hidden">
        {/* Subtle Inner Glow */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>

        <div className="mb-10 text-center relative z-10">
          <h2 className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Login
          </h2>
          <p className="mt-3 text-slate-500 dark:text-slate-400 font-medium">
            Sign in to your account to continue
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest ml-1">Email</label>
            <Input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              error={formErrors.email}
              placeholder="Enter your email"
              className="bg-white dark:bg-slate-900/60 border-slate-200 dark:border-white/10 rounded-2xl p-4 focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
              leftIcon={<Mail className="w-5 h-5 text-slate-400" />}
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center px-1">
              <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest">Password</label>
              <Link to="/auth/forgot-password" title="Recover Access" className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 transition-colors">
                Forgot password?
              </Link>
            </div>
            <Input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              error={formErrors.password}
              placeholder="••••••••"
              className="bg-white dark:bg-slate-900/60 border-slate-200 dark:border-white/10 rounded-2xl p-4 focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
              leftIcon={<Lock className="w-5 h-5 text-slate-400" />}
            />
          </div>

          <div className="flex items-center px-1">
            <input
              id="remember-me"
              name="remember-me"
              type="checkbox"
              className="h-4 w-4 rounded border-slate-300 dark:border-white/10 text-indigo-600 focus:ring-indigo-500 cursor-pointer transition-all"
            />
            <label htmlFor="remember-me" className="ml-3 block text-sm font-medium text-slate-600 dark:text-slate-400 cursor-pointer">
              Remember me
            </label>
          </div>

          <Button
            type="submit"
            loading={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-5 rounded-2xl font-bold text-lg hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-indigo-600/20 flex items-center justify-center gap-3 group"
          >
            <span>Sign In</span>
            <LogIn className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Button>
        </form>

        <div className="mt-10 pt-8 border-t border-slate-200 dark:border-white/5 text-center relative z-10">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
            Don't have an account?{' '}
            <Link to="/auth/signup" className="ml-1 font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 transition-colors">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
