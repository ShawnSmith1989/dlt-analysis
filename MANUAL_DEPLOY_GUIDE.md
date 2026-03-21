# EdgeOne Pages 手动部署指南

由于EdgeOne Pages集成工具的环境变量配置问题，我们建议采用手动部署方式。

## 部署步骤

### 1. 准备部署文件

已完成以下准备工作：
- 创建了`deploy`目录
- 修改了`chart.html`以适应静态环境
- 准备了所有必要的文件

### 2. 手动部署到EdgeOne Pages

1. 登录[腾讯云EdgeOne控制台](https://console.cloud.tencent.com/edgeone)
2. 点击"创建应用"或选择现有应用
3. 选择"静态网站"类型
4. 上传`deploy`目录中的所有文件：
   - chart.html（主页面）
   - index.html
   - chart.js
   - data.js
   - deploy_instructions.html（可选）
5. 设置默认首页为`chart.html`
6. 配置自定义域名（可选）
7. 发布应用

### 3. 使用其他静态托管服务

如果您不想使用EdgeOne Pages，可以考虑以下替代方案：

#### GitHub Pages
1. 将`deploy`目录内容推送到GitHub仓库
2. 在仓库设置中启用GitHub Pages
3. 选择主分支作为源

#### Vercel
1. 注册Vercel账号
2. 连接GitHub仓库或上传文件
3. 自动部署完成

#### Netlify
1. 注册Netlify账号
2. 拖拽`deploy`目录到部署区域
3. 获取部署URL

## 部署后的访问

部署完成后，您将获得一个公开可访问的URL，如：
```
https://your-project-name.pages.dev/chart.html
```

## 功能说明

### 静态版本特点

1. **完整分析功能**：
   - 大乐透号码五行属性分析
   - 区间分布折线图
   - 数据表格展示

2. **数据更新限制**：
   - 仅支持手动添加数据
   - 手动添加的数据仅在当前会话有效
   - 刷新页面后数据将重置

3. **数据持久化方案**：
   - 定期更新`data.js`文件
   - 重新部署应用

## 后续维护建议

1. **定期数据更新**：
   - 每周更新一次`data.js`文件
   - 重新部署到EdgeOne Pages

2. **版本管理**：
   - 为每次数据更新创建版本标签
   - 保留历史数据备份

3. **用户反馈**：
   - 收集用户使用反馈
   - 持续优化用户体验

## 技术支持

如果在部署过程中遇到问题，可以：
1. 查看EdgeOne Pages官方文档
2. 联系腾讯云技术支持
3. 参考其他静态网站部署教程