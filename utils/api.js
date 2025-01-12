const request = require('./request');
const API_BASE = 'http://localhost:3000/api';

module.exports = {
  // 登录接口
  login(data) {
    console.log('发送登录请求，数据:', data);
    return request.post(`${API_BASE}/users/login`, {
      code: data.code,
      nickname: data.nickname || null,
      avatar_url: data.avatar_url || null
    });
  },

  // 获取帖子列表
  getPosts(params = {}) {
    return request.get(`${API_BASE}/posts`, params);
  },

  // 获取帖子详情
  getPostDetail(id) {
    return request.get(`${API_BASE}/posts/${id}`);
  },

  // 创建帖子
  createPost(data) {
    return request.post(`${API_BASE}/posts`, data);
  },

  // 更新帖子
  updatePost(id, data) {
    return request.put(`${API_BASE}/posts/${id}`, data);
  },

  // 删除帖子
  deletePost(id) {
    return request.delete(`${API_BASE}/posts/${id}`);
  },

  // 获取评论列表
  getComments(postId) {
    return request.get(`${API_BASE}/posts/${postId}/comments`);
  },

  // 添加评论
  addComment(postId, data) {
    return request.post(`${API_BASE}/posts/${postId}/comments`, data);
  },

  // 删除评论
  deleteComment(postId, commentId) {
    return request.delete(`${API_BASE}/posts/${postId}/comments/${commentId}`);
  }
}; 