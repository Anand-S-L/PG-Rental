const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 5000;

// Log all requests
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Enable CORS for all routes
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

// Serve test.html from the current directory
app.get('/', (req, res) => {
  const testPath = path.join(__dirname, 'test.html');
  console.log(`Serving test.html from: ${testPath}`);
  console.log(`File exists: ${fs.existsSync(testPath)}`);
  
  if (fs.existsSync(testPath)) {
    res.sendFile(testPath);
  } else {
    res.status(404).send('Test page not found');
  }
});

// Create a simple API endpoint for testing
app.get('/api/test', (req, res) => {
  res.json({ message: 'Server is working!', timestamp: new Date() });
});

// Start the server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Frontend server running on port ${PORT}`);
  console.log(`Visit http://localhost:${PORT} in your browser`);
});