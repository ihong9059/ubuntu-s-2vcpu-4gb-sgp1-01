# -*- coding: utf-8 -*-
"""
일정 관리 라우트
"""
from flask import Blueprint, render_template, redirect, url_for, flash, request, jsonify
from flask_login import login_required, current_user
from app import db
from app.models.schedule import Schedule, Attendance
from datetime import datetime, date

schedule_bp = Blueprint('schedule', __name__)


@schedule_bp.route('/')
@login_required
def index():
    year = request.args.get('year', date.today().year, type=int)
    month = request.args.get('month', date.today().month, type=int)

    # 해당 월의 일정
    schedules = Schedule.query.filter(
        db.extract('year', Schedule.event_date) == year,
        db.extract('month', Schedule.event_date) == month
    ).order_by(Schedule.event_date).all()

    return render_template('schedule/index.html',
                           schedules=schedules,
                           year=year,
                           month=month)


@schedule_bp.route('/create', methods=['GET', 'POST'])
@login_required
def create():
    if not current_user.is_staff():
        flash('일정 등록 권한이 없습니다.', 'error')
        return redirect(url_for('schedule.index'))

    if request.method == 'POST':
        title = request.form.get('title')
        event_date = request.form.get('event_date')
        start_time = request.form.get('start_time')
        end_time = request.form.get('end_time')
        location = request.form.get('location')
        description = request.form.get('description')
        max_participants = request.form.get('max_participants', type=int)

        if not title or not event_date:
            flash('필수 항목을 입력해주세요.', 'error')
            return redirect(url_for('schedule.create'))

        schedule = Schedule(
            title=title,
            event_date=datetime.strptime(event_date, '%Y-%m-%d').date(),
            start_time=start_time,
            end_time=end_time,
            location=location,
            description=description,
            max_participants=max_participants,
            created_by=current_user.id
        )
        db.session.add(schedule)
        db.session.commit()

        flash('일정이 등록되었습니다.', 'success')
        return redirect(url_for('schedule.view', schedule_id=schedule.id))

    return render_template('schedule/create.html')


@schedule_bp.route('/<int:schedule_id>')
@login_required
def view(schedule_id):
    schedule = Schedule.query.get_or_404(schedule_id)

    # 참석 현황
    attendances = Attendance.query.filter_by(schedule_id=schedule_id).all()
    attending = [a for a in attendances if a.status == 'attending']
    not_attending = [a for a in attendances if a.status == 'not_attending']
    maybe = [a for a in attendances if a.status == 'maybe']

    # 현재 사용자의 참석 상태
    my_attendance = Attendance.query.filter_by(
        schedule_id=schedule_id,
        user_id=current_user.id
    ).first()

    return render_template('schedule/view.html',
                           schedule=schedule,
                           attending=attending,
                           not_attending=not_attending,
                           maybe=maybe,
                           my_attendance=my_attendance)


@schedule_bp.route('/<int:schedule_id>/attend', methods=['POST'])
@login_required
def attend(schedule_id):
    schedule = Schedule.query.get_or_404(schedule_id)
    status = request.form.get('status')

    if status not in ['attending', 'not_attending', 'maybe']:
        flash('올바르지 않은 응답입니다.', 'error')
        return redirect(url_for('schedule.view', schedule_id=schedule_id))

    attendance = Attendance.query.filter_by(
        schedule_id=schedule_id,
        user_id=current_user.id
    ).first()

    if attendance:
        attendance.status = status
    else:
        attendance = Attendance(
            schedule_id=schedule_id,
            user_id=current_user.id,
            status=status
        )
        db.session.add(attendance)

    db.session.commit()

    status_text = {'attending': '참석', 'not_attending': '불참', 'maybe': '미정'}
    flash(f'{status_text[status]}으로 응답하였습니다.', 'success')
    return redirect(url_for('schedule.view', schedule_id=schedule_id))


@schedule_bp.route('/<int:schedule_id>/edit', methods=['GET', 'POST'])
@login_required
def edit(schedule_id):
    schedule = Schedule.query.get_or_404(schedule_id)

    if not current_user.is_staff():
        flash('수정 권한이 없습니다.', 'error')
        return redirect(url_for('schedule.view', schedule_id=schedule_id))

    if request.method == 'POST':
        schedule.title = request.form.get('title')
        schedule.event_date = datetime.strptime(request.form.get('event_date'), '%Y-%m-%d').date()
        schedule.start_time = request.form.get('start_time')
        schedule.end_time = request.form.get('end_time')
        schedule.location = request.form.get('location')
        schedule.description = request.form.get('description')
        schedule.max_participants = request.form.get('max_participants', type=int)

        db.session.commit()
        flash('일정이 수정되었습니다.', 'success')
        return redirect(url_for('schedule.view', schedule_id=schedule_id))

    return render_template('schedule/edit.html', schedule=schedule)


@schedule_bp.route('/<int:schedule_id>/delete', methods=['POST'])
@login_required
def delete(schedule_id):
    schedule = Schedule.query.get_or_404(schedule_id)

    if not current_user.is_staff():
        flash('삭제 권한이 없습니다.', 'error')
        return redirect(url_for('schedule.view', schedule_id=schedule_id))

    db.session.delete(schedule)
    db.session.commit()

    flash('일정이 삭제되었습니다.', 'success')
    return redirect(url_for('schedule.index'))
