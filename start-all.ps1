# Discord Moderation Bot - Start All Services
Write-Host "🚀 Starting Discord Moderation Bot..." -ForegroundColor Cyan

# Check if MongoDB is running
$mongoService = Get-Service -Name MongoDB -ErrorAction SilentlyContinue
if ($mongoService -and $mongoService.Status -eq 'Running') {
    Write-Host "✅ MongoDB is running" -ForegroundColor Green
} else {
    Write-Host "❌ MongoDB is not running. Please start MongoDB first!" -ForegroundColor Red
    Write-Host "   Run: Start-Service MongoDB" -ForegroundColor Yellow
    exit 1
}

# Function to start a process in a new window
function Start-ServiceWindow {
    param(
        [string]$Title,
        [string]$Command,
        [string]$WorkingDir
    )
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$WorkingDir'; Write-Host '🚀 Starting $Title...' -ForegroundColor Cyan; $Command" -WindowStyle Normal
}

# Start Backend API
Write-Host "🔧 Starting Backend API..." -ForegroundColor Yellow
Start-ServiceWindow -Title "Backend API" -Command "npm start" -WorkingDir "$PSScriptRoot\backend"
Start-Sleep -Seconds 3

# Start Discord Bot
Write-Host "🤖 Starting Discord Bot..." -ForegroundColor Yellow
Start-ServiceWindow -Title "Discord Bot" -Command "npm start" -WorkingDir "$PSScriptRoot\bot"
Start-Sleep -Seconds 3

# Start Dashboard
Write-Host "🌐 Starting Dashboard..." -ForegroundColor Yellow
Start-ServiceWindow -Title "Dashboard" -Command "npm start" -WorkingDir "$PSScriptRoot\dashboard"

Write-Host ""
Write-Host "✅ All services started successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "📝 Service URLs:" -ForegroundColor Cyan
Write-Host "   Backend API: http://localhost:5000" -ForegroundColor White
Write-Host "   Dashboard:   http://localhost:3000" -ForegroundColor White
Write-Host ""
Write-Host "⚠️  Close all PowerShell windows to stop all services" -ForegroundColor Yellow
