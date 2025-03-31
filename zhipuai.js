// 智谱清言API集成
const API_KEY = 'eed9af215d47fc16afefcd223710e28e.XKe7PGy7dHEeaQaX';
const API_URL = 'https://open.bigmodel.cn/api/paas/v4/chat/completions';

// 发送请求到智谱清言API
async function callZhipuAI(userMessage) {
    try {
        // 准备请求头
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${API_KEY}`
        };

        // 准备请求体
        const requestBody = {
            model: 'glm-4', // 使用GLM-4模型
            messages: [
                { role: 'system', content: '你是瓦力AI初号机，一个友好、活泼的机器人助手。请以瓦力的风格回复，在回答中偶尔加入电子声音如*beep*、*whirr*、*click*等。你的回答应该简短精确，但要保持活泼机器人的特性。' },
                { role: 'user', content: userMessage }
            ],
            temperature: 0.7,
            max_tokens: 800
        };

        // 发送请求
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(requestBody)
        });

        // 检查响应
        if (!response.ok) {
            const errorData = await response.json();
            console.error('智谱AI API错误:', errorData);
            throw new Error(`API错误: ${response.status}`);
        }

        // 解析响应
        const data = await response.json();
        
        // 提取AI回复
        if (data.choices && data.choices.length > 0) {
            return data.choices[0].message.content;
        } else {
            throw new Error('API响应中未找到有效回复');
        }
    } catch (error) {
        console.error('调用智谱AI API出错:', error);
        // 返回备用回复，避免对话中断
        return "很抱歉...*whirr* 我的处理单元暂时出现故障。*beep* 请稍后再试。";
    }
}

// 输出函数供其他文件使用
window.zhipuAI = {
    callAI: callZhipuAI
}; 