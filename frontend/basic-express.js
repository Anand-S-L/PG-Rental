const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware to log all requests
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Set basic security headers
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  next();
});

// Serve static files from the 'public' folder
app.use(express.static(path.join(__dirname, 'public')));

// Very simple API endpoint
app.get('/api/hello', (req, res) => {
  res.json({ message: 'Hello from the API!' });
});

// Simple route for the test page
app.get('/test', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'test.html'));
});

// Catch-all route to serve index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start the server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Basic Express server running at http://0.0.0.0:${PORT}/`);
  
  // Debug info
  const publicDir = path.join(__dirname, 'public');
  try {
    const files = fs.readdirSync(publicDir);
    console.log(`Files in ${publicDir}:`, files);
  } catch (err) {
    console.error('Error listing directory:', err);
  }
});