import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import TaskForm from '../components/TaskForm';

export default function TaskEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [task,    setTask]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');

  useEffect(() => {
    api.get(`/tasks/${id}`)
      .then((d) => setTask(d.task))
      .catch(() => setError('Task not found'))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleSubmit(values) {
    await api.put(`/tasks/${id}`, values);
    navigate('/tasks');
  }

  if (loading) return <div className="spinner">Loading...</div>;
  if (error)   return <div className="page"><div className="alert alert-error">{error}</div></div>;

  return (
    <div className="page" style={{ maxWidth: 560 }}>
      <div className="page-header" style={{ marginBottom: 28 }}>
        <h1>Edit task</h1>
      </div>
      <TaskForm initial={task} onSubmit={handleSubmit} submitLabel="Save changes" />
    </div>
  );
}
