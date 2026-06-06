#include "MicroServiceBaseZhs.h"
#include <iostream>
#include <algorithm>

MicroServiceBaseZhs::MicroServiceBaseZhs() : loggedIn(false) {}

MicroServiceBaseZhs::MicroServiceBaseZhs(const string& id, const string& nickname,
                                         const string& birthDate, const string& registerDate,
                                         const string& location, const string& serviceName)
    : UserBaseZhs(id, nickname, birthDate, registerDate, location),
      loggedIn(false), serviceName(serviceName) {}

MicroServiceBaseZhs::~MicroServiceBaseZhs() {}

string MicroServiceBaseZhs::getServiceName() const { return serviceName; }
void MicroServiceBaseZhs::setServiceName(const string& name) { serviceName = name; }

bool MicroServiceBaseZhs::isLoggedIn() const { return loggedIn; }
void MicroServiceBaseZhs::setLoginStatus(bool status) { loggedIn = status; }

bool MicroServiceBaseZhs::addFriend(const FriendInfoZhs& friendInfo) {
    if (hasFriend(friendInfo.getFriendId())) return false;
    friends.push_back(friendInfo);
    return true;
}

bool MicroServiceBaseZhs::removeFriend(const string& friendId) {
    for (auto it = friends.begin(); it != friends.end(); ++it) {
        if (it->getFriendId() == friendId) {
            friends.erase(it);
            return true;
        }
    }
    return false;
}

bool MicroServiceBaseZhs::modifyFriendRemark(const string& friendId, const string& newRemark) {
    FriendInfoZhs* f = findFriend(friendId);
    if (f) {
        f->setRemark(newRemark);
        return true;
    }
    return false;
}

FriendInfoZhs* MicroServiceBaseZhs::findFriend(const string& friendId) {
    for (auto& f : friends) {
        if (f.getFriendId() == friendId) return &f;
    }
    return nullptr;
}

void MicroServiceBaseZhs::listFriends() const {
    cout << "  【" << serviceName << "好友列表】（" << friends.size() << "人）" << endl;
    if (friends.empty()) {
        cout << "    （暂无好友）" << endl;
        return;
    }
    for (const auto& f : friends) {
        f.display();
    }
}

bool MicroServiceBaseZhs::hasFriend(const string& friendId) const {
    for (const auto& f : friends) {
        if (f.getFriendId() == friendId) return true;
    }
    return false;
}

bool MicroServiceBaseZhs::joinGroup(const string& gid) {
    if (isInGroup(gid)) return false;
    groupIds.push_back(gid);
    return true;
}

bool MicroServiceBaseZhs::quitGroup(const string& gid) {
    auto it = find(groupIds.begin(), groupIds.end(), gid);
    if (it != groupIds.end()) {
        groupIds.erase(it);
        return true;
    }
    return false;
}

bool MicroServiceBaseZhs::isInGroup(const string& gid) const {
    return find(groupIds.begin(), groupIds.end(), gid) != groupIds.end();
}

void MicroServiceBaseZhs::listGroups() const {
    cout << "  【" << serviceName << "群列表】（" << groupIds.size() << "个）" << endl;
    if (groupIds.empty()) {
        cout << "    （未加入任何群）" << endl;
        return;
    }
    for (const auto& g : groupIds) {
        cout << "    群号: " << g << endl;
    }
}

vector<string> MicroServiceBaseZhs::getCommonFriends(const MicroServiceBaseZhs& other) const {
    vector<string> common;
    for (const auto& f : friends) {
        if (other.hasFriend(f.getFriendId())) {
            common.push_back(f.getFriendId());
        }
    }
    return common;
}

vector<string> MicroServiceBaseZhs::getFriendRecommendations(const MicroServiceBaseZhs& other) const {
    vector<string> recommendations;
    for (const auto& f : other.friends) {
        if (!hasFriend(f.getFriendId()) && f.getFriendId() != id) {
            recommendations.push_back(f.getFriendId());
        }
    }
    return recommendations;
}

void MicroServiceBaseZhs::showServiceFeatures() const {
    cout << "  【" << serviceName << "】通用服务特性" << endl;
    cout << "    - 支持好友管理" << endl;
    cout << "    - 支持群管理" << endl;
    cout << "    - 支持跨服务登录" << endl;
}

string MicroServiceBaseZhs::friendsToString() const {
    string result;
    for (size_t i = 0; i < friends.size(); ++i) {
        if (i > 0) result += ";";
        result += friends[i].toString();
    }
    return result;
}

void MicroServiceBaseZhs::friendsFromString(const string& str) {
    friends.clear();
    if (str.empty()) return;
    size_t pos = 0;
    string s = str;
    while ((pos = s.find(';')) != string::npos) {
        FriendInfoZhs f;
        f.fromString(s.substr(0, pos));
        friends.push_back(f);
        s.erase(0, pos + 1);
    }
    if (!s.empty()) {
        FriendInfoZhs f;
        f.fromString(s);
        friends.push_back(f);
    }
}

string MicroServiceBaseZhs::toString() const {
    return UserBaseZhs::toString() + "|" + serviceName + "|" + (loggedIn ? "1" : "0") + "|" + friendsToString();
}

void MicroServiceBaseZhs::fromString(const string& str) {
    // 格式：id|nickname|birth|register|location|serviceName|loggedIn|friends
    size_t pos = 0;
    string s = str;
    string parts[8];
    int idx = 0;
    while ((pos = s.find('|')) != string::npos && idx < 8) {
        parts[idx++] = s.substr(0, pos);
        s.erase(0, pos + 1);
    }
    if (idx < 8) parts[idx] = s;

    id = parts[0];
    nickname = parts[1];
    birthDate = parts[2];
    registerDate = parts[3];
    location = parts[4];
    serviceName = parts[5];
    loggedIn = (parts[6] == "1");
    friendsFromString(parts[7]);
}
