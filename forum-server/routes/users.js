const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// 用户登录/注册
router.post('/login', async (req, res) => {
  try {
    const { openid, nickname, avatarUrl } = req.body;
    
    // 查找是否存在用户
    const [users] = await pool.query(
      'SELECT * FROM users WHERE openid = ?',
      [openid]
    );

    if (users.length > 0) {
      // 更新用户信息
      await pool.execute(
        'UPDATE users SET nickname = ?, avatar_url = ? WHERE openid = ?',
        [nickname, avatarUrl, openid]
      );
      res.json({ success: true, data: users[0] });
    } else {
      // 创建新用户
      const [result] = await pool.execute(
        'INSERT INTO users (openid, nickname, avatar_url) VALUES (?, ?, ?)',
        [openid, nickname, avatarUrl]
      );
      
      const [newUser] = await pool.query(
        'SELECT * FROM users WHERE id = ?',
        [result.insertId]
      );
      
      res.json({ success: true, data: newUser[0] });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 获取用户信息
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [users] = await pool.query(
      'SELECT id, nickname, avatar_url, created_at FROM users WHERE id = ?',
      [id]
    );
    
    if (users.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: '用户不存在' 
      });
    }
    
    res.json({ success: true, data: users[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 获取用户发布的帖子
router.get('/:id/posts', async (req, res) => {
  try {
    const { id } = req.params;
    const [posts] = await pool.query(`
      SELECT 
        p.*,
        u.nickname,
        u.avatar_url,
        COUNT(DISTINCT c.id) as comment_count,
        COUNT(DISTINCT pl.id) as like_count
      FROM posts p
      LEFT JOIN users u ON p.user_id = u.id
      LEFT JOIN comments c ON p.id = c.post_id
      LEFT JOIN post_likes pl ON p.id = pl.post_id
      WHERE p.user_id = ?
      GROUP BY p.id
      ORDER BY p.created_at DESC
    `, [id]);
    
    res.json({ success: true, data: posts });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router; 