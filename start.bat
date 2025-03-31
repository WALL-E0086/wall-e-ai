@echo off
echo WALL-E AI 助手启动中...
echo.

REM 检查Python是否已安装
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo 错误: 未检测到Python。请安装Python 3.6或更高版本。
    echo 可以从 https://www.python.org/downloads/ 下载。
    pause
    exit /b
)

REM 检查依赖是否已安装
echo 检查依赖项...
pip install -r requirements.txt

REM 启动应用
echo.
echo 启动服务器...
echo 应用将在浏览器中打开。按Ctrl+C可停止服务器。
echo.
start http://127.0.0.1:5000
python app.py 