#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""
智谱API接口模块
提供与智谱AI API交互的功能
"""

import requests
import json
import time
import hmac
import base64
import hashlib
import uuid
import datetime
import os
from typing import Dict, List, Optional, Union, Any

class ZhipuAI:
    """智谱AI API接口类"""
    
    API_HOST = "https://open.bigmodel.cn/api/paas/v4"
    
    def __init__(self, api_key: str):
        """
        初始化智谱AI API客户端
        
        Args:
            api_key: API密钥，格式为"api_key.timestamp"
        """
        self.api_key = api_key
        parts = api_key.split(".")
        if len(parts) != 2:
            raise ValueError("API密钥格式不正确，应为'api_key.timestamp'格式")
        self.id = parts[0]
        self.secret = parts[1]
        
        # 从环境变量获取代理设置
        self.proxies = None
        http_proxy = os.getenv("HTTP_PROXY")
        https_proxy = os.getenv("HTTPS_PROXY")
        
        if http_proxy or https_proxy:
            self.proxies = {}
            if http_proxy:
                self.proxies["http"] = http_proxy
            if https_proxy:
                self.proxies["https"] = https_proxy
            print(f"智谱API将使用代理: {self.proxies}")
    
    def _generate_signature(self, payload: str) -> Dict[str, str]:
        """
        生成API请求签名
        
        Args:
            payload: 请求负载
            
        Returns:
            包含签名和其他认证信息的字典
        """
        timestamp = int(time.time())
        expire = timestamp + 3600  # 1小时过期
        
        # 使用HMAC-SHA256算法进行签名
        signature_raw = f"{timestamp}\n{expire}\n{payload}"
        signature = base64.b64encode(
            hmac.new(
                self.secret.encode('utf-8'),
                signature_raw.encode('utf-8'),
                digestmod=hashlib.sha256
            ).digest()
        ).decode('utf-8')
        
        return {
            "Authorization": f"Bearer {self.id}.{timestamp}.{expire}.{signature}"
        }
    
    def chat_completions(self, 
                        model: str, 
                        messages: List[Dict[str, str]], 
                        temperature: float = 0.7,
                        top_p: float = 0.7,
                        max_tokens: int = 1500,
                        stream: bool = False) -> Dict[str, Any]:
        """
        发送聊天请求
        
        Args:
            model: 模型名称，如"glm-4"
            messages: 消息列表，格式为[{"role": "user", "content": "你好"}]
            temperature: 温度参数，控制随机性，范围0-1
            top_p: 采样概率阈值，范围0-1
            max_tokens: 最大生成token数
            stream: 是否启用流式输出
            
        Returns:
            API响应结果
        """
        url = f"{self.API_HOST}/chat/completions"
        
        payload = {
            "model": model,
            "messages": messages,
            "temperature": temperature,
            "top_p": top_p,
            "max_tokens": max_tokens,
            "stream": stream
        }
        
        # 构建请求头
        headers = {
            "Content-Type": "application/json"
        }
        
        # 添加签名
        payload_str = json.dumps(payload)
        headers.update(self._generate_signature(payload_str))
        
        try:
            # 发送请求，添加代理和超时设置
            response = requests.post(
                url, 
                headers=headers, 
                data=payload_str,
                proxies=self.proxies,
                timeout=30  # 增加超时时间到30秒
            )
            
            # 处理响应
            if response.status_code == 200:
                if stream:
                    return self._handle_stream_response(response)
                else:
                    return response.json()
            else:
                error_message = f"请求失败，状态码: {response.status_code}, 响应: {response.text}"
                raise Exception(error_message)
                
        except requests.exceptions.RequestException as e:
            # 处理网络错误
            error_message = f"网络请求错误: {str(e)}"
            if "代理" in str(e) or "proxy" in str(e).lower():
                error_message += "\n可能是代理设置问题，请检查代理配置或尝试不使用代理。"
            raise Exception(error_message)
    
    def _handle_stream_response(self, response):
        """处理流式响应"""
        for line in response.iter_lines():
            if line:
                line = line.decode('utf-8')
                if line.startswith('data: '):
                    data = line[6:]  # 去掉'data: '前缀
                    if data == '[DONE]':
                        break
                    try:
                        yield json.loads(data)
                    except json.JSONDecodeError:
                        continue
    
    def embeddings(self, 
                  model: str, 
                  input: Union[str, List[str]]) -> Dict[str, Any]:
        """
        获取文本嵌入
        
        Args:
            model: 模型名称，如"embedding-2"
            input: 输入文本或文本列表
            
        Returns:
            API响应结果
        """
        url = f"{self.API_HOST}/embeddings"
        
        payload = {
            "model": model,
            "input": input if isinstance(input, list) else [input]
        }
        
        # 构建请求头
        headers = {
            "Content-Type": "application/json"
        }
        
        # 添加签名
        payload_str = json.dumps(payload)
        headers.update(self._generate_signature(payload_str))
        
        try:
            # 发送请求，添加代理和超时设置
            response = requests.post(
                url, 
                headers=headers, 
                data=payload_str,
                proxies=self.proxies,
                timeout=30  # 增加超时时间到30秒
            )
            
            # 处理响应
            if response.status_code == 200:
                return response.json()
            else:
                error_message = f"请求失败，状态码: {response.status_code}, 响应: {response.text}"
                raise Exception(error_message)
                
        except requests.exceptions.RequestException as e:
            # 处理网络错误
            error_message = f"网络请求错误: {str(e)}"
            if "代理" in str(e) or "proxy" in str(e).lower():
                error_message += "\n可能是代理设置问题，请检查代理配置或尝试不使用代理。"
            raise Exception(error_message)

# 简单测试
if __name__ == "__main__":
    # 从环境变量或配置文件获取API密钥
    import os
    api_key = os.getenv("ZHIPU_API_KEY")
    if not api_key:
        print("请设置环境变量ZHIPU_API_KEY")
        exit(1)
    
    client = ZhipuAI(api_key)
    
    # 测试聊天接口
    try:
        response = client.chat_completions(
            model="glm-4",
            messages=[
                {"role": "user", "content": "你好，请介绍一下你自己"}
            ]
        )
        
        print(json.dumps(response, ensure_ascii=False, indent=2))
    except Exception as e:
        print(f"测试失败: {str(e)}") 