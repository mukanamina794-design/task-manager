import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { api, hasToken, clearToken } from './api/client';
import Layout from './components/Layout';
import LoginPage    from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import TaskListPage from './pages/TaskListPage';
import TaskNewPage  from './pages/TaskNewPage';
import TaskEditPage from './pages/TaskEditPage';
import BoardPage    from './pages/BoardPage';
import DashboardPage from './pages/DashboardPage';

function PrivateRoute({ user, children }) {
  if (!hasToken()) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!hasToken()) { setLoading(false); return; }
    api.get('/auth/me')
      .then((d) => setUser(d.user))
      .catch(() => clearToken())
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="spinner">Loading...</div>;

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login"    element={<LoginPage    onLogin={setUser} />} />
        <Route path="/register" element={<RegisterPage onLogin={setUser} />} />

        <Route path="/tasks" element={
          <PrivateRoute user={user}>
            <Layout user={user} onLogout={() => setUser(null)}>
              <TaskListPage />
            </Layout>
          </PrivateRoute>
        } />
        <Route path="/tasks/new" element={
          <PrivateRoute user={user}>
            <Layout user={user} onLogout={() => setUser(null)}>
              <TaskNewPage />
            </Layout>
          </PrivateRoute>
        } />
        <Route path="/tasks/:id/edit" element={
          <PrivateRoute user={user}>
            <Layout user={user} onLogout={() => setUser(null)}>
              <TaskEditPage />
            </Layout>
          </PrivateRoute>
        } />
        <Route path="/board" element={
          <PrivateRoute user={user}>
            <Layout user={user} onLogout={() => setUser(null)}>
              <BoardPage />
            </Layout>
          </PrivateRoute>
        } />
        <Route path="/dashboard" element={
          <PrivateRoute user={user}>
            <Layout user={user} onLogout={() => setUser(null)}>
              <DashboardPage />
            </Layout>
          </PrivateRoute>
        } />

        <Route path="*" element={<Navigate to={hasToken() ? '/tasks' : '/login'} replace />} />
      </Routes>
    </BrowserRouter>
  );
}
