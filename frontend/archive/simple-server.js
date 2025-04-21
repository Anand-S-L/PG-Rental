const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = process.env.PORT || 5000;
const PUBLIC_DIR = path.join(__dirname, 'public');
const API_PREFIX = '/api';

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
  
  // Parse URL
  const parsedUrl = url.parse(req.url);
  const pathname = parsedUrl.pathname;
  
  // Check if this is an API request
  if (pathname.startsWith(API_PREFIX)) {
    handleApiRequest(req, res);
    return;
  }
  
  // Check if the file exists in public directory
  const filePath = path.join(PUBLIC_DIR, pathname);
  
  // If requesting root, serve index.html directly
  if (pathname === '/') {
    serveFile(path.join(PUBLIC_DIR, 'index.html'), res);
    return;
  }
  
  // First check if the requested file exists
  fs.stat(filePath, (err, stats) => {
    if (!err && stats.isFile()) {
      // File exists, serve it
      serveFile(filePath, res);
    } else if (!err && stats.isDirectory()) {
      // Directory exists, try to serve index.html from it
      const indexPath = path.join(filePath, 'index.html');
      fs.stat(indexPath, (err, stats) => {
        if (!err && stats.isFile()) {
          serveFile(indexPath, res);
        } else {
          // Fallback to main index.html for SPA routing
          serveFile(path.join(PUBLIC_DIR, 'index.html'), res);
        }
      });
    } else {
      // File not found, check if it's a dot file (.js, .css, etc)
      const ext = path.extname(pathname);
      if (ext) {
        // It has an extension but doesn't exist, return 404
        console.error(`File not found: ${filePath}`);
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('404 Not Found');
      } else {
        // No extension, assume it's an SPA route and serve index.html
        console.log(`Serving index.html for SPA route: ${pathname}`);
        serveFile(path.join(PUBLIC_DIR, 'index.html'), res);
      }
    }
  });
});

// Function to serve a file
function serveFile(filePath, res) {
  console.log(`Serving file: ${filePath}`);
  
  // Get file extension and content type
  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';
  
  // Set CORS headers and disable CSP
  const headers = {
    'Content-Type': contentType,
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, PUT, DELETE',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Content-Security-Policy': "default-src * 'unsafe-inline' 'unsafe-eval'; img-src * data:; font-src * data:;",
    'X-Content-Type-Options': 'nosniff'
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

// Handle API requests (proxy to backend)
function handleApiRequest(req, res) {
  console.log(`Handling API request: ${req.url}`);
  
  // For now, just return a simple JSON response
  res.writeHead(200, { 
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Content-Security-Policy': "default-src * 'unsafe-inline' 'unsafe-eval'; img-src * data:; font-src * data:;",
    'X-Content-Type-Options': 'nosniff'
  });
  
  res.end(JSON.stringify({ 
    message: 'API proxy temporarily disabled',
    endpoint: req.url 
  }));
  
  // In a real app, we would proxy this to the backend server
  // const backendUrl = `http://localhost:8000${req.url}`;
  // TODO: Implement proper proxy functionality
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