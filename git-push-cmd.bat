@echo off
chcp 65001
echo 正在将更改添加到仓库...
git add .
echo 正在提交更改...
git commit -m "修复首页开始对话按钮跳转问题"
echo 正在推送到GitHub...
git push
echo 操作完成！
pause 