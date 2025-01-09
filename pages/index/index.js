// index.js
Page({
  data: {
    latitude: 30.2741510000,
    longitude: 120.1551510000,
    currentLocation: '正在获取位置...',
    markers: [],
    activeTab: 'all',
    searchText: '',
    recentLocations: []  // 添加最近搜索记录数组
  },

  onLoad() {
    this.getCurrentLocation()
    this.loadMarkers()
    // 加载最近搜索记录
    this.loadRecentLocations()
  },

  getCurrentLocation() {
    wx.getLocation({
      type: 'gcj02',
      success: (res) => {
        this.setData({
          latitude: res.latitude,
          longitude: res.longitude
        })
        this.getLocationName(res.latitude, res.longitude)
      },
      fail: () => {
        wx.showToast({
          title: '获取位置失败',
          icon: 'none'
        })
      }
    })
  },

  getLocationName(latitude, longitude) {
    // 这里可以调用逆地理编码接口获取位置名称
    // 暂时使用固定值
    this.setData({
      currentLocation: '北京市朝阳区'
    })
  },

  loadMarkers() {
    // 这里应该调用接口获取充电设施数据
    // 暂时使用模拟数据
    const markers = [
      {
        id: 1,
        latitude: 39.908860,
        longitude: 116.397390,
        width: 30,
        height: 30,
        callout: {
          content: '充电桩A',
          padding: 10,
          borderRadius: 5,
          display: 'ALWAYS'
        }
      }
      // 更多标记...
    ]
    this.setData({ markers })
  },

  switchTab(e) {
    const type = e.currentTarget.dataset.type
    this.setData({ activeTab: type })
    // 根据类型筛选标记点
    this.filterMarkers(type)
  },

  filterMarkers(type) {
    // 根据类型筛选显示不同的标记点
  },

  onSearchInput(e) {
    this.setData({
      searchText: e.detail.value
    });
  },

  // 统一的位置选择处理方法
  chooseLocationHandler() {
    wx.chooseLocation({
      success: (res) => {
        console.log('选择位置成功:', res);
        this.setData({
          latitude: res.latitude,
          longitude: res.longitude,
          searchText: res.name,
          markers: [{
            id: 1,
            latitude: res.latitude,
            longitude: res.longitude,
            title: res.name
          }]
        });

        // 保存搜索记录
        this.saveSearchLocation(res.name);

        // 更新地图视野
        this.mapCtx = wx.createMapContext('myMap');
        this.mapCtx.moveToLocation({
          latitude: res.latitude,
          longitude: res.longitude
        });
      },
      fail: (error) => {
        console.error('选择位置失败:', error);
        wx.showToast({
          title: '选择位置失败，请重试',
          icon: 'none'
        });
      }
    });
  },

  // 搜索按钮点击
  handleSearch() {
    this.chooseLocationHandler();
  },

  // 输入框点击
  handleInputTap() {
    this.chooseLocationHandler();
  },

  onMarkerTap(e) {
    const markerId = e.markerId
    // 处理标记点点击事件，显示详情等
  },

  // 加载最近搜索记录
  loadRecentLocations() {
    const recentLocations = wx.getStorageSync('recentLocations') || [];
    this.setData({ recentLocations });
  },

  // 保存搜索记录
  saveSearchLocation(location) {
    let recentLocations = wx.getStorageSync('recentLocations') || [];
    
    // 如果已存在相同位置，先删除旧的
    recentLocations = recentLocations.filter(item => item !== location);
    
    // 添加到开头
    recentLocations.unshift(location);
    
    // 只保留最近10条记录
    if (recentLocations.length > 10) {
      recentLocations = recentLocations.slice(0, 10);
    }
    
    // 保存到本地存储
    wx.setStorageSync('recentLocations', recentLocations);
    
    // 更新页面数据
    this.setData({ recentLocations });
  },

  // 点击历史记录项
  onHistoryItemTap(e) {
    const location = e.currentTarget.dataset.location;
    this.setData({ searchText: location });
    this.handleSearch();
  }
})
