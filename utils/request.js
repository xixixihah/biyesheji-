function request(method, url, data = null) {
  console.log(`${method} ${url}`, data);

  // 获取存储的 token
  const token = wx.getStorageSync('token');
  
  return new Promise((resolve, reject) => {
    const requestTask = wx.request({
      url,
      method,
      data,
      timeout: 10000,
      header: {
        'content-type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
      },
      success: (res) => {
        console.log(`响应:`, res.data);
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(res.data);
        } else if (res.statusCode === 401) {
          // token 过期，清除存储并跳转到登录页
          wx.removeStorageSync('token');
          wx.removeStorageSync('userInfo');
          wx.navigateTo({
            url: '/pages/my/my'
          });
          reject(new Error('登录已过期，请重新登录'));
        } else {
          reject(new Error(res.data.message || '请求失败'));
        }
      },
      fail: (err) => {
        console.error('请求失败:', err);
        if (err.errMsg.includes('timeout')) {
          reject(new Error('请求超时，请检查网络'));
        } else {
          reject(new Error('连接服务器失败，请稍后重试'));
        }
      }
    });

    setTimeout(() => {
      requestTask.abort();
    }, 10000);
  });
}

module.exports = {
  get: (url) => request('GET', url),
  post: (url, data) => request('POST', url, data),
  put: (url, data) => request('PUT', url, data),
  delete: (url) => request('DELETE', url)
}; 