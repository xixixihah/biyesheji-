const express = require('express');
const router = express.Router();
const db = require('../config/db');

// 获取帖子列表
router.get('/', async (req, res) => {
    try {
        console.log('开始获取帖子列表...');
        
        // 测试数据库连接
        try {
            await db.query('SELECT 1');
            console.log('数据库连接测试成功');
        } catch (dbError) {
            console.error('数据库连接测试失败:', dbError);
            throw dbError;
        }
        
        // 修改查询以匹配新的表结构
        const [posts] = await db.query(`
            SELECT 
                p.*,
                u.nickname as username,
                u.avatar_url as avatar
            FROM posts p
            LEFT JOIN users u ON p.user_id = u.id
            ORDER BY p.created_at DESC
        `);
        
        console.log('查询结果:', posts);
        
        // 处理返回的数据
        const formattedPosts = posts.map(post => ({
            id: post.id,
            title: post.title,
            content: post.content,
            category: post.category,
            user_id: post.user_id,
            username: post.username || '匿名用户',
            avatar: post.avatar || '/images/default-avatar.png',
            likes: post.likes || 0,
            views: post.views || 0,
            created_at: post.created_at ? post.created_at.toISOString() : new Date().toISOString(),
            images: post.images ? JSON.parse(post.images) : []
        }));

        res.json({
            success: true,
            posts: formattedPosts
        });
    } catch (error) {
        console.error('获取帖子列表失败:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// 创建帖子
router.post('/', async (req, res) => {
    try {
        console.log('接收到创建帖子请求:', req.body);
        
        const { title, content, category, images, user_id } = req.body;
        
        // 验证必要字段
        if (!title || !content || !user_id) {
            console.log('缺少必要字段:', { title, content, user_id });
            return res.status(400).json({
                success: false,
                error: '缺少必要字段'
            });
        }

        try {
            // 插入帖子
            const [result] = await db.query(`
                INSERT INTO posts 
                (user_id, title, content, category, images) 
                VALUES (?, ?, ?, ?, ?)
            `, [
                user_id,
                title.trim(), 
                content.trim(), 
                category || '讨论', 
                JSON.stringify(images || [])
            ]);

            console.log('帖子创建成功，ID:', result.insertId);

            // 直接返回成功响应
            res.json({
                success: true,
                post: {
                    id: result.insertId,
                    user_id,
                    title: title.trim(),
                    content: content.trim(),
                    category: category || '讨论',
                    images: images || [],
                    created_at: new Date().toISOString(),
                    likes: 0,
                    views: 0,
                    username: '匿名用户',
                    avatar: '/images/default-avatar.png'
                }
            });

        } catch (dbError) {
            console.error('数据库操作失败:', dbError);
            res.status(500).json({
                success: false,
                error: dbError.sqlMessage || '数据库操作失败'
            });
        }
    } catch (error) {
        console.error('创建帖子失败:', error);
        res.status(500).json({
            success: false,
            error: error.message || '创建帖子失败'
        });
    }
});

module.exports = router; 