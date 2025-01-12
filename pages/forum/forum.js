const api = require('../../utils/api');

Page({
  data: {
    posts: [],
    page: 1,
    pageSize: 10,
    hasMore: true,
    isLoading: false,
    isRefreshing: false,
    showPostModal: false,
    isSubmitting: false,
    newPost: {
      title: '',
      content: ''
    }
  },

  onLoad() {
    this.loadPosts();
  },

  async loadPosts(refresh = false) {
    if (this.data.isLoading || (!refresh && !this.data.hasMore)) return;

    try {
      this.setData({ isLoading: true });

      const page = refresh ? 1 : this.data.page;
      const res = await api.getPosts({
        page,
        pageSize: this.data.pageSize
      });

      if (res.success) {
        const posts = res.data.map(post => ({
          ...post,
          created_at: this.formatTime(post.created_at)
        }));

        this.setData({
          posts: refresh ? posts : [...this.data.posts, ...posts],
          page: page + 1,
          hasMore: posts.length === this.data.pageSize,
          isLoading: false,
          isRefreshing: false
        });
      } else {
        throw new Error(res.message);
      }
    } catch (error) {
      console.error('加载帖子失败:', error);
      wx.showToast({
        title: error.message || '加载失败',
        icon: 'none'
      });
      this.setData({
        isLoading: false,
        isRefreshing: false
      });
    }
  },

  async onRefresh() {
    this.setData({ isRefreshing: true });
    await this.loadPosts(true);
  },

  loadMore() {
    this.loadPosts();
  },

  showPostModal() {
    // 检查是否登录
    const token = wx.getStorageSync('token');
    if (!token) {
      wx.showToast({
        title: '请先登录',
        icon: 'none'
      });
      return;
    }

    this.setData({ showPostModal: true });
  },

  hidePostModal() {
    this.setData({ 
      showPostModal: false,
      newPost: { title: '', content: '' }
    });
  },

  onTitleInput(e) {
    this.setData({
      'newPost.title': e.detail.value
    });
  },

  onContentInput(e) {
    this.setData({
      'newPost.content': e.detail.value
    });
  },

  async submitPost() {
    const { title, content } = this.data.newPost;
    
    if (!title.trim() || !content.trim()) {
      wx.showToast({
        title: '请填写完整内容',
        icon: 'none'
      });
      return;
    }

    try {
      this.setData({ isSubmitting: true });

      const res = await api.createPost({
        title,
        content
      });

      if (res.success) {
        wx.showToast({
          title: '发布成功',
          icon: 'success'
        });
        this.hidePostModal();
        this.loadPosts(true);
      } else {
        throw new Error(res.message);
      }
    } catch (error) {
      console.error('发布失败:', error);
      wx.showToast({
        title: error.message || '发布失败',
        icon: 'none'
      });
    } finally {
      this.setData({ isSubmitting: false });
    }
  },

  goToDetail(e) {
    const { id } = e.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/post-detail/post-detail?id=${id}`
    });
  },

  formatTime(dateStr) {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now - date;

    if (diff < 60000) { // 小于1分钟
      return '刚刚';
    } else if (diff < 3600000) { // 小于1小时
      return `${Math.floor(diff / 60000)}分钟前`;
    } else if (diff < 86400000) { // 小于24小时
      return `${Math.floor(diff / 3600000)}小时前`;
    } else {
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    }
  }
}); 