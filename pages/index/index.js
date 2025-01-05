// index.js
Page({
  data: {
    latitude: 39.908860,
    longitude: 116.397390,
    currentLocation: '正在获取位置...',
    markers: [],
    activeTab: 'all'
  },

  onLoad() {
    this.getCurrentLocation()
    this.loadMarkers()
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
    // 处理搜索输入
    const value = e.detail.value
    // 可以实现搜索建议功能
  },

  onMarkerTap(e) {
    const markerId = e.markerId
    // 处理标记点点击事件，显示详情等
  }
})
