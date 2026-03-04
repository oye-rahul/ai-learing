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
import TutorialsPage from './pages/TutorialsPage';
import ExamsPage from './pages/ExamsPage';
import CodeExplainerPage from './pages/CodeExplainerPage';
import DebugHelperPage from './pages/DebugHelperPage';
import PracticePage from './pages/PracticePage';
import AILearningAssistantPage from './pages/AILearningAssistantPage';

// Components
import LoadingSpinner from './components/shared/LoadingSpinner';

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace />;
  }

  return <>{children}</>;
};

function App() {
  const dispatch = useDispatch<AppDispatch>();
  const { loading, token, isAuthenticated } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    // Check auth on app load if token exists
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (storedToken && storedUser) {
      dispatch(checkAuth());
    }
  }, [dispatch]);

  // Show loading only on initial auth check
  if (loading && token === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-slate-600 dark:text-slate-400 font-semibold">Checking authentication...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="App">
      <Routes>
        {/* Public Routes - Redirect to dashboard if authenticated */}
        <Route path="/" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <HomePage />} />
        <Route path="/share/:slug" element={<SharePage />} />

        {/* Auth Routes - Redirect to dashboard if already authenticated */}
        <Route path="/auth" element={<AuthLayout />}>
          <Route path="login" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />} />
          <Route path="signup" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <SignupPage />} />
          <Route path="forgot-password" element={<ForgotPasswordPage />} />
          <Route path="reset-password" element={<ResetPasswordPage />} />
        </Route>

        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <AppLayout>
                <DashboardPage />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/ai-learnixo"
          element={
            <ProtectedRoute>
              <AppLayout>
                <AILearnixoPage />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/playground"
          element={
            <ProtectedRoute>
              <AppLayout>
                <PlaygroundPage />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/code-editor"
          element={
            <ProtectedRoute>
              <CodeEditorPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/learn"
          element={
            <ProtectedRoute>
              <AppLayout>
                <LearningPage />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/projects"
          element={
            <ProtectedRoute>
              <AppLayout>
                <ProjectsPage />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/analytics"
          element={
            <ProtectedRoute>
              <AppLayout>
                <AnalyticsPage />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <AppLayout>
                <SettingsPage />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/snippets"
          element={
            <ProtectedRoute>
              <AppLayout>
                <SnippetsPage />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/badges"
          element={
            <ProtectedRoute>
              <AppLayout>
                <BadgesPage />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/learn/assessment"
          element={
            <ProtectedRoute>
              <AppLayout>
                <AssessmentPage />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/tutorials"
          element={
            <ProtectedRoute>
              <AppLayout>
                <TutorialsPage />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/exams"
          element={
            <ProtectedRoute>
              <AppLayout>
                <ExamsPage />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/code-explainer"
          element={
            <ProtectedRoute>
              <AppLayout>
                <CodeExplainerPage />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/debug-helper"
          element={
            <ProtectedRoute>
              <AppLayout>
                <DebugHelperPage />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/practice"
          element={
            <ProtectedRoute>
              <AppLayout>
                <PracticePage />
              </AppLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/ai-assistant"
          element={
            <ProtectedRoute>
              <AppLayout>
                <AILearningAssistantPage />
              </AppLayout>
            </ProtectedRoute>
          }
        />

        {/* Catch all route - redirect based on auth status */}
        <Route path="*" element={<Navigate to={isAuthenticated ? "/dashboard" : "/"} replace />} />
      </Routes>
    </div>
  );
}

export default App;
