const request = (options) => {
    return new Promise((resolve, reject) => {
        wx.request({
            ...options,
            success: (res) => resolve(res),
            fail: (err) => reject(err)
        });
    });
};

Page({
  data: {
    title: '',
    content: '',
    images: [],
    categories: ['讨论', '求助', '分享', '建议'],
    selectedCategory: '讨论',
    canSubmit: false,
    isEdit: false,
    postId: null
  },

  onLoad(options) {
    if (options.id) {
      // 编辑模式
      this.setData({ 
        isEdit: true,
        postId: options.id
      });
      this.loadPostData(options.id);
    }
  },

  // 加载帖子数据（编辑模式）
  loadPostData(id) {
    // 这里应该从本地存储或服务器获取帖子数据
    const posts = wx.getStorageSync('posts') || [];
    const post = posts.find(p => p.id === id);
    if (post) {
      this.setData({
        title: post.title,
        content: post.content,
        images: post.images || [],
        selectedCategory: post.category || '讨论'
      });
      this.checkCanSubmit();
    }
  },

  // 标题输入
  onTitleInput(e) {
    this.setData({ 
      title: e.detail.value
    });
    this.checkCanSubmit();
  },

  // 内容输入
  onContentInput(e) {
    this.setData({ 
      content: e.detail.value
    });
    this.checkCanSubmit();
  },

  // 选择分类
  selectCategory(e) {
    this.setData({
      selectedCategory: e.currentTarget.dataset.category
    });
  },

  // 选择图片
  chooseImage() {
    wx.chooseImage({
      count: 9 - this.data.images.length,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        this.setData({
          images: [...this.data.images, ...res.tempFilePaths]
        });
      }
    });
  },

  // 删除图片
  deleteImage(e) {
    const index = e.currentTarget.dataset.index;
    const images = this.data.images.filter((_, i) => i !== index);
    this.setData({ images });
  },

  // 检查是否可以提交
  checkCanSubmit() {
    const { title, content } = this.data;
    const canSubmit = title.trim() && content.trim();
    this.setData({ canSubmit });
  },

  // 发布帖子
  async submitPost() {
    try {
        if (!this.data.canSubmit) return;
        
        const { title, content, selectedCategory, images } = this.data;
        
        wx.showLoading({
            title: '发布中...'
        });

        const postData = {
            title: title.trim(),
            content: content.trim(),
            category: selectedCategory,
            images: images || [],
            user_id: 1
        };
        
        console.log('发送的数据:', postData);

        // 使用新的请求方法
        const response = await request({
            url: 'http://127.0.0.1:3000/api/posts',
            method: 'POST',
            data: postData,
            header: {
                'content-type': 'application/json'
            }
        });

        wx.hideLoading();
        console.log('完整的服务器响应:', response);

        if (response.statusCode === 200 && response.data && response.data.success) {
            console.log('发布成功，帖子数据:', response.data.post);
            
            // 更新本地存储
            const localPosts = wx.getStorageSync('posts') || [];
            localPosts.unshift(response.data.post);
            wx.setStorageSync('posts', localPosts);
            
            wx.showToast({
                title: '发布成功',
                icon: 'success'
            });
            
            setTimeout(() => {
                wx.navigateBack({
                    success: () => {
                        const pages = getCurrentPages();
                        const forumPage = pages[pages.length - 2];
                        if (forumPage) {
                            forumPage.loadPosts(true);
                        }
                    }
                });
            }, 1500);
        } else {
            throw new Error(response.data?.error || '发布失败');
        }
    } catch (error) {
        wx.hideLoading();
        console.error('发布失败详情:', error);
        wx.showToast({
            title: typeof error === 'string' ? error : (error.message || '发布失败，请重试'),
            icon: 'none',
            duration: 2000
        });
    }
  }
}); 