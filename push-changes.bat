@echo off
rem 设置UTF-8编码
chcp 65001

rem 显示状态信息
echo ==============================================
echo 正在推送代码更改到GitHub...
echo ==============================================

rem 添加修改的文件
echo 步骤1: 添加修改的文件...
git add index.html
git add README.md
git add "智谱API测试说明.md"

rem 提交更改
echo 步骤2: 提交更改...
git commit -m "将智能对话更名为瓦力哔哔机"

rem 推送到GitHub
echo 步骤3: 推送到GitHub...
git push

rem 完成
echo ==============================================
echo 完成! 代码已成功推送到GitHub
echo 网站将在几分钟内自动更新
echo 如果看到旧版本，请按Ctrl+F5刷新缓存
echo ==============================================
pause 