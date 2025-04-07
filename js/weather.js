// 天气页面控制器
const WeatherController = {
    // 初始化天气页面
    init() {
        this.updateWeatherUI();
        this.bindEvents();
        
        // 如果天气数据不存在或已过期，重新获取
        this.checkAndUpdateWeather();
    },
    
    // 绑定事件处理
    bindEvents() {
        // 刷新按钮点击事件
        const refreshBtn = document.querySelector('.weather-refresh-btn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                this.checkAndUpdateWeather(true);
            });
        }
        
        // 监听全局天气数据更新
        window.addEventListener('weatherupdate', () => {
            this.updateWeatherUI();
        });
    },
    
    // 检查并更新天气数据
    async checkAndUpdateWeather(force = false) {
        const weather = app.state.weather;
        const weatherAge = weather?.lastUpdate 
            ? new Date() - new Date(weather.lastUpdate)
            : Infinity;
            
        if (force || !weather || weatherAge > 1800000) { // 30分钟更新一次
            try {
                const loadingEl = document.querySelector('.weather-loading');
                if (loadingEl) loadingEl.classList.remove('hidden');
                
                // 首先获取用户位置
                await this.getCurrentLocation();
                
                if (loadingEl) loadingEl.classList.add('hidden');
            } catch (error) {
                console.error('Failed to update weather:', error);
                // 显示错误提示
                this.showError('获取天气信息失败，请稍后重试');
            }
        }
    },
    
    // 获取当前位置
    async getCurrentLocation() {
        return new Promise((resolve, reject) => {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    async (position) => {
                        const location = {
                            lat: position.coords.latitude,
                            lng: position.coords.longitude
                        };
                        
                        // 保存位置信息
                        if (!app.state.user) app.state.user = {};
                        app.state.user.location = location;
                        
                        // 获取天气信息
                        await this.fetchWeatherData(`${location.lng},${location.lat}`);
                        resolve(location);
                    },
                    (error) => {
                        console.error('Geolocation error:', error);
                        // 使用默认位置（北京）
                        this.fetchWeatherData('116.41,39.91');
                        reject(error);
                    }
                );
            } else {
                console.error('Geolocation is not supported by this browser.');
                // 使用默认位置（北京）
                this.fetchWeatherData('116.41,39.91');
                reject(new Error('Geolocation not supported'));
            }
        });
    },
    
    // 使用高德地图API获取天气数据
    async fetchWeatherData(location) {
        try {
            // 使用高德地图MCP获取天气信息
            const weatherData = await mcp_amap_maps_maps_weather({
                city: location // 使用经纬度请求天气
            });
            
            if (weatherData && weatherData.status === '1') {
                const result = this.processWeatherData(weatherData);
                
                // 更新全局状态
                app.state.weather = {
                    current: result.current,
                    forecast: result.forecast,
                    lifeIndex: result.lifeIndex,
                    lastUpdate: new Date()
                };
                
                // 保存到本地存储
                app.utils.storage.save('weather', app.state.weather);
                
                // 更新UI
                this.updateWeatherUI();
                
                // 触发天气更新事件
                window.dispatchEvent(new CustomEvent('weatherupdate', { 
                    detail: app.state.weather 
                }));
                
                return result;
            } else {
                throw new Error('Invalid weather data');
            }
        } catch (error) {
            console.error('Failed to fetch weather data:', error);
            this.showError('获取天气数据失败，请检查网络连接');
            throw error;
        }
    },
    
    // 处理高德天气数据
    processWeatherData(data) {
        const weatherResult = {
            current: {},
            forecast: [],
            lifeIndex: {}
        };
        
        if (data && data.forecasts && data.forecasts.length > 0) {
            const cityWeather = data.forecasts[0];
            
            // 提取城市信息
            weatherResult.city = {
                name: cityWeather.city,
                adcode: cityWeather.adcode,
                province: cityWeather.province
            };
            
            // 提取当天天气作为当前天气
            if (cityWeather.casts && cityWeather.casts.length > 0) {
                const today = cityWeather.casts[0];
                
                weatherResult.current = {
                    date: today.date,
                    dayWeather: today.dayweather,
                    nightWeather: today.nightweather,
                    dayTemp: parseInt(today.daytemp),
                    nightTemp: parseInt(today.nighttemp),
                    dayWind: today.daywind,
                    nightWind: today.nightwind,
                    dayPower: today.daypower,
                    nightPower: today.nightpower,
                    
                    // 综合信息
                    temperature: parseInt(today.daytemp), // 使用白天温度作为当前温度
                    condition: this.mapWeatherCondition(today.dayweather),
                    description: today.dayweather,
                    wind: {
                        direction: today.daywind,
                        power: today.daypower
                    }
                };
                
                // 提取预报信息
                weatherResult.forecast = cityWeather.casts.map(cast => ({
                    date: cast.date,
                    dayWeather: cast.dayweather,
                    nightWeather: cast.nightweather,
                    dayTemp: parseInt(cast.daytemp),
                    nightTemp: parseInt(cast.nighttemp),
                    dayWind: cast.daywind,
                    nightWind: cast.nightwind,
                    dayPower: cast.daypower,
                    nightPower: cast.nightpower,
                    
                    // 综合信息
                    tempMax: parseInt(cast.daytemp),
                    tempMin: parseInt(cast.nighttemp),
                    condition: this.mapWeatherCondition(cast.dayweather),
                    description: cast.dayweather
                }));
                
                // 创建简单的生活指数（高德API没有直接提供，这里模拟一些）
                weatherResult.lifeIndex = this.generateLifeIndex(weatherResult.current);
            }
        }
        
        return weatherResult;
    },
    
    // 将高德天气描述映射到标准化的天气条件
    mapWeatherCondition(weatherDesc) {
        const conditionMap = {
            '晴': 'clear',
            '多云': 'partlyCloudy',
            '阴': 'cloudy',
            '阵雨': 'rain',
            '雷阵雨': 'storm',
            '雨': 'rain',
            '小雨': 'rain',
            '中雨': 'rain',
            '大雨': 'rain',
            '暴雨': 'rain',
            '雪': 'snow',
            '雾': 'fog'
        };
        
        // 尝试精确匹配
        if (conditionMap[weatherDesc]) {
            return conditionMap[weatherDesc];
        }
        
        // 尝试部分匹配
        for (const [key, value] of Object.entries(conditionMap)) {
            if (weatherDesc.includes(key)) {
                return value;
            }
        }
        
        // 默认返回晴天
        return 'clear';
    },
    
    // 生成生活指数
    generateLifeIndex(currentWeather) {
        const temp = currentWeather.temperature;
        const weatherCondition = currentWeather.condition;
        
        // 紫外线指数
        let uvIndex = '低';
        if (weatherCondition === 'clear') {
            uvIndex = temp > 25 ? '高' : '中等';
        } else if (weatherCondition === 'partlyCloudy') {
            uvIndex = '中等';
        }
        
        // 洗车指数
        let carWashIndex = '适宜';
        if (weatherCondition === 'rain' || weatherCondition === 'snow') {
            carWashIndex = '不宜';
        }
        
        // 穿衣指数
        let clothingIndex;
        if (temp >= 26) {
            clothingIndex = '短袖';
        } else if (temp >= 20) {
            clothingIndex = '短袖+薄外套';
        } else if (temp >= 15) {
            clothingIndex = '长袖';
        } else if (temp >= 10) {
            clothingIndex = '薄外套';
        } else if (temp >= 5) {
            clothingIndex = '厚外套';
        } else {
            clothingIndex = '棉衣羽绒服';
        }
        
        // 舒适度指数
        let comfortIndex;
        if (temp > 30 || temp < 0) {
            comfortIndex = '不舒适';
        } else if (temp > 25 || temp < 5) {
            comfortIndex = '较不舒适';
        } else if (temp > 22 || temp < 10) {
            comfortIndex = '一般';
        } else {
            comfortIndex = '舒适';
        }
        
        return {
            uv: {
                level: uvIndex,
                description: uvIndex === '高' ? '建议涂抹防晒霜，戴帽子' : '紫外线较弱，适合户外活动'
            },
            carWash: {
                level: carWashIndex,
                description: carWashIndex === '适宜' ? '天气较好，适合洗车' : '天气不佳，不宜洗车'
            },
            clothing: {
                level: clothingIndex,
                description: `建议穿${clothingIndex}，注意保暖`
            },
            comfort: {
                level: comfortIndex,
                description: comfortIndex === '舒适' ? '天气舒适，适合外出' : '注意适当调整着装'
            },
            humidity: {
                level: '45%',
                description: '湿度适中'
            },
            wind: {
                level: currentWeather.wind.power + '级',
                description: currentWeather.wind.power > 4 ? '风力较大，注意防风' : '微风轻拂，体感舒适'
            }
        };
    },
    
    // 更新天气界面
    updateWeatherUI() {
        const weather = app.state.weather?.current;
        if (!weather) return;
        
        // 更新当前温度
        const currentTemp = document.querySelector('#today-temp');
        if (currentTemp) {
            currentTemp.textContent = app.utils.formatTemperature(weather.temperature);
        }
        
        // 更新天气描述
        const weatherDesc = document.querySelector('#today-desc');
        if (weatherDesc) {
            weatherDesc.textContent = weather.description;
        }
        
        // 更新城市信息
        const cityName = document.querySelector('#current-location');
        if (cityName && app.state.weather.city) {
            cityName.textContent = app.state.weather.city.name;
        }
        
        // 更新天气图标
        const weatherIcon = document.querySelector('#weather-icon');
        if (weatherIcon) {
            weatherIcon.className = `fas ${this.getWeatherIcon(weather.condition)} text-4xl mb-2`;
        }
        
        // 更新风向风力
        const windInfo = document.querySelector('#wind-info');
        if (windInfo && weather.wind) {
            windInfo.textContent = `${weather.wind.direction}风 ${weather.wind.power}级`;
        }
        
        // 更新指数
        this.updateIndexes();
        
        // 更新天气预报
        this.updateForecast();
    },
    
    // 更新指数信息
    updateIndexes() {
        const lifeIndex = app.state.weather?.lifeIndex;
        if (!lifeIndex) return;
        
        // 更新紫外线指数
        const uvLevel = document.querySelector('#uv-level');
        if (uvLevel) {
            uvLevel.textContent = lifeIndex.uv.level;
        }
        
        // 更新穿衣指数
        const clothingIndex = document.querySelector('#clothing-index');
        if (clothingIndex) {
            clothingIndex.textContent = lifeIndex.clothing.level;
        }
        
        // 更新洗车指数
        const carWashIndex = document.querySelector('#car-wash-index');
        if (carWashIndex) {
            carWashIndex.textContent = lifeIndex.carWash.level;
        }
    },
    
    // 更新天气预报
    updateForecast() {
        const forecast = app.state.weather?.forecast;
        if (!forecast || forecast.length === 0) return;
        
        // 更新今日信息
        const todayDate = document.querySelector('#today-date');
        const todayIcon = document.querySelector('#today-icon');
        const todayWeatherDesc = document.querySelector('#today-weather-desc');
        const todayRange = document.querySelector('#today-range');
        
        if (todayDate && todayIcon && todayWeatherDesc && todayRange) {
            const today = forecast[0];
            todayDate.textContent = this.formatDateShort(today.date);
            todayIcon.className = `fas ${this.getWeatherIcon(today.condition)} text-yellow-500 mr-3`;
            todayWeatherDesc.textContent = today.description;
            todayRange.textContent = `${app.utils.formatTemperature(today.tempMin)} / ${app.utils.formatTemperature(today.tempMax)}`;
        }
        
        // 更新未来天气预报
        const forecastContainer = document.querySelector('#forecast-container');
        if (forecastContainer) {
            // 清空现有内容
            forecastContainer.innerHTML = '';
            
            // 添加未来天气预报（从第二天开始）
            forecast.slice(1).forEach((day, index) => {
                const dayElement = document.createElement('div');
                dayElement.className = 'p-4 flex items-center justify-between';
                
                dayElement.innerHTML = `
                    <div class="w-16 text-sm text-gray-600">${this.getDayName(index)}</div>
                    <div class="flex items-center justify-center">
                        <i class="fas ${this.getWeatherIcon(day.condition)} text-blue-500"></i>
                    </div>
                    <div class="w-24 text-sm text-gray-600">${day.description}</div>
                    <div class="text-sm">
                        <span class="text-gray-500 mr-2">${app.utils.formatTemperature(day.tempMin)}</span>
                        <span class="font-medium text-gray-800">${app.utils.formatTemperature(day.tempMax)}</span>
                    </div>
                `;
                
                forecastContainer.appendChild(dayElement);
            });
        }
    },
    
    // 获取天气图标类名
    getWeatherIcon(condition) {
        const iconMap = {
            clear: 'fa-sun',
            cloudy: 'fa-cloud',
            partlyCloudy: 'fa-cloud-sun',
            rain: 'fa-cloud-rain',
            snow: 'fa-snowflake',
            storm: 'fa-bolt',
            fog: 'fa-smog'
        };
        
        return iconMap[condition] || 'fa-sun';
    },
    
    // 获取星期几名称
    getDayName(dayOffset) {
        const days = ['明天', '后天', '周四', '周五', '周六'];
        return days[dayOffset] || `未来第${dayOffset + 2}天`;
    },
    
    // 格式化日期(简短格式)
    formatDateShort(dateStr) {
        const date = new Date(dateStr);
        return `${date.getMonth() + 1}月${date.getDate()}日`;
    },
    
    // 显示错误提示
    showError(message) {
        const notification = document.querySelector('#notification');
        const notificationContainer = document.querySelector('#notification-container');
        
        if (notification && notificationContainer) {
            notification.textContent = message;
            notification.classList.replace('scale-0', 'scale-100');
            
            setTimeout(() => {
                notification.classList.replace('scale-100', 'scale-0');
            }, 3000);
        }
    }
};

// 当页面加载完成后初始化天气控制器
document.addEventListener('DOMContentLoaded', () => {
    WeatherController.init();
}); 