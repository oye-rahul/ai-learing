import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from './store/store';
import { checkAuth } from './store/slices/authSlice';
import { AppDispatch } from './store/store';

// Layouts
import AuthLayout from './components/layouts/AuthLayout';
import AppLayout from './components/layouts/AppLayout';

// Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import GoogleCallbackPage from './pages/GoogleCallbackPage';
import DashboardPage from './pages/DashboardPage';
import PlaygroundPage from './pages/PlaygroundPage';
import LearningPage from './pages/LearningPage';
import ProjectsPage from './pages/ProjectsPage';
import AnalyticsPage from './pages/AnalyticsPage';
import SettingsPage from './pages/SettingsPage';
import AILearnixoPage from './pages/AILearnixoPage';
import SnippetsPage from './pages/SnippetsPage';
import BadgesPage from './pages/BadgesPage';
import AssessmentPage from './pages/AssessmentPage';
import SharePage from './pages/SharePage';
import CodeEditorPage from './pages/CodeEditorPage';

// Components
import LoadingSpinner from './components/shared/LoadingSpinner';

function App() {
  const dispatch = useDispatch<AppDispatch>();
  const { isAuthenticated, loading } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    dispatch(checkAuth());
  }, [dispatch]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="App">
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/share/:slug" element={<SharePage />} />

        {/* Auth Routes */}
        <Route path="/auth" element={<AuthLayout />}>
          <Route path="login" element={<LoginPage />} />
          <Route path="signup" element={<SignupPage />} />
          <Route path="forgot-password" element={<ForgotPasswordPage />} />
          <Route path="reset-password" element={<ResetPasswordPage />} />
          <Route path="google/callback" element={<GoogleCallbackPage />} />
        </Route>

        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={
            isAuthenticated ? (
              <AppLayout>
                <DashboardPage />
              </AppLayout>
            ) : (
              <Navigate to="/auth/login" replace />
            )
          }
        />
        <Route
          path="/ai-learnixo"
          element={
            isAuthenticated ? (
              <AppLayout>
                <AILearnixoPage />
              </AppLayout>
            ) : (
              <Navigate to="/auth/login" replace />
            )
          }
        />
        <Route
          path="/playground"
          element={
            isAuthenticated ? (
              <AppLayout>
                <PlaygroundPage />
              </AppLayout>
            ) : (
              <Navigate to="/auth/login" replace />
            )
          }
        />
        <Route
          path="/code-editor"
          element={
            isAuthenticated ? (
              <CodeEditorPage />
            ) : (
              <Navigate to="/auth/login" replace />
            )
          }
        />
        <Route
          path="/learn"
          element={
            isAuthenticated ? (
              <AppLayout>
                <LearningPage />
              </AppLayout>
            ) : (
              <Navigate to="/auth/login" replace />
            )
          }
        />
        <Route
          path="/projects"
          element={
            isAuthenticated ? (
              <AppLayout>
                <ProjectsPage />
              </AppLayout>
            ) : (
              <Navigate to="/auth/login" replace />
            )
          }
        />
        <Route
          path="/analytics"
          element={
            isAuthenticated ? (
              <AppLayout>
                <AnalyticsPage />
              </AppLayout>
            ) : (
              <Navigate to="/auth/login" replace />
            )
          }
        />
        <Route
          path="/settings"
          element={
            isAuthenticated ? (
              <AppLayout>
                <SettingsPage />
              </AppLayout>
            ) : (
              <Navigate to="/auth/login" replace />
            )
          }
        />
        <Route
          path="/snippets"
          element={
            isAuthenticated ? (
              <AppLayout>
                <SnippetsPage />
              </AppLayout>
            ) : (
              <Navigate to="/auth/login" replace />
            )
          }
        />
        <Route
          path="/badges"
          element={
            isAuthenticated ? (
              <AppLayout>
                <BadgesPage />
              </AppLayout>
            ) : (
              <Navigate to="/auth/login" replace />
            )
          }
        />
        <Route
          path="/learn/assessment"
          element={
            isAuthenticated ? (
              <AppLayout>
                <AssessmentPage />
              </AppLayout>
            ) : (
              <Navigate to="/auth/login" replace />
            )
          }
        />

        {/* Catch all route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default App;
