#ifndef GROUP_BASE_ZHS_H
#define GROUP_BASE_ZHS_H

#include <string>
#include <vector>
#include <iostream>

using namespace std;

/**
 * @class GroupBaseZhs
 * @brief 群基类，定义群的通用接口
 * 
 * 采用抽象基类实现多态，不同微X群通过继承重写特色功能
 */
class GroupBaseZhs {
protected:
    string groupId;            // 群号
    string groupName;          // 群名称
    string ownerId;            // 群主ID
    vector<string> members;    // 成员ID列表
    vector<string> admins;     // 管理员ID列表（部分群类型使用）
    string groupType;          // 群类型标识（QQ/微信等）

public:
    GroupBaseZhs();
    GroupBaseZhs(const string& gid, const string& gname, 
                 const string& owner, const string& gtype);
    virtual ~GroupBaseZhs();

    string getGroupId() const;
    void setGroupId(const string& gid);

    string getGroupName() const;
    void setGroupName(const string& gname);

    string getOwnerId() const;
    void setOwnerId(const string& oid);

    string getGroupType() const;
    void setGroupType(const string& gtype);

    vector<string> getMembers() const;
    vector<string> getAdmins() const;

    // 通用成员操作方法
    bool addMember(const string& memberId);
    bool removeMember(const string& memberId);
    bool hasMember(const string& memberId) const;
    void listMembers() const;

    // ========== 纯虚函数：体现多态，各微X群特色功能 ==========
    
    // 加入群（QQ可申请加入，微信只能推荐加入）
    virtual bool joinGroup(const string& userId) = 0;

    // 退出群
    virtual bool quitGroup(const string& userId) = 0;

    // 踢出群成员
    virtual bool kickMember(const string& adminId, const string& userId) = 0;

    // 查询群成员（纯虚接口，具体展示形式可不同）
    virtual void queryMembers() const = 0;

    // 展示当前群的管理特色
    virtual void showFeatures() const = 0;

    // 获取群详细描述
    virtual string getDescription() const = 0;

    // 文件持久化接口
    virtual string toString() const;
    virtual void fromString(const string& str);
};

#endif
