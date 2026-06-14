import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Layout & Common
import { Layout } from './components/Layout';

// Public Pages
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { ForgotPassword } from './pages/ForgotPassword';

// Private Pages
import { Assessment } from './pages/Assessment';
import { Dashboard } from './pages/Dashboard';
import { Roadmap } from './pages/Roadmap';
import { Planner } from './pages/Planner';
import { Recommendations } from './pages/Recommendations';
import { ResumeScanner } from './pages/ResumeScanner';
import { Chatbot } from './pages/Chatbot';
import { Profile } from './pages/Profile';
import { AdminConsole } from './pages/AdminConsole';

import { api } from './services/api';

export const App: React.FC = () => {
  const [token, setToken] = useState<string | null>(localStorage.getItem('careerpath_token'));
  const [user, setUser] = useState<any>(null);
  const [appReady, setAppReady] = useState(false);

  useEffect(() => {
    const bootstrapAuth = async () => {
      const activeToken = localStorage.getItem('careerpath_token');
      if (activeToken) {
        try {
          // Fetch latest profile verification
          const data = await api.getProfile();
          setUser(data.user);
        } catch (err) {
          console.error('Session validation failed. Logging out.', err);
          handleLogout();
        }
      }
      setAppReady(true);
    };

    bootstrapAuth();
  }, [token]);

  const handleLoginSuccess = (newToken: string, loggedUser: any) => {
    localStorage.setItem('careerpath_token', newToken);
    setToken(newToken);
    setUser(loggedUser);
  };

  const handleLogout = () => {
    localStorage.removeItem('careerpath_token');
    localStorage.removeItem('careerpath_completed_tasks');
    setToken(null);
    setUser(null);
  };

  if (!appReady) {
    return (
      <div className="min-h-screen bg-dark-bg flex flex-col items-center justify-center gap-4 text-dark-text">
        <div className="w-10 h-10 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
        <p className="text-sm text-dark-muted font-bold tracking-wider uppercase">Loading CareerPath AI...</p>
      </div>
    );
  }

  // Helper Guard Wrapper for Authenticated Pages
  const ProtectedRoute = ({ children, requireAdminRole = false }: { children: React.ReactNode; requireAdminRole?: boolean }) => {
    if (!token) {
      return <Navigate to="/login" replace />;
    }

    if (requireAdminRole && user?.role !== 'ADMIN') {
      return <Navigate to="/" replace />;
    }

    // If logged in, but not yet assessed, force onboarding
    const hasAssessed = user?.assessment || user?.hasCompletedAssessment;
    if (!hasAssessed && window.location.pathname !== '/assessment') {
      return <Navigate to="/assessment" replace />;
    }

    return (
      <Layout user={user} onLogout={handleLogout}>
        {children}
      </Layout>
    );
  };

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route 
          path="/login" 
          element={token ? <Navigate to="/" replace /> : <Login onLoginSuccess={handleLoginSuccess} />} 
        />
        <Route 
          path="/signup" 
          element={token ? <Navigate to="/" replace /> : <Signup onLoginSuccess={handleLoginSuccess} />} 
        />
        <Route 
          path="/forgot-password" 
          element={token ? <Navigate to="/" replace /> : <ForgotPassword />} 
        />

        {/* Private Onboarding (Assessment wizard has no sidebar layout) */}
        <Route 
          path="/assessment" 
          element={
            token ? (
              user?.assessment || user?.hasCompletedAssessment ? (
                <Navigate to="/" replace />
              ) : (
                <Assessment />
              )
            ) : (
              <Navigate to="/login" replace />
            )
          } 
        />

        {/* Authenticated Dashboard Core Routes */}
        <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/roadmap" element={<ProtectedRoute><Roadmap /></ProtectedRoute>} />
        <Route path="/planner" element={<ProtectedRoute><Planner /></ProtectedRoute>} />
        <Route path="/recommendations" element={<ProtectedRoute><Recommendations /></ProtectedRoute>} />
        <Route path="/resume-scanner" element={<ProtectedRoute><ResumeScanner /></ProtectedRoute>} />
        <Route path="/mentor" element={<ProtectedRoute><Chatbot /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

        {/* Admin Console Route */}
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute requireAdminRole={true}>
              <AdminConsole />
            </ProtectedRoute>
          } 
        />

        {/* Catch-all Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};
export default App;
