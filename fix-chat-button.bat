@echo off
chcp 65001
echo 正在将修复推送到GitHub...

echo 正在添加修改的文件...
git add script.js

echo 正在提交修改...
git commit -m "修复首页开始对话按钮跳转问题"

echo 正在推送到GitHub...
git push

echo 完成！修复已推送到GitHub，网站将在几分钟内更新。
echo 如果仍然有问题，请尝试刷新浏览器缓存（按Ctrl+F5）。
pause 