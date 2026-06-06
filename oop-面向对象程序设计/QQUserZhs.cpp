#include "QQUserZhs.h"
#include <iostream>

QQUserZhs::QQUserZhs() {
    serviceName = "QQ";
}

QQUserZhs::QQUserZhs(const string& id, const string& nickname,
                     const string& birthDate, const string& registerDate,
                     const string& location)
    : MicroServiceBaseZhs(id, nickname, birthDate, registerDate, location, "QQ") {}

QQUserZhs::~QQUserZhs() {}

void QQUserZhs::showServiceFeatures() const {
    cout << "  【QQ】特色功能" << endl;
    cout << "    - 支持QQ号码与微博共享ID" << endl;
    cout << "    - 群支持申请加入模式" << endl;
    cout << "    - 群支持创建临时讨论组（子群）" << endl;
    cout << "    - 群采用管理员制度（群主+多名管理员）" << endl;
    cout << "    - 支持点对点TCP通信（选做）" << endl;
}
