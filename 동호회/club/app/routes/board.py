# -*- coding: utf-8 -*-
"""
게시판 라우트
"""
from flask import Blueprint, render_template, redirect, url_for, flash, request, abort
from flask_login import login_required, current_user
from app import db
from app.models.post import Post, Comment

board_bp = Blueprint('board', __name__)

BOARD_TYPES = {
    'notice': {'name': '공지사항', 'staff_only': True},
    'free': {'name': '자유게시판', 'staff_only': False},
    'intro': {'name': '가입인사', 'staff_only': False},
    'suggest': {'name': '건의사항', 'staff_only': False}
}


@board_bp.route('/<board_type>')
@login_required
def list(board_type):
    if board_type not in BOARD_TYPES:
        abort(404)

    page = request.args.get('page', 1, type=int)
    board_info = BOARD_TYPES[board_type]

    posts = Post.query.filter_by(board_type=board_type).order_by(
        Post.is_notice.desc(), Post.created_at.desc()
    ).paginate(page=page, per_page=20)

    return render_template('board/list.html',
                           board_type=board_type,
                           board_info=board_info,
                           posts=posts)


@board_bp.route('/<board_type>/<int:post_id>')
@login_required
def view(board_type, post_id):
    if board_type not in BOARD_TYPES:
        abort(404)

    post = Post.query.get_or_404(post_id)

    # 조회수 증가
    post.view_count += 1
    db.session.commit()

    comments = post.comments.order_by(Comment.created_at).all()

    return render_template('board/view.html',
                           board_type=board_type,
                           board_info=BOARD_TYPES[board_type],
                           post=post,
                           comments=comments)


@board_bp.route('/<board_type>/write', methods=['GET', 'POST'])
@login_required
def write(board_type):
    if board_type not in BOARD_TYPES:
        abort(404)

    board_info = BOARD_TYPES[board_type]

    # 공지사항은 운영진만 작성 가능
    if board_info['staff_only'] and not current_user.is_staff():
        flash('권한이 없습니다.', 'error')
        return redirect(url_for('board.list', board_type=board_type))

    if request.method == 'POST':
        title = request.form.get('title')
        content = request.form.get('content')
        is_notice = request.form.get('is_notice') == 'on' and current_user.is_staff()

        if not title or not content:
            flash('제목과 내용을 입력해주세요.', 'error')
            return redirect(url_for('board.write', board_type=board_type))

        post = Post(
            board_type=board_type,
            user_id=current_user.id,
            title=title,
            content=content,
            is_notice=is_notice
        )
        db.session.add(post)
        db.session.commit()

        flash('게시글이 작성되었습니다.', 'success')
        return redirect(url_for('board.view', board_type=board_type, post_id=post.id))

    return render_template('board/write.html',
                           board_type=board_type,
                           board_info=board_info)


@board_bp.route('/<board_type>/<int:post_id>/edit', methods=['GET', 'POST'])
@login_required
def edit(board_type, post_id):
    post = Post.query.get_or_404(post_id)

    if post.user_id != current_user.id and not current_user.is_admin():
        flash('권한이 없습니다.', 'error')
        return redirect(url_for('board.view', board_type=board_type, post_id=post_id))

    if request.method == 'POST':
        post.title = request.form.get('title')
        post.content = request.form.get('content')
        if current_user.is_staff():
            post.is_notice = request.form.get('is_notice') == 'on'
        db.session.commit()

        flash('게시글이 수정되었습니다.', 'success')
        return redirect(url_for('board.view', board_type=board_type, post_id=post_id))

    return render_template('board/edit.html',
                           board_type=board_type,
                           board_info=BOARD_TYPES[board_type],
                           post=post)


@board_bp.route('/<board_type>/<int:post_id>/delete', methods=['POST'])
@login_required
def delete(board_type, post_id):
    post = Post.query.get_or_404(post_id)

    if post.user_id != current_user.id and not current_user.is_admin():
        flash('권한이 없습니다.', 'error')
        return redirect(url_for('board.view', board_type=board_type, post_id=post_id))

    db.session.delete(post)
    db.session.commit()

    flash('게시글이 삭제되었습니다.', 'success')
    return redirect(url_for('board.list', board_type=board_type))


@board_bp.route('/<board_type>/<int:post_id>/comment', methods=['POST'])
@login_required
def add_comment(board_type, post_id):
    post = Post.query.get_or_404(post_id)
    content = request.form.get('content')

    if not content:
        flash('댓글 내용을 입력해주세요.', 'error')
        return redirect(url_for('board.view', board_type=board_type, post_id=post_id))

    comment = Comment(
        post_id=post_id,
        user_id=current_user.id,
        content=content
    )
    db.session.add(comment)
    db.session.commit()

    flash('댓글이 등록되었습니다.', 'success')
    return redirect(url_for('board.view', board_type=board_type, post_id=post_id))


@board_bp.route('/comment/<int:comment_id>/delete', methods=['POST'])
@login_required
def delete_comment(comment_id):
    comment = Comment.query.get_or_404(comment_id)
    post = comment.post

    if comment.user_id != current_user.id and not current_user.is_admin():
        flash('권한이 없습니다.', 'error')
        return redirect(url_for('board.view', board_type=post.board_type, post_id=post.id))

    db.session.delete(comment)
    db.session.commit()

    flash('댓글이 삭제되었습니다.', 'success')
    return redirect(url_for('board.view', board_type=post.board_type, post_id=post.id))
