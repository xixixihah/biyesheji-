const express = require('express');
const router = express.Router();
const db = require('../config/db');

// 用户注册
router.post('/register', async (req, res) => {
    try {
        const { openid, username, avatar } = req.body;
        const [result] = await db.query(
            'INSERT INTO users (openid, username, avatar) VALUES (?, ?, ?)',
            [openid, username, avatar]
        );
        res.json({ success: true, userId: result.insertId });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router; 