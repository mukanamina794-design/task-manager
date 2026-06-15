import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api, saveToken } from '../api/client';

export default function RegisterPage({ onLogin }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '', name: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function set(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  async function submit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await api.post('/auth/register', form);
      saveToken(data.token);
      onLogin(data.user);
      navigate('/tasks');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-wrap">
      <div className="auth-box">
        <h1>Create account</h1>
        <p className="auth-sub">Start managing your tasks</p>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={submit}>
          <div className="form-group">
            <label>Name (optional)</label>
            <input className="input" type="text" value={form.name} onChange={set('name')} placeholder="Your name" />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input className="input" type="email" value={form.email} onChange={set('email')} required autoFocus />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input className="input" type="password" value={form.password} onChange={set('password')} required minLength={6} placeholder="At least 6 characters" />
          </div>
          <div className="form-actions">
            <button className="btn btn-primary" type="submit" disabled={loading} style={{ width: '100%', justifyContent: 'center' }}>
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </div>
        </form>

        <p className="auth-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
