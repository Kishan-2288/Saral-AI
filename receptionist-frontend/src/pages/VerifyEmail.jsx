import { useEffect, useState } from 'react';
import { api } from '../services/api';

export default function VerifyEmail() {
  const [state, setState] = useState({ loading: true, message: '', error: '' });

  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get('token');

    if (!token) {
      setState({ loading: false, message: '', error: 'Verification token is missing.' });
      return;
    }

    api('/auth/verify-email', { method: 'POST', body: JSON.stringify({ token }) })
      .then((result) => setState({ loading: false, message: result.message, error: '' }))
      .catch((error) => setState({ loading: false, message: '', error: error.message }));
  }, []);

  return (
    <main className="login">
      <section className="verification">
        <b>SARAL AI</b>
        <h1>Verify your email</h1>
        {state.loading && <p>Verifying your account...</p>}
        {state.error && <small>{state.error}</small>}
        {state.message && (
          <>
            <p>{state.message}</p>
            <a href="/">Continue to receptionist login</a>
          </>
        )}
      </section>
    </main>
  );
}