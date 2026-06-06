#ifndef PLATFORM_MANAGER_ZHS_H
#define PLATFORM_MANAGER_ZHS_H

#include "MicroServiceBaseZhs.h"
#include "QQUserZhs.h"
#include "WeChatUserZhs.h"
#include "WeiboUserZhs.h"
#include "WeiXUserZhs.h"
#include "GroupBaseZhs.h"
#include "QQGroupZhs.h"
#include "WeChatGroupZhs.h"
#include <vector>
#include <map>
#include <string>

using namespace std;

/**
 * @class PlatformManagerZhs
 * @brief 平台管理类，统一管理所有微X服务和群
 * 
 * 体现容器类的概念，包含对象管理、登录管理、跨服务操作等
 */
class PlatformManagerZhs {
private:
    map<string, MicroServiceBaseZhs*> services;  // 所有开通的服务（key: 服务标识）
    map<string, GroupBaseZhs*> groups;           // 所有群（key: 群号）
    bool platformLoggedIn;                       // 平台全局登录状态
    string currentUserId;                        // 当前登录的用户ID

    string makeKey(const string& userId, const string& serviceName) const;

public:
    PlatformManagerZhs();
    ~PlatformManagerZhs();

    // ========== 服务开通管理 ==========
    bool openQQService(const string& id, const string& nickname,
                       const string& birth, const string& regDate, const string& location);
    bool openWeChatService(const string& qqId, const string& wechatId,
                           const string& nickname, const string& birth,
                           const string& regDate, const string& location);
    bool openWeiboService(const string& id, const string& nickname,
                          const string& birth, const string& regDate, const string& location);
    bool openWeiXService(const string& id, const string& productName,
                         const string& nickname, const string& birth,
                         const string& regDate, const string& location);

    // 查询服务
    MicroServiceBaseZhs* getService(const string& userId, const string& serviceName);
    vector<MicroServiceBaseZhs*> getUserServices(const string& userId);
    void listAllServices() const;

    // ========== 登录管理 ==========
    bool login(const string& userId, const string& serviceName);
    bool logout(const string& userId);
    bool isPlatformLoggedIn() const;
    string getCurrentUserId() const;

    // 自动登录：一个服务登录后，同用户的其他服务自动进入开通状态
    void autoLoginOtherServices(const string& userId, const string& loggedService);

    // ========== 好友管理（跨服务） ==========
    bool addFriendCrossService(const string& userId, const string& fromService,
                               const string& toService, const string& friendId,
                               const string& remark);
    void showCommonFriends(const string& userId, const string& serviceA, const string& serviceB);
    void showFriendRecommendations(const string& userId, const string& fromService, const string& toService);

    // ========== 群管理 ==========
    bool createQQGroup(const string& groupId, const string& groupName, const string& ownerId);
    bool createWeChatGroup(const string& groupId, const string& groupName, const string& ownerId);
    GroupBaseZhs* getGroup(const string& groupId);
    void listAllGroups() const;

    // 用户加入/退出群
    bool userJoinGroup(const string& userId, const string& serviceName, const string& groupId);
    bool userQuitGroup(const string& userId, const string& serviceName, const string& groupId);

    // 动态变换群类型（保留成员数据）
    bool transformGroupType(const string& groupId, const string& newType);

    // ========== 数据清理 ==========
    void clearAll();

    // ========== 数据访问（供FileManager使用） ==========
    map<string, MicroServiceBaseZhs*>& getServicesMap();
    map<string, GroupBaseZhs*>& getGroupsMap();
    const map<string, MicroServiceBaseZhs*>& getServicesMap() const;
    const map<string, GroupBaseZhs*>& getGroupsMap() const;
};

#endif
