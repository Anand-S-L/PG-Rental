const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for all routes
app.use(cors());

// Serve static files from the dist directory
app.use(express.static(path.join(__dirname, 'dist/pg-rental-frontend')));

// Simple logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
  next();
});

// All other routes should return the index.html file
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist/pg-rental-frontend/index.html'));
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Frontend server running on port ${PORT}`);
  console.log(`Visit http://localhost:${PORT} in your browser`);
});
