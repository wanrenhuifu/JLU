@echo off
chcp 65001 >nul
echo ===== 编译 MUD 游戏 =====
if not exist out mkdir out
javac -encoding UTF-8 -d out src/mudgame/model/*.java src/mudgame/util/*.java src/mudgame/server/*.java src/mudgame/client/*.java
if %errorlevel% equ 0 (
    echo ===== 编译成功！=====
) else (
    echo ===== 编译失败，请检查 JDK 是否已安装 ====
)
pause
