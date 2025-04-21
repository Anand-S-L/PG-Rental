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

// Create the HTTP server
const server = http.createServer((req, res) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  
  let filePath;
  
  // Special handling for /test routes
  if (req.url === '/test' || req.url === '/test.html') {
    filePath = path.join(PUBLIC_DIR, 'test.html');
  } else if (req.url === '/') {
    // Root path serves index.html
    filePath = path.join(PUBLIC_DIR, 'index.html');
  } else if (req.url.startsWith('/api/')) {
    // Simple API handling
    res.writeHead(200, {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    });
    res.end(JSON.stringify({ message: 'API endpoint', path: req.url }));
    return;
  } else {
    // Try to serve the requested file
    filePath = path.join(PUBLIC_DIR, req.url);
  }
  
  // Check if file exists
  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      // File not found, serve index.html for SPA routing
      filePath = path.join(PUBLIC_DIR, 'index.html');
    }
    
    // Serve the file
    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    
    fs.readFile(filePath, (err, content) => {
      if (err) {
        res.writeHead(500);
        res.end('Error loading file');
        return;
      }
      
      // Set headers and send response
      res.writeHead(200, {
        'Content-Type': contentType,
        'Access-Control-Allow-Origin': '*',
        'Content-Security-Policy': "default-src 'self'; img-src 'self' https: data:; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline';"
      });
      res.end(content);
    });
  });
});

// Start the server
server.listen(PORT, '0.0.0.0', () => {
  console.log(`HTTP server running on port ${PORT}`);
  
  // List files in public directory for debugging
  console.log(`Public directory: ${PUBLIC_DIR}`);
  try {
    const indexExists = fs.existsSync(path.join(PUBLIC_DIR, 'index.html'));
    console.log(`Index file exists: ${indexExists}`);
    
    const testExists = fs.existsSync(path.join(PUBLIC_DIR, 'test.html'));
    console.log(`Test file exists: ${testExists}`);
    
    const files = fs.readdirSync(PUBLIC_DIR);
    console.log(`Files in public directory: ${JSON.stringify(files)}`);
  } catch (err) {
    console.error('Error checking directory:', err);
  }
});