# -*- coding: utf-8 -*-
"""
설정 파일
"""
import os

basedir = os.path.abspath(os.path.dirname(__file__))


class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'badminton-club-secret-key-2026'
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or \
        'sqlite:///' + os.path.join(basedir, 'club.db')
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # 파일 업로드
    UPLOAD_FOLDER = os.path.join(basedir, 'static', 'uploads')
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16MB
    ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp'}

    # 페이지네이션
    POSTS_PER_PAGE = 20
    PHOTOS_PER_PAGE = 24
    MEMBERS_PER_PAGE = 30
