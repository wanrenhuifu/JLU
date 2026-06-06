#include "WeiboUserZhs.h"
#include <iostream>

WeiboUserZhs::WeiboUserZhs() {
    serviceName = "微博";
}

WeiboUserZhs::WeiboUserZhs(const string& id, const string& nickname,
                           const string& birthDate, const string& registerDate,
                           const string& location)
    : MicroServiceBaseZhs(id, nickname, birthDate, registerDate, location, "微博") {}

WeiboUserZhs::~WeiboUserZhs() {}

void WeiboUserZhs::showServiceFeatures() const {
    cout << "  【微博】特色功能" << endl;
    cout << "    - 与QQ共享ID体系" << endl;
    cout << "    - 面向公众的社交平台" << endl;
    cout << "    - 支持关注与粉丝机制" << endl;
}
