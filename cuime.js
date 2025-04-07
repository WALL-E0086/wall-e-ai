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
    
    // 首先尝试使用高德地图IP定位
    try {
        mcp_amap_maps_maps_ip_location().then(response => {
            if (response && response.status === '1') {
                const locationInfo = response.info || '未知位置';
                const city = response.city || config.defaultCity;
                
                state.userProfile.city = city;
                state.userProfile.location = {
                    province: response.province || '',
                    city: city,
                    rectangle: response.rectangle || ''
                };
                
                if (locationDisplay) {
                    locationDisplay.textContent = `${city}`;
                }
                
                // 使用定位到的城市获取天气
                fetchWeatherData(city);
                
                console.log('IP定位成功:', city);
            } else {
                console.error('IP定位失败:', response);
                
                // 如果失败，使用默认城市
                fallbackToDefaultCity();
            }
        }).catch(error => {
            console.error('IP定位出错:', error);
            fallbackToDefaultCity();
        });
    } catch (error) {
        console.error('无法访问高德地图API:', error);
        fallbackToDefaultCity();
    }
}

/**
 * 回退到默认城市
 */
function fallbackToDefaultCity() {
    const locationDisplay = document.getElementById('current-location');
    const city = state.userProfile.city || config.defaultCity;
    
    if (locationDisplay) {
        locationDisplay.textContent = city;
    }
    
    // 使用默认城市获取天气
    fetchWeatherData(city);
}

/**
 * 初始化天气数据
 */
function initWeatherData() {
    // 如果有缓存的天气数据且未过期，使用缓存数据
    const cachedWeatherData = localStorage.getItem('cuime_weather_data');
    const cachedWeatherTime = localStorage.getItem('cuime_weather_time');
    
    if (cachedWeatherData && cachedWeatherTime) {
        const weatherData = JSON.parse(cachedWeatherData);
        const lastUpdated = parseInt(cachedWeatherTime);
        const now = Date.now();
        
        // 检查数据是否在有效期内（30分钟）
        if (now - lastUpdated < config.weatherRefreshInterval) {
            state.weather.current = weatherData.current;
            state.weather.forecast = weatherData.forecast;
            state.weather.lastUpdated = lastUpdated;
            
            updateWeatherUI(weatherData);
            console.log('使用缓存的天气数据');
            return;
        }
    }
    
    // 否则，获取新的天气数据
    // 实际获取过程在 getUserLocation 中调用了 fetchWeatherData
    console.log('需要获取新的天气数据');
}

/**
 * 获取天气数据
 * @param {string} city - 城市名称
 */
function fetchWeatherData(city) {
    console.log('正在获取天气数据，城市:', city);
    
    try {
        const weatherPromise = mcp_amap_maps_maps_weather({
            city: city
        });
        
        weatherPromise.then(response => {
            if (response && response.status === '1' && response.lives && response.lives.length > 0) {
                // 处理实况天气
                const liveWeather = response.lives[0];
                state.weather.current = {
                    city: liveWeather.city,
                    weather: liveWeather.weather,
                    temperature: liveWeather.temperature,
                    humidity: liveWeather.humidity,
                    windDirection: liveWeather.winddirection,
                    windPower: liveWeather.windpower,
                    reportTime: liveWeather.reporttime
                };
                
                // 获取天气预报
                fetchForecastData(city);
                
                // 获取洗车建议日期
                calculateCarWashDates();
                
                // 计算UV强度
                calculateUVLevel(liveWeather.weather);
                
                // 更新UI
                updateWeatherUI({
                    current: state.weather.current,
                    forecast: state.weather.forecast
                });
                
                // 缓存天气数据
                const now = Date.now();
                state.weather.lastUpdated = now;
                localStorage.setItem('cuime_weather_data', JSON.stringify({
                    current: state.weather.current,
                    forecast: state.weather.forecast
                }));
                localStorage.setItem('cuime_weather_time', now.toString());
                
                console.log('天气数据获取成功:', state.weather.current);
            } else {
                console.error('天气数据获取失败:', response);
                showErrorMessage('无法获取天气数据');
            }
        }).catch(error => {
            console.error('天气API调用错误:', error);
            showErrorMessage('天气API调用出错');
        });
    } catch (error) {
        console.error('无法访问天气API:', error);
        showErrorMessage('无法访问天气API');
    }
}

/**
 * 获取天气预报数据
 * @param {string} city - 城市名称
 */
function fetchForecastData(city) {
    try {
        // 由于高德地图API没有直接提供预报，我们使用模拟数据
        // 在实际应用中，此处应替换为真实API调用
        const forecastData = generateMockForecastData(state.weather.current);
        state.weather.forecast = forecastData;
        console.log('预报数据已生成:', forecastData);
        
        // 更新预报UI
        updateForecastUI(forecastData);
    } catch (error) {
        console.error('获取预报数据出错:', error);
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
 * 更新天气UI显示
 * @param {Object} weatherData - 天气数据
 */
function updateWeatherUI(weatherData) {
    if (!weatherData || !weatherData.current) return;
    
    const current = weatherData.current;
    
    // 更新当前天气显示
    const todayTemp = document.getElementById('today-temp');
    const todayDesc = document.getElementById('today-desc');
    const weatherCloud = document.getElementById('weather-cloud');
    
    if (todayTemp) {
        todayTemp.textContent = `${current.temperature}°C`;
    }
    
    if (todayDesc) {
        todayDesc.textContent = current.weather;
    }
    
    // 更新云朵表情
    if (weatherCloud) {
        // 移除所有天气相关类
        weatherCloud.classList.remove('rain', 'sad');
        
        // 根据天气类型添加相应类
        if (current.weather.includes('雨') || current.weather.includes('雪')) {
            weatherCloud.classList.add('rain');
            weatherCloud.classList.add('sad');
        } else if (current.weather.includes('阴') || current.weather.includes('雾')) {
            weatherCloud.classList.add('sad');
        }
    }
    
    // 更新UV指示灯
    updateUVIndicator(state.uvLevel);
    
    // 更新建议内容
    generateWeatherSuggestions(weatherData);
    
    // 更新穿搭推荐
    updateOutfitRecommendations(weatherData);
}

/**
 * 更新预报UI显示
 * @param {Array} forecastData - 预报数据
 */
function updateForecastUI(forecastData) {
    if (!forecastData || forecastData.length < 2) return;
    
    // 更新明天天气
    const tomorrowTitle = document.getElementById('tomorrow-title');
    const tomorrowForecast = document.getElementById('tomorrow-forecast');
    
    if (tomorrowTitle && forecastData[0]) {
        tomorrowTitle.textContent = `明天 (${forecastData[0].dayOfWeek})`;
    }
    
    if (tomorrowForecast && forecastData[0]) {
        tomorrowForecast.innerHTML = `
            ${forecastData[0].weather}, ${forecastData[0].temperature}°C<br>
            湿度: ${forecastData[0].humidity}%<br>
            ${forecastData[0].windDirection}风 ${forecastData[0].windPower}级
        `;
    }
    
    // 更新后天天气
    const dayAfterTitle = document.getElementById('day-after-title');
    const dayAfterForecast = document.getElementById('day-after-forecast');
    
    if (dayAfterTitle && forecastData[1]) {
        dayAfterTitle.textContent = `后天 (${forecastData[1].dayOfWeek})`;
    }
    
    if (dayAfterForecast && forecastData[1]) {
        dayAfterForecast.innerHTML = `
            ${forecastData[1].weather}, ${forecastData[1].temperature}°C<br>
            湿度: ${forecastData[1].humidity}%<br>
            ${forecastData[1].windDirection}风 ${forecastData[1].windPower}级
        `;
    }
}

/**
 * 计算UV强度级别
 * @param {string} weather - 天气描述
 */
function calculateUVLevel(weather) {
    // 根据天气情况计算UV级别
    if (weather.includes('晴')) {
        if (weather.includes('多云')) {
            state.uvLevel = 'medium';
        } else {
            state.uvLevel = 'high';
        }
    } else if (weather.includes('阴') || weather.includes('多云')) {
        state.uvLevel = 'medium';
    } else {
        state.uvLevel = 'low';
    }
    
    console.log('UV级别:', state.uvLevel);
}

/**
 * 更新UV指示灯
 * @param {string} level - UV强度级别（low, medium, high）
 */
function updateUVIndicator(level) {
    const uvLow = document.getElementById('uv-low');
    const uvMedium = document.getElementById('uv-medium');
    const uvHigh = document.getElementById('uv-high');
    
    // 重置所有灯
    if (uvLow) uvLow.classList.remove('active');
    if (uvMedium) uvMedium.classList.remove('active');
    if (uvHigh) uvHigh.classList.remove('active');
    
    // 激活对应的灯
    switch (level) {
        case 'low':
            if (uvLow) uvLow.classList.add('active');
            break;
        case 'medium':
            if (uvMedium) uvMedium.classList.add('active');
            break;
        case 'high':
            if (uvHigh) uvHigh.classList.add('active');
            break;
    }
}

/**
 * 生成天气相关建议
 * @param {Object} weatherData - 天气数据
 */
function generateWeatherSuggestions(weatherData) {
    if (!weatherData || !weatherData.current) return;
    
    const current = weatherData.current;
    const suggestionElement = document.getElementById('weather-suggestions');
    
    if (!suggestionElement) return;
    
    let suggestions = '';
    
    // 根据UV级别给出建议
    switch (state.uvLevel) {
        case 'high':
            suggestions += '紫外线强度高，出门请涂防晒霜，戴帽子和太阳镜。<br>';
            break;
        case 'medium':
            suggestions += '紫外线强度中等，建议出门使用防晒措施。<br>';
            break;
        case 'low':
            suggestions += '紫外线强度低，无需特别防晒。<br>';
            break;
    }
    
    // 根据天气类型给出建议
    if (current.weather.includes('雨')) {
        suggestions += '今日有雨，请携带雨伞出行。<br>';
    }
    
    if (current.weather.includes('雪')) {
        suggestions += '今日有雪，请注意保暖，谨慎驾驶。<br>';
    }
    
    if (current.weather.includes('雾') || current.weather.includes('霾')) {
        suggestions += '能见度较低，出行请注意安全。<br>';
    }
    
    // 根据温度给出建议
    const temp = parseInt(current.temperature);
    if (temp <= 5) {
        suggestions += '温度较低，请穿厚重衣物保暖。<br>';
    } else if (temp <= 12) {
        suggestions += '天气转凉，建议添加外套。<br>';
    } else if (temp >= 30) {
        suggestions += '温度较高，注意防暑降温，避免长时间户外活动。<br>';
    } else if (temp >= 25) {
        suggestions += '气温适中偏高，建议穿着轻薄透气的衣物。<br>';
    }
    
    suggestionElement.innerHTML = suggestions;
}

/**
 * 计算洗车推荐日期
 */
function calculateCarWashDates() {
    const carWashDatesElement = document.getElementById('car-wash-dates');
    
    // 如果没有预报数据，显示加载中
    if (!state.weather.forecast || state.weather.forecast.length === 0) {
        if (carWashDatesElement) {
            carWashDatesElement.textContent = '数据加载中...';
        }
        return;
    }
    
    // 找出不下雨或下雪的日期
    const goodDates = state.weather.forecast.filter(day => 
        !day.weather.includes('雨') && 
        !day.weather.includes('雪') &&
        !day.weather.includes('雾') &&
        !day.weather.includes('霾')
    );
    
    state.carWashDates = goodDates.map(day => ({
        date: day.date,
        dayOfWeek: day.dayOfWeek
    }));
    
    // 更新UI
    if (carWashDatesElement) {
        if (state.carWashDates.length > 0) {
            let dateDisplay = state.carWashDates.map(day => 
                `${day.dayOfWeek} (${day.date.substring(5).replace('-', '/')})`
            ).join('<br>');
            
            carWashDatesElement.innerHTML = dateDisplay;
        } else {
            carWashDatesElement.textContent = '近期天气不适合洗车，建议等待更好天气';
        }
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
 * 更新穿搭推荐
 * @param {Object} weatherData - 天气数据
 */
function updateOutfitRecommendations(weatherData) {
    if (!weatherData || !weatherData.current) return;
    
    // 根据天气和用户偏好生成穿搭推荐
    generateOutfitBasedOnWeather(weatherData.current);
}

/**
 * 根据天气生成穿搭推荐
 * @param {Object} weather - 当前天气数据
 */
function generateOutfitBasedOnWeather(weather) {
    if (!weather) return;
    
    const temp = parseInt(weather.temperature);
    const isRainy = weather.weather.includes('雨');
    const isSnowy = weather.weather.includes('雪');
    const isWindy = parseInt(weather.windPower) >= 4;
    
    // 准备不同季节的基础衣物库
    const summerTops = ['轻薄T恤', '无袖上衣', '短袖衬衫', '吊带背心'];
    const summerBottoms = ['短裤', '轻薄长裤', '半身裙', 'A字裙'];
    const summerShoes = ['凉鞋', '休闲帆布鞋', '轻便运动鞋'];
    
    const springFallTops = ['长袖T恤', '轻薄毛衣', '衬衫', '轻薄外套'];
    const springFallBottoms = ['牛仔裤', '休闲长裤', '长裙'];
    const springFallShoes = ['休闲鞋', '帆布鞋', '轻便运动鞋'];
    
    const winterTops = ['厚毛衣', '长袖衬衫+毛衣', '加绒卫衣', '厚外套'];
    const winterBottoms = ['加绒裤', '羊毛裤', '厚牛仔裤'];
    const winterShoes = ['短靴', '加绒靴', '保暖运动鞋'];
    
    // 准备外套和配件
    const outerLayers = {
        light: ['轻薄针织衫', '薄款开衫', '牛仔外套'],
        medium: ['风衣', '西装外套', '轻薄羽绒服'],
        heavy: ['羽绒服', '棉服', '厚呢大衣']
    };
    
    const accessories = {
        rain: ['雨伞', '防水外套', '防水鞋套'],
        snow: ['保暖帽子', '围巾', '手套'],
        sun: ['太阳镜', '遮阳帽', '防晒霜'],
        wind: ['发带', '厚围巾']
    };
    
    let tops = [];
    let bottoms = [];
    let shoes = [];
    let outerwear = [];
    let outfitAccessories = [];
    
    // 根据温度选择基础衣物
    if (temp >= 25) {
        // 夏季
        tops = summerTops;
        bottoms = summerBottoms;
        shoes = summerShoes;
        if (state.uvLevel === 'high') {
            outfitAccessories.push(...accessories.sun);
        }
    } else if (temp >= 15) {
        // 春秋
        tops = springFallTops;
        bottoms = springFallBottoms;
        shoes = springFallShoes;
        outerwear = outerLayers.light;
    } else if (temp >= 5) {
        // 冷春秋
        tops = springFallTops;
        bottoms = springFallBottoms;
        shoes = springFallShoes;
        outerwear = outerLayers.medium;
    } else {
        // 冬季
        tops = winterTops;
        bottoms = winterBottoms;
        shoes = winterShoes;
        outerwear = outerLayers.heavy;
    }
    
    // 根据天气状况添加配件
    if (isRainy) {
        outfitAccessories.push(...accessories.rain);
    }
    
    if (isSnowy) {
        outfitAccessories.push(...accessories.snow);
    }
    
    if (isWindy) {
        outfitAccessories.push(...accessories.wind);
    }
    
    // 随机选择一套穿搭
    const randomTop = tops[Math.floor(Math.random() * tops.length)];
    const randomBottom = bottoms[Math.floor(Math.random() * bottoms.length)];
    const randomShoes = shoes[Math.floor(Math.random() * shoes.length)];
    
    // 选择外套（如果有）
    let randomOuterwear = '';
    if (outerwear.length > 0) {
        randomOuterwear = outerwear[Math.floor(Math.random() * outerwear.length)];
    }
    
    // 选择配件（如果有）
    let randomAccessories = [];
    if (outfitAccessories.length > 0) {
        // 从配件中随机选择1-2个
        const numAccessories = Math.min(outfitAccessories.length, Math.floor(Math.random() * 2) + 1);
        for (let i = 0; i < numAccessories; i++) {
            const index = Math.floor(Math.random() * outfitAccessories.length);
            randomAccessories.push(outfitAccessories[index]);
            // 避免重复选择同一个配件
            outfitAccessories.splice(index, 1);
        }
    }
    
    // 更新状态
    state.outfit.top = randomTop;
    state.outfit.bottom = randomBottom;
    state.outfit.shoes = randomShoes;
    
    // 更新UI
    updateOutfitUI(randomTop, randomBottom, randomShoes, randomOuterwear, randomAccessories);
}

/**
 * 更新穿搭UI
 * @param {string} top - 上装
 * @param {string} bottom - 下装
 * @param {string} shoes - 鞋子
 * @param {string} outerwear - 外套
 * @param {Array} accessories - 配件
 */
function updateOutfitUI(top, bottom, shoes, outerwear, accessories) {
    const topDisplay = document.getElementById('outfit-top');
    const bottomDisplay = document.getElementById('outfit-bottom');
    const shoesDisplay = document.getElementById('outfit-shoes');
    const outerwearDisplay = document.getElementById('outfit-outerwear');
    const accessoriesDisplay = document.getElementById('outfit-accessories');
    
    if (topDisplay) {
        topDisplay.textContent = top;
    }
    
    if (bottomDisplay) {
        bottomDisplay.textContent = bottom;
    }
    
    if (shoesDisplay) {
        shoesDisplay.textContent = shoes;
    }
    
    if (outerwearDisplay) {
        outerwearDisplay.textContent = outerwear || '不需要外套';
    }
    
    if (accessoriesDisplay) {
        if (accessories && accessories.length > 0) {
            accessoriesDisplay.textContent = accessories.join('、');
        } else {
            accessoriesDisplay.textContent = '无需额外配件';
        }
    }
    
    // 更新穿搭建议文本
    updateOutfitSuggestion(top, bottom, shoes, outerwear, accessories);
}

/**
 * 更新穿搭建议文本
 * @param {string} top - 上装
 * @param {string} bottom - 下装
 * @param {string} shoes - 鞋子
 * @param {string} outerwear - 外套
 * @param {Array} accessories - 配件
 */
function updateOutfitSuggestion(top, bottom, shoes, outerwear, accessories) {
    const suggestionElement = document.getElementById('outfit-suggestion');
    
    if (!suggestionElement) return;
    
    let suggestion = `今天建议穿${top}搭配${bottom}，`;
    
    if (outerwear) {
        suggestion += `外搭${outerwear}，`;
    }
    
    suggestion += `脚上穿${shoes}。`;
    
    if (accessories && accessories.length > 0) {
        suggestion += `别忘了带上${accessories.join('和')}哦！`;
    }
    
    suggestionElement.textContent = suggestion;
}

/**
 * 生成随机穿搭
 */
function generateRandomOutfit() {
    // 如果有天气数据，基于天气生成
    if (state.weather.current) {
        generateOutfitBasedOnWeather(state.weather.current);
    } else {
        // 否则随机生成
        const tops = ['衬衫', 'T恤', '毛衣', '卫衣'];
        const bottoms = ['牛仔裤', '休闲裤', '半身裙', '连衣裙'];
        const shoes = ['运动鞋', '皮鞋', '帆布鞋', '靴子'];
        
        const randomTop = tops[Math.floor(Math.random() * tops.length)];
        const randomBottom = bottoms[Math.floor(Math.random() * bottoms.length)];
        const randomShoes = shoes[Math.floor(Math.random() * shoes.length)];
        
        // 更新状态
        state.outfit.top = randomTop;
        state.outfit.bottom = randomBottom;
        state.outfit.shoes = randomShoes;
        
        // 更新UI
        updateOutfitUI(randomTop, randomBottom, randomShoes, '', []);
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