@echo off
chcp 65001 >nul
echo.
echo 🏠 米奇giaogiao屋 · 部署脚本
echo ================================
echo.

REM 检查是否安装了 Git
where git >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ 未检测到 Git，请先安装 Git
    echo 下载地址：https://git-scm.com/downloads
    pause
    exit /b
)

REM 检查是否初始化了 Git 仓库
if not exist ".git" (
    echo 📦 初始化 Git 仓库...
    git init
    echo.
)

REM 添加所有文件
echo 📁 添加文件...
git add .
echo.

REM 提交更改
echo 💾 提交更改...
set /p commit_msg="请输入提交说明（直接回车使用默认说明）: "
if "%commit_msg%"=="" set commit_msg=更新米奇giaogiao屋内容
git commit -m "%commit_msg%"
echo.

REM 检查是否设置了远程仓库
git remote -v | findstr "origin" >nul
if %errorlevel% neq 0 (
    echo 🔗 请输入你的 GitHub 仓库地址：
    echo 示例：https://github.com/你的用户名/house.git
    set /p repo_url="仓库地址: "
    git remote add origin %repo_url%
    echo.
)

REM 推送到 GitHub
echo 🚀 推送到 GitHub...
git push -u origin main
echo.

echo ✅ 部署完成！
echo.
echo 📝 接下来请：
echo 1. 进入 GitHub 仓库 → Settings → Pages
echo 2. Source 选择 "Deploy from a branch"
echo 3. Branch 选择 "main" 和 "/ (root)"
echo 4. 点击 "Save"
echo 5. 等待几分钟后访问：https://你的用户名.github.io/house/
echo.
pause
