// pages/forum/detail/detail.js
const api = require('../../../utils/api');

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
            this.loadComments(options.id);
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
    async loadPostDetail(postId) {
        try {
            console.log('加载帖子详情:', postId); // 调试日志
            const res = await api.getPostDetail(postId);
            
            if (res.success) {
                this.setData({
                    post: res.data,
                    loading: false
                });
                
                // 加载评论
                await this.loadComments(postId);
            } else {
                throw new Error(res.error);
            }
        } catch (error) {
            console.error('加载帖子详情失败:', error);
            this.setData({ 
                loading: false,
                error: '加载失败'
            });
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

        // 修改登录检查逻辑
        const userInfo = wx.getStorageSync('userInfo');
        const openid = wx.getStorageSync('openid');
        
        console.log('当前用户信息:', userInfo); // 调试日志
        console.log('当前openid:', openid); // 调试日志

        if (!userInfo || !openid) {
            wx.showToast({
                title: '请先登录',
                icon: 'none'
            });
            return;
        }

        this.setData({ submitting: true });

        try {
            const res = await api.createComment({
                postId: this.data.postId,
                userId: userInfo.id || openid, // 使用 id 或 openid
                content: this.data.commentText.trim()
            });

            if (res.success) {
                // 重新加载评论列表
                await this.loadComments(this.data.postId);
                
                this.setData({
                    commentText: '',
                    showCommentInput: false
                });

                wx.showToast({
                    title: '评论成功',
                    icon: 'success'
                });
            } else {
                throw new Error(res.error);
            }
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
    },

    // 加载评论
    async loadComments(postId) {
        try {
            const res = await api.getComments(postId);
            console.log('获取到的评论:', res); // 调试日志
            
            if (res.success) {
                this.setData({
                    comments: res.data.map(comment => ({
                        id: comment.id,
                        content: comment.content,
                        created_at: comment.created_at,
                        user: {
                            nickname: comment.nickname,
                            avatar_url: comment.avatar_url
                        }
                    })),
                    commentCount: res.data.length
                });
            } else {
                throw new Error(res.error);
            }
        } catch (error) {
            console.error('加载评论失败:', error);
            wx.showToast({
                title: '加载评论失败',
                icon: 'none'
            });
        }
    }
})