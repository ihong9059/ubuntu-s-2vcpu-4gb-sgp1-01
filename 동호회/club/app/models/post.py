# -*- coding: utf-8 -*-
"""
게시글 모델
"""
from datetime import datetime
from app import db


class Post(db.Model):
    __tablename__ = 'posts'

    id = db.Column(db.Integer, primary_key=True)
    board_type = db.Column(db.String(20), nullable=False, index=True)  # notice, free, intro, suggest
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    title = db.Column(db.String(200), nullable=False)
    content = db.Column(db.Text, nullable=False)
    view_count = db.Column(db.Integer, default=0)
    is_notice = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, index=True)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # 관계
    comments = db.relationship('Comment', backref='post', lazy='dynamic', cascade='all, delete-orphan')

    def get_board_name(self):
        boards = {
            'notice': '공지사항',
            'free': '자유게시판',
            'intro': '가입인사',
            'suggest': '건의사항'
        }
        return boards.get(self.board_type, '게시판')

    def __repr__(self):
        return f'<Post {self.title}>'


class Comment(db.Model):
    __tablename__ = 'comments'

    id = db.Column(db.Integer, primary_key=True)
    post_id = db.Column(db.Integer, db.ForeignKey('posts.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    content = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def __repr__(self):
        return f'<Comment {self.id}>'
