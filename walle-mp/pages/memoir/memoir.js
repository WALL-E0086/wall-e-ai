const app = getApp()

Page({
  data: {
    storyContent: '',
    selectedStyle: 'narrative',
    memoirContent: '',
    loading: false,
    canGenerate: false
  },

  // 监听故事输入
  onStoryInput(e) {
    const content = e.detail.value
    this.setData({
      storyContent: content,
      canGenerate: content.length >= 10 // 至少输入10个字才能生成
    })
  },

  // 选择写作风格
  selectStyle(e) {
    const style = e.currentTarget.dataset.style
    this.setData({
      selectedStyle: style
    })
  },

  // 生成回忆录
  async generateMemoir() {
    if (!this.data.canGenerate) return

    this.setData({ loading: true })

    try {
      // 调用云函数生成回忆录
      const { result } = await wx.cloud.callFunction({
        name: 'generateMemoir',
        data: {
          content: this.data.storyContent,
          style: this.data.selectedStyle
        }
      })

      if (result.success) {
        this.setData({
          memoirContent: result.content
        })
      } else {
        wx.showToast({
          title: '生成失败，请重试',
          icon: 'none'
        })
      }
    } catch (error) {
      console.error('生成回忆录失败:', error)
      wx.showToast({
        title: '生成失败，请重试',
        icon: 'none'
      })
    } finally {
      this.setData({ loading: false })
    }
  },

  // 复制回忆录
  copyMemoir() {
    wx.setClipboardData({
      data: this.data.memoirContent,
      success: () => {
        wx.showToast({
          title: '已复制到剪贴板',
          icon: 'success'
        })
      }
    })
  },

  // 分享回忆录
  shareMemoir() {
    wx.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage', 'shareTimeline']
    })
  },

  // 保存回忆录
  async saveMemoir() {
    try {
      // 调用云函数保存回忆录
      const { result } = await wx.cloud.callFunction({
        name: 'saveMemoir',
        data: {
          content: this.data.memoirContent,
          style: this.data.selectedStyle,
          originalStory: this.data.storyContent,
          createTime: new Date().getTime()
        }
      })

      if (result.success) {
        wx.showToast({
          title: '保存成功',
          icon: 'success'
        })
      } else {
        wx.showToast({
          title: '保存失败，请重试',
          icon: 'none'
        })
      }
    } catch (error) {
      console.error('保存回忆录失败:', error)
      wx.showToast({
        title: '保存失败，请重试',
        icon: 'none'
      })
    }
  },

  // 页面显示时
  onShow() {
    if (typeof this.getTabBar === 'function' &&
        this.getTabBar()) {
      this.getTabBar().setData({
        selected: 2
      })
    }
  },

  // 用户点击右上角分享
  onShareAppMessage() {
    return {
      title: '我用AI写了一篇回忆录，快来看看吧！',
      path: '/pages/memoir/memoir',
      imageUrl: '/assets/images/share-memoir.png'
    }
  },

  // 用户点击右上角分享到朋友圈
  onShareTimeline() {
    return {
      title: '我用AI写了一篇回忆录，快来看看吧！',
      imageUrl: '/assets/images/share-memoir.png'
    }
  }
}) 