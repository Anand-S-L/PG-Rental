const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 5000;
const PUBLIC_DIR = path.join(__dirname, 'public');

const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
};

const server = http.createServer((req, res) => {
  console.log(`Request: ${req.method} ${req.url}`);
  
  // Parse URL to get pathname
  let pathname = req.url;
  
  // Remove query string if present
  const queryIndex = pathname.indexOf('?');
  if (queryIndex >= 0) {
    pathname = pathname.substring(0, queryIndex);
  }
  
  // Handle root path
  if (pathname === '/') {
    pathname = '/index.html';
  }
  
  // Create file path
  const filePath = path.join(PUBLIC_DIR, pathname);
  const ext = path.extname(filePath).toLowerCase();
  
  // Check if file exists
  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      console.log(`File not found: ${filePath}`);
      
      // For SPA routing: if no file extension and not index.html, serve index.html
      if (!ext && pathname !== '/index.html') {
        serveFile(path.join(PUBLIC_DIR, 'index.html'), res);
      } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('404 Not Found');
      }
      return;
    }
    
    // File exists, serve it
    serveFile(filePath, res);
  });
});

function serveFile(filePath, res) {
  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'text/plain';
  
  fs.readFile(filePath, (err, content) => {
    if (err) {
      console.error(`Error reading file: ${filePath}`, err);
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('500 Internal Server Error');
      return;
    }
    
    // Add headers for CORS and remove CSP for now
    const headers = {
      'Content-Type': contentType,
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept'
    };
    
    res.writeHead(200, headers);
    res.end(content);
    console.log(`Served: ${filePath}`);
  });
}

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running at http://0.0.0.0:${PORT}/`);
  
  // Log available files
  const files = fs.readdirSync(PUBLIC_DIR);
  console.log(`Available files in ${PUBLIC_DIR}:`);
  files.forEach(file => {
    console.log(` - ${file}`);
  });
});