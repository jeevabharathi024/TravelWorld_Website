import axios from 'axios';

const API = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

// ── Auth ──────────────────────────────────────────────────────────────────────
export const registerUser = (data) => API.post('/auth/register', data);
export const loginUser = (data) => API.post('/auth/login', data);

// ── Newsletter ─────────────────────────────────────────────────────────────────
export const subscribeNewsletter = (email) => API.post('/subscribe', { email });

// ── Contact ───────────────────────────────────────────────────────────────────
export const sendContact = (data) => API.post('/contact', data);

// ── Bookings ──────────────────────────────────────────────────────────────────
export const createBooking = (data) => API.post('/bookings', data);
export const fetchBookings = (email = '') =>
  API.get('/bookings', { params: email ? { email } : {} });

export default API;
