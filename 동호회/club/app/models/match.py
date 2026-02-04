# -*- coding: utf-8 -*-
"""
대진표 모델
"""
from datetime import datetime
from app import db
import json


class Match(db.Model):
    __tablename__ = 'matches'

    id = db.Column(db.Integer, primary_key=True)
    schedule_id = db.Column(db.Integer, db.ForeignKey('schedules.id'), nullable=True)
    title = db.Column(db.String(100), nullable=False)
    match_data = db.Column(db.Text)  # JSON 형태로 저장
    num_courts = db.Column(db.Integer, default=6)
    total_matches = db.Column(db.Integer, default=0)
    total_rounds = db.Column(db.Integer, default=0)
    created_by = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # 관계
    creator = db.relationship('User', backref='matches')
    schedule = db.relationship('Schedule', backref='matches')

    def get_match_data(self):
        if self.match_data:
            return json.loads(self.match_data)
        return None

    def set_match_data(self, data):
        self.match_data = json.dumps(data, ensure_ascii=False)

    def __repr__(self):
        return f'<Match {self.title}>'
