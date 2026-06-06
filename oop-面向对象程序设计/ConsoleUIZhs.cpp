#include "ConsoleUIZhs.h"
#include <iostream>
#include <iomanip>
#include <conio.h>

HANDLE ConsoleUIZhs::hConsole = GetStdHandle(STD_OUTPUT_HANDLE);
WORD ConsoleUIZhs::defaultColor = 7;

void ConsoleUIZhs::initConsole() {
    hConsole = GetStdHandle(STD_OUTPUT_HANDLE);
    CONSOLE_SCREEN_BUFFER_INFO info;
    if (GetConsoleScreenBufferInfo(hConsole, &info)) {
        defaultColor = info.wAttributes;
    }
    // 设置窗口标题
    SetConsoleTitle(TEXT("腾*立体社交平台 - 即时通信系统"));
    // 设置代码页为UTF-8
    SetConsoleOutputCP(CP_UTF8);
}

void ConsoleUIZhs::clearScreen() {
    system("cls");
}

void ConsoleUIZhs::setColor(WORD color) {
    SetConsoleTextAttribute(hConsole, color);
}

void ConsoleUIZhs::resetColor() {
    SetConsoleTextAttribute(hConsole, defaultColor);
}

void ConsoleUIZhs::printTitle(const string& text) {
    setColor(UI_COLOR_TITLE);
    cout << text;
    resetColor();
}

void ConsoleUIZhs::printInfo(const string& text) {
    setColor(UI_COLOR_INFO);
    cout << text;
    resetColor();
}

void ConsoleUIZhs::printSuccess(const string& text) {
    setColor(UI_COLOR_SUCCESS);
    cout << text;
    resetColor();
}

void ConsoleUIZhs::printError(const string& text) {
    setColor(UI_COLOR_ERROR);
    cout << text;
    resetColor();
}

void ConsoleUIZhs::printWarning(const string& text) {
    setColor(UI_COLOR_WARNING);
    cout << text;
    resetColor();
}

void ConsoleUIZhs::printHighlight(const string& text) {
    setColor(COLOR_HIGHLIGHT);
    cout << text;
    resetColor();
}

void ConsoleUIZhs::printDim(const string& text) {
    setColor(UI_COLOR_DIM);
    cout << text;
    resetColor();
}

void ConsoleUIZhs::gotoxy(int x, int y) {
    COORD coord;
    coord.X = x;
    coord.Y = y;
    SetConsoleCursorPosition(hConsole, coord);
}

int ConsoleUIZhs::getConsoleWidth() {
    CONSOLE_SCREEN_BUFFER_INFO info;
    GetConsoleScreenBufferInfo(hConsole, &info);
    return info.srWindow.Right - info.srWindow.Left + 1;
}

int ConsoleUIZhs::getConsoleHeight() {
    CONSOLE_SCREEN_BUFFER_INFO info;
    GetConsoleScreenBufferInfo(hConsole, &info);
    return info.srWindow.Bottom - info.srWindow.Top + 1;
}

void ConsoleUIZhs::drawTopBorder(int width, const string& title) {
    setColor(UI_COLOR_TITLE);
    cout << "┌";
    for (int i = 0; i < width - 2; ++i) cout << "─";
    cout << "┐" << endl;

    if (!title.empty()) {
        cout << "│ ";
        resetColor();
        printTitle(title);
        setColor(UI_COLOR_TITLE);
        int pad = width - 4 - (int)title.size() * 2; // 中文字符宽度估算
        if (pad < 0) pad = 0;
        for (int i = 0; i < pad; ++i) cout << " ";
        cout << " │" << endl;

        cout << "├";
        for (int i = 0; i < width - 2; ++i) cout << "─";
        cout << "┤" << endl;
    }
    resetColor();
}

void ConsoleUIZhs::drawMiddleBorder(int width) {
    setColor(UI_COLOR_TITLE);
    cout << "├";
    for (int i = 0; i < width - 2; ++i) cout << "─";
    cout << "┤" << endl;
    resetColor();
}

void ConsoleUIZhs::drawBottomBorder(int width) {
    setColor(UI_COLOR_TITLE);
    cout << "└";
    for (int i = 0; i < width - 2; ++i) cout << "─";
    cout << "┘" << endl;
    resetColor();
}

void ConsoleUIZhs::drawLine(int width, const string& content, char align) {
    setColor(UI_COLOR_TITLE);
    cout << "│ ";
    resetColor();

    int contentWidth = 0;
    for (unsigned char c : content) {
        contentWidth += (c > 127) ? 2 : 1; // 中文字符占2宽度
    }

    int spaces = width - 4 - contentWidth;
    if (spaces < 0) spaces = 0;

    if (align == 'c') {
        int left = spaces / 2;
        int right = spaces - left;
        for (int i = 0; i < left; ++i) cout << " ";
        cout << content;
        for (int i = 0; i < right; ++i) cout << " ";
    } else if (align == 'r') {
        for (int i = 0; i < spaces; ++i) cout << " ";
        cout << content;
    } else {
        cout << content;
        for (int i = 0; i < spaces; ++i) cout << " ";
    }

    setColor(UI_COLOR_TITLE);
    cout << " │" << endl;
    resetColor();
}

void ConsoleUIZhs::drawEmptyLine(int width) {
    drawLine(width, "");
}

void ConsoleUIZhs::drawPanel(int width, const string& title, const vector<string>& lines) {
    drawTopBorder(width, title);
    for (const auto& line : lines) {
        drawLine(width, line);
    }
    drawBottomBorder(width);
}

void ConsoleUIZhs::drawMenuItem(int width, int number, const string& text, bool highlight) {
    setColor(UI_COLOR_TITLE);
    cout << "│ ";
    if (highlight) {
        resetColor();
        printHighlight("[" + to_string(number) + "] ");
        printHighlight(text);
        int pad = width - 6 - 4 - (int)text.size() * 2;
        if (pad < 0) pad = 0;
        for (int i = 0; i < pad; ++i) cout << " ";
    } else {
        resetColor();
        printInfo("[" + to_string(number) + "] ");
        cout << text;
        int pad = width - 6 - 4 - (int)text.size() * 2;
        if (pad < 0) pad = 0;
        for (int i = 0; i < pad; ++i) cout << " ";
    }
    setColor(UI_COLOR_TITLE);
    cout << " │" << endl;
    resetColor();
}

void ConsoleUIZhs::drawStatusBar(const string& leftText, const string& rightText) {
    int width = getConsoleWidth();
    setColor(UI_COLOR_DIM);
    cout << "─";
    for (int i = 1; i < width - 1; ++i) cout << "─";
    cout << "─" << endl;
    resetColor();

    cout << " ";
    printDim(leftText);
    int leftWidth = 0;
    for (unsigned char c : leftText) leftWidth += (c > 127) ? 2 : 1;
    int rightWidth = 0;
    for (unsigned char c : rightText) rightWidth += (c > 127) ? 2 : 1;
    int spaces = width - 2 - leftWidth - rightWidth;
    if (spaces < 0) spaces = 0;
    for (int i = 0; i < spaces; ++i) cout << " ";
    printDim(rightText);
    cout << endl;
}

void ConsoleUIZhs::pause(const string& msg) {
    cout << endl;
    printDim("  " + msg);
    while (_getch() != '\r'); // 等待回车
}

void ConsoleUIZhs::showWelcome() {
    clearScreen();
    int w = 60;
    drawTopBorder(w, "");
    drawEmptyLine(w);
    drawLine(w, "", 'c');
    drawLine(w, "  腾*立体社交平台", 'c');
    drawLine(w, "", 'c');
    drawLine(w, "  即时通信系统", 'c');
    drawLine(w, "", 'c');
    drawLine(w, "  C++ 面向对象课程设计", 'c');
    drawLine(w, "", 'c');
    drawEmptyLine(w);
    drawBottomBorder(w);
    cout << endl;
    printDim("  正在初始化系统数据...");
    cout << endl;
}
