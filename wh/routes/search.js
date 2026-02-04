const express = require('express');
const router = express.Router();
const { getDB } = require('../database/init');

// 검색 API
router.post('/', (req, res) => {
  try {
    const db = getDB();
    const { keyword, category, device_id, date_from, date_to, limit = 50 } = req.body;

    let sql = 'SELECT * FROM submissions WHERE 1=1';
    const params = [];

    // 키워드 검색 (제목, 내용)
    if (keyword) {
      sql += ' AND (title LIKE ? OR content LIKE ?)';
      params.push(`%${keyword}%`, `%${keyword}%`);
    }

    // 카테고리 필터
    if (category) {
      sql += ' AND category = ?';
      params.push(category);
    }

    // 디바이스 ID 필터
    if (device_id) {
      sql += ' AND device_id = ?';
      params.push(device_id);
    }

    // 날짜 범위 필터
    if (date_from) {
      sql += ' AND timestamp >= ?';
      params.push(date_from);
    }
    if (date_to) {
      sql += ' AND timestamp <= ?';
      params.push(date_to);
    }

    sql += ' ORDER BY timestamp DESC LIMIT ?';
    params.push(Number(limit));

    const rows = db.prepare(sql).all(...params);

    res.json({
      count: rows.length,
      results: rows
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 카테고리 목록
router.get('/categories', (req, res) => {
  try {
    const db = getDB();
    const rows = db.prepare(`
      SELECT DISTINCT category, COUNT(*) as count
      FROM submissions
      GROUP BY category
      ORDER BY category
    `).all();
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 디바이스 목록
router.get('/devices', (req, res) => {
  try {
    const db = getDB();
    const rows = db.prepare(`
      SELECT DISTINCT device_id, COUNT(*) as count
      FROM submissions
      GROUP BY device_id
      ORDER BY device_id
    `).all();
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 통계
router.get('/stats', (req, res) => {
  try {
    const db = getDB();

    const total = db.prepare('SELECT COUNT(*) as count FROM submissions').get();
    const today = db.prepare(`
      SELECT COUNT(*) as count FROM submissions
      WHERE date(timestamp) = date('now')
    `).get();
    const withPhoto = db.prepare(`
      SELECT COUNT(*) as count FROM submissions WHERE photo IS NOT NULL
    `).get();

    res.json({
      total: total?.count || 0,
      today: today?.count || 0,
      withPhoto: withPhoto?.count || 0
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
