/**
 * 柜me - 个人形象顾问 JavaScript 实现
 */

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    // 初始化全局状态
    initializeGlobalState();
    
    // 初始化页面
    initializePage();

    // 设置事件监听器
    setupEventListeners();
    
    // 加载用户信息
    loadUserProfile();
    
    // 加载位置数据
    loadLocationData();
    
    // 获取天气数据
    fetchWeatherData();
    
    // 加载衣橱数据
    loadWardrobeData();
});

/**
 * 初始化全局状态
 */
function initializeGlobalState() {
    // 如果全局状态对象不存在，则创建
    if (!window.globalState) {
        window.globalState = {};
    }
    
    // 初始化用户配置文件
    window.globalState.userProfile = {
        name: '',
        avatar: '',
        gender: '',
        height: '',
        weight: '',
        age: '',
        style: 'casual', // 默认休闲风格
        favoriteColors: [],
        bodyShape: '',
        skinTone: '',
        occasions: []
    };
    
    // 初始化位置信息
    window.globalState.userLocation = {
        city: '',
        province: '',
        district: '',
        source: 'auto', // auto自动获取，manual手动设置
        manuallySet: false
    };
    
    // 初始化天气数据
    window.globalState.weatherData = null;
    
    // 初始化衣橱数据
    window.globalState.wardrobeData = {
        tops: [],
        bottoms: [],
        shoes: [],
        outerwear: [],
        accessories: []
    };
    
    // 初始化穿搭推荐
    window.globalState.outfitRecommendations = {
        current: null,
        history: []
    };
    
    // 初始化推送设置
    window.globalState.pushNotifications = {
        enabled: false,
        weatherAlerts: true,
        dailyOutfitRecommendation: true,
        specialEvents: true,
        lastNotificationTime: 0,
        notificationHistory: []
    };
    
    // 初始化工具对象
    if (!window.utils) {
        window.utils = {
            // 格式化日期
            formatDate: function(date) {
                const options = { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' };
                return date.toLocaleDateString('zh-CN', options);
            },
            
            // 格式化温度
            formatTemp: function(temp) {
                return `${Math.round(temp)}°`;
            },
            
            // 存储工具
            storage: {
                // 保存数据到本地存储
                save: function(key, data) {
                    try {
                        localStorage.setItem(key, JSON.stringify(data));
                        return true;
                    } catch (error) {
                        console.error('保存数据失败:', error);
                        return false;
                    }
                },
                
                // 从本地存储加载数据
                load: function(key) {
                    try {
                        const data = localStorage.getItem(key);
                        return data ? JSON.parse(data) : null;
                    } catch (error) {
                        console.error('加载数据失败:', error);
                        return null;
                    }
                },
                
                // 从本地存储删除数据
                remove: function(key) {
                    try {
                        localStorage.removeItem(key);
                        return true;
                    } catch (error) {
                        console.error('删除数据失败:', error);
                        return false;
                    }
                }
            }
        };
    }
}

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
    
    // 切换位置按钮
    const changeLocationBtn = document.getElementById('change-location');
    if (changeLocationBtn) {
        changeLocationBtn.addEventListener('click', function() {
            openLocationModal();
        });
    }
    
    // 头像上传按钮
    const avatarUploadBtn = document.getElementById('avatar-upload');
    if (avatarUploadBtn) {
        avatarUploadBtn.addEventListener('change', handleAvatarUpload);
    }
    
    // 保存个人信息按钮
    const saveProfileBtn = document.getElementById('save-profile');
    if (saveProfileBtn) {
        saveProfileBtn.addEventListener('click', saveProfile);
    }
    
    // 关闭个人信息编辑器按钮
    const closeProfileBtn = document.getElementById('close-profile-editor');
    if (closeProfileBtn) {
        closeProfileBtn.addEventListener('click', closeProfileEditor);
    }
    
    // 点击天气卡片查看详情
    const weatherCard = document.querySelector('.card.bg-white:first-child');
    if (weatherCard) {
        weatherCard.addEventListener('click', function() {
            const weatherContent = document.getElementById('weather-content');
            if (weatherContent) {
                if (weatherContent.classList.contains('hidden')) {
                    weatherContent.classList.remove('hidden');
                    const weatherLoader = document.getElementById('weather-loader');
                    if (weatherLoader) {
                        weatherLoader.classList.add('hidden');
                    }
                }
            }
        });
    }
    
    // 设置位置相关事件
    setupLocationEvents();
    
    // 设置季节选择器事件
    const seasonOptions = document.querySelectorAll('.season-option');
    seasonOptions.forEach(option => {
        option.addEventListener('click', function() {
            seasonOptions.forEach(opt => opt.classList.remove('bg-blue-500', 'text-white'));
            this.classList.add('bg-blue-500', 'text-white');
            
            // 根据季节更新穿搭推荐
            const season = this.getAttribute('data-season');
            if (season) {
                showNotification(`已切换到${getSeasionName(season)}装搭配`, 'info');
                // TODO: 实现基于季节的搭配推荐
            }
        });
    });
}

/**
 * 获取季节名称
 * @param {string} season - 季节代码
 * @returns {string} 季节名称
 */
function getSeasionName(season) {
    const seasonMap = {
        'spring': '春季',
        'summer': '夏季',
        'autumn': '秋季',
        'winter': '冬季'
    };
    return seasonMap[season] || '四季';
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
 * 加载位置数据
 */
function loadLocationData() {
    try {
        // 从本地存储加载位置信息
        const savedLocation = window.utils.storage.load('userLocation');
        if (savedLocation) {
            window.globalState.userLocation = { ...window.globalState.userLocation, ...savedLocation };
        }
        
        // 如果没有位置信息或没有手动设置过，尝试通过IP获取
        if (!window.globalState.userLocation.city || !window.globalState.userLocation.manuallySet) {
            // 我们会在fetchWeatherData中处理位置获取
        }
        
        // 设置位置相关事件
        setupLocationEvents();
    } catch (error) {
        console.error('加载位置数据时出错:', error);
    }
}

/**
 * 设置位置选择相关事件
 */
function setupLocationEvents() {
    try {
        // 关闭按钮
        const closeLocationBtn = document.getElementById('close-location-modal');
        if (closeLocationBtn) {
            closeLocationBtn.addEventListener('click', closeLocationModal);
        }
        
        // 当前位置按钮
        const useCurrentLocationBtn = document.getElementById('use-current-location');
        if (useCurrentLocationBtn) {
            useCurrentLocationBtn.addEventListener('click', function() {
                // 使用IP定位获取当前城市
                getLocationByIP();
                closeLocationModal();
            });
        }
        
        // 热门城市按钮
        const cityOptions = document.querySelectorAll('.city-option');
        cityOptions.forEach(button => {
            button.addEventListener('click', function() {
                const cityName = this.getAttribute('data-city');
                if (cityName) {
                    setUserLocation(cityName, 'manual');
                    closeLocationModal();
                    fetchWeatherData();
                }
            });
        });
        
        // 城市搜索
        const searchCityInput = document.getElementById('search-city');
        if (searchCityInput) {
            searchCityInput.addEventListener('keyup', function(event) {
                if (event.key === 'Enter') {
                    const cityName = searchCityInput.value.trim();
                    if (cityName) {
                        setUserLocation(cityName, 'manual');
                        closeLocationModal();
                        fetchWeatherData();
                        searchCityInput.value = '';
                    }
                }
            });
        }
    } catch (error) {
        console.error('设置位置选择事件时出错:', error);
    }
}

/**
 * 打开位置选择模态框
 */
function openLocationModal() {
    try {
        const locationModal = document.getElementById('location-modal');
        if (locationModal) {
            // 获取当前位置
            getLocationByIP();
            
            // 显示模态框
            locationModal.classList.remove('hidden');
        }
    } catch (error) {
        console.error('打开位置选择模态框时出错:', error);
    }
}

/**
 * 关闭位置选择模态框
 */
function closeLocationModal() {
    try {
        const locationModal = document.getElementById('location-modal');
        if (locationModal) {
            locationModal.classList.add('hidden');
        }
    } catch (error) {
        console.error('关闭位置选择模态框时出错:', error);
    }
}

/**
 * 通过IP获取当前位置
 */
function getLocationByIP() {
    try {
        // 显示加载状态
        const autoLocationEl = document.getElementById('auto-location');
        if (autoLocationEl) {
            autoLocationEl.textContent = '正在获取位置...';
        }
        
        // 如果已经有缓存的位置信息，先显示
        const cachedLocation = window.utils.storage.load('userLocation');
        if (cachedLocation && cachedLocation.city) {
            if (autoLocationEl) {
                autoLocationEl.textContent = cachedLocation.city;
            }
        }
        
        // 使用IP-API获取位置
        fetch('https://ipapi.co/json/')
            .then(response => response.json())
            .then(data => {
                // 成功获取位置
                const city = data.city || '未知城市';
                const province = data.region || '';
                
                // 更新显示
                if (autoLocationEl) {
                    autoLocationEl.textContent = data.city ? `${data.city}${data.region ? ', ' + data.region : ''}` : '未知城市';
                }
                
                // 设置位置
                setUserLocation(city, 'auto', province);
                
                // 如果用户没有手动设置位置，则获取天气
                if (!window.globalState.userLocation.manuallySet) {
                    fetchWeatherData();
                }
            })
            .catch(error => {
                console.error('通过IP获取位置出错:', error);
                if (autoLocationEl) {
                    autoLocationEl.textContent = '无法获取位置';
                }
                
                // 使用默认位置
                setUserLocation('北京市', 'auto');
                fetchWeatherData();
            });
    } catch (error) {
        console.error('获取IP位置时出错:', error);
        // 使用默认位置
        setUserLocation('北京市', 'auto');
    }
}

/**
 * 设置用户位置
 * @param {string} city - 城市名称
 * @param {string} source - 来源 ('auto' | 'manual')
 * @param {string} province - 省份名称
 */
function setUserLocation(city, source = 'auto', province = '') {
    try {
        // 设置用户位置
        window.globalState.userLocation = {
            city: city,
            province: province,
            district: '',
            source: source,
            manuallySet: source === 'manual'
        };
        
        // 保存到本地存储
        window.utils.storage.save('userLocation', window.globalState.userLocation);
    } catch (error) {
        console.error('设置用户位置时出错:', error);
    }
}

/**
 * 通过地址获取天气
 * @param {string} address - 地址
 */
function getWeatherByAddress(address) {
    try {
        // 假设将地址转换为城市名称
        // 这里可以使用地理编码API，比如百度或高德等
        const simplifiedCity = address.replace(/市$/, '').replace(/省$/, '');
        
        // 将简化后的地址设置为用户位置
        setUserLocation(simplifiedCity, 'manual');
        
        // 获取天气
        fetchWeatherData();
    } catch (error) {
        console.error('通过地址获取天气时出错:', error);
    }
}

/**
 * 打开个人信息编辑器
 */
function openProfileEditor() {
    try {
        // 获取模态框元素
        const profileModal = document.getElementById('profile-modal');
        if (!profileModal) {
            console.error('找不到个人信息模态框元素');
            showNotification('无法打开个人信息编辑器', 'error');
            return;
        }
        
        // 填充当前用户数据
        fillProfileForm();
        
        // 显示模态框
        profileModal.classList.remove('hidden');
        
        // 添加事件监听器（只添加一次）
        if (!window.profileEventListenersSet) {
            // 关闭按钮
            const closeBtn = document.getElementById('close-profile-modal');
            if (closeBtn) {
                closeBtn.addEventListener('click', closeProfileEditor);
            }
            
            // 保存按钮
            const saveBtn = document.getElementById('save-profile');
            if (saveBtn) {
                saveBtn.addEventListener('click', saveProfile);
            }
            
            // 头像上传
            const avatarUpload = document.getElementById('avatar-upload');
            if (avatarUpload) {
                avatarUpload.addEventListener('change', handleAvatarUpload);
            }
            
            window.profileEventListenersSet = true;
        }
    } catch (error) {
        console.error('打开个人信息编辑器时出错:', error);
        showNotification('无法打开个人信息编辑器', 'error');
    }
}

/**
 * 关闭个人信息编辑器
 */
function closeProfileEditor() {
    try {
        const profileModal = document.getElementById('profile-modal');
        if (profileModal) {
            profileModal.classList.add('hidden');
        }
    } catch (error) {
        console.error('关闭个人信息编辑器时出错:', error);
    }
}

/**
 * 填充个人信息表单
 */
function fillProfileForm() {
    try {
        const profile = window.globalState.userProfile;
        
        // 设置用户名
        const nameInput = document.getElementById('profile-name');
        if (nameInput) {
            nameInput.value = profile.name || '';
        }
        
        // 设置性别
        const genderInputs = document.getElementsByName('profile-gender');
        if (genderInputs && genderInputs.length > 0) {
            for (const input of genderInputs) {
                input.checked = input.value === profile.gender;
            }
        }
        
        // 设置身高和体重
        const heightInput = document.getElementById('profile-height');
        if (heightInput) {
            heightInput.value = profile.height || '';
        }
        
        const weightInput = document.getElementById('profile-weight');
        if (weightInput) {
            weightInput.value = profile.weight || '';
        }
        
        // 设置年龄
        const ageInput = document.getElementById('profile-age');
        if (ageInput) {
            ageInput.value = profile.age || '';
        }
        
        // 设置风格偏好
        const styleInputs = document.getElementsByName('profile-style');
        if (styleInputs && styleInputs.length > 0) {
            for (const input of styleInputs) {
                input.checked = profile.styles && profile.styles.includes(input.value);
            }
        }
        
        // 设置地址
        const addressInput = document.getElementById('profile-address');
        if (addressInput) {
            addressInput.value = profile.address || '';
        }
        
        // 设置头像
        const avatarPreview = document.getElementById('avatar-preview');
        if (avatarPreview && profile.avatar) {
            avatarPreview.innerHTML = `<img src="${profile.avatar}" alt="用户头像" class="w-full h-full object-cover">`;
        }
    } catch (error) {
        console.error('填充个人信息表单时出错:', error);
    }
}

/**
 * 处理头像上传
 * @param {Event} event - 上传事件
 */
function handleAvatarUpload(event) {
    try {
        const file = event.target.files[0];
        if (!file) return;
        
        // 检查文件类型
        if (!file.type.startsWith('image/')) {
            showNotification('请选择图片文件', 'error');
            return;
        }
        
        const reader = new FileReader();
        reader.onload = function(e) {
            // 更新预览
            const avatarPreview = document.getElementById('avatar-preview');
            if (avatarPreview) {
                avatarPreview.innerHTML = `<img src="${e.target.result}" alt="用户头像" class="w-full h-full object-cover">`;
            }
            
            // 保存到临时变量，等用户点击保存才正式保存
            window.tempAvatar = e.target.result;
        };
        reader.readAsDataURL(file);
    } catch (error) {
        console.error('处理头像上传时出错:', error);
        showNotification('头像上传失败', 'error');
    }
}

/**
 * 保存个人信息
 */
function saveProfile() {
    try {
        // 收集表单数据
        const name = document.getElementById('profile-name').value;
        
        // 收集性别
        let gender = '';
        const genderInputs = document.getElementsByName('profile-gender');
        for (const input of genderInputs) {
            if (input.checked) {
                gender = input.value;
                break;
            }
        }
        
        // 收集身高体重
        const height = document.getElementById('profile-height').value;
        const weight = document.getElementById('profile-weight').value;
        
        // 收集年龄
        const age = document.getElementById('profile-age').value;
        
        // 收集风格偏好
        const styles = [];
        const styleInputs = document.getElementsByName('profile-style');
        for (const input of styleInputs) {
            if (input.checked) {
                styles.push(input.value);
            }
        }
        
        // 收集地址
        const address = document.getElementById('profile-address').value;
        
        // 更新全局状态
        window.globalState.userProfile = {
            ...window.globalState.userProfile,
            name,
            gender,
            height,
            weight,
            age,
            styles,
            address,
            // 如果有临时头像，则更新
            avatar: window.tempAvatar || window.globalState.userProfile.avatar
        };
        
        // 清除临时头像
        delete window.tempAvatar;
        
        // 保存到本地存储
        window.utils.storage.save('userProfile', window.globalState.userProfile);
        
        // 更新UI
        updateProfileUI();
        
        // 关闭模态框
        closeProfileEditor();
        
        // 显示通知
        showNotification('个人信息保存成功', 'success');
        
        // 如果填写了地址，尝试获取该地址的天气
        if (address) {
            getWeatherByAddress(address);
        }
    } catch (error) {
        console.error('保存个人信息时出错:', error);
        showNotification('保存个人信息失败', 'error');
    }
}

/**
 * 获取天气数据
 */
function fetchWeatherData() {
    try {
        // 检查天气缓存
        const lastWeatherUpdate = window.utils.storage.load('lastWeatherUpdate') || 0;
        const weatherData = window.utils.storage.load('weatherData');
        const cachedCity = weatherData?.city || '';
        const currentCity = window.globalState.userLocation.city || '北京市';
        const now = Date.now();
        
        // 如果有缓存并且城市相同且不超过30分钟，使用缓存
        if (weatherData && cachedCity === currentCity && (now - lastWeatherUpdate < 30 * 60 * 1000)) {
            updateWeatherUI(weatherData);
            generateOutfitBasedOnWeather(weatherData);
            generateWeatherSuggestions(weatherData);
            calculateCarWashDates(weatherData);
            return;
        }
        
        // 显示加载状态
        const weatherContainer = document.getElementById('weather-container');
        if (weatherContainer) {
            weatherContainer.innerHTML = '<div class="text-center py-4"><i class="fas fa-spinner fa-spin text-2xl text-blue-500"></i><p class="mt-2">正在获取天气数据...</p></div>';
        }
        
        // 如果没有位置信息，先尝试获取位置
        if (!currentCity || currentCity === '未知城市') {
            getLocationByIP();
            return;
        }
        
        // 使用模拟天气数据（实际项目中应从API获取）
        setTimeout(function() {
            // 创建更详细的天气数据模型
            const mockWeatherData = {
                city: currentCity,
                current: {
                    temp: Math.floor(Math.random() * 10) + 15, // 15-25度
                    desc: ['晴', '多云', '阴', '小雨', '大雨'][Math.floor(Math.random() * 5)],
                    icon: ['sun', 'cloud-sun', 'cloud', 'cloud-rain', 'cloud-showers-heavy'][Math.floor(Math.random() * 5)],
                    humidity: Math.floor(Math.random() * 30) + 40, // 40-70%
                    windSpeed: Math.floor(Math.random() * 5) + 1, // 1-6级风
                    windDirection: ['东风', '南风', '西风', '北风'][Math.floor(Math.random() * 4)],
                    uv: ['低', '中等', '高'][Math.floor(Math.random() * 3)],
                    pressure: Math.floor(Math.random() * 20) + 1000, // 1000-1020hPa
                    feelsLike: Math.floor(Math.random() * 10) + 15 - 2 // 比实际温度低2度
                },
                forecast: Array.from({length: 5}, (_, i) => {
                    const date = new Date();
                    date.setDate(date.getDate() + i);
                    
                    const weatherTypes = ['晴', '多云', '阴', '小雨', '大雨'];
                    const iconTypes = ['sun', 'cloud-sun', 'cloud', 'cloud-rain', 'cloud-showers-heavy'];
                    const weatherIndex = Math.floor(Math.random() * 5);
                    
                    return {
                        date: date,
                        dayOfWeek: ['周日', '周一', '周二', '周三', '周四', '周五', '周六'][date.getDay()],
                        tempHigh: Math.floor(Math.random() * 10) + 15, // 15-25度
                        tempLow: Math.floor(Math.random() * 10) + 5, // 5-15度
                        desc: weatherTypes[weatherIndex],
                        icon: iconTypes[weatherIndex],
                        precipitation: Math.random() * 100, // 0-100%降水概率
                        humidity: Math.floor(Math.random() * 30) + 40 // 40-70%湿度
                    };
                }),
                hourly: Array.from({length: 24}, (_, i) => {
                    const hour = (new Date().getHours() + i) % 24;
                    const hourStr = `${hour < 10 ? '0' + hour : hour}:00`;
                    
                    // 温度模拟：白天温度更高，晚上温度更低
                    let tempOffset = 0;
                    if (hour >= 10 && hour <= 16) { // 10am-4pm
                        tempOffset = 3; // 较高温
                    } else if (hour >= 0 && hour <= 5) { // 0am-5am
                        tempOffset = -3; // 较低温
                    }
                    
                    const weatherTypes = ['晴', '多云', '阴', '小雨', '大雨'];
                    const iconTypes = ['sun', 'cloud-sun', 'cloud', 'cloud-rain', 'cloud-showers-heavy'];
                    const weatherIndex = Math.floor(Math.random() * 5);
                    
                    return {
                        time: hourStr,
                        hour: hour,
                        temp: Math.floor(Math.random() * 8) + 15 + tempOffset, // 基础温度15-23度加上时间偏移
                        desc: weatherTypes[weatherIndex],
                        icon: iconTypes[weatherIndex],
                        windSpeed: Math.floor(Math.random() * 5) + 1, // 1-6级风
                        precipitation: Math.floor(Math.random() * 100) // 0-100%降水概率
                    };
                }),
                airQuality: {
                    aqi: Math.floor(Math.random() * 100) + 30, // 30-130 AQI
                    pm25: Math.floor(Math.random() * 70) + 10, // 10-80 PM2.5
                    pm10: Math.floor(Math.random() * 100) + 20, // 20-120 PM10
                    level: ['优', '良', '轻度污染'][Math.floor(Math.random() * 3)]
                },
                sunrise: '06:15',
                sunset: '18:30',
                // 生活指数
                lifeIndex: {
                    comfort: {level: ['舒适', '较舒适', '较不舒适'][Math.floor(Math.random() * 3)], desc: '白天温度适宜，风力不大'},
                    carWash: {level: ['适宜', '较适宜', '不适宜'][Math.floor(Math.random() * 3)], desc: '天气较好，适合洗车'},
                    dressing: {level: ['舒适', '较舒适', '较热'][Math.floor(Math.random() * 3)], desc: '建议穿轻薄衣物'},
                    uvProtection: {level: ['弱', '中等', '强'][Math.floor(Math.random() * 3)], desc: '外出建议涂抹防晒霜'},
                    sport: {level: ['适宜', '较适宜', '不适宜'][Math.floor(Math.random() * 3)], desc: '天气较好，适合户外运动'}
                }
            };
            
            // 更新全局状态
            window.globalState.weatherData = mockWeatherData;
            window.utils.storage.save('weatherData', mockWeatherData);
            window.utils.storage.save('lastWeatherUpdate', now);
            
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
        
        // 更新当前天气详情
        const weatherDetailsElement = document.getElementById('weather-details');
        if (weatherDetailsElement) {
            weatherDetailsElement.innerHTML = `
                <div class="grid grid-cols-2 gap-2 mt-3">
                    <div class="flex items-center">
                        <i class="fas fa-temperature-low text-gray-400 mr-2"></i>
                        <span>体感温度: ${weatherData.current.feelsLike || weatherData.current.temp}°C</span>
                    </div>
                    <div class="flex items-center">
                        <i class="fas fa-tint text-blue-400 mr-2"></i>
                        <span>湿度: ${weatherData.current.humidity}%</span>
                    </div>
                    <div class="flex items-center">
                        <i class="fas fa-wind text-gray-400 mr-2"></i>
                        <span>风力: ${weatherData.current.windSpeed}级 ${weatherData.current.windDirection || ''}</span>
                    </div>
                    <div class="flex items-center">
                        <i class="fas fa-sun text-yellow-400 mr-2"></i>
                        <span>紫外线: ${weatherData.current.uv || '中等'}</span>
                    </div>
                </div>
            `;
        }
        
        // 更新空气质量信息
        const airQualityElement = document.getElementById('air-quality');
        if (airQualityElement && weatherData.airQuality) {
            let aqiClass = 'text-green-500';
            if (weatherData.airQuality.aqi > 100) {
                aqiClass = 'text-red-500';
            } else if (weatherData.airQuality.aqi > 50) {
                aqiClass = 'text-yellow-500';
            }
            
            airQualityElement.innerHTML = `
                <div class="flex justify-between items-center mb-2">
                    <span class="text-gray-500">空气质量</span>
                    <span class="${aqiClass}">${weatherData.airQuality.level} (AQI: ${weatherData.airQuality.aqi})</span>
                </div>
                <div class="flex justify-between items-center text-sm">
                    <span>PM2.5: ${weatherData.airQuality.pm25}</span>
                    <span>PM10: ${weatherData.airQuality.pm10}</span>
                </div>
            `;
        }
        
        // 更新日出日落信息
        const sunriseSunsetElement = document.getElementById('sunrise-sunset');
        if (sunriseSunsetElement && weatherData.sunrise && weatherData.sunset) {
            sunriseSunsetElement.innerHTML = `
                <div class="flex justify-between items-center">
                    <div class="flex items-center">
                        <i class="fas fa-sun text-yellow-400 mr-2"></i>
                        <span>日出: ${weatherData.sunrise}</span>
                    </div>
                    <div class="flex items-center">
                        <i class="fas fa-moon text-blue-400 mr-2"></i>
                        <span>日落: ${weatherData.sunset}</span>
                    </div>
                </div>
            `;
        }
        
        // 更新生活指数
        const lifeIndexElement = document.getElementById('life-index');
        if (lifeIndexElement && weatherData.lifeIndex) {
            let lifeIndexHTML = '<div class="grid grid-cols-2 gap-3 mt-2">';
            
            for (const [key, value] of Object.entries(weatherData.lifeIndex)) {
                let indexName = '舒适度';
                let iconClass = 'fa-smile';
                
                switch (key) {
                    case 'comfort':
                        indexName = '舒适度';
                        iconClass = 'fa-smile';
                        break;
                    case 'carWash':
                        indexName = '洗车';
                        iconClass = 'fa-car';
                        break;
                    case 'dressing':
                        indexName = '穿衣';
                        iconClass = 'fa-tshirt';
                        break;
                    case 'uvProtection':
                        indexName = '防晒';
                        iconClass = 'fa-umbrella-beach';
                        break;
                    case 'sport':
                        indexName = '运动';
                        iconClass = 'fa-running';
                        break;
                }
                
                lifeIndexHTML += `
                    <div class="p-2 bg-gray-50 rounded-lg">
                        <div class="flex items-center mb-1">
                            <i class="fas ${iconClass} text-blue-500 mr-2"></i>
                            <span class="font-medium">${indexName}</span>
                        </div>
                        <div class="text-sm text-gray-600">${value.level}</div>
                        <div class="text-xs text-gray-500 mt-1">${value.desc}</div>
                    </div>
                `;
            }
            
            lifeIndexHTML += '</div>';
            lifeIndexElement.innerHTML = lifeIndexHTML;
        }
        
        // 更新小时预报
        const hourlyForecastContainer = document.getElementById('hourly-forecast');
        if (hourlyForecastContainer && weatherData.hourly) {
            hourlyForecastContainer.innerHTML = '';
            
            // 只显示接下来的10个小时
            const nextHours = weatherData.hourly.slice(0, 10);
            
            nextHours.forEach(hour => {
                const hourElement = document.createElement('div');
                hourElement.className = 'px-2 text-center min-w-[80px]';
                hourElement.innerHTML = `
                    <div class="text-sm text-gray-500">${hour.time}</div>
                    <div class="my-2"><i class="fas fa-${getWeatherIcon(hour.icon)} text-gray-400"></i></div>
                    <div class="text-sm font-bold">${window.utils.formatTemp(hour.temp)}</div>
                    ${hour.precipitation > 30 ? `<div class="text-xs text-blue-500">${Math.round(hour.precipitation)}%</div>` : ''}
                `;
                hourlyForecastContainer.appendChild(hourElement);
            });
        }
        
        // 更新天气预报
        const dailyForecastContainer = document.getElementById('daily-forecast');
        if (dailyForecastContainer && weatherData.forecast) {
            let forecastHTML = '';
            
            weatherData.forecast.forEach((day, index) => {
                const dateStr = index === 0 ? '今天' : day.dayOfWeek;
                
                forecastHTML += `
                    <div class="flex items-center justify-between py-2 ${index !== 0 ? 'border-t border-gray-100' : ''}">
                        <div class="w-20">
                            <div class="font-medium">${dateStr}</div>
                            <div class="text-xs text-gray-500">${day.date.getMonth() + 1}月${day.date.getDate()}日</div>
                        </div>
                        <div class="flex items-center">
                            <i class="fas fa-${getWeatherIcon(day.icon)} text-gray-400 mr-3"></i>
                            <span>${day.desc}</span>
                        </div>
                        <div class="text-right">
                            <span class="text-red-500 font-medium">${day.tempHigh}°</span>
                            <span class="mx-1 text-gray-300">|</span>
                            <span class="text-blue-500">${day.tempLow}°</span>
                        </div>
                    </div>
                `;
            });
            
            dailyForecastContainer.innerHTML = forecastHTML;
        }
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