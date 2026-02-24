@echo off
title SAM AI v3
cd /d "%~dp0"
echo Starting SAM AI v3 on http://localhost:5050 ...
start "" http://localhost:5050
python app.py
pause
