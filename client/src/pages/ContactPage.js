import React, { useState } from 'react';
import { sendContact, subscribeNewsletter } from '../api';

function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [contactStatus, setContactStatus] = useState(null);
  const [subEmail, setSubEmail] = useState('');
  const [subStatus, setSubStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [subLoading, setSubLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleContact = async (e) => {
    e.preventDefault();
    setLoading(true);
    setContactStatus(null);
    try {
      const res = await sendContact(form);
      setContactStatus({ type: 'success', msg: res.data.message });
      setForm({ name: '', email: '', message: '' });
    } catch (err) {
      setContactStatus({ type: 'error', msg: err.response?.data?.error || 'Failed to send message.' });
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (e) => {
    e.preventDefault();
    setSubLoading(true);
    setSubStatus(null);
    try {
      const res = await subscribeNewsletter(subEmail);
      setSubStatus({ type: 'success', msg: res.data.message });
      setSubEmail('');
    } catch (err) {
      setSubStatus({ type: 'error', msg: err.response?.data?.error || 'Subscription failed.' });
    } finally {
      setSubLoading(false);
    }
  };

  return (
    <div className="page-grid fade-in">
      {/* Contact Form */}
      <div className="card">
        <h2>💬 Send Us a Message</h2>
        {contactStatus && (
          <div className={`alert alert-${contactStatus.type}`}>
            {contactStatus.type === 'success' ? '✅' : '❌'} {contactStatus.msg}
          </div>
        )}
        <form onSubmit={handleContact}>
          <div className="form-row">
            <div className="form-group">
              <label>Your Name</label>
              <input name="name" type="text" placeholder="John Doe" value={form.name} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Email Address</label>
              <input name="email" type="email" placeholder="you@example.com" value={form.email} onChange={handleChange} required />
            </div>
          </div>
          <div className="form-group">
            <label>Your Message</label>
            <textarea name="message" placeholder="Tell us how we can help you..." value={form.message} onChange={handleChange} required rows={5} />
          </div>
          <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
            {loading ? '⏳ Sending...' : '📨 Send Message'}
          </button>
        </form>
      </div>

      {/* Newsletter */}
      <div className="card" style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.1), rgba(245,158,11,0.1))', border: '1px solid rgba(99,102,241,0.3)' }}>
        <h2>📧 Newsletter</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
          Get the latest travel deals, tips, and destination guides straight to your inbox.
        </p>
        {subStatus && (
          <div className={`alert alert-${subStatus.type}`}>
            {subStatus.type === 'success' ? '✅' : '❌'} {subStatus.msg}
          </div>
        )}
        <form onSubmit={handleSubscribe} style={{ display: 'flex', gap: '0.75rem' }}>
          <input
            type="email"
            placeholder="Your email address..."
            value={subEmail}
            onChange={(e) => setSubEmail(e.target.value)}
            required
            style={{ flex: 1, padding: '0.75rem 1rem', background: 'var(--surface)', border: '1px solid var(--surface2)', borderRadius: 8, color: 'var(--text)', fontFamily: 'inherit', fontSize: '0.95rem', outline: 'none' }}
          />
          <button type="submit" className="btn btn-primary" disabled={subLoading}>
            {subLoading ? '...' : '✉️ Subscribe'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default ContactPage;
