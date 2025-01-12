const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// 获取帖子评论
router.get('/post/:postId', async (req, res) => {
  try {
    const [comments] = await pool.query(`
      SELECT 
        c.*,
        u.nickname,
        u.avatar_url
      FROM comments c
      LEFT JOIN users u ON c.user_id = u.id
      WHERE c.post_id = ?
      ORDER BY c.created_at DESC
    `, [req.params.postId]);
    
    res.json({ success: true, data: comments });
  } catch (error) {
    console.error('获取评论失败:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 创建评论
router.post('/', async (req, res) => {
  try {
    const { postId, userId, content } = req.body;
    const [result] = await pool.execute(
      'INSERT INTO comments (post_id, user_id, content) VALUES (?, ?, ?)',
      [postId, userId, content]
    );
    
    // 获取新创建的评论详情
    const [newComment] = await pool.query(`
      SELECT 
        c.*,
        u.nickname,
        u.avatar_url
      FROM comments c
      LEFT JOIN users u ON c.user_id = u.id
      WHERE c.id = ?
    `, [result.insertId]);
    
    res.json({ 
      success: true, 
      data: newComment[0]
    });
  } catch (error) {
    console.error('创建评论失败:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 删除评论
router.delete('/:id', async (req, res) => {
  try {
    await pool.execute(
      'DELETE FROM comments WHERE id = ? AND user_id = ?',
      [req.params.id, req.body.userId]
    );
    
    res.json({ success: true });
  } catch (error) {
    console.error('删除评论失败:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 在路由文件开头添加测试代码
router.get('/test', async (req, res) => {
  try {
    const [result] = await pool.query('SELECT 1 + 1 AS result');
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('数据库连接测试失败:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router; 