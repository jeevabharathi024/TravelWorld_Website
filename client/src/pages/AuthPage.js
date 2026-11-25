import React, { useState } from 'react';
import { registerUser, loginUser } from '../api';

function AuthPage() {
  const [tab, setTab] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);
    try {
      const res = tab === 'login'
        ? await loginUser({ email: form.email, password: form.password })
        : await registerUser(form);
      setStatus({ type: 'success', msg: res.data.message });
      setForm({ name: '', email: '', password: '' });
    } catch (err) {
      setStatus({ type: 'error', msg: err.response?.data?.error || 'Something went wrong.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-grid fade-in">
      <div className="card" style={{ maxWidth: 440, margin: '0 auto', width: '100%' }}>
        <div className="tabs">
          <button className={`tab ${tab === 'login' ? 'active' : ''}`} onClick={() => { setTab('login'); setStatus(null); }}>
            🔐 Login
          </button>
          <button className={`tab ${tab === 'register' ? 'active' : ''}`} onClick={() => { setTab('register'); setStatus(null); }}>
            📝 Register
          </button>
        </div>

        <h2>{tab === 'login' ? '🔐 Welcome Back' : '📝 Create Account'}</h2>

        {status && (
          <div className={`alert alert-${status.type}`}>
            {status.type === 'success' ? '✅' : '❌'} {status.msg}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {tab === 'register' && (
            <div className="form-group">
              <label>Full Name</label>
              <input name="name" type="text" placeholder="John Doe" value={form.name} onChange={handleChange} required />
            </div>
          )}
          <div className="form-group">
            <label>Email Address</label>
            <input name="email" type="email" placeholder="you@example.com" value={form.email} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input name="password" type="password" placeholder="••••••••" value={form.password} onChange={handleChange} required />
          </div>
          <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
            {loading ? '⏳ Please wait...' : tab === 'login' ? '🚀 Login' : '✨ Register'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default AuthPage;
