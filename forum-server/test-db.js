const db = require('./config/db');

async function testConnection() {
    console.log('开始测试数据库连接...');
    try {
        // 测试基本连接
        console.log('正在测试基本连接...');
        const [rows] = await db.query('SELECT 1');
        console.log('基本连接测试成功！');
        console.log('测试查询结果:', rows);
        
        // 测试用户表
        console.log('\n正在测试用户表...');
        const [users] = await db.query('SELECT * FROM users LIMIT 1');
        console.log('用户表访问成功！');
        console.log('用户数据:', users);
        
        // 测试帖子表
        console.log('\n正在测试帖子表...');
        const [posts] = await db.query('SELECT * FROM posts LIMIT 1');
        console.log('帖子表访问成功！');
        console.log('帖子数据:', posts);
        
    } catch (error) {
        console.error('数据库测试失败:', error);
        console.error('错误详情:', {
            message: error.message,
            code: error.code,
            errno: error.errno,
            sqlState: error.sqlState,
            sqlMessage: error.sqlMessage
        });
    } finally {
        console.log('测试完成');
        process.exit();
    }
}

console.log('测试脚本开始执行');
testConnection(); 