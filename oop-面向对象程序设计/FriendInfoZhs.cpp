#include "FriendInfoZhs.h"
#include <iostream>

FriendInfoZhs::FriendInfoZhs() {}

FriendInfoZhs::FriendInfoZhs(const string& fid, const string& fnickname,
                             const string& remark, const string& source)
    : friendId(fid), friendNickname(fnickname), remark(remark), sourceService(source) {}

FriendInfoZhs::~FriendInfoZhs() {}

string FriendInfoZhs::getFriendId() const { return friendId; }
void FriendInfoZhs::setFriendId(const string& fid) { friendId = fid; }

string FriendInfoZhs::getFriendNickname() const { return friendNickname; }
void FriendInfoZhs::setFriendNickname(const string& fnickname) { friendNickname = fnickname; }

string FriendInfoZhs::getRemark() const { return remark; }
void FriendInfoZhs::setRemark(const string& rmk) { remark = rmk; }

string FriendInfoZhs::getSourceService() const { return sourceService; }
void FriendInfoZhs::setSourceService(const string& src) { sourceService = src; }

void FriendInfoZhs::display() const {
    cout << "    好友ID: " << friendId;
    if (!friendNickname.empty()) cout << " (" << friendNickname << ")";
    if (!remark.empty()) cout << " [备注:" << remark << "]";
    if (!sourceService.empty()) cout << " [来源:" << sourceService << "]";
    cout << endl;
}

string FriendInfoZhs::toString() const {
    return friendId + "," + friendNickname + "," + remark + "," + sourceService;
}

void FriendInfoZhs::fromString(const string& str) {
    size_t pos = 0;
    string token;
    string s = str;
    string parts[4];
    int idx = 0;
    while ((pos = s.find(',')) != string::npos && idx < 4) {
        token = s.substr(0, pos);
        parts[idx++] = token;
        s.erase(0, pos + 1);
    }
    if (idx < 4) parts[idx] = s;
    friendId = parts[0];
    friendNickname = parts[1];
    remark = parts[2];
    sourceService = parts[3];
}
