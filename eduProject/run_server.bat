@echo off
chcp 65001 > nul
echo ========================================
echo   메타인지 테스트 웹 서버 시작
echo ========================================
echo.
echo Flask 설치 확인 중...
pip install flask -q
echo.
echo 서버를 시작합니다...
echo 브라우저에서 http://localhost:5000 으로 접속하세요.
echo.
echo 종료하려면 Ctrl+C 를 누르세요.
echo ========================================
echo.
python app.py
pause
