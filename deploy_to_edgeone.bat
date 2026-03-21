@echo off
echo 设置EdgeOne Pages部署环境变量...
set EDGEONE_PAGES_PROJECT_NAME=dlt-analysis
echo 环境变量已设置: EDGEONE_PAGES_PROJECT_NAME=%EDGEONE_PAGES_PROJECT_NAME%
echo.
echo 请在IDE中手动执行以下操作:
echo 1. 点击EdgeOne Pages集成按钮
echo 2. 选择deploy_folder工具
echo 3. 输入以下参数:
echo    builtFolderPath: d:\daletgou\dlt4\deploy
echo    workspacePath: d:\daletgou\dlt4
echo    projectType: static
echo.
pause