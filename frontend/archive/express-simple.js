const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 5000;
const PUBLIC_DIR = path.join(__dirname, 'public');

// Enable CORS for all routes
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

// Remove Content Security Policy temporarily for troubleshooting
// app.use((req, res, next) => {
//   res.header('Content-Security-Policy', "default-src * 'unsafe-inline' 'unsafe-eval'; img-src * data:;");
//   next();
// });

// Log all requests
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// JSON and URL-encoded parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the public directory
app.use(express.static(PUBLIC_DIR));

// Specific routes for HTML files
app.get('/index-test.html', (req, res) => {
  res.sendFile(path.join(PUBLIC_DIR, 'index-test.html'));
});

app.get('/test.html', (req, res) => {
  res.sendFile(path.join(PUBLIC_DIR, 'test.html'));
});

app.get('/customer.html', (req, res) => {
  res.sendFile(path.join(PUBLIC_DIR, 'customer.html'));
});

app.get('/booking.html', (req, res) => {
  res.sendFile(path.join(PUBLIC_DIR, 'booking.html'));
});

// Root route - serve index.html
app.get('/', (req, res) => {
  try {
    const indexPath = path.join(PUBLIC_DIR, 'index.html');
    if (fs.existsSync(indexPath)) {
      console.log('Serving index.html from', indexPath);
      res.sendFile(indexPath);
    } else {
      res.status(404).send('index.html not found');
    }
  } catch (err) {
    console.error('Error serving index.html:', err);
    res.status(500).send('Server error');
  }
});

// API proxy routes to backend
app.use('/api', (req, res) => {
  const backendUrl = 'http://localhost:8000';
  const targetUrl = `${backendUrl}${req.url}`;
  console.log(`Proxying request to backend: ${targetUrl}`);
  
  // In a real app, you would use http-proxy-middleware here
  // For this demo, we'll just send a "proxied" message
  res.json({
    message: 'API proxy would forward to backend',
    originalUrl: req.url,
    targetUrl: targetUrl
  });
});

// Catch-all route - for SPA support
app.use((req, res) => {
  console.log(`Fallback route handling: ${req.url}`);
  // Identify file extensions
  if (req.url.includes('.')) {
    const ext = path.extname(req.url);
    console.log(`Request has extension: ${ext}`);
    res.status(404).send(`File not found: ${req.url}`);
  } else {
    // For SPA routes without file extensions
    res.sendFile(path.join(PUBLIC_DIR, 'index.html'));
  }
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Express server running at http://0.0.0.0:${PORT}/`);
  
  // Log files in public directory
  try {
    const files = fs.readdirSync(PUBLIC_DIR);
    console.log(`Files in ${PUBLIC_DIR}:`, files);
    
    // Check all HTML files
    ['index.html', 'test.html', 'customer.html', 'booking.html', 'index-test.html'].forEach(file => {
      const filePath = path.join(PUBLIC_DIR, file);
      console.log(`${file} exists: ${fs.existsSync(filePath)}`);
    });
  } catch (err) {
    console.error('Error reading directory:', err);
  }
});