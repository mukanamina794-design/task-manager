import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const STATUS_OPTIONS = [
  { value: 'todo',        label: 'To do' },
  { value: 'in_progress', label: 'In progress' },
  { value: 'done',        label: 'Done' },
];

const PRIORITY_OPTIONS = [
  { value: 'low',    label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high',   label: 'High' },
];

export default function TaskForm({ initial = {}, onSubmit, submitLabel = 'Save' }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title:       initial.title       ?? '',
    description: initial.description ?? '',
    status:      initial.status      ?? 'todo',
    priority:    initial.priority    ?? 'medium',
    due_date:    initial.due_date    ?? '',
  });
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);

  function set(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  async function submit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await onSubmit({
        ...form,
        due_date: form.due_date || null,
      });
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit}>
      {error && <div className="alert alert-error">{error}</div>}

      <div className="form-group">
        <label>Title</label>
        <input className="input" type="text" value={form.title} onChange={set('title')} required autoFocus placeholder="Task title" />
      </div>

      <div className="form-group">
        <label>Description</label>
        <textarea className="textarea" value={form.description} onChange={set('description')} placeholder="Optional details..." />
      </div>

      <div className="form-row">
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label>Status</label>
          <select className="select" value={form.status} onChange={set('status')}>
            {STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label>Priority</label>
          <select className="select" value={form.priority} onChange={set('priority')}>
            {PRIORITY_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
      </div>

      <div className="form-group" style={{ marginTop: 16 }}>
        <label>Due date</label>
        <input className="input" type="date" value={form.due_date} onChange={set('due_date')} />
      </div>

      <div className="form-actions">
        <button className="btn btn-primary" type="submit" disabled={loading}>
          {loading ? 'Saving...' : submitLabel}
        </button>
        <button className="btn btn-secondary" type="button" onClick={() => navigate(-1)}>Cancel</button>
      </div>
    </form>
  );
}
