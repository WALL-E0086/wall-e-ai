@echo off
chcp 65001
echo 正在打开瓦力AI本地静态版...
echo 这个版本不需要服务器，可以直接在浏览器中运行
echo 但功能有限，仅作为您的网络环境无法运行服务器时的备选方案
echo.

REM 获取当前目录的绝对路径
set CURRENT_DIR=%~dp0
set HTML_FILE=%CURRENT_DIR%local_client.html

REM 打开HTML文件
start "" "%HTML_FILE%"

echo HTML文件已在浏览器中打开
echo 如果没有自动打开，请手动打开此文件：
echo %HTML_FILE%
echo.

pause 