const express = require('express');
const router = express.Router();
const { getDB } = require('../database/init');

// GPS 데이터 저장
router.post('/', (req, res) => {
  try {
    const db = getDB();
    const { device_id, latitude, longitude, accuracy, altitude, speed, timestamp } = req.body;

    if (!device_id || latitude === undefined || longitude === undefined) {
      return res.status(400).json({ error: 'device_id, latitude, longitude are required' });
    }

    const stmt = db.prepare(`
      INSERT INTO gps_data (device_id, latitude, longitude, accuracy, altitude, speed, timestamp)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      device_id,
      latitude,
      longitude,
      accuracy || null,
      altitude || null,
      speed || null,
      timestamp || new Date().toISOString()
    );

    db.save();

    res.status(201).json({
      success: true,
      id: result.lastInsertRowid,
      message: 'GPS data saved'
    });
  } catch (error) {
    console.error('GPS save error:', error);
    res.status(500).json({ error: error.message });
  }
});

// GPS 데이터 목록 조회
router.get('/', (req, res) => {
  try {
    const db = getDB();
    const { limit = 100, offset = 0, device_id } = req.query;

    let sql = 'SELECT * FROM gps_data';
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

// GPS 데이터 상세 조회
router.get('/:id', (req, res) => {
  try {
    const db = getDB();
    const row = db.prepare('SELECT * FROM gps_data WHERE id = ?').get(req.params.id);
    if (!row) {
      return res.status(404).json({ error: 'Not found' });
    }
    res.json(row);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 디바이스별 GPS 데이터
router.get('/device/:deviceId', (req, res) => {
  try {
    const db = getDB();
    const { limit = 100 } = req.query;
    const rows = db.prepare(`
      SELECT * FROM gps_data
      WHERE device_id = ?
      ORDER BY timestamp DESC
      LIMIT ?
    `).all(req.params.deviceId, Number(limit));
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 최신 GPS 데이터 (디바이스별 최신 1개씩)
router.get('/latest/all', (req, res) => {
  try {
    const db = getDB();
    const rows = db.prepare(`
      SELECT g.* FROM gps_data g
      INNER JOIN (
        SELECT device_id, MAX(timestamp) as max_ts
        FROM gps_data
        GROUP BY device_id
      ) latest ON g.device_id = latest.device_id AND g.timestamp = latest.max_ts
      ORDER BY g.timestamp DESC
    `).all();
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
