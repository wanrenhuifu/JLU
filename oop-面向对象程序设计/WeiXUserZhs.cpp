#include "WeiXUserZhs.h"
#include <iostream>

WeiXUserZhs::WeiXUserZhs() {
    serviceName = "微X";
}

WeiXUserZhs::WeiXUserZhs(const string& id, const string& productName,
                         const string& nickname, const string& birthDate,
                         const string& registerDate, const string& location)
    : MicroServiceBaseZhs(id, nickname, birthDate, registerDate, location, productName),
      productName(productName), extraId(id) {}

WeiXUserZhs::~WeiXUserZhs() {}

string WeiXUserZhs::getProductName() const { return productName; }
void WeiXUserZhs::setProductName(const string& name) { productName = name; serviceName = name; }

string WeiXUserZhs::getExtraId() const { return extraId; }
void WeiXUserZhs::setExtraId(const string& eid) { extraId = eid; }

void WeiXUserZhs::showServiceFeatures() const {
    cout << "  【" << productName << "】扩展微X产品特色" << endl;
    cout << "    - 这是预留的扩展服务" << endl;
    cout << "    - 产品名称: " << productName << endl;
    cout << "    - 支持平台统一登录管理" << endl;
}
