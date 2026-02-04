const express = require('express');
const path = require('path');
const app = express();
const PORT = 6060;

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`운전면허시험 서버가 http://localhost:${PORT} 에서 실행 중입니다.`);
});
