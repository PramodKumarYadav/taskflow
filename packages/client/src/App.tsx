import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { FeatureFlagProvider } from './contexts/FeatureFlagContext';
import { Navbar } from './components/Navbar';
import { ProtectedRoute } from './components/ProtectedRoute';
import { FlagGate } from './components/FlagGate';
import { FeatureFlagBanner } from './components/FeatureFlagBanner';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { TasksPage } from './pages/TasksPage';
import { DashboardPage } from './pages/DashboardPage';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <FeatureFlagProvider>
          <FeatureFlagBanner />
          <Navbar />
          <Routes>
            {/* Public */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Protected */}
            <Route element={<ProtectedRoute />}>
              <Route path="/tasks" element={<TasksPage />} />
              <Route
                path="/dashboard"
                element={
                  <FlagGate flag="DASHBOARD_ANALYTICS">
                    <DashboardPage />
                  </FlagGate>
                }
              />
            </Route>

            {/* Default */}
            <Route path="*" element={<Navigate to="/tasks" replace />} />
          </Routes>
        </FeatureFlagProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
