const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');
const { spawn } = require('child_process');

const PORT = parseInt(process.env.PORT || '3000', 10);
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

function writeJson(res, statusCode, payload) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0'
  });
  res.end(JSON.stringify(payload));
}

function runUpdateScript(scriptName) {
  return new Promise((resolve, reject) => {
    const child = spawn('node', [scriptName], {
      cwd: PUBLIC_DIR,
      windowsHide: true
    });

    let stdout = '';
    let stderr = '';

    child.stdout.on('data', chunk => {
      stdout += chunk.toString();
    });

    child.stderr.on('data', chunk => {
      stderr += chunk.toString();
    });

    child.on('error', reject);
    child.on('close', code => {
      if (code === 0) {
        resolve({ stdout, stderr });
        return;
      }

      reject(new Error(stderr || stdout || `更新脚本退出码 ${code}`));
    });
  });
}

async function handleUpdateRequest(req, res) {
  let body = '';

  req.on('data', chunk => {
    body += chunk.toString();
  });

  req.on('end', async () => {
    try {
      const payload = body ? JSON.parse(body) : {};
      const action = payload.action || 'update';
      const scriptName = action === 'update_missing' ? 'update_missing_data.js' : 'update_data.js';
      const result = await runUpdateScript(scriptName);

      writeJson(res, 200, {
        success: true,
        message: action === 'update_missing' ? '缺失数据检查完成' : '数据更新成功',
        output: result.stdout || result.stderr
      });
    } catch (error) {
      writeJson(res, 500, {
        success: false,
        message: error.message
      });
    }
  });
}

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url);
  let pathname = parsedUrl.pathname;

  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    });
    res.end();
    return;
  }

  if (pathname === '/update_data' && req.method === 'POST') {
    handleUpdateRequest(req, res);
    return;
  }

  if (pathname === '/') {
    pathname = '/index.html';
  }

  const filePath = path.join(PUBLIC_DIR, pathname);
  const ext = path.parse(filePath).ext;
  const contentType = mimeTypes[ext] || 'application/octet-stream';

  fs.access(filePath, fs.constants.F_OK, err => {
    if (err) {
      res.writeHead(404);
      res.end('File not found');
      return;
    }

    fs.readFile(filePath, (readError, data) => {
      if (readError) {
        res.writeHead(500);
        res.end('Error loading file');
        return;
      }

      const headers = {
        'Content-Type': contentType,
        'Access-Control-Allow-Origin': '*'
      };

      if (ext === '.js' || ext === '.html') {
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
