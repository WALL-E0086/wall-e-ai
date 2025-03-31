@echo off
chcp 65001
echo =================================
echo 瓦力AI与智谱API集成测试
echo =================================
echo.

REM 设置智谱API密钥（请替换为您的实际密钥）
set ZHIPU_API_KEY=请在这里填入您的智谱API密钥

REM 询问是否需要使用代理
set /p use_proxy=您的网络节点是否在国外(如新加坡)？需要使用代理吗？(y/n):
if /i "%use_proxy%"=="y" (
    set /p http_proxy=请输入HTTP代理地址(格式如 http://127.0.0.1:7890):
    set HTTP_PROXY=%http_proxy%
    set HTTPS_PROXY=%http_proxy%
    echo 已设置代理: %http_proxy%
)

echo [1/3] 检查Python环境...
python --version > nul 2>&1
if %errorlevel% neq 0 (
    echo 错误：未检测到Python，请安装Python 3.7+
    pause
    exit /b 1
)

echo [2/3] 检查必要的Python包...
pip list | findstr "flask" > nul
if %errorlevel% neq 0 (
    echo 正在安装必要的Python包...
    pip install flask flask-cors requests python-docx
)

echo [3/3] 检查网络连接...
ping -n 1 www.baidu.com > nul
if %errorlevel% neq 0 (
    echo 警告: 网络连接可能存在问题。应用仍将启动，但可能无法正常工作。
    echo 如果您在国外，可能需要设置代理。
    echo.
)

echo [4/4] 启动Flask应用...
echo 正在启动本地服务器，请注意：如果看到网页显示"无法访问此网站"
echo 这可能是因为您的网络节点在国外。您可以尝试：
echo 1. 使用代理软件
echo 2. 在浏览器中手动访问 http://localhost:5000 或 http://127.0.0.1:5000
echo.
start http://localhost:5000
python app.py

pause 