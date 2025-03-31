# 智谱API与瓦力AI集成指南

本指南介绍如何将智谱AI的API集成到瓦力AI网站中，实现更强大的对话功能，同时保持原有的UI设计和其他功能。

## 前置条件

1. 已经部署了瓦力AI网站
2. 拥有智谱AI的API密钥
3. 已经搭建了Flask后端服务

## 集成步骤

### 1. 设置环境变量

在运行Flask应用前，设置智谱API密钥的环境变量：

```bash
# Linux/Mac
export ZHIPU_API_KEY="你的智谱API密钥"

# Windows
set ZHIPU_API_KEY=你的智谱API密钥
```

### 2. 将代码文件复制到项目中

确保以下文件已添加到项目中：
- `zhipu_api.py` - 智谱API封装模块
- `zhipu_endpoints.py` - Flask API路由
- `static/js/zhipu-integration.js` - 前端集成脚本

### 3. 修改HTML文件

在瓦力AI的主页面中添加智谱集成脚本。找到瓦力AI网站的HTML文件（通常是`index.html`或对话页面），在`</body>`标签前添加：

```html
<!-- 智谱AI集成 -->
<script src="/static/js/zhipu-integration.js"></script>
```

例如，完整的修改可能如下：

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <!-- 原有的头部内容 -->
    <title>瓦力AI - 智能生活小管家</title>
    <!-- ... -->
</head>
<body>
    <!-- 原有的页面内容 -->
    
    <!-- 原有的脚本 -->
    <script src="/static/js/main.js"></script>
    
    <!-- 智谱AI集成 -->
    <script src="/static/js/zhipu-integration.js"></script>
</body>
</html>
```

### 4. 启动测试

1. 先确保智谱API可用，访问测试页面：`http://你的域名/zhipu_test.html`
2. 测试API连接是否正常
3. 测试对话功能是否正常

### 5. 集成到生产环境

当测试无误后，将修改后的文件部署到生产环境：

1. 更新Flask应用
2. 确保环境变量正确设置
3. 重启Flask服务

## 故障排查

### API连接问题

如果遇到API连接问题，请检查：
1. 环境变量是否正确设置
2. API密钥是否有效
3. 网络连接是否正常

可以查看Flask应用的日志，寻找错误信息。

### 前端集成问题

如果前端集成有问题，请检查：
1. 浏览器控制台是否有错误
2. JavaScript文件是否正确加载
3. HTML元素ID是否与脚本中的一致

可以调整`zhipu-integration.js`中的DOM选择器，确保它们匹配瓦力AI网站的HTML结构。

## 进阶定制

### 调整AI风格

如果需要调整AI回复的风格，修改`zhipu-integration.js`中的`addMessageToChat`函数：

```javascript
function addMessageToChat(message, sender) {
    // 修改这里的代码以适应瓦力AI的风格
}
```

### 调整模型参数

修改`zhipu-integration.js`顶部的配置对象：

```javascript
const ZHIPU_CONFIG = {
    model: 'glm-4',       // 可选：'glm-4', 'glm-3-turbo'等
    temperature: 0.7,     // 调整创造性，0-1之间
    maxTokens: 1500       // 最大生成长度
};
```

## 技术支持

如有问题，请联系技术支持团队。 