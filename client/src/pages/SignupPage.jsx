import { useState } from 'react';
import { Link } from 'react-router-dom';
import { signup } from '../api/auth';

export default function SignupPage() {
  const [form, setForm] = useState({ email: '', password: '', name: '', campus: '' });
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await signup(form);
      setSubmitted(true);
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong. Try again.');
    }
  };

  if (submitted) {
    return (
      <div className="auth-page auth-center">
        <h2>Check your email</h2>
        <p className="auth-subtext">We sent a verification link to {form.email}.</p>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <h2>Create an account</h2>
      <form onSubmit={handleSubmit} className="auth-form">
        <input
          name="name"
          placeholder="Full name"
          value={form.name}
          onChange={handleChange}
          required
          className="auth-input"
        />
        <input
          name="email"
          type="email"
          placeholder="Campus email"
          value={form.email}
          onChange={handleChange}
          required
          className="auth-input"
        />
        <input
          name="campus"
          placeholder="Campus / school name"
          value={form.campus}
          onChange={handleChange}
          className="auth-input"
        />
        <input
          name="password"
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          required
          minLength={8}
          className="auth-input"
        />
        {error && <p className="auth-error">{error}</p>}
        <button type="submit" className="auth-button">
          Sign up
        </button>
      </form>
      <p className="auth-footer">
        Already have an account? <Link to="/login">Log in</Link>
      </p>
    </div>
  );
}
