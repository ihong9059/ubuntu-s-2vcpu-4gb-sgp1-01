# -*- coding: utf-8 -*-
"""
사진/앨범 모델
"""
from datetime import datetime
from app import db


class Album(db.Model):
    __tablename__ = 'albums'

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    cover_image = db.Column(db.String(255))
    created_by = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # 관계
    photos = db.relationship('Photo', backref='album', lazy='dynamic', cascade='all, delete-orphan')
    creator = db.relationship('User', backref='albums')

    def photo_count(self):
        return self.photos.count()

    def __repr__(self):
        return f'<Album {self.title}>'


class Photo(db.Model):
    __tablename__ = 'photos'

    id = db.Column(db.Integer, primary_key=True)
    album_id = db.Column(db.Integer, db.ForeignKey('albums.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    file_path = db.Column(db.String(255), nullable=False)
    thumbnail_path = db.Column(db.String(255))
    caption = db.Column(db.String(500))
    taken_at = db.Column(db.DateTime)
    uploaded_at = db.Column(db.DateTime, default=datetime.utcnow)

    def __repr__(self):
        return f'<Photo {self.id}>'
