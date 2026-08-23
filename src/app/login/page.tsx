'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { readJsonResponse } from '@/lib/http-json';

export default function LoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ password })
      });
      const data = await readJsonResponse(response);
      if (!response.ok) throw new Error(data.error || 'Unable to sign in.');
      router.replace('/');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to sign in.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="login-shell">
      <section className="login-card">
        <div className="eyebrow">SEETO REALTY · PRIVATE OPERATIONS</div>
        <h1>Owner Prospecting</h1>
        <p className="login-copy">Enter the dashboard password to view live prospecting metrics and lead status.</p>
        <form onSubmit={submit} className="login-form">
          <label htmlFor="password">Dashboard password</label>
          <input id="password" type="password" autoComplete="current-password" value={password} onChange={e => setPassword(e.target.value)} required autoFocus />
          {error ? <div className="auth-error" role="alert">{error}</div> : null}
          <button className="primary-button" type="submit" disabled={loading}>{loading ? 'Unlocking…' : 'Open dashboard'}</button>
        </form>
        <p className="privacy-note">Google credentials and full prospect details stay server-side.</p>
      </section>
    </main>
  );
}
