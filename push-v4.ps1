# 一键把 v4 规则 push 到 GitHub（token 只需粘贴，不会保存到任何文件）
# 用法：双击 推送v4到GitHub.cmd，或在本目录运行：
#   powershell -NoProfile -ExecutionPolicy Bypass -File .\push-v4.ps1
$ErrorActionPreference = 'Stop'
Set-Location -LiteralPath $PSScriptRoot

Write-Host '=== 推送 GKD 订阅 v4 到 hjq13174698935-del/gkd-my-rule ===' -ForegroundColor Cyan
Write-Host '提示：细粒度 PAT 共 93 个字符，形如 github_pat_xxxxxx...（22位_59位）' -ForegroundColor DarkGray
Write-Host '如果没有 token：GitHub → Settings → Developer settings → Personal access tokens →' -ForegroundColor DarkGray
Write-Host 'Fine-grained tokens → Generate new token → 仓库选 gkd-my-rule → Contents: Read and write' -ForegroundColor DarkGray

$sec = Read-Host -AsSecureString -Prompt '粘贴 token 后回车（不会显示、不会写入文件）'
$tok = [System.Net.NetworkCredential]::new('', $sec).Password
$tok = $tok.Trim()

if ([string]::IsNullOrWhiteSpace($tok)) { Write-Host '没有输入 token，已取消。' -ForegroundColor Red; exit 1 }
if ($tok.Length -ne 93) {
  Write-Host "注意：你输入的 token 长度是 $($tok.Length)，细粒度 PAT 标准长度是 93；" -ForegroundColor Yellow
  Write-Host '     长度不对 GitHub 一定会拒绝，请确认复制完整（不要带空格/换行）。' -ForegroundColor Yellow
}

$env:GIT_TERMINAL_PROMPT = '0'
Write-Host '正在推送...' -ForegroundColor Cyan
git -c credential.helper= push "https://oauth2:$tok@github.com/hjq13174698935-del/gkd-my-rule.git" main
$code = $LASTEXITCODE
$tok = $null
Remove-Variable tok -ErrorAction SilentlyContinue

if ($code -eq 0) {
  Write-Host ''
  Write-Host '✅ 推送成功。手机上 GKD → 订阅 → 对「自用规则」点「检查更新」，版本会变成 4。' -ForegroundColor Green
} else {
  Write-Host ''
  Write-Host '❌ 推送失败。常见原因：token 不完整/已过期/没有该仓库的 Contents 写权限。' -ForegroundColor Red
}
Write-Host ''
Read-Host '按回车关闭'
