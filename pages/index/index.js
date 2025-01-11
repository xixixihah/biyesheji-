// index.js
const QQMapWX = require('../../utils/qqmap-wx-jssdk.js');
let qqmapsdk;

Page({
  data: {
    latitude: 30.2741510000,
    longitude: 120.1551510000,
    currentLocation: '正在获取位置...',
    markers: [],
    activeTab: 'all',
    searchText: '',
    recentLocations: [],  // 添加最近搜索记录数组
    showSunEffect: false,  // 添加太阳特效显示状态
    showWarningText: false,  // 添加文字提示的显示状态
    setting: {
      skew: 0,
      rotate: 0,
      showLocation: true,
      showScale: true,
      subKey: 'CBCBZ-HR4CC-KQG2P-ASSD3-TNAO5-3VF2F', // 如果有腾讯地图key可以填入
      layerStyle: 1,
      enableZoom: true,
      enableScroll: true,
      enableRotate: false,
      showCompass: false,
      enable3D: false,
      enableOverlooking: false,
      enableSatellite: false,
      enableTraffic: false,
    },
    showRoutePlan: false,  // 是否显示路线规划面板
    transportModes: [
      { id: 'walking', name: '步行', icon: '/images/walking.png' },
      { id: 'driving', name: '驾车', icon: '/images/driving.png' },
      { id: 'transit', name: '公交', icon: '/images/transit.png' },
      { id: 'riding', name: '骑行', icon: '/images/riding.png' }
    ],
    currentMode: 'walking',  // 当前选择的出行方式
    routeInfo: null,  // 路线信息
    polyline: [],  // 路线折线
    startLocation: null,  // 起点位置
    endLocation: null,   // 终点位置
    showRoute: false // 控制是否显示路线
  },

  onLoad() {
    this.getCurrentLocation()
    this.loadMarkers()
    // 加载最近搜索记录
    this.loadRecentLocations()
    // 预加载音频
    this.audioContext = wx.createInnerAudioContext();
    this.audioContext.src = '/audio/warning.wav';  // 注意这里的路径
    
    // 添加错误监听
    this.audioContext.onError((res) => {
      console.error('音频加载失败:', res);
    });

    // 获取地图上下文
    this.mapCtx = wx.createMapContext('myMap');
    
    // 实例化API核心类
    qqmapsdk = new QQMapWX({
      key: 'CBCBZ-HR4CC-KQG2P-ASSD3-TNAO5-3VF2F' // 替换这里
    });
  },

  onUnload() {
    // 页面卸载时释放音频资源
    if (this.audioContext) {
      this.audioContext.destroy();
    }
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
        
        // 检查平壤彩蛋
        this.checkPyongyangEasterEgg(res.name) || this.checkPyongyangEasterEgg(res.address);

        // 更新地图设置
        const newSetting = { ...this.data.setting };
        
        // 如果是国外位置，尝试启用卫星图
        if (res.latitude < 3.86 || res.latitude > 53.55 || 
            res.longitude < 73.66 || res.longitude > 135.05) {
          newSetting.enableSatellite = true;
          newSetting.enableOverlooking = true;
        }

        this.setData({
          latitude: res.latitude,
          longitude: res.longitude,
          searchText: res.name,
          setting: newSetting,
          markers: [{
            id: 1,
            latitude: res.latitude,
            longitude: res.longitude,
            title: res.name,
            width: 32,
            height: 32,
            callout: {
              content: res.name,
              padding: 10,
              borderRadius: 5,
              display: 'ALWAYS'
            }
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
    // 如果输入的是平壤，触发彩蛋
    if (this.checkPyongyangEasterEgg(this.data.searchText)) {
      return;
    }
    this.chooseLocationHandler();
  },

  // 输入框点击
  handleInputTap() {
    // 如果输入的是平壤，触发彩蛋
    if (this.checkPyongyangEasterEgg(this.data.searchText)) {
      return;
    }
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
  },

  // 检查平壤彩蛋的方法
  checkPyongyangEasterEgg(text) {
    if (text && text.includes('平壤')) {
      // 第一阶段：显示太阳特效并播放音频
      this.setData({ 
        showSunEffect: true,
        showWarningText: false
      });

      // 确保音频从头开始播放
      this.audioContext.stop();
      this.audioContext.seek(0);
      this.audioContext.play();
      
      // 5秒后切换到文字提示
      setTimeout(() => {
        this.setData({
          showSunEffect: false,
          showWarningText: true
        });
        
        // 再过5秒后完全关闭
        setTimeout(() => {
          this.setData({
            showWarningText: false
          });
        }, 5000);
        
      }, 5000);

      return true;
    }
    return false;
  },

  // 显示路线规划面板
  showRoutePlanPanel() {
    this.setData({
      showRoutePlan: true,
      startLocation: {
        latitude: this.data.latitude,
        longitude: this.data.longitude,
        name: this.data.currentLocation
      }
    });
  },

  // 选择交通方式
  selectTransportMode(e) {
    const mode = e.currentTarget.dataset.mode;
    this.setData({ currentMode: mode });
    if (this.data.startLocation && this.data.endLocation) {
      this.calculateRoute();
    }
  },

  // 计算路线
  calculateRoute() {
    const { startLocation, endLocation, currentMode } = this.data;
    // 调用高德地图API计算路线
    wx.request({
      url: `https://restapi.amap.com/v3/direction/${currentMode}`,
      data: {
        key: this.data.setting.subKey,
        origin: `${startLocation.longitude},${startLocation.latitude}`,
        destination: `${endLocation.longitude},${endLocation.latitude}`,
        output: 'json'
      },
      success: (res) => {
        if (res.data.status === '1') {
          this.processRouteResult(res.data);
        }
      }
    });
  },

  // 处理路线结果
  processRouteResult(data) {
    // 处理不同交通方式的路线数据
    // 绘制路线等
  },

  // TODO: 导航功能待优化
  // 目前使用高德地图小程序导航，存在以下问题：
  // 1. 需要跳转到其他小程序，用户体验不够流畅
  // 2. 依赖第三方小程序的稳定性
  // 3. 可能需要考虑其他导航方案
  // 
  // 可能的优化方向：
  // 1. 集成原生导航SDK
  // 2. 自己实现导航功能
  // 3. 使用其他地图服务
  startNavigation() {
    const { endLocation } = this.data;
    
    if (!endLocation) {
      wx.showToast({
        title: '请先选择目的地',
        icon: 'none'
      });
      return;
    }

    // 临时解决方案：使用高德地图小程序
    wx.navigateToMiniProgram({
      appId: 'wxde8ac0a21135c07d',  // 高德地图小程序的 appId
      path: 'route/index',
      extraData: {
        destination: JSON.stringify({
          name: endLocation.name,
          latitude: endLocation.latitude,
          longitude: endLocation.longitude
        })
      },
      success: (res) => {
        console.log('打开导航小程序成功', res);
      },
      fail: (error) => {
        console.error('打开导航小程序失败', error);
        // 备用方案：使用微信内置导航
        wx.openLocation({
          latitude: Number(endLocation.latitude),
          longitude: Number(endLocation.longitude),
          name: endLocation.name,
          address: endLocation.address,
          scale: 18
        });
      }
    });
  },

  // 隐藏路线规划面板
  hideRoutePlanPanel() {
    this.setData({
      showRoutePlan: false
    });
  },

  // 选择目的地
  chooseDestination() {
    wx.chooseLocation({
      success: (res) => {
        console.log('选择位置成功：', res);
        this.setData({
          endLocation: {
            name: res.name,
            address: res.address,
            latitude: Number(res.latitude),
            longitude: Number(res.longitude)
          }
        });
      }
    });
  },

  // 在地图上显示规划路线（备用方案）
  showRouteOnMap() {
    const { endLocation } = this.data;
    
    if (!endLocation) {
      wx.showToast({
        title: '请先选择目的地',
        icon: 'none'
      });
      return;
    }

    // 直接绘制一条直线连接起点和终点
    const coors = [{
      latitude: this.data.latitude,
      longitude: this.data.longitude
    }, {
      latitude: endLocation.latitude,
      longitude: endLocation.longitude
    }];

    this.setData({
      showRoute: true,
      polyline: [{
        points: coors,
        color: '#52c41a',
        width: 8,
        arrowLine: true,
        borderColor: '#ffffff',
        borderWidth: 2
      }],
      markers: [{
        id: 0,
        latitude: this.data.latitude,
        longitude: this.data.longitude,
        iconPath: '/images/start.png',
        width: 30,
        height: 30,
        callout: {
          content: '起点',
          padding: 10,
          borderRadius: 5,
          display: 'ALWAYS'
        }
      }, {
        id: 1,
        latitude: endLocation.latitude,
        longitude: endLocation.longitude,
        iconPath: '/images/end.png',
        width: 30,
        height: 30,
        callout: {
          content: endLocation.name || '终点',
          padding: 10,
          borderRadius: 5,
          display: 'ALWAYS'
        }
      }]
    });

    // 确保地图上下文存在
    if (this.mapCtx) {
      this.mapCtx.includePoints({
        points: coors,
        padding: [80, 80, 80, 80]
      });
    } else {
      // 如果地图上下文不存在，重新创建
      this.mapCtx = wx.createMapContext('myMap');
      setTimeout(() => {
        this.mapCtx.includePoints({
          points: coors,
          padding: [80, 80, 80, 80]
        });
      }, 300);
    }
  }
})
