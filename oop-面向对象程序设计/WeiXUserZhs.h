#ifndef WEIX_USER_ZHS_H
#define WEIX_USER_ZHS_H

#include "MicroServiceBaseZhs.h"

/**
 * @class WeiXUserZhs
 * @brief 其他微X产品用户基类，便于后续扩展
 * 
 * 预留的扩展类，演示系统的可扩展性
 */
class WeiXUserZhs : public MicroServiceBaseZhs {
private:
    string productName; // 具体产品名称（微商/微唱/微走/微笑等）
    string extraId;     // 可能的独立ID

public:
    WeiXUserZhs();
    WeiXUserZhs(const string& id, const string& productName,
                const string& nickname, const string& birthDate,
                const string& registerDate, const string& location);
    virtual ~WeiXUserZhs();

    string getProductName() const;
    void setProductName(const string& name);

    string getExtraId() const;
    void setExtraId(const string& eid);

    virtual void showServiceFeatures() const override;
};

#endif
