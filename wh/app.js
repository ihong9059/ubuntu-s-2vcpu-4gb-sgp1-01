const express = require('express');
const cors = require('cors');
const path = require('path');
const { initDB } = require('./database/init');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.static(path.join(__dirname, './client')));

// Routes
app.use('/api/gps', require('./routes/gps'));
app.use('/api/sensor', require('./routes/sensor'));
app.use('/api/image', require('./routes/image'));
app.use('/api/form', require('./routes/form'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/data', require('./routes/data'));
app.use('/api/search', require('./routes/search'));

// 검색 페이지
app.get('/search', (req, res) => {
  res.sendFile(path.join(__dirname, './client/search.html'));
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Serve dashboard
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, './client/index.html'));
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message || 'Internal Server Error' });
});

// Initialize database and start server
async function start() {
  try {
    await initDB();

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`
====================================
  WhyBiz Server Started
====================================
  Local:    http://localhost:${PORT}
  Network:  http://0.0.0.0:${PORT}
====================================
  API Endpoints:
  - POST /api/gps      (GPS data)
  - POST /api/sensor   (Sensor data)
  - POST /api/image    (Image upload)
  - POST /api/form     (Form data)
  - GET  /api/dashboard/summary
  - GET  /api/dashboard/recent
====================================
      `);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

start();
