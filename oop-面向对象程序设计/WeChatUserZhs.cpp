#include "WeChatUserZhs.h"
#include <iostream>

WeChatUserZhs::WeChatUserZhs() {
    serviceName = "微信";
}

WeChatUserZhs::WeChatUserZhs(const string& qqId, const string& wechatId,
                             const string& nickname, const string& birthDate,
                             const string& registerDate, const string& location)
    : MicroServiceBaseZhs(qqId, nickname, birthDate, registerDate, location, "微信"),
      wechatId(wechatId), boundQQId(qqId) {}

WeChatUserZhs::~WeChatUserZhs() {}

string WeChatUserZhs::getWechatId() const { return wechatId; }
void WeChatUserZhs::setWechatId(const string& wid) { wechatId = wid; }

string WeChatUserZhs::getBoundQQId() const { return boundQQId; }
void WeChatUserZhs::setBoundQQId(const string& qqid) { boundQQId = qqid; }

void WeChatUserZhs::showServiceFeatures() const {
    cout << "  【微信】特色功能" << endl;
    cout << "    - 采用独立微信号，可与QQ绑定" << endl;
    cout << "    - 绑定QQ: " << boundQQId << endl;
    cout << "    - 微信号: " << wechatId << endl;
    cout << "    - 群仅支持推荐加入" << endl;
    cout << "    - 群不支持子群" << endl;
    cout << "    - 群仅有群主为特权账号" << endl;
}

string WeChatUserZhs::toString() const {
    // 使用 '#' 分隔基类数据和微信特有字段，避免与 '|' 混淆
    return MicroServiceBaseZhs::toString() + "#" + wechatId + "|" + boundQQId;
}

void WeChatUserZhs::fromString(const string& str) {
    size_t pos = str.rfind('#');
    if (pos != string::npos) {
        MicroServiceBaseZhs::fromString(str.substr(0, pos));
        string rest = str.substr(pos + 1);
        size_t p = rest.find('|');
        if (p != string::npos) {
            wechatId = rest.substr(0, p);
            boundQQId = rest.substr(p + 1);
        }
    } else {
        MicroServiceBaseZhs::fromString(str);
    }
}
