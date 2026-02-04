const express = require('express');
const router = express.Router();
const { getDB } = require('../database/init');

// 폼 데이터 저장
router.post('/', (req, res) => {
  try {
    const db = getDB();
    const { device_id, form_type, data, timestamp } = req.body;

    if (!device_id || !form_type || !data) {
      return res.status(400).json({ error: 'device_id, form_type, data are required' });
    }

    const stmt = db.prepare(`
      INSERT INTO form_data (device_id, form_type, data, timestamp)
      VALUES (?, ?, ?, ?)
    `);

    const result = stmt.run(
      device_id,
      form_type,
      typeof data === 'string' ? data : JSON.stringify(data),
      timestamp || new Date().toISOString()
    );

    db.save();

    res.status(201).json({
      success: true,
      id: result.lastInsertRowid,
      message: 'Form data saved'
    });
  } catch (error) {
    console.error('Form save error:', error);
    res.status(500).json({ error: error.message });
  }
});

// 폼 데이터 목록 조회
router.get('/', (req, res) => {
  try {
    const db = getDB();
    const { limit = 100, offset = 0, device_id, form_type } = req.query;

    let sql = 'SELECT * FROM form_data WHERE 1=1';
    const params = [];

    if (device_id) {
      sql += ' AND device_id = ?';
      params.push(device_id);
    }

    if (form_type) {
      sql += ' AND form_type = ?';
      params.push(form_type);
    }

    sql += ' ORDER BY timestamp DESC LIMIT ? OFFSET ?';
    params.push(Number(limit), Number(offset));

    const rows = db.prepare(sql).all(...params);

    // JSON 파싱
    const parsed = rows.map(row => ({
      ...row,
      data: JSON.parse(row.data)
    }));

    res.json(parsed);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 폼 유형별 데이터
router.get('/type/:type', (req, res) => {
  try {
    const db = getDB();
    const { limit = 100 } = req.query;
    const rows = db.prepare(`
      SELECT * FROM form_data
      WHERE form_type = ?
      ORDER BY timestamp DESC
      LIMIT ?
    `).all(req.params.type, Number(limit));

    const parsed = rows.map(row => ({
      ...row,
      data: JSON.parse(row.data)
    }));

    res.json(parsed);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 폼 데이터 상세 조회
router.get('/:id', (req, res) => {
  try {
    const db = getDB();
    const row = db.prepare('SELECT * FROM form_data WHERE id = ?').get(req.params.id);
    if (!row) {
      return res.status(404).json({ error: 'Not found' });
    }
    res.json({
      ...row,
      data: JSON.parse(row.data)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 폼 유형 목록
router.get('/types/list', (req, res) => {
  try {
    const db = getDB();
    const rows = db.prepare(`
      SELECT DISTINCT form_type,
        COUNT(*) as count,
        MAX(timestamp) as last_updated
      FROM form_data
      GROUP BY form_type
      ORDER BY form_type
    `).all();
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
