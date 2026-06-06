#ifndef USER_BASE_ZHS_H
#define USER_BASE_ZHS_H

#include <string>
#include <iostream>

using namespace std;

/**
 * @class UserBaseZhs
 * @brief 用户基类，封装所有微X服务共享的基本信息
 * 
 * 抽象出的基础类，被其它功能复用，体现抽象与封装层次
 */
class UserBaseZhs {
protected:
    string id;           // 号码ID
    string nickname;     // 昵称
    string birthDate;    // 出生时间（格式：YYYY-MM-DD）
    string registerDate; // T龄：号码申请时间（格式：YYYY-MM-DD）
    string location;     // 所在地

public:
    UserBaseZhs();
    UserBaseZhs(const string& id, const string& nickname, 
                const string& birthDate, const string& registerDate, 
                const string& location);
    virtual ~UserBaseZhs();

    // 基本信息的 getter/setter，提供接口保护
    string getId() const;
    void setId(const string& newId);

    string getNickname() const;
    void setNickname(const string& newNickname);

    string getBirthDate() const;
    void setBirthDate(const string& newBirthDate);

    string getRegisterDate() const;
    void setRegisterDate(const string& newRegisterDate);

    string getLocation() const;
    void setLocation(const string& newLocation);

    // 虚函数：显示用户信息，支持多态扩展
    virtual void displayInfo() const;

    // 从字符串解析（用于文件读写）
    virtual void fromString(const string& str);
    virtual string toString() const;
};

#endif
