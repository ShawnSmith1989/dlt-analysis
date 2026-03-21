@echo off
echo Setting up EdgeOne Pages deployment...
echo.

REM Set environment variable for current session
set EDGEONE_PAGES_PROJECT_NAME=dlt-analysis

echo Environment variable set: EDGEONE_PAGES_PROJECT_NAME=%EDGEONE_PAGES_PROJECT_NAME%
echo.

echo Opening new PowerShell session with environment variable...
echo In the new session, please:
echo 1. Click EdgeOne Pages integration
echo 2. Select deploy_folder tool
echo 3. Enter parameters:
echo    builtFolderPath: d:\daletgou\dlt4\deploy
echo    workspacePath: d:\daletgou\dlt4
echo    projectType: static
echo.

start powershell -NoExit -Command "echo EdgeOne Pages deployment environment is ready. You can now use the EdgeOne Pages integration tool."

echo.
echo New PowerShell session opened.
echo You can now use EdgeOne Pages integration in the new window.
pause