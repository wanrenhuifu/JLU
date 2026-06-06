#ifndef WEIBO_USER_ZHS_H
#define WEIBO_USER_ZHS_H

#include "MicroServiceBaseZhs.h"

/**
 * @class WeiboUserZhs
 * @brief 微博用户类，继承MicroServiceBaseZhs
 * 
 * 微博与QQ共享ID体系
 */
class WeiboUserZhs : public MicroServiceBaseZhs {
public:
    WeiboUserZhs();
    WeiboUserZhs(const string& id, const string& nickname,
                 const string& birthDate, const string& registerDate,
                 const string& location);
    virtual ~WeiboUserZhs();

    // 展示微博服务特色
    virtual void showServiceFeatures() const override;
};

#endif
