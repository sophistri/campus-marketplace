import { useEffect, useRef, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { verifyEmail, resendVerification } from '../api/auth';

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();  // used to read and modify the query string ?... in a URL
  const [status, setStatus] = useState('verifying'); // verifying | success | error
  const [email, setEmail] = useState('');
  const [resendStatus, setResendStatus] = useState(''); // '', 'sending', 'sent'
  const hasRun = useRef(false);

  useEffect(() => {
    // React 18 StrictMode double-invokes effects in dev; since the
    // verification token is single-use, a second call would always fail.
    // This ref makes sure we only ever send the request once.
    if (hasRun.current) return;
    hasRun.current = true;

    const token = searchParams.get('token');
    if (!token) {
      setStatus('error');
      return;
    }
    verifyEmail(token)
      .then(() => setStatus('success'))
      .catch(() => setStatus('error'));
  }, [searchParams]);

  const handleResend = async (e) => {
    e.preventDefault();
    if (!email) return;
    setResendStatus('sending');
    try {
      await resendVerification(email);
      setResendStatus('sent');
    } catch {
      setResendStatus('sent'); // same message either way — don't leak account existence
    }
  };

  return (
    <div className="auth-page auth-center">
      {status === 'verifying' && <p className="auth-subtext">Verifying your email...</p>}

      {status === 'success' && (
        <>
          <h2>Email verified</h2>
          <Link to="/login">Log in now</Link>
        </>
      )}

      {status === 'error' && (
        <>
          {resendStatus === 'sent' ? (
            <>
              <h2>New link sent</h2>
              <p className="auth-subtext">Check your inbox for a new verification link.</p>
            </>
          ) : (
            <>
              <h2>Link invalid or expired</h2>
              <p className="auth-error">This verification link is invalid or expired.</p>
            </>
          )}

          {resendStatus !== 'sent' && (
            <form onSubmit={handleResend} className="auth-form">
              <input
                type="email"
                placeholder="Enter your email to get a new link"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="auth-input"
              />
              <button
                type="submit"
                disabled={resendStatus === 'sending'}
                className="auth-button"
              >
                {resendStatus === 'sending' ? 'Sending...' : 'Resend verification email'}
              </button>
            </form>
          )}
        </>
      )}
    </div>
  );
}