import { useEffect, useState } from 'react';
import { api } from '../api/client';

export default function DashboardPage() {
  const [tasks,   setTasks]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/tasks').then((d) => { setTasks(d.tasks); setLoading(false); });
  }, []);

  if (loading) return <div className="spinner">Loading...</div>;

  const total      = tasks.length;
  const todo       = tasks.filter((t) => t.status === 'todo').length;
  const inProgress = tasks.filter((t) => t.status === 'in_progress').length;
  const done       = tasks.filter((t) => t.status === 'done').length;
  const highPri    = tasks.filter((t) => t.priority === 'high' && t.status !== 'done').length;

  const today = new Date().toISOString().split('T')[0];
  const overdue = tasks.filter((t) => t.due_date && t.due_date < today && t.status !== 'done').length;

  return (
    <div className="page">
      <div className="page-header" style={{ marginBottom: 28 }}>
        <h1>Dashboard</h1>
      </div>

      <div className="stats-grid">
        <div className="stat-box">
          <div className="stat-num">{total}</div>
          <div className="stat-label">Total tasks</div>
        </div>
        <div className="stat-box">
          <div className="stat-num">{todo}</div>
          <div className="stat-label">To do</div>
        </div>
        <div className="stat-box">
          <div className="stat-num">{inProgress}</div>
          <div className="stat-label">In progress</div>
        </div>
        <div className="stat-box">
          <div className="stat-num" style={{ color: 'var(--success)' }}>{done}</div>
          <div className="stat-label">Completed</div>
        </div>
        <div className="stat-box">
          <div className="stat-num" style={{ color: 'var(--danger)' }}>{highPri}</div>
          <div className="stat-label">High priority open</div>
        </div>
        <div className="stat-box">
          <div className="stat-num" style={{ color: overdue > 0 ? 'var(--danger)' : 'inherit' }}>{overdue}</div>
          <div className="stat-label">Overdue</div>
        </div>
      </div>

      {total > 0 && (
        <>
          <h2 style={{ marginBottom: 12 }}>Completion</h2>
          <div style={{ background: 'var(--border)', borderRadius: 4, height: 8, marginBottom: 6, overflow: 'hidden' }}>
            <div style={{ background: 'var(--success)', height: '100%', width: `${(done / total) * 100}%`, transition: 'width .4s' }} />
          </div>
          <p style={{ fontSize: '.8125rem', color: 'var(--muted)' }}>{done} of {total} tasks complete ({Math.round((done / total) * 100)}%)</p>
        </>
      )}
    </div>
  );
}
