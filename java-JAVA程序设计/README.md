# JAVA 程序设计

## 项目简介

本项目是吉林大学**JAVA 程序设计**课程的作业，实现了一个简易的 **MUD（Multi-User Dungeon）** 多人文字冒险游戏，包含服务端和客户端两部分。

游戏设定在一个奇幻世界中，包含城镇、森林、洞穴、龙穴等 14 个相互连接的场景。玩家可以在世界中探索、拾取物品、与 NPC 对话、学习武功、进行战斗，并与其他在线玩家实时交流。

## 技术栈

- **语言**：Java（JDK 8+）
- **网络通信**：Socket（BIO 模型）
- **数据存储**：文件（玩家数据持久化）
- **并发**：多线程 + ConcurrentHashMap

## 项目结构

```text
java-JAVA程序设计/
├── README.md
├── 新建 文本文档.txt              # 课程作业要求（原始）
├── compile.bat                   # Windows 编译脚本
├── run-server.bat                # Windows 启动服务器
├── run-client.bat                # Windows 启动客户端
├── data/                         # 运行时数据（自动生成）
│   └── players.dat               # 玩家存档
└── src/
    └── mudgame/
        ├── model/                # 数据模型
        │   ├── Direction.java    # 方向枚举（10 方向）
        │   ├── Item.java         # 物品（可拾取/丢弃）
        │   ├── KungFu.java       # 武功技能
        │   ├── NPC.java          # NPC（对话/走动/战斗）
        │   ├── Player.java       # 玩家状态
        │   └── Room.java         # 房间/场景
        ├── server/               # 服务端
        │   ├── MudServer.java    # 主服务器（端口监听、登录）
        │   ├── ClientHandler.java # 客户端处理线程（命令解析）
        │   └── GameWorld.java    # 游戏世界初始化
        ├── client/               # 客户端
        │   └── MudClient.java    # 终端交互客户端
        └── util/                 # 工具
            └── PlayerDB.java     # 玩家数据持久化
```

## 游戏世界

### 场景（14 个房间）

```
                  女巫小屋
                     |
                  墓地
                     |
神庙 —— 城镇广场 —— 酒馆 —— 河岸 —— 古桥
          |    \
       铁匠铺  林间小路
          |       |
       药铺    密林深处
                /     \
             山道    洞穴入口
                        |
                      龙穴
```

### 物品

| 物品 | 位置 | 用途 |
|:-----|:-----|:-----|
| 铁剑 | 铁匠铺 | 收藏 |
| 生命药剂 | 药铺 | 恢复 30 HP |
| 魔法护符 | 神庙 | 收藏 |
| 金袋 | 洞穴入口 | 收藏 |
| 哥布林匕首 | 哥布林掉落 | 收藏 |

### NPC

| NPC | 位置 | 特性 |
|:----|:-----|:-----|
| 旅行商人 | 城镇广场 | 对话 |
| 老巫师 | 神庙 | 对话，可教授武功 |
| 哥布林 | 墓地 | 会战斗，掉落匕首 |

### 武功

| 武功 | 伤害 | 获取方式 |
|:-----|:-----|:---------|
| 龙拳 | 25 | 找老巫师 learn 龙拳 |
| 影步 | 20 | 探索发现 |
| 雷霆掌 | 30 | 探索发现 |

## 功能特性

### 基本功能（全部实现）

- ✅ 同时支持多人在线游戏
- ✅ 创建虚拟世界（14 个互联场景）
- ✅ 玩家可在虚拟世界中移动（10 个方向：n/s/e/w/ne/se/nw/sw/u/d）
- ✅ 玩家动作对同房间其他玩家可见
- ✅ 基本动作：查看（look）、退出（quit）
- ✅ 玩家账户信息文件持久化

### 可扩展功能（全部实现）

- ✅ 物品系统（get / drop / use）
- ✅ 群聊（chat）与私聊（tell），查看在线玩家（who）
- ✅ NPC 随机走动与玩家交互（每 30 秒自动走动）
- ✅ 武功系统与打斗（fight 命令）
- ✅ 玩家状态（hp），退出后保存

## 运行说明

### 环境要求

- JDK 8 或更高版本
- 确保 `java` 和 `javac` 在系统 PATH 中

### 编译

```bash
# Windows（双击 compile.bat 或在终端执行）
compile.bat

# 或手动编译
javac -encoding UTF-8 -d out src/mudgame/model/*.java src/mudgame/util/*.java src/mudgame/server/*.java src/mudgame/client/*.java
```

### 启动服务器

```bash
# Windows（双击 run-server.bat 或在终端执行）
run-server.bat

# 或手动启动（默认端口 8888）
java -Dfile.encoding=UTF-8 -cp out mudgame.server.MudServer

# 指定端口
java -Dfile.encoding=UTF-8 -cp out mudgame.server.MudServer 9999
```

### 启动客户端

```bash
# Windows（双击 run-client.bat 或在终端执行）
run-client.bat

# 或手动启动（默认连接 localhost:8888）
java -Dfile.encoding=UTF-8 -cp out mudgame.client.MudClient

# 指定服务器地址和端口
java -Dfile.encoding=UTF-8 -cp out mudgame.client.MudClient 192.168.1.100 9999
```

### 游戏命令速查

| 类别 | 命令 | 说明 |
|:-----|:-----|:-----|
| 移动 | `n` `s` `e` `w` `ne` `se` `nw` `sw` `u` `d` | 向指定方向移动 |
| 查看 | `look` / `l` | 查看当前房间 |
| 状态 | `hp` / `status` | 查看玩家状态 |
| 背包 | `inventory` / `i` | 查看背包物品 |
| 物品 | `get <物品>` | 捡起物品 |
| 物品 | `drop <物品>` | 丢弃物品 |
| 物品 | `use <物品>` | 使用物品 |
| 交流 | `chat <消息>` | 向同房间玩家喊话 |
| 交流 | `tell <玩家> <消息>` | 私聊 |
| 交流 | `who` | 查看在线玩家 |
| NPC | `talk <NPC>` | 与 NPC 对话 |
| NPC | `learn <武功>` | 向老巫师学习武功 |
| 战斗 | `fight <NPC> [武功]` | 与 NPC 战斗 |
| 系统 | `help` | 查看命令列表 |
| 系统 | `quit` | 退出游戏 |

## 实现亮点

1. **多线程并发**：每玩家独立线程，使用 ConcurrentHashMap 保证线程安全
2. **NPC AI**：NPC 每 30 秒随机走动，玩家可见移动过程
3. **战斗系统**：支持普通攻击和武功攻击，NPC 会反击，死亡后复活
4. **持久化**：玩家 HP、背包、武功、位置在退出时自动保存
5. **模块化设计**：model/server/client/util 四层分离，职责清晰
6. **面向对象**：充分运用继承、封装、多态，如 Direction 枚举、Player/NPC 实体建模

## 类图

```
Direction (enum)         Item              KungFu
    │                      │                  │
    ▼                      ▼                  ▼
  Room ◄───────────── Player ◄─────── NPC
    │                      │                  │
    │                      ▼                  │
    │               ClientHandler             │
    │                      │                  │
    ▼                      ▼                  ▼
GameWorld ◄────────── MudServer         PlayerDB
                              │
                              ▼
                         MudClient
```

## 许可证

[MIT](../LICENSE)
