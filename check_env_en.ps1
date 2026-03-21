# Check EdgeOne Pages deployment environment variables
Write-Host "Checking EdgeOne Pages deployment environment variables..."
Write-Host ""

$envValue = [Environment]::GetEnvironmentVariable("EDGEONE_PAGES_PROJECT_NAME", "User")
if ($envValue) {
    Write-Host "User environment variable EDGEONE_PAGES_PROJECT_NAME = $envValue" -ForegroundColor Green
} else {
    Write-Host "User environment variable EDGEONE_PAGES_PROJECT_NAME not set" -ForegroundColor Red
}

$envValue = [Environment]::GetEnvironmentVariable("EDGEONE_PAGES_PROJECT_NAME", "Machine")
if ($envValue) {
    Write-Host "System environment variable EDGEONE_PAGES_PROJECT_NAME = $envValue" -ForegroundColor Green
} else {
    Write-Host "System environment variable EDGEONE_PAGES_PROJECT_NAME not set" -ForegroundColor Yellow
}

$envValue = $env:EDGEONE_PAGES_PROJECT_NAME
if ($envValue) {
    Write-Host "Current session environment variable EDGEONE_PAGES_PROJECT_NAME = $envValue" -ForegroundColor Green
} else {
    Write-Host "Current session environment variable EDGEONE_PAGES_PROJECT_NAME not set" -ForegroundColor Red
}

Write-Host ""
Write-Host "If you need to set the environment variable, please run setup_and_deploy_en.ps1 script"