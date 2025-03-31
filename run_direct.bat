@echo off
chcp 65001
echo =================================
echo 瓦力AI - 仅本地访问模式
echo =================================
echo.

REM 设置智谱API密钥（请替换为您的实际密钥）
set ZHIPU_API_KEY=eed9af215d47fc16afefcd223710e28e.XKe7PGy7dHEeaQaX

echo 检查Python环境...
python --version > nul 2>&1
if %errorlevel% neq 0 (
    echo 错误：未检测到Python，请安装Python 3.7+
    pause
    exit /b 1
)

echo 检查必要的Python包...
pip list | findstr "flask" > nul
if %errorlevel% neq 0 (
    echo 正在安装必要的Python包...
    pip install flask flask-cors requests python-docx
)

echo.
echo 注意：此脚本将启动一个仅限本地访问的服务器
echo 这应该可以解决国际网络环境下的连接问题
echo.

REM 创建一个临时的Python脚本来运行仅本地服务器
echo import os > run_local.py
echo from flask import Flask, request, jsonify, send_from_directory >> run_local.py
echo from flask_cors import CORS >> run_local.py
echo from docx import Document >> run_local.py
echo import tempfile >> run_local.py
echo import json >> run_local.py
echo try: >> run_local.py
echo     from zhipu_endpoints import zhipu_bp >> run_local.py
echo     has_zhipu = True >> run_local.py
echo except ImportError: >> run_local.py
echo     has_zhipu = False >> run_local.py
echo     print("警告：未找到智谱API模块，将以有限功能运行") >> run_local.py
echo. >> run_local.py
echo app = Flask(__name__, static_folder='.') >> run_local.py
echo CORS(app) >> run_local.py
echo. >> run_local.py
echo if has_zhipu: >> run_local.py
echo     app.register_blueprint(zhipu_bp) >> run_local.py
echo. >> run_local.py
echo @app.route('/') >> run_local.py
echo def index(): >> run_local.py
echo     return send_from_directory('.', 'index.html') >> run_local.py
echo. >> run_local.py
echo @app.route('/<path:path>') >> run_local.py
echo def static_files(path): >> run_local.py
echo     return send_from_directory('.', path) >> run_local.py
echo. >> run_local.py
echo @app.route('/api/health', methods=['GET']) >> run_local.py
echo def health_check(): >> run_local.py
echo     return jsonify({"status": "ok", "message": "服务正常运行"}) >> run_local.py
echo. >> run_local.py
echo if __name__ == '__main__': >> run_local.py
echo     print("仅本地访问模式启动成功") >> run_local.py
echo     print("请在浏览器中访问: http://localhost:5000") >> run_local.py
echo     app.run(debug=True, host='localhost', port=5000) >> run_local.py

echo 启动仅本地服务器...
start http://localhost:5000
python run_local.py

pause 