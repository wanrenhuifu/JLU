#include "GroupBaseZhs.h"

GroupBaseZhs::GroupBaseZhs() {}

GroupBaseZhs::GroupBaseZhs(const string& gid, const string& gname,
                           const string& owner, const string& gtype)
    : groupId(gid), groupName(gname), ownerId(owner), groupType(gtype) {}

GroupBaseZhs::~GroupBaseZhs() {}

string GroupBaseZhs::getGroupId() const { return groupId; }
void GroupBaseZhs::setGroupId(const string& gid) { groupId = gid; }

string GroupBaseZhs::getGroupName() const { return groupName; }
void GroupBaseZhs::setGroupName(const string& gname) { groupName = gname; }

string GroupBaseZhs::getOwnerId() const { return ownerId; }
void GroupBaseZhs::setOwnerId(const string& oid) { ownerId = oid; }

string GroupBaseZhs::getGroupType() const { return groupType; }
void GroupBaseZhs::setGroupType(const string& gtype) { groupType = gtype; }

vector<string> GroupBaseZhs::getMembers() const { return members; }
vector<string> GroupBaseZhs::getAdmins() const { return admins; }

bool GroupBaseZhs::addMember(const string& memberId) {
    if (hasMember(memberId)) return false;
    members.push_back(memberId);
    return true;
}

bool GroupBaseZhs::removeMember(const string& memberId) {
    for (size_t i = 0; i < members.size(); ++i) {
        if (members[i] == memberId) {
            members.erase(members.begin() + i);
            return true;
        }
    }
    return false;
}

bool GroupBaseZhs::hasMember(const string& memberId) const {
    for (const auto& m : members) {
        if (m == memberId) return true;
    }
    return false;
}

void GroupBaseZhs::listMembers() const {
    cout << "  群成员列表（" << members.size() << "人）：" << endl;
    for (const auto& m : members) {
        cout << "    " << m << endl;
    }
}

string GroupBaseZhs::toString() const {
    string result = groupId + "|" + groupName + "|" + ownerId + "|" + groupType + "|";
    for (size_t i = 0; i < members.size(); ++i) {
        if (i > 0) result += ",";
        result += members[i];
    }
    result += "|";
    for (size_t i = 0; i < admins.size(); ++i) {
        if (i > 0) result += ",";
        result += admins[i];
    }
    return result;
}

void GroupBaseZhs::fromString(const string& str) {
    size_t pos = 0;
    string token;
    string s = str;
    string parts[6];
    int idx = 0;
    while ((pos = s.find('|')) != string::npos && idx < 6) {
        token = s.substr(0, pos);
        parts[idx++] = token;
        s.erase(0, pos + 1);
    }
    if (idx < 6) parts[idx] = s;

    groupId = parts[0];
    groupName = parts[1];
    ownerId = parts[2];
    groupType = parts[3];

    members.clear();
    string memStr = parts[4];
    if (!memStr.empty()) {
        size_t p = 0;
        while ((p = memStr.find(',')) != string::npos) {
            members.push_back(memStr.substr(0, p));
            memStr.erase(0, p + 1);
        }
        members.push_back(memStr);
    }

    admins.clear();
    string adminStr = parts[5];
    if (!adminStr.empty()) {
        size_t p = 0;
        while ((p = adminStr.find(',')) != string::npos) {
            admins.push_back(adminStr.substr(0, p));
            adminStr.erase(0, p + 1);
        }
        admins.push_back(adminStr);
    }
}
