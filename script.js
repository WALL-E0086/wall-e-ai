// Wall-E风格的回复模板
const wallEResponses = {
    greeting: [
        "你好啊！*beep* 很高兴见到你！*whirr*",
        "哇！*click* 是新的朋友！*beep*",
        "你好！*whirr* 我是瓦力AI智能助手！*beep*"
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

// 页面切换功能
document.addEventListener('DOMContentLoaded', function() {
    // 获取所有导航链接
    const navLinks = document.querySelectorAll('#sidebar a');
    const startChatButton = document.getElementById('start-chat');
    const menuToggle = document.getElementById('menu-toggle');
    const sidebar = document.getElementById('sidebar');
    const saveChatButton = document.getElementById('save-chat');
    const clearChatButton = document.getElementById('clear-chat');

    // 保存聊天记录
    if (saveChatButton) {
        saveChatButton.addEventListener('click', saveChat);
    }

    // 清空聊天记录
    if (clearChatButton) {
        clearChatButton.addEventListener('click', clearChat);
    }

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

    // 文件上传功能
    const uploadButton = document.getElementById('upload-file');
    const fileInput = document.getElementById('file-input');
    
    if(uploadButton && fileInput) {
        uploadButton.addEventListener('click', function() {
            fileInput.click();
        });
        
        fileInput.addEventListener('change', handleFileUpload);
    }

    // 为用户输入添加键盘事件
    const userInput = document.getElementById('user-input');
    if (userInput) {
        userInput.addEventListener('keypress', function(event) {
            if (event.key === 'Enter') {
                event.preventDefault();
                sendMessage();
            }
        });
    }
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
        // 显示思考状态消息
        const thinkingMessage = showThinking();
        
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

        // 移除思考状态消息
        if (thinkingMessage && thinkingMessage.parentNode) {
            thinkingMessage.parentNode.removeChild(thinkingMessage);
        }

        if (!response.ok) {
            throw new Error('API请求失败');
        }

        const data = await response.json();
        return data.choices[0].message.content;
    } catch (error) {
        console.error('API调用错误:', error);
        return '抱歉，我现在遇到了一些问题，请稍后再试。*buzz* 错误代码：' + error.message;
    }
}

// 发送消息
async function sendMessage() {
    const input = document.getElementById('user-input');
    const message = input.value.trim();
    
    if (!message) return;

    // 添加用户消息
    addMessage(message, 'user');
    
    // 清空输入框
    input.value = '';

    try {
        // 发送到ChatGLM API
        const response = await sendToChatGLM(message);
        
        // 添加AI回复
        addMessage(response, 'bot');
    } catch (error) {
        console.error('消息发送错误:', error);
        // 添加错误消息
        addMessage('抱歉，我遇到了一些问题。*buzz* 请稍后再试。', 'bot');
    }
}

// 文件上传处理
async function handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    // 显示上传中的消息
    const uploadingMessage = addMessage(`正在处理文件: ${file.name} *whirr*`, 'bot');
    
    try {
        // 读取文件内容
        const content = await readFileContent(file);
        
        if (content) {
            // 清除上传中消息
            if (uploadingMessage && uploadingMessage.parentNode) {
                uploadingMessage.parentNode.removeChild(uploadingMessage);
            }
            
            // 显示文件内容预览
            addMessage(`文件 "${file.name}" 已上传成功! *beep* 现在您可以询问关于这个文件的问题。`, 'bot');
            
            // 存储文件内容供后续使用
            window.lastUploadedFileContent = content;
            window.lastUploadedFileName = file.name;
            
            // 如果文件内容太长，只显示摘要
            let contentPreview = content.length > 500 
                ? content.substring(0, 500) + '...(文件较长，仅显示部分内容)' 
                : content;
            
            // 添加文件内容预览消息
            addMessage(`文件内容预览:\n${contentPreview}`, 'bot');
        }
    } catch (error) {
        console.error('文件处理错误:', error);
        
        // 移除上传中消息
        if (uploadingMessage && uploadingMessage.parentNode) {
            uploadingMessage.parentNode.removeChild(uploadingMessage);
        }
        
        // 显示错误消息
        addMessage(`抱歉，处理文件时出错: ${error.message} *buzz*`, 'bot');
    }
    
    // 清除文件输入，允许上传相同文件
    event.target.value = '';
}

// 读取文件内容
function readFileContent(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onload = (event) => {
            resolve(event.target.result);
        };
        
        reader.onerror = (error) => {
            reject(error);
        };
        
        if (file.name.toLowerCase().endsWith('.txt')) {
            reader.readAsText(file);
        } else {
            // 对于其他类型的文件，可能需要特殊处理
            // 这里简化为读取文本内容
            reader.readAsText(file);
        }
    });
}

// 保存聊天记录
function saveChat() {
    const messages = document.getElementById('chat-messages');
    if (!messages) return;
    
    let chatContent = '';
    const messageElements = messages.querySelectorAll('.max-w-[80%]');
    
    messageElements.forEach(messageDiv => {
        const isUser = messageDiv.classList.contains('self-end');
        const content = messageDiv.querySelector('div').textContent;
        
        chatContent += `${isUser ? '用户' : '瓦力AI'}: ${content}\n\n`;
    });
    
    if (chatContent) {
        // 创建下载链接
        const blob = new Blob([chatContent], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        
        // 设置下载文件名，加入日期时间
        const now = new Date();
        const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
        const timeStr = `${String(now.getHours()).padStart(2, '0')}-${String(now.getMinutes()).padStart(2, '0')}`;
        
        a.href = url;
        a.download = `瓦力AI对话记录_${dateStr}_${timeStr}.txt`;
        a.style.display = 'none';
        
        document.body.appendChild(a);
        a.click();
        
        // 清理
        setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }, 100);
        
        // 显示保存成功消息
        addMessage('聊天记录已保存! *ding*', 'bot');
    }
}

// 清空聊天记录
function clearChat() {
    const messages = document.getElementById('chat-messages');
    if (!messages) return;
    
    // 保留第一条欢迎消息
    const firstMessage = messages.querySelector('.max-w-[80%]');
    
    // 清空所有消息
    messages.innerHTML = '';
    
    // 如果存在第一条消息，重新添加
    if (firstMessage) {
        messages.appendChild(firstMessage);
    } else {
        // 如果没有第一条消息，添加一个新的欢迎消息
        addMessage('你好！*beep* 我是瓦力AI，很高兴为你服务。有什么我能帮到你的吗？*whirr*', 'bot');
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