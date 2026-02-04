# -*- coding: utf-8 -*-
"""
일정/출석 모델
"""
from datetime import datetime
from app import db


class Schedule(db.Model):
    __tablename__ = 'schedules'

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    location = db.Column(db.String(200))
    event_date = db.Column(db.Date, nullable=False, index=True)
    start_time = db.Column(db.Time)
    end_time = db.Column(db.Time)
    event_type = db.Column(db.String(20), default='regular')  # regular, special, tournament
    created_by = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # 관계
    creator = db.relationship('User', backref='schedules')
    attendances = db.relationship('Attendance', backref='schedule', lazy='dynamic', cascade='all, delete-orphan')

    def get_type_display(self):
        types = {'regular': '정기 운동', 'special': '번개', 'tournament': '대회'}
        return types.get(self.event_type, '일정')

    def attendance_count(self):
        return self.attendances.filter_by(status='attending').count()

    def __repr__(self):
        return f'<Schedule {self.title}>'


class Attendance(db.Model):
    __tablename__ = 'attendances'

    id = db.Column(db.Integer, primary_key=True)
    schedule_id = db.Column(db.Integer, db.ForeignKey('schedules.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    status = db.Column(db.String(20), default='pending')  # attending, not_attending, pending
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # 관계
    user = db.relationship('User', backref='attendances')

    __table_args__ = (db.UniqueConstraint('schedule_id', 'user_id'),)

    def __repr__(self):
        return f'<Attendance {self.user_id} - {self.schedule_id}>'
