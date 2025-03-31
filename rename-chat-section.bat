@echo off
chcp 65001
echo 正在将名称修改推送到GitHub...

echo 正在添加修改的文件...
git add index.html README.md "智谱API测试说明.md"

echo 正在提交修改...
git commit -m "将智能对话更名为瓦力哔哔机"

echo 正在推送到GitHub...
git push

echo 完成！修改已推送到GitHub，网站将在几分钟内更新。
echo 如果需要刷新缓存，请按Ctrl+F5。
pause 