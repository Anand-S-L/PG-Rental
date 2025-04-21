const http = require('http');
const fs = require('fs');
const path = require('path');

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
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml'
};

// Create HTTP server
const server = http.createServer((req, res) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  
  // Normalize URL to prevent directory traversal
  let urlPath = req.url === '/' ? '/index.html' : req.url;
  
  // Resolve the file path
  const filePath = path.join(PUBLIC_DIR, urlPath);
  
  // Check if file exists
  fs.stat(filePath, (err, stats) => {
    if (err) {
      console.error(`File not found: ${filePath}`);
      // File not found - return 404
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404 Not Found');
      return;
    }
    
    // If it's a directory, try to serve index.html
    if (stats.isDirectory()) {
      console.log(`Request is for directory: ${filePath}`);
      const indexPath = path.join(filePath, 'index.html');
      
      fs.stat(indexPath, (err, stats) => {
        if (err) {
          console.error(`Index file not found: ${indexPath}`);
          res.writeHead(404, { 'Content-Type': 'text/plain' });
          res.end('404 Not Found');
          return;
        }
        
        serveFile(indexPath, res);
      });
    } else {
      // Serve the file
      serveFile(filePath, res);
    }
  });
});

// Function to serve a file
function serveFile(filePath, res) {
  console.log(`Serving file: ${filePath}`);
  
  // Get file extension and content type
  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';
  
  // Set CORS headers
  const headers = {
    'Content-Type': contentType,
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  };
  
  // Read and serve the file
  fs.readFile(filePath, (err, content) => {
    if (err) {
      console.error(`Error reading file: ${err}`);
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('500 Internal Server Error');
      return;
    }
    
    res.writeHead(200, headers);
    res.end(content);
  });
}

// Start the server
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Frontend server running on port ${PORT}`);
  console.log(`Visit http://localhost:${PORT} in your browser`);
  
  // List files in public directory for debugging
  try {
    const files = fs.readdirSync(PUBLIC_DIR);
    console.log(`Files in ${PUBLIC_DIR}:`, files);
    
    // Check if index.html exists
    const indexPath = path.join(PUBLIC_DIR, 'index.html');
    console.log(`Index file exists: ${fs.existsSync(indexPath)}`);
    
    if (fs.existsSync(indexPath)) {
      const stats = fs.statSync(indexPath);
      console.log(`Index file size: ${stats.size} bytes`);
    }
  } catch (err) {
    console.error('Error listing directory:', err);
  }
});