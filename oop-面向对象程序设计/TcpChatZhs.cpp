#include "TcpChatZhs.h"
#include <iostream>

TcpChatZhs::TcpChatZhs() : sock(INVALID_SOCKET), commSock(INVALID_SOCKET), isServer(false), initialized(false) {}

TcpChatZhs::~TcpChatZhs() {
    closeConnection();
    if (initialized) cleanupWinsock();
}

bool TcpChatZhs::initWinsock() {
    WSADATA wsaData;
    int result = WSAStartup(MAKEWORD(2, 2), &wsaData);
    if (result != 0) {
        cout << "[错误] WSAStartup 失败: " << result << endl;
        return false;
    }
    initialized = true;
    return true;
}

void TcpChatZhs::cleanupWinsock() {
    WSACleanup();
    initialized = false;
}

bool TcpChatZhs::startServer(int port) {
    if (!initialized && !initWinsock()) return false;

    sock = socket(AF_INET, SOCK_STREAM, 0);
    if (sock == INVALID_SOCKET) {
        cout << "[错误] 创建套接字失败！" << endl;
        return false;
    }

    sockaddr_in addr;
    addr.sin_family = AF_INET;
    addr.sin_addr.s_addr = INADDR_ANY;
    addr.sin_port = htons(port);

    if (bind(sock, (sockaddr*)&addr, sizeof(addr)) == SOCKET_ERROR) {
        cout << "[错误] 绑定端口失败！" << endl;
        closesocket(sock);
        sock = INVALID_SOCKET;
        return false;
    }

    if (listen(sock, 1) == SOCKET_ERROR) {
        cout << "[错误] 监听失败！" << endl;
        closesocket(sock);
        sock = INVALID_SOCKET;
        return false;
    }

    isServer = true;
    cout << "[服务端] 已在端口 " << port << " 启动监听..." << endl;
    return true;
}

SOCKET TcpChatZhs::acceptConnection() {
    sockaddr_in clientAddr;
    int addrLen = sizeof(clientAddr);
    commSock = accept(sock, (sockaddr*)&clientAddr, &addrLen);
    if (commSock == INVALID_SOCKET) {
        cout << "[错误] 接受连接失败！" << endl;
        return INVALID_SOCKET;
    }
    cout << "[服务端] 客户端已连接！" << endl;
    return commSock;
}

bool TcpChatZhs::connectToServer(const string& ip, int port) {
    if (!initialized && !initWinsock()) return false;

    sock = socket(AF_INET, SOCK_STREAM, 0);
    if (sock == INVALID_SOCKET) {
        cout << "[错误] 创建套接字失败！" << endl;
        return false;
    }

    sockaddr_in addr;
    addr.sin_family = AF_INET;
    addr.sin_port = htons(port);
    addr.sin_addr.s_addr = inet_addr(ip.c_str());

    if (connect(sock, (sockaddr*)&addr, sizeof(addr)) == SOCKET_ERROR) {
        cout << "[错误] 连接服务器失败！" << endl;
        closesocket(sock);
        sock = INVALID_SOCKET;
        return false;
    }

    isServer = false;
    cout << "[客户端] 已连接到 " << ip << ":" << port << endl;
    return true;
}

bool TcpChatZhs::sendMessage(const string& msg) {
    SOCKET target = (commSock != INVALID_SOCKET) ? commSock : sock;
    if (target == INVALID_SOCKET) return false;
    int result = send(target, msg.c_str(), (int)msg.length(), 0);
    return result != SOCKET_ERROR;
}

string TcpChatZhs::receiveMessage() {
    SOCKET target = (commSock != INVALID_SOCKET) ? commSock : sock;
    if (target == INVALID_SOCKET) return "";
    char buffer[1024];
    int received = recv(target, buffer, sizeof(buffer) - 1, 0);
    if (received > 0) {
        buffer[received] = '\0';
        return string(buffer);
    }
    return "";
}

void TcpChatZhs::closeConnection() {
    if (commSock != INVALID_SOCKET) {
        closesocket(commSock);
        commSock = INVALID_SOCKET;
    }
    if (sock != INVALID_SOCKET) {
        closesocket(sock);
        sock = INVALID_SOCKET;
    }
}

bool TcpChatZhs::isConnected() const {
    return sock != INVALID_SOCKET;
}
