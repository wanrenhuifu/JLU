# 模拟即时通信系统（C++课程设计）

## 项目简介

本项目是吉林大学软件学院**面向对象程序设计（C++）**课程设计作业。基于 C++ 实现了一个模拟即时通信系统，模拟腾讯系社交平台（QQ、微信、微博等）的整合与统一管理，涵盖用户管理、好友管理、群管理、开通管理、登录管理及 TCP 点对点通信等核心功能。

## 技术栈

- **编程语言**：C++（面向对象编程）
- **开发范式**：抽象、封装、继承、多态
- **数据持久化**：文件 I/O（`data/users.txt`、`data/groups.txt`）
- **网络通信**：Winsock2（TCP Socket，选做）
- **编码支持**：UTF-8

## 项目结构

```text
oop-面向对象程序设计/
├── data/
│   ├── users.txt              # 用户数据文件
│   └── groups.txt             # 群组数据文件
├── main.cpp                   # 程序入口
├── ConsoleUIZhs.cpp/.h        # 控制台中文交互界面
├── FileManagerZhs.cpp/.h      # 文件读写管理
├── FriendInfoZhs.cpp/.h       # 好友信息类
├── GroupBaseZhs.cpp/.h        # 群组基类（抽象类）
├── MicroServiceBaseZhs.cpp/.h # 微服务基类
├── PlatformManagerZhs.cpp/.h  # 平台统一管理器
├── QQGroupZhs.cpp/.h          # QQ 群（继承 GroupBase）
├── QQUserZhs.cpp/.h           # QQ 用户
├── TcpChatZhs.cpp/.h          # TCP 点对点聊天（选做）
├── UserBaseZhs.cpp/.h         # 用户基类（抽象类）
├── WeChatGroupZhs.cpp/.h      # 微信群
├── WeChatUserZhs.cpp/.h       # 微信用户
├── WeiboUserZhs.cpp/.h        # 微博用户
├── WeiXUserZhs.cpp/.h         # 微X 通用用户
├── ChatSystem.exe             # 编译后的可执行文件
└── 2024年软件学院c++课程设计.md  # 课程设计文档
```

## 功能特性

### 1. 用户基本信息管理
- 号码 ID、昵称、出生时间、T 龄（申请时间）、所在地
- 好友列表、群列表
- 微博与 QQ 共享 ID；微信独立 ID，支持与 QQ 绑定

### 2. 好友管理
- 好友信息的添加、修改、删除、查询
- 跨服务共同好友查询（如微信可添加 QQ 推荐好友）

### 3. 群管理
- 预设群号：1001、1002、1003、1004、1005、1006
- 加入群、退出群、踢出成员、查询群成员
- 支持不同平台群特色：
  - **QQ 群**：申请加入、子群（临时讨论组）、管理员制度
  - **微信群**：推荐加入、无子群、仅群主特权
- 动态群类型转换（在不伤害群成员数据的前提下切换管理模式）

### 4. 开通管理
- 用户可选择开通平台内的 N 个微X 服务（QQ、微信、微博等）

### 5. 登录管理
- 单点登录：任意一个服务登录后，其他已开通服务经简单确认后自动登录

### 6. TCP 点对点通信（选做）
- 基于 Winsock2 实现 QQ 风格的 TCP 收发功能

## 运行说明

### 编译运行

```bash
# 使用 g++ 编译（Windows + MinGW）
g++ -o ChatSystem main.cpp ConsoleUIZhs.cpp FileManagerZhs.cpp FriendInfoZhs.cpp \
    GroupBaseZhs.cpp MicroServiceBaseZhs.cpp PlatformManagerZhs.cpp QQGroupZhs.cpp \
    QQUserZhs.cpp TcpChatZhs.cpp UserBaseZhs.cpp WeChatGroupZhs.cpp WeChatUserZhs.cpp \
    WeiboUserZhs.cpp WeiXUserZhs.cpp -lws2_32

# 运行
ChatSystem.exe
```

### 数据初始化
- 系统启动时自动从 `data/users.txt` 和 `data/groups.txt` 加载数据
- 程序退出时将内存数据写回文件，实现断电保存

## 设计层次

| 层次 | 要求 |
|------|------|
| 基本层次 | 完成全部功能要求 |
| 支持对象层次 | 正确进行类的切割，利用对象技术实现 |
| 抽象封装层次 | 采用继承/组合复用，提供必要接口保护 |
| 面向对象层次 | 支持多态，依据设计原则优化 |
| 优化提高层次 | 提供数字菜单交互、文件 I/O 持久化 |

## 许可证

[MIT](../LICENSE)
