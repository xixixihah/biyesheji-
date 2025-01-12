const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');

// 配置 multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  },
  fileFilter: (req, file, cb) => {
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
      return cb(new Error('只能上传图片文件！'));
    }
    cb(null, true);
  }
}).single('image');

// 上传图片
router.post('/image', (req, res) => {
  upload(req, res, function(err) {
    if (err) {
      console.error('上传错误:', err); // 调试日志
      return res.status(400).json({
        success: false,
        error: err.message
      });
    }

    if (!req.file) {
      console.error('没有文件被上传'); // 调试日志
      return res.status(400).json({
        success: false,
        error: '请选择要上传的图片'
      });
    }

    try {
      console.log('文件信息:', req.file); // 调试日志
      const imageUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
      console.log('生成的图片URL:', imageUrl); // 调试日志
      
      res.json({
        success: true,
        data: {
          url: imageUrl
        }
      });
    } catch (error) {
      console.error('处理上传文件错误:', error); // 调试日志
      res.status(500).json({
        success: false,
        error: '服务器处理文件失败'
      });
    }
  });
});

module.exports = router; 