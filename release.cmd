@echo off
chcp 65001 >nul
rem 用法：双击运行，或 release.cmd "修复说明"
setlocal
set NODE="D:\program files (x86)\deepseek harness\resources\runtime\primary-runtime\dependencies\node\bin\node.exe"
cd /d "%~dp0"
if "%~1"=="" (
  %NODE% release.mjs "更新规则"
) else (
  %NODE% release.mjs "%~1"
)
echo.
echo 完成。手机上 GKD → 订阅 → 对「自用规则」点「检查更新」。
pause
