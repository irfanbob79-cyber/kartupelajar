@echo off
cd /d "%~dp0"
git config user.name "irfanbob79-cyber"
git config user.email "irfanbob79-cyber@users.noreply.github.com"
git branch -M main
git remote remove origin 2>nul
git remote add origin https://github.com/irfanbob79-cyber/kartupelajar.git
git add .
git commit -m "feat: complete student id card generator for SMKN 1 Labuhan Maringgai (CR80 RFID standard)"
git push -u origin main
