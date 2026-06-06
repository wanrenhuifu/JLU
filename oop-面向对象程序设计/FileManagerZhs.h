#ifndef FILE_MANAGER_ZHS_H
#define FILE_MANAGER_ZHS_H

#include "PlatformManagerZhs.h"
#include <string>

using namespace std;

/**
 * @class FileManagerZhs
 * @brief 文件管理类，负责数据的持久化读写
 * 
 * 体现I/O操作支持和断电保存功能
 */
class FileManagerZhs {
private:
    string userFile;   // 用户/服务数据文件路径
    string groupFile;  // 群数据文件路径

public:
    FileManagerZhs();
    FileManagerZhs(const string& userFilePath, const string& groupFilePath);
    ~FileManagerZhs();

    // 加载数据到平台
    bool loadData(PlatformManagerZhs& platform);

    // 保存数据到文件
    bool saveData(const PlatformManagerZhs& platform);

    // 文件路径设置
    void setUserFile(const string& path);
    void setGroupFile(const string& path);
};

#endif
