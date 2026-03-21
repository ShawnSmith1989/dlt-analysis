# 配置EdgeOne Pages部署环境变量
Write-Host "====================================="
Write-Host "配置EdgeOne Pages部署环境变量"
Write-Host "====================================="
Write-Host ""

# 设置用户级环境变量
try {
    [Environment]::SetEnvironmentVariable("EDGEONE_PAGES_PROJECT_NAME", "dlt-analysis", "User")
    Write-Host "环境变量已成功设置: EDGEONE_PAGES_PROJECT_NAME=dlt-analysis" -ForegroundColor Green
}
catch {
    Write-Host "错误：设置环境变量失败" -ForegroundColor Red
    Write-Host $_.Exception.Message
    exit 1
}

Write-Host ""
Write-Host "注意：环境变量将在新的PowerShell会话中生效"
Write-Host "当前PowerShell会话可能无法读取新设置的环境变量"
Write-Host ""
Write-Host "建议执行以下步骤："
Write-Host "1. 关闭当前IDE"
Write-Host "2. 重新打开IDE"
Write-Host "3. 点击EdgeOne Pages集成按钮"
Write-Host "4. 选择deploy_folder工具"
Write-Host "5. 输入以下参数："
Write-Host "   builtFolderPath: d:\daletgou\dlt4\deploy"
Write-Host "   workspacePath: d:\daletgou\dlt4"
Write-Host "   projectType: static"
Write-Host ""
Write-Host "按任意键继续..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")