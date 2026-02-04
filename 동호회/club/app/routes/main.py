# -*- coding: utf-8 -*-
"""
메인 라우트
"""
from flask import Blueprint, render_template
from flask_login import login_required, current_user
from app.models.post import Post
from app.models.schedule import Schedule
from app.models.photo import Album
from datetime import datetime, date

main_bp = Blueprint('main', __name__)


@main_bp.route('/')
def index():
    # 최근 공지사항
    notices = Post.query.filter_by(board_type='notice').order_by(Post.created_at.desc()).limit(5).all()

    # 최근 게시글
    recent_posts = Post.query.filter_by(board_type='free').order_by(Post.created_at.desc()).limit(5).all()

    # 다가오는 일정
    upcoming_schedules = Schedule.query.filter(
        Schedule.event_date >= date.today()
    ).order_by(Schedule.event_date).limit(5).all()

    # 최근 앨범
    recent_albums = Album.query.order_by(Album.created_at.desc()).limit(4).all()

    return render_template('main/index.html',
                           notices=notices,
                           recent_posts=recent_posts,
                           upcoming_schedules=upcoming_schedules,
                           recent_albums=recent_albums)


@main_bp.route('/about')
def about():
    return render_template('main/about.html')
