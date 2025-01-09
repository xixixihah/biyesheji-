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

  // 提交帖子
  submitPost() {
    if (!this.data.canSubmit) return;

    const { title, content, images, selectedCategory, isEdit, postId } = this.data;

    const postData = {
      id: isEdit ? postId : Date.now(),
      title: title.trim(),
      content: content.trim(),
      images,
      category: selectedCategory,
      createTime: new Date().toLocaleString(),
      username: '用户名', // 应该使用真实用户名
      avatar: '/images/default-avatar.png', // 应该使用真实头像
      likes: 0,
      comments: 0,
      views: 0
    };

    // 保存到本地存储（实际应该保存到服务器）
    const posts = wx.getStorageSync('posts') || [];
    if (isEdit) {
      const index = posts.findIndex(p => p.id === postId);
      if (index !== -1) {
        posts[index] = { ...posts[index], ...postData };
      }
    } else {
      posts.unshift(postData);
    }
    wx.setStorageSync('posts', posts);

    wx.showToast({
      title: isEdit ? '更新成功' : '发布成功',
      icon: 'success',
      duration: 2000,
      success: () => {
        setTimeout(() => {
          wx.navigateBack();
        }, 1500);
      }
    });
  }
}); 