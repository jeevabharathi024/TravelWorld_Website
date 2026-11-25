import React, { useState } from 'react';
import { createBooking, fetchBookings } from '../api';

const DESTINATIONS = [
  'Paris, France 🗼', 'Tokyo, Japan 🗾', 'Bali, Indonesia 🌴',
  'New York, USA 🗽', 'Rome, Italy 🏛️', 'Safari, Kenya 🦁',
  'Sydney, Australia 🦘', 'Santorini, Greece 🌊',
];

function BookingPage() {
  const [tab, setTab] = useState('book');
  const [form, setForm] = useState({ name: '', email: '', destination: '', date: '', travelers: 1 });
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [bookings, setBookings] = useState([]);
  const [fetchEmail, setFetchEmail] = useState('');

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleBook = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);
    try {
      const res = await createBooking(form);
      setStatus({ type: 'success', msg: res.data.message });
      setForm({ name: '', email: '', destination: '', date: '', travelers: 1 });
    } catch (err) {
      setStatus({ type: 'error', msg: err.response?.data?.error || 'Failed to create booking.' });
    } finally {
      setLoading(false);
    }
  };

  const handleFetch = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetchBookings(fetchEmail);
      setBookings(res.data);
    } catch {
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-grid fade-in">
      <div className="tabs">
        <button className={`tab ${tab === 'book' ? 'active' : ''}`} onClick={() => setTab('book')}>✈️ Book a Trip</button>
        <button className={`tab ${tab === 'view' ? 'active' : ''}`} onClick={() => setTab('view')}>📋 My Bookings</button>
      </div>

      {tab === 'book' && (
        <div className="card">
          <h2>✈️ Book Your Dream Trip</h2>
          {status && (
            <div className={`alert alert-${status.type}`}>
              {status.type === 'success' ? '✅' : '❌'} {status.msg}
            </div>
          )}
          <form onSubmit={handleBook}>
            <div className="form-row">
              <div className="form-group">
                <label>Full Name</label>
                <input name="name" type="text" placeholder="John Doe" value={form.name} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input name="email" type="email" placeholder="you@example.com" value={form.email} onChange={handleChange} required />
              </div>
            </div>
            <div className="form-group">
              <label>Destination</label>
              <select name="destination" value={form.destination} onChange={handleChange} required>
                <option value="">Select a destination...</option>
                {DESTINATIONS.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Travel Date</label>
                <input name="date" type="date" value={form.date} onChange={handleChange} required min={new Date().toISOString().split('T')[0]} />
              </div>
              <div className="form-group">
                <label>Number of Travelers</label>
                <input name="travelers" type="number" min="1" max="20" value={form.travelers} onChange={handleChange} required />
              </div>
            </div>
            <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
              {loading ? '⏳ Booking...' : '🌍 Confirm Booking'}
            </button>
          </form>
        </div>
      )}

      {tab === 'view' && (
        <div className="card">
          <h2>📋 My Bookings</h2>
          <form onSubmit={handleFetch} style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <input
              type="email"
              placeholder="Enter your email to search bookings..."
              value={fetchEmail}
              onChange={(e) => setFetchEmail(e.target.value)}
              style={{ flex: 1, padding: '0.75rem 1rem', background: 'var(--surface)', border: '1px solid var(--surface2)', borderRadius: 8, color: 'var(--text)', fontFamily: 'inherit', fontSize: '0.95rem', outline: 'none' }}
            />
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? '...' : '🔍 Search'}
            </button>
          </form>

          {bookings.length > 0 ? (
            <div className="booking-list">
              {bookings.map((b) => (
                <div key={b._id} className="booking-item">
                  <div className="booking-icon">✈️</div>
                  <div className="booking-info">
                    <h3>{b.destination}</h3>
                    <p>👤 {b.name} &nbsp;|&nbsp; 📅 {b.date} &nbsp;|&nbsp; 👥 {b.travelers} traveler{b.travelers > 1 ? 's' : ''}</p>
                    <p style={{ marginTop: '0.25rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      Booked on {new Date(b.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="booking-badge">Confirmed</div>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>
              No bookings found. Search by email above.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export default BookingPage;
