@echo off
echo ========================================
echo Starting RecruitConnect Application
echo ========================================
echo.

:: Kill any existing processes on required ports
echo Checking for existing processes...

:: Kill process on port 5001 (Backend)
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5001') do (
    taskkill /F /PID %%a >nul 2>&1
)

:: Kill process on port 3000 (Frontend)
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000') do (
    taskkill /F /PID %%a >nul 2>&1
)

echo Ports cleared!
echo.
echo Starting Backend Server on port 5001...
start "Backend Server" cmd /k "cd backend && node index.js"

:: Wait 3 seconds for backend to start
timeout /t 3 /nobreak >nul

echo Starting Frontend Server on port 3000...
start "Frontend Server" cmd /k "cd frontend && npm start"

echo.
echo ========================================
echo Application Starting!
echo ========================================
echo Backend: http://localhost:5001
echo Frontend: http://localhost:3000
echo ========================================
echo.
echo Press any key to stop all servers...
pause >nul

:: Kill servers on exit
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5001') do (
    taskkill /F /PID %%a >nul 2>&1
)
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000') do (
    taskkill /F /PID %%a >nul 2>&1
)

echo Servers stopped.
