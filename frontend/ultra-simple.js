// Ultra simple Node.js server with only essential parts
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 5000;
const indexPath = path.join(__dirname, 'public', 'index.html');

// Create a server with just the most basic functionality
http.createServer((req, res) => {
  console.log(`Request received: ${req.method} ${req.url}`);
  
  // Set headers for CORS and content type
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'text/html');
  
  // Always serve index.html, regardless of the URL path
  fs.readFile(indexPath, (err, content) => {
    if (err) {
      console.error('Error reading index.html:', err);
      res.statusCode = 500;
      res.end('Error loading page');
      return;
    }
    
    res.statusCode = 200;
    res.end(content);
    console.log('Successfully served index.html');
  });
}).listen(PORT, '0.0.0.0', () => {
  console.log(`Ultra simple server running at http://0.0.0.0:${PORT}/`);
  console.log(`Serving index.html from: ${indexPath}`);
  console.log(`File exists: ${fs.existsSync(indexPath)}`);
});