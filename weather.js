// 天气API配置
const AMAP_WEATHER_API_URL = 'http://localhost:3000/mcp_amap_maps_maps_weather';
const AMAP_IP_LOCATION_API_URL = 'http://localhost:3000/mcp_amap_maps_maps_ip_location';
const DEFAULT_CITY = '杭州'; // 默认城市，当IP定位失败时使用

// 获取用户IP定位信息
async function getLocationByIP() {
    try {
        const response = await fetch(AMAP_IP_LOCATION_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                ip: '' // 不传IP参数时会自动获取当前用户IP
            })
        });
        
        if (!response.ok) {
            throw new Error('IP定位失败');
        }
        
        const data = await response.json();
        if (data && data.city) {
            return data.city;
        }
        throw new Error('无法获取城市信息');
    } catch (error) {
        console.error('IP定位错误:', error);
        return DEFAULT_CITY;
    }
}

// 获取天气数据
async function fetchWeatherData() {
    try {
        // 先获取用户所在城市
        const city = await getLocationByIP();
        
        const response = await fetch(AMAP_WEATHER_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                city: city
            })
        });
        
        if (!response.ok) {
            throw new Error('天气数据获取失败');
        }
        
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('获取天气数据错误:', error);
        return null;
    }
}

// 更新天气信息显示
function updateWeatherDisplay(weatherData) {
    const currentWeather = document.querySelector('.current-weather');
    const forecastList = document.querySelector('.forecast-list');
    const adviceContent = document.querySelector('.advice-content');
    const cityDisplay = document.querySelector('.city-name');

    if (!weatherData || !weatherData.lives || weatherData.lives.length === 0) {
        currentWeather.innerHTML = '<p>无法获取天气数据</p>';
        return;
    }

    // 更新当前天气
    const today = weatherData.lives[0];
    
    // 更新城市名称
    if (cityDisplay) {
        cityDisplay.textContent = today.city;
    }

    currentWeather.innerHTML = `
        <h3>${today.city}天气</h3>
        <div class="weather-main">
            <div class="temperature">${today.temperature}°C</div>
            <div class="weather-desc">${today.weather}</div>
            <div class="humidity">湿度: ${today.humidity}%</div>
        </div>
        <div class="weather-indices">
            <div class="index-item">
                <i class="fas fa-tshirt"></i>
                <span>穿衣指数: ${getDressingIndex(today.temperature)}</span>
            </div>
            <div class="index-item">
                <i class="fas fa-magic"></i>
                <span>化妆指数: ${getMakeupIndex(today.humidity, today.weather)}</span>
            </div>
            <div class="index-item">
                <i class="fas fa-umbrella"></i>
                <span>洗车指数: ${getCarWashingIndex(today.weather)}</span>
            </div>
            <div class="index-item">
                <i class="fas fa-running"></i>
                <span>运动指数: ${getSportIndex(today.temperature, today.weather)}</span>
            </div>
            <div class="index-item">
                <i class="fas fa-sun"></i>
                <span>紫外线指数: ${getUVIndex(today.weather)}</span>
            </div>
        </div>
    `;

    // 更新天气预报（由于高德天气API实况数据不包含预报，这里暂时隐藏）
    if (forecastList) {
        forecastList.style.display = 'none';
    }

    // 更新穿衣建议
    if (adviceContent) {
        adviceContent.innerHTML = `
            <div class="advice-section">
                <h4>今日穿衣建议</h4>
                <p>${generateDressingAdvice(today)}</p>
            </div>
            <div class="advice-section">
                <h4>防晒建议</h4>
                <p>${generateSunProtectionAdvice(getUVIndex(today.weather))}</p>
            </div>
        `;
    }
}

// 根据温度获取穿衣指数
function getDressingIndex(temperature) {
    const temp = parseInt(temperature);
    if (temp < 10) return '较冷';
    if (temp < 20) return '舒适';
    if (temp < 25) return '较热';
    return '炎热';
}

// 根据湿度和天气获取化妆指数
function getMakeupIndex(humidity, weather) {
    if (weather.includes('雨')) return '较差';
    if (parseInt(humidity) > 80) return '较差';
    return '适宜';
}

// 根据天气获取洗车指数
function getCarWashingIndex(weather) {
    if (weather.includes('雨') || weather.includes('雪')) return '不宜';
    if (weather.includes('阴')) return '较适宜';
    return '适宜';
}

// 根据温度和天气获取运动指数
function getSportIndex(temperature, weather) {
    const temp = parseInt(temperature);
    if (weather.includes('雨') || weather.includes('雪')) return '不宜';
    if (temp < 10 || temp > 35) return '较差';
    return '适宜';
}

// 根据天气获取紫外线指数
function getUVIndex(weather) {
    if (weather.includes('晴')) return '强';
    if (weather.includes('阴') || weather.includes('雨')) return '弱';
    return '中等';
}

// 生成穿衣建议
function generateDressingAdvice(weather) {
    const temp = parseInt(weather.temperature);
    let advice = '';
    
    if (temp < 10) {
        advice = '建议穿着保暖外套、毛衣、围巾等保暖衣物';
    } else if (temp < 20) {
        advice = '建议穿着长袖衬衫、薄外套等春秋装';
    } else if (temp < 25) {
        advice = '建议穿着短袖、薄外套等轻便衣物';
    } else {
        advice = '建议穿着轻薄透气的衣物，注意防晒';
    }

    if (weather.humidity > 70) {
        advice += '，注意防潮';
    }

    return advice;
}

// 生成防晒建议
function generateSunProtectionAdvice(uvIndex) {
    if (uvIndex <= 2) {
        return '紫外线较弱，可以适当外出活动';
    } else if (uvIndex <= 5) {
        return '紫外线中等，建议涂抹防晒霜，戴帽子';
    } else if (uvIndex <= 7) {
        return '紫外线较强，建议避免长时间户外活动，做好防晒措施';
    } else {
        return '紫外线很强，建议避免户外活动，必须外出时做好全面防晒';
    }
}

// 用户自拍分析功能
class SelfieAnalyzer {
    constructor() {
        this.uploadInput = document.getElementById('selfie-upload');
        this.analysisForm = document.getElementById('analysis-form');
        this.analysisResult = document.getElementById('analysis-result');
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        if (this.uploadInput) {
            this.uploadInput.addEventListener('change', this.handleImageUpload.bind(this));
        }
        if (this.analysisForm) {
            this.analysisForm.addEventListener('submit', this.handleFormSubmit.bind(this));
        }
    }

    handleImageUpload(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const preview = document.getElementById('selfie-preview');
                if (preview) {
                    preview.src = e.target.result;
                    preview.style.display = 'block';
                }
            };
            reader.readAsDataURL(file);
        }
    }

    async handleFormSubmit(event) {
        event.preventDefault();
        const formData = new FormData(this.analysisForm);
        const analysisData = {
            height: formData.get('height'),
            bodyType: formData.get('bodyType'),
            skinTone: formData.get('skinTone'),
            hairStyle: formData.get('hairStyle'),
            facialFeatures: formData.get('facialFeatures')
        };

        // 这里可以添加实际的AI分析API调用
        this.showAnalysisResult(analysisData);
    }

    showAnalysisResult(data) {
        const result = `
            <div class="analysis-section">
                <h4>个人形象分析</h4>
                <div class="analysis-item">
                    <h5>着装建议</h5>
                    <p>${this.generateDressingAdvice(data)}</p>
                </div>
                <div class="analysis-item">
                    <h5>发型建议</h5>
                    <p>${this.generateHairAdvice(data)}</p>
                </div>
                <div class="analysis-item">
                    <h5>美妆建议</h5>
                    <p>${this.generateMakeupAdvice(data)}</p>
                </div>
            </div>
        `;
        
        if (this.analysisResult) {
            this.analysisResult.innerHTML = result;
            this.analysisResult.style.display = 'block';
        }
    }

    generateDressingAdvice(data) {
        // 这里可以根据实际数据生成更详细的建议
        return `根据您的身高${data.height}cm和${data.bodyType}体型，建议选择...`;
    }

    generateHairAdvice(data) {
        return `根据您的${data.hairStyle}发型和${data.facialFeatures}五官特点，建议...`;
    }

    generateMakeupAdvice(data) {
        return `根据您的${data.skinTone}肤色，建议...`;
    }
}

// 初始化
document.addEventListener('DOMContentLoaded', async () => {
    // 初始化天气显示
    const weatherData = await fetchWeatherData();
    updateWeatherDisplay(weatherData);

    // 初始化自拍分析器
    new SelfieAnalyzer();
}); 