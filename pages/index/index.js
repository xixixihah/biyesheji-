// index.js
Page({
  data: {
    latitude: 39.908860,
    longitude: 116.397390,
    markers: [],
    searchQuery: '',
    isButtonClicked: false
  },

  onSearchInput(e) {
    console.log('Input changed:', e.detail.value);
    this.setData({
      searchQuery: e.detail.value
    });
  },

  searchLocation() {
    console.log('Search button clicked');
    const query = this.data.searchQuery;
    
    if (!query) {
      wx.showToast({
        title: '请输入搜索内容',
        icon: 'none'
      });
      return;
    }

    // 调用腾讯地图API
    wx.request({
      url: 'https://apis.map.qq.com/ws/geocoder/v1/',
      data: {
        address: query,
        key: 'CBCBZ-HR4CC-KQG2P-ASSD3-TNAO5-3VF2F', // 替换为您的腾讯地图API密钥
        output: 'json'
      },
      success: (res) => {
        console.log('Search result:', res.data);
        if (res.data.status === 0) {
          const location = res.data.result.location;
          const latitude = location.lat;
          const longitude = location.lng;

          this.setData({
            latitude: latitude,
            longitude: longitude,
            markers: [{
              id: 1,
              name: query,
              latitude: latitude,
              longitude: longitude,
              width: 30,
              height: 30
            }]
          });

          wx.showToast({
            title: '已定位到' + query,
            icon: 'success'
          });
        } else {
          wx.showToast({
            title: '未找到该地址',
            icon: 'none'
          });
        }
      },
      fail: () => {
        wx.showToast({
          title: '搜索失败',
          icon: 'none'
        });
      }
    });
  }
});
