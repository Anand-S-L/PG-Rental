const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 5000;
const PUBLIC_DIR = path.join(__dirname, 'public');

// Create HTTP server
const server = http.createServer((req, res) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  
  // Parse URL and remove query parameters if any
  let url = req.url.split('?')[0];
  
  // Default to index.html for the root path
  if (url === '/') {
    url = '/index.html';
  } else if (url === '/test') {
    url = '/test.html';
  }
  
  // Get the file path
  const filePath = path.join(PUBLIC_DIR, url);
  
  // Determine content type based on file extension
  const ext = path.extname(url);
  let contentType = 'text/html';
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
  fs.readFile(filePath, (err, content) => {
    if (err) {
      // If file not found or there's another error, try serving index.html
      console.error(`Error reading file: ${filePath}`, err.code);
      
      // For all errors, fall back to index.html for SPA routing
      fs.readFile(path.join(PUBLIC_DIR, 'index.html'), (err, content) => {
        if (err) {
          // If even index.html can't be read, send error
          res.writeHead(500);
          res.end(`Server Error: Unable to read index.html - ${err.code}`);
          return;
        }
        
        // Serve index.html
        console.log('Serving index.html as fallback');
        res.writeHead(200, {
          'Content-Type': 'text/html',
          'Access-Control-Allow-Origin': '*',
          'Content-Security-Policy': "default-src * 'unsafe-inline' 'unsafe-eval'; img-src * data:;"
        });
        res.end(content, 'utf-8');
      });
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
  console.log(`Basic HTTP server running at http://0.0.0.0:${PORT}/`);
  
  // Log files in public directory
  try {
    const files = fs.readdirSync(PUBLIC_DIR);
    console.log(`Files in ${PUBLIC_DIR}:`, files);
    
    // Check specific files
    const indexPath = path.join(PUBLIC_DIR, 'index.html');
    const testPath = path.join(PUBLIC_DIR, 'test.html');
    
    console.log(`index.html exists: ${fs.existsSync(indexPath)}`);
    console.log(`test.html exists: ${fs.existsSync(testPath)}`);
    
    // Output the content of index.html for debugging
    console.log('Content of index.html:');
    const indexContent = fs.readFileSync(indexPath, 'utf-8');
    console.log(indexContent.substring(0, 200) + '...');
  } catch (err) {
    console.error('Error reading directory:', err);
  }
});