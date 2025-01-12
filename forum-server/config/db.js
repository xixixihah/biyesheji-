const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '200321',
  database: 'forum_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000
};

let pool = null;

const createPool = async (retries = 5) => {
  while (retries > 0) {
    try {
      pool = mysql.createPool(dbConfig);
      await pool.query('SELECT 1');
      console.log('数据库连接成功');
      return pool;
    } catch (error) {
      retries--;
      console.error(`数据库连接失败，剩余重试次数: ${retries}`);
      if (retries === 0) throw error;
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
  }
};

// 导出一个代理对象，自动处理重连
module.exports = new Proxy({}, {
  get: function(target, prop) {
    return async function(...args) {
      if (!pool) {
        await createPool();
      }
      try {
        return await pool[prop].apply(pool, args);
      } catch (error) {
        if (error.code === 'PROTOCOL_CONNECTION_LOST') {
          console.log('数据库连接断开，尝试重连...');
          pool = null;
          await createPool();
          return pool[prop].apply(pool, args);
        }
        throw error;
      }
    };
  }
}); 