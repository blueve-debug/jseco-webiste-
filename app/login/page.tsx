'use client';

import { useState, FormEvent, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { AlertCircle } from 'lucide-react';

function LoginForm() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Login failed');
        setLoading(false);
        return;
      }

      // Redirect to the originally requested admin route or default to /admin
      let redirectTarget = searchParams.get('redirect') || '/admin';
      if (redirectTarget === '/dashboard' || redirectTarget.startsWith('/dashboard')) {
        redirectTarget = redirectTarget.replace(/^\/dashboard/, '/admin') || '/admin';
      }
      window.location.href = redirectTarget;
    } catch {
      setError('Network error. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="login-card animate-in">
      <div className="login-logo">
        <div className="login-logo-icon" style={{ overflow: 'hidden', padding: 2, background: '#fff' }}>
          <img src="/logo.jpeg" alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
        </div>
        <div className="login-title">Good Eco Solutions Admin</div>
        <div className="login-subtitle">Sign in to manage your store</div>
      </div>

      {error && (
        <div className="login-error" style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertCircle size={16} style={{ flexShrink: 0 }} />
          <span>{error}</span>
        </div>
      )}

      <form className="login-form" onSubmit={handleSubmit}>
        <div className="form-group" style={{ marginBottom: '16px' }}>
          <label className="form-label" htmlFor="login-email">Email</label>
          <input
            id="login-email"
            type="email"
            className="form-input"
            placeholder="care@jseco.in"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoFocus
            autoComplete="email"
          />
        </div>

        <div className="form-group" style={{ marginBottom: '24px' }}>
          <label className="form-label" htmlFor="login-password">Password</label>
          <input
            id="login-password"
            type="password"
            className="form-input"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
        </div>

        <button
          type="submit"
          className="btn btn-primary btn-lg w-full"
          disabled={loading}
          id="login-submit"
        >
          {loading ? (
            <>
              <span className="loading-spinner" style={{ width: 18, height: 18, borderWidth: 2 }} />
              Signing in...
            </>
          ) : (
            'Sign In'
          )}
        </button>
      </form>

      <p style={{
        textAlign: 'center',
        marginTop: '24px',
        fontSize: '12px',
        color: 'var(--text-tertiary)',
      }}>
        Good Eco Solutions Admin Dashboard v1.0
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="login-page">
      <Suspense fallback={
        <div className="login-card animate-in" style={{ textAlign: 'center', padding: '40px' }}>
          <div className="login-logo-icon" style={{ margin: '0 auto 16px', overflow: 'hidden', padding: 2, background: '#fff' }}>
            <img src="/logo.jpeg" alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          </div>
          <div className="login-title">Good Eco Solutions Admin</div>
          <div className="loading-spinner" style={{ margin: '20px auto 0' }} />
        </div>
      }>
        <LoginForm />
      </Suspense>
    </div>
  );
}
