#ifndef QQ_GROUP_ZHS_H
#define QQ_GROUP_ZHS_H

#include "GroupBaseZhs.h"
#include <vector>

using namespace std;

/**
 * @class QQGroupZhs
 * @brief QQ群实现类
 * 
 * 特色：
 * 1. 支持申请加入（模拟直接同意）
 * 2. 支持临时讨论组（子群）
 * 3. 采用管理员制度（群主+多名管理员）
 */
class QQGroupZhs : public GroupBaseZhs {
private:
    vector<QQGroupZhs> subGroups;  // 临时讨论组（子群）

public:
    QQGroupZhs();
    QQGroupZhs(const string& gid, const string& gname, const string& owner);
    virtual ~QQGroupZhs();

    // 子群管理
    bool createSubGroup(const string& subName, const string& creatorId);
    void listSubGroups() const;

    // 管理员管理
    bool addAdmin(const string& ownerId, const string& userId);
    bool removeAdmin(const string& ownerId, const string& userId);
    bool isAdmin(const string& userId) const;

    // 重写纯虚函数，体现多态
    virtual bool joinGroup(const string& userId) override;
    virtual bool quitGroup(const string& userId) override;
    virtual bool kickMember(const string& adminId, const string& userId) override;
    virtual void queryMembers() const override;
    virtual void showFeatures() const override;
    virtual string getDescription() const override;

    virtual string toString() const override;
    virtual void fromString(const string& str) override;
};

#endif
