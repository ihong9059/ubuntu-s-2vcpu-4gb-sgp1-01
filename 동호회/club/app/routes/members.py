# -*- coding: utf-8 -*-
"""
회원 관리 라우트
"""
from flask import Blueprint, render_template, redirect, url_for, flash, request, current_app
from flask_login import login_required, current_user
from werkzeug.utils import secure_filename
from app import db
from app.models.user import User
import os
import uuid

members_bp = Blueprint('members', __name__)


@members_bp.route('/')
@login_required
def index():
    page = request.args.get('page', 1, type=int)
    grade = request.args.get('grade')
    gender = request.args.get('gender')

    query = User.query.filter_by(is_approved=True, is_active=True)

    if grade:
        query = query.filter_by(grade=grade)
    if gender:
        query = query.filter_by(gender=gender)

    members = query.order_by(User.grade, User.name).paginate(page=page, per_page=30)

    # 통계
    total = User.query.filter_by(is_approved=True, is_active=True).count()
    male_count = User.query.filter_by(is_approved=True, is_active=True, gender='M').count()
    female_count = User.query.filter_by(is_approved=True, is_active=True, gender='F').count()

    return render_template('members/index.html',
                           members=members,
                           total=total,
                           male_count=male_count,
                           female_count=female_count,
                           current_grade=grade,
                           current_gender=gender)


@members_bp.route('/<int:user_id>')
@login_required
def profile(user_id):
    user = User.query.get_or_404(user_id)
    return render_template('members/profile.html', user=user)


@members_bp.route('/edit', methods=['GET', 'POST'])
@login_required
def edit_profile():
    if request.method == 'POST':
        current_user.nickname = request.form.get('nickname', current_user.nickname)
        current_user.phone = request.form.get('phone')
        current_user.introduction = request.form.get('introduction')

        # 프로필 이미지 업로드
        if 'profile_image' in request.files:
            file = request.files['profile_image']
            if file and file.filename:
                ext = file.filename.rsplit('.', 1)[1].lower()
                if ext in current_app.config['ALLOWED_EXTENSIONS']:
                    filename = f"{uuid.uuid4().hex}.{ext}"
                    upload_dir = os.path.join(current_app.config['UPLOAD_FOLDER'], 'profiles')
                    os.makedirs(upload_dir, exist_ok=True)
                    file.save(os.path.join(upload_dir, filename))
                    current_user.profile_image = f"uploads/profiles/{filename}"

        db.session.commit()
        flash('프로필이 수정되었습니다.', 'success')
        return redirect(url_for('members.profile', user_id=current_user.id))

    return render_template('members/edit.html')


@members_bp.route('/admin')
@login_required
def admin():
    if not current_user.is_admin():
        flash('관리자 권한이 필요합니다.', 'error')
        return redirect(url_for('main.index'))

    # 승인 대기 회원
    pending = User.query.filter_by(is_approved=False).all()

    # 전체 회원
    all_members = User.query.filter_by(is_approved=True).order_by(User.joined_at.desc()).all()

    return render_template('members/admin.html', pending=pending, all_members=all_members)


@members_bp.route('/approve/<int:user_id>', methods=['POST'])
@login_required
def approve(user_id):
    if not current_user.is_admin():
        flash('관리자 권한이 필요합니다.', 'error')
        return redirect(url_for('main.index'))

    user = User.query.get_or_404(user_id)
    user.is_approved = True
    db.session.commit()

    flash(f'{user.name}님의 가입이 승인되었습니다.', 'success')
    return redirect(url_for('members.admin'))


@members_bp.route('/update_role/<int:user_id>', methods=['POST'])
@login_required
def update_role(user_id):
    if not current_user.is_admin():
        flash('관리자 권한이 필요합니다.', 'error')
        return redirect(url_for('main.index'))

    user = User.query.get_or_404(user_id)
    new_role = request.form.get('role')

    if new_role in ['member', 'staff', 'admin']:
        user.role = new_role
        db.session.commit()
        flash(f'{user.name}님의 권한이 변경되었습니다.', 'success')

    return redirect(url_for('members.admin'))


@members_bp.route('/update_grade/<int:user_id>', methods=['POST'])
@login_required
def update_grade(user_id):
    if not current_user.is_staff():
        flash('권한이 없습니다.', 'error')
        return redirect(url_for('main.index'))

    user = User.query.get_or_404(user_id)
    new_grade = request.form.get('grade')

    if new_grade in ['A', 'B', 'C', 'D', 'E']:
        user.grade = new_grade
        db.session.commit()
        flash(f'{user.name}님의 등급이 변경되었습니다.', 'success')

    return redirect(url_for('members.profile', user_id=user_id))
