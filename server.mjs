import { createReadStream, existsSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, normalize } from 'node:path';

const root = process.cwd();
const port = Number(process.env.PORT || 5173);
const mime = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.woff2': 'font/woff2'
};

createServer((request, response) => {
  const pathname = decodeURIComponent(new URL(request.url, `http://${request.headers.host}`).pathname);
  const relativePath = pathname.replace(/^\/+/, '');
  const sourcePath = normalize(join(root, relativePath || 'index.html'));
  const publicPath = normalize(join(root, 'public', relativePath));
  let filePath = sourcePath;
  if (!existsSync(filePath) || statSync(filePath).isDirectory()) filePath = publicPath;
  if (!filePath.startsWith(root) || !existsSync(filePath) || statSync(filePath).isDirectory()) filePath = join(root, 'index.html');
  response.setHeader('Content-Type', mime[extname(filePath).toLowerCase()] || 'application/octet-stream');
  createReadStream(filePath).pipe(response);
}).listen(port, '0.0.0.0', () => {
  console.log(`Shu Jin preview: http://localhost:${port}`);
});
