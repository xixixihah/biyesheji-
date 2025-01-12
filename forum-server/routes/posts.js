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
        COUNT(DISTINCT l.id) as like_count
      FROM posts p
      LEFT JOIN users u ON p.user_id = u.id
      LEFT JOIN comments c ON p.id = c.post_id
      LEFT JOIN post_likes l ON p.id = l.post_id
      GROUP BY p.id
      ORDER BY p.created_at DESC
    `);

    res.json({
      success: true,
      data: posts
    });
  } catch (error) {
    console.error('获取帖子列表失败:', error);
    res.status(500).json({
      success: false,
      message: error.message || '获取帖子列表失败'
    });
  }
});

// 获取帖子详情
router.get('/:id', async (req, res) => {
  try {
    const [posts] = await pool.query(`
      SELECT 
        p.*,
        u.nickname,
        u.avatar_url
      FROM posts p
      LEFT JOIN users u ON p.user_id = u.id
      WHERE p.id = ?
    `, [req.params.id]);

    if (posts.length === 0) {
      return res.status(404).json({
        success: false,
        message: '帖子不存在'
      });
    }

    res.json({
      success: true,
      data: posts[0]
    });
  } catch (error) {
    console.error('获取帖子详情失败:', error);
    res.status(500).json({
      success: false,
      message: error.message || '获取帖子详情失败'
    });
  }
});

// 创建帖子
router.post('/', async (req, res) => {
  try {
    const { title, content, user_id } = req.body;

    if (!title || !content || !user_id) {
      return res.status(400).json({
        success: false,
        message: '缺少必要参数'
      });
    }

    const [result] = await pool.execute(
      'INSERT INTO posts (title, content, user_id) VALUES (?, ?, ?)',
      [title, content, user_id]
    );

    res.json({
      success: true,
      data: {
        id: result.insertId,
        title,
        content,
        user_id,
        created_at: new Date()
      }
    });
  } catch (error) {
    console.error('创建帖子失败:', error);
    res.status(500).json({
      success: false,
      message: error.message || '创建帖子失败'
    });
  }
});

module.exports = router; 