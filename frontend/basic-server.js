const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 5000;

const staticDir = path.join(__dirname, 'dist/pg-rental-frontend');
const indexPath = path.join(staticDir, 'index.html');

// Check if the index.html file exists and log the result
console.log(`Checking if index.html exists at: ${indexPath}`);
console.log(`Index file exists: ${fs.existsSync(indexPath)}`);

// Print directory contents
fs.readdir(staticDir, (err, files) => {
  if (err) {
    console.error('Error reading directory:', err);
  } else {
    console.log('Directory contents:', files);
  }
});

// Basic logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Enable CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

// Serve static files
app.use(express.static(staticDir));

// All routes - just send the index.html file
app.use('*', (req, res) => {
  console.log(`Serving index.html for: ${req.originalUrl}`);
  
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).send('index.html file not found');
  }
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Frontend server running on port ${PORT}`);
  console.log(`Static files served from: ${staticDir}`);
});