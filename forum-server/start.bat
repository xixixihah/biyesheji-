@echo off
chcp 65001
echo 正在启动服务器...

:: 检查是否安装了 PM2
where pm2 >nul 2>nul
if %errorlevel% neq 0 (
    echo 正在安装 PM2...
    npm install -g pm2
)

:: 使用 PM2 启动服务器
echo 正在启动 PM2...
pm2 start ecosystem.config.js

:: 显示日志
pm2 logs forum-server

pause 