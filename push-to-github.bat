@echo off
title Push KartuPelajar ke GitHub
cd /d "%~dp0"
echo ====================================================
echo   PERSIAPAN PUSH REPOSITORI KE GITHUB
echo ====================================================
echo.
git --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Git belum terpasang di sistem ini.
    echo Silakan pasang Git dari https://git-scm.com/
    pause
    exit /b
)

if not exist .git (
    echo [1/4] Menginisialisasi git repository...
    git init
    git branch -M main
) else (
    echo [1/4] Git repository sudah aktif.
)

echo.
echo [2/4] Menambahkan berkas ke stage (git add)...
git add .

echo.
echo [3/4] Membuat commit...
git commit -m "feat: complete student id card generator for SMKN 1 Labuhan Maringgai (CR80 RFID standard)"

echo.
echo ====================================================
echo Masukkan URL Repository GitHub yang baru dibuat:
echo Contoh: https://github.com/username/kartupelajar.git
echo ====================================================
set /p REPO_URL="URL Repository GitHub: "

if not "%REPO_URL%"=="" (
    git remote remove origin >nul 2>&1
    git remote add origin %REPO_URL%
    echo.
    echo Mengunggah ke GitHub (git push -u origin main)...
    git push -u origin main
) else (
    echo Tidak ada URL yang dimasukkan. Anda dapat menjalankannya manual nanti.
)

echo.
echo ====================================================
echo Selesai!
echo ====================================================
pause

