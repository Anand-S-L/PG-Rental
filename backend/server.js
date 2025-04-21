const express = require('express');
const cors = require('cors');
const pgRoutes = require('./routes/pg.routes');
const userRoutes = require('./routes/user.routes');
const authRoutes = require('./routes/auth.routes');
const bookingRoutes = require('./routes/booking.routes');
const paymentRoutes = require('./routes/payment.routes');
const upiRoutes = require('./routes/upi.routes');
const authMiddleware = require('./middleware/auth.middleware');

// Create admin user if not exists
const User = require('./models/user.model');
if (!User.findByUsername('admin')) {
  User.create({
    username: 'admin',
    email: 'admin@example.com',
    password: 'admin123',
    fullName: 'Administrator',
    role: 'admin'
  });
  console.log('Admin user created');
}

const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Simple logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Routes
app.use('/api/pgs', pgRoutes);
app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/upi', upiRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy' });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Backend server running on port ${PORT}`);
});
