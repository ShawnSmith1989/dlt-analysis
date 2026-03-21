# 部署大乐透分析工具到EdgeOne Pages

## 准备工作

已完成的工作：
1. 创建了`deploy`目录，包含部署所需的文件
2. 修改了`chart.html`，使其适应静态环境
3. 只保留了手动添加数据功能，移除了服务器相关的API调用

## 部署步骤

### 方法一：使用EdgeOne Pages集成（推荐）

1. 在IDE中打开EdgeOne Pages集成（顶部菜单）
2. 选择`deploy_folder`工具
3. 输入以下参数：
   ```
   builtFolderPath: d:\daletgou\dlt4\deploy
   workspacePath: d:\daletgou\dlt4
   projectType: static
   ```
4. 点击执行

**注意：** 如果提示需要项目名称，请设置环境变量`EDGEONE_PAGES_PROJECT_NAME=dlt-analysis`，或运行`deploy_to_edgeone.bat`文件。

### 方法二：手动部署

1. 登录[腾讯云EdgeOne Pages控制台](https://console.cloud.tencent.com/edgeone)
2. 创建新项目或选择现有项目
3. 上传`deploy`目录中的所有文件：
   - chart.html
   - index.html
   - chart.js
   - data.js
4. 设置默认首页为`chart.html`

## 部署后的访问地址

部署成功后，您将获得一个类似以下的URL：
```
https://your-project-name.example.domain/chart.html
```

## 功能说明

### 静态版本功能

1. **数据分析**：完整的五行属性分析功能
2. **图表展示**：区间分布折线图
3. **数据表格**：历史数据展示
4. **手动添加数据**：可以手动添加新的开奖数据（仅在当前会话有效）

### 与服务器版本的区别

1. **数据更新**：
   - 服务器版本：支持自动从网络获取最新数据
   - 静态版本：仅支持手动添加数据

2. **数据持久化**：
   - 服务器版本：数据更新后永久保存
   - 静态版本：手动添加的数据仅在当前会话有效，刷新页面后丢失

## 注意事项

1. 静态版本无法永久保存手动添加的数据
2. 如需永久保存数据，请使用服务器版本或定期更新`data.js`文件
3. 确保所有文件都已正确上传，包括CSS和JS资源

## 后续维护

如需更新数据，可以：
1. 修改`data.js`文件并重新部署
2. 设置定时任务定期更新数据文件
3. 考虑使用云函数实现动态数据更新