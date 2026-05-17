# 企业实训项目

本项目包含两个基于鸿蒙HarmonyOS和ArkUI框架开发的应用，主要用于学习和实践鸿蒙应用开发技术。
DevEco Studio使用的版本为6.0.1.260，虚拟机使用的是HarmonyOS 6.0.1(21).
(吐槽一下版本更新真快，当我在写这篇文档时，DevEco Studio已经更新到了6.0.2.636，虚拟机也更新到了6.0.2(22))

## 项目结构

```
enterprise-training/
├── jilinuniversity-homework/    # 吉林大学作业项目 - ArkUI组件学习演示
└── tkbrush-app/                  # TKBrush刷题应用 - 完整功能应用
```

## 项目介绍

### 1. jilinuniversity-homework（组件学习演示）

这是一个用于学习和演示ArkUI各种组件的项目，包含多个测试页面，涵盖了鸿蒙应用开发的核心组件。

**主要功能模块：**

- **布局组件测试**
  - 弹性布局测试 (FlexTest)
  - 列布局测试 (ColumnTest)
  - 行布局测试 (RowTest)
  - 堆叠布局测试 (StackTest)
  - 滚动组件测试 (ScrollTest)

- **列表与网格**
  - 列表组件测试 (ListTest)
  - 网格组件测试 (GridTest)
  - 轮播图测试 (SwiperTest)

- **容器组件**
  - 标签页组件测试 (TabsTest)

- **基础组件**
  - 边框样式测试 (BorderTest)
  - 边距内边距测试 (MarginPadding)
  - 通用组件测试 (CommonTest)

- **数据与渲染**
  - 数据传递测试 (DataTest)
  - 条件渲染测试 (IfElseTest)
  - 循环渲染测试 (ForEachTest)

- **高级功能**
  - 路由测试 (RouterTest)
  - 构建器测试 (BuilderTest)
  - 方法调用测试 (Method)

- **数据存储**
  - SQLite测试 (SQTest)
  - 首选项存储测试 (PerferencesTest)

### 2. tkbrush-app（刷题应用）

这是一个功能完整的刷题和社区交流应用，提供在线做题、社区讨论等功能。

**主要功能模块：**

- **首页 (Home)**
  - 刷题功能
  - 试卷列表
  - 考试功能
  - 网页浏览

- **消息 (Message)**
  - 消息通知
  - 消息管理

- **额外 (Additional)**
  - 其他扩展功能

- **社区 (Community)**
  - 社区首页
  - 文章详情
  - 发布文章

- **我的 (Mine)**
  - 用户信息
  - 个人设置
  - 关于我们
  - 修改密码
  - 修改昵称

- **登录注册**
  - 用户登录
  - 用户注册
  - 忘记密码

## 技术栈

- **框架**: HarmonyOS ArkUI
- **开发语言**: ArkTS (TypeScript-based)
- **API版本**: HarmonyOS Next
- **构建工具**: Hvigor

## 开发环境要求

- DevEco Studio
- HarmonyOS SDK
- Node.js

## 运行项目

### 1. jilinuniversity-homework

1. 使用DevEco Studio打开 `jilinuniversity-homework` 目录
2. 连接设备或启动模拟器
3. 点击运行按钮编译并安装应用

### 2. tkbrush-app

1. 使用DevEco Studio打开 `tkbrush-app/tkbrush-app` 目录
2. 连接设备或启动模拟器
3. 点击运行按钮编译并安装应用

## 项目特点

- **模块化设计**: 两个项目分别用于学习和实践，结构清晰
- **组件丰富**: 涵盖ArkUI大部分常用组件
- **功能完整**: tkbrush-app提供完整的应用功能实现
- **最佳实践**: 遵循鸿蒙应用开发规范和最佳实践

## 许可证

[MIT](./LICENSE)
