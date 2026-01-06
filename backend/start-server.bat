

@echo off
echo 🔍 Checking for port conflicts...

REM Kill any existing Node processes on port 5001
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5001') do (
    echo ⚠️  Found process %%a using port 5001. Stopping it...
    taskkill /f /pid %%a >nul 2>&1
)

echo ✅ Port 5001 cleared!
echo 🚀 Starting backend server...
node index.js