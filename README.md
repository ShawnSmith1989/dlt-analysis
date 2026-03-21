<<<<<<< HEAD
# 大乐透号码走势分析

一个功能完整的大乐透号码走势分析工具，帮助用户分析历史开奖数据，提供号码属性分析、统计功能和可视化图表。

## 功能特点

### 数据分析表
- 📊 **全面的数据分析**：展示期号、开奖日期、前区号码、后区号码等完整信息
- 🎨 **号码属性分析**：基于五行理论，分析号码的颜色属性（蓝、黑、红、黄、绿）
- 📈 **统计指标**：提供奇偶比、质合比、和值、跨度等多维度分析
- 🔍 **灵活筛选**：支持按期号范围和日期范围筛选数据
- 📄 **数据导出**：可将筛选后的数据导出为CSV格式

### 区间分布图
- 📈 **可视化图表**：直观展示各区间号码在各个期次的分布情况
- 🔧 **多种图表类型**：支持柱状图、折线图和面积图展示
- 📊 **堆叠显示**：可选择堆叠或分组显示各区间数据
- 📱 **交互式图表**：支持悬停提示、缩放和平移等交互功能
- 📊 **统计表格**：提供各区间详细统计分析数据
- 💾 **图表导出**：可将图表导出为PNG图片

### 通用功能
- 📱 **响应式设计**：完美适配桌面和移动设备
- 🔄 **页面导航**：数据分析表和区间分布图之间可便捷切换

## 项目结构

```
dlt4/
├── index.html          # 数据分析表页面
├── chart.html          # 区间分布图页面
├── script.js           # 数据分析表JavaScript逻辑
├── chart.js            # 区间分布图JavaScript逻辑
├── data.js             # 转换后的彩票数据
├── convert_data.js     # 数据转换脚本
├── dlt_all.txt         # 原始彩票数据
├── 号码属性.txt        # 号码属性定义
└── README.md           # 项目说明
```

## 使用方法

### 直接使用

1. 打开 `index.html` 文件在浏览器中访问数据分析表
2. 打开 `chart.html` 文件在浏览器中访问区间分布图

### 本地服务器运行（推荐）

1. 在项目目录启动本地HTTP服务器：

   ```bash
   # 使用Python内置服务器
   python -m http.server 8000
   
   # 或使用Node.js的http-server
   npx http-server
   ```

2. 在浏览器中访问 `http://localhost:8000`
   - 访问 `http://localhost:8000/index.html` 查看数据分析表
   - 访问 `http://localhost:8000/chart.html` 查看区间分布图

## 数据更新

当有新的开奖数据时，可以通过以下步骤更新数据：

1. 将新数据添加到 `dlt_all.txt` 文件中
2. 运行数据转换脚本：

   ```bash
   node convert_data.js
   ```

3. 刷新浏览器页面即可看到更新后的数据

## 号码属性说明

根据中国五行理论，大乐透前区号码分为五个属性区间：

- **蓝色区间 (01-07)**：五行属水
- **黑色区间 (08-14)**：五行属金
- **红色区间 (15-21)**：五行属火
- **黄色区间 (22-28)**：五行属土
- **绿色区间 (29-35)**：五行属木

## 技术栈

- HTML5
- CSS3 (Bootstrap 5)
- JavaScript (ES6+)
- Bootstrap Icons

## 浏览器兼容性

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 注意事项

- 本工具仅用于数据分析和参考，不提供任何购彩建议
- 数据来源于公开的大乐透开奖信息，仅供参考
- 请理性购彩，切勿沉迷

## 许可证

MIT License

## 贡献

欢迎提交Issue和Pull Request来改进这个项目。
=======
# lottery

#### 介绍
{**以下是 Gitee 平台说明，您可以替换此简介**
Gitee 是 OSCHINA 推出的基于 Git 的代码托管平台（同时支持 SVN）。专为开发者提供稳定、高效、安全的云端软件开发协作平台
无论是个人、团队、或是企业，都能够用 Gitee 实现代码托管、项目管理、协作开发。企业项目请看 [https://gitee.com/enterprises](https://gitee.com/enterprises)}

#### 软件架构
软件架构说明


#### 安装教程

1.  xxxx
2.  xxxx
3.  xxxx

#### 使用说明

1.  xxxx
2.  xxxx
3.  xxxx

#### 参与贡献

1.  Fork 本仓库
2.  新建 Feat_xxx 分支
3.  提交代码
4.  新建 Pull Request


#### 特技

1.  使用 Readme\_XXX.md 来支持不同的语言，例如 Readme\_en.md, Readme\_zh.md
2.  Gitee 官方博客 [blog.gitee.com](https://blog.gitee.com)
3.  你可以 [https://gitee.com/explore](https://gitee.com/explore) 这个地址来了解 Gitee 上的优秀开源项目
4.  [GVP](https://gitee.com/gvp) 全称是 Gitee 最有价值开源项目，是综合评定出的优秀开源项目
5.  Gitee 官方提供的使用手册 [https://gitee.com/help](https://gitee.com/help)
6.  Gitee 封面人物是一档用来展示 Gitee 会员风采的栏目 [https://gitee.com/gitee-stars/](https://gitee.com/gitee-stars/)
>>>>>>> 2889768eee1ae3705c15c67f60267d629ecffe17
