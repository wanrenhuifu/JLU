# Oracle 图书管理系统

基于 React + Vite + TypeScript + Tailwind CSS 的企业级图书管理前端演示项目，展示 Oracle 11g 数据库核心特性。

## 技术栈

- **框架**: React 19 + Vite 7
- **语言**: TypeScript (严格模式)
- **样式**: Tailwind CSS + shadcn/ui
- **路由**: React Router v7
- **可视化**: Three.js (WebGL 波浪动画)
- **图标**: Lucide React

## 功能特性

- 📚 图书管理与分类
- 🔄 借阅与归还流程
- 👤 用户管理（管理员/普通用户）
- 🛠️ SQL 工作台（模拟 Oracle SQL 执行）
- 📊 Oracle 数据库特性展示（表空间、主键、外键、触发器、存储过程等）
- 🔍 审计日志（SQL 执行记录与执行计划）
- 💾 localStorage 数据持久化

## 快速开始

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览生产构建
npm run preview
```

## 默认账号

| 角色     | 用户名 | 密码   |
|----------|--------|--------|
| 管理员   | admin  | admin  |
| 普通用户 | 李明   | 123456 |

> 密码采用 Base64 编码存储，前端验证时自动加密比对。

## 项目结构

```
src/
  components/     # 通用可复用组件
    ui/           # shadcn/ui 基础组件
  pages/          # 页面级组件
  sections/       # 首页/Landing 区块
  modules/        # 业务功能模块
    books/        # 图书管理
    borrows/      # 借阅管理
    users/        # 用户管理
  contexts/       # React Context（审计日志等）
  data/           # 初始数据与 localStorage 工具
  hooks/          # 自定义 Hooks
  lib/            # 工具函数
  types/          # TypeScript 类型定义

public/
  images/         # 静态图片资源
```

## 许可证

[MIT](../LICENSE)
