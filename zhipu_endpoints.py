#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""
智谱API Flask端点
提供与智谱AI API交互的Web接口
"""

from flask import Blueprint, request, jsonify
import os
import json
from zhipu_api import ZhipuAI

# 创建Blueprint
zhipu_bp = Blueprint('zhipu', __name__, url_prefix='/api/zhipu')

# 从环境变量获取API密钥，也可以在配置文件中设置
API_KEY = os.getenv("ZHIPU_API_KEY")

# 创建智谱AI客户端
try:
    if API_KEY:
        client = ZhipuAI(API_KEY)
    else:
        client = None
        print("警告：未设置ZHIPU_API_KEY环境变量，智谱API功能将不可用")
except Exception as e:
    client = None
    print(f"初始化智谱AI客户端失败: {str(e)}")

# 聊天接口
@zhipu_bp.route('/chat', methods=['POST'])
def chat():
    """
    智谱AI聊天接口
    
    请求体:
    {
        "model": "glm-4",
        "messages": [{"role": "user", "content": "你好"}],
        "temperature": 0.7,
        "top_p": 0.7,
        "max_tokens": 1500
    }
    """
    if not client:
        return jsonify({"error": "智谱AI客户端未初始化，请检查API密钥配置"}), 500
    
    try:
        data = request.json
        if not data:
            return jsonify({"error": "无效的请求体"}), 400
        
        # 提取参数
        model = data.get('model', 'glm-4')
        messages = data.get('messages', [])
        temperature = data.get('temperature', 0.7)
        top_p = data.get('top_p', 0.7)
        max_tokens = data.get('max_tokens', 1500)
        
        # 验证消息格式
        if not messages or not isinstance(messages, list):
            return jsonify({"error": "无效的消息格式"}), 400
        
        # 发送请求
        response = client.chat_completions(
            model=model,
            messages=messages,
            temperature=temperature,
            top_p=top_p,
            max_tokens=max_tokens
        )
        
        return jsonify(response)
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# 嵌入向量接口
@zhipu_bp.route('/embeddings', methods=['POST'])
def embeddings():
    """
    智谱AI嵌入向量接口
    
    请求体:
    {
        "model": "embedding-2",
        "input": "文本内容" 或 ["文本1", "文本2"]
    }
    """
    if not client:
        return jsonify({"error": "智谱AI客户端未初始化，请检查API密钥配置"}), 500
    
    try:
        data = request.json
        if not data:
            return jsonify({"error": "无效的请求体"}), 400
        
        # 提取参数
        model = data.get('model', 'embedding-2')
        input_text = data.get('input')
        
        # 验证输入
        if not input_text:
            return jsonify({"error": "缺少input参数"}), 400
        
        # 发送请求
        response = client.embeddings(
            model=model,
            input=input_text
        )
        
        return jsonify(response)
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# 健康检查
@zhipu_bp.route('/health', methods=['GET'])
def health():
    """健康检查，验证API密钥是否有效"""
    if not client:
        return jsonify({
            "status": "error",
            "message": "智谱AI客户端未初始化，请检查API密钥配置"
        }), 500
    
    try:
        # 简单测试API连通性
        response = client.chat_completions(
            model="glm-4",
            messages=[{"role": "user", "content": "测试"}],
            max_tokens=10
        )
        
        return jsonify({
            "status": "ok",
            "message": "智谱API连接正常"
        })
    
    except Exception as e:
        return jsonify({
            "status": "error",
            "message": f"智谱API连接异常: {str(e)}"
        }), 500 