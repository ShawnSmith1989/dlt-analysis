@echo off
echo 正在启动大乐透分析工具...
echo.

REM 检查Python是否安装
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo 错误：未检测到Python，请先安装Python
    pause
    exit /b
)

REM 启动预览服务器
echo 启动预览服务器...
echo 请在浏览器中访问：http://localhost:8000/combined_analysis.html
echo 按 Ctrl+C 停止服务器
echo.

python -m http.server 8000