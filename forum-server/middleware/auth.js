const jwt = require('jsonwebtoken');

const JWT_SECRET = 'your-secret-key';  // 在实际生产环境中应该使用环境变量

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      throw new Error('未提供认证令牌');
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: '认证失败：' + error.message
    });
  }
};

module.exports = {
  auth,
  JWT_SECRET
}; 