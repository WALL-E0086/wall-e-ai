# 瓦力AI - 智能生活小管家

瓦力AI是一个基于Web的智能助手，融合了最新的人工智能技术，为用户提供自然流畅的对话体验和多样化的生活服务功能。

![瓦力AI界面预览](https://via.placeholder.com/800x400?text=瓦力AI界面预览)

## ✨ 功能特点

- 🤖 **瓦力哔哔机**：自然流畅的对话体验，理解用户需求，提供贴心回应和建议
- 📚 **知识问答**：拥有海量知识库，回答各类问题，从科学到历史，从技术到艺术
- 💡 **创意助手**：激发创造力，协助生成创意文案、故事、诗歌和各类内容
- 👔 **柜me功能**：根据天气和个人特点，提供穿搭建议
- ⏰ **时綰功能**：通过语音交流，记录珍贵回忆（开发中）
- 📷 **秒秒功能**：照片修复与动态化（开发中）

## 🚀 技术栈

- **前端**：HTML5, CSS3, JavaScript, Tailwind CSS
- **后端**：Python, Flask
- **AI模型**：智谱AI GLM大模型
- **其他**：FontAwesome图标库

## 🛠️ 安装与部署

### 环境要求

- Python 3.7+
- 智谱AI API密钥

### 安装步骤

1. 克隆仓库
   ```bash
   git clone https://github.com/你的用户名/wall-e-ai.git
   cd wall-e-ai
   ```

2. 安装依赖
   ```bash
   pip install flask flask-cors requests python-docx
   ```

3. 配置智谱API密钥
   - 复制`start_server.bat.example`为`start_server.bat`
   - 编辑文件，替换`你的智谱API密钥`为实际密钥

4. 启动服务
   ```bash
   # Windows
   start_server.bat
   
   # Linux/Mac
   export ZHIPU_API_KEY="你的智谱API密钥"
   python app.py
   ```

5. 访问网站
   - 打开浏览器，访问 http://127.0.0.1:5000

## 📦 项目结构

```
.
├── app.py                  # Flask主应用
├── zhipu_api.py            # 智谱API封装模块
├── zhipu_endpoints.py      # Flask API路由
├── index.html              # 网站主页
├── static/                 # 静态资源目录
│   ├── css/                # 样式文件
│   ├── js/                 # JavaScript文件
│   └── img/                # 图片资源
├── zhipu_test.html         # API测试页面
└── README.md               # 项目说明
```

## 🔧 智谱AI集成

瓦力AI集成了智谱AI的GLM大模型，提供高质量的对话和内容生成功能。

详细的集成说明请参见 [智谱API集成指南](zhipu_integration_guide.md)。

## 📝 开发计划

- [ ] 完善时綰功能，实现语音记忆存储
- [ ] 开发秒秒功能，实现照片修复与动态化
- [ ] 增强对话功能，支持多模态输入
- [ ] 优化移动端体验

## 🤝 贡献指南

欢迎贡献代码、报告问题或提出新功能建议！

1. Fork仓库
2. 创建特性分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 创建Pull Request

## 📄 许可证

本项目采用MIT许可证 - 详情请见[LICENSE](LICENSE)文件。

## 👏 致谢

- 感谢智谱AI提供的GLM模型支持
- 感谢所有为项目做出贡献的开发者
