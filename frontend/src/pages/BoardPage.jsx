import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';

const COLUMNS = [
  { key: 'todo',        label: 'To do' },
  { key: 'in_progress', label: 'In progress' },
  { key: 'done',        label: 'Done' },
];

const PRIORITY_LABELS = { low: 'Low', medium: 'Medium', high: 'High' };

export default function BoardPage() {
  const navigate = useNavigate();
  const [tasks,     setTasks]     = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [dragging,  setDragging]  = useState(null);
  const [overCol,   setOverCol]   = useState(null);

  useEffect(() => {
    api.get('/tasks').then((d) => { setTasks(d.tasks); setLoading(false); });
  }, []);

  function byStatus(status) {
    return tasks.filter((t) => t.status === status);
  }

  function onDragStart(task) { setDragging(task); }
  function onDragOver(e, col) { e.preventDefault(); setOverCol(col); }
  function onDragLeave()      { setOverCol(null); }

  async function onDrop(col) {
    setOverCol(null);
    if (!dragging || dragging.status === col) { setDragging(null); return; }
    const updated = await api.put(`/tasks/${dragging.id}`, { status: col });
    setTasks((ts) => ts.map((t) => t.id === dragging.id ? updated.task : t));
    setDragging(null);
  }

  if (loading) return <div className="spinner">Loading...</div>;

  return (
    <div className="page-wide">
      <div className="page-header" style={{ marginBottom: 28 }}>
        <h1>Board</h1>
        <button className="btn btn-primary btn-sm" onClick={() => navigate('/tasks/new')}>New task</button>
      </div>

      <div className="board">
        {COLUMNS.map((col) => (
          <div
            key={col.key}
            className="board-col"
            onDragOver={(e) => onDragOver(e, col.key)}
            onDragLeave={onDragLeave}
            onDrop={() => onDrop(col.key)}
          >
            <div className="board-col-header">
              {col.label}
              <span className="board-col-count">{byStatus(col.key).length}</span>
            </div>
            <div className="board-cards">
              {byStatus(col.key).map((task) => (
                <div
                  key={task.id}
                  className={`board-card${overCol === col.key && dragging?.id !== task.id ? ' drag-over' : ''}`}
                  draggable
                  onDragStart={() => onDragStart(task)}
                >
                  <div className="board-card-title">{task.title}</div>
                  <div className="board-card-meta">
                    <span className={`badge badge-priority-${task.priority}`}>{PRIORITY_LABELS[task.priority]}</span>
                    {task.due_date && <span className="task-date">{task.due_date}</span>}
                  </div>
                  <div style={{ marginTop: 8, display: 'flex', gap: 4 }}>
                    <button className="btn btn-ghost btn-sm" onClick={() => navigate(`/tasks/${task.id}/edit`)}>Edit</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
