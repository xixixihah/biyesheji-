const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// 获取帖子列表
router.get('/', async (req, res) => {
  try {
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
      GROUP BY p.id
      ORDER BY p.created_at DESC
    `);
    
    res.json({ success: true, data: posts });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 创建新帖子
router.post('/', async (req, res) => {
  try {
    const { title, content, category, userId } = req.body;
    const [result] = await pool.execute(
      'INSERT INTO posts (user_id, title, content, category) VALUES (?, ?, ?, ?)',
      [userId, title, content, category]
    );
    
    res.json({ success: true, postId: result.insertId });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 点赞/取消点赞
router.post('/:id/like', async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;
    
    // 检查是否已点赞
    const [likes] = await pool.query(
      'SELECT * FROM post_likes WHERE post_id = ? AND user_id = ?',
      [id, userId]
    );
    
    if (likes.length > 0) {
      // 取消点赞
      await pool.execute(
        'DELETE FROM post_likes WHERE post_id = ? AND user_id = ?',
        [id, userId]
      );
    } else {
      // 添加点赞
      await pool.execute(
        'INSERT INTO post_likes (post_id, user_id) VALUES (?, ?)',
        [id, userId]
      );
    }
    
    // 获取最新点赞数
    const [result] = await pool.query(
      'SELECT COUNT(*) as like_count FROM post_likes WHERE post_id = ?',
      [id]
    );
    
    res.json({ 
      success: true, 
      liked: likes.length === 0,
      likeCount: result[0].like_count 
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router; 