Page({
  data: {
    hasUserInfo: false,
    userInfo: {
      avatarUrl: '/images/default-avatar.png',
      nickName: '未登录'
    }
  },

  onLoad() {
    // 检查是否已经登录
  },

  onChooseAvatar(e) {
    const { avatarUrl } = e.detail 
    this.setData({
      'userInfo.avatarUrl': avatarUrl,
      hasUserInfo: true
    })
  }
}) 