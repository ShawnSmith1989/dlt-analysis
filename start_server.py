#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import http.server
import socketserver
import os
import json
from datetime import datetime

class MyHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # 添加CORS头，允许跨域请求
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        # 添加缓存控制
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        super().end_headers()
    
    def do_GET(self):
        # 打印请求信息
        print(f"GET request: {self.path}")
        
        # 如果请求的是data.js，添加时间戳参数以避免缓存
        if self.path.startswith('/data.js'):
            # 获取文件的修改时间
            try:
                file_path = os.path.join(os.getcwd(), 'data.js')
                mtime = os.path.getmtime(file_path)
                self.path = f'/data.js?t={int(mtime)}'
            except:
                pass
        # 如果请求的是HTML文件，添加时间戳参数以避免缓存
        elif self.path.endswith('.html') or self.path == '/':
            # 获取当前时间作为时间戳
            import time
            timestamp = int(time.time())
            if self.path == '/':
                # 添加查询参数
                if '?' in self.path:
                    self.path = f'{self.path}&t={timestamp}'
                else:
                    self.path = f'/?t={timestamp}'
            else:
                # 添加查询参数
                if '?' in self.path:
                    self.path = f'{self.path}&t={timestamp}'
                else:
                    self.path = f'{self.path}?t={timestamp}'
        
        return super().do_GET()
    
    def do_POST(self):
        # 处理更新数据的POST请求
        if self.path == '/update_data':
            try:
                # 读取请求体
                content_length = int(self.headers['Content-Length'])
                post_data = self.rfile.read(content_length)
                print(f"Received POST request: {post_data}")
                
                # 解析请求数据
                data = json.loads(post_data.decode('utf-8'))
                action = data.get('action', '')
                print(f"Action: {action}")
                
                if action == 'update':
                    # 执行更新命令
                    import subprocess
                    result = subprocess.run(['node', 'update_data.js'], 
                                          capture_output=True, 
                                          text=True, 
                                          encoding='utf-8',
                                          errors='ignore',
                                          cwd=os.getcwd())
                    
                    print(f"Update result: {result.returncode}")
                    
                    if result.returncode == 0:
                        # 更新成功
                        response = {
                            'success': True,
                            'message': '数据更新成功',
                            'output': result.stdout
                        }
                    else:
                        # 更新失败
                        response = {
                            'success': False,
                            'message': '数据更新失败',
                            'error': result.stderr
                        }
                elif action == 'update_missing':
                    # 执行检查并更新缺失数据命令
                    import subprocess
                    result = subprocess.run(['node', 'update_missing_data.js'], 
                                          capture_output=True, 
                                          text=True, 
                                          encoding='utf-8',
                                          errors='ignore',
                                          cwd=os.getcwd())
                    
                    print(f"Update missing data result: {result.returncode}")
                    
                    if result.returncode == 0:
                        # 更新成功
                        response = {
                            'success': True,
                            'message': '检查并更新缺失数据成功',
                            'output': result.stdout
                        }
                    else:
                        # 更新失败
                        response = {
                            'success': False,
                            'message': '检查并更新缺失数据失败',
                            'error': result.stderr
                        }
                else:
                    response = {
                        'success': False,
                        'message': '未知操作'
                    }
                
                # 发送响应
                self.send_response(200)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                
                response_json = json.dumps(response)
                print(f"Sending response: {response_json}")
                self.wfile.write(response_json.encode('utf-8'))
            except Exception as e:
                # 处理异常
                print(f"Exception: {str(e)}")
                self.send_response(500)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                error_response = {
                    'success': False,
                    'message': f'服务器错误: {str(e)}'
                }
                self.wfile.write(json.dumps(error_response).encode('utf-8'))
        else:
            self.send_error(404)

def run_server(port=8888):
    """启动服务器"""
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    
    with socketserver.TCPServer(("", port), MyHTTPRequestHandler) as httpd:
        server_time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        print(f"服务器启动于 {server_time}")
        print(f"服务器地址: http://localhost:{port}")
        print(f"按 Ctrl+C 停止服务器")
        
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n服务器已停止")
            httpd.server_close()

if __name__ == "__main__":
    run_server()