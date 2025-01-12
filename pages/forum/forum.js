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
    posts: [],
    currentCategory: 'all',
    searchKeyword: '',
    pageNum: 1,
    pageSize: 10,
    loading: false,
    noMore: false,
    isRefreshing: false,
    searchText: '',
    selectedCategory: '全部',
    categories: ['充电桩', '换电柜', '充电柜']
  },

  onLoad() {
    this.loadPosts();
  },

  // 修改加载帖子的方法
  async loadPosts(refresh = false) {
    try {
      if (this.data.loading) return;
      
      this.setData({ loading: true });
      
      const response = await request({
        url: 'http://127.0.0.1:3000/api/posts',
        method: 'GET'
      });

      if (response.statusCode === 200 && response.data && response.data.success) {
        // 更新本地存储
        await wx.setStorage({
          key: 'posts',
          data: response.data.posts
        });
        
        this.setData({ 
          posts: response.data.posts,
          loading: false,
          noMore: false
        });
      } else {
        throw new Error(response.data?.error || '获取帖子失败');
      }
    } catch (error) {
      console.error('加载帖子失败:', error);
      // 如果服务器请求失败，尝试从本地加载
      const localPosts = wx.getStorageSync('posts') || [];
      this.setData({ 
        loading: false,
        posts: localPosts
      });
    }
  },

  // 切换分类
  switchCategory(e) {
    const category = e.currentTarget.dataset.category;
    this.setData({ 
      currentCategory: category,
      posts: [],
      pageNum: 1,
      noMore: false
    }, () => {
      this.loadPosts(true);
    });
  },

  // 搜索输入
  onSearchInput(e) {
    this.setData({
      searchText: e.detail.value
    });
  },

  // 执行搜索
  onSearch() {
    const searchText = this.data.searchText.trim();
    if (searchText) {
      // 执行搜索逻辑
      this.searchPosts(searchText);
    }
  },

  // 加载更多
  loadMorePosts() {
    if (!this.data.noMore) {
      this.loadPosts();
    }
  },

  // 下拉刷新
  async onRefresh() {
    this.setData({ isRefreshing: true });
    await this.loadPosts(true);
    this.setData({ isRefreshing: false });
  },

  // 跳转到发帖页面
  goToPost() {
    console.log('点击发帖按钮'); // 添加调试日志
    wx.navigateTo({
      url: '/pages/forum/post/post',
      success: function() {
        console.log('跳转成功');
      },
      fail: function(error) {
        console.error('跳转失败:', error);
        wx.showToast({
          title: '跳转失败',
          icon: 'none'
        });
      }
    });
  },

  // 跳转到帖子详情
  goToDetail(e) {
    const post = e.currentTarget.dataset.post;
    // 将完整的帖子数据存入缓存
    wx.setStorageSync('currentPost', post);
    
    wx.navigateTo({
      url: `/pages/forum/detail/detail?id=${post.id}`
    });
  },

  // 点赞/取消点赞
  toggleLike(e) {
    const post = e.currentTarget.dataset.post;
    const posts = this.data.posts.map(p => {
      if (p.id === post.id) {
        return {
          ...p,
          isLiked: !p.isLiked,
          likes: p.isLiked ? (p.likes - 1) : (p.likes + 1)
        };
      }
      return p;
    });
    this.setData({ posts });
  },

  // 显示帖子管理选项
  showManageOptions(e) {
    const post = e.currentTarget.dataset.post;
    wx.showActionSheet({
      itemList: ['编辑', '删除'],
      success: (res) => {
        if (res.tapIndex === 0) {
          // 编辑帖子
          wx.navigateTo({
            url: `/pages/forum/post/post?id=${post.id}`
          });
        } else if (res.tapIndex === 1) {
          // 删除帖子
          this.deletePost(post);
        }
      }
    });
  },

  // 删除帖子
  deletePost(post) {
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这条帖子吗？',
      success: (res) => {
        if (res.confirm) {
          const posts = this.data.posts.filter(p => p.id !== post.id);
          this.setData({ posts });
          wx.showToast({
            title: '删除成功',
            icon: 'success'
          });
        }
      }
    });
  },

  // 预览图片
  previewImage(e) {
    const { urls, current } = e.currentTarget.dataset;
    wx.previewImage({
      urls,
      current
    });
  },

  // 添加选择分类的方法
  selectCategory(e) {
    const category = e.currentTarget.dataset.category;
    this.setData({
      selectedCategory: category
    });

    // 根据分类筛选帖子
    this.filterPostsByCategory(category);
  },

  // 根据分类筛选帖子
  filterPostsByCategory(category) {
    const allPosts = wx.getStorageSync('posts') || [];
    
    if (category === '全部') {
      this.setData({ 
        posts: allPosts,
        noMore: false
      });
    } else {
      const filteredPosts = allPosts.filter(post => post.category === category);
      this.setData({ 
        posts: filteredPosts,
        noMore: true
      });
    }

    // 回到顶部
    wx.pageScrollTo({
      scrollTop: 0,
      duration: 300
    });
  }
}); 