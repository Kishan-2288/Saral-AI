import { useState } from 'react';
import { useNavigate } from '../routes/router';
import { useAuth } from '../hooks/useAuth';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  const submit = async (event) => {
    event.preventDefault();
    setError('');

    try {
      await login(form.email, form.password);
      navigate('/dashboard');
    } catch (exception) {
      setError(exception.message);
    }
  };

  return (
    <main className="login">
      <form onSubmit={submit}>
        <div className="brand">SARAL AI</div>
        <p className="portal">Admin Console</p>
        <p className="login-copy">Manage enterprises, staff access, and platform performance.</p>

        <label>
          Email
          <input required type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} />
        </label>

        <label>
          Password
          <input required type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} />
        </label>

        <button type="submit">Sign in</button>

        {error && <span className="error">{error}</span>}
        <a className="forgot" href="mailto:support@saralai.com">Need help signing in?</a>
      </form>
    </main>
  );
}
