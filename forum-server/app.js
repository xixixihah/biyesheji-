const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 数据库配置
const pool = require('./config/db');

// 路由
app.use('/api/posts', require('./routes/posts'));
app.use('/api/comments', require('./routes/comments'));
app.use('/api/users', require('./routes/users'));

// 测试路由
app.get('/test', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM posts');
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 错误处理
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: '服务器错误' });
});

app.listen(port, () => {
  console.log(`服务器运行在 http://localhost:${port}`);
}); 