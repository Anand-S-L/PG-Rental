const express = require('express');
const path = require('path');
const cors = require('cors');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS
app.use(cors());

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// Log all requests
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Simple API proxy for /api routes
app.use('/api', (req, res) => {
  res.status(200).json({ message: 'API proxy temporarily disabled' });
});

// For any other route, serve the index.html file (SPA fallback)
app.get('*', (req, res) => {
  const indexPath = path.join(__dirname, 'public', 'index.html');
  
  // Check if the file exists before sending it
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).send('index.html not found');
  }
});

// Start the server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Frontend server running on http://0.0.0.0:${PORT}/`);
  
  // Debug info
  const publicDir = path.join(__dirname, 'public');
  console.log(`Public directory: ${publicDir}`);
  
  try {
    const indexExists = fs.existsSync(path.join(publicDir, 'index.html'));
    console.log(`Index file exists: ${indexExists}`);
    
    const files = fs.readdirSync(publicDir);
    console.log(`Files in public directory: ${JSON.stringify(files)}`);
  } catch (error) {
    console.error(`Error checking public directory: ${error}`);
  }
});