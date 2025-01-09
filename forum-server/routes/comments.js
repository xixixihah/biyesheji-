const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// 获取帖子的评论列表
router.get('/post/:postId', async (req, res) => {
  try {
    const { postId } = req.params;
    const [comments] = await pool.query(`
      SELECT 
        c.*,
        u.nickname,
        u.avatar_url
      FROM comments c
      LEFT JOIN users u ON c.user_id = u.id
      WHERE c.post_id = ?
      ORDER BY c.created_at DESC
    `, [postId]);
    
    res.json({ success: true, data: comments });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 添加评论
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
    
    res.json({ success: true, data: newComment[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 删除评论
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body; // 确保只有评论作者能删除

    const [result] = await pool.execute(
      'DELETE FROM comments WHERE id = ? AND user_id = ?',
      [id, userId]
    );
    
    if (result.affectedRows === 0) {
      return res.status(403).json({ 
        success: false, 
        message: '无权删除此评论' 
      });
    }
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router; 