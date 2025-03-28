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
    default: [
        "嗯...*whirr* 让我想想...*beep*",
        "这个问题很有趣！*click* 让我来回答你！*beep*",
        "*whirr* 我明白了！*beep* 让我告诉你..."
    ]
};

// 电子音符号
const electronicSounds = ['*beep*', '*whirr*', '*click*', '*buzz*', '*ding*'];

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
    
    // 默认回复
    const defaultResponse = wallEResponses.default[Math.floor(Math.random() * wallEResponses.default.length)];
    return addElectronicSound(defaultResponse);
}

// 添加消息到聊天界面
function addMessage(content, type) {
    const messages = document.getElementById('chat-messages');
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
    // 获取所有导航链接和部分
    const navLinks = document.querySelectorAll('#sidebar a');
    const sections = document.querySelectorAll('main > section');
    
    // 移除所有活动状态
    navLinks.forEach(l => l.classList.remove('active'));
    sections.forEach(s => s.classList.add('hidden'));
    
    // 添加当前活动状态
    element.classList.add('active');
    const targetId = element.getAttribute('href').substring(1);
    const targetSection = document.getElementById(targetId);
    
    if (targetSection) {
        targetSection.classList.remove('hidden');
        // 确保滚动到顶部
        targetSection.scrollTop = 0;
    }
    
    // 在移动设备上关闭侧边栏
    if (window.innerWidth < 768) {
        document.getElementById('sidebar').classList.remove('translate-x-0');
        document.getElementById('sidebar').classList.add('-translate-x-full');
    }
}

// 页面切换功能
document.addEventListener('DOMContentLoaded', function() {
    // 获取所有导航链接
    const navLinks = document.querySelectorAll('#sidebar a');
    const startChatButton = document.getElementById('start-chat');
    const menuToggle = document.getElementById('menu-toggle');
    const sidebar = document.getElementById('sidebar');

    // 处理导航点击
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            handleNavigation(this);
            window.location.hash = this.getAttribute('href');
        });
    });

    // 处理开始对话按钮点击
    if (startChatButton) {
        startChatButton.addEventListener('click', function(e) {
            e.preventDefault();
            // 直接切换到对话页面
            const chatLink = document.querySelector('a[href="#chat"]');
            
            if (chatLink) {
                handleNavigation(chatLink);
                window.location.hash = '#chat';
            }
        });
    }
    
    // 侧边栏切换
    if (menuToggle && sidebar) {
        menuToggle.addEventListener('click', function() {
            sidebar.classList.toggle('-translate-x-full');
            sidebar.classList.toggle('translate-x-0');
        });
    }

    // 初始化页面状态
    // 如果是直接访问（没有hash）或刷新页面，显示首页
    if (!window.location.hash || window.location.hash === '#') {
        document.querySelectorAll('main > section').forEach(s => s.classList.add('hidden'));
        document.getElementById('home').classList.remove('hidden');
        document.querySelector('a[href="#home"]').classList.add('active');
    } else {
        // 如果有hash值，则显示对应页面
        const element = document.querySelector(`a[href="${window.location.hash}"]`);
        if (element) {
            handleNavigation(element);
        } else {
            document.querySelectorAll('main > section').forEach(s => s.classList.add('hidden'));
            document.getElementById('home').classList.remove('hidden');
            document.querySelector('a[href="#home"]').classList.add('active');
        }
    }

    // 添加眼睛移动功能
    document.addEventListener('mousemove', function(event) {
        const eyes = document.querySelectorAll('.pupil');
        eyes.forEach(eye => {
            const rect = eye.getBoundingClientRect();
            const eyeCenterX = rect.left + rect.width / 2;
            const eyeCenterY = rect.top + rect.height / 2;
            
            // 计算鼠标和眼睛中心的角度
            const angle = Math.atan2(event.clientY - eyeCenterY, event.clientX - eyeCenterX);
            
            // 限制眼球移动范围
            const distance = 3;
            const moveX = Math.cos(angle) * distance;
            const moveY = Math.sin(angle) * distance;
            
            // 应用移动
            eye.style.transform = `translate(calc(-50% + ${moveX}px), calc(-50% + ${moveY}px))`;
        });
    });
});

// 监听URL hash变化
window.addEventListener('hashchange', function() {
    const hash = window.location.hash || '#home';
    const element = document.querySelector(`a[href="${hash}"]`);
    if (element) {
        handleNavigation(element);
    }
});

// ChatGLM API配置
const API_KEY = 'eed9af215d47fc16afefcd223710e28e.XKe7PGy7dHEeaQaX';
const API_URL = 'https://open.bigmodel.cn/api/paas/v4/chat/completions';

// 发送消息到ChatGLM API
async function sendToChatGLM(message) {
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: "glm-4",
                messages: [
                    {
                        role: "user",
                        content: message
                    }
                ],
                temperature: 0.7,
                top_p: 0.9,
                stream: false
            })
        });

        if (!response.ok) {
            throw new Error('API请求失败');
        }

        const data = await response.json();
        return data.choices[0].message.content;
    } catch (error) {
        console.error('API调用错误:', error);
        return '抱歉，我现在遇到了一些问题，请稍后再试。';
    }
}

// 发送消息
async function sendMessage() {
    const input = document.getElementById('user-input');
    const message = input.value.trim();
    
    if (!message) return;

    // 添加用户消息
    addMessage(message, 'user');
    input.value = '';

    // 显示加载动画
    const loadingMessage = addMessage('正在思考...', 'wall-e');

    try {
        // 调用ChatGLM API
        const response = await sendToChatGLM(message);
        
        // 移除加载消息
        loadingMessage.remove();
        
        // 添加AI回复
        addMessage(response, 'wall-e');
    } catch (error) {
        // 移除加载消息
        loadingMessage.remove();
        // 显示错误消息
        addMessage('抱歉，我现在遇到了一些问题，请稍后再试。', 'wall-e');
    }
}

// 监听回车键
document.getElementById('user-input').addEventListener('keypress', function(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
});

// 监听发送按钮点击
document.getElementById('send-button').addEventListener('click', sendMessage); 