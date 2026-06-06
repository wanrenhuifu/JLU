#ifndef FRIEND_INFO_ZHS_H
#define FRIEND_INFO_ZHS_H

#include <string>
using namespace std;

/**
 * @class FriendInfoZhs
 * @brief 好友信息类
 * 
 * 封装好友关系中的额外信息，如备注、分组等
 */
class FriendInfoZhs {
private:
    string friendId;       // 好友ID
    string friendNickname; // 好友昵称
    string remark;         // 备注名
    string sourceService;  // 来源服务（QQ/微信/微博等）

public:
    FriendInfoZhs();
    FriendInfoZhs(const string& fid, const string& fnickname, 
                  const string& remark, const string& source);
    ~FriendInfoZhs();

    string getFriendId() const;
    void setFriendId(const string& fid);

    string getFriendNickname() const;
    void setFriendNickname(const string& fnickname);

    string getRemark() const;
    void setRemark(const string& rmk);

    string getSourceService() const;
    void setSourceService(const string& src);

    void display() const;

    string toString() const;
    void fromString(const string& str);
};

#endif
