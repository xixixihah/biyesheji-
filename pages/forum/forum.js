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
    this.loadPosts(true);
  },

  // 加载帖子列表
  async loadPosts(refresh = false) {
    try {
      if (this.data.loading) return;
      
      this.setData({ loading: true });
      
      if (refresh) {
        this.setData({ pageNum: 1, noMore: false });
      }

      // 从本地存储获取帖子数据
      const posts = wx.getStorageSync('posts') || [];
      
      // 根据分类和搜索关键词过滤
      let filteredPosts = [...posts];
      
      if (this.data.currentCategory !== 'all') {
        filteredPosts = filteredPosts.filter(post => 
          post.category === this.data.currentCategory
        );
      }
      
      if (this.data.searchKeyword) {
        const keyword = this.data.searchKeyword.toLowerCase();
        filteredPosts = filteredPosts.filter(post => 
          post.title.toLowerCase().includes(keyword) || 
          post.content.toLowerCase().includes(keyword)
        );
      }

      // 按时间倒序排序
      filteredPosts.sort((a, b) => 
        new Date(b.createTime) - new Date(a.createTime)
      );

      // 分页处理
      const start = (this.data.pageNum - 1) * this.data.pageSize;
      const end = start + this.data.pageSize;
      const currentPagePosts = filteredPosts.slice(start, end);

      if (refresh) {
        this.setData({ posts: currentPagePosts });
      } else {
        this.setData({ 
          posts: [...this.data.posts, ...currentPagePosts]
        });
      }

      this.setData({ 
        loading: false,
        noMore: currentPagePosts.length < this.data.pageSize
      });
    } catch (error) {
      console.error('加载帖子失败:', error);
      this.setData({ loading: false });
      wx.showToast({
        title: '加载失败，请重试',
        icon: 'none'
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
    // 暂时移除登录检查
    wx.navigateTo({
      url: '/pages/forum/post/post'
    });
    
    /* 正式环境的代码（暂时注释掉）
    if (!this.data.userInfo) {
      wx.showToast({
        title: '请先登录',
        icon: 'none'
      });
      return;
    }
    wx.navigateTo({
      url: '/pages/forum/post/post'
    });
    */
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