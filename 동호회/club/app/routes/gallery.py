# -*- coding: utf-8 -*-
"""
갤러리 라우트
"""
from flask import Blueprint, render_template, redirect, url_for, flash, request, current_app
from flask_login import login_required, current_user
from werkzeug.utils import secure_filename
from app import db
from app.models.photo import Album, Photo
import os
import uuid

gallery_bp = Blueprint('gallery', __name__)


def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in current_app.config['ALLOWED_EXTENSIONS']


@gallery_bp.route('/')
@login_required
def index():
    page = request.args.get('page', 1, type=int)
    albums = Album.query.order_by(Album.created_at.desc()).paginate(page=page, per_page=12)
    return render_template('gallery/index.html', albums=albums)


@gallery_bp.route('/album/<int:album_id>')
@login_required
def album(album_id):
    album = Album.query.get_or_404(album_id)
    photos = album.photos.order_by(Photo.uploaded_at.desc()).all()
    return render_template('gallery/album.html', album=album, photos=photos)


@gallery_bp.route('/album/create', methods=['GET', 'POST'])
@login_required
def create_album():
    if not current_user.is_staff():
        flash('앨범 생성 권한이 없습니다.', 'error')
        return redirect(url_for('gallery.index'))

    if request.method == 'POST':
        title = request.form.get('title')
        description = request.form.get('description')

        if not title:
            flash('앨범 제목을 입력해주세요.', 'error')
            return redirect(url_for('gallery.create_album'))

        album = Album(
            title=title,
            description=description,
            created_by=current_user.id
        )
        db.session.add(album)
        db.session.commit()

        flash('앨범이 생성되었습니다.', 'success')
        return redirect(url_for('gallery.album', album_id=album.id))

    return render_template('gallery/create_album.html')


@gallery_bp.route('/album/<int:album_id>/upload', methods=['GET', 'POST'])
@login_required
def upload_photos(album_id):
    album = Album.query.get_or_404(album_id)

    if request.method == 'POST':
        files = request.files.getlist('photos')

        if not files or files[0].filename == '':
            flash('파일을 선택해주세요.', 'error')
            return redirect(url_for('gallery.upload_photos', album_id=album_id))

        upload_dir = os.path.join(current_app.config['UPLOAD_FOLDER'], 'photos', str(album_id))
        os.makedirs(upload_dir, exist_ok=True)

        uploaded_count = 0
        for file in files:
            if file and allowed_file(file.filename):
                # 고유 파일명 생성
                ext = file.filename.rsplit('.', 1)[1].lower()
                filename = f"{uuid.uuid4().hex}.{ext}"
                filepath = os.path.join(upload_dir, filename)
                file.save(filepath)

                photo = Photo(
                    album_id=album_id,
                    user_id=current_user.id,
                    file_path=f"uploads/photos/{album_id}/{filename}",
                    caption=request.form.get('caption', '')
                )
                db.session.add(photo)
                uploaded_count += 1

                # 첫 번째 사진을 앨범 커버로 설정
                if not album.cover_image:
                    album.cover_image = f"uploads/photos/{album_id}/{filename}"

        db.session.commit()

        flash(f'{uploaded_count}장의 사진이 업로드되었습니다.', 'success')
        return redirect(url_for('gallery.album', album_id=album_id))

    return render_template('gallery/upload.html', album=album)


@gallery_bp.route('/photo/<int:photo_id>/delete', methods=['POST'])
@login_required
def delete_photo(photo_id):
    photo = Photo.query.get_or_404(photo_id)
    album_id = photo.album_id

    if photo.user_id != current_user.id and not current_user.is_staff():
        flash('삭제 권한이 없습니다.', 'error')
        return redirect(url_for('gallery.album', album_id=album_id))

    # 파일 삭제
    filepath = os.path.join(current_app.static_folder, photo.file_path)
    if os.path.exists(filepath):
        os.remove(filepath)

    db.session.delete(photo)
    db.session.commit()

    flash('사진이 삭제되었습니다.', 'success')
    return redirect(url_for('gallery.album', album_id=album_id))


@gallery_bp.route('/album/<int:album_id>/delete', methods=['POST'])
@login_required
def delete_album(album_id):
    album = Album.query.get_or_404(album_id)

    if not current_user.is_staff():
        flash('삭제 권한이 없습니다.', 'error')
        return redirect(url_for('gallery.album', album_id=album_id))

    db.session.delete(album)
    db.session.commit()

    flash('앨범이 삭제되었습니다.', 'success')
    return redirect(url_for('gallery.index'))
