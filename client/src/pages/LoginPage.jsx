import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { resendVerification } from '../api/auth';

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [needsVerification, setNeedsVerification] = useState(false);
  const [resendStatus, setResendStatus] = useState(''); // '', 'sending', 'sent'
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setNeedsVerification(false);
    setResendStatus('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setNeedsVerification(false);
    try {
      await login(form);
      navigate('/');
    } catch (err) {
      const status = err.response?.status;
      const message = err.response?.data?.error || 'Invalid email or password';
      setError(message);
      if (status === 403) {
        setNeedsVerification(true);
      }
    }
  };

  const handleResend = async () => {
    setResendStatus('sending');
    try {
      await resendVerification(form.email);
      setResendStatus('sent');
    } catch {
      setResendStatus('sent'); // same message either way — don't leak account existence
    }
  };

  return (
    <div className="auth-page">
      <h2>Log in</h2>
      <form onSubmit={handleSubmit} className="auth-form">
        <input
          name="email"
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          required
          className="auth-input"
        />
        <input
          name="password"
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          required
          className="auth-input"
        />
        {error && <p className="auth-error">{error}</p>}
        {needsVerification && resendStatus !== 'sent' && (
          <button
            type="button"
            onClick={handleResend}
            disabled={resendStatus === 'sending'}
            className="auth-link-button"
          >
            {resendStatus === 'sending' ? 'Sending...' : 'Resend verification email'}
          </button>
        )}
        {resendStatus === 'sent' && (
          <p className="auth-subtext">Check your inbox for a new verification link.</p>
        )}
        <button type="submit" className="auth-button">
          Log in
        </button>
      </form>
      <p className="auth-footer">
        Don't have an account? <Link to="/signup">Sign up</Link>
      </p>
    </div>
  );
}