# Gobang

## 项目简介

**Gobang** 是一个基于 TypeScript 和 HTML5 Canvas 实现的五子棋游戏，支持玩家与多种类型的 AI 对战。AI 实现涵盖从基础的极小极大算法到基于神经网络与强化学习的高级对手。

你可以通过以下链接直接体验：

- 🔘 [极小极大算法版本](https://hyjwpk.github.io/Gobang)
- 🔬 [AlphaAI 神经网络版本](https://hyjwpk.github.io/Gobang/alpha)

## 功能特性

- 🎮 **人机对战**：玩家可以与多种 AI 算法进行对弈。
- 🧠 **内置 AI 算法**：
  - `RandomAI`：随机走子
  - `SimpleAI`：基于评分函数
  - `MiniMaxAI`：极小极大搜索与 Alpha-Beta 剪枝
  - `AlphaAI`：基于神经网络 + 强化学习 + MCTS（AlphaZero 风格）
- ↩️ **悔棋功能**：可撤销最近两步棋。
- 🔄 **先手切换**：支持切换由玩家或 AI 先手。
- 🔢 **棋子编号显示**：可选显示每步落子编号。
- 📐 **响应式棋盘**：根据窗口尺寸自动适配棋盘大小。

## 文件结构

```
Gobang/
├── index.html             # 默认页面（MiniMaxAI 对战）
├── alpha.html             # AlphaAI 对战页面
├── src/                   # 源码目录
│   ├── AIs/               # 各类 AI 算法实现
│   ├── Controllers/       # 游戏控制逻辑
│   ├── Models/            # 数据结构定义
│   ├── Shapes/            # 棋盘/棋子绘制类
│   ├── Views/             # 视图渲染
│   ├── config.ts          # 配置文件
│   ├── main.ts            # MiniMax 主入口
│   ├── main_alpha.ts      # AlphaAI 主入口
├── dist/                  # 构建后输出文件
├── package.json           # 项目依赖与构建脚本
├── tsconfig.json          # TypeScript 配置
├── .gitignore             # Git 忽略规则
```

## 安装与运行

### 环境要求

- Node.js
- TypeScript

### 安装依赖

```bash
npm install
```

### 构建项目

```bash
npm run build
```

### 混淆压缩代码

```bash
npm run obfuscate
```

> 使用 [terser](https://github.com/terser/terser) 对编译后的 JS 代码进行压缩与混淆。

## AI 算法说明

### `RandomAI`

随机从可落子位置中选择。

### `SimpleAI`

通过简单评分函数评估空位，选取得分最高的落子位置。

### `MiniMaxAI`

使用极小极大搜索算法预测未来局势，选择当前最优解。

### `AlphaAI`

基于强化学习训练的神经网络策略，结合蒙特卡洛树搜索（MCTS）进行推理。模型训练参考：[AlphaZero_Gobang](https://github.com/hyjwpk/AlphaZero_Gobang)