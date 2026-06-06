/**
 * @file main.cpp
 * @brief 模拟即时通信系统主程序
 * 
 * 课程设计：模拟即时通信系统实现
 * 技术层次：面向对象、继承、多态、抽象封装、文件I/O、菜单系统
 */

#include <iostream>
#include <string>
#include <vector>
#include <cstdlib>
#include <fstream>
#include "PlatformManagerZhs.h"
#include "FileManagerZhs.h"
#include "TcpChatZhs.h"
#include <windows.h>
#include "ConsoleUIZhs.h"

using namespace std;

// ========== 全局对象 ==========
PlatformManagerZhs g_platform;
FileManagerZhs g_fileMgr;

// ========== 前置声明 ==========
void initData();
void mainMenu();
void loginMenu();
void serviceMenu();
void friendMenu();
void groupMenu();
void featureMenu();
void tcpChatMenu();
void pause();



// ========== 初始化预设数据 ==========
void initData() {
    // 如果数据文件不存在，创建预设数据
    ifstream uf("data/users.txt");
    if (!uf.is_open()) {
        cout << "[系统] 首次运行，创建预设数据..." << endl;
        // 预设用户和服务
        g_platform.openQQService("10001", "小明", "1998-05-20", "2010-01-01", "北京");
        g_platform.openWeiboService("10001", "小明", "1998-05-20", "2010-01-01", "北京");
        g_platform.openWeChatService("10001", "wx_ming", "小明", "1998-05-20", "2012-06-01", "北京");

        g_platform.openQQService("10002", "小红", "1999-08-15", "2011-03-10", "上海");
        g_platform.openWeChatService("10002", "wx_hong", "小红", "1999-08-15", "2013-09-01", "上海");

        g_platform.openQQService("10003", "小刚", "1997-12-01", "2009-07-20", "广州");
        g_platform.openQQService("10004", "小丽", "2000-01-10", "2015-02-14", "深圳");

        // 预设好友关系
        MicroServiceBaseZhs* u1qq = g_platform.getService("10001", "QQ");
        MicroServiceBaseZhs* u2qq = g_platform.getService("10002", "QQ");
        MicroServiceBaseZhs* u3qq = g_platform.getService("10003", "QQ");
        MicroServiceBaseZhs* u1wx = g_platform.getService("10001", "微信");
        MicroServiceBaseZhs* u2wx = g_platform.getService("10002", "微信");
        MicroServiceBaseZhs* u1wb = g_platform.getService("10001", "微博");

        if (u1qq && u2qq) u1qq->addFriend(FriendInfoZhs("10002", "小红", "同学", "QQ"));
        if (u1qq && u3qq) u1qq->addFriend(FriendInfoZhs("10003", "小刚", "球友", "QQ"));
        if (u2qq && u3qq) u2qq->addFriend(FriendInfoZhs("10003", "小刚", "同事", "QQ"));
        if (u1wx && u2wx) u1wx->addFriend(FriendInfoZhs("10002", "小红", "闺蜜", "微信"));
        if (u1wb) u1wb->addFriend(FriendInfoZhs("10002", "小红", "关注", "微博"));

        // 预设群
        g_platform.createQQGroup("1001", "C++学习群", "10001");
        g_platform.createQQGroup("1002", "游戏开黑群", "10003");
        g_platform.createWeChatGroup("1003", "家庭群", "10001");
        g_platform.createWeChatGroup("1004", "工作群", "10002");

        // 用户加入群
        GroupBaseZhs* g1 = g_platform.getGroup("1001");
        if (g1) {
            g1->addMember("10002");
            g1->addMember("10003");
            u1qq->joinGroup("1001");
            u2qq->joinGroup("1001");
            u3qq->joinGroup("1001");
            QQGroupZhs* qqg = dynamic_cast<QQGroupZhs*>(g1);
            if (qqg) qqg->addAdmin("10001", "10003");
        }
        GroupBaseZhs* g2 = g_platform.getGroup("1002");
        if (g2) {
            g2->addMember("10001");
            g2->addMember("10004");
            u1qq->joinGroup("1002");
        }
        GroupBaseZhs* g3 = g_platform.getGroup("1003");
        if (g3) {
            g3->addMember("10002");
            u1wx->joinGroup("1003");
            u2wx->joinGroup("1003");
        }

        g_fileMgr.saveData(g_platform);
        ConsoleUIZhs::printSuccess("  [系统] 预设数据创建完成！\n");
    } else {
        uf.close();
        g_fileMgr.loadData(g_platform);
    }
}

// ========== 主菜单 ==========
void mainMenu() {
    const int W = 56;
    while (true) {
        ConsoleUIZhs::clearScreen();
        string status = g_platform.isPlatformLoggedIn()
            ? "已登录 [" + g_platform.getCurrentUserId() + "]"
            : "未登录";
        ConsoleUIZhs::drawTopBorder(W, "腾*立体社交平台 - 主菜单");
        ConsoleUIZhs::drawLine(W, "");
        ConsoleUIZhs::drawLine(W, "  当前状态: " + status);
        ConsoleUIZhs::drawLine(W, "");
        ConsoleUIZhs::drawMenuItem(W, 1, "平台初始化与登录管理");
        ConsoleUIZhs::drawMenuItem(W, 2, "服务开通管理");
        ConsoleUIZhs::drawMenuItem(W, 3, "好友管理");
        ConsoleUIZhs::drawMenuItem(W, 4, "群管理");
        ConsoleUIZhs::drawMenuItem(W, 5, "特色功能展示");
        ConsoleUIZhs::drawMenuItem(W, 6, "选做：QQ点对点TCP通信");
        ConsoleUIZhs::drawMenuItem(W, 0, "保存数据并退出");
        ConsoleUIZhs::drawLine(W, "");
        ConsoleUIZhs::drawBottomBorder(W);
        ConsoleUIZhs::printInfo("\n  请输入选项: ");

        int choice;
        cin >> choice;
        switch (choice) {
            case 1: loginMenu(); break;
            case 2: serviceMenu(); break;
            case 3: friendMenu(); break;
            case 4: groupMenu(); break;
            case 5: featureMenu(); break;
            case 6: tcpChatMenu(); break;
            case 0:
                ConsoleUIZhs::clearScreen();
                g_fileMgr.saveData(g_platform);
                ConsoleUIZhs::printSuccess("\n  [系统] 数据已保存，感谢使用，再见！\n\n");
                return;
            default:
                ConsoleUIZhs::printError("\n  [错误] 无效选项！\n");
                ConsoleUIZhs::pause();
        }
    }
}

// ========== 登录菜单 ==========
void loginMenu() {
    const int W = 56;
    while (true) {
        ConsoleUIZhs::clearScreen();
        ConsoleUIZhs::drawTopBorder(W, "平台初始化与登录管理");
        ConsoleUIZhs::drawLine(W, "");
        ConsoleUIZhs::drawMenuItem(W, 1, "登录服务");
        ConsoleUIZhs::drawMenuItem(W, 2, "退出登录");
        ConsoleUIZhs::drawMenuItem(W, 3, "查看当前登录状态");
        ConsoleUIZhs::drawMenuItem(W, 4, "重新加载数据（初始化）");
        ConsoleUIZhs::drawMenuItem(W, 0, "返回主菜单");
        ConsoleUIZhs::drawLine(W, "");
        ConsoleUIZhs::drawBottomBorder(W);
        ConsoleUIZhs::printInfo("\n  请输入选项: ");

        int choice;
        cin >> choice;
        if (choice == 0) return;

        string uid, svc;
        switch (choice) {
            case 1: {
                ConsoleUIZhs::printInfo("  请输入用户ID: ");
                cin >> uid;
                ConsoleUIZhs::printInfo("  请输入服务名（QQ/微信/微博）: ");
                cin >> svc;
                g_platform.login(uid, svc);
                break;
            }
            case 2: {
                ConsoleUIZhs::printInfo("  请输入要退出的用户ID: ");
                cin >> uid;
                g_platform.logout(uid);
                break;
            }
            case 3: {
                g_platform.listAllServices();
                break;
            }
            case 4: {
                g_platform.clearAll();
                initData();
                ConsoleUIZhs::printSuccess("\n  [成功] 数据已重新加载！\n");
                break;
            }
            default:
                ConsoleUIZhs::printError("\n  [错误] 无效选项！\n");
        }
        ConsoleUIZhs::pause();
    }
}

// ========== 服务开通菜单 ==========
void serviceMenu() {
    const int W = 56;
    while (true) {
        ConsoleUIZhs::clearScreen();
        ConsoleUIZhs::drawTopBorder(W, "服务开通管理");
        ConsoleUIZhs::drawLine(W, "");
        ConsoleUIZhs::drawMenuItem(W, 1, "开通QQ服务");
        ConsoleUIZhs::drawMenuItem(W, 2, "开通微信服务");
        ConsoleUIZhs::drawMenuItem(W, 3, "开通微博服务");
        ConsoleUIZhs::drawMenuItem(W, 4, "开通其他微X服务");
        ConsoleUIZhs::drawMenuItem(W, 5, "查看已开通服务");
        ConsoleUIZhs::drawMenuItem(W, 0, "返回主菜单");
        ConsoleUIZhs::drawLine(W, "");
        ConsoleUIZhs::drawBottomBorder(W);
        ConsoleUIZhs::printInfo("\n  请输入选项: ");

        int choice;
        cin >> choice;
        if (choice == 0) return;

        string uid, nick, birth, reg, loc, wxid, pname;
        switch (choice) {
            case 1: {
                ConsoleUIZhs::printInfo("  请输入QQ号(ID): "); cin >> uid;
                ConsoleUIZhs::printInfo("  请输入昵称: "); cin >> nick;
                ConsoleUIZhs::printInfo("  请输入出生日期(YYYY-MM-DD): "); cin >> birth;
                ConsoleUIZhs::printInfo("  请输入注册日期(YYYY-MM-DD): "); cin >> reg;
                ConsoleUIZhs::printInfo("  请输入所在地: "); cin >> loc;
                g_platform.openQQService(uid, nick, birth, reg, loc);
                break;
            }
            case 2: {
                ConsoleUIZhs::printInfo("  请输入绑定QQ号: "); cin >> uid;
                ConsoleUIZhs::printInfo("  请输入微信号: "); cin >> wxid;
                ConsoleUIZhs::printInfo("  请输入昵称: "); cin >> nick;
                ConsoleUIZhs::printInfo("  请输入出生日期(YYYY-MM-DD): "); cin >> birth;
                ConsoleUIZhs::printInfo("  请输入注册日期(YYYY-MM-DD): "); cin >> reg;
                ConsoleUIZhs::printInfo("  请输入所在地: "); cin >> loc;
                g_platform.openWeChatService(uid, wxid, nick, birth, reg, loc);
                break;
            }
            case 3: {
                ConsoleUIZhs::printInfo("  请输入微博ID: "); cin >> uid;
                ConsoleUIZhs::printInfo("  请输入昵称: "); cin >> nick;
                ConsoleUIZhs::printInfo("  请输入出生日期(YYYY-MM-DD): "); cin >> birth;
                ConsoleUIZhs::printInfo("  请输入注册日期(YYYY-MM-DD): "); cin >> reg;
                ConsoleUIZhs::printInfo("  请输入所在地: "); cin >> loc;
                g_platform.openWeiboService(uid, nick, birth, reg, loc);
                break;
            }
            case 4: {
                ConsoleUIZhs::printInfo("  请输入产品名称(如微商/微唱): "); cin >> pname;
                ConsoleUIZhs::printInfo("  请输入用户ID: "); cin >> uid;
                ConsoleUIZhs::printInfo("  请输入昵称: "); cin >> nick;
                ConsoleUIZhs::printInfo("  请输入出生日期(YYYY-MM-DD): "); cin >> birth;
                ConsoleUIZhs::printInfo("  请输入注册日期(YYYY-MM-DD): "); cin >> reg;
                ConsoleUIZhs::printInfo("  请输入所在地: "); cin >> loc;
                g_platform.openWeiXService(uid, pname, nick, birth, reg, loc);
                break;
            }
            case 5: {
                g_platform.listAllServices();
                break;
            }
            default:
                ConsoleUIZhs::printError("\n  [错误] 无效选项！\n");
        }
        ConsoleUIZhs::pause();
    }
}

// ========== 好友管理菜单 ==========
void friendMenu() {
    const int W = 56;
    while (true) {
        ConsoleUIZhs::clearScreen();
        ConsoleUIZhs::drawTopBorder(W, "好友管理");
        ConsoleUIZhs::drawLine(W, "");
        ConsoleUIZhs::drawMenuItem(W, 1, "添加好友（同服务）");
        ConsoleUIZhs::drawMenuItem(W, 2, "删除好友");
        ConsoleUIZhs::drawMenuItem(W, 3, "修改好友备注");
        ConsoleUIZhs::drawMenuItem(W, 4, "查询好友列表");
        ConsoleUIZhs::drawMenuItem(W, 5, "查看共同好友");
        ConsoleUIZhs::drawMenuItem(W, 6, "跨服务推荐好友并添加");
        ConsoleUIZhs::drawMenuItem(W, 0, "返回主菜单");
        ConsoleUIZhs::drawLine(W, "");
        ConsoleUIZhs::drawBottomBorder(W);
        ConsoleUIZhs::printInfo("\n  请输入选项: ");

        int choice;
        cin >> choice;
        if (choice == 0) return;

        string uid, svc, fid, remark, svc2;
        MicroServiceBaseZhs* u = nullptr;

        switch (choice) {
            case 1: {
                ConsoleUIZhs::printInfo("  请输入你的用户ID: "); cin >> uid;
                ConsoleUIZhs::printInfo("  请输入服务名（QQ/微信/微博）: "); cin >> svc;
                ConsoleUIZhs::printInfo("  请输入要添加的好友ID: "); cin >> fid;
                ConsoleUIZhs::printInfo("  请输入备注: "); cin >> remark;
                u = g_platform.getService(uid, svc);
                if (u) {
                    MicroServiceBaseZhs* target = nullptr;
                    for (auto& pair : g_platform.getServicesMap()) {
                        if (pair.second->getId() == fid && pair.second->getServiceName() == svc) {
                            target = pair.second;
                            break;
                        }
                    }
                    if (target) {
                        u->addFriend(FriendInfoZhs(fid, target->getNickname(), remark, svc));
                        ConsoleUIZhs::printSuccess("\n  [成功] 添加好友成功！\n");
                    } else {
                        ConsoleUIZhs::printError("\n  [错误] 未找到该用户！\n");
                    }
                } else {
                    ConsoleUIZhs::printError("\n  [错误] 服务未开通！\n");
                }
                break;
            }
            case 2: {
                ConsoleUIZhs::printInfo("  请输入你的用户ID: "); cin >> uid;
                ConsoleUIZhs::printInfo("  请输入服务名: "); cin >> svc;
                ConsoleUIZhs::printInfo("  请输入要删除的好友ID: "); cin >> fid;
                u = g_platform.getService(uid, svc);
                if (u && u->removeFriend(fid)) {
                    ConsoleUIZhs::printSuccess("\n  [成功] 删除好友成功！\n");
                } else {
                    ConsoleUIZhs::printError("\n  [错误] 删除失败！\n");
                }
                break;
            }
            case 3: {
                ConsoleUIZhs::printInfo("  请输入你的用户ID: "); cin >> uid;
                ConsoleUIZhs::printInfo("  请输入服务名: "); cin >> svc;
                ConsoleUIZhs::printInfo("  请输入好友ID: "); cin >> fid;
                ConsoleUIZhs::printInfo("  请输入新备注: "); cin >> remark;
                u = g_platform.getService(uid, svc);
                if (u && u->modifyFriendRemark(fid, remark)) {
                    ConsoleUIZhs::printSuccess("\n  [成功] 修改备注成功！\n");
                } else {
                    ConsoleUIZhs::printError("\n  [错误] 修改失败！\n");
                }
                break;
            }
            case 4: {
                ConsoleUIZhs::printInfo("  请输入你的用户ID: "); cin >> uid;
                ConsoleUIZhs::printInfo("  请输入服务名: "); cin >> svc;
                u = g_platform.getService(uid, svc);
                if (u) {
                    u->displayInfo();
                    u->listFriends();
                } else {
                    ConsoleUIZhs::printError("\n  [错误] 服务未开通！\n");
                }
                break;
            }
            case 5: {
                ConsoleUIZhs::printInfo("  请输入用户ID: "); cin >> uid;
                ConsoleUIZhs::printInfo("  请输入服务A: "); cin >> svc;
                ConsoleUIZhs::printInfo("  请输入服务B: "); cin >> svc2;
                g_platform.showCommonFriends(uid, svc, svc2);
                break;
            }
            case 6: {
                ConsoleUIZhs::printInfo("  请输入你的用户ID: "); cin >> uid;
                ConsoleUIZhs::printInfo("  请输入目标服务（要添加好友的服务）: "); cin >> svc;
                ConsoleUIZhs::printInfo("  请输入来源服务（依据哪个服务推荐）: "); cin >> svc2;
                g_platform.showFriendRecommendations(uid, svc, svc2);
                ConsoleUIZhs::printInfo("\n  请输入要添加的推荐好友ID（输入0取消）: ");
                cin >> fid;
                if (fid != "0") {
                    MicroServiceBaseZhs* target = nullptr;
                    for (auto& pair : g_platform.getServicesMap()) {
                        if (pair.second->getId() == fid) {
                            target = pair.second;
                            break;
                        }
                    }
                    if (target) {
                        g_platform.addFriendCrossService(uid, svc, target->getServiceName(), fid, "来自" + svc2 + "推荐");
                    } else {
                        ConsoleUIZhs::printError("\n  [错误] 未找到该用户！\n");
                    }
                }
                break;
            }
            default:
                ConsoleUIZhs::printError("\n  [错误] 无效选项！\n");
        }
        ConsoleUIZhs::pause();
    }
}

// ========== 群管理菜单 ==========
void groupMenu() {
    const int W = 56;
    while (true) {
        ConsoleUIZhs::clearScreen();
        ConsoleUIZhs::drawTopBorder(W, "群管理");
        ConsoleUIZhs::drawLine(W, "");
        ConsoleUIZhs::drawMenuItem(W, 1, "创建QQ群");
        ConsoleUIZhs::drawMenuItem(W, 2, "创建微信群");
        ConsoleUIZhs::drawMenuItem(W, 3, "加入群");
        ConsoleUIZhs::drawMenuItem(W, 4, "退出群");
        ConsoleUIZhs::drawMenuItem(W, 5, "查询群成员");
        ConsoleUIZhs::drawMenuItem(W, 6, "查看群列表");
        ConsoleUIZhs::drawMenuItem(W, 7, "动态变换群类型");
        ConsoleUIZhs::drawMenuItem(W, 8, "踢出群成员（QQ群管理员/群主）");
        ConsoleUIZhs::drawMenuItem(W, 0, "返回主菜单");
        ConsoleUIZhs::drawLine(W, "");
        ConsoleUIZhs::drawBottomBorder(W);
        ConsoleUIZhs::printInfo("\n  请输入选项: ");

        int choice;
        cin >> choice;
        if (choice == 0) return;

        string gid, gname, uid, svc, targetId;
        switch (choice) {
            case 1: {
                ConsoleUIZhs::printInfo("  请输入群号: "); cin >> gid;
                ConsoleUIZhs::printInfo("  请输入群名称: "); cin >> gname;
                ConsoleUIZhs::printInfo("  请输入群主ID: "); cin >> uid;
                g_platform.createQQGroup(gid, gname, uid);
                break;
            }
            case 2: {
                ConsoleUIZhs::printInfo("  请输入群号: "); cin >> gid;
                ConsoleUIZhs::printInfo("  请输入群名称: "); cin >> gname;
                ConsoleUIZhs::printInfo("  请输入群主ID: "); cin >> uid;
                g_platform.createWeChatGroup(gid, gname, uid);
                break;
            }
            case 3: {
                ConsoleUIZhs::printInfo("  请输入用户ID: "); cin >> uid;
                ConsoleUIZhs::printInfo("  请输入服务名: "); cin >> svc;
                ConsoleUIZhs::printInfo("  请输入群号: "); cin >> gid;
                g_platform.userJoinGroup(uid, svc, gid);
                break;
            }
            case 4: {
                ConsoleUIZhs::printInfo("  请输入用户ID: "); cin >> uid;
                ConsoleUIZhs::printInfo("  请输入服务名: "); cin >> svc;
                ConsoleUIZhs::printInfo("  请输入群号: "); cin >> gid;
                g_platform.userQuitGroup(uid, svc, gid);
                break;
            }
            case 5: {
                ConsoleUIZhs::printInfo("  请输入群号: "); cin >> gid;
                GroupBaseZhs* g = g_platform.getGroup(gid);
                if (g) g->queryMembers();
                else ConsoleUIZhs::printError("\n  [错误] 群不存在！\n");
                break;
            }
            case 6: {
                g_platform.listAllGroups();
                break;
            }
            case 7: {
                ConsoleUIZhs::printInfo("  请输入要变换的群号: "); cin >> gid;
                ConsoleUIZhs::printInfo("  请输入新类型（QQ/微信）: "); cin >> svc;
                g_platform.transformGroupType(gid, svc);
                break;
            }
            case 8: {
                ConsoleUIZhs::printInfo("  请输入执行者ID（群主/管理员）: "); cin >> uid;
                ConsoleUIZhs::printInfo("  请输入群号: "); cin >> gid;
                ConsoleUIZhs::printInfo("  请输入要踢出的用户ID: "); cin >> targetId;
                GroupBaseZhs* g = g_platform.getGroup(gid);
                if (g) g->kickMember(uid, targetId);
                else ConsoleUIZhs::printError("\n  [错误] 群不存在！\n");
                break;
            }
            default:
                ConsoleUIZhs::printError("\n  [错误] 无效选项！\n");
        }
        ConsoleUIZhs::pause();
    }
}

// ========== 特色功能展示菜单 ==========
void featureMenu() {
    const int W = 56;
    while (true) {
        ConsoleUIZhs::clearScreen();
        ConsoleUIZhs::drawTopBorder(W, "特色功能展示");
        ConsoleUIZhs::drawLine(W, "");
        ConsoleUIZhs::drawMenuItem(W, 1, "展示QQ服务特色");
        ConsoleUIZhs::drawMenuItem(W, 2, "展示微信服务特色");
        ConsoleUIZhs::drawMenuItem(W, 3, "QQ群 vs 微信群管理特色对比");
        ConsoleUIZhs::drawMenuItem(W, 4, "群类型动态变换演示");
        ConsoleUIZhs::drawMenuItem(W, 5, "自动登录演示");
        ConsoleUIZhs::drawMenuItem(W, 6, "跨服务好友推荐演示");
        ConsoleUIZhs::drawMenuItem(W, 0, "返回主菜单");
        ConsoleUIZhs::drawLine(W, "");
        ConsoleUIZhs::drawBottomBorder(W);
        ConsoleUIZhs::printInfo("\n  请输入选项: ");

        int choice;
        cin >> choice;
        if (choice == 0) return;

        string uid, gid;
        MicroServiceBaseZhs* u = nullptr;
        GroupBaseZhs* g = nullptr;

        switch (choice) {
            case 1: {
                ConsoleUIZhs::printInfo("  请输入QQ用户ID: "); cin >> uid;
                u = g_platform.getService(uid, "QQ");
                if (u) u->showServiceFeatures();
                else ConsoleUIZhs::printError("\n  [错误] QQ服务未开通！\n");
                break;
            }
            case 2: {
                ConsoleUIZhs::printInfo("  请输入绑定QQ号: "); cin >> uid;
                u = g_platform.getService(uid, "微信");
                if (u) u->showServiceFeatures();
                else ConsoleUIZhs::printError("\n  [错误] 微信服务未开通！\n");
                break;
            }
            case 3: {
                ConsoleUIZhs::printTitle("\n  ---------- QQ群特色 ----------\n");
                QQGroupZhs qqg("demo", "演示群", "admin");
                qqg.showFeatures();
                ConsoleUIZhs::printTitle("\n  ---------- 微信群特色 ----------\n");
                WeChatGroupZhs wxg("demo", "演示群", "admin");
                wxg.showFeatures();
                break;
            }
            case 4: {
                ConsoleUIZhs::printInfo("  请输入要变换的群号: "); cin >> gid;
                g = g_platform.getGroup(gid);
                if (!g) {
                    ConsoleUIZhs::printError("\n  [错误] 群不存在！\n");
                    break;
                }
                ConsoleUIZhs::printHighlight("\n  ===== 变换前 =====\n");
                g->queryMembers();
                g->showFeatures();

                ConsoleUIZhs::printInfo("\n  请输入新类型（QQ/微信）: ");
                string newType;
                cin >> newType;
                g_platform.transformGroupType(gid, newType);

                g = g_platform.getGroup(gid);
                ConsoleUIZhs::printHighlight("\n  ===== 变换后 =====\n");
                g->queryMembers();
                g->showFeatures();
                break;
            }
            case 5: {
                ConsoleUIZhs::printInfo("  请输入用户ID进行登录演示: "); cin >> uid;
                ConsoleUIZhs::printInfo("  请输入服务名（QQ/微信/微博）: ");
                string svc;
                cin >> svc;
                g_platform.login(uid, svc);
                ConsoleUIZhs::printSuccess("\n  [演示完成] 该用户的其他服务已自动登录！\n");
                g_platform.listAllServices();
                break;
            }
            case 6: {
                ConsoleUIZhs::printInfo("  请输入用户ID: "); cin >> uid;
                ConsoleUIZhs::printInfo("  请输入目标服务: "); string svc1; cin >> svc1;
                ConsoleUIZhs::printInfo("  请输入来源服务: "); string svc2; cin >> svc2;
                g_platform.showFriendRecommendations(uid, svc1, svc2);
                break;
            }
            default:
                ConsoleUIZhs::printError("\n  [错误] 无效选项！\n");
        }
        ConsoleUIZhs::pause();
    }
}

// ========== TCP通信菜单（选做） ==========
void tcpChatMenu() {
    const int W = 56;
    while (true) {
        ConsoleUIZhs::clearScreen();
        ConsoleUIZhs::drawTopBorder(W, "选做：QQ点对点TCP通信");
        ConsoleUIZhs::drawLine(W, "");
        ConsoleUIZhs::drawMenuItem(W, 1, "启动服务端");
        ConsoleUIZhs::drawMenuItem(W, 2, "连接服务端（客户端）");
        ConsoleUIZhs::drawMenuItem(W, 3, "发送消息");
        ConsoleUIZhs::drawMenuItem(W, 4, "接收消息");
        ConsoleUIZhs::drawMenuItem(W, 5, "关闭连接");
        ConsoleUIZhs::drawMenuItem(W, 0, "返回主菜单");
        ConsoleUIZhs::drawLine(W, "");
        ConsoleUIZhs::drawBottomBorder(W);
        ConsoleUIZhs::printInfo("\n  请输入选项: ");

        int choice;
        cin >> choice;
        if (choice == 0) return;

        static TcpChatZhs tcp;
        string msg, ip;
        int port;

        switch (choice) {
            case 1: {
                ConsoleUIZhs::printInfo("  请输入监听端口: "); cin >> port;
                if (tcp.startServer(port)) {
                    SOCKET client = tcp.acceptConnection();
                    if (client != INVALID_SOCKET) {
                        ConsoleUIZhs::printInfo("\n  [服务端] 等待接收消息中...\n");
                        msg = tcp.receiveMessage();
                        if (!msg.empty()) {
                            ConsoleUIZhs::printSuccess("  [收到] " + msg + "\n");
                        }
                    }
                }
                break;
            }
            case 2: {
                ConsoleUIZhs::printInfo("  请输入服务器IP: "); cin >> ip;
                ConsoleUIZhs::printInfo("  请输入服务器端口: "); cin >> port;
                tcp.connectToServer(ip, port);
                break;
            }
            case 3: {
                ConsoleUIZhs::printInfo("  请输入消息内容: ");
                cin.ignore();
                getline(cin, msg);
                if (tcp.sendMessage(msg)) {
                    ConsoleUIZhs::printSuccess("\n  [成功] 消息已发送！\n");
                } else {
                    ConsoleUIZhs::printError("\n  [错误] 发送失败！\n");
                }
                break;
            }
            case 4: {
                msg = tcp.receiveMessage();
                if (!msg.empty()) {
                    ConsoleUIZhs::printSuccess("\n  [收到] " + msg + "\n");
                } else {
                    ConsoleUIZhs::printWarning("\n  [提示] 未收到消息或连接已断开\n");
                }
                break;
            }
            case 5: {
                tcp.closeConnection();
                ConsoleUIZhs::printSuccess("\n  [成功] 连接已关闭\n");
                break;
            }
            default:
                ConsoleUIZhs::printError("\n  [错误] 无效选项！\n");
        }
        ConsoleUIZhs::pause();
    }
}

// ========== 主函数 ==========
int main() {
    // 初始化控制台UI（UTF-8、颜色、窗口标题）
    ConsoleUIZhs::initConsole();
    ConsoleUIZhs::showWelcome();

    initData();

    ConsoleUIZhs::printInfo("  [系统] 初始化完成，进入主菜单...\n");
    ConsoleUIZhs::pause("按 Enter 键进入主菜单...");

    mainMenu();

    return 0;
}
