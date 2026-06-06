#include "WeChatGroupZhs.h"
#include <iostream>

WeChatGroupZhs::WeChatGroupZhs() {
    groupType = "微信";
}

WeChatGroupZhs::WeChatGroupZhs(const string& gid, const string& gname, const string& owner)
    : GroupBaseZhs(gid, gname, owner, "微信") {}

WeChatGroupZhs::~WeChatGroupZhs() {}

bool WeChatGroupZhs::recommendJoin(const string& recommenderId, const string& userId) {
    if (!hasMember(recommenderId)) {
        cout << "  [错误] 推荐人不在群中，无法推荐！" << endl;
        return false;
    }
    cout << "  [微信群] 用户 " << recommenderId << " 推荐 " << userId << " 加入群" << endl;
    cout << "  [系统] 群主已确认推荐！" << endl;
    return addMember(userId);
}

bool WeChatGroupZhs::joinGroup(const string& userId) {
    cout << "  [微信群] 用户 " << userId << " 尝试加入群 " << groupId << endl;
    cout << "  [系统] 微信群不支持直接申请加入，需要群成员推荐！" << endl;
    return false;
}

bool WeChatGroupZhs::quitGroup(const string& userId) {
    if (userId == ownerId) {
        cout << "  [提示] 群主退出群，群将解散（模拟）" << endl;
    }
    return removeMember(userId);
}

bool WeChatGroupZhs::kickMember(const string& adminId, const string& userId) {
    if (adminId != ownerId) {
        cout << "  [错误] 无权踢人！微信群只有群主有特权。" << endl;
        return false;
    }
    if (removeMember(userId)) {
        cout << "  [成功] " << userId << " 已被群主踢出群 " << groupId << endl;
        return true;
    }
    cout << "  [错误] 该用户不在群中！" << endl;
    return false;
}

void WeChatGroupZhs::queryMembers() const {
    cout << "  【微信群查询】" << groupId << " - " << groupName << endl;
    cout << "  群主(唯一特权): " << ownerId << endl;
    listMembers();
    cout << "  （微信群不支持子群）" << endl;
}

void WeChatGroupZhs::showFeatures() const {
    cout << "  【微信群管理特色】" << endl;
    cout << "    1. 推荐加入模式：不支持自由申请，只能由群成员推荐加入" << endl;
    cout << "    2. 无子群：微信群不允许设置临时讨论组" << endl;
    cout << "    3. 群主独裁：仅有群主为特权账号，无管理员制度" << endl;
    cout << "    4. 踢人权限：仅群主可以踢出成员" << endl;
}

string WeChatGroupZhs::getDescription() const {
    return "微信群(" + groupId + ")" + groupName + "[群主:" + ownerId + ",成员:" + to_string(members.size()) + "人,无管理员]";
}
