# -*- coding: utf-8 -*-
"""
인증 라우트
"""
from flask import Blueprint, render_template, redirect, url_for, flash, request
from flask_login import login_user, logout_user, login_required, current_user
from app import db
from app.models.user import User
from datetime import datetime

auth_bp = Blueprint('auth', __name__)


@auth_bp.route('/login', methods=['GET', 'POST'])
def login():
    if current_user.is_authenticated:
        return redirect(url_for('main.index'))

    if request.method == 'POST':
        email = request.form.get('email')
        password = request.form.get('password')
        remember = request.form.get('remember', False)

        user = User.query.filter_by(email=email).first()

        if user is None or not user.check_password(password):
            flash('이메일 또는 비밀번호가 올바르지 않습니다.', 'error')
            return redirect(url_for('auth.login'))

        if not user.is_approved:
            flash('가입 승인 대기 중입니다. 관리자 승인 후 로그인할 수 있습니다.', 'warning')
            return redirect(url_for('auth.login'))

        if not user.is_active:
            flash('비활성화된 계정입니다.', 'error')
            return redirect(url_for('auth.login'))

        login_user(user, remember=remember)
        user.last_login = datetime.utcnow()
        db.session.commit()

        next_page = request.args.get('next')
        if next_page:
            return redirect(next_page)
        return redirect(url_for('main.index'))

    return render_template('auth/login.html')


@auth_bp.route('/register', methods=['GET', 'POST'])
def register():
    if current_user.is_authenticated:
        return redirect(url_for('main.index'))

    if request.method == 'POST':
        email = request.form.get('email')
        password = request.form.get('password')
        password2 = request.form.get('password2')
        name = request.form.get('name')
        nickname = request.form.get('nickname')
        phone = request.form.get('phone')
        gender = request.form.get('gender', 'M')
        grade = request.form.get('grade', 'C')

        # 유효성 검사
        if not all([email, password, name, nickname]):
            flash('필수 항목을 모두 입력해주세요.', 'error')
            return redirect(url_for('auth.register'))

        if password != password2:
            flash('비밀번호가 일치하지 않습니다.', 'error')
            return redirect(url_for('auth.register'))

        if User.query.filter_by(email=email).first():
            flash('이미 사용 중인 이메일입니다.', 'error')
            return redirect(url_for('auth.register'))

        if User.query.filter_by(nickname=nickname).first():
            flash('이미 사용 중인 닉네임입니다.', 'error')
            return redirect(url_for('auth.register'))

        user = User(
            email=email,
            name=name,
            nickname=nickname,
            phone=phone,
            gender=gender,
            grade=grade,
            is_approved=False  # 관리자 승인 필요
        )
        user.set_password(password)

        db.session.add(user)
        db.session.commit()

        flash('회원가입이 완료되었습니다. 관리자 승인 후 로그인할 수 있습니다.', 'success')
        return redirect(url_for('auth.login'))

    return render_template('auth/register.html')


@auth_bp.route('/logout')
@login_required
def logout():
    logout_user()
    flash('로그아웃되었습니다.', 'info')
    return redirect(url_for('main.index'))
