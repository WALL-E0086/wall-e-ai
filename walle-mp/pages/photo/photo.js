const app = getApp()

Page({
  data: {
    tempImage: '',
    resultImage: '',
    selectedOptions: {
      colorize: false,
      enhance: false,
      repair: false,
      animate: false
    },
    loading: false,
    loadingTip: '',
    canRepair: false
  },

  // 选择图片
  chooseImage() {
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        this.setData({
          tempImage: res.tempFilePaths[0],
          resultImage: '',
          canRepair: true
        })
      }
    })
  },

  // 清除图片
  clearImage() {
    this.setData({
      tempImage: '',
      resultImage: '',
      canRepair: false,
      selectedOptions: {
        colorize: false,
        enhance: false,
        repair: false,
        animate: false
      }
    })
  },

  // 切换修复选项
  toggleOption(e) {
    const option = e.currentTarget.dataset.option
    const selectedOptions = { ...this.data.selectedOptions }
    selectedOptions[option] = !selectedOptions[option]
    
    this.setData({
      selectedOptions,
      canRepair: Object.values(selectedOptions).some(v => v)
    })
  },

  // 开始修复
  async startRepair() {
    if (!this.data.canRepair) return

    this.setData({ 
      loading: true,
      loadingTip: '正在上传图片...'
    })

    try {
      // 上传图片到云存储
      const uploadResult = await this.uploadImage(this.data.tempImage)
      
      this.setData({ loadingTip: '正在进行AI修复...' })
      
      // 调用云函数进行修复
      const { result } = await wx.cloud.callFunction({
        name: 'repairPhoto',
        data: {
          fileID: uploadResult.fileID,
          options: this.data.selectedOptions
        }
      })

      if (result.success) {
        // 获取修复后的图片临时链接
        const { tempFileURL } = await wx.cloud.getTempFileURL({
          fileList: [result.fileID]
        })

        this.setData({
          resultImage: tempFileURL[0].tempFileURL
        })
      } else {
        throw new Error('修复失败')
      }
    } catch (error) {
      console.error('照片修复失败:', error)
      wx.showToast({
        title: '修复失败，请重试',
        icon: 'none'
      })
    } finally {
      this.setData({ 
        loading: false,
        loadingTip: ''
      })
    }
  },

  // 上传图片到云存储
  uploadImage(tempFilePath) {
    return new Promise((resolve, reject) => {
      const ext = tempFilePath.split('.').pop()
      const cloudPath = `repair/${Date.now()}.${ext}`
      
      wx.cloud.uploadFile({
        cloudPath,
        filePath: tempFilePath,
        success: res => resolve(res),
        fail: err => reject(err)
      })
    })
  },

  // 保存图片到相册
  saveImage() {
    wx.saveImageToPhotosAlbum({
      filePath: this.data.resultImage,
      success: () => {
        wx.showToast({
          title: '已保存到相册',
          icon: 'success'
        })
      },
      fail: () => {
        wx.showToast({
          title: '保存失败，请重试',
          icon: 'none'
        })
      }
    })
  },

  // 分享图片
  shareImage() {
    wx.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage', 'shareTimeline']
    })
  },

  // 页面显示时
  onShow() {
    if (typeof this.getTabBar === 'function' &&
        this.getTabBar()) {
      this.getTabBar().setData({
        selected: 3
      })
    }
  },

  // 用户点击右上角分享
  onShareAppMessage() {
    return {
      title: '我用AI修复了一张照片，快来看看吧！',
      path: '/pages/photo/photo',
      imageUrl: this.data.resultImage || '/assets/images/share-photo.png'
    }
  },

  // 用户点击右上角分享到朋友圈
  onShareTimeline() {
    return {
      title: '我用AI修复了一张照片，快来看看吧！',
      imageUrl: this.data.resultImage || '/assets/images/share-photo.png'
    }
  }
}) 