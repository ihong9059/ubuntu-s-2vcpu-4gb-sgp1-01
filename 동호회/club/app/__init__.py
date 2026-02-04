# -*- coding: utf-8 -*-
"""
Flask 앱 초기화
"""
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager
from flask_cors import CORS
from config import Config

db = SQLAlchemy()
login_manager = LoginManager()
login_manager.login_view = 'auth.login'
login_manager.login_message = '로그인이 필요합니다.'


def create_app(config_class=Config):
    app = Flask(__name__, template_folder='../templates', static_folder='../static')
    app.config.from_object(config_class)

    db.init_app(app)
    login_manager.init_app(app)
    CORS(app)

    # 블루프린트 등록
    from app.routes.main import main_bp
    from app.routes.auth import auth_bp
    from app.routes.board import board_bp
    from app.routes.gallery import gallery_bp
    from app.routes.members import members_bp
    from app.routes.schedule import schedule_bp
    from app.routes.match import match_bp

    app.register_blueprint(main_bp)
    app.register_blueprint(auth_bp, url_prefix='/auth')
    app.register_blueprint(board_bp, url_prefix='/board')
    app.register_blueprint(gallery_bp, url_prefix='/gallery')
    app.register_blueprint(members_bp, url_prefix='/members')
    app.register_blueprint(schedule_bp, url_prefix='/schedule')
    app.register_blueprint(match_bp, url_prefix='/match')

    # DB 생성
    with app.app_context():
        db.create_all()
        # 기본 관리자 생성
        from app.models.user import User
        if not User.query.filter_by(email='admin@club.com').first():
            admin = User(
                email='admin@club.com',
                name='관리자',
                nickname='관리자',
                role='admin',
                grade='A',
                gender='M',
                is_approved=True,
                is_active=True
            )
            admin.set_password('admin123')
            db.session.add(admin)
            db.session.commit()

    return app
