# Auto-start backend server with port conflict resolution
Write-Host "🔍 Checking for port conflicts..." -ForegroundColor Cyan

# Kill any existing processes on port 5001
$processesOnPort = Get-Process | Where-Object {
    $_.ProcessName -eq "node" -and 
    (Get-NetTCPConnection -OwningProcess $_.Id -ErrorAction SilentlyContinue | Select-Object -First 1).LocalPort -eq 5001
}

if ($processesOnPort) {
    Write-Host "⚠️  Found processes using port 5001. Stopping them..." -ForegroundColor Yellow
    $processesOnPort | Stop-Process -Force
    Start-Sleep -Seconds 2
    Write-Host "✅ Port 5001 cleared!" -ForegroundColor Green
} else {
    Write-Host "✅ Port 5001 is available!" -ForegroundColor Green
}

# Start the backend server
Write-Host "🚀 Starting backend server..." -ForegroundColor Cyan
node index.js