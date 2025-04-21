const express = require('express');
const cors = require('cors');
const pgRoutes = require('./routes/pg.routes');
const authMiddleware = require('./middleware/auth.middleware');

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

// Basic authentication endpoint
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  
  // For demo purposes, using hardcoded credentials
  // In a real app, you would validate against a database
  if (username === 'admin' && password === 'admin123') {
    // Generate a simple token (in a real app, use JWT)
    const token = Buffer.from(`${username}:${Date.now()}`).toString('base64');
    
    return res.json({
      success: true,
      token,
      user: { username }
    });
  }
  
  return res.status(401).json({
    success: false,
    message: 'Invalid credentials'
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy' });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Backend server running on port ${PORT}`);
});
