const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 5000;
const PUBLIC_DIR = path.join(__dirname, 'public');

// Create HTTP server
const server = http.createServer((req, res) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  
  // Parse URL
  let url = req.url;
  
  // Remove query parameters if any
  url = url.split('?')[0];
  
  // Handle root or test route
  if (url === '/') {
    url = '/index.html';
  } else if (url === '/test') {
    url = '/test.html';
  }
  
  // For SPA routes without file extension
  if (!path.extname(url) && url !== '/index.html' && url !== '/test.html') {
    console.log(`SPA route detected: ${url}`);
    url = '/index.html';
  }
  
  // Determine content type based on file extension
  let contentType = 'text/html';
  const ext = path.extname(url);
  switch (ext) {
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
  }
  
  // Read the file
  const filePath = path.join(PUBLIC_DIR, url);
  fs.readFile(filePath, (err, content) => {
    if (err) {
      // If file not found, serve index.html (we've already handled SPA routes above)
      if (err.code === 'ENOENT') {
        // Serve index.html for any not found route
        console.log(`File not found: ${filePath}, serving index.html`);
        fs.readFile(path.join(PUBLIC_DIR, 'index.html'), (err, content) => {
          if (err) {
            res.writeHead(500);
            res.end('Error loading index.html');
            return;
          }
          
          res.writeHead(200, {
            'Content-Type': 'text/html',
            'Access-Control-Allow-Origin': '*',
            'Content-Security-Policy': "default-src * 'unsafe-inline' 'unsafe-eval'; img-src * data:;"
          });
          res.end(content, 'utf-8');
        });
        return;
      }
      
      // Server error
      res.writeHead(500);
      res.end(`Server Error: ${err.code}`);
      return;
    }
    
    // Success - file found
    res.writeHead(200, {
      'Content-Type': contentType,
      'Access-Control-Allow-Origin': '*',
      'Content-Security-Policy': "default-src * 'unsafe-inline' 'unsafe-eval'; img-src * data:;"
    });
    res.end(content, 'utf-8');
  });
});

// Start server
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running at http://0.0.0.0:${PORT}/`);
  
  // Log files in public directory
  try {
    const files = fs.readdirSync(PUBLIC_DIR);
    console.log(`Files in ${PUBLIC_DIR}:`, files);
    
    // Check specific files
    const indexPath = path.join(PUBLIC_DIR, 'index.html');
    const testPath = path.join(PUBLIC_DIR, 'test.html');
    
    console.log(`index.html exists: ${fs.existsSync(indexPath)}`);
    console.log(`test.html exists: ${fs.existsSync(testPath)}`);
  } catch (err) {
    console.error('Error reading directory:', err);
  }
});