const express = require('express');
const initSqlJs = require('sql.js');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 8585;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Database
let db;
const DB_PATH = path.join(__dirname, 'habits.db');

// Flowers collection
const FLOWERS = ['🌸', '🌺', '🌻', '🌷', '🌹', '💐', '🌼', '🏵️', '💮', '🌿', '🍀', '🌵', '🌴', '🌳', '🌲'];
const RARE_FLOWERS = ['🌈', '⭐', '💎', '👑', '🦋', '🐝'];

function getRandomFlower() {
  const isRare = Math.random() < 0.1;
  const collection = isRare ? RARE_FLOWERS : FLOWERS;
  return collection[Math.floor(Math.random() * collection.length)];
}

// Save database to file
function saveDb() {
  const data = db.export();
  const buffer = Buffer.from(data);
  fs.writeFileSync(DB_PATH, buffer);
}

// Initialize database
async function initDb() {
  const SQL = await initSqlJs();

  // Load existing database or create new
  if (fs.existsSync(DB_PATH)) {
    const fileBuffer = fs.readFileSync(DB_PATH);
    db = new SQL.Database(fileBuffer);
  } else {
    db = new SQL.Database();
  }

  // Create tables
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nickname TEXT UNIQUE NOT NULL,
      created_at TEXT DEFAULT (datetime('now')),
      total_points INTEGER DEFAULT 0,
      total_flowers INTEGER DEFAULT 0,
      current_streak INTEGER DEFAULT 0,
      longest_streak INTEGER DEFAULT 0
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS habits (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      icon TEXT DEFAULT '🌱',
      frequency TEXT DEFAULT 'daily',
      target_count INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS habit_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      habit_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      completed_at TEXT NOT NULL,
      count INTEGER DEFAULT 1,
      points_earned INTEGER DEFAULT 10,
      flower_earned TEXT,
      FOREIGN KEY (habit_id) REFERENCES habits(id),
      FOREIGN KEY (user_id) REFERENCES users(id),
      UNIQUE(habit_id, completed_at)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS garden (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      flower TEXT NOT NULL,
      earned_at TEXT DEFAULT (datetime('now')),
      habit_name TEXT,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  saveDb();
  console.log('Database initialized');
}

// Helper function to get single row
function getOne(sql, params = []) {
  const stmt = db.prepare(sql);
  stmt.bind(params);
  if (stmt.step()) {
    const row = stmt.getAsObject();
    stmt.free();
    return row;
  }
  stmt.free();
  return null;
}

// Helper function to get all rows
function getAll(sql, params = []) {
  const stmt = db.prepare(sql);
  stmt.bind(params);
  const results = [];
  while (stmt.step()) {
    results.push(stmt.getAsObject());
  }
  stmt.free();
  return results;
}

// Helper function to run SQL
function run(sql, params = []) {
  db.run(sql, params);
  saveDb();
  return db.getRowsModified();
}

// API Routes

// Get or create user by nickname
app.post('/api/user', (req, res) => {
  const { nickname } = req.body;
  if (!nickname || nickname.trim().length < 2) {
    return res.status(400).json({ error: '닉네임은 2글자 이상이어야 합니다.' });
  }

  try {
    let user = getOne('SELECT * FROM users WHERE nickname = ?', [nickname.trim()]);

    if (!user) {
      run('INSERT INTO users (nickname) VALUES (?)', [nickname.trim()]);
      user = getOne('SELECT * FROM users WHERE nickname = ?', [nickname.trim()]);
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user stats
app.get('/api/user/:id', (req, res) => {
  try {
    const user = getOne('SELECT * FROM users WHERE id = ?', [parseInt(req.params.id)]);
    if (!user) {
      return res.status(404).json({ error: '사용자를 찾을 수 없습니다.' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all habits for user
app.get('/api/habits/:userId', (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    const today = new Date().toISOString().split('T')[0];

    const habits = getAll('SELECT * FROM habits WHERE user_id = ? ORDER BY created_at DESC', [userId]);

    // Add completion info for each habit
    const habitsWithInfo = habits.map(habit => {
      const totalCompletions = getOne('SELECT COUNT(*) as count FROM habit_logs WHERE habit_id = ?', [habit.id]);
      const completedToday = getOne('SELECT COUNT(*) as count FROM habit_logs WHERE habit_id = ? AND completed_at = ?', [habit.id, today]);

      return {
        ...habit,
        total_completions: totalCompletions ? totalCompletions.count : 0,
        completed_today: completedToday ? completedToday.count : 0
      };
    });

    res.json(habitsWithInfo);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new habit
app.post('/api/habits', (req, res) => {
  const { user_id, name, icon, frequency, target_count } = req.body;

  if (!user_id || !name) {
    return res.status(400).json({ error: '사용자 ID와 습관 이름이 필요합니다.' });
  }

  try {
    run(
      'INSERT INTO habits (user_id, name, icon, frequency, target_count) VALUES (?, ?, ?, ?, ?)',
      [user_id, name, icon || '🌱', frequency || 'daily', target_count || 1]
    );

    const habit = getOne('SELECT * FROM habits WHERE user_id = ? ORDER BY id DESC LIMIT 1', [user_id]);
    res.json(habit);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete habit
app.delete('/api/habits/:id', (req, res) => {
  try {
    const habitId = parseInt(req.params.id);
    run('DELETE FROM habit_logs WHERE habit_id = ?', [habitId]);
    run('DELETE FROM habits WHERE id = ?', [habitId]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Complete habit (log)
app.post('/api/habits/:id/complete', (req, res) => {
  const habitId = parseInt(req.params.id);
  const today = new Date().toISOString().split('T')[0];

  try {
    const habit = getOne('SELECT * FROM habits WHERE id = ?', [habitId]);
    if (!habit) {
      return res.status(404).json({ error: '습관을 찾을 수 없습니다.' });
    }

    // Check if already completed today
    const existing = getOne(
      'SELECT * FROM habit_logs WHERE habit_id = ? AND completed_at = ?',
      [habitId, today]
    );

    if (existing) {
      return res.status(400).json({ error: '오늘 이미 완료했습니다!' });
    }

    // Award flower and points
    const flower = getRandomFlower();
    const points = RARE_FLOWERS.includes(flower) ? 50 : 10;

    // Insert log
    run(
      'INSERT INTO habit_logs (habit_id, user_id, completed_at, points_earned, flower_earned) VALUES (?, ?, ?, ?, ?)',
      [habitId, habit.user_id, today, points, flower]
    );

    // Add flower to garden
    run(
      'INSERT INTO garden (user_id, flower, habit_name) VALUES (?, ?, ?)',
      [habit.user_id, flower, habit.name]
    );

    // Update user stats
    run(
      `UPDATE users SET
        total_points = total_points + ?,
        total_flowers = total_flowers + 1,
        current_streak = current_streak + 1,
        longest_streak = MAX(longest_streak, current_streak + 1)
      WHERE id = ?`,
      [points, habit.user_id]
    );

    const user = getOne('SELECT * FROM users WHERE id = ?', [habit.user_id]);

    res.json({
      success: true,
      flower,
      points,
      message: RARE_FLOWERS.includes(flower) ? '🎉 희귀한 꽃을 획득했습니다!' : '꽃을 획득했습니다!',
      user
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get habit logs for calendar view
app.get('/api/habits/:id/logs', (req, res) => {
  try {
    const logs = getAll(
      'SELECT * FROM habit_logs WHERE habit_id = ? ORDER BY completed_at DESC LIMIT 365',
      [parseInt(req.params.id)]
    );
    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user's garden
app.get('/api/garden/:userId', (req, res) => {
  try {
    const flowers = getAll(
      'SELECT * FROM garden WHERE user_id = ? ORDER BY earned_at DESC LIMIT 100',
      [parseInt(req.params.userId)]
    );
    res.json(flowers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get today's progress
app.get('/api/progress/:userId', (req, res) => {
  const today = new Date().toISOString().split('T')[0];
  const userId = parseInt(req.params.userId);

  try {
    const totalHabits = getOne('SELECT COUNT(*) as count FROM habits WHERE user_id = ?', [userId]);
    const completedToday = getOne(
      'SELECT COUNT(DISTINCT habit_id) as count FROM habit_logs WHERE user_id = ? AND completed_at = ?',
      [userId, today]
    );

    const total = totalHabits ? totalHabits.count : 0;
    const completed = completedToday ? completedToday.count : 0;

    res.json({
      total,
      completed,
      percentage: total > 0 ? Math.round((completed / total) * 100) : 0
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get leaderboard
app.get('/api/leaderboard', (req, res) => {
  try {
    const leaders = getAll(
      'SELECT nickname, total_points, total_flowers, longest_streak FROM users ORDER BY total_points DESC LIMIT 10'
    );
    res.json(leaders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Daily tips
const TIPS = [
  "작은 습관부터 시작하세요. 매일 2분만 투자해도 큰 변화를 만들 수 있습니다.",
  "습관을 기존 행동에 연결하세요. '아침 커피 후 책 읽기'처럼요.",
  "환경을 바꾸면 습관이 바뀝니다. 운동복을 눈에 보이는 곳에 두세요.",
  "완벽하지 않아도 괜찮습니다. 하루를 놓쳐도 다음 날 다시 시작하세요.",
  "보상을 즉시 주세요. 습관 완료 후 자신에게 작은 선물을 주세요.",
  "습관 추적은 동기부여의 가장 좋은 방법입니다.",
  "66일 동안 지속하면 습관이 자동화됩니다.",
  "아침 시간을 활용하세요. 의지력이 가장 강할 때입니다.",
  "한 번에 하나의 습관에 집중하세요.",
  "실패는 데이터입니다. 왜 실패했는지 분석하고 개선하세요."
];

app.get('/api/tip', (req, res) => {
  const tip = TIPS[Math.floor(Math.random() * TIPS.length)];
  res.json({ tip });
});

// Serve main page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
initDb().then(() => {
  app.listen(PORT, () => {
    console.log(`🌱 습관정원 서버가 http://localhost:${PORT} 에서 실행 중입니다.`);
  });
}).catch(err => {
  console.error('Database initialization failed:', err);
});
