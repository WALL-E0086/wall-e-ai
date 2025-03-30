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
function showThinking() {
    const thinkingResponse = wallEResponses.thinking[Math.floor(Math.random() * wallEResponses.thinking.length)];
    const thinkingMessage = addMessage(thinkingResponse, 'bot');
    return thinkingMessage;
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

// 页面初始化
document.addEventListener('DOMContentLoaded', function() {
    // 初始化侧边栏
    initSidebar();
    
    // 初始化黑洞眼睛
    initBlackholeEyes();
    
    // 初始化聊天功能
    initChat();
});

// 侧边栏初始化和导航
function initSidebar() {
    const menuToggle = document.getElementById('menu-toggle');
    const sidebar = document.getElementById('sidebar');
    const navLinks = document.querySelectorAll('#sidebar a');
    
    // 汉堡菜单切换
    if (menuToggle) {
        menuToggle.addEventListener('click', function() {
            sidebar.classList.toggle('-translate-x-full');
        });
    }
    
    // 初始状态：显示首页
    document.getElementById('home').classList.remove('hidden');
    
    // 导航链接点击事件
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // 移除所有链接的active类
            navLinks.forEach(l => l.classList.remove('active', 'bg-gray-100'));
            
            // 为当前点击的链接添加active类
            this.classList.add('active', 'bg-gray-100');
            
            // 导航到目标页面
            const target = this.getAttribute('href').substring(1);
            navigateTo(target);
            
            // 在移动设备上，点击后关闭侧边栏
            if (window.innerWidth < 768) {
                sidebar.classList.add('-translate-x-full');
            }
        });
    });
}

// 导航到指定页面
function navigateTo(target) {
    // 隐藏所有页面
    const sections = document.querySelectorAll('main section');
    sections.forEach(section => section.classList.add('hidden'));
    
    // 显示目标页面
    switch(target) {
        case 'home':
            document.getElementById('home').classList.remove('hidden');
            break;
        case 'chat':
            document.getElementById('chat-section').classList.remove('hidden');
            break;
        case 'cuime':
            document.getElementById('cuime-section').classList.remove('hidden');
            break;
        case 'time':
            document.getElementById('time-section').classList.remove('hidden');
            break;
        case 'photo':
            document.getElementById('photo-section').classList.remove('hidden');
            break;
        case 'about':
            document.getElementById('about-section').classList.remove('hidden');
            break;
        default:
            document.getElementById('home').classList.remove('hidden');
    }
}

// 黑洞眼睛初始化和交互
function initBlackholeEyes() {
    const pupils = document.querySelectorAll('.pupil');
    let lastMoveTime = Date.now();
    
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
        
        // 计算鼠标相对于黑洞中心的位置
        const deltaX = (e.clientX - centerX) / 20;
        const deltaY = (e.clientY - centerY) / 20;
        
        // 限制眼球移动范围
        const maxMove = 5;
        const moveX = Math.max(-maxMove, Math.min(maxMove, deltaX));
        const moveY = Math.max(-maxMove, Math.min(maxMove, deltaY));
        
        // 应用到所有瞳孔
        pupils.forEach(pupil => {
            pupil.style.transform = `translate(${moveX}px, ${moveY}px)`;
        });
    });
    
    // 每3秒检查，如果超过3秒没有鼠标移动，眼睛回正
    setInterval(() => {
        if (Date.now() - lastMoveTime > 3000) {
            pupils.forEach(pupil => {
                pupil.style.transform = 'translate(0px, 0px)';
            });
        }
    }, 3000);
}

// 聊天功能初始化和交互
function initChat() {
    // 弹出式聊天界面
    const startChatBtn = document.getElementById('start-chat');
    const chatInterface = document.getElementById('chat-interface');
    const closeChatBtn = document.getElementById('close-chat');
    const userInput = document.getElementById('user-input');
    const sendMessageBtn = document.getElementById('send-message');
    
    // 内嵌式聊天界面
    const chatInput = document.getElementById('chat-input');
    const sendButton = document.getElementById('send-button');
    
    // 弹出式聊天按钮点击事件
    if (startChatBtn) {
        startChatBtn.addEventListener('click', function() {
            // 如果在首页点击聊天按钮，优先切换到聊天页面，而不是弹出聊天界面
            const chatLink = document.getElementById('chat-link');
            if (chatLink) {
                chatLink.click();
            }
        });
    }
    
    // 关闭聊天界面
    if (closeChatBtn) {
        closeChatBtn.addEventListener('click', function() {
            chatInterface.classList.add('hidden');
        });
    }
    
    // 弹出式聊天界面发送消息
    if (sendMessageBtn && userInput) {
        sendMessageBtn.addEventListener('click', function() {
            const message = userInput.value.trim();
            if (message) {
                sendChatMessage(message, 'chat-messages');
                userInput.value = '';
            }
        });
        
        userInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                const message = userInput.value.trim();
                if (message) {
                    sendChatMessage(message, 'chat-messages');
                    userInput.value = '';
                }
            }
        });
    }
    
    // 内嵌式聊天界面发送消息
    if (sendButton && chatInput) {
        sendButton.addEventListener('click', function() {
            const message = chatInput.value.trim();
            if (message) {
                sendChatMessage(message, 'chat-history');
                chatInput.value = '';
            }
        });
        
        chatInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                const message = chatInput.value.trim();
                if (message) {
                    sendChatMessage(message, 'chat-history');
                    chatInput.value = '';
                }
            }
        });
    }
}

// 发送聊天消息
function sendChatMessage(message, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    // 创建用户消息元素
    const userMessageDiv = document.createElement('div');
    userMessageDiv.className = 'max-w-[80%] flex flex-col self-end';
    
    const userMessageContent = document.createElement('div');
    userMessageContent.className = 'p-4 rounded-3xl bg-gray-800 text-white relative break-words';
    userMessageContent.style.animation = 'messageAppear 0.3s ease-out';
    userMessageContent.textContent = message;
    
    userMessageDiv.appendChild(userMessageContent);
    container.appendChild(userMessageDiv);
    
    // 滚动到底部
    container.scrollTop = container.scrollHeight;
    
    // 模拟机器人思考时间
    setTimeout(() => {
        // 创建机器人消息元素
        const botMessageDiv = document.createElement('div');
        botMessageDiv.className = 'max-w-[80%] flex flex-col self-start';
        
        const botMessageContent = document.createElement('div');
        botMessageContent.className = 'p-4 rounded-3xl bg-blue-500 text-white relative break-words';
        botMessageContent.style.animation = 'messageAppear 0.3s ease-out';
        
        // 生成随机回复
        const botResponses = [
            "*beep* 我正在分析您的问题... *whirr* 根据我的数据，我认为...",
            "这是个很好的问题！*click* 让我来帮您解答...",
            "*whirr* 正在处理... 我发现了一些相关信息：",
            "有趣的提问！*beep* 从我的角度来看...",
            "*click-click* 解析完成。我的回答是...",
            "*beep* 我的数据库中有相关记录。*whirr* 以下是我的分析...",
            "让我思考一下... *processing* 我认为最佳答案是..."
        ];
        
        const randomResponse = botResponses[Math.floor(Math.random() * botResponses.length)];
        botMessageContent.textContent = randomResponse;
        
        botMessageDiv.appendChild(botMessageContent);
        container.appendChild(botMessageDiv);
        
        // 滚动到底部
        container.scrollTop = container.scrollHeight;
    }, 1000);
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