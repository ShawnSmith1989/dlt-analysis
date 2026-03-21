# 检查EdgeOne Pages部署所需的环境变量
Write-Host "检查EdgeOne Pages部署环境变量..."
Write-Host ""

$envValue = [Environment]::GetEnvironmentVariable("EDGEONE_PAGES_PROJECT_NAME", "User")
if ($envValue) {
    Write-Host "用户级环境变量 EDGEONE_PAGES_PROJECT_NAME = $envValue" -ForegroundColor Green
} else {
    Write-Host "用户级环境变量 EDGEONE_PAGES_PROJECT_NAME 未设置" -ForegroundColor Red
}

$envValue = [Environment]::GetEnvironmentVariable("EDGEONE_PAGES_PROJECT_NAME", "Machine")
if ($envValue) {
    Write-Host "系统级环境变量 EDGEONE_PAGES_PROJECT_NAME = $envValue" -ForegroundColor Green
} else {
    Write-Host "系统级环境变量 EDGEONE_PAGES_PROJECT_NAME 未设置" -ForegroundColor Yellow
}

$envValue = $env:EDGEONE_PAGES_PROJECT_NAME
if ($envValue) {
    Write-Host "当前会话环境变量 EDGEONE_PAGES_PROJECT_NAME = $envValue" -ForegroundColor Green
} else {
    Write-Host "当前会话环境变量 EDGEONE_PAGES_PROJECT_NAME 未设置" -ForegroundColor Red
}

Write-Host ""
Write-Host "如果需要设置环境变量，请运行 setup_and_deploy.ps1 脚本"