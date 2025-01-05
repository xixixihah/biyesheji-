Page({
  data: {
    feedback: ''
  },

  onInput(e) {
    this.setData({
      feedback: e.detail.value
    });
  },

  submitFeedback() {
    if (this.data.feedback.trim() === '') {
      wx.showToast({
        title: '反馈内容不能为空',
        icon: 'none'
      });
      return;
    }

    // 模拟提交反馈
    wx.showToast({
      title: '反馈提交成功',
      icon: 'success'
    });

    // 清空反馈内容
    this.setData({
      feedback: ''
    });
  }
}); 