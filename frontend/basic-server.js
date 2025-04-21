const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 5000;
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
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  
  let filePath;
  
  // Parse the URL (remove query parameters)
  let url = req.url;
  if (url.includes('?')) {
    url = url.split('?')[0];
  }
  
  // Determine file path based on URL
  if (url === '/') {
    filePath = path.join(PUBLIC_DIR, 'index.html');
  } else {
    filePath = path.join(PUBLIC_DIR, url);
  }
  
  // Get file extension
  const extname = path.extname(filePath).toLowerCase();
  
  // Default to text/html if no extension or unknown extension
  const contentType = contentTypes[extname] || 'text/html';
  
  // Check if file exists
  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      console.log(`File not found: ${filePath}`);
      
      // If route has no extension, serve index.html (SPA handling)
      if (!extname && url !== '/') {
        filePath = path.join(PUBLIC_DIR, 'index.html');
        serveFile(filePath, res, contentType);
      } else {
        // File not found
        res.writeHead(404);
        res.end('404 Not Found');
      }
      return;
    }
    
    // File exists, serve it
    serveFile(filePath, res, contentType);
  });
});

// Helper function to serve files
function serveFile(filePath, res, contentType) {
  fs.readFile(filePath, (err, content) => {
    if (err) {
      console.error(`Error reading file: ${filePath}`, err);
      res.writeHead(500);
      res.end('Server Error');
      return;
    }
    
    // Set headers and send content
    res.writeHead(200, {
      'Content-Type': contentType,
      'Access-Control-Allow-Origin': '*'
    });
    res.end(content);
    console.log(`Served: ${filePath}`);
  });
}

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