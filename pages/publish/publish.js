Page({
  data: {
    content: ''
  },

  onContentInput(e) {
    this.setData({
      content: e.detail.value
    });
  },

  onPublish() {
    const { content } = this.data;
    if (!content.trim()) {
      wx.showToast({
        title: '请输入内容',
        icon: 'none'
      });
      return;
    }

    // 创建新帖子
    const newPost = {
      id: Date.now(),  // 使用时间戳作为临时ID
      content: content,
      username: '匿名用户',  // 因为没有登录系统，暂时使用匿名
      time: new Date().toLocaleString(),
      comments: 0,
      likes: 0,
      views: 0
    };

    // 获取现有帖子
    let posts = wx.getStorageSync('posts') || [];
    
    // 添加新帖子到开头
    posts.unshift(newPost);
    
    // 保存到本地存储
    wx.setStorageSync('posts', posts);

    wx.showToast({
      title: '发布成功',
      icon: 'success'
    });

    // 返回上一页
    setTimeout(() => {
      wx.navigateBack({
        success: () => {
          // 通知上一页刷新数据
          const pages = getCurrentPages();
          const prevPage = pages[pages.length - 2];
          prevPage.setData({
            posts: posts
          });
        }
      });
    }, 1500);
  }
}); 