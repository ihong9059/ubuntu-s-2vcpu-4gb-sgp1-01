const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { getDB } = require('../database/init');

// Multer 설정
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `img-${uniqueSuffix}${ext}`);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error('Images only (jpeg, jpg, png, gif, webp)'));
    }
  }
});

// 이미지 업로드
router.post('/', upload.single('image'), (req, res) => {
  try {
    const db = getDB();
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    const { device_id, caption, latitude, longitude, timestamp } = req.body;

    if (!device_id) {
      return res.status(400).json({ error: 'device_id is required' });
    }

    const stmt = db.prepare(`
      INSERT INTO images (device_id, filename, original_name, mimetype, size, caption, latitude, longitude, timestamp)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      device_id,
      req.file.filename,
      req.file.originalname,
      req.file.mimetype,
      req.file.size,
      caption || null,
      latitude ? Number(latitude) : null,
      longitude ? Number(longitude) : null,
      timestamp || new Date().toISOString()
    );

    db.save();

    res.status(201).json({
      success: true,
      id: result.lastInsertRowid,
      filename: req.file.filename,
      message: 'Image uploaded'
    });
  } catch (error) {
    console.error('Image upload error:', error);
    res.status(500).json({ error: error.message });
  }
});

// 이미지 목록 조회
router.get('/', (req, res) => {
  try {
    const db = getDB();
    const { limit = 50, offset = 0, device_id } = req.query;

    let sql = 'SELECT * FROM images';
    const params = [];

    if (device_id) {
      sql += ' WHERE device_id = ?';
      params.push(device_id);
    }

    sql += ' ORDER BY timestamp DESC LIMIT ? OFFSET ?';
    params.push(Number(limit), Number(offset));

    const rows = db.prepare(sql).all(...params);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 이미지 상세 조회
router.get('/:id', (req, res) => {
  try {
    const db = getDB();
    const row = db.prepare('SELECT * FROM images WHERE id = ?').get(req.params.id);
    if (!row) {
      return res.status(404).json({ error: 'Not found' });
    }
    res.json(row);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 이미지 삭제
router.delete('/:id', (req, res) => {
  try {
    const db = getDB();
    const row = db.prepare('SELECT * FROM images WHERE id = ?').get(req.params.id);
    if (!row) {
      return res.status(404).json({ error: 'Not found' });
    }

    // 파일 삭제
    const filePath = path.join(__dirname, '../uploads', row.filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // DB 레코드 삭제
    db.prepare('DELETE FROM images WHERE id = ?').run(req.params.id);
    db.save();

    res.json({ success: true, message: 'Image deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
