# WALL-E AI 助手

WALL-E AI 是一个基于 ChatGLM 模型的智能聊天助手，具有文档处理和分析功能。

## 功能特点

- 📱 响应式设计，适配手机和桌面设备
- 💬 实时聊天功能
- 📄 文档上传和分析功能，支持 TXT、DOCX 文档
- 🤖 可爱的 WALL-E 风格界面

## 安装和运行

### 环境要求

- Python 3.6+
- 浏览器（支持现代 JavaScript）

### 安装步骤

1. 克隆仓库
```bash
git clone https://github.com/WALL-E0086/wall-e-ai.git
cd wall-e-ai
```

2. 安装依赖
```bash
pip install -r requirements.txt
```

3. 启动服务器
```bash
python app.py
```

4. 在浏览器中访问
```
http://127.0.0.1:5000
```

## 使用说明

### 基本聊天

1. 点击主页的"开始对话"按钮或导航到"对话"页面
2. 在输入框中输入你的问题
3. 点击发送按钮或按 Enter 键发送消息

### 文档分析

1. 在聊天界面，点击回形针图标上传文档
2. 选择 TXT 或 DOCX 格式的文档
3. 等待 AI 分析文档并提供摘要

### 保存聊天记录

1. 在聊天界面，点击"保存对话"按钮
2. 聊天记录将以文本文件形式下载到你的设备上
3. 文件名格式为"WALL-E-AI-聊天记录-日期时间.txt"

## API 密钥设置

项目使用 ChatGLM API 进行对话功能。确保在 `script.js` 文件中设置了你的 API 密钥：

```javascript
const API_KEY = '你的ChatGLM API密钥';
```

## 许可证

本项目仅用于学习和研究目的。
