const api = require('../../../utils/api');

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
  async submitPost() {
    if (!this.data.title.trim() || !this.data.content.trim()) {
      wx.showToast({
        title: '请填写标题和内容',
        icon: 'none'
      });
      return;
    }

    const userInfo = wx.getStorageSync('userInfo');
    if (!userInfo) {
      wx.showToast({
        title: '请先登录',
        icon: 'none'
      });
      return;
    }

    try {
      wx.showLoading({ title: '发布中...' });

      // 上传图片（如果有）
      const imageUrls = [];
      for (const tempFilePath of this.data.images) {
        const imageUrl = await api.uploadImage(tempFilePath);
        imageUrls.push(imageUrl);
      }

      const postData = {
        title: this.data.title,
        content: this.data.content,
        category: this.data.selectedCategory,
        images: imageUrls,
        user_id: userInfo.id
      };

      let res;
      if (this.data.isEdit) {
        res = await api.updatePost(this.data.postId, postData);
      } else {
        res = await api.createPost(postData);
      }

      if (res.success) {
        wx.showToast({
          title: this.data.isEdit ? '更新成功' : '发布成功',
          icon: 'success'
        });

        setTimeout(() => {
          wx.navigateBack({
            delta: 1
          });
        }, 1500);
      } else {
        throw new Error(res.error);
      }
    } catch (error) {
      console.error('发布失败:', error);
      wx.showToast({
        title: '发布失败，请重试',
        icon: 'none'
      });
    } finally {
      wx.hideLoading();
    }
  }
}); 