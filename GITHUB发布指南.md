# 发布到 GitHub 操作步骤

本目录已经是一个可直接推送的仓库内容。按下面任选一种方式发布。

## 前置：准备账号

- 需要一个 GitHub 账号（https://github.com/signup）
- 本机**没有** git/gh 命令，也**没有** GitHub 凭据，所以下面的操作要么在网页上做，要么先装 git

---

## 方式 A：网页上传（不用装任何工具，最快）

1. 打开 https://github.com/new
2. **Repository name** 填 `gkd-my-rules`
3. 选 **Public**（GKD 拉取 raw 链接，私有仓库需要 token，会麻烦很多）
4. **不要**勾选 "Add a README file"（否则会冲突）
5. 点 **Create repository**
6. 新仓库页面点 **uploading an existing file**
7. 把这几个文件拖进去：
   - `gkd.json5`
   - `gkd.json`
   - `gkd.version.json`
   - `README.md`
   - `package.json`
   - `gen-sub.mjs`
   - `.gitignore`
8. 底部 Commit message 填 `初始版本: 自用规则 v1`
9. 点 **Commit changes**

拿到订阅链接（把 `<用户名>` 换成你的）：

```
https://raw.githubusercontent.com/<用户名>/gkd-my-rules/main/gkd.json5
```

> 如果默认分支是 `master` 而不是 `main`，把链接里的 `main` 改掉。

### 验证链接能用

浏览器直接打开上面那个 raw 链接，应该看到纯 JSON5 文本（以 `{` 开头）。如果看到的是 GitHub 页面而不是代码，说明链接错了，要重新复制 Raw 地址。

---

## 方式 B：装 git 后命令行推送

1. 安装 Git for Windows：https://git-scm.com/download/win
2. 打开 PowerShell，进入本目录：

```powershell
cd "D:\user\文档\deepseek-harness\default-workspace\gkd-rules-merged"

git init
git add .
git commit -m "初始版本: 自用规则 v1"
git branch -M main
git remote add origin https://github.com/<用户名>/gkd-my-rules.git
git push -u origin main
```

3. 第一次 push 会弹出浏览器让你登录 GitHub 授权，按提示走完即可

---

## 方式 C：GitHub CLI（装 gh 后最省事）

```powershell
winget install GitHub.cli
gh auth login
cd "D:\user\文档\deepseek-harness\default-workspace\gkd-rules-merged"
gh repo create gkd-my-rules --public --source=. --push
```

---

## 发布后：在 GKD 里订阅

1. GKD → 底部「订阅」
2. 右上角 `+`
3. 粘贴 raw 链接
4. 保存

订阅列表里会显示 **「自用规则(非官方): 体重日记 + 下厨房 + 通用开屏」**。

### 重要：先清理本地规则

如果之前用「本地订阅 → 应用规则」粘贴过体重日记或下厨房，**先删掉那些本地条目**（长按进入批量删除），否则本地规则和订阅规则会同时生效，可能重复点击。

---

## 以后怎么更新规则

改规则 → 重新生成 → 改 version → 推送。

### 1. 改源规则

源文件在工作区上一级目录（未上传 GitHub）：

- `../gkd-rules-kproduce/app-rule.json5` — 体重日记
- `../gkd-rules-xiachufang/app-rule.json5` — 下厨房
- `../gkd-rules-global/global-rule.json5` — 全局

### 2. 重新生成

```powershell
cd "D:\user\文档\deepseek-harness\default-workspace\gkd-rules-merged"
pnpm install   # 首次需要
$env:SUB_VERSION="2"
pnpm gen
```

脚本会打印校验结果，`failed 0` 才算通过。

### 3. 推送

网页方式：打开仓库 → 点 `gkd.json5` → 右上角铅笔图标编辑 → 粘贴新内容 → Commit。

命令行方式：

```powershell
git add .
git commit -m "v2: 修正体重日记开屏广告"
git push
```

### 4. 手机更新

GKD → 订阅 → 点该订阅 → 「检查更新」

---

## 可选：配置自动检查更新

在 `gkd.json5` 里加两个字段可以让 GKD 先拉小文件判断版本，省流量：

```json5
updateUrl: 'https://raw.githubusercontent.com/<用户名>/gkd-my-rules/main/gkd.json5',
checkUpdateUrl: 'https://raw.githubusercontent.com/<用户名>/gkd-my-rules/main/gkd.version.json',
```

用环境变量注入，避免手改：

```powershell
$env:SUB_URL="https://raw.githubusercontent.com/<用户名>/gkd-my-rules/main/gkd.json5"
$env:SUB_CHECK_URL="https://raw.githubusercontent.com/<用户名>/gkd-my-rules/main/gkd.version.json"
$env:SUB_AUTHOR="<你的名字>"
$env:SUB_VERSION="2"
pnpm gen
```

注意：`gkd.version.json` 里的 version 也要跟着变，脚本会自动写。

---

## 常见问题

**Q: 链接打开是 GitHub 网页，不是代码**
用了普通页面地址。要用 `raw.githubusercontent.com` 开头的地址。

**Q: GKD 提示拉取失败**
- 确认仓库是 Public
- 确认文件名是 `gkd.json5`（注意扩展名，不是 `.json5.txt`）
- 确认分支名对（`main` 或 `master`）

**Q: 改了规则但手机没更新**
`version` 没加。GKD 只在新 version 更大时才更新。

**Q: 想改订阅显示的名字**
改 `gkd.json5` 里的 `name` 字段，同时 version +1。

**Q: 不想公开仓库**
可以，但 GKD 拉私有仓库需要带 token 的链接，比较麻烦。更简单的做法是保持 public，反正只是规则文件。
