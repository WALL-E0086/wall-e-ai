const app = getApp()

Page({
  data: {
    isAwake: false,
    isHappy: false,
    isAngry: false,
    isSleeping: false
  },

  onLoad() {
    // 初始化时触发醒来动画
    setTimeout(() => {
      this.setData({
        isAwake: true
      })
    }, 1000)
  },

  // 开始对话
  startChat() {
    // 触发开心状态
    this.setData({
      isHappy: true
    })
    
    setTimeout(() => {
      // 跳转到聊天页面
      wx.navigateTo({
        url: '/pages/chat/chat'
      })
      
      // 重置状态
      this.setData({
        isHappy: false
      })
    }, 800)
  },

  // 触摸黑洞时的交互
  onTouchBlackhole() {
    if (this.data.isAwake) {
      // 随机触发表情
      const random = Math.random()
      if (random < 0.4) {
        this.setData({ isHappy: true })
        setTimeout(() => this.setData({ isHappy: false }), 1000)
      } else if (random < 0.7) {
        this.setData({ isAngry: true })
        setTimeout(() => this.setData({ isAngry: false }), 1000)
      } else {
        this.setData({ isSleeping: true })
        setTimeout(() => this.setData({ isSleeping: false }), 2000)
      }
    }
  },

  // 页面显示时
  onShow() {
    if (typeof this.getTabBar === 'function' &&
        this.getTabBar()) {
      this.getTabBar().setData({
        selected: 0
      })
    }
  }
}) 