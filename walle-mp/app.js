App({
  globalData: {
    userInfo: null,
    locationInfo: null,
    weatherInfo: null
  },

  onLaunch() {
    // 获取用户信息
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          wx.getUserInfo({
            success: res => {
              this.globalData.userInfo = res.userInfo
            }
          })
        }
      }
    })

    // 获取位置信息
    this.getLocationInfo()
  },

  // 获取位置信息
  async getLocationInfo() {
    try {
      const location = await wx.request({
        url: 'https://api.ipapi.com/api/check',
        data: {
          access_key: '2fc47227ca87d54d3922f141649837f4'
        }
      })
      
      this.globalData.locationInfo = {
        city: location.data.city,
        latitude: location.data.latitude,
        longitude: location.data.longitude
      }

      // 获取天气信息
      this.getWeatherInfo()
    } catch (error) {
      console.error('获取位置信息失败:', error)
    }
  },

  // 获取天气信息
  async getWeatherInfo() {
    if (!this.globalData.locationInfo) return

    try {
      const { latitude, longitude } = this.globalData.locationInfo
      const weather = await wx.request({
        url: 'https://api.openweathermap.org/data/2.5/weather',
        data: {
          lat: latitude,
          lon: longitude,
          appid: 'e7912f1a0e0b0097453f01b2ae4842e6',
          units: 'metric',
          lang: 'zh_cn'
        }
      })

      this.globalData.weatherInfo = {
        temp: Math.round(weather.data.main.temp),
        humidity: weather.data.main.humidity,
        weather: weather.data.weather[0].main,
        description: weather.data.weather[0].description
      }
    } catch (error) {
      console.error('获取天气信息失败:', error)
    }
  }
}) 