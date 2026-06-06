#include "QQGroupZhs.h"
#include <iostream>

QQGroupZhs::QQGroupZhs() {
    groupType = "QQ";
}

QQGroupZhs::QQGroupZhs(const string& gid, const string& gname, const string& owner)
    : GroupBaseZhs(gid, gname, owner, "QQ") {}

QQGroupZhs::~QQGroupZhs() {}

bool QQGroupZhs::createSubGroup(const string& subName, const string& creatorId) {
    if (creatorId != ownerId && !isAdmin(creatorId)) {
        cout << "  [错误] 无权限创建子群！" << endl;
        return false;
    }
    string subId = groupId + "-sub" + to_string(subGroups.size() + 1);
    QQGroupZhs sub(subId, subName, creatorId);
    subGroups.push_back(sub);
    cout << "  [成功] 创建临时讨论组：" << subName << "（" << subId << "）" << endl;
    return true;
}

void QQGroupZhs::listSubGroups() const {
    cout << "  QQ子群（临时讨论组）列表：" << endl;
    if (subGroups.empty()) {
        cout << "    （暂无子群）" << endl;
        return;
    }
    for (const auto& sub : subGroups) {
        cout << "    " << sub.getGroupId() << " - " << sub.getGroupName() << endl;
    }
}

bool QQGroupZhs::addAdmin(const string& ownerId, const string& userId) {
    if (ownerId != this->ownerId) {
        cout << "  [错误] 只有群主可以添加管理员！" << endl;
        return false;
    }
    if (!hasMember(userId)) {
        cout << "  [错误] 该用户不在群中！" << endl;
        return false;
    }
    if (isAdmin(userId)) {
        cout << "  [提示] 该用户已是管理员！" << endl;
        return true;
    }
    admins.push_back(userId);
    cout << "  [成功] " << userId << " 已成为管理员" << endl;
    return true;
}

bool QQGroupZhs::removeAdmin(const string& ownerId, const string& userId) {
    if (ownerId != this->ownerId) {
        cout << "  [错误] 只有群主可以移除管理员！" << endl;
        return false;
    }
    for (size_t i = 0; i < admins.size(); ++i) {
        if (admins[i] == userId) {
            admins.erase(admins.begin() + i);
            cout << "  [成功] " << userId << " 已被移除管理员身份" << endl;
            return true;
        }
    }
    cout << "  [错误] 该用户不是管理员！" << endl;
    return false;
}

bool QQGroupZhs::isAdmin(const string& userId) const {
    for (const auto& a : admins) {
        if (a == userId) return true;
    }
    return false;
}

bool QQGroupZhs::joinGroup(const string& userId) {
    cout << "  [QQ群] 用户 " << userId << " 申请加入群 " << groupId << endl;
    cout << "  [系统] 群主/管理员已同意申请！" << endl;
    return addMember(userId);
}

bool QQGroupZhs::quitGroup(const string& userId) {
    if (userId == ownerId) {
        cout << "  [提示] 群主退出群，群将解散（模拟）" << endl;
    }
    return removeMember(userId);
}

bool QQGroupZhs::kickMember(const string& adminId, const string& userId) {
    if (adminId != ownerId && !isAdmin(adminId)) {
        cout << "  [错误] 无权踢人！只有群主或管理员可以踢人。" << endl;
        return false;
    }
    if (userId == ownerId) {
        cout << "  [错误] 不能踢出群主！" << endl;
        return false;
    }
    if (removeMember(userId)) {
        cout << "  [成功] " << userId << " 已被踢出群 " << groupId << endl;
        return true;
    }
    cout << "  [错误] 该用户不在群中！" << endl;
    return false;
}

void QQGroupZhs::queryMembers() const {
    cout << "  【QQ群查询】" << groupId << " - " << groupName << endl;
    cout << "  群主: " << ownerId << endl;
    cout << "  管理员: ";
    if (admins.empty()) cout << "（无）";
    else {
        for (size_t i = 0; i < admins.size(); ++i) {
            if (i > 0) cout << ", ";
            cout << admins[i];
        }
    }
    cout << endl;
    listMembers();
    listSubGroups();
}

void QQGroupZhs::showFeatures() const {
    cout << "  【QQ群管理特色】" << endl;
    cout << "    1. 申请加入模式：用户可主动申请，管理员审批后加入" << endl;
    cout << "    2. 子群支持：可创建临时讨论组（子群）" << endl;
    cout << "    3. 管理员制度：群主可设置多名管理员，共同管理群" << endl;
    cout << "    4. 踢人权限：群主和管理员均可踢出普通成员" << endl;
}

string QQGroupZhs::getDescription() const {
    return "QQ群(" + groupId + ")" + groupName + "[群主:" + ownerId + ",管理员:" + to_string(admins.size()) + "人,成员:" + to_string(members.size()) + "人]";
}

string QQGroupZhs::toString() const {
    string base = GroupBaseZhs::toString();
    // 追加子群信息（简化处理）
    base += "|" + to_string(subGroups.size());
    return base;
}

void QQGroupZhs::fromString(const string& str) {
    // 先解析基类部分，再处理子群数量
    size_t lastPipe = str.rfind('|');
    if (lastPipe != string::npos) {
        string basePart = str.substr(0, lastPipe);
        GroupBaseZhs::fromString(basePart);
        // subGroups count ignored for simplicity in reload
    } else {
        GroupBaseZhs::fromString(str);
    }
}
