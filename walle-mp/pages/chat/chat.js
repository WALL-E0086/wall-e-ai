const app = getApp()

Page({
  data: {
    messages: [],
    inputContent: '',
    scrollToMessage: '',
    isLoadingMore: false,
    userAvatar: '/assets/images/user-avatar.png',
    aiAvatar: '/assets/images/ai-avatar.png',
    isVoiceMode: false,
    isRecording: false,
    isRecordingCanceled: false,
    showEmojiPanel: false,
    canSend: false,
    isPlaying: false,
    currentVoiceId: '',
    emojis: [
      { name: 'happy' },
      { name: 'sad' },
      { name: 'angry' },
      { name: 'love' },
      { name: 'cool' },
      { name: 'cry' },
      { name: 'laugh' },
      { name: 'surprise' }
    ]
  },

  onLoad() {
    // 初始化聊天记录
    this.loadInitialMessages()
    
    // 初始化录音管理器
    this.recorderManager = wx.getRecorderManager()
    this.initRecorderManager()
    
    // 初始化音频播放器
    this.audioContext = wx.createInnerAudioContext()
    this.initAudioContext()
  },

  // 加载初始消息
  async loadInitialMessages() {
    try {
      const { result } = await wx.cloud.callFunction({
        name: 'getMessages',
        data: { limit: 20 }
      })

      if (result.success) {
        this.setData({
          messages: result.messages.reverse()
        })
        this.scrollToBottom()
      }
    } catch (error) {
      console.error('加载消息失败:', error)
    }
  },

  // 加载更多消息
  async loadMoreMessages() {
    if (this.data.isLoadingMore) return

    this.setData({ isLoadingMore: true })

    try {
      const { result } = await wx.cloud.callFunction({
        name: 'getMessages',
        data: {
          limit: 20,
          before: this.data.messages[0].id
        }
      })

      if (result.success && result.messages.length > 0) {
        this.setData({
          messages: [...result.messages.reverse(), ...this.data.messages]
        })
      }
    } catch (error) {
      console.error('加载更多消息失败:', error)
    } finally {
      this.setData({ isLoadingMore: false })
    }
  },

  // 监听输入
  onInput(e) {
    const content = e.detail.value
    this.setData({
      inputContent: content,
      canSend: content.trim().length > 0
    })
  },

  // 发送消息
  async sendMessage() {
    if (!this.data.canSend) return

    const content = this.data.inputContent
    const messageId = Date.now().toString()

    // 添加到消息列表
    const message = {
      id: messageId,
      type: 'user',
      content,
      contentType: 'text',
      status: 'sending',
      timestamp: Date.now()
    }

    this.setData({
      messages: [...this.data.messages, message],
      inputContent: '',
      canSend: false,
      showEmojiPanel: false
    })

    this.scrollToBottom()

    try {
      // 发送消息到服务器
      const { result } = await wx.cloud.callFunction({
        name: 'sendMessage',
        data: { message }
      })

      if (result.success) {
        // 更新消息状态
        this.updateMessageStatus(messageId, 'success')
        
        // 接收AI回复
        this.receiveAIResponse(result.response)
      } else {
        this.updateMessageStatus(messageId, 'failed')
      }
    } catch (error) {
      console.error('发送消息失败:', error)
      this.updateMessageStatus(messageId, 'failed')
    }
  },

  // 更新消息状态
  updateMessageStatus(messageId, status) {
    const messages = this.data.messages.map(msg => {
      if (msg.id === messageId) {
        return { ...msg, status }
      }
      return msg
    })
    
    this.setData({ messages })
  },

  // 接收AI回复
  receiveAIResponse(response) {
    const message = {
      id: Date.now().toString(),
      type: 'ai',
      content: response.content,
      contentType: response.type || 'text',
      timestamp: Date.now()
    }

    this.setData({
      messages: [...this.data.messages, message]
    })

    this.scrollToBottom()
  },

  // 重发消息
  resendMessage(e) {
    const messageId = e.currentTarget.dataset.id
    const message = this.data.messages.find(msg => msg.id === messageId)
    
    if (message) {
      this.updateMessageStatus(messageId, 'sending')
      this.sendMessage(message.content)
    }
  },

  // 切换输入模式
  switchInputMode() {
    this.setData({
      isVoiceMode: !this.data.isVoiceMode,
      showEmojiPanel: false
    })
  },

  // 初始化录音管理器
  initRecorderManager() {
    this.recorderManager.onStart(() => {
      console.log('录音开始')
    })

    this.recorderManager.onStop(async (res) => {
      if (!this.data.isRecordingCanceled) {
        console.log('录音结束', res)
        await this.sendVoiceMessage(res.tempFilePath, res.duration)
      }
      
      this.setData({
        isRecording: false,
        isRecordingCanceled: false
      })
    })

    this.recorderManager.onError((error) => {
      console.error('录音失败:', error)
      wx.showToast({
        title: '录音失败',
        icon: 'none'
      })
    })
  },

  // 开始录音
  startRecording() {
    this.recorderManager.start({
      duration: 60000,
      sampleRate: 16000,
      numberOfChannels: 1,
      encodeBitRate: 48000,
      format: 'mp3'
    })

    this.setData({
      isRecording: true,
      isRecordingCanceled: false
    })

    // 振动反馈
    wx.vibrateShort()
  },

  // 停止录音
  stopRecording() {
    this.recorderManager.stop()
    
    // 振动反馈
    wx.vibrateShort()
  },

  // 取消录音
  cancelRecording(e) {
    if (e.touches[0].clientY < e.currentTarget.offsetTop - 50) {
      this.setData({ isRecordingCanceled: true })
    } else {
      this.setData({ isRecordingCanceled: false })
    }
  },

  // 发送语音消息
  async sendVoiceMessage(tempFilePath, duration) {
    const messageId = Date.now().toString()

    // 添加到消息列表
    const message = {
      id: messageId,
      type: 'user',
      content: tempFilePath,
      contentType: 'voice',
      duration: Math.round(duration / 1000),
      status: 'sending',
      timestamp: Date.now()
    }

    this.setData({
      messages: [...this.data.messages, message]
    })

    this.scrollToBottom()

    try {
      // 上传语音文件
      const { fileID } = await wx.cloud.uploadFile({
        cloudPath: `voice/${messageId}.mp3`,
        filePath: tempFilePath
      })

      // 发送消息到服务器
      const { result } = await wx.cloud.callFunction({
        name: 'sendMessage',
        data: {
          message: {
            ...message,
            content: fileID
          }
        }
      })

      if (result.success) {
        this.updateMessageStatus(messageId, 'success')
        this.receiveAIResponse(result.response)
      } else {
        this.updateMessageStatus(messageId, 'failed')
      }
    } catch (error) {
      console.error('发送语音消息失败:', error)
      this.updateMessageStatus(messageId, 'failed')
    }
  },

  // 初始化音频播放器
  initAudioContext() {
    this.audioContext.onPlay(() => {
      console.log('开始播放')
    })

    this.audioContext.onEnded(() => {
      this.setData({
        isPlaying: false,
        currentVoiceId: ''
      })
    })

    this.audioContext.onError((error) => {
      console.error('播放失败:', error)
      this.setData({
        isPlaying: false,
        currentVoiceId: ''
      })
    })
  },

  // 播放语音
  async playVoice(e) {
    const url = e.currentTarget.dataset.url
    const messageId = e.currentTarget.dataset.id

    if (this.data.isPlaying) {
      this.audioContext.stop()
      
      if (this.data.currentVoiceId === messageId) {
        this.setData({
          isPlaying: false,
          currentVoiceId: ''
        })
        return
      }
    }

    try {
      // 获取语音文件临时链接
      const { tempFileURL } = await wx.cloud.getTempFileURL({
        fileList: [url]
      })

      this.audioContext.src = tempFileURL[0].tempFileURL
      this.audioContext.play()

      this.setData({
        isPlaying: true,
        currentVoiceId: messageId
      })
    } catch (error) {
      console.error('获取语音文件失败:', error)
      wx.showToast({
        title: '播放失败',
        icon: 'none'
      })
    }
  },

  // 切换表情面板
  toggleEmojiPanel() {
    this.setData({
      showEmojiPanel: !this.data.showEmojiPanel,
      isVoiceMode: false
    })
  },

  // 选择表情
  selectEmoji(e) {
    const emoji = e.currentTarget.dataset.emoji
    const content = this.data.inputContent + `[${emoji}]`
    
    this.setData({
      inputContent: content,
      canSend: true
    })
  },

  // 预览图片
  previewImage(e) {
    const url = e.currentTarget.dataset.url
    wx.previewImage({
      urls: [url]
    })
  },

  // 滚动到底部
  scrollToBottom() {
    const messages = this.data.messages
    if (messages.length > 0) {
      this.setData({
        scrollToMessage: `msg-${messages[messages.length - 1].id}`
      })
    }
  },

  onUnload() {
    // 清理音频资源
    this.audioContext.destroy()
  }
}) 