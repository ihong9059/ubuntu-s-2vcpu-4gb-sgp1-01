const express = require('express');
const cors = require('cors');
const multer = require('multer');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 9000;

// ミドルウェア設定
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 静的ファイルサービング
app.use('/images', express.static(path.join(__dirname, './public/images')));
app.use('/uploads', express.static(path.join(__dirname, './uploads')));
app.use(express.static(path.join(__dirname, './public')));

// uploadsフォルダ作成
const uploadsDir = path.join(__dirname, './uploads');
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

// SQLiteデータベース設定
const db = new sqlite3.Database('./filming_locations.db', (err) => {
    if (err) {
        console.error('Database connection error:', err);
    } else {
        console.log('Connected to SQLite database');
        initDatabase();
    }
});

// データベーステーブル初期化
function initDatabase() {
    // ロケ地テーブル
    db.run(`CREATE TABLE IF NOT EXISTS locations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title_ko TEXT NOT NULL,
        title_ja TEXT NOT NULL,
        type TEXT CHECK(type IN ('drama', 'movie')) NOT NULL,
        year INTEGER,
        description_ko TEXT,
        description_ja TEXT,
        location_name_ko TEXT,
        location_name_ja TEXT,
        address_ko TEXT,
        address_ja TEXT,
        latitude REAL,
        longitude REAL,
        scene_image TEXT,
        thumbnail TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // 俳優テーブル
    db.run(`CREATE TABLE IF NOT EXISTS actors (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name_ko TEXT NOT NULL,
        name_ja TEXT NOT NULL,
        photo TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // ロケ地-俳優連結テーブル
    db.run(`CREATE TABLE IF NOT EXISTS location_actors (
        location_id INTEGER,
        actor_id INTEGER,
        PRIMARY KEY (location_id, actor_id),
        FOREIGN KEY (location_id) REFERENCES locations(id),
        FOREIGN KEY (actor_id) REFERENCES actors(id)
    )`);

    // ユーザー合成写真テーブル
    db.run(`CREATE TABLE IF NOT EXISTS user_photos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        location_id INTEGER,
        original_photo TEXT,
        composite_photo TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (location_id) REFERENCES locations(id)
    )`);

    console.log('データベーステーブルが初期化されました');

    // サンプルデータ追加確認
    db.get('SELECT COUNT(*) as count FROM locations', [], (err, row) => {
        if (row && row.count === 0) {
            insertSampleData();
        }
    });
}

// サンプルデータ追加
function insertSampleData() {
    console.log('サンプルデータを挿入中...');

    // 俳優データ
    const actors = [
        { name_ko: '이민호', name_ja: 'イ・ミンホ', photo: '/images/actors/lee_minho.jpg' },
        { name_ko: '김수현', name_ja: 'キム・スヒョン', photo: '/images/actors/kim_soohyun.jpg' },
        { name_ko: '박서준', name_ja: 'パク・ソジュン', photo: '/images/actors/park_seojun.jpg' },
        { name_ko: '손예진', name_ja: 'ソン・イェジン', photo: '/images/actors/son_yejin.jpg' },
        { name_ko: '전지현', name_ja: 'チョン・ジヒョン', photo: '/images/actors/jun_jihyun.jpg' },
        { name_ko: '공유', name_ja: 'コン・ユ', photo: '/images/actors/gong_yoo.jpg' },
        { name_ko: '현빈', name_ja: 'ヒョンビン', photo: '/images/actors/hyunbin.jpg' },
        { name_ko: '김태리', name_ja: 'キム・テリ', photo: '/images/actors/kim_taeri.jpg' }
    ];

    actors.forEach(actor => {
        db.run(`INSERT INTO actors (name_ko, name_ja, photo) VALUES (?, ?, ?)`,
            [actor.name_ko, actor.name_ja, actor.photo]);
    });

    // ロケ地データ
    const locations = [
        {
            title_ko: '도깨비',
            title_ja: 'トッケビ〜君がくれた愛しい日々〜',
            type: 'drama',
            year: 2016,
            description_ko: '도깨비 김신과 저승사자가 자주 등장하던 메밀꽃 밭',
            description_ja: 'トッケビのキム・シンと死神がよく登場したソバの花畑',
            location_name_ko: '강릉 주문진 방사제',
            location_name_ja: '江陵 注文津 防波堤',
            address_ko: '강원도 강릉시 주문진읍',
            address_ja: '江原道 江陵市 注文津邑',
            latitude: 37.8947,
            longitude: 128.8292,
            scene_image: '/images/scenes/goblin_scene.jpg',
            thumbnail: '/images/locations/goblin_thumb.jpg',
            actors: [6] // 공유
        },
        {
            title_ko: '사랑의 불시착',
            title_ja: '愛の不時着',
            type: 'drama',
            year: 2019,
            description_ko: '리정혁과 윤세리가 처음 만난 장소',
            description_ja: 'リ・ジョンヒョクとユン・セリが初めて出会った場所',
            location_name_ko: '스위스 이젤발트 (한국 촬영지: 정선)',
            location_name_ja: 'スイス・イーゼルヴァルト（韓国ロケ地：旌善）',
            address_ko: '강원도 정선군',
            address_ja: '江原道 旌善郡',
            latitude: 37.3807,
            longitude: 128.6608,
            scene_image: '/images/scenes/cloy_scene.jpg',
            thumbnail: '/images/locations/cloy_thumb.jpg',
            actors: [7, 4] // 현빈, 손예진
        },
        {
            title_ko: '별에서 온 그대',
            title_ja: '星から来たあなた',
            type: 'drama',
            year: 2013,
            description_ko: '도민준이 자주 가던 한옥마을',
            description_ja: 'ト・ミンジュンがよく訪れた韓屋村',
            location_name_ko: '북촌 한옥마을',
            location_name_ja: '北村韓屋村',
            address_ko: '서울특별시 종로구 계동길',
            address_ja: 'ソウル特別市 鍾路区 桂洞キル',
            latitude: 37.5826,
            longitude: 126.9850,
            scene_image: '/images/scenes/yfas_scene.jpg',
            thumbnail: '/images/locations/yfas_thumb.jpg',
            actors: [2, 5] // 김수현, 전지현
        },
        {
            title_ko: '이태원 클라쓰',
            title_ja: '梨泰院クラス',
            type: 'drama',
            year: 2020,
            description_ko: '박새로이의 단밤 포차가 있던 거리',
            description_ja: 'パク・セロイのタンバム居酒屋があった通り',
            location_name_ko: '이태원 경리단길',
            location_name_ja: '梨泰院 経理団キル',
            address_ko: '서울특별시 용산구 이태원동',
            address_ja: 'ソウル特別市 龍山区 梨泰院洞',
            latitude: 37.5340,
            longitude: 126.9870,
            scene_image: '/images/scenes/itaewon_scene.jpg',
            thumbnail: '/images/locations/itaewon_thumb.jpg',
            actors: [3] // 박서준
        },
        {
            title_ko: '더 킹: 영원의 군주',
            title_ja: 'ザ・キング：永遠の君主',
            type: 'drama',
            year: 2020,
            description_ko: '이곤이 말을 타고 다니던 대나무 숲',
            description_ja: 'イ・ゴンが馬に乗って通った竹林',
            location_name_ko: '담양 죽녹원',
            location_name_ja: '潭陽 竹緑苑',
            address_ko: '전라남도 담양군 담양읍',
            address_ja: '全羅南道 潭陽郡 潭陽邑',
            latitude: 35.3214,
            longitude: 126.9881,
            scene_image: '/images/scenes/theking_scene.jpg',
            thumbnail: '/images/locations/theking_thumb.jpg',
            actors: [1] // 이민호
        },
        {
            title_ko: '기생충',
            title_ja: 'パラサイト 半地下の家族',
            type: 'movie',
            year: 2019,
            description_ko: '기택 가족이 살던 반지하 집 골목',
            description_ja: 'ギテク家族が住んでいた半地下の家の路地',
            location_name_ko: '마포구 아현동 계단',
            location_name_ja: '麻浦区 阿峴洞 階段',
            address_ko: '서울특별시 마포구 아현동',
            address_ja: 'ソウル特別市 麻浦区 阿峴洞',
            latitude: 37.5515,
            longitude: 126.9565,
            scene_image: '/images/scenes/parasite_scene.jpg',
            thumbnail: '/images/locations/parasite_thumb.jpg',
            actors: []
        },
        {
            title_ko: '부산행',
            title_ja: '新感染 ファイナル・エクスプレス',
            type: 'movie',
            year: 2016,
            description_ko: 'KTX 열차 안 좀비 추격 장면',
            description_ja: 'KTX列車内のゾンビ追撃シーン',
            location_name_ko: '서울역 KTX 승강장',
            location_name_ja: 'ソウル駅 KTXプラットフォーム',
            address_ko: '서울특별시 용산구 한강대로',
            address_ja: 'ソウル特別市 龍山区 漢江大路',
            latitude: 37.5547,
            longitude: 126.9707,
            scene_image: '/images/scenes/traintobusan_scene.jpg',
            thumbnail: '/images/locations/traintobusan_thumb.jpg',
            actors: [6] // 공유
        },
        {
            title_ko: '스물다섯 스물하나',
            title_ja: '二十五、二十一',
            type: 'drama',
            year: 2022,
            description_ko: '나희도가 펜싱 연습을 하던 체육관',
            description_ja: 'ナ・ヒドがフェンシング練習をした体育館',
            location_name_ko: '태릉선수촌',
            location_name_ja: '泰陵選手村',
            address_ko: '서울특별시 노원구 공릉동',
            address_ja: 'ソウル特別市 蘆原区 孔陵洞',
            latitude: 37.6270,
            longitude: 127.0854,
            scene_image: '/images/scenes/2521_scene.jpg',
            thumbnail: '/images/locations/2521_thumb.jpg',
            actors: [8] // 김태리
        }
    ];

    locations.forEach(loc => {
        db.run(`INSERT INTO locations
            (title_ko, title_ja, type, year, description_ko, description_ja,
             location_name_ko, location_name_ja, address_ko, address_ja,
             latitude, longitude, scene_image, thumbnail)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [loc.title_ko, loc.title_ja, loc.type, loc.year, loc.description_ko, loc.description_ja,
             loc.location_name_ko, loc.location_name_ja, loc.address_ko, loc.address_ja,
             loc.latitude, loc.longitude, loc.scene_image, loc.thumbnail],
            function(err) {
                if (!err && loc.actors) {
                    const locationId = this.lastID;
                    loc.actors.forEach(actorId => {
                        db.run(`INSERT INTO location_actors (location_id, actor_id) VALUES (?, ?)`,
                            [locationId, actorId]);
                    });
                }
            }
        );
    });

    console.log('サンプルデータが挿入されました');
}

// ==================== APIエンドポイント ====================

// 全ロケ地リスト取得
app.get('/api/locations', (req, res) => {
    const { type, keyword } = req.query;

    let sql = `SELECT l.*,
               GROUP_CONCAT(a.name_ja) as actors_ja,
               GROUP_CONCAT(a.name_ko) as actors_ko,
               (SELECT a2.photo FROM actors a2
                JOIN location_actors la2 ON a2.id = la2.actor_id
                WHERE la2.location_id = l.id LIMIT 1) as main_actor_photo,
               (SELECT a2.name_ko FROM actors a2
                JOIN location_actors la2 ON a2.id = la2.actor_id
                WHERE la2.location_id = l.id LIMIT 1) as main_actor_name
               FROM locations l
               LEFT JOIN location_actors la ON l.id = la.location_id
               LEFT JOIN actors a ON la.actor_id = a.id
               WHERE 1=1`;
    let params = [];

    if (type) {
        sql += ' AND l.type = ?';
        params.push(type);
    }
    if (keyword) {
        sql += ' AND (l.title_ko LIKE ? OR l.title_ja LIKE ? OR l.location_name_ko LIKE ? OR l.location_name_ja LIKE ?)';
        params.push(`%${keyword}%`, `%${keyword}%`, `%${keyword}%`, `%${keyword}%`);
    }

    sql += ' GROUP BY l.id ORDER BY l.year DESC';

    db.all(sql, params, (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json(rows);
        }
    });
});

// 特定ロケ地詳細情報
app.get('/api/locations/:id', (req, res) => {
    const { id } = req.params;

    db.get(`SELECT * FROM locations WHERE id = ?`, [id], (err, location) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else if (!location) {
            res.status(404).json({ error: 'Location not found' });
        } else {
            // 関連俳優情報取得
            db.all(`SELECT a.* FROM actors a
                    JOIN location_actors la ON a.id = la.actor_id
                    WHERE la.location_id = ?`, [id], (err, actors) => {
                location.actors = actors || [];
                res.json(location);
            });
        }
    });
});

// 俳優リスト取得
app.get('/api/actors', (req, res) => {
    db.all('SELECT * FROM actors ORDER BY name_ko', [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json(rows);
        }
    });
});

// 写真アップロード（合成はクライアントで処理）
app.post('/api/upload-photo', upload.single('photo'), (req, res) => {
    try {
        const { location_id } = req.body;

        if (!req.file) {
            return res.status(400).json({ error: 'No photo uploaded' });
        }

        const originalPhoto = '/uploads/' + req.file.filename;

        // DBに保存
        db.run(`INSERT INTO user_photos (location_id, original_photo, composite_photo) VALUES (?, ?, ?)`,
            [location_id, originalPhoto, originalPhoto], function(err) {
                if (err) {
                    res.status(500).json({ error: err.message });
                } else {
                    res.json({
                        id: this.lastID,
                        photo: originalPhoto,
                        message: '写真がアップロードされました'
                    });
                }
            });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ error: error.message });
    }
});

// 合成写真保存
app.post('/api/save-composite', upload.single('composite'), (req, res) => {
    try {
        const { location_id, user_photo_id } = req.body;

        if (!req.file) {
            return res.status(400).json({ error: 'No composite image' });
        }

        const compositePath = '/uploads/' + req.file.filename;

        // 既存レコード更新または新規作成
        if (user_photo_id) {
            db.run(`UPDATE user_photos SET composite_photo = ? WHERE id = ?`,
                [compositePath, user_photo_id], function(err) {
                    res.json({ composite: compositePath, message: '合成写真が保存されました' });
                });
        } else {
            db.run(`INSERT INTO user_photos (location_id, composite_photo) VALUES (?, ?)`,
                [location_id, compositePath], function(err) {
                    res.json({ id: this.lastID, composite: compositePath, message: '合成写真が保存されました' });
                });
        }
    } catch (error) {
        console.error('Save composite error:', error);
        res.status(500).json({ error: error.message });
    }
});

// ユーザー合成写真取得
app.get('/api/user-photos', (req, res) => {
    db.all(`SELECT up.*, l.title_ja, l.location_name_ja
            FROM user_photos up
            JOIN locations l ON up.location_id = l.id
            ORDER BY up.created_at DESC
            LIMIT 50`, [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json(rows);
        }
    });
});

// メインページ
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, './public', 'index.html'));
});

// サーバー開始
app.listen(PORT, '0.0.0.0', () => {
    console.log(`韓国ロケ地ガイドサーバーがポート ${PORT} で実行中です`);
    console.log(`http://localhost:${PORT}`);
});
