#ifndef MICRO_SERVICE_BASE_ZHS_H
#define MICRO_SERVICE_BASE_ZHS_H

#include "UserBaseZhs.h"
#include "FriendInfoZhs.h"
#include "GroupBaseZhs.h"
#include <vector>

using namespace std;

/**
 * @class MicroServiceBaseZhs
 * @brief 微X服务基类，继承UserBaseZhs
 * 
 * 封装各微X服务的公共属性：好友列表、群列表、登录状态等
 * 体现继承复用和接口保护
 */
class MicroServiceBaseZhs : public UserBaseZhs {
protected:
    vector<FriendInfoZhs> friends;    // 好友列表
    vector<string> groupIds;          // 所属群ID列表
    bool loggedIn;                    // 登录状态
    string serviceName;               // 服务名称（QQ/微信/微博等）

public:
    MicroServiceBaseZhs();
    MicroServiceBaseZhs(const string& id, const string& nickname,
                        const string& birthDate, const string& registerDate,
                        const string& location, const string& serviceName);
    virtual ~MicroServiceBaseZhs();

    // 服务名称
    string getServiceName() const;
    void setServiceName(const string& name);

    // 登录状态
    bool isLoggedIn() const;
    void setLoginStatus(bool status);

    // ========== 好友管理接口 ==========
    virtual bool addFriend(const FriendInfoZhs& friendInfo);
    virtual bool removeFriend(const string& friendId);
    virtual bool modifyFriendRemark(const string& friendId, const string& newRemark);
    virtual FriendInfoZhs* findFriend(const string& friendId);
    virtual void listFriends() const;
    virtual bool hasFriend(const string& friendId) const;

    // ========== 群管理接口 ==========
    virtual bool joinGroup(const string& groupId);
    virtual bool quitGroup(const string& groupId);
    virtual bool isInGroup(const string& groupId) const;
    virtual void listGroups() const;

    // 获取共同好友（与另一个服务）
    virtual vector<string> getCommonFriends(const MicroServiceBaseZhs& other) const;

    // 根据好友ID推荐（跨服务）
    virtual vector<string> getFriendRecommendations(const MicroServiceBaseZhs& other) const;

    // 虚函数：展示服务特色
    virtual void showServiceFeatures() const;

    // 文件持久化扩展
    virtual void fromString(const string& str) override;
    virtual string toString() const override;

    // 序列化好友列表
    string friendsToString() const;
    void friendsFromString(const string& str);
};

#endif
