const app = getApp()

Page({
  data: {
    email: 'contact@walle-ai.com'
  },

  // 复制邮箱地址
  copyEmail() {
    wx.setClipboardData({
      data: this.data.email,
      success: () => {
        wx.showToast({
          title: '邮箱已复制',
          icon: 'success'
        })
      }
    })
  },

  // 显示公众号二维码
  showQRCode() {
    wx.previewImage({
      urls: ['/assets/images/qrcode.jpg']
    })
  },

  // 页面显示时
  onShow() {
    if (typeof this.getTabBar === 'function' &&
        this.getTabBar()) {
      this.getTabBar().setData({
        selected: 4
      })
    }
  },

  // 用户点击右上角分享
  onShareAppMessage() {
    return {
      title: '瓦力AI初号机 - 你的智能生活管家',
      path: '/pages/index/index',
      imageUrl: '/assets/images/share.png'
    }
  },

  // 用户点击右上角分享到朋友圈
  onShareTimeline() {
    return {
      title: '瓦力AI初号机 - 你的智能生活管家',
      imageUrl: '/assets/images/share.png'
    }
  }
}) 