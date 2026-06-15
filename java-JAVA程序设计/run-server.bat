@echo off
chcp 65001 >nul
echo ===== 启动 MUD 服务器 ====
if not exist out (
    echo 请先运行 compile.bat 编译项目
    pause
    exit /b
)
java -Dfile.encoding=UTF-8 -cp out mudgame.server.MudServer
pause
