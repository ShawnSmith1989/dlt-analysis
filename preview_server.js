const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = 3000;
const PUBLIC_DIR = path.join(__dirname);

// MIME类型映射
const mimeTypes = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.wav': 'audio/wav',
  '.mp4': 'video/mp4',
  '.woff': 'application/font-woff',
  '.ttf': 'application/font-ttf',
  '.eot': 'application/vnd.ms-fontobject',
  '.otf': 'application/font-otf',
  '.wasm': 'application/wasm'
};

const server = http.createServer((req, res) => {
  // 解析URL
  const parsedUrl = url.parse(req.url);
  let pathname = parsedUrl.pathname;

  // 默认路由到index.html
  if (pathname === '/') {
    pathname = '/index.html';
  }

  // 获取文件路径
  const filePath = path.join(PUBLIC_DIR, pathname);
  const ext = path.parse(filePath).ext;
  const contentType = mimeTypes[ext] || 'application/octet-stream';

  // 检查文件是否存在
  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      res.writeHead(404);
      res.end('File not found');
      return;
    }

    // 读取文件
    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.writeHead(500);
        res.end('Error loading file');
        return;
      }

      // 设置CORS头以允许跨域请求
      // 添加缓存控制头，特别是对于JS文件
      let headers = { 
        'Content-Type': contentType,
        'Access-Control-Allow-Origin': '*'
      };
      
      // 对JS文件禁用缓存
      if (ext === '.js') {
        headers['Cache-Control'] = 'no-cache, no-store, must-revalidate';
        headers['Pragma'] = 'no-cache';
        headers['Expires'] = '0';
      }
      
      res.writeHead(200, headers);
      res.end(data);
    });
  });
});

server.listen(PORT, () => {
  console.log(`\n==========================================`);
  console.log(`🚀 大乐透分析网站预览服务器已启动!`);
  console.log(`==========================================`);
  console.log(`\n预览地址:`);
  console.log(`http://localhost:${PORT}`);
  console.log(`\n可用页面:`);
  console.log(`- 主页: http://localhost:${PORT}/index.html`);
  console.log(`- 图表页: http://localhost:${PORT}/chart.html`);
  console.log(`\n按 Ctrl+C 停止服务器\n`);
});