# 大乐透数据分析 - EdgeOne Pages 部署版本

## 简介

这是大乐透数据分析工具的静态部署版本，专门针对EdgeOne Pages静态网站托管进行了优化。

## 功能特点

- 大乐透号码五行属性分析
- 区间分布折线图
- 数据表格展示
- 手动添加数据功能（静态环境唯一支持的数据更新方式）

## 部署说明

### 使用EdgeOne Pages部署

1. 将deploy文件夹中的所有文件上传到EdgeOne Pages
2. 确保文件结构正确：
   ```
   /
   ├── chart.html      (主页面)
   ├── index.html      (首页)
   ├── chart.js        (图表脚本)
   ├── data.js         (数据文件)
   └── README.md       (说明文件)
   ```

3. 设置默认首页为chart.html或index.html

### 本地预览

可以使用任何静态服务器进行本地预览：

```bash
# 使用Python
python -m http.server 8000

# 使用Node.js
npx serve .

# 使用PHP
php -S localhost:8000
```

然后在浏览器中访问 `http://localhost:8000/chart.html`

## 注意事项

1. **数据更新功能**
   - 静态部署版本仅支持手动添加数据
   - 自动更新数据功能需要服务器端支持

2. **数据持久化**
   - 手动添加的数据仅在当前会话中有效
   - 刷新页面后数据将重置为原始数据

3. **浏览器兼容性**
   - 支持现代浏览器（Chrome、Firefox、Safari、Edge）
   - 需要启用JavaScript

## 技术栈

- HTML5
- CSS3 (Bootstrap 5)
- JavaScript (原生JS)
- Chart.js (图表库)

## 联系方式

如有问题或建议，请通过以下方式联系：
- 邮箱：your-email@example.com