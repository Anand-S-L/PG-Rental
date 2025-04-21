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

// Set security headers for all responses
app.use((req, res, next) => {
  // Allow inline styles and scripts
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; img-src 'self' data: https:; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline' 'unsafe-eval';"
  );
  
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  next();
});

// Serve static files from the 'public' folder
app.use(express.static(path.join(__dirname, 'public')));

// API routes
app.use('/api', (req, res) => {
  res.json({
    message: 'API proxy temporarily disabled',
    endpoint: req.url
  });
});

// Catch-all route to serve index.html for client-side routing
app.get('*', (req, res) => {
  // Check if the requested file exists
  const filePath = path.join(__dirname, 'public', req.path);
  
  // If it's a file with extension and it exists, serve it
  if (req.path.includes('.') && fs.existsSync(filePath)) {
    return res.sendFile(filePath);
  }
  
  // For all other routes, serve the index.html file (SPA routing)
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start the server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Express server running at http://0.0.0.0:${PORT}/`);
  
  // Debug info - list files in public directory
  const publicDir = path.join(__dirname, 'public');
  console.log(`Public directory: ${publicDir}`);
  
  try {
    const indexExists = fs.existsSync(path.join(publicDir, 'index.html'));
    console.log(`Index file exists: ${indexExists}`);
    
    const testExists = fs.existsSync(path.join(publicDir, 'test.html'));
    console.log(`Test file exists: ${testExists}`);
    
    const files = fs.readdirSync(publicDir);
    console.log(`Files in public directory: ${JSON.stringify(files)}`);
  } catch (error) {
    console.error(`Error checking public directory: ${error}`);
  }
});