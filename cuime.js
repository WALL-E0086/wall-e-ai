/**
 * 柜me - 个人形象顾问 JavaScript 实现
 */

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    // 初始化页面
    initializePage();

    // 设置事件监听器
    setupEventListeners();
    
    // 加载用户信息
    loadUserProfile();
    
    // 获取天气数据
    fetchWeatherData();
    
    // 加载衣橱数据
    loadWardrobeData();
});

/**
 * 初始化页面
 */
function initializePage() {
    console.log('初始化页面...');
    
    // 设置当前日期
    document.getElementById('current-date').textContent = window.utils.formatDate(new Date());
    
    // 显示通知
    showNotification('欢迎使用柜me个人形象顾问', 'info');
}

/**
 * 设置事件监听器
 */
function setupEventListeners() {
    // 刷新穿搭按钮
    const refreshOutfitBtn = document.getElementById('refresh-outfit');
    if (refreshOutfitBtn) {
        refreshOutfitBtn.addEventListener('click', function() {
            generateRandomOutfit();
            showNotification('已为您刷新穿搭建议', 'success');
        });
    }
    
    // 完善个人信息按钮
    const completeProfileBtn = document.getElementById('complete-profile');
    if (completeProfileBtn) {
        completeProfileBtn.addEventListener('click', function() {
            openProfileEditor();
        });
    }
    
    // 编辑个人信息按钮
    const editProfileBtn = document.getElementById('edit-profile');
    if (editProfileBtn) {
        editProfileBtn.addEventListener('click', function() {
            openProfileEditor();
        });
    }
    
    // 进入我的衣橱按钮
    const goToWardrobeBtn = document.getElementById('go-to-wardrobe');
    if (goToWardrobeBtn) {
        goToWardrobeBtn.addEventListener('click', function() {
            showNotification('衣橱功能正在开发中...', 'info');
        });
    }
}

/**
 * 显示通知
 * @param {string} message - 通知消息
 * @param {string} type - 通知类型 (success, error, warning, info)
 */
function showNotification(message, type = 'info') {
    try {
        const container = document.getElementById('notification-container');
        if (!container) return;
        
        const notification = document.createElement('div');
        notification.className = 'p-3 mb-2 rounded-lg shadow-lg transform transition-transform duration-300 ease-in-out animate-fadeIn';
        
        // 根据类型设置样式
        switch (type) {
            case 'success':
                notification.className += ' bg-green-500 text-white';
                break;
            case 'error':
                notification.className += ' bg-red-500 text-white';
                break;
            case 'warning':
                notification.className += ' bg-yellow-500 text-white';
                break;
            case 'info':
            default:
                notification.className += ' bg-blue-500 text-white';
                break;
        }
        
        notification.innerHTML = `<div class="flex items-center">${message}</div>`;
        
        container.appendChild(notification);
        
        // 3秒后自动移除
        setTimeout(function() {
            notification.style.opacity = '0';
            setTimeout(function() {
                if (notification.parentNode === container) {
                    container.removeChild(notification);
                }
            }, 300);
        }, 3000);
    } catch (error) {
        console.error('显示通知时出错:', error);
    }
}

/**
 * 加载用户信息
 */
function loadUserProfile() {
    try {
        // 从本地存储加载用户信息
        const savedProfile = window.utils.storage.load('userProfile');
        
        if (savedProfile) {
            window.globalState.userProfile = { ...window.globalState.userProfile, ...savedProfile };
            updateProfileUI();
            document.getElementById('profile-incomplete').classList.add('hidden');
            document.getElementById('profile-complete').classList.remove('hidden');
        } else {
            document.getElementById('profile-incomplete').classList.remove('hidden');
            document.getElementById('profile-complete').classList.add('hidden');
        }
    } catch (error) {
        console.error('加载用户信息时出错:', error);
        showNotification('加载用户信息失败', 'error');
    }
}

/**
 * 更新个人信息界面
 */
function updateProfileUI() {
    try {
        const profile = window.globalState.userProfile;
        
        // 更新基本信息
        document.getElementById('user-name').textContent = profile.name || '访客';
        document.getElementById('user-gender').textContent = profile.gender === 'male' ? '男' : profile.gender === 'female' ? '女' : '未设置';
        document.getElementById('user-height').textContent = profile.height || '--';
        document.getElementById('user-weight').textContent = profile.weight || '--';
        
        // 更新头像
        const avatarContainer = document.getElementById('user-avatar');
        if (profile.avatar) {
            avatarContainer.innerHTML = `<img src="${profile.avatar}" alt="用户头像" class="w-full h-full object-cover">`;
        } else {
            avatarContainer.innerHTML = `<i class="fas fa-user text-gray-400 text-2xl"></i>`;
        }
    } catch (error) {
        console.error('更新个人信息界面时出错:', error);
    }
}

/**
 * 打开个人信息编辑器
 */
function openProfileEditor() {
    showNotification('个人信息编辑功能正在开发中...', 'info');
    // 这里可以添加打开模态框的代码
}

/**
 * 获取天气数据
 */
function fetchWeatherData() {
    try {
        // 模拟天气数据 (实际项目中应从API获取)
        setTimeout(function() {
            const mockWeatherData = {
                city: '北京市',
                current: {
                    temp: 18,
                    desc: '晴',
                    icon: 'sun',
                    humidity: 45,
                    windSpeed: 3.5,
                    uv: 'low'
                },
                forecast: [
                    {
                        date: new Date(),
                        temp: 18,
                        desc: '晴',
                        icon: 'sun'
                    },
                    {
                        date: new Date(Date.now() + 86400000), // 明天
                        temp: 20,
                        desc: '多云',
                        icon: 'cloud-sun'
                    },
                    {
                        date: new Date(Date.now() + 86400000 * 2), // 后天
                        temp: 17,
                        desc: '小雨',
                        icon: 'cloud-rain'
                    }
                ],
                hourly: [
                    { time: '上午9时', temp: 15, icon: 'sun' },
                    { time: '上午10时', temp: 16, icon: 'sun' },
                    { time: '上午11时', temp: 17, icon: 'sun' },
                    { time: '中午12时', temp: 18, icon: 'sun' },
                    { time: '下午1时', temp: 19, icon: 'sun' },
                    { time: '下午2时', temp: 20, icon: 'cloud-sun' },
                    { time: '下午3时', temp: 20, icon: 'cloud-sun' },
                    { time: '下午4时', temp: 19, icon: 'cloud-sun' },
                    { time: '下午5时', temp: 18, icon: 'cloud-sun' },
                    { time: '下午6时', temp: 17, icon: 'cloud' }
                ]
            };
            
            // 更新全局状态
            window.globalState.weatherData = mockWeatherData;
            window.globalState.lastWeatherUpdate = new Date();
            
            // 更新界面
            updateWeatherUI(mockWeatherData);
            
            // 生成穿搭建议
            generateOutfitBasedOnWeather(mockWeatherData);
            
            // 生成天气建议
            generateWeatherSuggestions(mockWeatherData);
            
            // 计算洗车日期
            calculateCarWashDates(mockWeatherData);
        }, 1000);
    } catch (error) {
        console.error('获取天气数据时出错:', error);
        showNotification('获取天气数据失败', 'error');
    }
}

/**
 * 更新天气界面
 * @param {Object} weatherData - 天气数据
 */
function updateWeatherUI(weatherData) {
    try {
        if (!weatherData) return;
        
        // 更新城市和当前天气
        document.getElementById('city-name').textContent = weatherData.city;
        document.getElementById('today-temp').textContent = window.utils.formatTemp(weatherData.current.temp);
        
        const todayDescElement = document.getElementById('today-desc');
        todayDescElement.innerHTML = `
            <span class="mr-2">${weatherData.current.desc}</span>
            <i class="fas fa-${getWeatherIcon(weatherData.current.icon)} text-gray-400"></i>
        `;
        
        // 更新小时预报
        const hourlyForecastContainer = document.getElementById('hourly-forecast');
        hourlyForecastContainer.innerHTML = '';
        
        weatherData.hourly.forEach(hour => {
            const hourElement = document.createElement('div');
            hourElement.className = 'px-2 text-center min-w-[80px]';
            hourElement.innerHTML = `
                <div class="text-sm text-gray-500">${hour.time}</div>
                <div class="my-2"><i class="fas fa-${getWeatherIcon(hour.icon)} text-gray-400"></i></div>
                <div class="text-sm font-bold">${window.utils.formatTemp(hour.temp)}</div>
            `;
            hourlyForecastContainer.appendChild(hourElement);
        });
    } catch (error) {
        console.error('更新天气界面时出错:', error);
    }
}

/**
 * 获取天气图标
 * @param {string} iconCode - 图标代码
 * @returns {string} - Font Awesome 图标类名
 */
function getWeatherIcon(iconCode) {
    const iconMap = {
        'sun': 'sun',
        'cloud': 'cloud',
        'cloud-sun': 'cloud-sun',
        'cloud-rain': 'cloud-rain',
        'cloud-showers-heavy': 'cloud-showers-heavy',
        'bolt': 'bolt',
        'snowflake': 'snowflake',
        'smog': 'smog',
        'wind': 'wind'
    };
    
    return iconMap[iconCode] || 'cloud';
}

/**
 * 加载衣橱数据
 */
function loadWardrobeData() {
    try {
        // 从本地存储加载衣橱数据
        const savedWardrobe = window.utils.storage.load('wardrobeData');
        
        if (savedWardrobe) {
            window.globalState.wardrobeData = { ...window.globalState.wardrobeData, ...savedWardrobe };
        }
        
        // 更新衣橱统计
        updateWardrobeStats();
    } catch (error) {
        console.error('加载衣橱数据时出错:', error);
    }
}

/**
 * 更新衣橱统计
 */
function updateWardrobeStats() {
    try {
        const wardrobe = window.globalState.wardrobeData;
        
        document.getElementById('tops-count').textContent = wardrobe.tops.length;
        document.getElementById('bottoms-count').textContent = wardrobe.bottoms.length;
        document.getElementById('shoes-count').textContent = wardrobe.shoes.length;
    } catch (error) {
        console.error('更新衣橱统计时出错:', error);
    }
}

/**
 * 根据天气生成穿搭建议
 * @param {Object} weatherData - 天气数据
 */
function generateOutfitBasedOnWeather(weatherData) {
    try {
        console.log('根据天气生成穿搭:', weatherData);
        
        if (!weatherData || !weatherData.current) {
            console.error('无有效天气数据');
            return;
        }
        
        const currentTemp = weatherData.current.temp;
        const weatherDesc = weatherData.current.desc;
        let outfit = {
            top: '',
            bottom: '',
            shoes: '',
            outerwear: '',
            accessories: []
        };
        
        // 根据温度和天气状况选择穿搭
        if (currentTemp >= 30) {
            // 炎热天气
            outfit.top = '棉质短袖T恤';
            outfit.bottom = '透气短裤/轻薄裙子';
            outfit.shoes = '凉鞋/薄底帆布鞋';
            outfit.outerwear = '无需外套';
            outfit.accessories = ['防晒帽', '太阳镜'];
        } else if (currentTemp >= 20 && currentTemp < 30) {
            // 温暖天气
            outfit.top = '棉质T恤/短袖衬衫';
            outfit.bottom = '休闲长裤/牛仔裤/半身裙';
            outfit.shoes = '帆布鞋/乐福鞋';
            outfit.outerwear = weatherDesc.includes('雨') ? '轻薄防水外套' : '轻薄开衫';
            outfit.accessories = weatherDesc.includes('雨') ? ['伞'] : ['棒球帽'];
        } else if (currentTemp >= 10 && currentTemp < 20) {
            // 凉爽天气
            outfit.top = '长袖衬衫/毛衣';
            outfit.bottom = '牛仔裤/休闲裤';
            outfit.shoes = '运动鞋/靴子';
            outfit.outerwear = '夹克/薄风衣';
            outfit.accessories = weatherDesc.includes('雨') ? ['伞'] : ['围巾'];
        } else {
            // 寒冷天气
            outfit.top = '保暖内衣/高领毛衣';
            outfit.bottom = '厚牛仔裤/羊毛裤';
            outfit.shoes = '保暖靴子';
            outfit.outerwear = '厚外套/羽绒服';
            outfit.accessories = ['围巾', '手套', '毛帽'];
        }
        
        // 根据天气调整
        if (weatherDesc.includes('雨')) {
            outfit.shoes = '防水鞋/靴子';
            if (!outfit.accessories.includes('伞')) {
                outfit.accessories.push('伞');
            }
        } else if (weatherDesc.includes('雪')) {
            outfit.shoes = '防滑雪地靴';
            outfit.accessories.push('防滑手套');
        }
        
        // 更新全局状态
        window.globalState.outfitRecommendations.current = outfit;
        
        // 更新界面
        updateOutfitUI(outfit);
    } catch (error) {
        console.error('生成穿搭建议时出错:', error);
        showNotification('生成穿搭建议失败', 'error');
    }
}

/**
 * 更新穿搭界面
 * @param {Object} outfit - 穿搭数据
 */
function updateOutfitUI(outfit) {
    try {
        if (!outfit) return;
        
        // 更新推荐文本
        document.getElementById('top-recommendation').textContent = outfit.top || '暂无推荐';
        document.getElementById('bottom-recommendation').textContent = outfit.bottom || '暂无推荐';
        document.getElementById('shoes-recommendation').textContent = outfit.shoes || '暂无推荐';
        document.getElementById('outerwear-recommendation').textContent = outfit.outerwear || '暂无推荐';
        document.getElementById('accessories-recommendation').textContent = outfit.accessories.join(', ') || '暂无推荐';
        
        // 更新模型样式
        const modelTop = document.getElementById('model-top');
        const modelBottom = document.getElementById('model-bottom');
        
        // 根据穿搭设置样式和颜色
        if (modelTop) {
            let topColor = '#E5E7EB'; // 默认颜色
            
            if (outfit.top.includes('T恤')) {
                topColor = '#60A5FA';
            } else if (outfit.top.includes('衬衫')) {
                topColor = '#FBBF24';
            } else if (outfit.top.includes('毛衣')) {
                topColor = '#F87171';
            }
            
            modelTop.style.backgroundColor = topColor;
        }
        
        if (modelBottom) {
            let bottomColor = '#9CA3AF'; // 默认颜色
            
            if (outfit.bottom.includes('牛仔')) {
                bottomColor = '#3B82F6';
            } else if (outfit.bottom.includes('裙')) {
                bottomColor = '#EC4899';
            } else if (outfit.bottom.includes('短裤')) {
                bottomColor = '#10B981';
            }
            
            modelBottom.style.backgroundColor = bottomColor;
        }
    } catch (error) {
        console.error('更新穿搭界面时出错:', error);
    }
}

/**
 * 生成随机穿搭
 */
function generateRandomOutfit() {
    try {
        // 随机选择穿搭组件
        const tops = ['白色T恤', '黑色T恤', '条纹衬衫', '格子衬衫', '棉质毛衣', '高领毛衣'];
        const bottoms = ['蓝色牛仔裤', '黑色休闲裤', '卡其色长裤', '蓝色半身裙', '黑色短裙', '格子裙'];
        const shoes = ['白色运动鞋', '黑色皮鞋', '棕色靴子', '帆布鞋', '乐福鞋', '黑色高跟鞋'];
        const outerwear = ['黑色皮夹克', '牛仔外套', '米色风衣', '灰色西装外套', '羽绒服', '无外套'];
        const accessories = [
            ['黑色腰带', '手表'], 
            ['太阳镜', '项链'], 
            ['围巾', '帽子'], 
            ['手套', '耳环'], 
            ['发箍', '耳钉'],
            ['手链', '戒指']
        ];
        
        // 随机选择项目
        const outfit = {
            top: tops[Math.floor(Math.random() * tops.length)],
            bottom: bottoms[Math.floor(Math.random() * bottoms.length)],
            shoes: shoes[Math.floor(Math.random() * shoes.length)],
            outerwear: outerwear[Math.floor(Math.random() * outerwear.length)],
            accessories: accessories[Math.floor(Math.random() * accessories.length)]
        };
        
        // 更新全局状态
        window.globalState.outfitRecommendations.current = outfit;
        
        // 更新界面
        updateOutfitUI(outfit);
    } catch (error) {
        console.error('生成随机穿搭时出错:', error);
        showNotification('生成随机穿搭失败', 'error');
    }
}

/**
 * 生成天气建议
 * @param {Object} weatherData - 天气数据
 */
function generateWeatherSuggestions(weatherData) {
    try {
        console.log('生成天气建议:', weatherData);
        
        if (!weatherData || !weatherData.current) {
            console.error('无有效天气数据');
            return;
        }
        
        const currentTemp = weatherData.current.temp;
        const weatherDesc = weatherData.current.desc;
        
        const suggestions = [];
        
        // 根据温度提供建议
        if (currentTemp >= 35) {
            suggestions.push('请注意防暑降温，多补充水分');
            suggestions.push('尽量避免在正午阳光直射下长时间户外活动');
            suggestions.push('外出请做好防晒措施');
        } else if (currentTemp >= 30 && currentTemp < 35) {
            suggestions.push('天气炎热，请多补充水分');
            suggestions.push('外出请做好防晒措施');
            suggestions.push('适宜穿着轻薄透气的衣物');
        } else if (currentTemp >= 20 && currentTemp < 30) {
            suggestions.push('天气舒适，适宜户外活动');
            suggestions.push('建议随身携带一件薄外套，以防温差变化');
        } else if (currentTemp >= 10 && currentTemp < 20) {
            suggestions.push('天气转凉，注意添加衣物');
            suggestions.push('早晚温差较大，建议适当增减衣物');
        } else if (currentTemp >= 0 && currentTemp < 10) {
            suggestions.push('天气较冷，注意保暖');
            suggestions.push('出行建议穿着保暖衣物，戴围巾手套');
        } else {
            suggestions.push('天气寒冷，请做好防寒保暖');
            suggestions.push('减少不必要的户外活动');
            suggestions.push('外出时请穿着厚实的保暖衣物');
        }
        
        // 根据天气状况提供建议
        if (weatherDesc.includes('雨')) {
            suggestions.push('今日有雨，出行请携带雨伞');
            suggestions.push('道路湿滑，请注意行车和行走安全');
        } else if (weatherDesc.includes('雪')) {
            suggestions.push('今日有雪，出行注意防滑');
            suggestions.push('道路结冰，驾车请减速慢行');
        } else if (weatherDesc.includes('雾')) {
            suggestions.push('今日有雾，出行注意安全');
            suggestions.push('驾车请开启雾灯，保持安全距离');
        } else if (weatherDesc.includes('晴')) {
            suggestions.push('阳光充足，适宜户外活动');
            if (currentTemp > 25) {
                suggestions.push('紫外线较强，注意防晒');
            }
        }
        
        // 随机选择2-3条建议显示
        const selectedSuggestions = [];
        const count = Math.floor(Math.random() * 2) + 2; // 随机选择2-3条
        
        for (let i = 0; i < count && i < suggestions.length; i++) {
            const randomIndex = Math.floor(Math.random() * suggestions.length);
            const suggestion = suggestions[randomIndex];
            
            if (!selectedSuggestions.includes(suggestion)) {
                selectedSuggestions.push(suggestion);
            }
            
            // 防止无限循环
            if (selectedSuggestions.length >= count || selectedSuggestions.length >= suggestions.length) {
                break;
            }
        }
        
        // 更新界面
        const weatherSuggestionsContainer = document.getElementById('weather-suggestions');
        weatherSuggestionsContainer.innerHTML = '';
        
        const borderColors = ['border-blue-500', 'border-green-500', 'border-purple-500'];
        const bgColors = ['bg-blue-50', 'bg-green-50', 'bg-purple-50'];
        const textColors = ['text-blue-800', 'text-green-800', 'text-purple-800'];
        
        selectedSuggestions.forEach((suggestion, index) => {
            const colorIndex = index % 3;
            const suggestionElement = document.createElement('div');
            suggestionElement.className = `p-2 border-l-4 ${borderColors[colorIndex]} ${bgColors[colorIndex]} rounded-r-lg`;
            suggestionElement.innerHTML = `<p class="${textColors[colorIndex]}">${suggestion}</p>`;
            weatherSuggestionsContainer.appendChild(suggestionElement);
        });
    } catch (error) {
        console.error('生成天气建议时出错:', error);
    }
}

/**
 * 计算适合洗车的日期
 * @param {Object} weatherData - 天气数据
 */
function calculateCarWashDates(weatherData) {
    try {
        console.log('计算洗车日期:', weatherData);
        
        // 计算未来7天的日期
        const next7Days = [];
        for (let i = 0; i < 7; i++) {
            const date = new Date(Date.now() + 86400000 * i);
            next7Days.push({
                date: date,
                formatted: window.utils.formatDate(date)
            });
        }
        
        // 随机选择2-3天作为适合洗车的日期
        const count = Math.floor(Math.random() * 2) + 2; // 随机选择2-3天
        const selectedDates = [];
        
        for (let i = 0; i < count; i++) {
            const randomIndex = Math.floor(Math.random() * next7Days.length);
            selectedDates.push(next7Days[randomIndex]);
            next7Days.splice(randomIndex, 1);
            
            if (next7Days.length === 0) break;
        }
        
        // 为每个日期随机分配一个天气状况
        const weatherConditions = ['晴朗', '多云', '晴间多云'];
        
        selectedDates.forEach(date => {
            date.weather = weatherConditions[Math.floor(Math.random() * weatherConditions.length)];
        });
        
        // 更新界面
        const carWashDatesContainer = document.getElementById('car-wash-dates');
        carWashDatesContainer.innerHTML = '';
        
        selectedDates.forEach(date => {
            const dateElement = document.createElement('div');
            dateElement.className = 'flex items-center justify-between p-2 bg-gray-50 rounded-lg';
            
            let icon = 'sun';
            if (date.weather === '多云') {
                icon = 'cloud';
            } else if (date.weather === '晴间多云') {
                icon = 'cloud-sun';
            }
            
            dateElement.innerHTML = `
                <span class="text-gray-600">${date.formatted}</span>
                <div class="flex items-center">
                    <span class="text-gray-500 mr-2">${date.weather}</span>
                    <i class="fas fa-${icon} text-gray-400"></i>
                </div>
            `;
            
            carWashDatesContainer.appendChild(dateElement);
        });
    } catch (error) {
        console.error('计算洗车日期时出错:', error);
    }
}