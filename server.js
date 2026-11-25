const express = require('express');
const path = require('path');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const connectDB = require('./db');

// Import Mongoose Models
const User = require('./models/User');
const Subscription = require('./models/Subscription');
const Contact = require('./models/Contact');
const Booking = require('./models/Booking');

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to MongoDB
connectDB();

// ─── Middleware ────────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static frontend (React build or plain HTML)
app.use(express.static(path.join(__dirname, 'client', 'build')));
app.use(express.static(path.join(__dirname)));

// ─── Auth Routes ───────────────────────────────────────────────────────────────

// POST /api/auth/register
app.post('/api/auth/register', async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email, and password are required.' });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({ name, email, password: hashedPassword });

    res.status(201).json({
      message: 'User registered successfully!',
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// POST /api/auth/login
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'Invalid email or password.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid email or password.' });
    }

    res.status(200).json({
      message: 'Login successful!',
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// ─── Newsletter Subscription ────────────────────────────────────────────────────

// POST /api/subscribe
app.post('/api/subscribe', async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email is required.' });
  }

  try {
    const existing = await Subscription.findOne({ email });
    if (existing) {
      return res.status(200).json({ message: 'You are already subscribed to our newsletter!' });
    }

    await Subscription.create({ email });
    res.status(201).json({ message: 'Thank you for subscribing to our newsletter!' });
  } catch (error) {
    console.error('Subscription error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// ─── Contact Form ───────────────────────────────────────────────────────────────

// POST /api/contact
app.post('/api/contact', async (req, res) => {
  const { name, email, message } = req.body;
  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Name, email, and message are required.' });
  }

  try {
    await Contact.create({ name, email, message });
    res.status(201).json({ message: 'Message sent successfully! We will get back to you soon.' });
  } catch (error) {
    console.error('Contact error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// ─── Bookings ──────────────────────────────────────────────────────────────────

// POST /api/bookings
app.post('/api/bookings', async (req, res) => {
  const { name, email, destination, date, travelers } = req.body;
  if (!name || !email || !destination || !date || !travelers) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  try {
    const booking = await Booking.create({
      name,
      email,
      destination,
      date,
      travelers: parseInt(travelers, 10),
    });

    res.status(201).json({
      message: 'Booking created successfully!',
      booking,
    });
  } catch (error) {
    console.error('Booking creation error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// GET /api/bookings
app.get('/api/bookings', async (req, res) => {
  const { email } = req.query;

  try {
    const filter = email ? { email } : {};
    const bookings = await Booking.find(filter).sort({ createdAt: -1 });
    res.status(200).json(bookings);
  } catch (error) {
    console.error('Fetch bookings error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// ─── Serve React Frontend ──────────────────────────────────────────────────────
app.get('*', (req, res) => {
  const reactBuild = path.join(__dirname, 'client', 'build', 'index.html');
  const fallback = path.join(__dirname, 'index.html');

  // Try to serve React build first, fall back to plain index.html
  res.sendFile(reactBuild, (err) => {
    if (err) res.sendFile(fallback);
  });
});

// ─── Start Server ──────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🚀 Server is running at http://localhost:${PORT}`);
});
