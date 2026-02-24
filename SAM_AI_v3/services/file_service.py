import base64
import os
import shutil
import uuid

from config import (
    UPLOADS_DIR, MAX_FILE_SIZE, ALLOWED_EXTENSIONS,
    ALLOWED_IMAGE_EXTENSIONS, MIME_TYPES,
)


def _ensure_upload_dir(conv_id):
    path = os.path.join(UPLOADS_DIR, conv_id)
    os.makedirs(path, exist_ok=True)
    return path


def get_file_type(ext):
    """Return 'image' or 'document' based on extension."""
    if ext.lower() in ALLOWED_IMAGE_EXTENSIONS:
        return 'image'
    return 'document'


def save_upload(conv_id, file_obj):
    """Save an uploaded file and return metadata dict.

    file_obj: werkzeug FileStorage object
    Returns: dict with file_id, conv_id, original_name, stored_name, mime_type, size, file_type
    """
    original_name = file_obj.filename or 'unnamed'
    ext = os.path.splitext(original_name)[1].lower()

    if ext not in ALLOWED_EXTENSIONS:
        raise ValueError(f'File type not allowed: {ext}')

    # Read content to check size
    content = file_obj.read()
    if len(content) > MAX_FILE_SIZE:
        raise ValueError(f'File too large: {len(content)} bytes (max {MAX_FILE_SIZE})')

    file_id = str(uuid.uuid4())[:8]
    stored_name = f'{file_id}_{original_name}'
    mime_type = MIME_TYPES.get(ext, 'application/octet-stream')

    upload_dir = _ensure_upload_dir(conv_id)
    file_path = os.path.join(upload_dir, stored_name)

    with open(file_path, 'wb') as f:
        f.write(content)

    return {
        'file_id': file_id,
        'conv_id': conv_id,
        'original_name': original_name,
        'stored_name': stored_name,
        'mime_type': mime_type,
        'size': len(content),
        'file_type': get_file_type(ext),
    }


def get_file_path(conv_id, stored_name):
    """Return the full filesystem path for a stored file."""
    return os.path.join(UPLOADS_DIR, conv_id, stored_name)


def get_file_base64(conv_id, stored_name):
    """Read a file and return its base64-encoded content."""
    path = get_file_path(conv_id, stored_name)
    if not os.path.exists(path):
        return None
    with open(path, 'rb') as f:
        return base64.standard_b64encode(f.read()).decode('utf-8')


def extract_text(conv_id, stored_name):
    """Extract text content from a document file.

    Supports: .txt, .md, .csv (direct read), .pdf (PyPDF2), .docx (python-docx)
    """
    path = get_file_path(conv_id, stored_name)
    if not os.path.exists(path):
        return ''

    ext = os.path.splitext(stored_name)[1].lower()

    if ext in ('.txt', '.md', '.csv'):
        with open(path, 'r', encoding='utf-8', errors='replace') as f:
            return f.read()

    if ext == '.pdf':
        try:
            from PyPDF2 import PdfReader
            reader = PdfReader(path)
            texts = []
            for page in reader.pages:
                text = page.extract_text()
                if text:
                    texts.append(text)
            return '\n'.join(texts)
        except Exception as e:
            return f'[PDF text extraction failed: {e}]'

    if ext == '.docx':
        try:
            from docx import Document
            doc = Document(path)
            return '\n'.join(p.text for p in doc.paragraphs)
        except Exception as e:
            return f'[DOCX text extraction failed: {e}]'

    return ''


def delete_uploads(conv_id):
    """Delete all uploaded files for a conversation."""
    path = os.path.join(UPLOADS_DIR, conv_id)
    if os.path.exists(path):
        shutil.rmtree(path, ignore_errors=True)
