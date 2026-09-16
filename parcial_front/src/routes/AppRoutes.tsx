import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LandingPage } from '../pages/LandingPage';
import { LoginPage } from '../pages/LoginPage';
import { RegisterPage } from '../pages/RegisterPage';
import { AppShell } from '../components/layout/AppShell';
import { DashboardPage } from '../pages/DashboardPage';
import { UsersPage } from '../pages/UsersPage';
import { ProfilePage } from '../pages/ProfilePage';
import { TargetsPage } from '../pages/TargetsPage';
import { AssessmentsPage } from '../pages/AssessmentsPage';
import { FindingsPage } from '../pages/FindingsPage';
import { AiAssistantPage } from '../pages/AiAssistantPage';
import { MonetizacionPage } from '../pages/MonetizacionPage';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-900 text-slate-400 text-xs font-sans">
        Cargando sesión...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

const DefaultAppRedirect: React.FC = () => {
  const { user } = useAuth();
  if (user?.role === 'AUDITOR') {
    return <Navigate to="/app/profile" replace />;
  }
  return <Navigate to="/app/dashboard" replace />;
};

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Rutas Públicas */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Rutas Protegidas del Dashboard Enterprise */}
      <Route
        path="/app"
        element={
          <ProtectedRoute>
            <AppShell />
          </ProtectedRoute>
        }
      >
        <Route index element={<DefaultAppRedirect />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="targets" element={<TargetsPage />} />
        <Route path="assessments" element={<AssessmentsPage />} />
        <Route path="findings" element={<FindingsPage />} />
        <Route path="ai-assistant" element={<AiAssistantPage />} />
        <Route path="users" element={<UsersPage />} />
        <Route path="monetizacion" element={<MonetizacionPage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="*" element={<DefaultAppRedirect />} />
      </Route>

      {/* Redirección por defecto */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
