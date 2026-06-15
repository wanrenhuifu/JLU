# JLU 课程作业合集

吉林大学软件工程专业课程作业整合仓库，汇集本科期间各门课程的作业、课程设计和大作业项目。

## 项目概览

| 模块 | 课程 | 技术栈 |
|:------|:-----|:-------|
| `uml-统一建模语言` | 统一建模语言及工具 | PlantUML, Markdown |
| `harmonyos-鸿蒙实训` | 鸿蒙实训 | ArkTS, HarmonyOS ArkUI |
| `data-viz-数据可视化` | 数据可视化 | Python, OpenCV, NumPy |
| `ml-机器学习` | 机器学习 | Python, scikit-learn, TensorFlow, NLTK |
| `qt-基于Qt的跨平台软件编程` | 基于 Qt 的跨平台软件编程 | Python, PyQt5 |
| `sa-软件体系结构` | 软件体系结构 | Markdown, Mermaid |
| `oracle-软件开发综合实践` | 软件开发综合实践 | React 19, Vite, TypeScript, Tailwind CSS |
| `oop-面向对象程序设计` | 面向对象程序设计（C++） | C++, Winsock2 |
| `os-操作系统课程设计` | 操作系统课程设计 | TypeScript, Vite, Canvas 2D |
| `sqat-软件质量保证与测试` | 软件质量保证与测试 | Markdown, Mermaid |
| `pr-模式识别` | 模式识别 | 待补充 |
| `java-JAVA程序设计` | JAVA 程序设计 | Java (MUD 游戏开发) |

## 常用命令

### Python 项目

```bash
# 数据可视化 — 一键运行所有 task
cd data-viz-数据可视化 && python run_all.py

# 机器学习 — 各子项目独立运行
cd ml-机器学习/finalwork && python svm_mnist.py
cd ml-机器学习/ml1/ml1 && python housing_regression.py

# EasyWord
cd qt-基于Qt的跨平台软件编程 && python EasyWord.py
```

### Node.js / Web 项目

```bash
# Oracle 图书管理系统
cd oracle-软件开发综合实践 && npm install && npm run dev

# OS 课程设计
cd os-操作系统课程设计/os-course-design && npm install && npm run dev
```

### C++ 项目

```bash
# OOP 即时通信系统（Windows + MinGW）
cd oop-面向对象程序设计
g++ -o ChatSystem main.cpp ConsoleUIZhs.cpp FileManagerZhs.cpp FriendInfoZhs.cpp \
    GroupBaseZhs.cpp MicroServiceBaseZhs.cpp PlatformManagerZhs.cpp QQGroupZhs.cpp \
    QQUserZhs.cpp TcpChatZhs.cpp UserBaseZhs.cpp WeChatGroupZhs.cpp WeChatUserZhs.cpp \
    WeiboUserZhs.cpp WeiXUserZhs.cpp -lws2_32
```

### UML 图表生成

```bash
cd uml-统一建模语言
java -jar plantuml.jar <puml文件路径>
```

### HarmonyOS 项目

使用 DevEco Studio 6.0.1+ 打开 `harmonyos-鸿蒙实训/` 下的子项目目录，连接设备或模拟器后运行。

## 架构说明

- 每个模块目录独立自治，有各自的 README.md 和依赖管理
- 全部模块统一采用 [MIT](LICENSE) 许可证
- `课程文档/` 子目录存放课程原始材料（题目、模板、要求等），不包含代码
- `node_modules/`、`dist/`、`__pycache__/` 等构建产物已通过 `.gitignore` 排除

## 子项目 README 规范

每个子项目的 `README.md` 必须遵循以下统一格式，按顺序包含以下章节：

```markdown
# <课程全称>

## 项目简介
<!-- 1-3 句话：哪门课、什么项目、做什么。-->

## 注意事项
<!-- 可选。有则写，无则跳过。记录踩坑、兼容性、已知问题等。-->

## 技术栈
<!-- 列表：语言、框架、关键依赖。格式：- **分类**：具体技术-->

## 项目结构
<!-- 代码块包裹的目录树，关键文件加注释。-->

## 功能特性
<!-- 表格或列表，概述主要功能点。-->

## 运行说明
<!-- 代码项目用"运行说明"：安装依赖 → 编译 → 运行。-->

<!-- 纯文档项目用"使用说明"：推荐工具、阅读顺序。-->

## 许可证
<!-- 统一： [MIT](../LICENSE) -->
```

### 章节规范

| 章节 | 要求 |
|:-----|:-----|
| 标题 (`#`) | 使用课程全称，与主 README 表格中的"课程"列一致。不加"大作业""期末"等修饰词 |
| 项目简介 | 1-3 句话，说明所属课程、项目性质、核心内容 |
| 注意事项 | 可选章节。有实际注意点则写，无则不写。使用 bullet 列表 |
| 技术栈 | 必选。`- **分类**：技术名` 格式。分类如：语言、框架、构建工具、核心库 |
| 项目结构 | 必选。用 ` ```text ` 代码块包裹的目录树，关键文件/目录后加 `# 注释` |
| 功能特性 | 必选。优先用表格，简单列表也可。概述项目实现的主要功能 |
| 运行说明 | 必选。代码项目用"运行说明"：安装→编译→运行。文档项目用"使用说明"：推荐工具、阅读方式 |
| 许可证 | 必选。统一 `[MIT](../LICENSE)`，不写其他内容 |

### 代码项目 vs 文档项目

- **代码项目**（uml, harmonyos, data-viz, ml, qt, oracle, oop, os）：使用 `## 运行说明`，给出具体命令
- **文档项目**（sa, sqat）：使用 `## 使用说明`，给出推荐阅读方式
- **占位项目**（pr, java）：保持标准结构，标注"待补充"
