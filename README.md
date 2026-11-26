# 自用 GKD 规则订阅

> ⚠️ **个人自用规则，非官方订阅。** 规则由个人根据自己手机的 App 版本（体重日记 3.9.2 / 下厨房 8.8.96）静态分析 APK 推导，未做全机型验证。他人使用风险自负。

GKD 规则订阅源，用于跳过开屏广告、关闭广告弹窗。

## 订阅链接

```
https://raw.githubusercontent.com/hjq13174698935-del/gkd-my-rule/main/gkd.json5
```

在 GKD 中：**订阅 → 右上角 `+` → 粘贴上面的链接 → 保存**。

添加后订阅列表里会显示名称 **「自用规则」**（当前版本以远端 `gkd.version.json` 为准）。

## 包含的规则

| 目标 | 组数 | 规则数 | 说明 |
| --- | --- | --- | --- |
| 全局（所有应用） | 1 | 5 | 通用开屏广告跳过，排除 12 个易误触应用 |
| 体重日记 `com.kproduce.weight` | 7 | 47 | 开屏/信息流/插屏广告 + 外卖锁拦截页退出 |
| 下厨房 `com.xiachufang` | 6 | 34 | 开屏（5 家广告 SDK）/信息流/插屏广告 |
| 闲鱼 `com.taobao.idlefish` | 5 | 33 | 开屏（自家+快手+凡泰 SDK）/信息流/插屏广告 |

合计 **119 条规则**。

## 为什么标明「自用」

- **基于特定版本静态分析**：控件 id 来自 `resources.arsc`，App 升级后可能失效
- **无快照验证**：没有真机快照链接，准确性靠用户反馈迭代
- **含个人偏好**：体重日记的「外卖锁拦截页」退出规则属于个人需求，不具通用性
- **部分组默认关闭**：升级付费弹窗、更新提示、评价提示 `enable: false`

## 更新方式（一条命令发布）

规则改好后，**不用手动加版本号**，一条命令全自动：生成 → 校验 → 自动版本 +1 → 提交 → 推送 → 验证。

```bash
node release.mjs "本次修改说明"
```

或双击 `release.cmd`。

- 版本号自动从远端 `gkd.version.json` 读取并 +1（无需记忆当前版本）
- 校验 119 条选择器全部通过、组名合规、key 无重复才会推送
- token 从 `D:\Harness\token.txt` 读取，不会出现在命令行或聊天记录里
- 依赖写死绝对路径（node / git），不依赖 PATH

## 更新方式（手动，备用）

1. 修改 `gkd.json5` 里的 `version`（每次 +1，必须是递增整数）
2. 提交推送
3. 手机 GKD 里对该订阅点「检查更新」

GKD 只在**新 version 大于本地 version** 时才拉取更新。

## 仓库结构

```
gkd.json5            # 订阅主文件（GKD 读取这个）
gkd.json             # 同内容严格 JSON 版
gkd.version.json     # 仅 {id, version}，配合 checkUpdateUrl 省流量
gen-sub.mjs          # 从源规则生成订阅的脚本（含校验）
release.mjs / release.cmd  # 一键发布：生成 → 提交 → 推送 → 验证
package.json         # 脚本依赖
```

源规则文件（`gkd-rules-kproduce/`、`gkd-rules-xiachufang/`、`gkd-rules-idlefish/`、`gkd-rules-global/`）保存在本地，未上传——它们是生成脚本的输入。

## 本地重新生成

```bash
pnpm install
pnpm gen
```

脚本会校验全部选择器、组名合规性与 key 唯一性，任一失败会打印出来。

## 免责声明

本仓库规则仅供个人学习与自用。使用者需自行承担因规则误触、App 异常等造成的一切后果。规则不修改任何 App，仅通过 GKD 的无障碍服务模拟点击。
