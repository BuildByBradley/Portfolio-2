const http = require('http');
const fs   = require('fs');
const path = require('path');

const PORT = 3000;
const ROOT = __dirname;

const MIME = {
  html : 'text/html',
  css  : 'text/css',
  js   : 'application/javascript',
  json : 'application/json',
  webp : 'image/webp',
  jpg  : 'image/jpeg',
  jpeg : 'image/jpeg',
  png  : 'image/png',
  gif  : 'image/gif',
  svg  : 'image/svg+xml',
  mp4  : 'video/mp4',
  mp3  : 'audio/mpeg',
  woff : 'font/woff',
  woff2: 'font/woff2',
  ttf  : 'font/ttf',
  ico  : 'image/x-icon',
  pdf  : 'application/pdf',
};

http.createServer((req, res) => {
  let urlPath = decodeURIComponent(req.url.split('?')[0]);
  let filePath = path.join(ROOT, urlPath);

  // Serve index.html for directories
  if (!path.extname(filePath)) {
    filePath = path.join(filePath, 'index.html');
  }

  const ext  = path.extname(filePath).slice(1).toLowerCase();
  const type = MIME[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404 Not Found: ' + urlPath);
    } else {
      res.writeHead(200, {
        'Content-Type' : type,
        'Cache-Control': 'no-cache',
      });
      res.end(data);
    }
  });

}).listen(PORT, () => {
  console.log(`\n  Portfolio server running at http://localhost:${PORT}\n`);
});
