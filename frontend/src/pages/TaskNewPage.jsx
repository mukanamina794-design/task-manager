import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import TaskForm from '../components/TaskForm';

export default function TaskNewPage() {
  const navigate = useNavigate();

  async function handleSubmit(values) {
    await api.post('/tasks', values);
    navigate('/tasks');
  }

  return (
    <div className="page" style={{ maxWidth: 560 }}>
      <div className="page-header" style={{ marginBottom: 28 }}>
        <h1>New task</h1>
      </div>
      <TaskForm onSubmit={handleSubmit} submitLabel="Create task" />
    </div>
  );
}
