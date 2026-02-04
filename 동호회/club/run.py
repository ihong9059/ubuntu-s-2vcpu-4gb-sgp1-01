# -*- coding: utf-8 -*-
"""
배드민턴 동호회 웹 서버 실행
"""
from app import create_app

app = create_app()

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=7002, debug=True)
