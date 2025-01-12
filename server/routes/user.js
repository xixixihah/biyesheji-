const express = require('express');
const router = express.Router();
const mysql = require('mysql2/promise');
const config = require('../config/db.config');

// 数据库连接池
const pool = mysql.createPool(config.mysql);

// 用户登录/注册
router.post('/login', async (req, res) => {
  try {
    const { openId, userInfo } = req.body;
    const conn = await pool.getConnection();
    
    try {
      await conn.beginTransaction();
      
      // 查找或创建用户
      let [rows] = await conn.execute(
        'SELECT * FROM users WHERE open_id = ?',
        [openId]
      );
      
      let userId;
      if (rows.length === 0) {
        // 新用户，创建记录
        const [result] = await conn.execute(
          'INSERT INTO users (open_id, nick_name, avatar_url, gender) VALUES (?, ?, ?, ?)',
          [openId, userInfo.nickName, userInfo.avatarUrl, userInfo.gender]
        );
        userId = result.insertId;
      } else {
        // 更新现有用户信息
        userId = rows[0].id;
        await conn.execute(
          'UPDATE users SET nick_name = ?, avatar_url = ?, gender = ? WHERE id = ?',
          [userInfo.nickName, userInfo.avatarUrl, userInfo.gender, userId]
        );
      }
      
      await conn.commit();
      
      // 返回用户信息
      [rows] = await conn.execute(
        'SELECT * FROM users WHERE id = ?',
        [userId]
      );
      
      res.json({
        code: 0,
        data: rows[0]
      });
    } catch (error) {
      await conn.rollback();
      throw error;
    } finally {
      conn.release();
    }
  } catch (error) {
    console.error('用户登录失败：', error);
    res.json({
      code: -1,
      msg: '登录失败'
    });
  }
});

// 获取用户信息
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT * FROM users WHERE id = ?',
      [req.params.id]
    );
    
    if (rows.length === 0) {
      res.json({
        code: -1,
        msg: '用户不存在'
      });
      return;
    }
    
    res.json({
      code: 0,
      data: rows[0]
    });
  } catch (error) {
    console.error('获取用户信息失败：', error);
    res.json({
      code: -1,
      msg: '获取用户信息失败'
    });
  }
});

// 更新用户信息
router.put('/:id', async (req, res) => {
  try {
    const { phone, email, carInfo } = req.body;
    const conn = await pool.getConnection();
    
    try {
      await conn.beginTransaction();
      
      // 更新用户基本信息
      await conn.execute(
        'UPDATE users SET phone = ?, email = ? WHERE id = ?',
        [phone, email, req.params.id]
      );
      
      // 更新车辆信息
      if (carInfo) {
        await conn.execute(
          'REPLACE INTO user_cars (user_id, car_type, car_number) VALUES (?, ?, ?)',
          [req.params.id, carInfo.type, carInfo.number]
        );
      }
      
      await conn.commit();
      res.json({
        code: 0,
        msg: '更新成功'
      });
    } catch (error) {
      await conn.rollback();
      throw error;
    } finally {
      conn.release();
    }
  } catch (error) {
    console.error('更新用户信息失败：', error);
    res.json({
      code: -1,
      msg: '更新失败'
    });
  }
}); 