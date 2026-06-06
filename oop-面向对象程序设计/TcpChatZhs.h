#ifndef TCP_CHAT_ZHS_H
#define TCP_CHAT_ZHS_H

#include <string>
#include <winsock2.h>
#pragma comment(lib, "ws2_32.lib")

using namespace std;

/**
 * @class TcpChatZhs
 * @brief QQ点对点TCP通信实现（选做）
 * 
 * 基于Winsock实现简单的服务端和客户端收发功能
 */
class TcpChatZhs {
private:
    SOCKET sock;        // 监听套接字（服务端）或连接套接字（客户端）
    SOCKET commSock;    // 通信套接字（accept后产生的客户端连接）
    bool isServer;
    bool initialized;

public:
    TcpChatZhs();
    ~TcpChatZhs();

    // 初始化Winsock
    bool initWinsock();
    void cleanupWinsock();

    // 服务端：绑定并监听端口
    bool startServer(int port);
    SOCKET acceptConnection();

    // 客户端：连接到服务端
    bool connectToServer(const string& ip, int port);

    // 发送消息
    bool sendMessage(const string& msg);

    // 接收消息
    string receiveMessage();

    // 关闭连接
    void closeConnection();

    bool isConnected() const;
};

#endif
