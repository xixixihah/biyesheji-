Page({
  data: {
    hasUserInfo: false,
    userInfo: {}
  },

  onLoad() {
    // 检查用户是否已经授权
    wx.getSetting({
      success: (res) => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称
          wx.getUserInfo({
            success: (res) => {
              this.setData({
                userInfo: res.userInfo,
                hasUserInfo: true
              })
            }
          })
        }
      }
    })
  },

  getUserProfile() {
    console.log('getUserProfile called');
    wx.getUserProfile({
      desc: '展示用户信息',
      success: (res) => {
        console.log('User info:', res.userInfo);
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        });
      },
      fail: (err) => {
        console.error('Failed to get user profile:', err);
        wx.showToast({
          title: '获取用户信息失败',
          icon: 'none'
        });
      }
    });
  }
})