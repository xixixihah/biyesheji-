const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const { JWT_SECRET } = require('../middleware/auth');

// 测试路由
router.get('/test', (req, res) => {
  res.json({ success: true, message: '服务器连接正常' });
});

// 用户登录
router.post('/login', async (req, res) => {
  try {
    const { code, nickname, avatar_url } = req.body;
    
    // 查找或创建用户
    let [users] = await pool.query('SELECT * FROM users WHERE openid = ?', [code]);
    let user;

    if (users.length === 0) {
      // 创建新用户
      const [result] = await pool.execute(
        'INSERT INTO users (openid, nickname, avatar_url) VALUES (?, ?, ?)',
        [code, nickname, avatar_url]
      );
      user = {
        id: result.insertId,
        openid: code,
        nickname,
        avatar_url
      };
    } else {
      user = users[0];
      // 更新用户信息
      if (nickname || avatar_url) {
        await pool.execute(
          'UPDATE users SET nickname = ?, avatar_url = ? WHERE id = ?',
          [nickname || user.nickname, avatar_url || user.avatar_url, user.id]
        );
      }
    }

    // 生成 Token
    const token = jwt.sign(
      { 
        id: user.id,
        openid: user.openid
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      data: {
        user,
        token
      }
    });
  } catch (error) {
    console.error('登录失败:', error);
    res.status(500).json({
      success: false,
      message: error.message || '登录失败'
    });
  }
});

// 获取用户信息
router.get('/profile', auth, async (req, res) => {
  try {
    const [users] = await pool.query(
      'SELECT id, nickname, avatar_url, created_at FROM users WHERE id = ?',
      [req.user.id]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: '用户不存在'
      });
    }

    res.json({
      success: true,
      data: users[0]
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || '获取用户信息失败'
    });
  }
});

module.exports = router; 