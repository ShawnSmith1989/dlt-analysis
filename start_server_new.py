#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import http.server
import socketserver
import os
import json
import subprocess
import threading
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
    
    def do_OPTIONS(self):
        # 处理预检请求
        self.send_response(200)
        self.end_headers()
    
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
                
                # 创建一个线程来执行更新操作
                result_container = {}
                result_container['result'] = None
                result_container['exception'] = None
                
                def run_update():
                    try:
                        if action == 'update':
                            # 执行更新命令
                            result = subprocess.run(
                                ['node', 'update_data.js'], 
                                capture_output=True, 
                                text=True, 
                                cwd=os.getcwd(),
                                encoding='utf-8',
                                timeout=120  # 2分钟超时
                            )
                            result_container['result'] = {
                                'returncode': result.returncode,
                                'stdout': result.stdout,
                                'stderr': result.stderr
                            }
                        elif action == 'update_missing':
                            # 执行检查并更新缺失数据命令
                            result = subprocess.run(
                                ['node', 'update_missing_data.js'], 
                                capture_output=True, 
                                text=True, 
                                cwd=os.getcwd(),
                                encoding='utf-8',
                                timeout=300  # 5分钟超时，因为这个操作可能更长时间
                            )
                            result_container['result'] = {
                                'returncode': result.returncode,
                                'stdout': result.stdout,
                                'stderr': result.stderr
                            }
                        else:
                            result_container['result'] = {
                                'returncode': 1,
                                'stdout': '',
                                'stderr': f'未知操作: {action}'
                            }
                    except subprocess.TimeoutExpired:
                        result_container['result'] = {
                            'returncode': 1,
                            'stdout': '',
                            'stderr': '操作超时'
                        }
                    except Exception as e:
                        result_container['exception'] = str(e)
                
                # 启动线程
                update_thread = threading.Thread(target=run_update)
                update_thread.start()
                update_thread.join()
                
                # 检查是否有异常
                if result_container['exception']:
                    raise Exception(f"服务器内部错误: {result_container['exception']}")
                
                result = result_container['result']
                print(f"Update result: {result['returncode']}")
                print(f"Stdout: {result['stdout']}")
                print(f"Stderr: {result['stderr']}")
                
                if result['returncode'] == 0:
                    # 更新成功
                    if action == 'update':
                        response = {
                            'success': True,
                            'message': '数据更新成功',
                            'output': result['stdout']
                        }
                    else:
                        response = {
                            'success': True,
                            'message': '检查并更新缺失数据成功',
                            'output': result['stdout']
                        }
                else:
                    # 更新失败
                    if action == 'update':
                        response = {
                            'success': False,
                            'message': '数据更新失败',
                            'error': result['stderr']
                        }
                    else:
                        response = {
                            'success': False,
                            'message': '检查并更新缺失数据失败',
                            'error': result['stderr']
                        }
                
                # 发送响应
                self.send_response(200)
                self.send_header('Content-type', 'application/json; charset=utf-8')
                self.end_headers()
                
                response_json = json.dumps(response, ensure_ascii=False)
                print(f"Sending response: {response_json}")
                self.wfile.write(response_json.encode('utf-8'))
            except Exception as e:
                # 处理异常
                print(f"Exception: {str(e)}")
                self.send_response(500)
                self.send_header('Content-type', 'application/json; charset=utf-8')
                self.end_headers()
                error_response = {
                    'success': False,
                    'message': f'服务器错误: {str(e)}'
                }
                self.wfile.write(json.dumps(error_response, ensure_ascii=False).encode('utf-8'))
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