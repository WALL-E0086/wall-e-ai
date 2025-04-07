/**
 * 智谱清言API连接模块
 */

// API配置信息
const ZHIPU_API_CONFIG = {
    apiKey: "5c5dc8a5d6a8fbf4",
    apiSecret: "ca7a5639b32d43d43f9529d57728e26b",
    baseUrl: "https://open.bigmodel.cn/api/paas/v4/chat/completions", // 智谱API端点
    model: "glm-4" // 默认使用GLM-4模型，可根据需要切换
};

/**
 * 生成API请求的JWT令牌
 * @returns {string} JWT令牌
 */
function generateAuthToken() {
    try {
        // JWT头部
        const header = {
            alg: "HS256",
            typ: "JWT"
        };
        
        // JWT载荷
        const payload = {
            api_key: ZHIPU_API_CONFIG.apiKey,
            exp: Math.floor(Date.now() / 1000) + 3600, // 1小时有效期
            timestamp: Math.floor(Date.now() / 1000)
        };
        
        // Base64URL编码
        const base64UrlEncode = (obj) => {
            return btoa(JSON.stringify(obj))
                .replace(/\+/g, '-')
                .replace(/\//g, '_')
                .replace(/=/g, '');
        };
        
        const encodedHeader = base64UrlEncode(header);
        const encodedPayload = base64UrlEncode(payload);
        
        // 签名部分
        const message = `${encodedHeader}.${encodedPayload}`;
        
        // 使用HMAC-SHA256算法计算签名
        // 注意：在浏览器环境中，我们需要使用Web Crypto API
        // 这里我们使用一个自定义的HMAC-SHA256实现
        return new Promise((resolve, reject) => {
            try {
                const encoder = new TextEncoder();
                const keyData = encoder.encode(ZHIPU_API_CONFIG.apiSecret);
                const messageData = encoder.encode(message);
                
                crypto.subtle.importKey(
                    "raw",
                    keyData,
                    { name: "HMAC", hash: { name: "SHA-256" } },
                    false,
                    ["sign"]
                ).then(key => {
                    return crypto.subtle.sign("HMAC", key, messageData);
                }).then(signature => {
                    const base64Signature = btoa(String.fromCharCode(...new Uint8Array(signature)))
                        .replace(/\+/g, '-')
                        .replace(/\//g, '_')
                        .replace(/=/g, '');
                    
                    resolve(`${message}.${base64Signature}`);
                }).catch(error => {
                    console.error("JWT签名生成失败:", error);
                    reject(error);
                });
            } catch (error) {
                console.error("JWT令牌生成失败:", error);
                reject(error);
            }
        });
    } catch (error) {
        console.error("JWT令牌生成失败:", error);
        return Promise.reject(error);
    }
}

/**
 * 发送请求到智谱清言API
 * @param {Array} messages - 对话消息数组
 * @param {Object} options - 请求选项
 * @returns {Promise} API响应
 */
async function sendRequest(messages, options = {}) {
    try {
        // 生成认证令牌
        const token = await generateAuthToken();
        
        // 构建请求参数
        const requestParams = {
            model: options.model || ZHIPU_API_CONFIG.model,
            messages: messages,
            temperature: options.temperature || 0.7,
            top_p: options.top_p || 0.9,
            max_tokens: options.max_tokens || 1500,
            stream: options.stream || false
        };
        
        // 发送请求
        const response = await fetch(ZHIPU_API_CONFIG.baseUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(requestParams)
        });
        
        // 处理响应
        if (!response.ok) {
            const error = await response.json();
            throw new Error(`API请求失败: ${error.error?.message || response.statusText}`);
        }
        
        // 如果是流式响应
        if (options.stream && response.body) {
            return response.body;
        }
        
        // 非流式响应
        return await response.json();
    } catch (error) {
        console.error("智谱API请求失败:", error);
        throw error;
    }
}

/**
 * 流式处理响应数据
 * @param {ReadableStream} stream - 响应流
 * @param {Function} onData - 数据处理回调
 * @param {Function} onComplete - 完成处理回调
 */
async function handleStreamResponse(stream, onData, onComplete) {
    const reader = stream.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    
    try {
        while (true) {
            const { done, value } = await reader.read();
            
            if (done) {
                if (buffer.trim() && onData) {
                    processStreamData(buffer, onData);
                }
                
                if (onComplete) {
                    onComplete();
                }
                
                break;
            }
            
            // 解码新数据并添加到缓冲区
            buffer += decoder.decode(value, { stream: true });
            
            // 处理缓冲区中的完整数据行
            const lines = buffer.split('\n');
            buffer = lines.pop() || ""; // 最后一行可能不完整，保存到下一次处理
            
            for (const line of lines) {
                if (line.trim() && !line.startsWith(':') && line.startsWith('data: ')) {
                    processStreamData(line, onData);
                }
            }
        }
    } catch (error) {
        console.error("流处理失败:", error);
        throw error;
    } finally {
        reader.releaseLock();
    }
}

/**
 * 处理流数据行
 * @param {string} line - 数据行
 * @param {Function} onData - 数据处理回调
 */
function processStreamData(line, onData) {
    try {
        // 提取JSON数据部分
        const jsonStr = line.replace(/^data: /, '').trim();
        
        // 空行或结束标记
        if (jsonStr === "" || jsonStr === "[DONE]") {
            return;
        }
        
        // 解析JSON数据
        const data = JSON.parse(jsonStr);
        
        // 调用回调处理数据
        if (onData && data.choices && data.choices[0]) {
            onData(data.choices[0]);
        }
    } catch (error) {
        console.error("流数据处理失败:", error);
    }
}

/**
 * 发送聊天请求
 * @param {Array} messages - 聊天消息数组
 * @param {Object} options - 请求选项
 * @returns {Promise} API响应
 */
async function chat(messages, options = {}) {
    return await sendRequest(messages, options);
}

/**
 * 发送流式聊天请求
 * @param {Array} messages - 聊天消息数组
 * @param {Function} onData - 数据处理回调
 * @param {Function} onComplete - 完成处理回调
 * @param {Object} options - 请求选项
 * @returns {Promise} API响应处理Promise
 */
async function chatStream(messages, onData, onComplete, options = {}) {
    try {
        // 确保是流式请求
        const streamOptions = { ...options, stream: true };
        
        // 发送请求并获取流
        const stream = await sendRequest(messages, streamOptions);
        
        // 处理响应流
        await handleStreamResponse(stream, onData, onComplete);
    } catch (error) {
        console.error("流式聊天请求失败:", error);
        throw error;
    }
}

// 导出API接口
window.zhipuAI = {
    chat,
    chatStream,
    generateAuthToken,
    apiConfig: ZHIPU_API_CONFIG
}; 