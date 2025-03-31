# 瓦力AI与智谱API集成说明

本文档提供了瓦力AI与智谱API集成的设置和使用指南。

## 准备工作

1. 注册智谱AI并获取API密钥
   - 访问 [智谱AI官网](https://open.bigmodel.cn/) 注册账号
   - 在个人中心获取API密钥（格式为: api_key.timestamp）

2. 安装所需Python依赖
   ```bash
   pip install flask flask-cors requests python-docx
   ```

## 配置与启动

1. 编辑`start_server.bat`文件，替换智谱API密钥
   ```
   set ZHIPU_API_KEY=你的智谱API密钥
   ```

2. 双击运行`start_server.bat`启动服务
   - 服务默认运行在 http://127.0.0.1:5000

3. 在浏览器中访问测试页面确认API连接正常
   - 访问 http://127.0.0.1:5000/zhipu_test.html
   - 测试页面会显示API连接状态和简单对话功能

## 文件说明

- `zhipu_api.py` - 智谱API封装模块
- `zhipu_endpoints.py` - Flask API路由
- `static/js/zhipu-integration.js` - 前端集成脚本
- `zhipu_test.html` - API测试页面
- `app.py` - Flask主应用
- `start_server.bat` - 启动脚本

## 功能说明

1. **对话功能**
   - 已集成到瓦力AI的对话界面
   - 支持上下文理解和连续对话
   - 可以通过修改`static/js/zhipu-integration.js`文件中的参数调整对话行为

2. **文档处理**
   - 支持上传.docx、.txt文件进行处理
   - 支持基于文档内容的问答

## 故障排查

- **API连接失败**：
  - 检查API密钥是否正确
  - 检查网络连接
  - 查看Flask服务日志

- **集成问题**：
  - 检查浏览器控制台是否有错误
  - 确认已正确加载所有JavaScript文件

## 进阶配置

要调整AI模型参数，可以编辑`static/js/zhipu-integration.js`文件中的配置：

```javascript
const ZHIPU_CONFIG = {
    model: 'glm-4',        // 可选模型：'glm-4', 'glm-3-turbo'等
    temperature: 0.7,      // 温度参数，控制创造性
    maxTokens: 1500        // 最大生成token数
};
```

## 更新日志

- v1.0.0 (2023.6.10) - 初始版本，完成基础集成
- v1.0.1 (2023.6.15) - 增加文档处理功能
- v1.0.2 (2023.6.20) - 优化对话体验，增加上下文管理 