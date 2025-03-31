# GitHub推送指南

要将瓦力AI项目推送到GitHub，请按以下步骤操作：

## 准备工作

1. 确保已安装Git
2. 确保您有GitHub账号

## 推送步骤

### 1. 在GitHub上创建新仓库

1. 登录GitHub账号
2. 点击右上角"+"图标，选择"New repository"
3. 填写仓库信息：
   - Repository name: `wall-e-ai`
   - Description: `瓦力AI - 智能生活小管家，基于智谱GLM大模型`
   - 设置为公开或私有（根据您的需求）
   - 不要勾选"Initialize this repository with a README"
4. 点击"Create repository"

### 2. 添加远程仓库

打开命令行工具，导航到项目目录，然后运行：

```bash
git remote add origin https://github.com/你的用户名/wall-e-ai.git
```

### 3. 推送代码

执行以下命令将代码推送到GitHub：

```bash
git push -u origin main
```

系统会要求您输入GitHub用户名和密码（或个人访问令牌）。

### 4. 验证推送

访问您的GitHub仓库页面，确认所有文件已成功推送。

## 使用个人访问令牌（推荐）

如果您启用了双因素认证或希望使用更安全的方式，请使用个人访问令牌：

1. 在GitHub中，转到Settings > Developer settings > Personal access tokens
2. 点击"Generate new token"
3. 提供令牌描述并选择权限（至少需要"repo"权限）
4. 生成并复制令牌
5. 在提示输入密码时使用此令牌

## 常见问题

### 推送被拒绝

如果看到"rejected"错误，可能是因为远程仓库包含本地没有的更改。尝试：

```bash
git pull --rebase origin main
git push -u origin main
```

### 身份验证失败

如果身份验证失败，请确保：
- 用户名和密码正确
- 如果使用双因素认证，必须使用个人访问令牌而不是密码
- 您对该仓库有写入权限 