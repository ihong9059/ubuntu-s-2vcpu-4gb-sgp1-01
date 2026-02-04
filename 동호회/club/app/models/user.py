# -*- coding: utf-8 -*-
"""
사용자 모델
"""
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash
from flask_login import UserMixin
from app import db, login_manager


class User(UserMixin, db.Model):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(100), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255))
    name = db.Column(db.String(50), nullable=False)
    nickname = db.Column(db.String(50), unique=True)
    phone = db.Column(db.String(20))
    profile_image = db.Column(db.String(255))
    introduction = db.Column(db.Text)
    grade = db.Column(db.String(1), default='C')  # A, B, C, D, E
    gender = db.Column(db.String(1), default='M')  # M, F
    role = db.Column(db.String(20), default='member')  # member, staff, admin
    is_active = db.Column(db.Boolean, default=True)
    is_approved = db.Column(db.Boolean, default=False)
    joined_at = db.Column(db.DateTime, default=datetime.utcnow)
    last_login = db.Column(db.DateTime)

    # 관계
    posts = db.relationship('Post', backref='author', lazy='dynamic')
    comments = db.relationship('Comment', backref='author', lazy='dynamic')
    photos = db.relationship('Photo', backref='uploader', lazy='dynamic')

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def is_admin(self):
        return self.role == 'admin'

    def is_staff(self):
        return self.role in ['admin', 'staff']

    def get_grade_display(self):
        return f'{self.grade}급'

    def get_gender_display(self):
        return '남' if self.gender == 'M' else '여'

    def get_role_display(self):
        roles = {'admin': '관리자', 'staff': '운영진', 'member': '회원'}
        return roles.get(self.role, '회원')

    def __repr__(self):
        return f'<User {self.nickname}>'


@login_manager.user_loader
def load_user(id):
    return User.query.get(int(id))
