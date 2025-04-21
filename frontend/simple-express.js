const express = require('express');
const path = require('path');

const app = express();
const PORT = 5000;

// Middleware for parsing JSON and urlencoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Add CORS headers manually to avoid dependency issues
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// Fallback route: serve index.html for any unmatched routes
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start the server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Frontend server running at http://0.0.0.0:${PORT}/`);
  console.log(`Serving static files from: ${path.join(__dirname, 'public')}`);
});