#include "FileManagerZhs.h"
#include <fstream>
#include <iostream>

FileManagerZhs::FileManagerZhs()
    : userFile("data/users.txt"), groupFile("data/groups.txt") {}

FileManagerZhs::FileManagerZhs(const string& userFilePath, const string& groupFilePath)
    : userFile(userFilePath), groupFile(groupFilePath) {}

FileManagerZhs::~FileManagerZhs() {}

void FileManagerZhs::setUserFile(const string& path) { userFile = path; }
void FileManagerZhs::setGroupFile(const string& path) { groupFile = path; }

bool FileManagerZhs::loadData(PlatformManagerZhs& platform) {
    ifstream uf(userFile);
    if (!uf.is_open()) {
        cout << "[提示] 用户数据文件不存在，将创建新文件：" << userFile << endl;
        return false;
    }

    string line;
    while (getline(uf, line)) {
        if (line.empty()) continue;
        // 解析服务类型（第6个字段）
        string parts[20];
        int idx = 0;
        size_t pos = 0;
        string s = line;
        while ((pos = s.find('|')) != string::npos && idx < 20) {
            parts[idx++] = s.substr(0, pos);
            s.erase(0, pos + 1);
        }
        if (idx < 20) parts[idx++] = s;

        if (idx < 7) continue; // 格式错误

        string id = parts[0];
        string nickname = parts[1];
        string birth = parts[2];
        string reg = parts[3];
        string loc = parts[4];
        string svcName = parts[5];

        if (svcName == "QQ") {
            platform.openQQService(id, nickname, birth, reg, loc);
        } else if (svcName == "微信") {
            // 微信格式：base#wechatId|boundQQId
            // parts[7] = friends#wechatId, parts[8] = boundQQId
            string fAndWx = (idx > 7) ? parts[7] : "";
            size_t hashPos = fAndWx.rfind('#');
            string wechatId = (hashPos != string::npos) ? fAndWx.substr(hashPos + 1) : id;
            string boundQQ = (idx > 8) ? parts[8] : id;
            platform.openWeChatService(boundQQ, wechatId, nickname, birth, reg, loc);
        } else if (svcName == "微博") {
            platform.openWeiboService(id, nickname, birth, reg, loc);
        } else {
            platform.openWeiXService(id, svcName, nickname, birth, reg, loc);
        }

        string lookupId = id;
        if (svcName == "微信") {
            lookupId = (idx > 8) ? parts[8] : id;
        }
        MicroServiceBaseZhs* svc = platform.getService(lookupId, svcName);
        if (svc) {
            svc->fromString(line);
        }
    }
    uf.close();

    ifstream gf(groupFile);
    if (!gf.is_open()) {
        cout << "[提示] 群数据文件不存在，将创建新文件：" << groupFile << endl;
        return true; // 用户数据可能已加载
    }
    while (getline(gf, line)) {
        if (line.empty()) continue;
        size_t pos = line.find('|');
        if (pos == string::npos) continue;
        string gid = line.substr(0, pos);
        string rest = line.substr(pos + 1);
        size_t p2 = rest.find('|');
        string gname = (p2 != string::npos) ? rest.substr(0, p2) : rest;

        // 查找类型标识（第4个字段）
        string parts[10];
        int idx = 0;
        size_t pp = 0;
        string ss = line;
        while ((pp = ss.find('|')) != string::npos && idx < 10) {
            parts[idx++] = ss.substr(0, pp);
            ss.erase(0, pp + 1);
        }
        if (idx < 10) parts[idx++] = ss;
        string gtype = (idx > 3) ? parts[3] : "QQ";

        if (gtype == "微信") {
            platform.createWeChatGroup(gid, gname, parts[2]);
        } else {
            platform.createQQGroup(gid, gname, parts[2]);
        }
        GroupBaseZhs* grp = platform.getGroup(gid);
        if (grp) {
            grp->fromString(line);
        }
    }
    gf.close();
    cout << "[成功] 数据加载完成！" << endl;
    return true;
}

bool FileManagerZhs::saveData(const PlatformManagerZhs& platform) {
    ofstream uf(userFile);
    if (!uf.is_open()) {
        cout << "[错误] 无法打开用户数据文件进行写入：" << userFile << endl;
        return false;
    }
    for (const auto& pair : platform.getServicesMap()) {
        uf << pair.second->toString() << endl;
    }
    uf.close();

    ofstream gf(groupFile);
    if (!gf.is_open()) {
        cout << "[错误] 无法打开群数据文件进行写入：" << groupFile << endl;
        return false;
    }
    for (const auto& pair : platform.getGroupsMap()) {
        gf << pair.second->toString() << endl;
    }
    gf.close();
    cout << "[成功] 数据已保存到文件！" << endl;
    return true;
}
