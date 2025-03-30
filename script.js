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
    
    // 默认显示首页
    document.getElementById('home').classList.remove('hidden');
    
    // 汉堡菜单切换
    if (menuToggle) {
        menuToggle.addEventListener('click', function() {
            sidebar.classList.toggle('-translate-x-full');
        });
    }
    
    // 导航链接点击处理
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // 移除所有链接的active类
            navLinks.forEach(l => l.classList.remove('active', 'bg-blue-50'));
            
            // 为当前点击的链接添加active类
            this.classList.add('active', 'bg-blue-50');
            
            // 获取目标部分ID
            const targetId = this.getAttribute('href').substring(1);
            navigateTo(targetId);
            
            // 在移动设备上，点击后关闭侧边栏
            if (window.innerWidth < 768) {
                sidebar.classList.add('-translate-x-full');
            }
        });
    });
}

// 导航到指定部分
function navigateTo(targetId) {
    // 隐藏所有部分
    const sections = document.querySelectorAll('main section');
    sections.forEach(section => section.classList.add('hidden'));
    
    // 显示目标部分
    if (targetId === 'home') {
        document.getElementById('home').classList.remove('hidden');
    } else if (targetId === 'chat') {
        document.getElementById('chat-section').classList.remove('hidden');
    } else if (targetId === 'cuime') {
        document.getElementById('cuime-section').classList.remove('hidden');
    } else if (targetId === 'time') {
        document.getElementById('time-section').classList.remove('hidden');
    } else if (targetId === 'photo') {
        document.getElementById('photo-section').classList.remove('hidden');
    } else if (targetId === 'about') {
        document.getElementById('about-section').classList.remove('hidden');
    }
}

// 黑洞眼睛初始化和交互
function initBlackholeEyes() {
    const pupils = document.querySelectorAll('.pupil, .pupil-small');
    let lastMoveTime = Date.now();
    
    // 设置初始位置为居中（正视）
    pupils.forEach(pupil => {
        pupil.style.transform = 'translate(0px, 0px)';
    });
    
    // 鼠标移动时眼睛跟随
    document.addEventListener('mousemove', function(e) {
        lastMoveTime = Date.now();
        
        // 主黑洞
        const blackholeContainers = document.querySelectorAll('.blackhole-container');
        if (blackholeContainers.length > 0) {
            const blackholeRect = blackholeContainers[0].getBoundingClientRect();
            const blackholeCenterX = blackholeRect.left + blackholeRect.width / 2;
            const blackholeCenterY = blackholeRect.top + blackholeRect.height / 2;
            
            const angleX = (e.clientX - blackholeCenterX) / window.innerWidth * 10;
            const angleY = (e.clientY - blackholeCenterY) / window.innerHeight * 10;
            
            document.querySelectorAll('.blackhole-container .pupil').forEach(pupil => {
                pupil.style.transform = `translate(${angleX}px, ${angleY}px)`;
            });
        }
        
        // 关于页面小黑洞
        const smallBlackholeContainers = document.querySelectorAll('.blackhole-container-small');
        if (smallBlackholeContainers.length > 0) {
            const smallBlackholeRect = smallBlackholeContainers[0].getBoundingClientRect();
            const smallBlackholeCenterX = smallBlackholeRect.left + smallBlackholeRect.width / 2;
            const smallBlackholeCenterY = smallBlackholeRect.top + smallBlackholeRect.height / 2;
            
            const smallAngleX = (e.clientX - smallBlackholeCenterX) / window.innerWidth * 6;
            const smallAngleY = (e.clientY - smallBlackholeCenterY) / window.innerHeight * 6;
            
            document.querySelectorAll('.blackhole-container-small .pupil-small').forEach(pupil => {
                pupil.style.transform = `translate(${smallAngleX}px, ${smallAngleY}px)`;
            });
        }
    });
    
    // 每3秒检查一次，如果超过3秒没有鼠标移动，则恢复居中位置
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
    const closeChat = document.getElementById('close-chat');
    const userInput = document.getElementById('user-input');
    const sendMessage = document.getElementById('send-message');
    
    // 内嵌聊天界面
    const chatSection = document.getElementById('chat-section');
    const chatInput = document.getElementById('chat-input');
    const sendButton = document.getElementById('send-button');
    const chatHistory = document.getElementById('chat-history');
    
    // 弹出式聊天初始化
    if (startChatBtn && chatInterface) {
        startChatBtn.addEventListener('click', function() {
            chatInterface.classList.remove('hidden');
        });
    }
    
    if (closeChat) {
        closeChat.addEventListener('click', function() {
            chatInterface.classList.add('hidden');
        });
    }
    
    // 弹出式聊天消息发送
    if (sendMessage) {
        sendMessage.addEventListener('click', function() {
            sendChatMessage(userInput, 'chat-messages');
        });
    }
    
    if (userInput) {
        userInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                sendChatMessage(userInput, 'chat-messages');
            }
        });
    }
    
    // 内嵌聊天消息发送
    if (sendButton) {
        sendButton.addEventListener('click', function() {
            sendChatMessage(chatInput, 'chat-history');
        });
    }
    
    if (chatInput) {
        chatInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                sendChatMessage(chatInput, 'chat-history');
            }
        });
    }
}

// 发送聊天消息
function sendChatMessage(inputElement, targetContainerId) {
    const message = inputElement.value.trim();
    if (message) {
        const targetContainer = document.getElementById(targetContainerId);
        
        // 添加用户消息
        const userDiv = document.createElement('div');
        userDiv.className = targetContainerId === 'chat-messages' 
            ? 'max-w-[80%] self-end p-3 bg-gray-800 text-white rounded-xl rounded-br-none' 
            : 'max-w-[80%] flex flex-col self-end';
            
        if (targetContainerId === 'chat-history') {
            const userMessage = document.createElement('div');
            userMessage.className = 'p-4 rounded-3xl bg-gray-800 text-white relative break-words';
            userMessage.textContent = message;
            userDiv.appendChild(userMessage);
        } else {
            userDiv.textContent = message;
        }
        
        userDiv.style.animation = 'messageAppear 0.3s ease-out';
        targetContainer.appendChild(userDiv);
        
        // 清空输入框
        inputElement.value = '';
        
        // 滚动到底部
        targetContainer.scrollTop = targetContainer.scrollHeight;
        
        // 模拟AI回复
        setTimeout(() => {
            const botResponse = getBotResponse(message);
            
            // 添加机器人消息
            const botDiv = document.createElement('div');
            botDiv.className = targetContainerId === 'chat-messages'
                ? 'max-w-[80%] self-start p-3 bg-blue-500 text-white rounded-xl rounded-bl-none'
                : 'max-w-[80%] flex flex-col self-start';
                
            if (targetContainerId === 'chat-history') {
                const botMessage = document.createElement('div');
                botMessage.className = 'p-4 rounded-3xl bg-blue-500 text-white relative break-words';
                botMessage.textContent = botResponse;
                botDiv.appendChild(botMessage);
            } else {
                botDiv.textContent = botResponse;
            }
            
            botDiv.style.animation = 'messageAppear 0.3s ease-out';
            targetContainer.appendChild(botDiv);
            
            // 滚动到底部
            targetContainer.scrollTop = targetContainer.scrollHeight;
        }, 1000);
    }
}

// 生成AI回复
function getBotResponse(message) {
    const responses = [
        "我理解你的问题，让我来帮你解决。",
        "这是个很好的问题！根据我的分析...",
        "我可以为你提供相关信息。",
        "让我思考一下这个问题...",
        "根据我的数据库，我可以告诉你...",
        "很高兴能帮到你，这是我的建议...",
        "这个问题很有趣，我的回答是..."
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
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
}, 5000); 