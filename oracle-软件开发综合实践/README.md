# Oracle 图书管理系统

## 项目简介

本项目是吉林大学软件开发综合实践课程的作业，基于 React + Vite + TypeScript + Tailwind CSS 的企业级图书管理前端演示项目，展示 Oracle 11g 数据库核心特性。

## 注意事项
### **瞒天过海**
这只是模拟Oracle数据库的图书管理系统，不是真正的。Oracle是一个很糟糕的数据库。
### 我的吐槽
- 刚开学我加了小组后准备开摆，直到答辩前两个星期我才得知我是组长。
- 我完全不知道是谁，什么时候，在哪里填的小组成员表格。小组成员名字也有错误。
- 我找了很久没找到完整的课程文档，只找到报告模板。
- 做这个课程项目时我一肚子火，像被逼着吃了一百万斤答辩。
### 账号登陆
**默认账号**

| 角色     | 用户名 | 密码   |
|:---------|:-------|:-------|
| 管理员   | admin  | admin  |
| 普通用户 | 李明   | 123456 |

点击小方框可以一键自动填入用户名和密码。
> 密码采用 Base64 编码存储，前端验证时自动加密比对。

## 技术栈

- **框架**：React 19 + Vite 7
- **语言**：TypeScript（严格模式）
- **样式**：Tailwind CSS + shadcn/ui
- **路由**：React Router v7
- **可视化**：Three.js（WebGL 波浪动画）
- **图标**：Lucide React

## 项目结构

```text
.
├── src/                 # 源代码目录
│   components/          # 通用可复用组件
│     ui/                # shadcn/ui 基础组件
│   pages/               # 页面级组件
│   sections/            # 首页/Landing 区块
│   modules/             # 业务功能模块
│     books/             # 图书管理
│     borrows/           # 借阅管理
│     users/             # 用户管理
│   contexts/            # React Context（审计日志等）
│   data/                # 初始数据与 localStorage 工具
│   hooks/               # 自定义 Hooks
│   lib/                 # 工具函数
│   types/               # TypeScript 类型定义
├── public/              # 静态资源目录
│   images/              # 静态图片资源
└── 课程文档/             # 课程相关文档（项目说明书模板等）
```

## 功能特性

- 图书管理与分类
- 借阅与归还流程
- 用户管理（管理员/普通用户）
- SQL 工作台（模拟 Oracle SQL 执行）
- Oracle 数据库特性展示（表空间、主键、外键、触发器、存储过程等）
- 审计日志（SQL 执行记录与执行计划）
- localStorage 数据持久化

## 运行说明

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

## 许可证

[MIT](../LICENSE)
