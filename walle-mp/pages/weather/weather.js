const app = getApp()

Page({
  data: {
    location: '正在定位...',
    temperature: '--',
    humidity: '--',
    weatherDescription: '获取中...',
    weatherType: 'sunny',
    clothingAdvice: '正在生成穿衣建议...',
    forecast: [],
    loading: true
  },

  onLoad() {
    this.getWeatherData()
  },

  // 获取天气数据
  async getWeatherData() {
    try {
      this.setData({ loading: true })
      
      // 获取位置信息
      const location = await this.getLocation()
      
      // 获取天气信息
      const weatherData = await this.fetchWeatherData(location)
      
      // 更新页面数据
      this.updateWeatherInfo(weatherData)
      
      // 获取天气预报
      const forecastData = await this.fetchForecastData(location)
      
      // 更新预报数据
      this.updateForecast(forecastData)
      
      // 生成穿衣建议
      this.generateClothingAdvice(weatherData)
      
    } catch (error) {
      wx.showToast({
        title: '获取天气信息失败',
        icon: 'none'
      })
      console.error('获取天气数据失败:', error)
    } finally {
      this.setData({ loading: false })
    }
  },

  // 获取位置信息
  getLocation() {
    return new Promise((resolve, reject) => {
      wx.getLocation({
        type: 'gcj02',
        success: async (res) => {
          try {
            // 根据经纬度获取城市信息
            const cityInfo = await this.getCityFromLocation(res.latitude, res.longitude)
            resolve(cityInfo)
          } catch (error) {
            reject(error)
          }
        },
        fail: (error) => {
          reject(error)
        }
      })
    })
  },

  // 根据经纬度获取城市信息
  getCityFromLocation(latitude, longitude) {
    return new Promise((resolve, reject) => {
      wx.request({
        url: `https://api.map.baidu.com/reverse_geocoding/v3/`,
        data: {
          ak: 'YOUR_BAIDU_MAP_AK',
          output: 'json',
          location: `${latitude},${longitude}`
        },
        success: (res) => {
          if (res.data.status === 0) {
            resolve(res.data.result.addressComponent)
          } else {
            reject(new Error('获取城市信息失败'))
          }
        },
        fail: reject
      })
    })
  },

  // 获取天气数据
  fetchWeatherData(location) {
    return new Promise((resolve, reject) => {
      wx.request({
        url: 'https://api.openweathermap.org/data/2.5/weather',
        data: {
          q: location.city,
          appid: 'YOUR_OPENWEATHER_API_KEY',
          units: 'metric',
          lang: 'zh_cn'
        },
        success: (res) => {
          if (res.statusCode === 200) {
            resolve(res.data)
          } else {
            reject(new Error('获取天气数据失败'))
          }
        },
        fail: reject
      })
    })
  },

  // 获取天气预报数据
  fetchForecastData(location) {
    return new Promise((resolve, reject) => {
      wx.request({
        url: 'https://api.openweathermap.org/data/2.5/forecast',
        data: {
          q: location.city,
          appid: 'YOUR_OPENWEATHER_API_KEY',
          units: 'metric',
          lang: 'zh_cn'
        },
        success: (res) => {
          if (res.statusCode === 200) {
            resolve(res.data)
          } else {
            reject(new Error('获取天气预报失败'))
          }
        },
        fail: reject
      })
    })
  },

  // 更新天气信息
  updateWeatherInfo(data) {
    this.setData({
      temperature: Math.round(data.main.temp),
      humidity: data.main.humidity,
      weatherDescription: data.weather[0].description,
      weatherType: this.getWeatherType(data.weather[0].id)
    })
  },

  // 更新天气预报
  updateForecast(data) {
    const forecast = data.list
      .filter((item, index) => index % 8 === 0) // 每天一条数据
      .map(item => ({
        date: this.formatDate(item.dt),
        temp: Math.round(item.main.temp),
        type: this.getWeatherType(item.weather[0].id)
      }))
    
    this.setData({ forecast })
  },

  // 生成穿衣建议
  generateClothingAdvice(weatherData) {
    const temp = weatherData.main.temp
    let advice = ''

    if (temp <= 5) {
      advice = '天气寒冷，建议穿羽绒服、围巾、帽子等保暖衣物'
    } else if (temp <= 12) {
      advice = '天气较凉，建议穿厚外套、毛衣等保暖衣物'
    } else if (temp <= 21) {
      advice = '天气舒适，建议穿长袖衬衫、薄外套等衣物'
    } else if (temp <= 28) {
      advice = '天气温暖，建议穿短袖T恤、轻薄衣物'
    } else {
      advice = '天气炎热，建议穿轻薄、透气的衣物，注意防晒'
    }

    this.setData({ clothingAdvice: advice })
  },

  // 获取天气类型
  getWeatherType(weatherId) {
    if (weatherId >= 200 && weatherId < 300) return 'thunder'
    if (weatherId >= 300 && weatherId < 500) return 'rainy'
    if (weatherId >= 500 && weatherId < 600) return 'rainy'
    if (weatherId >= 600 && weatherId < 700) return 'snowy'
    if (weatherId >= 700 && weatherId < 800) return 'cloudy'
    if (weatherId === 800) return 'sunny'
    if (weatherId > 800) return 'cloudy'
    return 'sunny'
  },

  // 格式化日期
  formatDate(timestamp) {
    const date = new Date(timestamp * 1000)
    const month = date.getMonth() + 1
    const day = date.getDate()
    return `${month}/${day}`
  },

  // 刷新天气数据
  refreshWeather() {
    this.getWeatherData()
  },

  // 页面显示时
  onShow() {
    if (typeof this.getTabBar === 'function' &&
        this.getTabBar()) {
      this.getTabBar().setData({
        selected: 1
      })
    }
  }
}) 