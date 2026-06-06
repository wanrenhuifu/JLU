#ifndef QQ_USER_ZHS_H
#define QQ_USER_ZHS_H

#include "MicroServiceBaseZhs.h"

/**
 * @class QQUserZhs
 * @brief QQ用户类，继承MicroServiceBaseZhs
 * 
 * QQ使用平台统一ID，与微博共享ID体系
 */
class QQUserZhs : public MicroServiceBaseZhs {
public:
    QQUserZhs();
    QQUserZhs(const string& id, const string& nickname,
              const string& birthDate, const string& registerDate,
              const string& location);
    virtual ~QQUserZhs();

    // 展示QQ服务特色
    virtual void showServiceFeatures() const override;
};

#endif
