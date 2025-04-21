const http = require('http');
const fs = require('fs');
const path = require('path');

// Define port and public directory path
const PORT = process.env.PORT || 5000;
const PUBLIC_DIR = path.join(__dirname, 'public');

// MIME types for different file extensions
const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif'
};

// Create HTTP server
const server = http.createServer((req, res) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  
  // Set default file path to index.html for root path
  let filePath = req.url === '/' ? path.join(PUBLIC_DIR, 'index.html') : path.join(PUBLIC_DIR, req.url);
  
  // Get file extension
  let extname = path.extname(filePath);
  
  // Default content type is text/html
  let contentType = MIME_TYPES[extname] || 'text/html';
  
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // If no file extension, assume it's a route and serve index.html
  if (!extname) {
    filePath = path.join(PUBLIC_DIR, 'index.html');
  }
  
  // Check if file exists
  fs.readFile(filePath, (err, content) => {
    if (err) {
      // If file does not exist, serve index.html for client-side routing
      if (err.code === 'ENOENT') {
        fs.readFile(path.join(PUBLIC_DIR, 'index.html'), (err, content) => {
          if (err) {
            // If index.html doesn't exist either, return 404
            res.writeHead(404);
            res.end('File not found');
          } else {
            // Send index.html for client-side routing
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(content, 'utf-8');
          }
        });
      } else {
        // Server error
        res.writeHead(500);
        res.end(`Server Error: ${err.code}`);
      }
    } else {
      // Success - return the file
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content, 'utf-8');
    }
  });
});

// Start the server
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Frontend server running at http://0.0.0.0:${PORT}/`);
  
  // Print debug information
  console.log(`Public directory: ${PUBLIC_DIR}`);
  console.log(`Index file exists: ${fs.existsSync(path.join(PUBLIC_DIR, 'index.html'))}`);
  
  try {
    const files = fs.readdirSync(PUBLIC_DIR);
    console.log('Files in public directory:', files);
  } catch (err) {
    console.error('Error reading public directory:', err);
  }
});