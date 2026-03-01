import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { register, clearError } from '../store/slices/authSlice';
import { AppDispatch } from '../store/store';
import Button from '../components/shared/Button';
import Input from '../components/shared/Input';
import { toast } from 'react-toastify';
import { User, Mail, Lock, UserPlus, ChevronRight } from 'lucide-react';

const SignupPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state: RootState) => state.auth);

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'beginner' as 'beginner' | 'intermediate' | 'expert',
  });

  const [formErrors, setFormErrors] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const validateForm = () => {
    const errors = {
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
    };

    if (!formData.username) errors.username = 'Username required';
    else if (formData.username.length < 3) errors.username = 'Min 3 chars';

    if (!formData.email) errors.email = 'Email required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) errors.email = 'Invalid format';

    if (!formData.password) errors.password = 'Password required';
    else if (formData.password.length < 6) errors.password = 'Min 6 chars';

    if (!formData.confirmPassword) errors.confirmPassword = 'Please confirm';
    else if (formData.password !== formData.confirmPassword) errors.confirmPassword = 'Passwords no match';

    setFormErrors(errors);
    return !errors.username && !errors.email && !errors.password && !errors.confirmPassword;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      await dispatch(register({
        username: formData.username,
        email: formData.email,
        password: formData.password,
        role: formData.role,
      })).unwrap();
      toast.success('Account created successfully');
      navigate('/dashboard', { replace: true });
    } catch (error) {
      toast.error('Registration failed');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (formErrors[name as keyof typeof formErrors]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  return (
    <div className="w-full">
      {/* Enhanced Glass Card */}
      <div className="relative p-10 rounded-[3rem] glass-premium animate-fade-in overflow-hidden">
        {/* Subtle Inner Glow */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>

        <div className="mb-10 text-center relative z-10">
          <h2 className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Create Account
          </h2>
          <p className="mt-3 text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
            Join thousands of developers learning with AI
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest ml-1">Username</label>
              <Input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                error={formErrors.username}
                placeholder="Enter username"
                className="bg-white dark:bg-slate-900/60 border-slate-200 dark:border-white/10 rounded-2xl p-4 focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                leftIcon={<User className="w-5 h-5 text-slate-400" />}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest ml-1">Email</label>
              <Input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                error={formErrors.email}
                placeholder="Enter email"
                className="bg-white dark:bg-slate-900/60 border-slate-200 dark:border-white/10 rounded-2xl p-4 focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                leftIcon={<Mail className="w-5 h-5 text-slate-400" />}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest ml-1">Password</label>
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
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest ml-1">Confirm Password</label>
              <Input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                error={formErrors.confirmPassword}
                placeholder="••••••••"
                className="bg-white dark:bg-slate-900/60 border-slate-200 dark:border-white/10 rounded-2xl p-4 focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                leftIcon={<Lock className="w-5 h-5 text-slate-400" />}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest ml-1 mb-3">
              Experience Level
            </label>
            <div className="relative group">
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full px-5 py-4 bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-white/10 rounded-2xl focus:ring-2 focus:ring-indigo-500 appearance-none font-bold text-slate-900 dark:text-white transition-all text-sm outline-none"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="expert">Expert</option>
              </select>
              <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 group-hover:text-indigo-600 transition-colors">
                <ChevronRight className="w-5 h-5" />
              </div>
            </div>
          </div>

          <div className="flex items-start px-1">
            <div className="flex items-center h-5">
              <input
                id="terms"
                name="terms"
                type="checkbox"
                required
                className="h-4 w-4 bg-white dark:bg-slate-900 border-slate-300 dark:border-white/10 text-indigo-600 focus:ring-indigo-500 rounded cursor-pointer"
              />
            </div>
            <label htmlFor="terms" className="ml-3 text-sm font-medium text-slate-500 dark:text-slate-400 cursor-pointer pointer-events-auto leading-relaxed">
              I agree to the <a href="/terms" className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-500">Terms of Service</a> and <a href="/privacy" className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-500">Privacy Policy</a>
            </label>
          </div>

          <Button
            type="submit"
            loading={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-5 rounded-2xl font-bold text-lg hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-indigo-600/20 flex items-center justify-center gap-3 group"
          >
            <span>Sign Up</span>
            <UserPlus className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Button>
        </form>

        <div className="mt-10 pt-8 border-t border-slate-200 dark:border-white/5 text-center relative z-10">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
            Already have an account?{' '}
            <Link to="/auth/login" className="ml-1 font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 transition-colors">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
