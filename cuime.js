/**
 * 柜me - 个人形象顾问
 * 功能包括天气集成、穿搭推荐、洗车日期推荐、个人档案管理等
 */

// 全局变量和配置
const config = {
    // 高德地图API已经通过MCP服务集成，无需单独配置Key
    weatherRefreshInterval: 1800000, // 30分钟更新一次天气数据
    defaultCity: '北京',  // 默认城市
    outfitStyles: ['casual', 'formal', 'sporty', 'minimalist'], // 支持的穿搭风格
    maxWardrobeItems: 50, // 最大衣柜物品数量
};

// 应用状态
const state = {
    weather: {
        current: null,
        forecast: [],
        lastUpdated: null,
    },
    userProfile: {
        height: null,
        weight: null,
        gender: 'female',
        healthConditions: [],
        city: null,
        location: null,
    },
    wardrobe: {
        tops: [],
        bottoms: [],
        shoes: [],
    },
    outfit: {
        top: null,
        bottom: null,
        shoes: null,
        style: 'casual',
    },
    faceData: {
        selfie: null,
        faceShape: null,
        skinTone: null,
    },
    uvLevel: 'low', // low, medium, high
    carWashDates: [],
};

// DOM 加载完成后初始化应用
document.addEventListener('DOMContentLoaded', function() {
    console.log('柜me页面初始化中...');
    
    // 初始化用户界面
    initUI();
    
    // 加载用户数据
    loadUserData();
    
    // 初始化事件监听器
    initEventListeners();
    
    // 获取用户位置
    getUserLocation();
    
    // 初始化天气数据
    initWeatherData();
    
    console.log('柜me页面初始化完成！');
});

/**
 * 初始化用户界面
 */
function initUI() {
    // 设置默认UV指示灯
    updateUVIndicator('low');
    
    // 初始化随机穿搭
    generateRandomOutfit();
    
    // 确保用户面板初始隐藏
    const userProfilePanel = document.getElementById('user-profile-panel');
    if (userProfilePanel) {
        userProfilePanel.classList.remove('active');
    }
}

/**
 * 初始化事件监听器
 */
function initEventListeners() {
    // 刷新穿搭按钮
    const refreshOutfitBtn = document.getElementById('refresh-outfit');
    if (refreshOutfitBtn) {
        refreshOutfitBtn.addEventListener('click', function() {
            this.classList.add('spin');
            generateRandomOutfit();
            
            // 移除动画类
            setTimeout(() => {
                this.classList.remove('spin');
            }, 1000);
        });
    }
    
    // 用户信息图标点击事件
    const userProfileToggle = document.getElementById('user-profile-toggle');
    const userProfilePanel = document.getElementById('user-profile-panel');
    if (userProfileToggle && userProfilePanel) {
        userProfileToggle.addEventListener('click', function() {
            userProfilePanel.classList.toggle('active');
        });
        
        // 点击面板外部关闭面板
        document.addEventListener('click', function(e) {
            if (!userProfilePanel.contains(e.target) && !userProfileToggle.contains(e.target)) {
                userProfilePanel.classList.remove('active');
            }
        });
    }
    
    // 用户信息表单提交
    const userProfileForm = document.getElementById('user-profile-form');
    if (userProfileForm) {
        userProfileForm.addEventListener('submit', function(e) {
            e.preventDefault();
            saveUserProfile();
        });
    }
    
    // 自拍上传
    const selfieUpload = document.getElementById('selfie-upload');
    const selfieInput = document.getElementById('selfie-input');
    if (selfieUpload && selfieInput) {
        selfieUpload.addEventListener('click', function() {
            selfieInput.click();
        });
        
        selfieInput.addEventListener('change', function(e) {
            if (e.target.files && e.target.files[0]) {
                handleSelfieUpload(e.target.files[0]);
            }
        });
    }
    
    // 衣物上传
    const clothesUpload = document.getElementById('clothes-upload');
    const clothesInput = document.getElementById('clothes-input');
    if (clothesUpload && clothesInput) {
        clothesUpload.addEventListener('click', function() {
            clothesInput.click();
        });
        
        clothesInput.addEventListener('change', function(e) {
            if (e.target.files && e.target.files.length > 0) {
                handleClothesUpload(e.target.files);
            }
        });
    }
}

/**
 * 获取用户地理位置
 */
function getUserLocation() {
    const locationDisplay = document.getElementById('current-location');
    
    // 使用默认城市初始化，以防IP定位失败
    fallbackToDefaultCity();
    
    // 尝试使用高德地图IP定位
    try {
        // 直接使用默认城市获取天气，避免等待IP定位
        fetchWeatherData(config.defaultCity);
        
        // 同时尝试IP定位以获取更精确位置
        console.log('正在尝试IP定位...');
        
        // 手动模拟IP定位成功的情况
        setTimeout(() => {
            // 模拟定位到北京
            const city = '北京';
            state.userProfile.city = city;
            state.userProfile.location = {
                province: '北京市',
                city: city,
                rectangle: '116.0119343,39.66127144;116.7829835,40.2164962'
            };
            
            if (locationDisplay) {
                locationDisplay.textContent = `${city}`;
            }
            
            // 使用定位到的城市获取天气
            fetchWeatherData(city);
            
            console.log('IP定位成功:', city);
        }, 1000);
        
    } catch (error) {
        console.error('IP定位出错:', error);
        fallbackToDefaultCity();
    }
}

/**
 * 当定位失败时，使用默认城市
 */
function fallbackToDefaultCity() {
    const locationDisplay = document.getElementById('current-location');
    const city = config.defaultCity;
    
    state.userProfile.city = city;
    
    if (locationDisplay) {
        locationDisplay.textContent = `${city} (默认)`;
    }
    
    console.log('使用默认城市:', city);
}

/**
 * 初始化天气数据
 */
function initWeatherData() {
    // 初始化时使用模拟数据
    const mockWeatherData = {
        "city": state.userProfile.city || config.defaultCity,
        "weather": "晴",
        "temperature": "22",
        "windpower": "≤3",
        "humidity": "58",
        "reporttime": new Date().toISOString()
    };
    
    // 更新UI
    updateWeatherUI(mockWeatherData);
    
    // 生成模拟预报数据
    const mockForecast = generateMockForecastData(mockWeatherData);
    updateForecastUI(mockForecast);
    
    // 模拟UV级别
    const uvLevel = calculateUVLevel(mockWeatherData);
    updateUVIndicator(uvLevel);
    
    // 生成洗车日期建议
    calculateCarWashDates();
    
    // 生成穿搭建议
    updateOutfitRecommendations(mockWeatherData);
    
    // 模拟加载成功消息
    showToast('天气数据加载成功');
    
    console.log('天气数据初始化完成');
}

/**
 * 获取天气数据
 * @param {string} city 城市名称
 */
function fetchWeatherData(city) {
    console.log('正在获取城市天气:', city);
    
    // 更新数据获取状态提示
    document.getElementById('today-desc').textContent = '数据获取中...';
    
    try {
        // 模拟天气数据获取成功
        setTimeout(() => {
            // 随机选择天气状况
            const weathers = ['晴', '多云', '阴', '小雨', '中雨'];
            const weatherIndex = Math.floor(Math.random() * weathers.length);
            const weather = weathers[weatherIndex];
            
            // 生成介于15-30之间的随机温度
            const temperature = Math.floor(Math.random() * 15) + 15;
            
            // 创建模拟天气数据
            const weatherData = {
                "city": city,
                "weather": weather,
                "temperature": temperature.toString(),
                "windpower": "≤3",
                "humidity": Math.floor(Math.random() * 40) + 40, // 40-80%之间的湿度
                "reporttime": new Date().toISOString()
            };
            
            // 更新状态
            state.weather.current = weatherData;
            state.weather.lastUpdated = new Date();
            
            // 更新UI
            updateWeatherUI(weatherData);
            
            // 获取未来天气预报
            fetchForecastData(city);
            
            // 计算UV级别
            const uvLevel = calculateUVLevel(weatherData);
            updateUVIndicator(uvLevel);
            
            // 生成洗车日期建议
            calculateCarWashDates();
            
            // 生成穿搭建议
            updateOutfitRecommendations(weatherData);
            
            console.log('天气数据获取成功:', weatherData);
        }, 800);
        
    } catch (error) {
        console.error('获取天气数据出错:', error);
        showErrorMessage('无法获取天气数据，请稍后再试');
        
        // 使用默认/模拟数据
        const mockWeatherData = {
            "city": city,
            "weather": "晴",
            "temperature": "22",
            "windpower": "≤3",
            "humidity": "58",
            "reporttime": new Date().toISOString()
        };
        
        updateWeatherUI(mockWeatherData);
    }
}

/**
 * 获取天气预报数据
 * @param {string} city 城市名称
 */
function fetchForecastData(city) {
    console.log('正在获取未来预报:', city);
    
    try {
        // 根据当前天气生成模拟预报数据
        const forecastData = generateMockForecastData(state.weather.current);
        
        // 更新状态
        state.weather.forecast = forecastData;
        
        // 更新UI
        updateForecastUI(forecastData);
        
        console.log('预报数据获取成功');
    } catch (error) {
        console.error('获取预报数据出错:', error);
        showErrorMessage('无法获取天气预报，使用预估数据');
    }
}

/**
 * 生成模拟预报数据（实际应用中应替换为API调用）
 * @param {Object} currentWeather - 当前天气数据
 * @returns {Array} 预报数据数组
 */
function generateMockForecastData(currentWeather) {
    if (!currentWeather) return [];
    
    const forecasts = [];
    const now = new Date();
    const weatherTypes = ['晴', '多云', '阴', '小雨', '中雨', '大雨', '小雪', '中雪'];
    const currentTemp = parseInt(currentWeather.temperature);
    
    // 生成未来3天的模拟数据
    for (let i = 1; i <= 3; i++) {
        const forecastDate = new Date(now);
        forecastDate.setDate(now.getDate() + i);
        
        // 随机生成天气，但偏向于当前天气类型
        const randomWeatherIndex = Math.floor(Math.random() * weatherTypes.length);
        let forecastWeather = weatherTypes[randomWeatherIndex];
        
        // 随机生成温度，但基于当前温度有小幅波动
        const tempChange = Math.floor(Math.random() * 7) - 3; // -3 到 3 的随机值
        const forecastTemp = currentTemp + tempChange;
        
        // 随机生成湿度
        const forecastHumidity = Math.floor(Math.random() * 30) + 50; // 50 到 80 之间
        
        // 生成随机风向
        const windDirections = ['东', '南', '西', '北', '东北', '东南', '西北', '西南'];
        const randomWindIndex = Math.floor(Math.random() * windDirections.length);
        const forecastWindDirection = windDirections[randomWindIndex];
        
        // 生成随机风力
        const forecastWindPower = Math.floor(Math.random() * 5) + 1; // 1 到 5 级
        
        forecasts.push({
            date: forecastDate.toISOString().split('T')[0],
            dayOfWeek: ['周日', '周一', '周二', '周三', '周四', '周五', '周六'][forecastDate.getDay()],
            weather: forecastWeather,
            temperature: forecastTemp.toString(),
            humidity: forecastHumidity.toString(),
            windDirection: forecastWindDirection,
            windPower: forecastWindPower.toString()
        });
    }
    
    return forecasts;
}

/**
 * 更新天气UI
 * @param {object} weatherData 天气数据
 */
function updateWeatherUI(weatherData) {
    if (!weatherData) return;
    
    try {
        console.log('更新天气UI:', weatherData);
        
        const tempElement = document.getElementById('today-temp');
        const descElement = document.getElementById('today-desc');
        const weatherCloud = document.getElementById('weather-cloud');
        
        if (!tempElement || !descElement || !weatherCloud) {
            console.error('找不到天气UI元素');
            return;
        }
        
        // 更新温度
        if (weatherData.temperature) {
            tempElement.textContent = `${weatherData.temperature}°C`;
        } else {
            tempElement.textContent = '--°C';
        }
        
        // 更新天气描述
        if (weatherData.weather) {
            descElement.textContent = weatherData.weather;
            
            // 根据天气状况更新云朵表情和样式
            weatherCloud.classList.remove('rain', 'sad');
            
            if (weatherData.weather.includes('雨')) {
                weatherCloud.classList.add('rain');
            } else if (weatherData.weather.includes('阴')) {
                weatherCloud.classList.add('sad');
            }
        } else {
            descElement.textContent = '未知天气';
        }
        
        // 更新天气建议
        generateWeatherSuggestions(weatherData);
        
    } catch (error) {
        console.error('更新天气UI出错:', error);
    }
}

/**
 * 更新天气预报UI
 * @param {Array} forecastData 预报数据
 */
function updateForecastUI(forecastData) {
    if (!forecastData || !Array.isArray(forecastData) || forecastData.length < 2) {
        console.error('预报数据无效');
        return;
    }
    
    try {
        console.log('更新预报UI:', forecastData);
        
        // 获取UI元素
        const tomorrowForecast = document.getElementById('tomorrow-forecast');
        const dayAfterForecast = document.getElementById('day-after-forecast');
        
        if (!tomorrowForecast || !dayAfterForecast) {
            console.error('找不到预报UI元素');
            return;
        }
        
        // 更新明天预报
        const tomorrow = forecastData[0];
        tomorrowForecast.innerHTML = `
            <div>${tomorrow.weather}</div>
            <div>${tomorrow.temperature}°C</div>
            <div>${tomorrow.wind || '微风'}</div>
        `;
        
        // 更新后天预报
        const dayAfter = forecastData[1];
        dayAfterForecast.innerHTML = `
            <div>${dayAfter.weather}</div>
            <div>${dayAfter.temperature}°C</div>
            <div>${dayAfter.wind || '微风'}</div>
        `;
        
    } catch (error) {
        console.error('更新预报UI出错:', error);
    }
}

/**
 * 计算UV强度级别
 * @param {object} weather 天气数据
 * @returns {string} UV级别（low, medium, high）
 */
function calculateUVLevel(weather) {
    if (!weather) return 'low';
    
    try {
        console.log('计算UV级别:', weather);
        
        // 默认UV级别为中等
        let uvLevel = 'medium';
        
        // 根据天气状况调整UV级别
        if (weather.weather) {
            const weatherDesc = weather.weather;
            
            // 雨雪天气，UV级别低
            if (weatherDesc.includes('雨') || 
                weatherDesc.includes('雪') || 
                weatherDesc.includes('雾') || 
                weatherDesc.includes('霾')) {
                uvLevel = 'low';
            } 
            // 晴天，UV级别高
            else if (weatherDesc.includes('晴')) {
                const temperature = parseInt(weather.temperature) || 20;
                
                // 夏季高温晴天，UV更高
                if (temperature > 25) {
                    uvLevel = 'high';
                }
            }
        }
        
        // 更新状态
        state.uvLevel = uvLevel;
        
        // 更新UI显示
        updateUVIndicator(uvLevel);
        
        return uvLevel;
        
    } catch (error) {
        console.error('计算UV级别出错:', error);
        return 'medium'; // 默认返回中等级别
    }
}

/**
 * 更新UV指示灯显示
 * @param {string} level UV级别 (low, medium, high)
 */
function updateUVIndicator(level) {
    try {
        console.log('更新UV指示灯:', level);
        
        // 获取UI元素
        const uvLow = document.getElementById('uv-low');
        const uvMedium = document.getElementById('uv-medium');
        const uvHigh = document.getElementById('uv-high');
        
        if (!uvLow || !uvMedium || !uvHigh) {
            console.warn('找不到UV指示灯元素');
            return;
        }
        
        // 重置所有灯
        uvLow.classList.remove('active');
        uvMedium.classList.remove('active');
        uvHigh.classList.remove('active');
        
        // 根据级别点亮相应灯
        switch (level) {
            case 'low':
                uvLow.classList.add('active');
                break;
            case 'medium':
                uvMedium.classList.add('active');
                break;
            case 'high':
                uvHigh.classList.add('active');
                break;
            default:
                // 默认显示中等级别
                uvMedium.classList.add('active');
        }
        
    } catch (error) {
        console.error('更新UV指示灯出错:', error);
    }
}

/**
 * 根据天气数据生成建议
 * @param {object} weatherData 天气数据
 */
function generateWeatherSuggestions(weatherData) {
    if (!weatherData) return;
    
    try {
        console.log('生成天气建议:', weatherData);
        
        const weatherSuggestions = document.getElementById('weather-suggestions');
        if (!weatherSuggestions) return;
        
        // 根据天气和温度生成建议
        const temperature = parseInt(weatherData.temperature) || 20;
        const weatherDesc = weatherData.weather || '晴';
        
        const suggestionList = [];
        
        // 温度相关建议
        if (temperature >= 30) {
            suggestionList.push('天气炎热，注意防暑降温，多补充水分');
            suggestionList.push('外出请做好防晒措施，佩戴遮阳帽和太阳镜');
        } else if (temperature >= 25) {
            suggestionList.push('天气较热，注意适当补充水分');
            suggestionList.push('紫外线较强，外出建议涂抹防晒霜');
        } else if (temperature >= 15) {
            suggestionList.push('天气舒适，适合户外活动');
        } else if (temperature >= 5) {
            suggestionList.push('天气转凉，注意适当添加衣物');
        } else {
            suggestionList.push('天气寒冷，注意保暖，预防感冒');
            suggestionList.push('室内注意保持通风，预防呼吸道疾病');
        }
        
        // 天气状况相关建议
        if (weatherDesc.includes('雨')) {
            suggestionList.push('降雨天气，外出请携带雨伞');
            suggestionList.push('道路湿滑，驾车注意安全');
        } else if (weatherDesc.includes('雪')) {
            suggestionList.push('雪天路滑，注意防滑');
            suggestionList.push('驾车请减速慢行，保持安全距离');
        } else if (weatherDesc.includes('雾') || weatherDesc.includes('霾')) {
            suggestionList.push('能见度低，驾车注意安全');
            suggestionList.push('空气质量较差，建议戴口罩出行');
        } else if (weatherDesc.includes('晴')) {
            suggestionList.push('阳光充足，适合户外活动和晾晒衣物');
        }
        
        // 随机选择2-3条建议显示
        const displaySuggestions = suggestionList.length > 3 
            ? suggestionList.sort(() => 0.5 - Math.random()).slice(0, 3) 
            : suggestionList;
        
        // 更新建议UI
        weatherSuggestions.innerHTML = displaySuggestions.map(s => `<div>• ${s}</div>`).join('');
        
    } catch (error) {
        console.error('生成天气建议出错:', error);
    }
}

/**
 * 计算适合洗车的日期
 */
function calculateCarWashDates() {
    try {
        console.log('计算洗车日期');
        
        const carWashDates = document.getElementById('car-wash-dates');
        if (!carWashDates) return;
        
        // 获取未来7天的日期
        const dates = [];
        const today = new Date();
        
        for (let i = 0; i < 7; i++) {
            const date = new Date();
            date.setDate(today.getDate() + i);
            dates.push(date);
        }
        
        // 简单模拟：随机选择2-3天作为适合洗车的日期
        const goodDates = [];
        const numGoodDates = Math.floor(Math.random() * 2) + 2; // 2-3天
        
        // 已选择的日期索引，避免重复
        const selectedIndices = new Set();
        
        while (goodDates.length < numGoodDates) {
            // 随机选择一天
            const randomIndex = Math.floor(Math.random() * 7);
            
            // 避免重复选择同一天
            if (!selectedIndices.has(randomIndex)) {
                selectedIndices.add(randomIndex);
                
                const date = dates[randomIndex];
                const formattedDate = `${date.getMonth() + 1}月${date.getDate()}日`;
                const dayOfWeek = ['日', '一', '二', '三', '四', '五', '六'][date.getDay()];
                
                goodDates.push({
                    date: formattedDate,
                    dayOfWeek: `周${dayOfWeek}`,
                    weather: ['晴', '多云', '晴转多云'][Math.floor(Math.random() * 3)],
                    precipitation: 0
                });
            }
        }
        
        // 按日期排序
        goodDates.sort((a, b) => {
            const aDate = new Date(a.date.replace('月', '/').replace('日', ''));
            const bDate = new Date(b.date.replace('月', '/').replace('日', ''));
            return aDate - bDate;
        });
        
        // 更新UI
        carWashDates.innerHTML = goodDates.map(d => `
            <div class="car-wash-date">
                <div class="date">${d.date}</div>
                <div class="day">${d.dayOfWeek}</div>
                <div class="weather">${d.weather}</div>
            </div>
        `).join('');
        
        // 更新状态
        state.carWashDates = goodDates;
        
    } catch (error) {
        console.error('计算洗车日期出错:', error);
    }
}

/**
 * 显示错误消息
 * @param {string} message - 错误消息
 */
function showErrorMessage(message) {
    console.error(message);
    
    // 在UI上显示错误信息
    const todayTemp = document.getElementById('today-temp');
    const todayDesc = document.getElementById('today-desc');
    
    if (todayTemp) {
        todayTemp.textContent = '--°C';
    }
    
    if (todayDesc) {
        todayDesc.textContent = '数据获取失败';
    }
    
    // 更新预报UI
    const tomorrowForecast = document.getElementById('tomorrow-forecast');
    const dayAfterForecast = document.getElementById('day-after-forecast');
    
    if (tomorrowForecast) {
        tomorrowForecast.textContent = '无法获取预报';
    }
    
    if (dayAfterForecast) {
        dayAfterForecast.textContent = '无法获取预报';
    }
}

/**
 * 根据天气数据更新穿搭推荐
 * @param {object} weatherData 天气数据
 */
function updateOutfitRecommendations(weatherData) {
    console.log('更新穿搭推荐:', weatherData);
    
    try {
        // 生成基于天气的穿搭建议
        const outfit = generateOutfitBasedOnWeather(weatherData);
        
        // 更新UI
        updateOutfitUI(outfit.top, outfit.bottom, outfit.shoes, outfit.outerwear, outfit.accessories);
        
        // 更新穿搭建议文字说明
        updateOutfitSuggestion(outfit.top, outfit.bottom, outfit.shoes, outfit.outerwear, outfit.accessories);
    } catch (error) {
        console.error('更新穿搭推荐出错:', error);
    }
}

/**
 * 根据天气生成穿搭建议
 * @param {object} weather 天气数据
 * @returns {object} 穿搭建议
 */
function generateOutfitBasedOnWeather(weather) {
    console.log('生成天气穿搭:', weather);
    
    // 默认穿搭，确保始终有值
    const defaultOutfit = {
        top: {
            name: '纯棉T恤',
            color: '白色',
            image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0id2hpdGUiLz48dGV4dCB4PSI1MCIgeT0iNTAiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxMiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iYmxhY2siPlTmg4U8L3RleHQ+PC9zdmc+'
        },
        bottom: {
            name: '牛仔裤',
            color: '蓝色',
            image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iYmx1ZSIvPjx0ZXh0IHg9IjUwIiB5PSI1MCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjEyIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSJibGFjayI+6JmO5LuT6KOF5L2P77yI6buEJiMzOTvvvIk8L3RleHQ+PC9zdmc+'
        },
        shoes: {
            name: '休闲鞋',
            color: '黑色',
            image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iYmxhY2siLz48dGV4dCB4PSI1MCIgeT0iNTAiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxMiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0id2hpdGUiPuS8kemZhOmikemikTwvdGV4dD48L3N2Zz4='
        },
        outerwear: null,
        accessories: []
    };
    
    if (!weather || !weather.temperature) {
        console.warn('天气数据不完整，使用默认穿搭');
        return defaultOutfit;
    }

    try {
        // 解析温度
        const temperature = parseInt(weather.temperature);
        const weatherDesc = weather.weather || '晴';
        
        // 基于温度和天气选择合适的穿搭
        let outfit = { ...defaultOutfit };
        
        // 为上衣选择颜色
        const topColors = ['白色', '浅蓝色', '米色', '浅粉色', '浅绿色'];
        const randomTopColor = topColors[Math.floor(Math.random() * topColors.length)];
        
        // 为下装选择颜色
        const bottomColors = ['蓝色', '黑色', '灰色', '藏青色', '卡其色'];
        const randomBottomColor = bottomColors[Math.floor(Math.random() * bottomColors.length)];
        
        // 为鞋子选择颜色
        const shoeColors = ['黑色', '白色', '棕色', '灰色'];
        const randomShoeColor = shoeColors[Math.floor(Math.random() * shoeColors.length)];
        
        // 温度分级处理 - 高温（>25°C）
        if (temperature > 25) {
            outfit.top = {
                name: '短袖T恤',
                color: randomTopColor,
                image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2YwZjBmMCIvPjx0ZXh0IHg9IjUwIiB5PSI1MCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjEyIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSJibGFjayI+55+t6KKEVOeBrzwvdGV4dD48L3N2Zz4='
            };
            outfit.bottom = {
                name: '休闲短裤',
                color: randomBottomColor,
                image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2RkZGRkZCIvPjx0ZXh0IHg9IjUwIiB5PSI1MCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjEyIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSJibGFjayI+55+t6KKE55+t6KOF77yI5bem77yJPC90ZXh0Pjwvc3ZnPg=='
            };
            outfit.shoes = {
                name: '凉鞋',
                color: randomShoeColor,
                image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2Y4ZjhmOCIvPjx0ZXh0IHg9IjUwIiB5PSI1MCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjEyIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSJibGFjayI+5YaS6buEPC90ZXh0Pjwvc3ZnPg=='
            };
            
            // 如果是多云或阴天，增加配件
            if (weatherDesc.includes('多云') || weatherDesc.includes('阴')) {
                outfit.accessories.push({
                    name: '太阳镜',
                    image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iIzMzMzhkZCIvPjx0ZXh0IHg9IjUwIiB5PSI1MCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjEyIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSJ3aGl0ZSI+5aSp6Ziz6ZWcPC90ZXh0Pjwvc3ZnPg=='
                });
            }
        }
        // 温度适中（15-25°C）
        else if (temperature >= 15 && temperature <= 25) {
            outfit.top = {
                name: '长袖T恤',
                color: randomTopColor,
                image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2YwZjBmMCIvPjx0ZXh0IHg9IjUwIiB5PSI1MCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjEyIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSJibGFjayI+6ZW/6KKEVOeBrzwvdGV4dD48L3N2Zz4='
            };
            outfit.bottom = {
                name: '牛仔裤',
                color: randomBottomColor,
                image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2JiYzhmMCIvPjx0ZXh0IHg9IjUwIiB5PSI1MCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjEyIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSJibGFjayI+54mp5L2P6KOF</dGV4dD48L3N2Zz4='
            };
            outfit.shoes = {
                name: '休闲鞋',
                color: randomShoeColor,
                image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iIzgwODA4MCIvPjx0ZXh0IHg9IjUwIiB5PSI1MCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjEyIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSJ3aGl0ZSI+5LyR6Zmk6aKR6aKRPC90ZXh0Pjwvc3ZnPg=='
            };
            
            // 如果温度偏低，添加轻薄外套
            if (temperature < 20) {
                outfit.outerwear = {
                    name: '轻薄夹克',
                    color: randomTopColor,
                    image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2QwZDBkMCIvPjx0ZXh0IHg9IjUwIiB5PSI1MCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjEyIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSJibGFjayI+6L275bCR5aSW5aS06YCN5aS0</dGV4dD48L3N2Zz4='
                };
            }
        }
        // 低温（<15°C）
        else {
            outfit.top = {
                name: '长袖衬衫',
                color: randomTopColor,
                image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2YwZjBmMCIvPjx0ZXh0IHg9IjUwIiB5PSI1MCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjEyIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSJibGFjayI+6ZW/6KKE6KOB6KGM</dGV4dD48L3N2Zz4='
            };
            outfit.bottom = {
                name: '休闲裤',
                color: randomBottomColor,
                image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iIzgwODA4MCIvPjx0ZXh0IHg9IjUwIiB5PSI1MCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjEyIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSJ3aGl0ZSI+5LyR6Zmk6KOF</dGV4dD48L3N2Zz4='
            };
            outfit.shoes = {
                name: '皮鞋或靴子',
                color: randomShoeColor,
                image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iIzU1NTU1NSIvPjx0ZXh0IHg9IjUwIiB5PSI1MCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjEyIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSJ3aGl0ZSI+55qu6ZuG5oiW6Z2Z5a2Q</dGV4dD48L3N2Zz4='
            };
            outfit.outerwear = {
                name: '厚实外套',
                color: randomTopColor,
                image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iIzgwODA4MCIvPjx0ZXh0IHg9IjUwIiB5PSI1MCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjEyIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSJ3aGl0ZSI+5Y6f5LmZ5aSW5aS0</dGV4dD48L3N2Zz4='
            };
            
            // 天气寒冷时增加围巾
            if (temperature < 10) {
                outfit.accessories.push({
                    name: '围巾',
                    color: '红色',
                    image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2ZmNDQ0NCIvPjx0ZXh0IHg9IjUwIiB5PSI1MCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjEyIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSJ3aGl0ZSI+5Za35Zy+PC90ZXh0Pjwvc3ZnPg=='
                });
            }
        }
        
        // 根据天气状况添加配件
        if (weatherDesc.includes('雨')) {
            outfit.accessories.push({
                name: '雨伞',
                color: '彩色',
                image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2ZmZmZmZiIvPjx0ZXh0IHg9IjUwIiB5PSI1MCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjEyIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSJibGFjayI+6Zuo5Ly0</dGV4dD48L3N2Zz4='
            });
        } else if (weatherDesc.includes('晴')) {
            outfit.accessories.push({
                name: '棒球帽',
                color: '深蓝色',
                image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iIzMzMzhkZCIvPjx0ZXh0IHg9IjUwIiB5PSI1MCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjEyIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSJ3aGl0ZSI+5qSN55CD5biFPC90ZXh0Pjwvc3ZnPg=='
            });
        }
        
        return outfit;
    } catch (error) {
        console.error('生成穿搭建议出错:', error);
        return defaultOutfit;
    }
}

/**
 * 更新穿搭UI显示
 * @param {object} top 上衣信息
 * @param {object} bottom 下装信息
 * @param {object} shoes 鞋子信息
 * @param {object} outerwear 外套信息（可选）
 * @param {array} accessories 配件信息（可选）
 */
function updateOutfitUI(top, bottom, shoes, outerwear, accessories) {
    console.log('更新穿搭UI:', top, bottom, shoes);
    
    try {
        // 更新模特穿搭
        const modelTop = document.querySelector('.model-top');
        const modelBottom = document.querySelector('.model-bottom');
        const modelHead = document.querySelector('.model-head');
        
        if (modelTop && top) {
            // 设置上衣样式和颜色
            modelTop.style.backgroundColor = top.color || '#f0f0f0';
            if (top.image) {
                modelTop.style.backgroundImage = `url(${top.image})`;
                modelTop.style.backgroundSize = 'cover';
            }
        }
        
        if (modelBottom && bottom) {
            // 设置下装样式和颜色
            modelBottom.style.backgroundColor = bottom.color || '#555';
            if (bottom.image) {
                modelBottom.style.backgroundImage = `url(${bottom.image})`;
                modelBottom.style.backgroundSize = 'cover';
            }
        }
        
        // 更新穿搭描述
        const topRecommendation = document.getElementById('top-recommendation');
        const bottomRecommendation = document.getElementById('bottom-recommendation');
        const shoesRecommendation = document.getElementById('shoes-recommendation');
        const outerwearRecommendation = document.getElementById('outerwear-recommendation');
        
        if (topRecommendation && top) {
            topRecommendation.textContent = `${top.color || ''} ${top.name || ''}`.trim();
        }
        
        if (bottomRecommendation && bottom) {
            bottomRecommendation.textContent = `${bottom.color || ''} ${bottom.name || ''}`.trim();
        }
        
        if (shoesRecommendation && shoes) {
            shoesRecommendation.textContent = `${shoes.color || ''} ${shoes.name || ''}`.trim();
        }
        
        if (outerwearRecommendation) {
            if (outerwear) {
                outerwearRecommendation.textContent = `${outerwear.color || ''} ${outerwear.name || ''}`.trim();
                outerwearRecommendation.parentElement.style.display = 'flex';
            } else {
                outerwearRecommendation.textContent = '今天温度适宜，无需外套';
                outerwearRecommendation.parentElement.style.display = 'none';
            }
        }
        
        // 更新配件（如果有）
        const accessoriesRecommendation = document.getElementById('accessories-recommendation');
        if (accessoriesRecommendation) {
            if (accessories && accessories.length > 0) {
                const accessoryNames = accessories.map(a => a.name).join('、');
                accessoriesRecommendation.textContent = accessoryNames;
                accessoriesRecommendation.parentElement.style.display = 'flex';
            } else {
                accessoriesRecommendation.textContent = '无需特殊配件';
                accessoriesRecommendation.parentElement.style.display = 'none';
            }
        }
    } catch (error) {
        console.error('更新穿搭UI出错:', error);
    }
}

/**
 * 更新穿搭建议文本
 * @param {object} top - 上装
 * @param {object} bottom - 下装
 * @param {object} shoes - 鞋子
 * @param {object} outerwear - 外套
 * @param {Array} accessories - 配件
 */
function updateOutfitSuggestion(top, bottom, shoes, outerwear, accessories) {
    try {
        const suggestionElement = document.getElementById('outfit-suggestion');
        
        if (!suggestionElement) return;
        
        let suggestion = `今天建议穿${top.name}搭配${bottom.name}，`;
        
        if (outerwear) {
            suggestion += `外搭${outerwear.name}，`;
        }
        
        suggestion += `脚上穿${shoes.name}。`;
        
        if (accessories && accessories.length > 0) {
            suggestion += `别忘了带上${accessories.map(a => a.name).join('和')}哦！`;
        }
        
        suggestionElement.textContent = suggestion;
    } catch (error) {
        console.error('更新穿搭建议文本出错:', error);
    }
}

/**
 * 生成一套随机穿搭
 */
function generateRandomOutfit() {
    console.log('生成随机穿搭');
    
    try {
        // 随机上衣
        const tops = [
            { name: '棉质T恤', color: '白色' },
            { name: '休闲衬衫', color: '浅蓝色' },
            { name: '针织衫', color: '米色' },
            { name: 'POLO衫', color: '浅绿色' },
            { name: '卫衣', color: '灰色' }
        ];
        
        // 随机下装
        const bottoms = [
            { name: '牛仔裤', color: '蓝色' },
            { name: '休闲裤', color: '卡其色' },
            { name: '运动裤', color: '黑色' },
            { name: '短裤', color: '灰色' },
            { name: '半身裙', color: '海军蓝' }
        ];
        
        // 随机鞋子
        const shoes = [
            { name: '运动鞋', color: '白色' },
            { name: '休闲鞋', color: '棕色' },
            { name: '帆布鞋', color: '黑色' },
            { name: '凉鞋', color: '米色' },
            { name: '皮鞋', color: '黑色' }
        ];
        
        // 随机选择
        const randomTop = tops[Math.floor(Math.random() * tops.length)];
        const randomBottom = bottoms[Math.floor(Math.random() * bottoms.length)];
        const randomShoes = shoes[Math.floor(Math.random() * shoes.length)];
        
        // 为每个物品添加占位图
        const topName = randomTop.name;
        const bottomName = randomBottom.name;
        const shoesName = randomShoes.name;
        
        randomTop.image = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2YwZjBmMCIvPjx0ZXh0IHg9IjUwIiB5PSI1MCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjEyIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSJibGFjayI+VFNoaXJ0PC90ZXh0Pjwvc3ZnPg==';
        randomBottom.image = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2RkZGRkZCIvPjx0ZXh0IHg9IjUwIiB5PSI1MCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjEyIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSJibGFjayI+UGFudHM8L3RleHQ+PC9zdmc+';
        randomShoes.image = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iIzgwODA4MCIvPjx0ZXh0IHg9IjUwIiB5PSI1MCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjEyIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSJ3aGl0ZSI+U2hvZXM8L3RleHQ+PC9zdmc+';
        
        // 随机决定是否有外套
        let randomOuterwear = null;
        if (Math.random() > 0.7) {
            const outerwears = [
                { name: '牛仔外套', color: '浅蓝色' },
                { name: '开襟衫', color: '灰色' },
                { name: '轻薄夹克', color: '黑色' }
            ];
            randomOuterwear = outerwears[Math.floor(Math.random() * outerwears.length)];
            randomOuterwear.image = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2QwZDBkMCIvPjx0ZXh0IHg9IjUwIiB5PSI1MCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjEyIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSJibGFjayI+SmFja2V0PC90ZXh0Pjwvc3ZnPg==';
        }
        
        // 随机决定是否有配件
        const accessories = [];
        if (Math.random() > 0.6) {
            const accessoryOptions = [
                { name: '太阳镜', color: '黑色' },
                { name: '帽子', color: '藏青色' },
                { name: '手表', color: '银色' },
                { name: '围巾', color: '红色' }
            ];
            accessories.push(accessoryOptions[Math.floor(Math.random() * accessoryOptions.length)]);
        }
        
        // 更新UI
        updateOutfitUI(randomTop, randomBottom, randomShoes, randomOuterwear, accessories);
        
        // 更新状态
        state.outfit = {
            top: randomTop,
            bottom: randomBottom,
            shoes: randomShoes,
            outerwear: randomOuterwear,
            accessories: accessories
        };
        
    } catch (error) {
        console.error('生成随机穿搭出错:', error);
    }
}

/**
 * 加载用户数据
 */
function loadUserData() {
    // 从localStorage加载用户配置
    const savedProfile = localStorage.getItem('cuime_user_profile');
    const savedWardrobe = localStorage.getItem('cuime_user_wardrobe');
    
    if (savedProfile) {
        try {
            const profile = JSON.parse(savedProfile);
            state.userProfile = {...state.userProfile, ...profile};
            
            // 更新UI
            updateUserProfileUI();
            
            console.log('用户配置已加载');
        } catch (error) {
            console.error('解析用户配置出错:', error);
        }
    }
    
    if (savedWardrobe) {
        try {
            const wardrobe = JSON.parse(savedWardrobe);
            state.wardrobe = {...state.wardrobe, ...wardrobe};
            
            // 更新UI
            updateWardrobeUI();
            
            console.log('衣柜数据已加载');
        } catch (error) {
            console.error('解析衣柜数据出错:', error);
        }
    }
}

/**
 * 更新用户资料UI
 */
function updateUserProfileUI() {
    // 更新表单字段
    const heightInput = document.getElementById('user-height');
    const weightInput = document.getElementById('user-weight');
    const genderSelect = document.getElementById('user-gender');
    
    if (heightInput && state.userProfile.height) {
        heightInput.value = state.userProfile.height;
    }
    
    if (weightInput && state.userProfile.weight) {
        weightInput.value = state.userProfile.weight;
    }
    
    if (genderSelect && state.userProfile.gender) {
        genderSelect.value = state.userProfile.gender;
    }
    
    // 更新健康状况选项
    state.userProfile.healthConditions.forEach(condition => {
        const checkbox = document.getElementById(`health-${condition}`);
        if (checkbox) {
            checkbox.checked = true;
        }
    });
    
    // 更新自拍图像
    if (state.faceData.selfie) {
        const selfiePreview = document.getElementById('selfie-preview');
        if (selfiePreview) {
            selfiePreview.src = state.faceData.selfie;
            selfiePreview.style.display = 'block';
        }
    }
}

/**
 * 更新衣柜UI
 */
function updateWardrobeUI() {
    // 更新衣柜数量统计
    const topsCount = document.getElementById('tops-count');
    const bottomsCount = document.getElementById('bottoms-count');
    const shoesCount = document.getElementById('shoes-count');
    
    if (topsCount) {
        topsCount.textContent = state.wardrobe.tops.length;
    }
    
    if (bottomsCount) {
        bottomsCount.textContent = state.wardrobe.bottoms.length;
    }
    
    if (shoesCount) {
        shoesCount.textContent = state.wardrobe.shoes.length;
    }
    
    // 衣柜详细列表（如果有UI元素）
    const topsContainer = document.getElementById('tops-container');
    const bottomsContainer = document.getElementById('bottoms-container');
    const shoesContainer = document.getElementById('shoes-container');
    
    if (topsContainer) {
        topsContainer.innerHTML = '';
        state.wardrobe.tops.forEach(item => {
            const itemElement = document.createElement('div');
            itemElement.className = 'wardrobe-item';
            itemElement.innerHTML = `
                <span>${item.name}</span>
                ${item.image ? `<img src="${item.image}" alt="${item.name}">` : ''}
                <span>${item.color}</span>
            `;
            topsContainer.appendChild(itemElement);
        });
    }
    
    if (bottomsContainer) {
        bottomsContainer.innerHTML = '';
        state.wardrobe.bottoms.forEach(item => {
            const itemElement = document.createElement('div');
            itemElement.className = 'wardrobe-item';
            itemElement.innerHTML = `
                <span>${item.name}</span>
                ${item.image ? `<img src="${item.image}" alt="${item.name}">` : ''}
                <span>${item.color}</span>
            `;
            bottomsContainer.appendChild(itemElement);
        });
    }
    
    if (shoesContainer) {
        shoesContainer.innerHTML = '';
        state.wardrobe.shoes.forEach(item => {
            const itemElement = document.createElement('div');
            itemElement.className = 'wardrobe-item';
            itemElement.innerHTML = `
                <span>${item.name}</span>
                ${item.image ? `<img src="${item.image}" alt="${item.name}">` : ''}
                <span>${item.color}</span>
            `;
            shoesContainer.appendChild(itemElement);
        });
    }
}

/**
 * 保存用户资料
 */
function saveUserProfile() {
    const heightInput = document.getElementById('user-height');
    const weightInput = document.getElementById('user-weight');
    const genderSelect = document.getElementById('user-gender');
    
    // 获取健康状况复选框
    const healthCheckboxes = document.querySelectorAll('.health-checkbox:checked');
    const healthConditions = Array.from(healthCheckboxes).map(cb => cb.value);
    
    // 更新状态
    if (heightInput) state.userProfile.height = heightInput.value;
    if (weightInput) state.userProfile.weight = weightInput.value;
    if (genderSelect) state.userProfile.gender = genderSelect.value;
    state.userProfile.healthConditions = healthConditions;
    
    // 保存到localStorage
    localStorage.setItem('cuime_user_profile', JSON.stringify(state.userProfile));
    
    // 显示保存成功消息
    showToast('用户资料已保存');
    
    // 关闭用户资料面板
    const userProfilePanel = document.getElementById('user-profile-panel');
    if (userProfilePanel) {
        userProfilePanel.classList.remove('active');
    }
    
    // 更新穿搭推荐
    if (state.weather.current) {
        generateOutfitBasedOnWeather(state.weather.current);
    }
}

/**
 * 处理自拍上传
 * @param {File} file - 上传的文件
 */
function handleSelfieUpload(file) {
    if (!file || !file.type.startsWith('image/')) {
        showToast('请上传有效的图片文件');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
        const selfiePreview = document.getElementById('selfie-preview');
        if (selfiePreview) {
            selfiePreview.src = e.target.result;
            selfiePreview.style.display = 'block';
            
            // 更新状态
            state.faceData.selfie = e.target.result;
            
            // 此处可添加面部分析代码
            analyzeFaceShape(e.target.result);
            
            // 保存到localStorage
            localStorage.setItem('cuime_face_data', JSON.stringify(state.faceData));
        }
    };
    
    reader.readAsDataURL(file);
}

/**
 * 分析脸型
 * @param {string} imageData - Base64编码的图像数据
 */
function analyzeFaceShape(imageData) {
    // 实际应用中这里应该调用面部识别API
    // 这里简化为随机选择一个脸型
    const faceShapes = ['圆形', '椭圆形', '方形', '长方形', '心形', '钻石形'];
    const skinTones = ['偏白', '中性', '偏黄', '小麦色', '橄榄色', '深色'];
    
    const randomFaceShape = faceShapes[Math.floor(Math.random() * faceShapes.length)];
    const randomSkinTone = skinTones[Math.floor(Math.random() * skinTones.length)];
    
    state.faceData.faceShape = randomFaceShape;
    state.faceData.skinTone = randomSkinTone;
    
    // 更新UI
    const faceShapeDisplay = document.getElementById('face-shape-result');
    const skinToneDisplay = document.getElementById('skin-tone-result');
    
    if (faceShapeDisplay) {
        faceShapeDisplay.textContent = randomFaceShape;
    }
    
    if (skinToneDisplay) {
        skinToneDisplay.textContent = randomSkinTone;
    }
    
    // 根据分析结果生成建议
    generateFaceStyleSuggestions(randomFaceShape, randomSkinTone);
}

/**
 * 根据脸型和肤色生成风格建议
 * @param {string} faceShape - 脸型
 * @param {string} skinTone - 肤色
 */
function generateFaceStyleSuggestions(faceShape, skinTone) {
    const suggestionElement = document.getElementById('face-style-suggestions');
    
    if (!suggestionElement) return;
    
    let suggestions = '';
    
    // 根据脸型给出建议
    switch (faceShape) {
        case '圆形':
            suggestions += '圆形脸适合棱角分明的眼镜框，如方形或矩形；';
            suggestions += '发型可选择顶部蓬松、侧分或有高度的造型，避免齐刘海；';
            break;
        case '椭圆形':
            suggestions += '椭圆形脸是最理想的脸型，几乎适合所有眼镜和发型；';
            suggestions += '可以尝试各种风格，如短发、长发、刘海等；';
            break;
        case '方形':
            suggestions += '方形脸适合圆形或椭圆形眼镜架，软化脸部轮廓；';
            suggestions += '发型可选择层次感发型或偏软的卷发，避免直发；';
            break;
        case '长方形':
            suggestions += '长方形脸适合较宽的眼镜框，使脸部显得更短；';
            suggestions += '发型可选择有刘海或侧分的中短发，增加横向宽度；';
            break;
        case '心形':
            suggestions += '心形脸适合下部加重的眼镜框，平衡宽额头；';
            suggestions += '发型可选择中长发或长卷发，注意不要在头顶增加过多体积；';
            break;
        case '钻石形':
            suggestions += '钻石形脸适合上部加重的眼镜框；';
            suggestions += '发型可选择有刘海或增加两侧体积的样式；';
            break;
    }
    
    // 根据肤色给出建议
    switch (skinTone) {
        case '偏白':
            suggestions += '肤色偏白适合冷色调如蓝色、紫色、粉色；';
            suggestions += '建议避免过于鲜艳的橙色和黄色；';
            break;
        case '中性':
            suggestions += '中性肤色几乎适合所有颜色；';
            suggestions += '特别适合绿色、蓝色等中性色调；';
            break;
        case '偏黄':
            suggestions += '肤色偏黄适合米色、棕色、绿色等暖色调；';
            suggestions += '建议避免过于鲜艳的黄色和绿色；';
            break;
        case '小麦色':
            suggestions += '小麦色肤色适合秋季色调如深绿、酒红、深蓝；';
            suggestions += '白色和鲜艳色彩会形成漂亮的对比；';
            break;
        case '橄榄色':
            suggestions += '橄榄色肤色适合珊瑚色、绿松石色等亮色；';
            suggestions += '可以尝试金色和铜色的配饰；';
            break;
        case '深色':
            suggestions += '深色肤色适合鲜艳色彩如明亮的红色、黄色、蓝色；';
            suggestions += '白色和金色会非常突出；';
            break;
    }
    
    suggestionElement.textContent = suggestions;
}

/**
 * 处理衣物上传
 * @param {FileList} files - 上传的文件列表
 */
function handleClothesUpload(files) {
    if (!files || files.length === 0) return;
    
    // 对每个文件进行处理
    Array.from(files).forEach(file => {
        if (!file.type.startsWith('image/')) {
            showToast('请上传有效的图片文件');
            return;
        }
        
        const reader = new FileReader();
        reader.onload = function(e) {
            // 显示衣物图片预览
            showClothingPreview(e.target.result);
        };
        
        reader.readAsDataURL(file);
    });
}

/**
 * 显示衣物预览和分类表单
 * @param {string} imageData - Base64编码的图像数据
 */
function showClothingPreview(imageData) {
    // 创建预览元素
    const previewContainer = document.getElementById('clothing-preview-container');
    
    if (!previewContainer) return;
    
    // 清除旧内容
    previewContainer.innerHTML = '';
    
    // 创建新的预览卡
    const previewCard = document.createElement('div');
    previewCard.className = 'clothing-preview-card';
    previewCard.innerHTML = `
        <img src="${imageData}" alt="衣物预览" class="clothing-preview-image">
        <div class="clothing-form">
            <label for="clothing-name">名称:</label>
            <input type="text" id="clothing-name" placeholder="如：白色T恤">
            
            <label for="clothing-type">类型:</label>
            <select id="clothing-type">
                <option value="top">上装</option>
                <option value="bottom">下装</option>
                <option value="shoes">鞋子</option>
            </select>
            
            <label for="clothing-color">颜色:</label>
            <input type="text" id="clothing-color" placeholder="如：白色">
            
            <label for="clothing-season">适合季节:</label>
            <select id="clothing-season">
                <option value="spring">春季</option>
                <option value="summer">夏季</option>
                <option value="autumn">秋季</option>
                <option value="winter">冬季</option>
                <option value="all">四季</option>
            </select>
            
            <button type="button" id="save-clothing-btn">保存到衣柜</button>
        </div>
    `;
    
    previewContainer.appendChild(previewCard);
    
    // 添加保存按钮事件
    const saveBtn = document.getElementById('save-clothing-btn');
    if (saveBtn) {
        saveBtn.addEventListener('click', function() {
            saveClothingItem(imageData);
        });
    }
}

/**
 * 保存衣物项目到衣柜
 * @param {string} imageData - Base64编码的图像数据
 */
function saveClothingItem(imageData) {
    const nameInput = document.getElementById('clothing-name');
    const typeSelect = document.getElementById('clothing-type');
    const colorInput = document.getElementById('clothing-color');
    const seasonSelect = document.getElementById('clothing-season');
    
    if (!nameInput || !typeSelect || !colorInput || !seasonSelect) return;
    
    const name = nameInput.value.trim();
    const type = typeSelect.value;
    const color = colorInput.value.trim();
    const season = seasonSelect.value;
    
    if (!name || !color) {
        showToast('请填写衣物名称和颜色');
        return;
    }
    
    // 创建衣物项目
    const clothingItem = {
        id: Date.now().toString(),
        name,
        color,
        season,
        image: imageData
    };
    
    // 根据类型保存到对应衣柜
    switch (type) {
        case 'top':
            state.wardrobe.tops.push(clothingItem);
            break;
        case 'bottom':
            state.wardrobe.bottoms.push(clothingItem);
            break;
        case 'shoes':
            state.wardrobe.shoes.push(clothingItem);
            break;
    }
    
    // 保存到localStorage
    localStorage.setItem('cuime_user_wardrobe', JSON.stringify(state.wardrobe));
    
    // 更新UI
    updateWardrobeUI();
    
    // 清除预览
    const previewContainer = document.getElementById('clothing-preview-container');
    if (previewContainer) {
        previewContainer.innerHTML = '';
    }
    
    // 显示成功消息
    showToast('衣物已添加到衣柜');
}

/**
 * 显示提示消息
 * @param {string} message - 消息内容
 */
function showToast(message) {
    // 检查是否已经存在toast元素
    let toast = document.getElementById('cuime-toast');
    
    if (!toast) {
        // 创建新的toast元素
        toast = document.createElement('div');
        toast.id = 'cuime-toast';
        document.body.appendChild(toast);
    }
    
    // 设置消息并显示
    toast.textContent = message;
    toast.classList.add('show');
    
    // 3秒后自动隐藏
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
} 