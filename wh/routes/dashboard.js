const express = require('express');
const router = express.Router();
const { getDB } = require('../database/init');

// 전체 데이터 요약
router.get('/summary', (req, res) => {
  try {
    const db = getDB();
    const gpsCount = db.prepare('SELECT COUNT(*) as count FROM gps_data').get();
    const sensorCount = db.prepare('SELECT COUNT(*) as count FROM sensor_data').get();
    const imageCount = db.prepare('SELECT COUNT(*) as count FROM images').get();
    const formCount = db.prepare('SELECT COUNT(*) as count FROM form_data').get();

    const devices = db.prepare(`
      SELECT COUNT(DISTINCT device_id) as count FROM (
        SELECT device_id FROM gps_data
        UNION SELECT device_id FROM sensor_data
        UNION SELECT device_id FROM images
        UNION SELECT device_id FROM form_data
      )
    `).get();

    const sensorTypes = db.prepare(`
      SELECT DISTINCT sensor_type FROM sensor_data
    `).all();

    res.json({
      total: {
        gps: gpsCount?.count || 0,
        sensor: sensorCount?.count || 0,
        image: imageCount?.count || 0,
        form: formCount?.count || 0,
        devices: devices?.count || 0
      },
      sensor_types: sensorTypes.map(s => s.sensor_type)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 최근 활동 목록
router.get('/recent', (req, res) => {
  try {
    const db = getDB();
    const { limit = 20 } = req.query;

    const recentGps = db.prepare(`
      SELECT id, device_id, 'gps' as type, timestamp,
        latitude || ', ' || longitude as summary
      FROM gps_data
      ORDER BY timestamp DESC
      LIMIT ?
    `).all(Number(limit));

    const recentSensor = db.prepare(`
      SELECT id, device_id, 'sensor' as type, timestamp,
        sensor_type || ': ' || value || ' ' || COALESCE(unit, '') as summary
      FROM sensor_data
      ORDER BY timestamp DESC
      LIMIT ?
    `).all(Number(limit));

    const recentImage = db.prepare(`
      SELECT id, device_id, 'image' as type, timestamp,
        COALESCE(caption, filename) as summary, filename
      FROM images
      ORDER BY timestamp DESC
      LIMIT ?
    `).all(Number(limit));

    const recentForm = db.prepare(`
      SELECT id, device_id, 'form' as type, timestamp,
        form_type as summary
      FROM form_data
      ORDER BY timestamp DESC
      LIMIT ?
    `).all(Number(limit));

    // 모든 데이터 합치고 시간순 정렬
    const all = [...recentGps, ...recentSensor, ...recentImage, ...recentForm]
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, Number(limit));

    res.json(all);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 디바이스 목록
router.get('/devices', (req, res) => {
  try {
    const db = getDB();
    const devices = db.prepare(`
      SELECT device_id,
        (SELECT COUNT(*) FROM gps_data WHERE device_id = d.device_id) as gps_count,
        (SELECT COUNT(*) FROM sensor_data WHERE device_id = d.device_id) as sensor_count,
        (SELECT COUNT(*) FROM images WHERE device_id = d.device_id) as image_count,
        (SELECT COUNT(*) FROM form_data WHERE device_id = d.device_id) as form_count,
        (SELECT MAX(timestamp) FROM gps_data WHERE device_id = d.device_id) as last_gps,
        (SELECT MAX(timestamp) FROM sensor_data WHERE device_id = d.device_id) as last_sensor
      FROM (
        SELECT DISTINCT device_id FROM gps_data
        UNION SELECT DISTINCT device_id FROM sensor_data
        UNION SELECT DISTINCT device_id FROM images
        UNION SELECT DISTINCT device_id FROM form_data
      ) d
      ORDER BY device_id
    `).all();

    res.json(devices);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
