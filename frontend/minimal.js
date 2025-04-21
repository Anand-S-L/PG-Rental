const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 5000;
const PUBLIC_DIR = path.join(__dirname, 'public');

http.createServer((req, res) => {
  console.log(`Request: ${req.method} ${req.url}`);
  
  // Default to index.html
  let filePath = path.join(PUBLIC_DIR, 'index.html');
  
  if (req.url === '/test') {
    filePath = path.join(PUBLIC_DIR, 'test.html');
  } else if (req.url === '/index.js') {
    filePath = path.join(PUBLIC_DIR, 'index.js');
    res.setHeader('Content-Type', 'text/javascript');
  }
  
  fs.readFile(filePath, (err, content) => {
    if (err) {
      console.error('Error reading file:', err);
      res.writeHead(500);
      res.end('Server Error');
      return;
    }
    
    res.writeHead(200, {
      'Content-Type': req.url === '/index.js' ? 'text/javascript' : 'text/html',
      'Access-Control-Allow-Origin': '*',
      'Content-Security-Policy': "default-src * 'unsafe-inline' 'unsafe-eval'; img-src * data:;"
    });
    
    res.end(content);
    console.log(`Served: ${filePath}`);
  });
}).listen(PORT, '0.0.0.0', () => {
  console.log(`Minimal server running at http://0.0.0.0:${PORT}/`);
  console.log(`Contents of ${PUBLIC_DIR}:`, fs.readdirSync(PUBLIC_DIR));
});