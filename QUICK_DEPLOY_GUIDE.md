# EdgeOne Pages 快速部署指南

## 当前状态
✅ EdgeOne Pages集成已连接成功
⚠️ 部署工具无法读取环境变量

## 临时解决方案

### 方案一：通过集成界面手动上传

1. 在EdgeOne Pages集成界面中，查找"上传文件"或"手动部署"选项
2. 选择以下文件上传：
   - `d:\daletgou\dlt4\deploy\chart.html`
   - `d:\daletgou\dlt4\deploy\index.html`
   - `d:\daletgou\dlt4\deploy\chart.js`
   - `d:\daletgou\dlt4\deploy\data.js`

3. 设置默认首页为 `chart.html`
4. 点击"发布"或"部署"

### 方案二：创建项目配置文件

创建 `d:\daletgou\dlt4\edgeone.json` 文件，内容如下：

```json
{
  "projectName": "dlt-analysis",
  "projectType": "static",
  "buildCommand": "",
  "outputDirectory": "deploy",
  "indexPage": "chart.html"
}
```

然后在集成界面中选择"使用配置文件部署"选项。

## 文件说明

- `chart.html`: 主页面，包含分析工具
- `index.html`: 简单的首页
- `chart.js`: 图表相关的JavaScript代码
- `data.js`: 彩票数据文件

## 部署后验证

部署成功后，您将获得一个公开可访问的URL。访问该URL并：
1. 确认页面正常加载
2. 检查图表是否显示
3. 测试手动添加数据功能

## 备注

静态部署版本的特点：
- 完整的分析功能
- 仅支持手动添加数据（刷新页面后丢失）
- 无需服务器端支持

## 获取帮助

如果遇到问题，请参考：
1. EdgeOne Pages官方文档
2. 本项目中的 `MANUAL_DEPLOY_GUIDE.md`
3. `deploy_instructions.html`（位于deploy目录）