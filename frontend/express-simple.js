const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 5000;
const PUBLIC_DIR = path.join(__dirname, 'public');

// Enable CORS for all routes
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

// Set content security policy
app.use((req, res, next) => {
  res.header('Content-Security-Policy', "default-src * 'unsafe-inline' 'unsafe-eval'; img-src * data:;");
  next();
});

// Log all requests
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Serve static files from the public directory
app.use(express.static(PUBLIC_DIR));

// Handle test route separately
app.get('/test', (req, res) => {
  res.sendFile(path.join(PUBLIC_DIR, 'test.html'));
});

// Root route - serve index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(PUBLIC_DIR, 'index.html'));
});

// For any other routes, serve index.html (SPA support)
app.use((req, res) => {
  res.sendFile(path.join(PUBLIC_DIR, 'index.html'));
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Express server running at http://0.0.0.0:${PORT}/`);
  
  // Log files in public directory
  try {
    const files = fs.readdirSync(PUBLIC_DIR);
    console.log(`Files in ${PUBLIC_DIR}:`, files);
    
    // Check specific files
    const indexPath = path.join(PUBLIC_DIR, 'index.html');
    const testPath = path.join(PUBLIC_DIR, 'test.html');
    
    console.log(`index.html exists: ${fs.existsSync(indexPath)}`);
    console.log(`test.html exists: ${fs.existsSync(testPath)}`);
  } catch (err) {
    console.error('Error reading directory:', err);
  }
});