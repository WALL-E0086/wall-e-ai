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
    const messages = document.querySelector('.chat-messages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    
    const messageContent = document.createElement('div');
    messageContent.className = 'message-content';
    messageContent.textContent = content;
    
    messageDiv.appendChild(messageContent);
    messages.appendChild(messageDiv);
    
    // 滚动到底部
    messages.scrollTop = messages.scrollHeight;
    
    return messageDiv;
}

// 处理用户输入
function handleUserInput() {
    const input = document.getElementById('user-input');
    const userMessage = input.value.trim();
    
    if (userMessage) {
        // 添加用户消息
        addMessage(userMessage, 'user');
        
        // 清空输入框
        input.value = '';
        
        // 延迟显示Wall-E的回复
        setTimeout(() => {
            const response = generateWallEResponse(userMessage);
            addMessage(response, 'wall-e');
        }, 1000);
    }
}

// 事件监听
document.getElementById('send-button').addEventListener('click', handleUserInput);
document.getElementById('user-input').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        handleUserInput();
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