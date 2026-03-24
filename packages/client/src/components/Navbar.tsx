import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useFeatureFlag } from '../hooks/useFeatureFlag';
import { DarkModeToggle } from './DarkModeToggle';
import { NotificationBell } from './NotificationBell';

export function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const showDashboard = useFeatureFlag('DASHBOARD_ANALYTICS');
  const showDarkMode = useFeatureFlag('DARK_MODE');
  const showNotifications = useFeatureFlag('NOTIFICATIONS');

  function handleLogout() {
    logout();
    navigate('/login');
  }

  if (!user) return null;

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/tasks" className="navbar-logo">
          TaskFlow
        </Link>
      </div>

      <div className="navbar-links">
        <Link to="/tasks" className="navbar-link">
          Tasks
        </Link>
        {showDashboard && (
          <Link to="/dashboard" className="navbar-link">
            Dashboard
          </Link>
        )}
      </div>

      <div className="navbar-actions">
        {showNotifications && <NotificationBell />}
        {showDarkMode && <DarkModeToggle />}
        <span className="navbar-user">{user.name}</span>
        <button className="btn btn-ghost btn-sm" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </nav>
  );
}
