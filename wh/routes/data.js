const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { getDB } = require('../database/init');

// Multer 설정
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `photo-${uniqueSuffix}${ext}`);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }
});

// POST /api/data (메인 데이터 제출)
router.post('/', upload.single('photo'), (req, res) => {
  try {
    const db = getDB();
    const { device_id, title, category, content, latitude, longitude, accuracy } = req.body;

    const photoFilename = req.file ? '/uploads/' + req.file.filename : null;

    const stmt = db.prepare(`
      INSERT INTO submissions (device_id, title, category, content, photo, latitude, longitude, accuracy)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      device_id || 'unknown',
      title || '',
      category || 'other',
      content || '',
      photoFilename,
      latitude ? Number(latitude) : null,
      longitude ? Number(longitude) : null,
      accuracy ? Number(accuracy) : null
    );

    db.save();

    res.status(201).json({
      success: true,
      id: result.lastInsertRowid,
      message: 'Data saved'
    });
  } catch (error) {
    console.error('Data save error:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/data (데이터 목록 조회)
router.get('/', (req, res) => {
  try {
    const db = getDB();
    const { keyword, category, device_id, limit = 100 } = req.query;

    let sql = 'SELECT * FROM submissions WHERE 1=1';
    const params = [];

    if (keyword) {
      sql += ' AND (title LIKE ? OR content LIKE ?)';
      params.push(`%${keyword}%`, `%${keyword}%`);
    }
    if (category) {
      sql += ' AND category = ?';
      params.push(category);
    }
    if (device_id) {
      sql += ' AND device_id = ?';
      params.push(device_id);
    }

    sql += ' ORDER BY timestamp DESC LIMIT ?';
    params.push(Number(limit));

    const rows = db.prepare(sql).all(...params);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/devices (디바이스 목록)
router.get('/devices', (req, res) => {
  try {
    const db = getDB();
    const rows = db.prepare('SELECT DISTINCT device_id FROM submissions').all();
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
