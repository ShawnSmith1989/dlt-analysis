@echo off
echo =====================================
echo 配置EdgeOne Pages部署环境变量
echo =====================================
echo.

echo 设置环境变量...
setx EDGEONE_PAGES_PROJECT_NAME "dlt-analysis"
if %errorlevel% neq 0 (
    echo 错误：设置环境变量失败，请以管理员身份运行此脚本
    pause
    exit /b 1
)

echo 环境变量已设置: EDGEONE_PAGES_PROJECT_NAME=dlt-analysis
echo.
echo 注意：环境变量将在新的命令窗口中生效
echo 当前命令窗口可能无法读取新设置的环境变量
echo.
echo 建议执行以下步骤：
echo 1. 关闭当前IDE
echo 2. 重新打开IDE
echo 3. 点击EdgeOne Pages集成按钮
echo 4. 选择deploy_folder工具
echo 5. 输入以下参数：
echo    builtFolderPath: d:\daletgou\dlt4\deploy
echo    workspacePath: d:\daletgou\dlt4
echo    projectType: static
echo.
echo 按任意键继续...
pause >nul