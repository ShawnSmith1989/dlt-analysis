# 炼金术号码生成器 - UI设计文档

## 概述

炼金术号码生成器是一个融合玄学元素与现代UI设计的彩票号码生成工具。采用玻璃态设计(Glassmorphism)和霓虹光效(Neon Glow)打造高端视觉效果。

***

## 设计理念

### 核心设计风格

1. **玻璃态设计 (Glassmorphism)**
   - 半透明背景 `rgba(255, 255, 255, 0.05)`
   - 模糊效果 `backdrop-filter: blur(10px)`
   - 微妙的边框 `rgba(255, 255, 255, 0.1)`
2. **霓虹光效 (Neon Glow)**
   - 金色主光效: `0 0 30px rgba(244, 208, 63, 0.4)`
   - 青色交互光效: `0 0 30px rgba(0, 217, 255, 0.4)`
   - 紫色辅助光效: `0 0 30px rgba(168, 85, 247, 0.4)`
3. **流畅动画**
   - 使用 `cubic-bezier(0.4, 0, 0.2, 1)` 缓动函数
   - 过渡时间 0.3s 为标准
   - 悬停放大 1.15-1.2 倍

***

## 色彩系统

### 主色调

| 变量名               | 色值        | 用途        |
| ----------------- | --------- | --------- |
| `--bg-primary`    | `#0f0f1a` | 主背景色      |
| `--bg-secondary`  | `#1a1a2e` | 次背景色      |
| `--accent-gold`   | `#f4d03f` | 主强调色(金色)  |
| `--accent-cyan`   | `#00d9ff` | 交互高亮色(青色) |
| `--accent-purple` | `#a855f7` | 辅助强调色(紫色) |

### 五行颜色

| 元素 | 色值        |
| -- | --------- |
| 水  | `#3b82f6` |
| 金  | `#8b9dc3` |
| 火  | `#ef4444` |
| 土  | `#d97706` |
| 木  | `#22c55e` |

***

## 布局结构

### 整体架构

```
┌─────────────────────────────────────┐
│            导航栏 (Navbar)           │
├─────────────────────────────────────┤
│                                     │
│         标题区域 (Title)             │
│                                     │
├─────────────────────────────────────┤
│                                     │
│    ┌─────────────────────────┐     │
│    │                         │     │
│    │   材料卡片围绕圆形排列    │     │
│    │                         │     │
│    │      ┌─────────┐       │     │
│    │      │ 炼丹炉  │       │     │
│    │      │ (圆形)  │       │     │
│    │      └─────────┘       │     │
│    │                         │     │
│    │   12个材料卡片围绕炉子   │     │
│    │                         │     │
│    └─────────────────────────┘     │
│                                     │
│         [开始炼制] [重置]            │
│                                     │
├─────────────────────────────────────┤
│                                     │
│         结果展示区域                 │
│                                     │
├─────────────────────────────────────┤
│         免责声明                     │
└─────────────────────────────────────┘
```

### 圆形布局参数

- 圆形半径: `--circle-radius: 260px`
- 材料卡片尺寸: `60px × 60px`
- 炼丹炉尺寸: `180px × 180px`
- 五行元素球尺寸: `28px × 28px`

***

## 组件设计

### 1. 导航栏

```css
background: rgba(15, 15, 26, 0.8);
backdrop-filter: blur(20px);
border-bottom: 1px solid var(--glass-border);
```

- 玻璃态背景
- 模糊效果
- 细微边框

### 2. 圆形炼丹炉

**外圈旋转效果:**

```css
background: conic-gradient(
    from 0deg,
    rgba(244, 208, 63, 0.3),
    rgba(168, 85, 247, 0.3),
    rgba(0, 217, 255, 0.3),
    rgba(244, 208, 63, 0.3)
);
animation: furnaceRotate 10s linear infinite;
```

**核心特点:**

- 锥形渐变实现颜色流动
- 三层结构: 外圈、内圈、核心
- 符文环绕旋转
- 五行元素球轨道

### 3. 材料卡片 (圆形)

**基础样式:**

```css
width: 60px;
height: 60px;
background: var(--glass-bg);
backdrop-filter: blur(10px);
border: 1px solid var(--glass-border);
border-radius: 50%;
```

**悬停效果:**

```css
transform: scale(1.15);
border-color: var(--accent-cyan);
box-shadow: 0 0 25px rgba(0, 217, 255, 0.3);
```

**激活效果:**

```css
background: linear-gradient(135deg, rgba(244, 208, 63, 0.2), rgba(168, 85, 247, 0.2));
border-color: var(--accent-gold);
box-shadow: 0 0 30px rgba(244, 208, 63, 0.4);
```

### 4. 号码球

**五行配色:**

- 水: `linear-gradient(145deg, #60a5fa, #3b82f6)`
- 金: `linear-gradient(145deg, #b8c5d9, #8b9dc3)`
- 火: `linear-gradient(145deg, #fca5a5, #ef4444)`
- 土: `linear-gradient(145deg, #fcd34d, #d97706)`
- 木: `linear-gradient(145deg, #86efac, #22c55e)`

**出现动画:**

```css
@keyframes ballAppear {
    0% { transform: scale(0) rotate(-180deg); opacity: 0; }
    60% { transform: scale(1.1) rotate(10deg); }
    100% { transform: scale(1) rotate(0deg); opacity: 1; }
}
```

### 5. 操作按钮

**炼制按钮:**

```css
background: linear-gradient(135deg, var(--accent-gold), var(--accent-gold-dark));
border-radius: 16px;
box-shadow: var(--glow-gold);
```

**重置按钮:**

```css
background: var(--glass-bg);
border: 1px solid var(--glass-border);
border-radius: 16px;
```

***

## 图标系统

使用 Bootstrap Icons 代替 Emoji 图标:

| 功能 | 图标类名                        | 说明    |
| -- | --------------------------- | ----- |
| 时辰 | `bi-clock`                  | 时钟    |
| 地脉 | `bi-geo-alt`                | 定位    |
| 天象 | `bi-cloud-sun`              | 云和太阳  |
| 温度 | `bi-thermometer-half`       | 温度计   |
| 湿度 | `bi-droplet`                | 水滴    |
| 风息 | `bi-compass`                | 指南针   |
| 风力 | `bi-wind`                   | 风     |
| 月相 | `bi-moon-stars`             | 月亮和星星 |
| 生肖 | `bi-dice-5`                 | 骰子    |
| 星座 | `bi-stars`                  | 星星    |
| 心境 | `bi-heart-pulse`            | 心跳    |
| 幸数 | `bi-gem`                    | 宝石    |
| 炼制 | `bi-fire`                   | 火焰    |
| 重置 | `bi-arrow-counterclockwise` | 逆时针箭头 |

***

## 动画效果

### 1. 背景星星闪烁

```css
@keyframes twinkle {
    0%, 100% { opacity: 0.6; }
    50% { opacity: 1; }
}
```

### 2. 符文光晕

```css
@keyframes runeGlow {
    0%, 100% { filter: drop-shadow(0 0 5px var(--accent-gold)); opacity: 0.7; }
    50% { filter: drop-shadow(0 0 15px var(--accent-gold)); opacity: 1; }
}
```

### 3. 五行元素球旋转

```css
@keyframes orbsRotate {
    0% { transform: translate(-50%, -50%) rotate(0deg); }
    100% { transform: translate(-50%, -50%) rotate(360deg); }
}
/* 40秒完成一圈 */
```

### 4. 炼丹炉旋转

```css
@keyframes furnaceRotate {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}
/* 10秒完成一圈 */
```

### 5. 火焰闪烁

```css
@keyframes fireFlicker {
    0% { transform: scaleY(1) scaleX(1); opacity: 0.7; }
    100% { transform: scaleY(1.2) scaleX(0.9); opacity: 1; }
}
```

### 6. 烟雾上升

```css
@keyframes smokeRise {
    0% { transform: translateX(-50%) translateY(0) scale(0.5); opacity: 0.5; }
    100% { transform: translateX(-50%) translateY(-50px) scale(2); opacity: 0; }
}
```

***

## 响应式设计

### 断点设置

| 断点         | 圆形半径  | 材料卡片 | 炼丹炉   |
| ---------- | ----- | ---- | ----- |
| >1200px    | 260px | 60px | 180px |
| 768-1200px | 220px | 55px | 160px |
| 480-768px  | 150px | 48px | 130px |
| <480px     | 120px | 42px | 100px |

### 移动端适配

- 按钮改为垂直排列
- 字体大小自动缩放
- 图标和数值尺寸调整

***

## 交互设计

### 材料选择流程

1. 点击圆形材料卡片
2. 显示下拉选择框/输入框
3. 选择后卡片变为激活状态
4. 数值显示在卡片内
5. 炉内显示已选材料chip

### 炼制流程

1. 点击"开始炼制"按钮
2. 显示加载动画(3秒)
3. 加载过程中显示不同提示文字
4. 生成号码并显示结果区域
5. 播放成功音效

***

## 文件结构

```
dlt4/
├── ai_alchemy.html    # 主页面结构
├── ai_alchemy.css     # 样式文件 (约1235行)
├── ai_alchemy.js      # 交互逻辑 (约890行)
└── UI.md              # 本文档
```

***

## 技术栈

- **CSS框架**: Bootstrap 5.3.0
- **图标库**: Bootstrap Icons 1.8.1
- **字体**: 系统字体栈 (-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Microsoft YaHei)
- **动画**: CSS3 Animations + Transitions
- **音效**: Web Audio API

***

## 更新日志

| 日期         | 版本   | 更新内容                       |
| ---------- | ---- | -------------------------- |
| 2026-03-21 | v1.0 | 初始开发，完整炼金术风格UI             |
| 2026-03-21 | v1.1 | 修改为圆形布局，材料围绕炉子排列           |
| 2026-03-21 | v2.0 | 重新设计现代高端UI，采用玻璃态设计         |
| 2026-03-21 | v2.1 | 将Emoji图标替换为Bootstrap Icons |

