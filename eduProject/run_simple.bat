@echo off
chcp 65001 > nul
echo ========================================
echo   학습 스타일 테스트 (간단 버전)
echo ========================================
echo.
echo 서버를 시작합니다...
echo 브라우저에서 http://localhost:6000 으로 접속하세요.
echo.
echo 종료하려면 Ctrl+C 를 누르세요.
echo ========================================
echo.
python app_simple.py
pause
