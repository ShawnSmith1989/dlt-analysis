# 项目部署架构文档

> 本文档记录了大乐透分析系统的部署架构原理和配置流程
> 
> 创建日期：2026-03-28
> 域名：ai3000.xin

---

## 一、架构概述

本项目采用现代化的静态网站部署架构，由三个核心组件构成：

```
┌─────────────┐      ┌─────────────┐      ┌─────────────────┐
│   本地开发   │ ──→  │   GitHub    │ ──→  │     Vercel      │
│  (你的电脑)  │ push │  (代码仓库)  │ 自动  │  (托管+CDN)     │
└─────────────┘      └─────────────┘      └────────┬────────┘
                                                     │
                                                     │ DNS解析
                                                     ↓
                                            ┌─────────────────┐
                                            │  ai3000.xin     │
                                            │  (阿里云域名)    │
                                            └─────────────────┘
                                                     ↑
                                                     │ 访问
                                            ┌────────┴────────┐
                                            │     用户        │
                                            └─────────────────┘
```

---

## 二、各组件详解

### 2.1 GitHub（代码仓库）

**作用**：
- 存储和管理项目代码
- 版本控制，记录每次修改历史
- 作为 Vercel 的代码来源

**触发机制**：
- 当执行 `git push` 时，GitHub 会通过 Webhook 通知 Vercel 有新代码更新

**仓库地址**：
- 需要在 GitHub 创建一个公开或私有仓库
- Vercel 需要授权访问该仓库

---

### 2.2 Vercel（托管平台）

**作用**：
- 自动构建和部署网站
- 提供全球 CDN 加速
- 自动 HTTPS 证书

**工作原理**：
1. 收到 GitHub 的 Webhook 通知
2. 自动拉取最新代码
3. 运行构建命令（静态网站无需构建）
4. 将文件部署到全球 CDN 节点
5. 几秒内完成更新

**优势**：
- 免费额度充足（个人项目完全够用）
- 自动部署，无需手动操作
- 全球 CDN 加速访问
- 自动 HTTPS

---

### 2.3 ai3000.xin（自定义域名）

**作用**：
- 提供易记的访问地址
- 品牌标识

**DNS 配置**：
| 记录类型 | 名称 | 值 |
|---------|------|-----|
| A | @ | 76.76.21.21 (Vercel IP) |
| CNAME | www | cname.vercel-dns.com |

**配置位置**：
- 阿里云域名控制台 → 域名解析 → 添加记录

---

## 三、完整请求流程

当用户访问网站时的完整流程：

```
步骤1: 用户在浏览器输入 ai3000.xin
            ↓
步骤2: DNS 查询（阿里云DNS服务器）
       - 查询 ai3000.xin 的 IP 地址
       - 返回 Vercel 的服务器地址 (76.76.21.21)
            ↓
步骤3: 请求发送到 Vercel 的 CDN 节点
       - Vercel 自动选择离用户最近的节点
            ↓
步骤4: CDN 返回网页文件
       - HTML、CSS、JavaScript 等静态资源
            ↓
步骤5: 浏览器渲染显示给用户
```

---

## 四、部署更新流程

### 4.1 日常更新步骤

```bash
# 步骤1: 本地修改代码
# 使用编辑器修改文件...

# 步骤2: 提交更改
git add .
git commit -m "描述你的更改"

# 步骤3: 推送到 GitHub
git push origin main

# 步骤4: 自动部署（无需操作）
# GitHub → Webhook → Vercel → 自动构建 → 自动部署

# 步骤5: 验证更新
# 访问 ai3000.xin 确认更改已生效
```

### 4.2 部署时间线

| 时间 | 事件 |
|-----|------|
| 0s | 执行 git push |
| 1-2s | GitHub 接收代码 |
| 2-3s | Vercel 收到通知 |
| 3-10s | Vercel 构建部署 |
| 10-30s | CDN 全球同步 |
| 30s+ | 用户可访问最新版本 |

### 4.3 自动更新链路

当前项目已接入 GitHub Actions 自动更新流程：

```text
GitHub Actions 定时任务 / 手动触发
        ↓
执行 node update_data.js
        ↓
更新 data.js 与 dlt_all.txt
        ↓
自动提交回 GitHub main
        ↓
Vercel 检测到新提交并自动部署
        ↓
ai3000.xin 获取最新静态数据
```

工作流文件位置：
- `.github/workflows/auto-update-data.yml`

触发方式：
- 手动触发：GitHub 仓库 → Actions → Auto Update Lottery Data → Run workflow
- 定时触发：每 6 小时自动执行一次

---

## 五、初始配置步骤

### 5.1 GitHub 配置

1. 创建 GitHub 账号（如果没有）
2. 创建新仓库
3. 将本地代码推送到仓库：
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/你的用户名/仓库名.git
   git push -u origin main
   ```

### 5.2 Vercel 配置

1. 访问 [vercel.com](https://vercel.com)
2. 使用 GitHub 账号登录
3. 点击 "New Project"
4. 选择你的 GitHub 仓库
5. 点击 "Deploy"
6. 等待部署完成

### 5.3 自定义域名配置

1. 在 Vercel 项目设置中添加域名 `ai3000.xin`
2. Vercel 会显示需要配置的 DNS 记录
3. 在阿里云域名控制台配置 DNS：
   - 添加 A 记录：@ → 76.76.21.21
   - 添加 CNAME 记录：www → cname.vercel-dns.com
4. 等待 DNS 生效（可能需要几分钟到几小时）

---

## 六、架构优势总结

| 特性 | 说明 |
|------|------|
| 自动化 | git push 后自动部署，无需手动操作 |
| 免费 | GitHub + Vercel 免费额度足够个人项目使用 |
| 快速 | 全球 CDN 加速，访问速度快 |
| 安全 | 自动 HTTPS 证书 |
| 稳定 | 多节点冗余，高可用性 |
| 简单 | 无需服务器运维知识 |

---

## 七、常见问题

### Q1: 推送代码后网站没有更新？
- 检查 Vercel 控制台是否有部署错误
- 清除浏览器缓存后重试
- 检查 git push 是否成功

### Q2: 域名无法访问？
- 检查 DNS 配置是否正确
- 等待 DNS 缓存刷新
- 确认域名未过期

### Q3: 如何查看部署日志？
- 登录 Vercel 控制台
- 选择项目 → Deployments
- 点击具体部署查看日志

### Q4: 自动更新没有生效？
- 登录 GitHub 仓库 → Actions，检查 `Auto Update Lottery Data` 是否执行成功
- 如果工作流成功但网站未更新，检查 Vercel 是否收到新的 commit 并完成部署
- 如果工作流失败，优先查看 `Update lottery data` 步骤的报错信息

---

## 八、相关链接

- [Vercel 官方文档](https://vercel.com/docs)
- [GitHub 文档](https://docs.github.com)
- [阿里云域名控制台](https://dc.console.aliyun.com)
- 项目域名：https://ai3000.xin

---

*最后更新：2026-03-29*
