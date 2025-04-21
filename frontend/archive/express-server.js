const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 5000;

// Set static folder for serving static assets
app.use(express.static(path.join(__dirname, 'public')));

// Allow Cross-Origin
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

// Route handlers for specific HTML files
app.get('/customer.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'customer.html'));
});

app.get('/booking.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'booking.html'));
});

// Fallback route for all other requests
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Express server running on http://0.0.0.0:${PORT}`);
  console.log(`Contents of public directory:`, fs.readdirSync(path.join(__dirname, 'public')));
});