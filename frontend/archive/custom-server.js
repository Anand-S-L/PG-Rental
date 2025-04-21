const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = 5000;
const BACKEND_URL = 'http://localhost:8000';
const PUBLIC_DIR = path.join(__dirname, 'public');

// Map file extensions to content types
const contentTypes = {
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
  // Parse URL
  const parsedUrl = url.parse(req.url, true);
  let pathname = parsedUrl.pathname;
  
  console.log(`[${new Date().toISOString()}] ${req.method} ${pathname}`);
  
  // Proxy API requests to backend
  if (pathname.startsWith('/api/')) {
    // Simple API proxy implementation for demonstration
    console.log(`Proxying API request to backend: ${BACKEND_URL}${pathname}`);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ 
      message: 'API request would be proxied to backend',
      endpoint: pathname,
      method: req.method,
      targetUrl: `${BACKEND_URL}${pathname}`
    }));
    return;
  }
  
  // Handle root path
  if (pathname === '/') {
    pathname = '/index.html';
  }
  
  // Construct file path
  const filePath = path.join(PUBLIC_DIR, pathname);
  const extname = path.extname(filePath).toLowerCase();
  
  // Determine content type based on file extension
  const contentType = contentTypes[extname] || 'text/plain';
  
  // Check if file exists
  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      // If file not found and the path doesn't have an extension, serve index.html for SPA routing
      if (!extname && pathname !== '/index.html') {
        console.log(`File not found, serving index.html for SPA routing: ${pathname}`);
        fs.readFile(path.join(PUBLIC_DIR, 'index.html'), (err, content) => {
          if (err) {
            res.writeHead(500);
            res.end('Server error loading index.html');
            return;
          }
          res.writeHead(200, { 'Content-Type': 'text/html' });
          res.end(content);
        });
        return;
      }
      
      // For specific HTML files, try to load them directly
      if (pathname.endsWith('.html')) {
        const htmlPath = path.join(PUBLIC_DIR, pathname);
        console.log(`Attempting to serve HTML file: ${htmlPath}`);
        fs.readFile(htmlPath, (err, content) => {
          if (err) {
            console.error(`Error reading HTML file: ${htmlPath}`, err);
            res.writeHead(404);
            res.end('404 Not Found');
            return;
          }
          res.writeHead(200, { 'Content-Type': 'text/html' });
          res.end(content);
        });
        return;
      }
      
      // Otherwise, return 404
      console.log(`File not found: ${filePath}`);
      res.writeHead(404);
      res.end('404 Not Found');
      return;
    }
    
    // File exists, serve it
    fs.readFile(filePath, (err, content) => {
      if (err) {
        console.error(`Error reading file: ${filePath}`, err);
        res.writeHead(500);
        res.end('Server Error');
        return;
      }
      
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content);
      console.log(`Served: ${filePath}`);
    });
  });
});

// Start server
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running at http://0.0.0.0:${PORT}/`);
  
  // Log files in public directory
  try {
    const files = fs.readdirSync(PUBLIC_DIR);
    console.log(`Contents of ${PUBLIC_DIR}:`, files);
  } catch (err) {
    console.error('Error reading directory:', err);
  }
});