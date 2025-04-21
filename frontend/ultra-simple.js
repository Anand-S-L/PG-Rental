const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 5000;

// Directory containing our static files
const staticDir = path.join(__dirname, 'dist/pg-rental-frontend');
const indexPath = path.join(staticDir, 'index.html');

// Verify the directory exists
console.log(`Static directory: ${staticDir}`);
console.log(`Index path: ${indexPath}`);
console.log(`Directory exists: ${fs.existsSync(staticDir)}`);
console.log(`Index file exists: ${fs.existsSync(indexPath)}`);

// Log static file contents
try {
  const files = fs.readdirSync(staticDir);
  console.log('Files in static directory:', files);
  
  // Check index.html content
  if (fs.existsSync(indexPath)) {
    const content = fs.readFileSync(indexPath, 'utf8').substring(0, 200);
    console.log('First 200 chars of index.html:', content);
  }
} catch (error) {
  console.error('Error reading directory or files:', error);
}

// Set security-related headers
app.use((req, res, next) => {
  // Allow inline styles to avoid Content Security Policy violations
  res.header('Content-Security-Policy', "default-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' https://images.unsplash.com data:;");
  res.header('X-Content-Type-Options', 'nosniff');
  next();
});

// Setup CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

// Log all requests
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Serve static files
app.use(express.static(staticDir));

// Any route - serve index.html (for Angular's client-side routing)
app.get('*', (req, res) => {
  console.log(`Serving index.html for: ${req.url}`);
  
  if (fs.existsSync(indexPath)) {
    console.log(`File exists, sending: ${indexPath}`);
    res.sendFile(indexPath);
  } else {
    console.log(`Error: File does not exist: ${indexPath}`);
    res.status(404).send(`File not found: ${indexPath}`);
  }
});

// Start the server
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`Frontend server running on port ${PORT}`);
  console.log(`Visit http://0.0.0.0:${PORT} in your browser`);
});

// Handle server errors
server.on('error', (error) => {
  console.error('Server error:', error);
});