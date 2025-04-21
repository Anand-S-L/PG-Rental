const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Serve static files
app.use(express.static(path.join(__dirname, 'dist/pg-rental-frontend')));

// Add logging middleware to see what routes are being requested
app.use((req, res, next) => {
  console.log(`Request received: ${req.method} ${req.url}`);
  next();
});

// Enable CORS for all routes
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

// Simple route for the root path
app.get('/', (req, res) => {
  console.log('Serving index.html file for root path...');
  res.sendFile(path.join(__dirname, 'dist/pg-rental-frontend/index.html'));
});

// Catch-all route to handle client-side routing (important for single-page applications)
app.get('*', (req, res) => {
  console.log(`Serving index.html for path: ${req.url}`);
  res.sendFile(path.join(__dirname, 'dist/pg-rental-frontend/index.html'));
});

// Slight delay before starting the server to ensure Replit detects it properly
console.log('Starting frontend server...');
setTimeout(() => {
  // Start server
  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`Frontend server running on port ${PORT}`);
    console.log(`Visit http://localhost:${PORT} in your browser`);
  });

  // Handle server errors
  server.on('error', (error) => {
    console.error('Server error:', error);
    if (error.code === 'EADDRINUSE') {
      console.error(`Port ${PORT} is already in use. Try a different port.`);
    }
  });
}, 1000);