import React, { useState } from 'react';
import AuthPage from './pages/AuthPage';
import BookingPage from './pages/BookingPage';
import ContactPage from './pages/ContactPage';

const PAGES = {
  home: 'home',
  auth: 'auth',
  bookings: 'bookings',
  contact: 'contact',
};

function HomePage({ navigate }) {
  return (
    <div className="fade-in">
      <div className="hero">
        <h1>Explore the World with TravelWorld 🌍</h1>
        <p>
          Discover breathtaking destinations, book unforgettable trips, and create memories that last a lifetime.
        </p>
        <div className="hero-buttons">
          <button className="btn btn-primary" onClick={() => navigate(PAGES.bookings)}>
            ✈️ Book a Trip
          </button>
          <button className="btn btn-outline" onClick={() => navigate(PAGES.auth)}>
            🔐 Sign In
          </button>
        </div>
      </div>

      {/* Feature Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
        {[
          { icon: '🗺️', title: 'Global Destinations', desc: 'Access 500+ curated travel destinations across all 7 continents.' },
          { icon: '🏨', title: 'Premium Stays', desc: 'Book luxury hotels, boutique stays, and unique experiences.' },
          { icon: '🛡️', title: 'Safe & Secure', desc: 'Your data is protected with industry-leading encryption.' },
          { icon: '💬', title: '24/7 Support', desc: 'Our travel experts are ready to help you anytime.' },
        ].map((f) => (
          <div key={f.title} className="card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>{f.icon}</div>
            <h3 style={{ marginBottom: '0.5rem', fontWeight: 700 }}>{f.title}</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{f.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function App() {
  const [page, setPage] = useState(PAGES.home);

  const navItems = [
    { id: PAGES.home, label: '🏠 Home' },
    { id: PAGES.bookings, label: '✈️ Bookings' },
    { id: PAGES.contact, label: '💬 Contact' },
  ];

  return (
    <div className="app">
      <nav>
        <div className="nav-logo">🌍 TravelWorld</div>
        <div className="nav-links">
          {navItems.map((item) => (
            <button
              key={item.id}
              className={`nav-btn ${page === item.id ? 'active' : ''}`}
              onClick={() => setPage(item.id)}
            >
              {item.label}
            </button>
          ))}
          <button
            className={`nav-btn primary`}
            onClick={() => setPage(PAGES.auth)}
          >
            🔐 Sign In
          </button>
        </div>
      </nav>

      <main>
        {page === PAGES.home && <HomePage navigate={setPage} />}
        {page === PAGES.auth && <AuthPage />}
        {page === PAGES.bookings && <BookingPage />}
        {page === PAGES.contact && <ContactPage />}
      </main>

      <footer style={{ textAlign: 'center', padding: '2rem', borderTop: '1px solid var(--border)', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
        <p>🌍 TravelWorld &copy; {new Date().getFullYear()} &mdash; Built with MongoDB, Express, React & Node.js (MERN)</p>
      </footer>
    </div>
  );
}

export default App;
