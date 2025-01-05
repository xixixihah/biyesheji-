Page({
  data: {
    favorites: []
  },

  onShow() {
    const favorites = wx.getStorageSync('favorites') || [];
    this.setData({ favorites });
  },

  removeFavorite(e) {
    const markerId = e.currentTarget.dataset.id;
    const favorites = this.data.favorites.filter(marker => marker.id !== markerId);
    wx.setStorageSync('favorites', favorites);
    this.setData({ favorites });
  }
}); 