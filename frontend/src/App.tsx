import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './stores/authStore';
import { useThemeStore } from './stores/themeStore';
import Sidebar from './components/Sidebar';
import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';
import ProfileBuilder from './pages/ProfileBuilder';
import JDWorkspace from './pages/JDWorkspace';
import ResumeResults from './pages/ResumeResults';
import HistoryPage from './pages/HistoryPage';
import SettingsPage from './pages/SettingsPage';
import AnalyzeResumePage from './pages/AnalyzeResumePage';

// Protected Route Wrapper Component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-400 gap-3">
        <div className="w-8 h-8 border-3 border-primary-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-semibold">Validating session security...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200">
      <Sidebar />
      <main className="flex-1 flex flex-col overflow-hidden">
        {children}
      </main>
    </div>
  );
}

export default function App() {
  const { initTheme } = useThemeStore();
  const { checkAuth } = useAuthStore();

  useEffect(() => {
    initTheme();
    checkAuth();
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Route */}
        <Route path="/" element={<AuthPage />} />

        {/* Protected Application Routes */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        <Route path="/profile" element={
          <ProtectedRoute>
            <ProfileBuilder />
          </ProtectedRoute>
        } />
        <Route path="/jd" element={
          <ProtectedRoute>
            <JDWorkspace />
          </ProtectedRoute>
        } />
        <Route path="/results" element={
          <ProtectedRoute>
            <ResumeResults />
          </ProtectedRoute>
        } />
        <Route path="/history" element={
          <ProtectedRoute>
            <HistoryPage />
          </ProtectedRoute>
        } />
        <Route path="/settings" element={
          <ProtectedRoute>
            <SettingsPage />
          </ProtectedRoute>
        } />
        <Route path="/analyze-resume" element={
          <ProtectedRoute>
            <AnalyzeResumePage />
          </ProtectedRoute>
        } />

        {/* Catch-all Redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
