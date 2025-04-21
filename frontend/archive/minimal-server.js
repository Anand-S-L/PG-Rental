const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 5000;

// Define public directory path
const publicDir = path.join(__dirname, 'public');
const indexPath = path.join(publicDir, 'index.html');

// Log directory and file information
console.log(`Public directory: ${publicDir}`);
console.log(`Index path: ${indexPath}`);
console.log(`Public directory exists: ${fs.existsSync(publicDir)}`);
console.log(`Index file exists: ${fs.existsSync(indexPath)}`);

// List files in public directory
try {
  if (fs.existsSync(publicDir)) {
    const files = fs.readdirSync(publicDir);
    console.log('Files in public directory:', files);
  }
} catch (error) {
  console.error('Error reading directory:', error);
}

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

// Serve static files from the public directory
app.use(express.static(publicDir));

// Root route - serve index.html
app.get('/', (req, res) => {
  console.log(`Serving index.html from: ${indexPath}`);
  
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).send('Index file not found');
  }
});

// Create a simple API endpoint for testing
app.get('/api/test', (req, res) => {
  res.json({ message: 'Server is working!', timestamp: new Date() });
});

// Handle 404s by serving index.html (for client-side routing)
app.use((req, res) => {
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).send('Page not found');
  }
});

// Start the server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Frontend server running on port ${PORT}`);
  console.log(`Visit http://localhost:${PORT} in your browser`);
});