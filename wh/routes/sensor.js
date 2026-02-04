const express = require('express');
const router = express.Router();
const { getDB } = require('../database/init');

// 센서 데이터 저장
router.post('/', (req, res) => {
  try {
    const db = getDB();
    const { device_id, sensor_type, value, unit, timestamp } = req.body;

    if (!device_id || !sensor_type || value === undefined) {
      return res.status(400).json({ error: 'device_id, sensor_type, value are required' });
    }

    const stmt = db.prepare(`
      INSERT INTO sensor_data (device_id, sensor_type, value, unit, timestamp)
      VALUES (?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      device_id,
      sensor_type,
      value,
      unit || null,
      timestamp || new Date().toISOString()
    );

    db.save();

    res.status(201).json({
      success: true,
      id: result.lastInsertRowid,
      message: 'Sensor data saved'
    });
  } catch (error) {
    console.error('Sensor save error:', error);
    res.status(500).json({ error: error.message });
  }
});

// 센서 데이터 목록 조회
router.get('/', (req, res) => {
  try {
    const db = getDB();
    const { limit = 100, offset = 0, device_id, sensor_type } = req.query;

    let sql = 'SELECT * FROM sensor_data WHERE 1=1';
    const params = [];

    if (device_id) {
      sql += ' AND device_id = ?';
      params.push(device_id);
    }

    if (sensor_type) {
      sql += ' AND sensor_type = ?';
      params.push(sensor_type);
    }

    sql += ' ORDER BY timestamp DESC LIMIT ? OFFSET ?';
    params.push(Number(limit), Number(offset));

    const rows = db.prepare(sql).all(...params);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 센서 유형별 데이터
router.get('/type/:type', (req, res) => {
  try {
    const db = getDB();
    const { limit = 100 } = req.query;
    const rows = db.prepare(`
      SELECT * FROM sensor_data
      WHERE sensor_type = ?
      ORDER BY timestamp DESC
      LIMIT ?
    `).all(req.params.type, Number(limit));
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 디바이스별 센서 데이터
router.get('/device/:deviceId', (req, res) => {
  try {
    const db = getDB();
    const { limit = 100, sensor_type } = req.query;

    let sql = 'SELECT * FROM sensor_data WHERE device_id = ?';
    const params = [req.params.deviceId];

    if (sensor_type) {
      sql += ' AND sensor_type = ?';
      params.push(sensor_type);
    }

    sql += ' ORDER BY timestamp DESC LIMIT ?';
    params.push(Number(limit));

    const rows = db.prepare(sql).all(...params);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 센서 유형 목록
router.get('/types/list', (req, res) => {
  try {
    const db = getDB();
    const rows = db.prepare(`
      SELECT DISTINCT sensor_type, unit,
        COUNT(*) as count,
        MAX(timestamp) as last_updated
      FROM sensor_data
      GROUP BY sensor_type
      ORDER BY sensor_type
    `).all();
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
