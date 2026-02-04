# -*- coding: utf-8 -*-
"""
대진표 라우트
"""
from flask import Blueprint, render_template, redirect, url_for, flash, request, jsonify
from flask_login import login_required, current_user
from app import db
from app.models.match import Match
from app.models.user import User
from datetime import datetime

match_bp = Blueprint('match', __name__)


@match_bp.route('/')
@login_required
def index():
    # 최근 대진표 목록
    matches = Match.query.order_by(Match.created_at.desc()).limit(20).all()
    return render_template('match/index.html', matches=matches)


@match_bp.route('/create')
@login_required
def create():
    if not current_user.is_staff():
        flash('대진표 생성 권한이 없습니다.', 'error')
        return redirect(url_for('match.index'))

    # 활성 회원 목록 가져오기
    members = User.query.filter_by(is_approved=True, is_active=True).order_by(User.grade, User.name).all()
    return render_template('match/create.html', members=members)


@match_bp.route('/save', methods=['POST'])
@login_required
def save():
    if not current_user.is_staff():
        return jsonify({'success': False, 'message': '권한이 없습니다.'}), 403

    data = request.get_json()

    match = Match(
        title=data.get('title', f'대진표 {datetime.now().strftime("%Y-%m-%d %H:%M")}'),
        match_data=data.get('match_data', {}),
        players_data=data.get('players_data', []),
        settings=data.get('settings', {}),
        created_by=current_user.id
    )
    db.session.add(match)
    db.session.commit()

    return jsonify({'success': True, 'match_id': match.id})


@match_bp.route('/<int:match_id>')
@login_required
def view(match_id):
    match = Match.query.get_or_404(match_id)
    return render_template('match/view.html', match=match)


@match_bp.route('/<int:match_id>/delete', methods=['POST'])
@login_required
def delete(match_id):
    match = Match.query.get_or_404(match_id)

    if not current_user.is_staff():
        flash('삭제 권한이 없습니다.', 'error')
        return redirect(url_for('match.view', match_id=match_id))

    db.session.delete(match)
    db.session.commit()

    flash('대진표가 삭제되었습니다.', 'success')
    return redirect(url_for('match.index'))
