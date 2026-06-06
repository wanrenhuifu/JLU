#include "PlatformManagerZhs.h"
#include <iostream>

PlatformManagerZhs::PlatformManagerZhs() : platformLoggedIn(false) {}

PlatformManagerZhs::~PlatformManagerZhs() {
    clearAll();
}

string PlatformManagerZhs::makeKey(const string& userId, const string& serviceName) const {
    return userId + "@" + serviceName;
}

bool PlatformManagerZhs::openQQService(const string& id, const string& nickname,
                                       const string& birth, const string& regDate, const string& location) {
    string key = makeKey(id, "QQ");
    if (services.find(key) != services.end()) {
        cout << "[提示] QQ服务已开通！" << endl;
        return false;
    }
    services[key] = new QQUserZhs(id, nickname, birth, regDate, location);
    cout << "[成功] 开通QQ服务：" << id << endl;
    return true;
}

bool PlatformManagerZhs::openWeChatService(const string& qqId, const string& wechatId,
                                           const string& nickname, const string& birth,
                                           const string& regDate, const string& location) {
    string key = makeKey(qqId, "微信");
    if (services.find(key) != services.end()) {
        cout << "[提示] 微信服务已开通！" << endl;
        return false;
    }
    services[key] = new WeChatUserZhs(qqId, wechatId, nickname, birth, regDate, location);
    cout << "[成功] 开通微信服务：QQ绑定=" << qqId << ", 微信号=" << wechatId << endl;
    return true;
}

bool PlatformManagerZhs::openWeiboService(const string& id, const string& nickname,
                                          const string& birth, const string& regDate, const string& location) {
    string key = makeKey(id, "微博");
    if (services.find(key) != services.end()) {
        cout << "[提示] 微博服务已开通！" << endl;
        return false;
    }
    services[key] = new WeiboUserZhs(id, nickname, birth, regDate, location);
    cout << "[成功] 开通微博服务：" << id << endl;
    return true;
}

bool PlatformManagerZhs::openWeiXService(const string& id, const string& productName,
                                         const string& nickname, const string& birth,
                                         const string& regDate, const string& location) {
    string key = makeKey(id, productName);
    if (services.find(key) != services.end()) {
        cout << "[提示] " << productName << "服务已开通！" << endl;
        return false;
    }
    services[key] = new WeiXUserZhs(id, productName, nickname, birth, regDate, location);
    cout << "[成功] 开通" << productName << "服务：" << id << endl;
    return true;
}

MicroServiceBaseZhs* PlatformManagerZhs::getService(const string& userId, const string& serviceName) {
    string key = makeKey(userId, serviceName);
    auto it = services.find(key);
    if (it != services.end()) return it->second;
    return nullptr;
}

vector<MicroServiceBaseZhs*> PlatformManagerZhs::getUserServices(const string& userId) {
    vector<MicroServiceBaseZhs*> result;
    for (auto& pair : services) {
        if (pair.second->getId() == userId) {
            result.push_back(pair.second);
        }
    }
    return result;
}

void PlatformManagerZhs::listAllServices() const {
    cout << "\n========== 平台已开通服务列表 ==========" << endl;
    if (services.empty()) {
        cout << "（暂无服务）" << endl;
        return;
    }
    for (const auto& pair : services) {
        cout << "  [" << pair.second->getServiceName() << "] "
             << pair.second->getId() << " - " << pair.second->getNickname()
             << "  登录状态: " << (pair.second->isLoggedIn() ? "已登录" : "未登录") << endl;
    }
}

bool PlatformManagerZhs::login(const string& userId, const string& serviceName) {
    MicroServiceBaseZhs* svc = getService(userId, serviceName);
    if (!svc) {
        cout << "[错误] 该服务未开通！" << endl;
        return false;
    }
    svc->setLoginStatus(true);
    platformLoggedIn = true;
    currentUserId = userId;
    cout << "[成功] " << serviceName << " 登录成功！用户：" << userId << endl;
    // 自动登录同用户的其他服务
    autoLoginOtherServices(userId, serviceName);
    return true;
}

bool PlatformManagerZhs::logout(const string& userId) {
    auto svcs = getUserServices(userId);
    for (auto* s : svcs) {
        s->setLoginStatus(false);
    }
    platformLoggedIn = false;
    currentUserId = "";
    cout << "[成功] 用户 " << userId << " 已退出所有服务！" << endl;
    return true;
}

bool PlatformManagerZhs::isPlatformLoggedIn() const {
    return platformLoggedIn;
}

string PlatformManagerZhs::getCurrentUserId() const {
    return currentUserId;
}

void PlatformManagerZhs::autoLoginOtherServices(const string& userId, const string& loggedService) {
    auto svcs = getUserServices(userId);
    for (auto* s : svcs) {
        if (s->getServiceName() != loggedService && !s->isLoggedIn()) {
            s->setLoginStatus(true);
            cout << "  [自动登录] " << s->getServiceName() << " 已自动登录！" << endl;
        }
    }
}

bool PlatformManagerZhs::addFriendCrossService(const string& userId, const string& fromService,
                                               const string& toService, const string& friendId,
                                               const string& remark) {
    MicroServiceBaseZhs* from = getService(userId, fromService);
    MicroServiceBaseZhs* to = getService(friendId, toService);
    if (!from) {
        cout << "[错误] 本服务未开通！" << endl;
        return false;
    }
    if (!to) {
        cout << "[错误] 对方服务未开通！" << endl;
        return false;
    }
    FriendInfoZhs finfo(friendId, to->getNickname(), remark, toService);
    if (from->addFriend(finfo)) {
        cout << "[成功] 已通过" << toService << "添加好友：" << friendId << " (" << to->getNickname() << ")" << endl;
        return true;
    }
    cout << "[提示] 该好友已存在！" << endl;
    return false;
}

void PlatformManagerZhs::showCommonFriends(const string& userId, const string& serviceA, const string& serviceB) {
    MicroServiceBaseZhs* a = getService(userId, serviceA);
    MicroServiceBaseZhs* b = getService(userId, serviceB);
    if (!a || !b) {
        cout << "[错误] 指定服务未开通！" << endl;
        return;
    }
    vector<string> common = a->getCommonFriends(*b);
    cout << "\n========== " << serviceA << " 与 " << serviceB << " 的共同好友 ==========" << endl;
    if (common.empty()) {
        cout << "（无共同好友）" << endl;
        return;
    }
    for (const auto& fid : common) {
        cout << "  " << fid << endl;
    }
}

void PlatformManagerZhs::showFriendRecommendations(const string& userId, const string& fromService, const string& toService) {
    MicroServiceBaseZhs* from = getService(userId, fromService);
    MicroServiceBaseZhs* to = getService(userId, toService);
    if (!from || !to) {
        cout << "[错误] 指定服务未开通！" << endl;
        return;
    }
    vector<string> recs = from->getFriendRecommendations(*to);
    cout << "\n========== 基于" << toService << "向" << fromService << "推荐好友 ==========" << endl;
    if (recs.empty()) {
        cout << "（暂无推荐）" << endl;
        return;
    }
    for (const auto& fid : recs) {
        cout << "  推荐ID: " << fid << endl;
    }
}

bool PlatformManagerZhs::createQQGroup(const string& groupId, const string& groupName, const string& ownerId) {
    if (groups.find(groupId) != groups.end()) {
        cout << "[提示] 群号已存在！" << endl;
        return false;
    }
    groups[groupId] = new QQGroupZhs(groupId, groupName, ownerId);
    // 自动让群主加入群
    groups[groupId]->addMember(ownerId);
    cout << "[成功] 创建QQ群：" << groupId << " - " << groupName << endl;
    return true;
}

bool PlatformManagerZhs::createWeChatGroup(const string& groupId, const string& groupName, const string& ownerId) {
    if (groups.find(groupId) != groups.end()) {
        cout << "[提示] 群号已存在！" << endl;
        return false;
    }
    groups[groupId] = new WeChatGroupZhs(groupId, groupName, ownerId);
    groups[groupId]->addMember(ownerId);
    cout << "[成功] 创建微信群：" << groupId << " - " << groupName << endl;
    return true;
}

GroupBaseZhs* PlatformManagerZhs::getGroup(const string& groupId) {
    auto it = groups.find(groupId);
    if (it != groups.end()) return it->second;
    return nullptr;
}

void PlatformManagerZhs::listAllGroups() const {
    cout << "\n========== 平台群列表 ==========" << endl;
    if (groups.empty()) {
        cout << "（暂无群）" << endl;
        return;
    }
    for (const auto& pair : groups) {
        cout << "  " << pair.second->getDescription() << endl;
    }
}

bool PlatformManagerZhs::userJoinGroup(const string& userId, const string& serviceName, const string& groupId) {
    MicroServiceBaseZhs* svc = getService(userId, serviceName);
    GroupBaseZhs* grp = getGroup(groupId);
    if (!svc) {
        cout << "[错误] 服务未开通！" << endl;
        return false;
    }
    if (!grp) {
        cout << "[错误] 群不存在！" << endl;
        return false;
    }
    if (grp->joinGroup(userId)) {
        svc->joinGroup(groupId);
        cout << "[成功] 已加入群！" << endl;
        return true;
    }
    return false;
}

bool PlatformManagerZhs::userQuitGroup(const string& userId, const string& serviceName, const string& groupId) {
    MicroServiceBaseZhs* svc = getService(userId, serviceName);
    GroupBaseZhs* grp = getGroup(groupId);
    if (!svc || !grp) {
        cout << "[错误] 服务或群不存在！" << endl;
        return false;
    }
    if (grp->quitGroup(userId)) {
        svc->quitGroup(groupId);
        cout << "[成功] 已退出群！" << endl;
        return true;
    }
    return false;
}

bool PlatformManagerZhs::transformGroupType(const string& groupId, const string& newType) {
    auto it = groups.find(groupId);
    if (it == groups.end()) {
        cout << "[错误] 群不存在！" << endl;
        return false;
    }
    GroupBaseZhs* oldGroup = it->second;
    string gid = oldGroup->getGroupId();
    string gname = oldGroup->getGroupName();
    string owner = oldGroup->getOwnerId();
    vector<string> mems = oldGroup->getMembers();
    vector<string> adms = oldGroup->getAdmins();

    GroupBaseZhs* newGroup = nullptr;
    if (newType == "QQ") {
        newGroup = new QQGroupZhs(gid, gname, owner);
    } else if (newType == "微信") {
        newGroup = new WeChatGroupZhs(gid, gname, owner);
    } else {
        cout << "[错误] 不支持的群类型！" << endl;
        return false;
    }

    // 保留成员数据
    for (const auto& m : mems) {
        newGroup->addMember(m);
    }
    // 如果是QQ群，保留管理员
    QQGroupZhs* qqg = dynamic_cast<QQGroupZhs*>(newGroup);
    if (qqg) {
        for (const auto& a : adms) {
            qqg->addAdmin(owner, a);
        }
    }

    delete oldGroup;
    it->second = newGroup;
    cout << "[成功] 群 " << groupId << " 已动态变换为 " << newType << " 群管理特色！" << endl;
    cout << "  成员数据完整保留，共 " << mems.size() << " 人" << endl;
    return true;
}

void PlatformManagerZhs::clearAll() {
    for (auto& pair : services) {
        delete pair.second;
    }
    services.clear();
    for (auto& pair : groups) {
        delete pair.second;
    }
    groups.clear();
    platformLoggedIn = false;
    currentUserId = "";
}

map<string, MicroServiceBaseZhs*>& PlatformManagerZhs::getServicesMap() {
    return services;
}

map<string, GroupBaseZhs*>& PlatformManagerZhs::getGroupsMap() {
    return groups;
}

const map<string, MicroServiceBaseZhs*>& PlatformManagerZhs::getServicesMap() const {
    return services;
}

const map<string, GroupBaseZhs*>& PlatformManagerZhs::getGroupsMap() const {
    return groups;
}
