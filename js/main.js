// 全局状态管理
const globalState = {
    // 用户信息
    user: {
        height: null,
        weight: null,
        gender: null,
        preferences: [],
        lastUpdate: null
    },
    // 天气信息
    weather: {
        current: null,
        forecast: null,
        lastUpdate: null
    },
    // 衣柜数据
    wardrobe: {
        items: [],
        categories: [
            { id: 'tops', name: '上装' },
            { id: 'bottoms', name: '下装' },
            { id: 'shoes', name: '鞋子' },
            { id: 'outerwear', name: '外套' },
            { id: 'accessories', name: '配件' }
        ],
        lastUpdate: null
    },
    // 搭配推荐
    outfits: {
        current: null,
        history: [],
        favorites: []
    }
};

// 工具函数
const utils = {
    // 日期格式化
    formatDate(date) {
        return new Date(date).toLocaleDateString('zh-CN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    },

    // 温度格式化
    formatTemperature(temp) {
        return `${Math.round(temp)}°`;
    },

    // 本地存储操作
    storage: {
        save(key, data) {
            try {
                localStorage.setItem(key, JSON.stringify(data));
                return true;
            } catch (error) {
                console.error('Storage save error:', error);
                return false;
            }
        },

        load(key) {
            try {
                const data = localStorage.getItem(key);
                return data ? JSON.parse(data) : null;
            } catch (error) {
                console.error('Storage load error:', error);
                return null;
            }
        }
    },

    // 防抖函数
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
};

// API 请求封装 - 使用高德地图API
const api = {
    // 获取天气信息
    async getWeather(location) {
        try {
            // 使用高德地图MCP获取天气信息
            const result = await mcp_amap_maps_maps_weather({
                city: `${location.lng},${location.lat}` // 使用经纬度请求天气
            });
            
            if (result && result.status === '1') {
                const weatherData = WeatherController.processWeatherData(result);
                
                globalState.weather = {
                    current: weatherData.current,
                    forecast: weatherData.forecast,
                    lifeIndex: weatherData.lifeIndex,
                    lastUpdate: new Date()
                };
                
                utils.storage.save('weather', globalState.weather);
                
                // 触发天气更新事件
                window.dispatchEvent(new CustomEvent('weatherupdate', { 
                    detail: globalState.weather 
                }));
                
                return weatherData;
            } else {
                throw new Error('Invalid weather data');
            }
        } catch (error) {
            console.error('Failed to fetch weather:', error);
            throw error;
        }
    },

    // 更新用户信息
    async updateUserProfile(userData) {
        try {
            // 简单存储用户数据
            globalState.user = {
                ...userData,
                lastUpdate: new Date()
            };
            utils.storage.save('user', globalState.user);
            return globalState.user;
        } catch (error) {
            console.error('Failed to update user profile:', error);
            throw error;
        }
    },
    
    // 获取地址信息
    async getLocationInfo(location) {
        try {
            // 使用高德地图MCP获取地址信息
            const result = await mcp_amap_maps_maps_regeocode({
                location: `${location.lng},${location.lat}`
            });
            
            if (result && result.status === '1') {
                // 提取地址信息
                const addressComponent = result.regeocode.addressComponent;
                
                return {
                    province: addressComponent.province,
                    city: addressComponent.city,
                    district: addressComponent.district,
                    township: addressComponent.township,
                    street: addressComponent.street,
                    formattedAddress: result.regeocode.formatted_address
                };
            } else {
                throw new Error('Invalid location data');
            }
        } catch (error) {
            console.error('Failed to fetch location info:', error);
            throw error;
        }
    }
};

// 初始化应用
function initApp() {
    // 加载本地存储的数据
    const savedUser = utils.storage.load('user');
    if (savedUser) {
        globalState.user = savedUser;
    }
    
    const savedWeather = utils.storage.load('weather');
    if (savedWeather) {
        globalState.weather = savedWeather;
    }
    
    const savedWardrobe = utils.storage.load('wardrobe');
    if (savedWardrobe) {
        globalState.wardrobe = savedWardrobe;
    }
    
    // 如果没有天气数据或数据已过期，获取最新天气
    const weatherAge = globalState.weather?.lastUpdate 
        ? new Date() - new Date(globalState.weather.lastUpdate)
        : Infinity;
        
    if (!globalState.weather || weatherAge > 1800000) { // 30分钟更新一次
        navigator.geolocation.getCurrentPosition(
            position => {
                api.getWeather({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                }).catch(console.error);
            },
            error => {
                console.error('Geolocation error:', error);
            }
        );
    }
}

// 当 DOM 加载完成后初始化应用
document.addEventListener('DOMContentLoaded', initApp);

// 导出全局对象供其他模块使用
window.app = {
    state: globalState,
    utils,
    api
}; 