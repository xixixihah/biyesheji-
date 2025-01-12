const app = getApp();
const api = require('../../utils/api');

Page({
  data: {
    userInfo: null,
    isLoading: false
  },

  onLoad() {
    // 检查是否已经登录
    const userInfo = wx.getStorageSync('userInfo');
    const token = wx.getStorageSync('token');
    if (userInfo && token) {
      this.setData({ userInfo });
    }
  },

  async onGetUserInfo(e) {
    try {
      if (e.detail.userInfo) {
        this.setData({ isLoading: true });
        
        // 获取用户信息
        const userInfo = e.detail.userInfo;
        
        // 获取登录凭证
        const { code } = await wx.login();
        
        // 调用后端登录接口
        const res = await api.login({
          code,
          nickname: userInfo.nickName,
          avatar_url: userInfo.avatarUrl
        });

        if (res.success) {
          // 保存用户信息和 token
          wx.setStorageSync('userInfo', res.data.user);
          wx.setStorageSync('token', res.data.token);
          
          this.setData({ 
            userInfo: res.data.user,
            isLoading: false
          });
          
          wx.showToast({
            title: '登录成功',
            icon: 'success'
          });
        } else {
          throw new Error(res.message);
        }
      } else {
        wx.showToast({
          title: '请授权用户信息',
          icon: 'none'
        });
      }
    } catch (error) {
      console.error('登录失败:', error);
      this.setData({ isLoading: false });
      wx.showToast({
        title: error.message || '登录失败',
        icon: 'none'
      });
    }
  },

  // 退出登录
  logout() {
    wx.showModal({
      title: '提示',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          wx.removeStorageSync('userInfo');
          wx.removeStorageSync('token');
          this.setData({ userInfo: null });
          wx.showToast({
            title: '已退出登录',
            icon: 'success'
          });
        }
      }
    });
  },

  // 跳转到论坛
  goToForum() {
    wx.switchTab({
      url: '/pages/forum/forum'
    });
  }
});