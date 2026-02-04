const express = require('express');
const multer = require('multer');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 91;

// Demo 모드 설정 - 최대 보관 데이터 수
const MAX_DEMO_VISITS = 20;
const MAX_DEMO_GPS_LOGS = 100;

// 미들웨어 설정
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 정적 파일 서빙
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.static(path.join(__dirname, 'public')));

// uploads 폴더 생성
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer 설정 (파일 업로드)
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

// SQLite 데이터베이스 설정
const db = new sqlite3.Database('./uttec_sales.db', (err) => {
    if (err) {
        console.error('Database connection error:', err);
    } else {
        console.log('Connected to SQLite database');
        initDatabase();
    }
});

// 데이터베이스 테이블 초기화
function initDatabase() {
    // 방문 기록 테이블
    db.run(`CREATE TABLE IF NOT EXISTS visits (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        device_id TEXT,
        sales_name TEXT,
        customer_name TEXT,
        contact_person TEXT,
        contact_phone TEXT,
        visit_type TEXT,
        notes TEXT,
        next_visit_date TEXT,
        latitude REAL,
        longitude REAL,
        photo TEXT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // GPS 로그 테이블
    db.run(`CREATE TABLE IF NOT EXISTS gps_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        device_id TEXT,
        latitude REAL,
        longitude REAL,
        accuracy REAL,
        altitude REAL,
        speed REAL,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // 거래처 테이블
    db.run(`CREATE TABLE IF NOT EXISTS customers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE,
        contact_person TEXT,
        contact_phone TEXT,
        address TEXT,
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    console.log('Database tables initialized');
}

// Demo 모드: 오래된 데이터 자동 삭제 함수
function cleanupOldVisits() {
    db.get('SELECT COUNT(*) as count FROM visits', [], (err, row) => {
        if (err || !row) return;

        const totalCount = row.count;
        if (totalCount > MAX_DEMO_VISITS) {
            const deleteCount = totalCount - MAX_DEMO_VISITS;

            // 삭제할 레코드의 사진 파일 경로 조회
            db.all(`SELECT id, photo FROM visits ORDER BY timestamp ASC LIMIT ?`, [deleteCount], (err, rows) => {
                if (err) return;

                // 사진 파일 삭제
                rows.forEach(row => {
                    if (row.photo) {
                        const photoPath = path.join(__dirname, row.photo);
                        if (fs.existsSync(photoPath)) {
                            fs.unlinkSync(photoPath);
                            console.log(`[Demo] 사진 파일 삭제: ${row.photo}`);
                        }
                    }
                });

                // 오래된 레코드 삭제
                const ids = rows.map(r => r.id);
                db.run(`DELETE FROM visits WHERE id IN (${ids.join(',')})`, [], (err) => {
                    if (!err) {
                        console.log(`[Demo] 오래된 방문 기록 ${deleteCount}건 삭제 (최대 ${MAX_DEMO_VISITS}건 유지)`);
                    }
                });
            });
        }
    });
}

function cleanupOldGpsLogs() {
    db.get('SELECT COUNT(*) as count FROM gps_logs', [], (err, row) => {
        if (err || !row) return;

        const totalCount = row.count;
        if (totalCount > MAX_DEMO_GPS_LOGS) {
            const deleteCount = totalCount - MAX_DEMO_GPS_LOGS;

            db.run(`DELETE FROM gps_logs WHERE id IN (SELECT id FROM gps_logs ORDER BY timestamp ASC LIMIT ?)`,
                [deleteCount], (err) => {
                if (!err) {
                    console.log(`[Demo] 오래된 GPS 로그 ${deleteCount}건 삭제 (최대 ${MAX_DEMO_GPS_LOGS}건 유지)`);
                }
            });
        }
    });
}

// ==================== API 엔드포인트 ====================

// 방문 기록 저장
app.post('/api/visit', upload.single('photo'), (req, res) => {
    const {
        device_id,
        sales_name,
        customer_name,
        contact_person,
        contact_phone,
        visit_type,
        notes,
        next_visit_date,
        latitude,
        longitude
    } = req.body;

    const photo = req.file ? '/uploads/' + req.file.filename : null;

    db.run(`INSERT INTO visits
        (device_id, sales_name, customer_name, contact_person, contact_phone, visit_type, notes, next_visit_date, latitude, longitude, photo)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [device_id, sales_name, customer_name, contact_person, contact_phone, visit_type, notes, next_visit_date, latitude, longitude, photo],
        function(err) {
            if (err) {
                console.error('Error saving visit:', err);
                res.status(500).json({ error: err.message });
            } else {
                // 거래처 정보 업데이트/추가
                if (customer_name) {
                    db.run(`INSERT OR REPLACE INTO customers (name, contact_person, contact_phone, updated_at)
                        VALUES (?, ?, ?, CURRENT_TIMESTAMP)`,
                        [customer_name, contact_person, contact_phone]);
                }
                // Demo 모드: 오래된 데이터 정리
                cleanupOldVisits();
                res.json({ id: this.lastID, message: '방문 기록이 저장되었습니다' });
            }
        }
    );
});

// 방문 기록 조회
app.get('/api/visit', (req, res) => {
    const { keyword, visit_type, device_id, start_date, end_date } = req.query;

    let sql = 'SELECT * FROM visits WHERE 1=1';
    let params = [];

    if (keyword) {
        sql += ' AND (customer_name LIKE ? OR notes LIKE ? OR sales_name LIKE ?)';
        params.push(`%${keyword}%`, `%${keyword}%`, `%${keyword}%`);
    }
    if (visit_type) {
        sql += ' AND visit_type = ?';
        params.push(visit_type);
    }
    if (device_id) {
        sql += ' AND device_id = ?';
        params.push(device_id);
    }
    if (start_date) {
        sql += ' AND DATE(timestamp) >= ?';
        params.push(start_date);
    }
    if (end_date) {
        sql += ' AND DATE(timestamp) <= ?';
        params.push(end_date);
    }

    sql += ' ORDER BY timestamp DESC LIMIT 500';

    db.all(sql, params, (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json(rows);
        }
    });
});

// GPS 로그 저장
app.post('/api/gps', (req, res) => {
    const { device_id, latitude, longitude, accuracy, altitude, speed } = req.body;

    db.run(`INSERT INTO gps_logs (device_id, latitude, longitude, accuracy, altitude, speed)
        VALUES (?, ?, ?, ?, ?, ?)`,
        [device_id, latitude, longitude, accuracy, altitude, speed],
        function(err) {
            if (err) {
                res.status(500).json({ error: err.message });
            } else {
                // Demo 모드: 오래된 데이터 정리
                cleanupOldGpsLogs();
                res.json({ id: this.lastID });
            }
        }
    );
});

// GPS 로그 조회
app.get('/api/gps', (req, res) => {
    const { device_id, date } = req.query;

    let sql = 'SELECT * FROM gps_logs WHERE 1=1';
    let params = [];

    if (device_id) {
        sql += ' AND device_id = ?';
        params.push(device_id);
    }
    if (date) {
        sql += ' AND DATE(timestamp) = ?';
        params.push(date);
    }

    sql += ' ORDER BY timestamp DESC LIMIT 1000';

    db.all(sql, params, (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json(rows);
        }
    });
});

// 거래처 목록 조회
app.get('/api/customers', (req, res) => {
    const { keyword } = req.query;

    let sql = 'SELECT * FROM customers';
    let params = [];

    if (keyword) {
        sql += ' WHERE name LIKE ?';
        params.push(`%${keyword}%`);
    }

    sql += ' ORDER BY updated_at DESC';

    db.all(sql, params, (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json(rows);
        }
    });
});

// 기기 목록 조회
app.get('/api/devices', (req, res) => {
    db.all('SELECT DISTINCT device_id FROM visits ORDER BY device_id', [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json(rows);
        }
    });
});

// 영업사원 목록 조회
app.get('/api/salespeople', (req, res) => {
    db.all('SELECT DISTINCT sales_name FROM visits WHERE sales_name IS NOT NULL AND sales_name != "" ORDER BY sales_name', [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json(rows);
        }
    });
});

// 통계 조회
app.get('/api/stats', (req, res) => {
    const today = new Date().toISOString().split('T')[0];
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const stats = {};

    db.get('SELECT COUNT(*) as count FROM visits', [], (err, row) => {
        stats.total = row ? row.count : 0;

        db.get('SELECT COUNT(*) as count FROM visits WHERE DATE(timestamp) = ?', [today], (err, row) => {
            stats.today = row ? row.count : 0;

            db.get('SELECT COUNT(*) as count FROM visits WHERE DATE(timestamp) >= ?', [weekAgo], (err, row) => {
                stats.week = row ? row.count : 0;

                db.get('SELECT COUNT(*) as count FROM visits WHERE DATE(timestamp) >= ?', [monthAgo], (err, row) => {
                    stats.month = row ? row.count : 0;

                    db.get('SELECT COUNT(DISTINCT customer_name) as count FROM visits', [], (err, row) => {
                        stats.customers = row ? row.count : 0;

                        db.all(`SELECT visit_type, COUNT(*) as count FROM visits
                            WHERE DATE(timestamp) >= ? GROUP BY visit_type`, [monthAgo], (err, rows) => {
                            stats.byType = rows || [];
                            res.json(stats);
                        });
                    });
                });
            });
        });
    });
});

// 메인 페이지 - 대시보드
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 서버 시작
app.listen(PORT, '0.0.0.0', () => {
    console.log(`UTTEC 영업관리 서버가 포트 ${PORT}에서 실행 중입니다`);
    console.log(`http://localhost:${PORT}`);
});
