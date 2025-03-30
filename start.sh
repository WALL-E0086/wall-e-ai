#!/bin/bash

echo "WALL-E AI 助手启动中..."
echo

# 检查Python是否已安装
if ! command -v python3 &> /dev/null; then
    echo "错误: 未检测到Python。请安装Python 3.6或更高版本。"
    echo "可以从 https://www.python.org/downloads/ 下载。"
    exit 1
fi

# 检查依赖是否已安装
echo "检查依赖项..."
pip install -r requirements.txt

# 启动应用
echo
echo "启动服务器..."
echo "应用将在浏览器中打开。按Ctrl+C可停止服务器。"
echo

# 在后台打开浏览器
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    open http://127.0.0.1:5000 &
else
    # Linux
    xdg-open http://127.0.0.1:5000 &
fi

# 启动Flask应用
python3 app.py 