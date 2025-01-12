// pages/forum/detail/detail.js
Page({

    /**
     * 页面的初始数据
     */
    data: {
        post: null,
        comments: [],
        commentText: '',
        replyTo: null,
        showCommentInput: false,
        userInfo: null,
        loading: true,
        error: null,
        postId: null,
        submitting: false,
        keyboardHeight: 0,
        isIphoneX: false,
        commentCount: 0  // 确保初始值为数字类型
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {
        if (options.id) {
            this.setData({ 
                postId: options.id,
                loading: true  // 设置加载状态
            });
            this.loadPostDetail(options.id);
        } else {
            this.setData({ loading: false });
            wx.showToast({
                title: '帖子不存在',
                icon: 'none'
            });
        }
    },

    // 添加重试方法
    onRetry() {
        if (this.data.postId) {
            this.loadPostDetail(this.data.postId);
        } else {
            wx.navigateBack();
        }
    },

    // 加载帖子详情
    loadPostDetail(postId) {
        try {
            const posts = wx.getStorageSync('posts') || [];
            const post = posts.find(p => String(p.id) === String(postId));
            
            if (post) {
                // 初始化评论数组
                const comments = Array.isArray(post.comments) ? post.comments : [];
                
                this.setData({
                    post,
                    comments,
                    commentCount: comments.length,
                    loading: false  // 加载完成
                });

                console.log('帖子详情:', post);
                console.log('评论列表:', comments);
                console.log('评论数量:', comments.length);
            } else {
                this.setData({ 
                    loading: false,
                    post: null 
                });
                wx.showToast({
                    title: '帖子不存在',
                    icon: 'none'
                });
            }
        } catch (error) {
            console.error('加载帖子详情失败:', error);
            this.setData({ loading: false });
            wx.showToast({
                title: '加载失败',
                icon: 'none'
            });
        }
    },

    // 显示错误信息
    showError(message) {
        this.setData({ 
            loading: false,
            error: message 
        });
        
        wx.showToast({
            title: message,
            icon: 'none',
            duration: 2000
        });
    },

    // 显示帖子管理选项
    showManageOptions() {
        wx.showActionSheet({
            itemList: ['编辑', '删除'],
            success: (res) => {
                if (res.tapIndex === 0) {
                    this.editPost();
                } else if (res.tapIndex === 1) {
                    this.deletePost();
                }
            }
        });
    },

    // 编辑帖子
    editPost() {
        wx.navigateTo({
            url: `/pages/forum/post/post?id=${this.data.post.id}`
        });
    },

    // 删除帖子
    deletePost() {
        wx.showModal({
            title: '确认删除',
            content: '确定要删除这条帖子吗？',
            success: (res) => {
                if (res.confirm) {
                    const posts = wx.getStorageSync('posts') || [];
                    const updatedPosts = posts.filter(p => p.id !== this.data.post.id);
                    wx.setStorageSync('posts', updatedPosts);
                    
                    wx.showToast({
                        title: '删除成功',
                        icon: 'success',
                        success: () => {
                            setTimeout(() => {
                                wx.navigateBack();
                            }, 1500);
                        }
                    });
                }
            }
        });
    },

    // 点赞/取消点赞帖子
    toggleLike() {
        if (!this.data.post) return;
        
        const post = { ...this.data.post };
        post.isLiked = !post.isLiked;
        post.likes = post.isLiked ? (post.likes + 1) : (post.likes - 1);
        this.setData({ post });

        // 更新本地存储
        const posts = wx.getStorageSync('posts') || [];
        const updatedPosts = posts.map(p => 
            p.id === post.id ? post : p
        );
        wx.setStorageSync('posts', updatedPosts);
    },

    // 点赞/取消点赞评论
    toggleCommentLike(e) {
        const commentId = e.currentTarget.dataset.id;
        const comments = this.data.comments.map(c => {
            if (c.id === commentId) {
                return {
                    ...c,
                    isLiked: !c.isLiked,
                    likes: c.isLiked ? (c.likes - 1) : (c.likes + 1)
                };
            }
            return c;
        });
        this.setData({ comments });
        this.saveComments();
    },

    // 回复评论
    replyComment(e) {
        const comment = e.currentTarget.dataset.comment;
        this.setData({
            replyTo: comment,
            showCommentInput: true
        });
    },

    // 监听输入
    onCommentInput(e) {
        this.setData({
            commentText: e.detail.value
        });
    },

    // 提交评论
    async onCommentSubmit() {
        if (!this.data.commentText.trim() || this.data.submitting) {
            return;
        }

        this.setData({ submitting: true });

        try {
            const posts = wx.getStorageSync('posts') || [];
            const postIndex = posts.findIndex(p => String(p.id) === String(this.data.postId));

            if (postIndex === -1) {
                throw new Error('帖子不存在');
            }

            // 创建新评论
            const newComment = {
                id: Date.now(),
                content: this.data.commentText.trim(),
                username: '用户名',
                avatar: '/images/default-avatar.png',
                createTime: new Date().toLocaleString()
            };

            // 确保评论数组存在
            if (!Array.isArray(posts[postIndex].comments)) {
                posts[postIndex].comments = [];
            }

            // 添加新评论
            posts[postIndex].comments.unshift(newComment);

            // 更新本地存储
            wx.setStorageSync('posts', posts);

            // 更新页面数据
            const updatedComments = [newComment, ...this.data.comments];
            
            this.setData({
                comments: updatedComments,
                commentCount: updatedComments.length,
                commentText: '',
                post: {
                    ...this.data.post,
                    comments: updatedComments
                }
            });

            wx.showToast({
                title: '评论成功',
                icon: 'success'
            });

        } catch (error) {
            console.error('评论失败:', error);
            wx.showToast({
                title: '评论失败',
                icon: 'none'
            });
        } finally {
            this.setData({ submitting: false });
        }
    },

    // 保存评论到本地存储
    saveComments() {
        const allComments = wx.getStorageSync('comments') || {};
        allComments[this.data.post.id] = this.data.comments;
        wx.setStorageSync('comments', allComments);
    },

    // 预览图片
    previewImage(e) {
        const current = e.currentTarget.dataset.url;
        wx.previewImage({
            current,
            urls: this.data.post.images
        });
    },

    onUnload() {
        // 页面卸载时清除缓存的当前帖子
        wx.removeStorageSync('currentPost');
    },

    // 监听键盘高度变化
    onKeyboardHeightChange(e) {
        const { height } = e.detail;
        this.setData({
            keyboardHeight: height
        });
    }
})