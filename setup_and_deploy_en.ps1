# Configure EdgeOne Pages deployment environment variable
Write-Host "====================================="
Write-Host "Configure EdgeOne Pages Deployment Environment Variable"
Write-Host "====================================="
Write-Host ""

# Set user-level environment variable
try {
    [Environment]::SetEnvironmentVariable("EDGEONE_PAGES_PROJECT_NAME", "dlt-analysis", "User")
    Write-Host "Environment variable has been set: EDGEONE_PAGES_PROJECT_NAME=dlt-analysis" -ForegroundColor Green
}
catch {
    Write-Host "Error: Failed to set environment variable" -ForegroundColor Red
    Write-Host $_.Exception.Message
    exit 1
}

Write-Host ""
Write-Host "Note: The environment variable will take effect in a new PowerShell session"
Write-Host "The current PowerShell session may not be able to read the newly set environment variable"
Write-Host ""
Write-Host "Please follow these steps:"
Write-Host "1. Close the current IDE"
Write-Host "2. Reopen the IDE"
Write-Host "3. Click the EdgeOne Pages integration button"
Write-Host "4. Select the deploy_folder tool"
Write-Host "5. Enter the following parameters:"
Write-Host "   builtFolderPath: d:\daletgou\dlt4\deploy"
Write-Host "   workspacePath: d:\daletgou\dlt4"
Write-Host "   projectType: static"
Write-Host ""
Write-Host "Press any key to continue..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")