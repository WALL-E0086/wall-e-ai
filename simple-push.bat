@echo off
chcp 65001

echo === 添加所有文件 ===
git add .

echo === 提交更改 ===
git commit -m "更新网站：重命名智能对话为瓦力哔哔机并修复按钮"

echo === 推送到GitHub ===
git push

echo === 完成! ===
pause 