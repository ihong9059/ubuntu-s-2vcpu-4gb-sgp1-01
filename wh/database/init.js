const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'whybiz.db');

let db = null;

// 동기 스타일 API를 위한 wrapper
const wrapper = {
  prepare: (sql) => {
    return {
      run: (...params) => {
        db.run(sql, params);
        return { lastInsertRowid: db.exec("SELECT last_insert_rowid()")[0]?.values[0]?.[0] || 0 };
      },
      get: (...params) => {
        const stmt = db.prepare(sql);
        stmt.bind(params);
        if (stmt.step()) {
          const row = stmt.getAsObject();
          stmt.free();
          return row;
        }
        stmt.free();
        return null;
      },
      all: (...params) => {
        const stmt = db.prepare(sql);
        stmt.bind(params);
        const results = [];
        while (stmt.step()) {
          results.push(stmt.getAsObject());
        }
        stmt.free();
        return results;
      }
    };
  },
  exec: (sql) => {
    db.run(sql);
  },
  save: () => {
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(dbPath, buffer);
  }
};

// 초기화
async function initDB() {
  const SQL = await initSqlJs();

  // 기존 DB 파일 로드 또는 새로 생성
  if (fs.existsSync(dbPath)) {
    const buffer = fs.readFileSync(dbPath);
    db = new SQL.Database(buffer);
  } else {
    db = new SQL.Database();
  }

  // 테이블 생성
  db.run(`
    CREATE TABLE IF NOT EXISTS gps_data (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      device_id TEXT NOT NULL,
      latitude REAL NOT NULL,
      longitude REAL NOT NULL,
      accuracy REAL,
      altitude REAL,
      speed REAL,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS sensor_data (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      device_id TEXT NOT NULL,
      sensor_type TEXT NOT NULL,
      value REAL NOT NULL,
      unit TEXT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS images (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      device_id TEXT NOT NULL,
      filename TEXT NOT NULL,
      original_name TEXT,
      mimetype TEXT,
      size INTEGER,
      caption TEXT,
      latitude REAL,
      longitude REAL,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS form_data (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      device_id TEXT NOT NULL,
      form_type TEXT NOT NULL,
      data TEXT NOT NULL,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // 인덱스 생성
  db.run(`CREATE INDEX IF NOT EXISTS idx_gps_device ON gps_data(device_id)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_gps_timestamp ON gps_data(timestamp)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_sensor_device ON sensor_data(device_id)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_sensor_type ON sensor_data(sensor_type)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_images_device ON images(device_id)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_form_device ON form_data(device_id)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_form_type ON form_data(form_type)`);

  // submissions 테이블 (태블릿에서 제출한 통합 데이터)
  db.run(`
    CREATE TABLE IF NOT EXISTS submissions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      device_id TEXT NOT NULL,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      content TEXT,
      photo TEXT,
      latitude REAL,
      longitude REAL,
      accuracy REAL,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`CREATE INDEX IF NOT EXISTS idx_submissions_device ON submissions(device_id)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_submissions_category ON submissions(category)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_submissions_timestamp ON submissions(timestamp)`);

  // 저장
  wrapper.save();

  console.log('Database initialized successfully');
  return wrapper;
}

// 주기적 저장 (30초마다)
setInterval(() => {
  if (db) {
    wrapper.save();
  }
}, 30000);

module.exports = { initDB, getDB: () => wrapper };
