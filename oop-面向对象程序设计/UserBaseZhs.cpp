#include "UserBaseZhs.h"

UserBaseZhs::UserBaseZhs() {}

UserBaseZhs::UserBaseZhs(const string& id, const string& nickname,
                         const string& birthDate, const string& registerDate,
                         const string& location)
    : id(id), nickname(nickname), birthDate(birthDate),
      registerDate(registerDate), location(location) {}

UserBaseZhs::~UserBaseZhs() {}

string UserBaseZhs::getId() const { return id; }
void UserBaseZhs::setId(const string& newId) { id = newId; }

string UserBaseZhs::getNickname() const { return nickname; }
void UserBaseZhs::setNickname(const string& newNickname) { nickname = newNickname; }

string UserBaseZhs::getBirthDate() const { return birthDate; }
void UserBaseZhs::setBirthDate(const string& newBirthDate) { birthDate = newBirthDate; }

string UserBaseZhs::getRegisterDate() const { return registerDate; }
void UserBaseZhs::setRegisterDate(const string& newRegisterDate) { registerDate = newRegisterDate; }

string UserBaseZhs::getLocation() const { return location; }
void UserBaseZhs::setLocation(const string& newLocation) { location = newLocation; }

void UserBaseZhs::displayInfo() const {
    cout << "【用户信息】" << endl;
    cout << "  ID: " << id << endl;
    cout << "  昵称: " << nickname << endl;
    cout << "  出生日期: " << birthDate << endl;
    cout << "  T龄(注册时间): " << registerDate << endl;
    cout << "  所在地: " << location << endl;
}

void UserBaseZhs::fromString(const string& str) {
    size_t pos = 0;
    string token;
    string s = str;
    string parts[5];
    int idx = 0;
    while ((pos = s.find('|')) != string::npos && idx < 5) {
        token = s.substr(0, pos);
        parts[idx++] = token;
        s.erase(0, pos + 1);
    }
    if (idx < 5) parts[idx] = s;
    id = parts[0];
    nickname = parts[1];
    birthDate = parts[2];
    registerDate = parts[3];
    location = parts[4];
}

string UserBaseZhs::toString() const {
    return id + "|" + nickname + "|" + birthDate + "|" + registerDate + "|" + location;
}
