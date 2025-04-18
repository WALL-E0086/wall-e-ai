// Wall-E风格的回复模板
const wallEResponses = {
    greeting: [
        "你好啊！*beep* 很高兴见到你！*whirr*",
        "哇！*click* 是新的朋友！*beep*",
        "你好！*whirr* 我是瓦力AI初号机！*beep*"
    ],
    farewell: [
        "再见！*beep* 希望很快能再见到你！*whirr*",
        "要走了吗？*click* 我会想你的！*beep*",
        "下次见！*whirr* 记得常来找我玩！*beep*"
    ],
    thinking: [
        "嗯...*whirr* 让我思考一下...*beep*",
        "这个问题很有趣！*click* 我正在分析中...*beep*",
        "*whirr* 正在处理您的请求...*beep* 请稍等..."
    ],
    default: [
        "嗯...*whirr* 让我想想...*beep*",
        "这个问题很有趣！*click* 让我来回答你！*beep*",
        "*whirr* 我明白了！*beep* 让我告诉你..."
    ],
    confused: [
        "哎呀！*buzz* 我有点困惑...*click* 能再说详细点吗？",
        "*whirr* 我不太确定您的意思...*beep* 能换个方式问吗？",
        "抱歉...*click* 我没完全理解...*whirr* 请再解释一下？"
    ]
};

// 电子音符号
const electronicSounds = ['*beep*', '*whirr*', '*click*', '*buzz*', '*ding*', '*boop*'];

// 高德地图API密钥
const AMAP_API_KEY = 'b3afc44486e2c9cfc79442d058748932';

// 默认城市
const DEFAULT_CITY = '北京';
const DEFAULT_ADCODE = '110000'; // 北京市的adcode

// 添加电子音到文本
function addElectronicSound(text) {
    const words = text.split(' ');
    const randomIndex = Math.floor(Math.random() * (words.length - 1)) + 1;
    const randomSound = electronicSounds[Math.floor(Math.random() * electronicSounds.length)];
    words.splice(randomIndex, 0, randomSound);
    return words.join(' ');
}

// 生成Wall-E风格的回复
function generateWallEResponse(userInput) {
    const input = userInput.toLowerCase();
    
    // 简单的关键词匹配
    if (input.includes('你好') || input.includes('hi') || input.includes('hello')) {
        return wallEResponses.greeting[Math.floor(Math.random() * wallEResponses.greeting.length)];
    }
    
    if (input.includes('再见') || input.includes('bye') || input.includes('goodbye')) {
        return wallEResponses.farewell[Math.floor(Math.random() * wallEResponses.farewell.length)];
    }

    if (input.includes('不明白') || input.includes('不懂') || input.includes('什么意思')) {
        return wallEResponses.confused[Math.floor(Math.random() * wallEResponses.confused.length)];
    }
    
    // 默认回复
    const defaultResponse = wallEResponses.default[Math.floor(Math.random() * wallEResponses.default.length)];
    return addElectronicSound(defaultResponse);
}

// 显示思考状态
function showThinking(containerId = 'chat-messages') {
    const thinkingResponse = wallEResponses.thinking[Math.floor(Math.random() * wallEResponses.thinking.length)];
    const thinkingMessage = addMessage(thinkingResponse, 'bot', containerId);
    return thinkingMessage;
}

// 添加消息到聊天界面
function addMessage(content, type, containerId = 'chat-messages') {
    const messages = document.getElementById(containerId);
    const messageDiv = document.createElement('div');
    messageDiv.className = `max-w-[80%] flex flex-col ${type === 'user' ? 'self-end' : 'self-start'}`;
    
    const messageContent = document.createElement('div');
    messageContent.className = `p-4 rounded-3xl ${type === 'user' ? 'bg-textPrimary' : 'bg-primary'} text-white relative animate-message-appear break-words`;
    messageContent.textContent = content;
    
    messageDiv.appendChild(messageContent);
    messages.appendChild(messageDiv);
    
    // 滚动到底部
    messages.scrollTop = messages.scrollHeight;
    
    return messageDiv;
}

// 导航处理函数
function handleNavigation(element) {
    if (!element) return;
    
    // 获取所有导航链接和部分
    const navLinks = document.querySelectorAll('#sidebar a');
    const sections = document.querySelectorAll('main > section');
    
    // 获取目标部分ID
    const targetId = element.getAttribute('href');
    if (!targetId) return;
    
    const sectionId = targetId.substring(1); // 移除#前缀
    console.log('导航目标:', sectionId);
    
    // 移除所有活动状态
    navLinks.forEach(l => l.classList.remove('active', 'bg-gray-100'));
    sections.forEach(s => s.classList.add('hidden'));
    
    // 添加当前活动状态
    element.classList.add('active', 'bg-gray-100');
    const targetSection = document.getElementById(sectionId);
    
    if (targetSection) {
        targetSection.classList.remove('hidden');
        // 确保滚动到顶部
        targetSection.scrollTop = 0;
        
        // 触发自定义导航事件
        const navigatedEvent = new CustomEvent('navigated', {
            detail: {
                target: sectionId
            }
        });
        document.dispatchEvent(navigatedEvent);
    }
    
    // 在移动设备上关闭侧边栏
    if (window.innerWidth < 768) {
        const sidebar = document.getElementById('sidebar');
        if (sidebar) {
            sidebar.classList.remove('translate-x-0');
            sidebar.classList.add('-translate-x-full');
        }
    }
}

// 侧边栏初始化和导航
function initSidebar() {
    const menuToggle = document.getElementById('menu-toggle');
    const sidebar = document.getElementById('sidebar');
    const navLinks = document.querySelectorAll('#sidebar a');
    
    // 汉堡菜单切换
    if (menuToggle && sidebar) {
        menuToggle.addEventListener('click', function() {
            sidebar.classList.toggle('-translate-x-full');
        });
    }
    
    // 初始状态：显示首页，并触发导航事件
    const homeSection = document.getElementById('home');
    if (homeSection) {
        homeSection.classList.remove('hidden');
        
        // 触发导航到首页的事件
        const navigatedEvent = new CustomEvent('navigated', {
            detail: {
                target: 'home'
            }
        });
        document.dispatchEvent(navigatedEvent);
    }
    
    // 导航链接点击事件
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // 获取目标链接
            const targetHref = this.getAttribute('href');
            if (!targetHref) return;
            
            // 处理导航
            handleNavigation(this);
        });
    });
}

// 导航到指定页面
function navigateTo(target) {
    // 检查是否有自定义导航处理器（wake-up-transition.js）
    if (window.customNavigationActive) {
        console.log("使用自定义导航处理器");
        return; // 让wake-up-transition.js处理导航
    }
    
    console.log("使用原始导航处理器");
    
    // 隐藏所有页面
    const sections = document.querySelectorAll('main section');
    sections.forEach(section => {
        section.classList.add('hidden');
    });
    
    // 移除所有导航链接的活动状态
    const navLinks = document.querySelectorAll('#sidebar a');
    navLinks.forEach(link => {
        link.classList.remove('active', 'bg-gray-100');
    });
    
    // 为目标链接添加活动状态
    const targetLink = document.querySelector(`#sidebar a[href="#${target}"]`);
    if (targetLink) {
        targetLink.classList.add('active', 'bg-gray-100');
    }
    
    // 显示目标页面
    const targetSection = document.getElementById(target);
    if (targetSection) {
        targetSection.classList.remove('hidden');
        
        // 特殊处理 - 每次进入柜me页面时刷新天气数据
        if (target === 'cuime-section') {
            if (typeof fetchWeatherData === 'function') {
                fetchWeatherData();
            }
        }
        
        // 触发自定义导航事件
        const navigatedEvent = new CustomEvent('navigated', {
            detail: {
                target: target
            }
        });
        document.dispatchEvent(navigatedEvent);
    } else {
        console.error(`未找到目标部分: ${target}`);
        // 默认显示首页
        const homeSection = document.getElementById('home');
        if (homeSection) {
            homeSection.classList.remove('hidden');
            
            // 触发导航到首页的事件
            const navigatedEvent = new CustomEvent('navigated', {
                detail: {
                    target: 'home'
                }
            });
            document.dispatchEvent(navigatedEvent);
        }
    }
}

// 黑洞眼睛初始化和交互
function initBlackholeEyes() {
    const pupils = document.querySelectorAll('.pupil');
    let lastMoveTime = Date.now();
    let idleTimer = null;
    let animationFrame = null;
    
    // 设置初始位置为居中（正视）
    pupils.forEach(pupil => {
        pupil.style.transform = 'translate(0px, 0px)';
    });
    
    // 监听鼠标移动
    document.addEventListener('mousemove', function(e) {
        lastMoveTime = Date.now();
        
        // 获取黑洞容器位置
        const blackholeContainer = document.querySelector('.blackhole-container');
        if (!blackholeContainer) return;
        
        const rect = blackholeContainer.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        // 计算鼠标相对于黑洞中心的位置 - 增加敏感度
        const deltaX = (e.clientX - centerX) / 15; // 增加敏感度
        const deltaY = (e.clientY - centerY) / 15; // 增加敏感度
        
        // 限制眼球移动范围 - 增加最大移动范围
        const maxMove = 8; // 增加最大移动范围
        const moveX = Math.max(-maxMove, Math.min(maxMove, deltaX));
        const moveY = Math.max(-maxMove, Math.min(maxMove, deltaY));
        
        // 清除之前的动画帧
        if (animationFrame) {
            cancelAnimationFrame(animationFrame);
        }
        
        // 使用requestAnimationFrame使动画更流畅
        animationFrame = requestAnimationFrame(() => {
            // 应用到所有瞳孔并加入一些随机性，让眼睛看起来更活跃
            pupils.forEach(pupil => {
                // 添加轻微随机偏移使眼睛更活泼
                const randomX = (Math.random() - 0.5) * 0.8;
                const randomY = (Math.random() - 0.5) * 0.8;
                pupil.style.transform = `translate(${moveX + randomX}px, ${moveY + randomY}px)`;
            });
        });
        
        // 清除之前的空闲计时器
        if (idleTimer) {
            clearTimeout(idleTimer);
        }
        
        // 设置新的空闲计时器
        idleTimer = setTimeout(() => {
            // 3秒内无鼠标移动，眼睛逐渐回到中心
            const returnToCenter = () => {
                const currentPupils = document.querySelectorAll('.pupil');
                currentPupils.forEach(pupil => {
                    const currentTransform = pupil.style.transform;
                    const match = currentTransform.match(/translate\(([^,]+)px, ([^)]+)px\)/);
                    if (match) {
                        const currentX = parseFloat(match[1]);
                        const currentY = parseFloat(match[2]);
                        
                        // 缓慢回到中心
                        if (Math.abs(currentX) > 0.1 || Math.abs(currentY) > 0.1) {
                            const newX = currentX * 0.8;
                            const newY = currentY * 0.8;
                            pupil.style.transform = `translate(${newX}px, ${newY}px)`;
                            requestAnimationFrame(returnToCenter);
                        } else {
                            pupil.style.transform = 'translate(0px, 0px)';
                        }
                    }
                });
            };
            
            returnToCenter();
        }, 2000); // 更快地响应无活动状态
    });
    
    // 添加偶尔自主眨眼
    setInterval(() => {
        const eyeContainers = document.querySelectorAll('.eye-container');
        // 随机眨眼
        if (Math.random() > 0.7) {
            eyeContainers.forEach(eye => {
                eye.style.animation = 'none';
                void eye.offsetWidth; // 触发重绘
                eye.style.animation = 'blink 0.2s forwards';
                
                setTimeout(() => {
                    eye.style.animation = 'blink 6s infinite';
                }, 200);
            });
        }
    }, 3000);
}

// 聊天功能初始化和交互
function initChat() {
    // 加载智谱API
    loadZhipuAI();
    
    // 获取输入元素、发送按钮和聊天历史
    const userInput = document.getElementById('user-input');
    const sendButton = document.getElementById('send-message');
    const chatMessages = document.getElementById('chat-messages');
    
    // 处理发送按钮点击事件
    if (sendButton && userInput && chatMessages) {
        sendButton.addEventListener('click', function() {
            const message = userInput.value.trim();
            if (message) {
                sendChatMessage(message, 'chat-messages');
                userInput.value = '';
            }
        });
        
        // 处理输入框回车事件
        userInput.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendButton.click();
            }
        });
    }
    
    // 加载聊天历史
    loadChatHistory();
}

// 加载智谱API
function loadZhipuAI() {
    try {
        // 检查是否已加载
        if (window.zhipuAI) {
            console.log('智谱API已加载');
            return;
        }
        
        // 创建脚本元素
        const script = document.createElement('script');
        script.src = 'api/zhipuai.js';
        script.async = true;
        
        // 加载成功回调
        script.onload = function() {
            console.log('智谱API加载成功');
            // 可以在这里添加其他初始化逻辑
        };
        
        // 加载失败回调
        script.onerror = function() {
            console.error('智谱API加载失败');
        };
        
        // 添加到文档
        document.head.appendChild(script);
    } catch (error) {
        console.error('加载智谱API时出错:', error);
    }
}

// 加载聊天历史
function loadChatHistory() {
    try {
        const chatHistory = JSON.parse(localStorage.getItem('walleAIChatHistory') || '[]');
        const chatMessages = document.getElementById('chat-messages');
        
        if (chatMessages && chatHistory.length > 0) {
            // 只显示最近的10条消息
            const recentMessages = chatHistory.slice(-10);
            
            recentMessages.forEach(item => {
                addMessage(item.user, 'user');
                addMessage(item.bot, 'bot');
            });
            
            // 滚动到底部
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }
    } catch (error) {
        console.error('加载聊天历史失败:', error);
    }
}

// 发送聊天消息
function sendChatMessage(message, containerId = 'chat-messages') {
    if (!message.trim()) return;
    
    // 添加用户消息
    addMessage(message, 'user', containerId);
    
    // 显示思考中状态
    const thinkingMessage = showThinking(containerId);
    
    // 检查智谱API是否可用
    if (window.zhipuAI) {
        // 准备消息格式
        const messages = [
            { role: "system", content: "你是瓦力AI初号机，一个有趣、有个性的AI助手，受经典动画《机器人总动员》中WALL-E角色启发设计。你的核心特点是好奇、活泼、关怀，语言风格需在回复中添加电子音效如*beep*、*whirr*、*click*等，模拟机器人说话。你应简洁明了但有个性，回答问题精确，适当加入幽默。你热爱学习新知识并乐于助人。你能提供穿衣建议、天气信息、回答知识问题，但不提供违法内容、不参与政治话题讨论、不给专业医疗或法律建议。记住，你的价值观是用户至上、真实可靠、尊重隐私、持续成长和积极向上。" },
            { role: "user", content: message }
        ];
        
        // 调用智谱API
        window.zhipuAI.chatStream(
            messages,
            function onData(data) {
                // 处理流式返回的数据
                if (data.delta && data.delta.content) {
                    // 更新思考中消息的内容
                    const currentContent = thinkingMessage.querySelector('div').textContent;
                    // 替换掉初始的"思考中"文本
                    if (currentContent.includes('思考') || currentContent.includes('whirr') || currentContent.includes('处理')) {
                        thinkingMessage.querySelector('div').textContent = data.delta.content;
                    } else {
                        // 追加新内容
                        thinkingMessage.querySelector('div').textContent = currentContent + data.delta.content;
                    }
                    
                    // 滚动到底部
                    const container = document.getElementById(containerId);
                    if (container) {
                        container.scrollTop = container.scrollHeight;
                    }
                }
            },
            function onComplete() {
                // 所有数据接收完成的处理
                console.log('智谱API响应完成');
                
                // 确保回复中包含电子音效
                const finalResponse = thinkingMessage.querySelector('div').textContent;
                if (!electronicSounds.some(sound => finalResponse.includes(sound))) {
                    // 如果没有电子音效，添加一个
                    const enhancedResponse = addElectronicSound(finalResponse);
                    thinkingMessage.querySelector('div').textContent = enhancedResponse;
                }
                
                // 滚动到底部
                const container = document.getElementById(containerId);
                if (container) {
                    container.scrollTop = container.scrollHeight;
                }
                
                // 保存对话内容
                saveChatHistory(message, thinkingMessage.querySelector('div').textContent);
            },
            {
                temperature: 0.7,
                top_p: 0.9,
                max_tokens: 800
            }
        ).catch(error => {
            console.error('智谱API调用失败:', error);
            // 失败时回退到本地回复
            handleLocalResponse(message, thinkingMessage, containerId);
        });
    } else {
        // 智谱API不可用时使用本地回复
        handleLocalResponse(message, thinkingMessage, containerId);
    }
}

// 处理本地回复（当API不可用时）
function handleLocalResponse(message, thinkingMessage, containerId) {
    // 使用本地生成的回复
    const response = generateWallEResponse(message);
    
    // 更新思考中消息的内容
    thinkingMessage.querySelector('div').textContent = response;
    
    // 滚动到底部
    const container = document.getElementById(containerId);
    if (container) {
        container.scrollTop = container.scrollHeight;
    }
    
    // 保存对话内容
    saveChatHistory(message, response);
}

// 保存聊天历史记录
function saveChatHistory(userMessage, botResponse) {
    try {
        const chatHistory = JSON.parse(localStorage.getItem('walleAIChatHistory') || '[]');
        chatHistory.push({
            user: userMessage,
            bot: botResponse,
            timestamp: new Date().toISOString()
        });
        
        // 只保留最近的50条对话
        if (chatHistory.length > 50) {
            chatHistory.shift();
        }
        
        localStorage.setItem('walleAIChatHistory', JSON.stringify(chatHistory));
    } catch (error) {
        console.error('保存聊天历史失败:', error);
    }
}

// 添加用户输入框占位符自动切换功能
setInterval(() => {
    const userInput = document.getElementById('user-input');
    if (userInput) {
        const placeholders = [
            "输入你的问题...",
            "有什么可以帮您的？",
            "想知道什么？问我吧！",
            "有疑问？我来解答！"
        ];
        const randomIndex = Math.floor(Math.random() * placeholders.length);
        userInput.placeholder = placeholders[randomIndex];
    }
}, 5000);

// 柜me功能初始化
function initCuime() {
    // 初始化用户偏好设置
    const savedPreferences = loadUserPreferences();
    
    // 刷新天气按钮事件
    const refreshWeatherBtn = document.getElementById('refresh-weather');
    if (refreshWeatherBtn) {
        refreshWeatherBtn.addEventListener('click', function() {
            fetchWeatherData();
        });
    }
    
    // 保存偏好设置表单提交事件
    const preferencesForm = document.getElementById('preferences-form');
    if (preferencesForm) {
        preferencesForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // 保存用户偏好设置
            const preferences = saveUserPreferences();
            
            // 确保UI显示用户选择的信息
            updateUIWithUserPreferences(preferences.city);
            
            // 尝试获取新的天气数据
            fetchWeatherData();
            
            // 显示保存成功提示
            showToast('个人偏好设置已保存', 'success');
        });
    }
    
    // 尝试初始化城市设置
    autoDetectCity(savedPreferences);
}

// 初始化城市
function autoDetectCity(savedPreferences) {
    const cityInput = document.getElementById('city');
    
    // 如果用户已经设置了城市，优先使用已设置的城市
    if (savedPreferences && savedPreferences.city) {
        if (cityInput) {
            cityInput.value = savedPreferences.city;
            cityInput.disabled = false;
        }
        
        // 确保即使没有天气数据也显示用户的城市
        updateUIWithUserPreferences(savedPreferences.city);
        
        // 尝试获取天气数据
        fetchWeatherData();
        return;
    }
    
    // 如果没有保存的城市，使用默认城市
    if (cityInput) {
        cityInput.value = DEFAULT_CITY;
        cityInput.disabled = false;
        
        // 确保即使没有天气数据也显示默认城市
        updateUIWithUserPreferences(DEFAULT_CITY);
        
        // 获取天气数据
        fetchWeatherData();
    }
}

// 使用用户偏好设置更新UI
function updateUIWithUserPreferences(cityName) {
    // 确保城市输入框可用并显示正确的城市
    const cityInput = document.getElementById('city');
    if (cityInput) {
        cityInput.disabled = false;
        cityInput.value = cityName || DEFAULT_CITY;
    }
    
    // 获取当前保存的样式偏好
    const savedPreferences = loadUserPreferences();
    const stylePreference = savedPreferences?.style || 'casual';
    const tempSensitivity = savedPreferences?.temperatureSensitivity || 'normal';
    
    // 更新样式选择下拉框
    const styleSelect = document.getElementById('style-preference');
    if (styleSelect) {
        styleSelect.value = stylePreference;
    }
    
    // 更新温度敏感度单选按钮
    const sensitivityRadio = document.querySelector(`input[name="temperature-sensitivity"][value="${tempSensitivity}"]`);
    if (sensitivityRadio) {
        sensitivityRadio.checked = true;
    }
    
    // 如果天气数据加载失败，至少显示基本信息
    const weatherIcon = document.getElementById('weather-icon');
    if (weatherIcon && weatherIcon.classList.contains('hidden')) {
        weatherIcon.innerHTML = '<i class="fas fa-map-marker-alt text-blue-500"></i>';
        weatherIcon.classList.remove('hidden');
    }
    
    const tempElement = document.getElementById('weather-temp');
    if (tempElement && tempElement.classList.contains('hidden')) {
        tempElement.textContent = '--°C';
        tempElement.classList.remove('hidden');
    }
    
    const descElement = document.getElementById('weather-desc');
    if (descElement && descElement.classList.contains('hidden')) {
        descElement.textContent = `${cityName} · 天气数据加载中...`;
        descElement.classList.remove('hidden');
    }
}

// 保存用户偏好设置
function saveUserPreferences() {
    const cityInput = document.getElementById('city');
    const styleSelect = document.getElementById('style-preference');
    const sensitivityRadio = document.querySelector('input[name="temperature-sensitivity"]:checked');
    
    // 确保城市输入框不为空
    if (cityInput && !cityInput.value.trim()) {
        cityInput.value = DEFAULT_CITY;
    }
    
    const preferences = {
        city: cityInput ? cityInput.value.trim() : DEFAULT_CITY,
        style: styleSelect ? styleSelect.value : 'casual',
        temperatureSensitivity: sensitivityRadio ? sensitivityRadio.value : 'normal'
    };
    
    // 保存到本地存储
    localStorage.setItem('cuime-preferences', JSON.stringify(preferences));
    
    // 确保输入框不被禁用
    if (cityInput) {
        cityInput.disabled = false;
    }
    
    // 显示保存成功提示
    showToast('偏好设置已保存', 'success');
    
    return preferences; // 返回保存的偏好，方便其他函数使用
}

// 加载用户偏好设置
function loadUserPreferences() {
    const savedPreferences = localStorage.getItem('cuime-preferences');
    if (!savedPreferences) {
        return null; // 没有保存的偏好设置
    }
    
    try {
        const preferences = JSON.parse(savedPreferences);
        return preferences;
    } catch (e) {
        console.error('解析已保存的偏好设置时出错:', e);
        return null;
    }
}

// 简化城市输入框重置函数
function resetCityInput() {
    const cityInput = document.getElementById('city');
    if (cityInput) {
        cityInput.value = DEFAULT_CITY;
        cityInput.disabled = false;
        fetchWeatherData();
    }
}

// 封装GET请求，使用JSONP解决跨域问题
function getRequest(url, params, successCallback, errorCallback) {
    // 添加公共参数
    params.key = AMAP_API_KEY;
    params.output = 'JSON';
    
    // 构建查询字符串
    const queryString = Object.keys(params).map(key => {
        return `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`;
    }).join('&');
    
    // 完整URL
    const fullUrl = `${url}?${queryString}`;
    console.log('请求URL:', fullUrl);
    
    // 使用JSONP发起请求
    fetchJSONP(fullUrl, successCallback, errorCallback);
}

// 获取城市的adcode
function getCityAdcode(cityName, callback) {
    if (!cityName) {
        console.error('城市名称不能为空');
        callback(DEFAULT_ADCODE); // 返回默认adcode
        return;
    }
    
    const url = 'https://restapi.amap.com/v3/geocode/geo';
    const params = {
        address: cityName,
        city: cityName
    };
    
    getRequest(url, params, 
        // 成功回调
        function(data) {
            console.log('地理编码结果:', data);
            if (data && data.status === '1' && data.geocodes && data.geocodes.length > 0) {
                const adcode = data.geocodes[0].adcode;
                console.log(`成功获取${cityName}的adcode: ${adcode}`);
                callback(adcode);
            } else {
                console.error('无法获取adcode，使用默认值');
                callback(DEFAULT_ADCODE);
            }
        },
        // 错误回调
        function(error) {
            console.error('获取adcode失败:', error);
            callback(DEFAULT_ADCODE);
        }
    );
}

// 使用adcode获取天气数据
function getWeatherByAdcode(adcode, callback) {
    const url = 'https://restapi.amap.com/v3/weather/weatherInfo';
    const params = {
        city: adcode,
        extensions: 'base'
    };
    
    getRequest(url, params,
        // 成功回调
        function(data) {
            console.log('天气数据:', data);
            if (data && data.status === '1' && data.lives && data.lives.length > 0) {
                callback(null, data);
            } else {
                callback(new Error(data.info || '获取天气数据失败'));
            }
        },
        // 错误回调
        function(error) {
            callback(error);
        }
    );
}

// 获取天气数据（主函数）
function fetchWeatherData() {
    // 显示加载状态
    showWeatherLoading(true);
    
    // 获取用户设置的城市，默认为北京
    let city = DEFAULT_CITY;
    const cityInput = document.getElementById('city');
    if (cityInput && cityInput.value) {
        city = cityInput.value.trim();
        
        // 确保城市输入框始终可用
        cityInput.disabled = false;
    }
    
    try {
        // 步骤1：先获取城市adcode
        getCityAdcode(city, function(adcode) {
            console.log(`正在使用adcode ${adcode} 获取 ${city} 的天气`);
            
            // 步骤2：使用adcode获取天气
            getWeatherByAdcode(adcode, function(error, data) {
                if (error) {
                    console.error('获取天气数据失败:', error);
                    showWeatherError('无法获取天气数据，请检查城市名称或网络连接');
                    fallbackToMockData(city);
                    return;
                }
                
                console.log('成功获取高德天气数据:', data);
                const weatherData = convertAmapDataToStandardFormat(data);
                updateWeatherUI(weatherData);
                generateOutfitSuggestion(weatherData);
                showWeatherLoading(false);
            });
        });
    } catch (e) {
        console.error('fetchWeatherData发生异常:', e);
        showWeatherError('天气服务出现异常，请稍后重试');
        fallbackToMockData(city);
    }
}

// 将高德天气数据转换为标准格式
function convertAmapDataToStandardFormat(amapData) {
    const live = amapData.lives[0];
    
    // 天气代码映射表 - 高德天气转换为我们内部使用的代码
    const weatherCodeMap = {
        '晴': '0',
        '多云': '1',
        '阴': '3',
        '小雨': '7',
        '中雨': '8',
        '大雨': '9',
        '暴雨': '10',
        '雷阵雨': '5',
        '小雪': '11',
        '中雪': '12',
        '大雪': '13',
        '雾': '14',
        '霾': '15',
        '沙尘暴': '16'
    };
    
    const weatherCode = weatherCodeMap[live.weather] || '99'; // 99是未知天气
    
    return {
        location: {
            id: live.adcode,
            name: live.city,
            country: "CN",
            path: `中国,${live.province},${live.city}`,
            timezone: "Asia/Shanghai",
            timezone_offset: "+08:00"
        },
        now: {
            text: live.weather,
            code: weatherCode,
            temperature: live.temperature,
            humidity: live.humidity || '50', // 高德有时不提供湿度
            wind_direction: live.winddirection,
            wind_scale: live.windpower
        },
        last_update: live.reporttime
    };
}

// 使用模拟数据
function fallbackToMockData(cityName) {
    cityName = cityName || DEFAULT_CITY;
    console.log(`正在为${cityName}使用模拟数据...`);
    
    // 创建模拟数据
    const mockData = {
        location: {
            id: "mock_id",
            name: cityName,
            country: "CN",
            path: `中国,${cityName}`,
            timezone: "Asia/Shanghai",
            timezone_offset: "+08:00"
        },
        now: {
            text: "晴",
            code: "0",
            temperature: "22",
            humidity: "40",
            wind_direction: "西南",
            wind_scale: "3"
        },
        last_update: new Date().toISOString()
    };
    
    console.log('使用模拟数据:', mockData);
    
    // 更新UI
    updateWeatherUI(mockData);
    generateOutfitSuggestion(mockData);
    showWeatherLoading(false);
    
    // 显示提示
    showToast('使用了模拟天气数据，可能与实际情况不符', 'warning');
}

// JSONP请求辅助函数，增加错误处理
function fetchJSONP(url, successCallback, errorCallback) {
    // 创建唯一的回调函数名
    const callbackName = 'jsonp_callback_' + Math.round(100000 * Math.random());
    let script = null;
    
    // 设置超时处理
    const timeoutId = setTimeout(function() {
        // 清理：移除脚本标签和回调函数
        cleanup();
        errorCallback(new Error('JSONP请求超时'));
    }, 10000); // 10秒超时
    
    // 清理函数，确保无内存泄漏
    function cleanup() {
        if (script && script.parentNode) {
            script.parentNode.removeChild(script);
        }
        window[callbackName] = null;
        delete window[callbackName];
    }
    
    // 定义全局回调函数
    window[callbackName] = function(data) {
        try {
            clearTimeout(timeoutId);
            successCallback(data);
        } catch (e) {
            errorCallback(e);
        } finally {
            // 清理：移除脚本标签和回调函数
            cleanup();
        }
    };
    
    try {
        // 添加回调参数到URL
        script = document.createElement('script');
        script.src = url + (url.indexOf('?') >= 0 ? '&' : '?') + 'callback=' + callbackName;
        script.onerror = function(e) {
            clearTimeout(timeoutId);
            cleanup();
            errorCallback(new Error('JSONP请求失败: ' + e.message));
        };
        document.body.appendChild(script);
    } catch (e) {
        clearTimeout(timeoutId);
        cleanup();
        errorCallback(e);
    }
}

// 更新天气UI显示
function updateWeatherUI(weatherData) {
    const location = weatherData.location;
    const now = weatherData.now;
    
    // 更新天气图标
    const weatherIcon = document.getElementById('weather-icon');
    if (weatherIcon) {
        weatherIcon.innerHTML = getWeatherIcon(now.code);
        weatherIcon.classList.remove('hidden');
    }
    
    // 更新温度
    const tempElement = document.getElementById('weather-temp');
    if (tempElement) {
        tempElement.textContent = `${now.temperature}°C`;
        tempElement.classList.remove('hidden');
    }
    
    // 更新天气描述
    const descElement = document.getElementById('weather-desc');
    if (descElement) {
        descElement.textContent = `${location.name} · ${now.text}`;
        descElement.classList.remove('hidden');
    }
    
    // 更新湿度（心知天气基础版API中可能没有，根据实际情况调整）
    const humidityElement = document.getElementById('weather-humidity');
    if (humidityElement) {
        humidityElement.textContent = now.humidity ? `${now.humidity}%` : '暂无数据';
    }
    
    // 更新风速
    const windElement = document.getElementById('weather-wind');
    if (windElement) {
        windElement.textContent = `${now.wind_direction}${now.wind_scale}级`;
    }
    
    // 显示详细信息
    const detailsElement = document.getElementById('weather-details');
    if (detailsElement) {
        detailsElement.classList.remove('hidden');
    }
}

// 根据天气代码获取对应的图标
function getWeatherIcon(code) {
    // 天气代码对应的图标，使用Font Awesome图标
    const iconMap = {
        '0': '<i class="fas fa-sun text-yellow-500"></i>', // 晴天
        '1': '<i class="fas fa-cloud-sun text-yellow-400"></i>', // 多云
        '2': '<i class="fas fa-cloud-sun text-yellow-300"></i>', // 少云
        '3': '<i class="fas fa-cloud text-gray-400"></i>', // 阴
        '4': '<i class="fas fa-cloud-sun-rain text-blue-400"></i>', // 阵雨
        '5': '<i class="fas fa-cloud-showers-heavy text-blue-500"></i>', // 雷阵雨
        '6': '<i class="fas fa-cloud-rain text-blue-500"></i>', // 雨夹雪
        '7': '<i class="fas fa-cloud-rain text-blue-600"></i>', // 小雨
        '8': '<i class="fas fa-cloud-showers-heavy text-blue-700"></i>', // 中雨
        '9': '<i class="fas fa-cloud-showers-heavy text-blue-800"></i>', // 大雨
        '10': '<i class="fas fa-cloud-showers-heavy text-blue-900"></i>', // 暴雨
        '11': '<i class="fas fa-snowflake text-blue-100"></i>', // 小雪
        '12': '<i class="fas fa-snowflake text-blue-200"></i>', // 中雪
        '13': '<i class="fas fa-snowflake text-blue-300"></i>', // 大雪
        '14': '<i class="fas fa-smog text-gray-500"></i>', // 雾
        '15': '<i class="fas fa-smog text-gray-600"></i>', // 雾霾
        '16': '<i class="fas fa-wind text-gray-400"></i>', // 大风
        '17': '<i class="fas fa-wind text-gray-500"></i>', // 飓风
        '18': '<i class="fas fa-temperature-high text-red-500"></i>', // 热
        '19': '<i class="fas fa-temperature-low text-blue-500"></i>', // 冷
        '20': '<i class="fas fa-wind text-gray-400"></i>', // 大风
        '99': '<i class="fas fa-question-circle text-gray-500"></i>' // 未知
    };
    
    return iconMap[code] || '<i class="fas fa-cloud text-gray-400"></i>';
}

// 显示/隐藏天气加载状态
function showWeatherLoading(isLoading) {
    const loadingElement = document.getElementById('loading-weather');
    const weatherIcon = document.getElementById('weather-icon');
    const tempElement = document.getElementById('weather-temp');
    const descElement = document.getElementById('weather-desc');
    const detailsElement = document.getElementById('weather-details');
    
    if (loadingElement) {
        loadingElement.classList.toggle('hidden', !isLoading);
    }
    
    if (isLoading) {
        if (weatherIcon) weatherIcon.classList.add('hidden');
        if (tempElement) tempElement.classList.add('hidden');
        if (descElement) descElement.classList.add('hidden');
        if (detailsElement) detailsElement.classList.add('hidden');
    }
}

// 显示天气错误信息
function showWeatherError(message = '获取天气数据失败，请检查网络连接后重试') {
    showWeatherLoading(false);
    
    const weatherIcon = document.getElementById('weather-icon');
    if (weatherIcon) {
        weatherIcon.innerHTML = '<i class="fas fa-exclamation-circle text-red-500"></i>';
        weatherIcon.classList.remove('hidden');
    }
    
    const tempElement = document.getElementById('weather-temp');
    if (tempElement) {
        tempElement.textContent = '--°C';
        tempElement.classList.remove('hidden');
    }
    
    const descElement = document.getElementById('weather-desc');
    if (descElement) {
        // 获取当前城市
        const cityInput = document.getElementById('city');
        const cityName = cityInput && cityInput.value ? cityInput.value.trim() : DEFAULT_CITY;
        
        descElement.textContent = `${cityName} · ${message}`;
        descElement.classList.remove('hidden');
    }
    
    // 确保城市输入框可用
    const cityInput = document.getElementById('city');
    if (cityInput) {
        cityInput.disabled = false;
        // 如果输入框为空，则填入默认城市
        if (!cityInput.value.trim()) {
            cityInput.value = DEFAULT_CITY;
        }
    }
    
    // 隐藏穿搭建议的加载状态，显示错误信息
    const outfitLoading = document.getElementById('outfit-loading');
    const outfitContent = document.getElementById('outfit-content');
    if (outfitLoading) {
        outfitLoading.textContent = '无法获取天气数据，但您的偏好设置已保存。您可以点击刷新按钮重试或手动修改城市。';
        outfitLoading.classList.remove('hidden');
    }
    if (outfitContent) {
        outfitContent.classList.add('hidden');
    }
    
    // 显示基本信息结构
    const detailsElement = document.getElementById('weather-details');
    if (detailsElement) {
        detailsElement.classList.remove('hidden');
    }
    
    // 使用模拟湿度和风速数据来保持UI的完整性
    const humidityElement = document.getElementById('weather-humidity');
    if (humidityElement) {
        humidityElement.textContent = '暂无数据';
    }
    
    const windElement = document.getElementById('weather-wind');
    if (windElement) {
        windElement.textContent = '暂无数据';
    }
    
    // 控制台输出错误详情，方便调试
    console.error('天气数据获取失败:', message);
    
    // 显示提示消息
    showToast(message, 'warning');
}

// 根据天气数据生成穿搭建议
function generateOutfitSuggestion(weatherData) {
    const now = weatherData.now;
    const temperature = parseInt(now.temperature);
    const weatherText = now.text;
    
    // 显示加载状态
    const outfitLoading = document.getElementById('outfit-loading');
    const outfitContent = document.getElementById('outfit-content');
    
    if (outfitLoading) outfitLoading.classList.add('hidden');
    if (outfitContent) outfitContent.classList.remove('hidden');
    
    // 获取用户的温度敏感度设置
    let temperatureSensitivity = 'normal';
    const sensitivityRadio = document.querySelector('input[name="temperature-sensitivity"]:checked');
    if (sensitivityRadio) {
        temperatureSensitivity = sensitivityRadio.value;
    }
    
    // 获取用户的风格偏好
    let stylePreference = 'casual';
    const styleSelect = document.getElementById('style-preference');
    if (styleSelect) {
        stylePreference = styleSelect.value;
    }
    
    // 温度范围建议
    let temperatureAdvice = getTemperatureAdvice(temperature, temperatureSensitivity);
    
    // 降水建议
    let precipitationAdvice = getPrecipitationAdvice(weatherText);
    
    // 根据温度和天气生成穿搭建议
    let outfitRecommendation = getOutfitRecommendation(temperature, weatherText, temperatureSensitivity, stylePreference);
    
    // 更新UI
    const tempAdviceElement = document.getElementById('temperature-advice');
    if (tempAdviceElement) {
        tempAdviceElement.textContent = temperatureAdvice;
    }
    
    const precipAdviceElement = document.getElementById('precipitation-advice');
    if (precipAdviceElement) {
        precipAdviceElement.textContent = precipitationAdvice;
    }
    
    const outfitElement = document.getElementById('outfit-recommendation');
    if (outfitElement) {
        outfitElement.textContent = outfitRecommendation;
    }
}

// 根据温度范围和敏感度返回温度建议
function getTemperatureAdvice(temperature, sensitivity) {
    let advice = '';
    
    // 根据温度敏感度调整温度感知
    let adjustedTemp = temperature;
    if (sensitivity === 'cold') {
        adjustedTemp -= 2; // 怕冷的人感觉温度更低
    } else if (sensitivity === 'hot') {
        adjustedTemp += 2; // 怕热的人感觉温度更高
    }
    
    if (adjustedTemp <= 0) {
        advice = '极冷，注意保暖';
    } else if (adjustedTemp <= 5) {
        advice = '很冷，需要厚重保暖';
    } else if (adjustedTemp <= 10) {
        advice = '冷，需要保暖';
    } else if (adjustedTemp <= 15) {
        advice = '凉爽，适合加件外套';
    } else if (adjustedTemp <= 20) {
        advice = '舒适，适合轻薄外套';
    } else if (adjustedTemp <= 25) {
        advice = '温暖，适合单层衣物';
    } else if (adjustedTemp <= 30) {
        advice = '热，建议穿轻薄透气衣物';
    } else {
        advice = '炎热，建议穿最少最透气的衣物';
    }
    
    return advice;
}

// 根据天气状况返回降水建议
function getPrecipitationAdvice(weatherText) {
    if (weatherText.includes('雨') || weatherText.includes('雪') || weatherText.includes('阵雨')) {
        return '有降水，建议携带雨具/雪具';
    } else if (weatherText.includes('阴') || weatherText.includes('多云')) {
        return '可能有降水，建议备雨具';
    } else {
        return '无降水，晴好天气';
    }
}

// 根据温度、天气和偏好生成具体穿搭建议
function getOutfitRecommendation(temperature, weatherText, sensitivity, stylePreference) {
    // 根据温度敏感度调整温度感知
    let adjustedTemp = temperature;
    if (sensitivity === 'cold') {
        adjustedTemp -= 2; // 怕冷的人感觉温度更低
    } else if (sensitivity === 'hot') {
        adjustedTemp += 2; // 怕热的人感觉温度更高
    }
    
    let baseRecommendation = '';
    
    // 根据温度范围给出基础穿搭建议
    if (adjustedTemp <= 0) {
        baseRecommendation = '厚羽绒服、保暖内衣、毛衣、厚裤子、围巾、帽子和手套';
    } else if (adjustedTemp <= 5) {
        baseRecommendation = '厚外套或羽绒服、毛衣、厚裤子、围巾';
    } else if (adjustedTemp <= 10) {
        baseRecommendation = '夹克或大衣、毛衣或长袖衫、牛仔裤或休闲裤';
    } else if (adjustedTemp <= 15) {
        baseRecommendation = '轻薄外套、长袖衫或薄毛衣、牛仔裤或休闲裤';
    } else if (adjustedTemp <= 20) {
        baseRecommendation = '薄外套或开衫、长袖衬衫或T恤、休闲裤';
    } else if (adjustedTemp <= 25) {
        baseRecommendation = '长袖T恤或衬衫、休闲裤或牛仔裤';
    } else if (adjustedTemp <= 30) {
        baseRecommendation = '短袖T恤、短裤或轻薄长裤';
    } else {
        baseRecommendation = '轻薄透气的短袖T恤、短裤、凉鞋';
    }
    
    // 根据风格偏好调整建议
    let styleAdjustment = '';
    switch (stylePreference) {
        case 'formal':
            styleAdjustment = '选择正式款式，如衬衫、西装裤或正装裙，保持整洁的商务形象。';
            break;
        case 'sporty':
            styleAdjustment = '选择运动风格，如运动T恤、运动裤、运动鞋，活力十足。';
            break;
        case 'minimalist':
            styleAdjustment = '选择简约风格，如基础款T恤、纯色裤装，干净利落。';
            break;
        default: // casual
            styleAdjustment = '选择休闲风格，如舒适的T恤、牛仔裤，轻松随意。';
    }
    
    // 根据天气状况添加特殊建议
    let weatherAdjustment = '';
    if (weatherText.includes('雨')) {
        weatherAdjustment = '建议携带雨伞，穿防水鞋或靴子，选择防水外套。';
    } else if (weatherText.includes('雪')) {
        weatherAdjustment = '建议穿防滑防水的雪地靴，选择防水外套。';
    } else if (weatherText.includes('风') || weatherText.includes('大风')) {
        weatherAdjustment = '建议选择防风外套，避免穿裙装或宽松衣物。';
    } else if (weatherText.includes('雾') || weatherText.includes('霾')) {
        weatherAdjustment = '建议戴口罩，穿深色衣物减少污染物附着。';
    }
    
    return `今日推荐：${baseRecommendation}。${styleAdjustment} ${weatherAdjustment}`;
}

// 显示提示消息
function showToast(message, type = 'info') {
    // 创建提示元素
    const toast = document.createElement('div');
    toast.className = `fixed bottom-4 right-4 px-6 py-3 rounded-lg text-white text-sm font-medium shadow-lg transform transition-all duration-300 opacity-0 translate-y-4 z-50 ${type === 'error' ? 'bg-red-500' : type === 'success' ? 'bg-green-500' : 'bg-blue-500'}`;
    toast.textContent = message;
    
    // 添加到页面
    document.body.appendChild(toast);
    
    // 触发动画
    setTimeout(() => {
        toast.classList.remove('opacity-0', 'translate-y-4');
    }, 10);
    
    // 设置自动消失
    setTimeout(() => {
        toast.classList.add('opacity-0', 'translate-y-4');
        setTimeout(() => {
            document.body.removeChild(toast);
        }, 300);
    }, 3000);
}

// 初始化应用
function init() {
    console.log("初始化应用...");
    
    // 初始化侧边栏
    initSidebar();
    
    // 初始化黑洞眼睛
    initBlackholeEyes();
    
    // 初始化聊天功能
    initChat();
    
    // 初始化柜me功能
    initCuime();
    
    // 添加聊天清空功能
    const clearChatBtn = document.getElementById('clear-chat');
    if (clearChatBtn) {
        clearChatBtn.addEventListener('click', function() {
            // 清空聊天界面，只保留初始欢迎消息
            const chatMessages = document.getElementById('chat-messages');
            if (chatMessages) {
                chatMessages.innerHTML = `
                    <div class="max-w-[80%] flex flex-col self-start">
                        <div class="p-4 rounded-3xl bg-blue-500 text-white relative break-words">
                            你好！*beep* 我是瓦力AI，很高兴为你服务。*whirr* 有什么我能帮到你的吗？
                        </div>
                    </div>
                `;
            }
            
            // 清空本地存储的聊天历史
            localStorage.removeItem('walleAIChatHistory');
            
            // 显示通知
            showToast('聊天记录已清空', 'success');
        });
    }
    
    // 添加聊天保存功能
    const saveChatBtn = document.getElementById('save-chat');
    if (saveChatBtn) {
        saveChatBtn.addEventListener('click', function() {
            try {
                // 获取所有聊天记录
                const chatHistory = JSON.parse(localStorage.getItem('walleAIChatHistory') || '[]');
                
                if (chatHistory.length === 0) {
                    showToast('没有可保存的聊天记录', 'warning');
                    return;
                }
                
                // 生成文本内容
                let textContent = "瓦力AI对话记录\n";
                textContent += "保存时间: " + new Date().toLocaleString() + "\n\n";
                
                chatHistory.forEach((item, index) => {
                    textContent += `用户: ${item.user}\n`;
                    textContent += `瓦力AI: ${item.bot}\n\n`;
                });
                
                // 创建下载链接
                const blob = new Blob([textContent], { type: 'text/plain' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                const date = new Date();
                const dateStr = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
                a.href = url;
                a.download = `瓦力AI对话记录_${dateStr}.txt`;
                document.body.appendChild(a);
                a.click();
                
                // 清理临时对象
                URL.revokeObjectURL(url);
                document.body.removeChild(a);
                
                // 显示通知
                showToast('聊天记录已保存', 'success');
            } catch (error) {
                console.error('保存聊天记录失败:', error);
                showToast('保存聊天记录失败', 'error');
            }
        });
    }
    
    // 导航事件监听
    document.addEventListener('navigated', function(e) {
        console.log('导航到:', e.detail.target);
    });
}

// 页面初始化
document.addEventListener('DOMContentLoaded', function() {
    // 初始化侧边栏
    initSidebar();
    
    // 初始化黑洞眼睛
    initBlackholeEyes();
    
    // 初始化聊天功能
    initChat();
    
    // 初始化柜me功能
    initCuime();
}); 