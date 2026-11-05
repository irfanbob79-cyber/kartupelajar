@echo off
title KartuPelajar PRO Server (Next.js)
cd /d "%~dp0"
echo ====================================================
echo   SEDANG MENJALANKAN SERVER KARTU PELAJAR PRO
echo   Alamat: http://localhost:3000
echo ====================================================
echo.
node node_modules\next\dist\bin\next dev -p 3000
if errorlevel 1 (
    echo.
    echo Menjalankan fallback via npm.cmd...
    call npm.cmd run dev
)
pause
