import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../store/slices/authSlice';
import { toast } from 'react-toastify';
import LoadingSpinner from '../components/shared/LoadingSpinner';

const GoogleCallbackPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    const token = searchParams.get('token');
    const refreshToken = searchParams.get('refreshToken');
    const error = searchParams.get('error');

    if (error) {
      toast.error('Google authentication failed. Please try again.');
      navigate('/auth/login');
      return;
    }

    if (token && refreshToken) {
      // Store tokens
      localStorage.setItem('token', token);
      localStorage.setItem('refreshToken', refreshToken);

      // Fetch user data
      fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/users/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
        .then(res => res.json())
        .then(data => {
          if (data.user) {
            dispatch(setCredentials({
              user: data.user,
              token,
              refreshToken
            }));
            toast.success('Welcome! You\'ve successfully signed in with Google.');
            navigate('/dashboard');
          } else {
            throw new Error('Failed to fetch user data');
          }
        })
        .catch(error => {
          console.error('Error fetching user data:', error);
          toast.error('Authentication failed. Please try again.');
          navigate('/auth/login');
        });
    } else {
      toast.error('Authentication failed. Please try again.');
      navigate('/auth/login');
    }
  }, [searchParams, navigate, dispatch]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
      <div className="text-center">
        <LoadingSpinner size="lg" />
        <p className="mt-4 text-slate-600 dark:text-slate-400">
          Completing Google sign in...
        </p>
      </div>
    </div>
  );
};

export default GoogleCallbackPage;
