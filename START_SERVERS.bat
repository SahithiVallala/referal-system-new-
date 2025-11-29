@echo off
cls
echo.
echo ========================================
echo   RecruitConnect - Server Startup
echo   Powered by TechGene
echo ========================================
echo.

REM Kill any existing node processes
echo Stopping any existing servers...
taskkill /F /IM node.exe >nul 2>&1
timeout /t 2 /nobreak >nul

echo.
echo Starting Auth Backend (Port 5001)...
start "🔐 Auth Backend - Port 5001" cmd /k "cd /d %~dp0backend && node index.js"
timeout /t 3 /nobreak >nul

echo Starting App Backend (Port 4000)...
start "📊 App Backend - Port 4000" cmd /k "cd /d %~dp0backend && node server.js"
timeout /t 3 /nobreak >nul

echo.
echo ========================================
echo   ✅ Both servers started successfully!
echo.
echo   🔐 Auth Backend:  http://localhost:5001
echo   📊 App Backend:   http://localhost:4000
echo   🌐 Frontend:      http://localhost:3000
echo.
echo   To start frontend:
echo   cd frontend
echo   npm start
echo.
echo ========================================
echo.
pause
