#ifndef WECHAT_USER_ZHS_H
#define WECHAT_USER_ZHS_H

#include "MicroServiceBaseZhs.h"

/**
 * @class WeChatUserZhs
 * @brief 微信用户类，继承MicroServiceBaseZhs
 * 
 * 微信采用独立ID，但可以与QQ号码绑定对应
 */
class WeChatUserZhs : public MicroServiceBaseZhs {
private:
    string wechatId;    // 微信独立ID
    string boundQQId;   // 绑定的QQ号码

public:
    WeChatUserZhs();
    WeChatUserZhs(const string& qqId, const string& wechatId,
                  const string& nickname, const string& birthDate,
                  const string& registerDate, const string& location);
    virtual ~WeChatUserZhs();

    string getWechatId() const;
    void setWechatId(const string& wid);

    string getBoundQQId() const;
    void setBoundQQId(const string& qqid);

    // 展示微信服务特色
    virtual void showServiceFeatures() const override;

    virtual void fromString(const string& str) override;
    virtual string toString() const override;
};

#endif
