const express = require('express');
const cors = require('cors');
const app = express();

// 错误处理中间件
const errorHandler = (err, req, res, next) => {
  console.error('服务器错误:', err);
  res.status(500).json({
    success: false,
    error: err.message || '服务器内部错误'
  });
};

// 初始化服务器
const initServer = async (port = 3000) => {
  try {
    // 添加中间件
    app.use(cors());
    app.use(express.json());
    app.use((req, res, next) => {
      console.log(`${req.method} ${req.url}`, req.body);
      next();
    });

    // 路由
    const usersRouter = require('./routes/users');
    const postsRouter = require('./routes/posts');
    app.use('/api/users', usersRouter);
    app.use('/api/posts', postsRouter);

    // 错误处理
    app.use(errorHandler);

    // 测试数据库连接
    const pool = require('./config/db');
    await pool.query('SELECT 1');
    console.log('数据库连接测试成功');

    // 尝试启动服务器
    return new Promise((resolve, reject) => {
      const server = app.listen(port)
        .on('error', (err) => {
          if (err.code === 'EADDRINUSE') {
            console.log(`端口 ${port} 被占用，尝试使用端口 ${port + 1}`);
            server.close();
            resolve(initServer(port + 1));
          } else {
            reject(err);
          }
        })
        .on('listening', () => {
          console.log(`服务器运行在端口 ${port}`);
          resolve(server);
        });
    });
  } catch (error) {
    console.error('服务器初始化失败:', error);
    throw error;
  }
};

// 启动服务器
initServer().catch(error => {
  console.error('启动失败:', error);
  process.exit(1);
}); 