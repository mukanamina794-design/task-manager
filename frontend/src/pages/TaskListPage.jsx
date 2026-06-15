import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';

const STATUS_LABELS   = { todo: 'To do', in_progress: 'In progress', done: 'Done' };
const PRIORITY_LABELS = { low: 'Low', medium: 'Medium', high: 'High' };

function isOverdue(due_date) {
  if (!due_date) return false;
  return due_date < new Date().toISOString().split('T')[0];
}

function formatDate(d) {
  if (!d) return null;
  return new Date(d + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

const INIT = { search: '', status: '', priority: '', due_from: '', due_to: '', sort: 'created_desc' };

export default function TaskListPage() {
  const navigate = useNavigate();
  const [tasks,   setTasks]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState(INIT);
  const [showDate, setShowDate] = useState(false);

  const load = useCallback(async (f) => {
    setLoading(true);
    const params = new URLSearchParams();
    if (f.search)   params.set('search',   f.search);
    if (f.status)   params.set('status',   f.status);
    if (f.priority) params.set('priority', f.priority);
    if (f.due_from) params.set('due_from', f.due_from);
    if (f.due_to)   params.set('due_to',   f.due_to);
    if (f.sort)     params.set('sort',     f.sort);
    try {
      const data = await api.get(`/tasks?${params}`);
      setTasks(data.tasks);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(INIT); }, []);

  function setFilter(field) {
    return (e) => {
      const next = { ...filters, [field]: e.target.value };
      setFilters(next);
      load(next);
    };
  }

  function clearFilters() {
    setFilters(INIT);
    setShowDate(false);
    load(INIT);
  }

  const hasActiveFilters = filters.search || filters.status || filters.priority || filters.due_from || filters.due_to;

  async function deleteTask(id) {
    if (!confirm('Delete this task?')) return;
    await api.delete(`/tasks/${id}`);
    setTasks((ts) => ts.filter((t) => t.id !== id));
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1>Tasks {!loading && <span style={{ fontSize: '1rem', fontWeight: 400, color: 'var(--muted)' }}>({tasks.length})</span>}</h1>
        <button className="btn btn-primary btn-sm" onClick={() => navigate('/tasks/new')}>New task</button>
      </div>

      <div className="filter-bar">
        <input
          className="input"
          placeholder="Search..."
          value={filters.search}
          onChange={setFilter('search')}
        />
        <select className="select" value={filters.status} onChange={setFilter('status')}>
          <option value="">All statuses</option>
          <option value="todo">To do</option>
          <option value="in_progress">In progress</option>
          <option value="done">Done</option>
        </select>
        <select className="select" value={filters.priority} onChange={setFilter('priority')}>
          <option value="">All priorities</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
        <select className="select" value={filters.sort} onChange={setFilter('sort')}>
          <option value="created_desc">Newest first</option>
          <option value="created_asc">Oldest first</option>
          <option value="due_asc">Due date (asc)</option>
          <option value="due_desc">Due date (desc)</option>
          <option value="priority_desc">Priority (high first)</option>
          <option value="priority_asc">Priority (low first)</option>
        </select>
        <button className="btn btn-secondary btn-sm" onClick={() => setShowDate((v) => !v)}>
          {showDate ? 'Hide date filter' : 'Date range'}
        </button>
        {hasActiveFilters && (
          <button className="btn btn-ghost btn-sm" onClick={clearFilters}>Clear filters</button>
        )}
      </div>

      {showDate && (
        <div className="filter-bar" style={{ marginTop: -8, marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <label style={{ fontSize: '.8125rem', color: 'var(--muted)', whiteSpace: 'nowrap' }}>Due from</label>
            <input className="input" type="date" value={filters.due_from} onChange={setFilter('due_from')} style={{ width: 160 }} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <label style={{ fontSize: '.8125rem', color: 'var(--muted)', whiteSpace: 'nowrap' }}>to</label>
            <input className="input" type="date" value={filters.due_to} onChange={setFilter('due_to')} style={{ width: 160 }} />
          </div>
        </div>
      )}

      {loading ? (
        <div className="spinner">Loading...</div>
      ) : tasks.length === 0 ? (
        <div className="empty-state">
          <p className="empty-title">No tasks found</p>
          <p>{hasActiveFilters ? 'Try adjusting the filters.' : 'Create your first task.'}</p>
        </div>
      ) : (
        <div className="task-list">
          {tasks.map((task) => (
            <div className="task-item" key={task.id}>
              <div className="task-main">
                <span
                  className={`task-title${task.status === 'done' ? ' done' : ''}`}
                  onClick={() => navigate(`/tasks/${task.id}/edit`)}
                >
                  {task.title}
                </span>
                <div className="task-meta">
                  <span className={`badge badge-status-${task.status}`}>{STATUS_LABELS[task.status]}</span>
                  <span className={`badge badge-priority-${task.priority}`}>{PRIORITY_LABELS[task.priority]}</span>
                  {task.due_date && (
                    <span className={`task-date${isOverdue(task.due_date) && task.status !== 'done' ? ' overdue' : ''}`}>
                      {formatDate(task.due_date)}
                    </span>
                  )}
                  {task.description && (
                    <span className="task-desc" style={{ maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {task.description}
                    </span>
                  )}
                </div>
              </div>
              <div className="task-actions">
                <button className="btn btn-ghost btn-sm" onClick={() => navigate(`/tasks/${task.id}/edit`)}>Edit</button>
                <button className="btn btn-danger btn-sm" onClick={() => deleteTask(task.id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
