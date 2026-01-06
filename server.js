const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const port = 3000;

// 【关键修改】这里改成了你朋友的学号
const STUDENT_ID = '239210313'; 
const db = new sqlite3.Database('treehole.db');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// 【关键修改】建表语句增加了 nickname 字段
db.serialize(() => {
    db.run("CREATE TABLE IF NOT EXISTS messages (id INTEGER PRIMARY KEY AUTOINCREMENT, nickname TEXT, content TEXT, time TEXT, likes INTEGER DEFAULT 0)");
});

const router = express.Router();

router.use(express.static(path.join(__dirname, 'public')));

router.get('/api/messages', (req, res) => {
    db.all("SELECT * FROM messages ORDER BY id DESC", (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// 【关键修改】接收 nickname 并存入数据库
router.post('/api/messages', (req, res) => {
    // 获取昵称，如果没有则默认为"神秘人"
    const { content, nickname } = req.body;
    const finalNickname = nickname || '神秘人';
    const time = new Date().toLocaleString();
    
    if (!content) return res.status(400).json({ error: "内容不能为空" });

    const stmt = db.prepare("INSERT INTO messages (nickname, content, time, likes) VALUES (?, ?, ?, 0)");
    stmt.run(finalNickname, content, time, function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ id: this.lastID, nickname: finalNickname, content, time, likes: 0 });
    });
    stmt.finalize();
});

router.delete('/api/messages/:id', (req, res) => {
    const id = req.params.id;
    db.run("DELETE FROM messages WHERE id = ?", id, function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Deleted", changes: this.changes });
    });
});

router.post('/api/messages/:id/like', (req, res) => {
    const id = req.params.id;
    db.run("UPDATE messages SET likes = likes + 1 WHERE id = ?", id, function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true });
    });
});

app.use('/' + STUDENT_ID, router);

app.listen(port, () => {
    console.log(`树洞服务器已启动: http://localhost:${port}/${STUDENT_ID}`);
});