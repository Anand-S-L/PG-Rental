const express = require('express');
const path = require('path');
const fs = require('fs');

// Create the Express app
const app = express();
const PORT = 5000;

// Simple request logger
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Remove Content Security Policy for now to troubleshoot
app.use((req, res, next) => {
  res.removeHeader('Content-Security-Policy');
  next();
});

// Setup CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

// Parse JSON and URL-encoded bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
const staticDir = path.join(__dirname, 'public');
app.use(express.static(staticDir));

// Routes for specific pages
app.get('/', (req, res) => {
  console.log('Serving root path index.html');
  res.sendFile(path.join(staticDir, 'index.html'));
});

app.get('/index-test.html', (req, res) => {
  console.log('Serving index-test.html');
  res.sendFile(path.join(staticDir, 'index-test.html'));
});

app.get('/customer.html', (req, res) => {
  console.log('Serving customer.html');
  res.sendFile(path.join(staticDir, 'customer.html'));
});

app.get('/booking.html', (req, res) => {
  console.log('Serving booking.html');
  res.sendFile(path.join(staticDir, 'booking.html'));
});

// Fallback handler for SPA routes
app.get('*', (req, res) => {
  console.log(`Fallback handler for: ${req.url}`);
  
  // Check if it's a file with extension
  if (req.url.includes('.')) {
    const filePath = path.join(staticDir, req.url);
    if (fs.existsSync(filePath)) {
      return res.sendFile(filePath);
    }
    return res.status(404).send(`File not found: ${req.url}`);
  }
  
  // For SPA routes, serve index.html
  res.sendFile(path.join(staticDir, 'index.html'));
});

// Start the server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
  
  // Print directory contents for debugging
  try {
    console.log(`Contents of ${staticDir}:`, fs.readdirSync(staticDir));
  } catch (err) {
    console.error(`Error reading ${staticDir}:`, err);
  }
});