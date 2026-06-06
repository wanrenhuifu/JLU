#ifndef CONSOLE_UI_ZHS_H
#define CONSOLE_UI_ZHS_H

#include <string>
#include <vector>
#include <windows.h>

using namespace std;

/**
 * @class ConsoleUIZhs
 * @brief 控制台伪可视化界面类
 * 
 * 基于Windows控制台API实现颜色、边框、光标定位等美化效果
 * 不依赖MFC或第三方图形库，纯控制台方案B实现
 */
class ConsoleUIZhs {
public:
    // 初始化控制台（启用颜色、设置窗口大小等）
    static void initConsole();

    // 清屏
    static void clearScreen();

    // 设置输出颜色
    static void setColor(WORD color);
    static void resetColor();

    // 常用颜色快捷方法
    static void printTitle(const string& text);
    static void printInfo(const string& text);
    static void printSuccess(const string& text);
    static void printError(const string& text);
    static void printWarning(const string& text);
    static void printHighlight(const string& text);
    static void printDim(const string& text);

    // 绘制边框
    static void drawTopBorder(int width, const string& title = "");
    static void drawMiddleBorder(int width);
    static void drawBottomBorder(int width);
    static void drawLine(int width, const string& content = "", char align = 'l'); // l/c/r
    static void drawEmptyLine(int width);

    // 绘制完整面板
    static void drawPanel(int width, const string& title, const vector<string>& lines);

    // 绘制菜单选项
    static void drawMenuItem(int width, int number, const string& text, bool highlight = false);

    // 光标定位
    static void gotoxy(int x, int y);

    // 获取控制台尺寸
    static int getConsoleWidth();
    static int getConsoleHeight();

    // 暂停等待（替代system pause）
    static void pause(const string& msg = "按 Enter 键继续...");

    // 绘制欢迎动画
    static void showWelcome();

    // 绘制状态栏
    static void drawStatusBar(const string& leftText, const string& rightText = "");

private:
    static HANDLE hConsole;
    static WORD defaultColor;
};

// 颜色常量定义（加前缀避免与Windows宏冲突）
const WORD UI_COLOR_DEFAULT    = 7;   // 白灰
const WORD UI_COLOR_TITLE      = 11;  // 亮青
const WORD UI_COLOR_HIGHLIGHT  = 14;  // 亮黄
const WORD UI_COLOR_SUCCESS    = 10;  // 亮绿
const WORD UI_COLOR_ERROR      = 12;  // 亮红
const WORD UI_COLOR_WARNING    = 13;  // 亮紫
const WORD UI_COLOR_INFO       = 9;   // 蓝
const WORD UI_COLOR_DIM        = 8;   // 灰

#endif
