import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import VerifyEmailPage from './pages/VerifyEmailPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import DashboardPage from './pages/DashboardPage';
import JobPortal from './pages/JobPortal';
import ResumeManagement from './pages/ResumeManagement';
import ApplicationTracking from './pages/ApplicationTracking';

// Route protection wrapper
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useApp();

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[60svh] gap-3">
        <div className="w-10 h-10 rounded-full border-4 border-indigo-500/20 border-t-indigo-500 animate-spin" />
        <span className="text-xs text-slate-500 font-medium tracking-wide">Loading credentials...</span>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

const App = () => {
  return (
    <Router>
      <AppProvider>
        <div className="min-h-screen flex flex-col pt-4">
          <Navbar />
          <main className="flex-1 flex flex-col max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 mt-6">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/verify-email" element={<VerifyEmailPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
              <Route path="/forgot-password" element={<Navigate to="/login?forgot=true" replace />} />

              {/* Protected User Dashboard */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <DashboardPage />
                  </ProtectedRoute>
                }
              />

              {/* Job Board (Action splits by role inside the file) */}
              <Route
                path="/jobs"
                element={
                  <ProtectedRoute>
                    <JobPortal />
                  </ProtectedRoute>
                }
              />

              {/* Student Only: Resume Upload and ATS Parser */}
              <Route
                path="/resume"
                element={
                  <ProtectedRoute allowedRoles={['student']}>
                    <ResumeManagement />
                  </ProtectedRoute>
                }
              />

              {/* Student Only: Kanban Tracker */}
              <Route
                path="/tracking"
                element={
                  <ProtectedRoute allowedRoles={['student']}>
                    <ApplicationTracking />
                  </ProtectedRoute>
                }
              />

              {/* Catch-all Redirect */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </AppProvider>
    </Router>
  );
};

export default App;
