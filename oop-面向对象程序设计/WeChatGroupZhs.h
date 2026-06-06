#ifndef WECHAT_GROUP_ZHS_H
#define WECHAT_GROUP_ZHS_H

#include "GroupBaseZhs.h"

/**
 * @class WeChatGroupZhs
 * @brief 微信群实现类
 * 
 * 特色：
 * 1. 只能推荐加入（非自由申请）
 * 2. 不允许子群
 * 3. 仅有群主为特权账号（无管理员制度）
 */
class WeChatGroupZhs : public GroupBaseZhs {
public:
    WeChatGroupZhs();
    WeChatGroupZhs(const string& gid, const string& gname, const string& owner);
    virtual ~WeChatGroupZhs();

    // 推荐加入（模拟）
    bool recommendJoin(const string& recommenderId, const string& userId);

    // 重写纯虚函数，体现多态
    virtual bool joinGroup(const string& userId) override;
    virtual bool quitGroup(const string& userId) override;
    virtual bool kickMember(const string& adminId, const string& userId) override;
    virtual void queryMembers() const override;
    virtual void showFeatures() const override;
    virtual string getDescription() const override;
};

#endif
