/**
 * 智谱AI API集成脚本
 * 用于将智谱AI与瓦力AI网站的对话功能集成
 */

// 智谱API配置
const ZHIPU_CONFIG = {
    model: 'glm-4',
    temperature: 0.7,
    maxTokens: 1500
};

// 消息历史记录
let messageHistory = [];

// 初始化智谱AI
function initZhipuAI() {
    console.log('初始化智谱AI...');
    
    // 检查API连接状态
    fetch('/api/zhipu/health')
        .then(response => response.json())
        .then(data => {
            if (data.status === 'ok') {
                console.log('智谱API连接正常');
            } else {
                console.error('智谱API连接异常:', data.message);
            }
        })
        .catch(error => {
            console.error('检查智谱API状态出错:', error);
        });
}

/**
 * 发送消息到智谱AI并获取回复
 * @param {string} userMessage - 用户输入的消息
 * @returns {Promise} - 返回Promise对象，成功时返回AI回复
 */
async function sendToZhipuAI(userMessage) {
    // 添加用户消息到历史记录
    messageHistory.push({
        role: 'user',
        content: userMessage
    });
    
    try {
        // 发送请求到智谱API
        const response = await fetch('/api/zhipu/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: ZHIPU_CONFIG.model,
                messages: messageHistory,
                temperature: ZHIPU_CONFIG.temperature,
                max_tokens: ZHIPU_CONFIG.maxTokens
            })
        });
        
        const data = await response.json();
        
        if (data.error) {
            throw new Error(data.error);
        }
        
        // 获取回复内容
        const aiResponse = data.choices[0].message.content;
        
        // 添加AI回复到历史记录
        messageHistory.push({
            role: 'assistant',
            content: aiResponse
        });
        
        return aiResponse;
    } catch (error) {
        console.error('智谱AI请求出错:', error);
        throw error;
    }
}

/**
 * 清空对话历史
 */
function clearZhipuHistory() {
    messageHistory = [];
}

// 创建全局对象，暴露API给原始脚本
window.zhipuAI = {
    // 调用AI获取回复
    callAI: async function(message) {
        try {
            return await sendToZhipuAI(message);
        } catch (error) {
            console.error('zhipuAI.callAI错误:', error);
            return "*buzz* 抱歉，我现在无法连接到智谱AI服务。*whirr* 请稍后再试。";
        }
    },
    
    // 清空历史
    clearHistory: function() {
        clearZhipuHistory();
    }
};

// 挂钩到原始的清空聊天功能
function hookClearChat() {
    const clearChatBtn = document.getElementById('clear-chat');
    if (clearChatBtn) {
        const originalClickHandler = clearChatBtn.onclick;
        
        clearChatBtn.addEventListener('click', function(e) {
            // 清空智谱历史
            clearZhipuHistory();
            
            // 如果有原始处理函数，继续执行
            if (typeof originalClickHandler === 'function') {
                originalClickHandler.call(this, e);
            }
        });
    }
}

// 当页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    // 初始化智谱AI
    initZhipuAI();
    
    // 挂钩清空聊天按钮
    hookClearChat();
    
    console.log('智谱AI集成完成，已准备好接收对话请求');
}); 