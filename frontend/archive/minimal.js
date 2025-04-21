const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 5000;
const PUBLIC_DIR = path.join(__dirname, 'public');

http.createServer((req, res) => {
  console.log(`Request: ${req.method} ${req.url}`);
  
  // Parse the URL
  let urlPath = req.url;
  
  // Remove query parameters if any
  if (urlPath.includes('?')) {
    urlPath = urlPath.split('?')[0];
  }
  
  // Default to index.html for root path
  if (urlPath === '/') {
    urlPath = '/index.html';
  }
  
  // Determine the file path
  let filePath = path.join(PUBLIC_DIR, urlPath);
  
  // Check if the file exists
  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      // If the file doesn't exist, serve index.html for client-side routing
      filePath = path.join(PUBLIC_DIR, 'index.html');
      console.log(`File not found, serving index.html for: ${req.url}`);
    }
    
    // Determine content type based on file extension
    const extname = path.extname(filePath);
    let contentType = 'text/html';
    
    switch (extname) {
      case '.js':
        contentType = 'text/javascript';
        break;
      case '.css':
        contentType = 'text/css';
        break;
      case '.json':
        contentType = 'application/json';
        break;
      case '.png':
        contentType = 'image/png';
        break;
      case '.jpg':
      case '.jpeg':
        contentType = 'image/jpeg';
        break;
      case '.svg':
        contentType = 'image/svg+xml';
        break;
    }
    
    // Read and serve the file
    fs.readFile(filePath, (err, content) => {
      if (err) {
        console.error('Error reading file:', err);
        res.writeHead(500);
        res.end('Server Error');
        return;
      }
      
      res.writeHead(200, {
        'Content-Type': contentType,
        'Access-Control-Allow-Origin': '*',
        'Content-Security-Policy': "default-src * 'unsafe-inline' 'unsafe-eval'; img-src * data:;"
      });
      
      res.end(content);
      console.log(`Served: ${filePath}`);
    });
  });
}).listen(PORT, '0.0.0.0', () => {
  console.log(`Minimal server running at http://0.0.0.0:${PORT}/`);
  console.log(`Contents of ${PUBLIC_DIR}:`, fs.readdirSync(PUBLIC_DIR));
});