import { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { clearToken } from '../api/client';

function useDarkMode() {
  const [dark, setDark] = useState(() => {
    const saved = localStorage.getItem('theme');
    if (saved) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    localStorage.setItem('theme', dark ? 'dark' : 'light');
  }, [dark]);

  return [dark, setDark];
}

export default function Layout({ user, onLogout, children }) {
  const navigate = useNavigate();
  const [dark, setDark] = useDarkMode();

  function logout() {
    clearToken();
    onLogout();
    navigate('/login');
  }

  return (
    <div className="app-shell">
      <header className="top-bar">
        <span className="logo">Tasks</span>
        <nav>
          <NavLink to="/tasks"     className={({ isActive }) => isActive ? 'active' : ''}>All tasks</NavLink>
          <NavLink to="/board"     className={({ isActive }) => isActive ? 'active' : ''}>Board</NavLink>
          <NavLink to="/dashboard" className={({ isActive }) => isActive ? 'active' : ''}>Dashboard</NavLink>
        </nav>
        {user && <span className="user-info">{user.email}</span>}
        <button className="btn-theme" onClick={() => setDark((d) => !d)} title="Toggle dark mode">
          {dark ? 'Light' : 'Dark'}
        </button>
        <button className="btn-logout" onClick={logout}>Sign out</button>
      </header>
      <main style={{ flex: 1 }}>
        {children}
      </main>
    </div>
  );
}
