// 修规则 → 重新生成 → 提交 → 推送 → 验证，一条命令走完
// 前置：D:\Harness\token.txt 里有 93 位细粒度 PAT（Contents: Read and write）
// 使用：node release.mjs "修复说明"
// 环境：脚本内写死 node/git 绝对路径，不依赖 PATH
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = process.env.GKD_REPO || 'hjq13174698935-del/gkd-my-rule';
const TOKEN_FILE = path.join('D:\\', 'Harness', 'token.txt');
const TOKEN = fs.existsSync(TOKEN_FILE)
  ? fs.readFileSync(TOKEN_FILE, 'utf8').trim()
  : (process.env.GKD_GITHUB_TOKEN || '').trim();
const MSG = process.argv[2] || '更新规则';
const GIT = 'C:\\Program Files\\Git\\cmd\\git.exe';

if (!TOKEN || TOKEN.length !== 93) {
  console.error(
    `TOKEN 未就绪：请把 93 位 PAT 写入 ${TOKEN_FILE}（当前长度 ${TOKEN.length}）`,
  );
  process.exit(2);
}
console.log('token:', TOKEN.slice(0, 11) + '...' + TOKEN.slice(-4));

const run = (cmd, env = {}) => {
  console.log('>>', cmd.replace(/oauth2:[^@]+@/, 'oauth2:***@'));
  return execSync(cmd, {
    cwd: HERE,
    encoding: 'utf8',
    stdio: ['pipe', 'pipe', 'pipe'],
    env: { ...process.env, GIT_TERMINAL_PROMPT: '0', ...env },
  });
};
const step = (t) => console.log(`\n== ${t} ==`);

// Node fetch 在代理环境下偶发 TLS 中断，用 Node 自带重试封装
const fetchRetry = async (url, opts, tries = 3) => {
  let lastErr;
  for (let i = 0; i < tries; i++) {
    try {
      return await fetch(url, { ...opts, signal: AbortSignal.timeout(20000) });
    } catch (e) {
      lastErr = e;
      if (i < tries - 1) await new Promise((res) => setTimeout(res, 1200));
    }
  }
  throw lastErr;
};

step('1/3 重新生成订阅（校验选择器 + 自动版本号）');
let genOutput;
for (let i = 0; i < 3; i++) {
  try {
    genOutput = execSync(`"${process.execPath}" gen-sub.mjs`, {
      cwd: HERE,
      encoding: 'utf8',
      env: { ...process.env, GKD_GITHUB_TOKEN: TOKEN, GKD_REPO: REPO },
    });
    break;
  } catch (e) {
    console.error(`生成失败(第 ${i + 1} 次)：`, e.stderr || e.message);
    if (i === 2) process.exit(1);
    await new Promise((res) => setTimeout(res, 1500));
  }
}
console.log(genOutput.trim());
const sub = JSON.parse(fs.readFileSync(path.join(HERE, 'gkd.json'), 'utf8'));
const V = sub.version;

step(`2/3 提交并推送 v${V}`);
run(`"${GIT}" add -A`);
const diff = execSync(`"${GIT}" status --porcelain`, {
  cwd: HERE,
  encoding: 'utf8',
});
if (diff.trim()) {
  run(`"${GIT}" commit -m "v${V}: ${MSG}"`);
} else {
  console.log('无变更，跳过提交');
}
const pushUrl = `https://oauth2:${TOKEN}@github.com/${REPO}.git`;
run(`"${GIT}" -c credential.helper= push "${pushUrl}" main`);

step('3/3 验证远端');
const check = async () => {
  const r = await fetchRetry(
    `https://api.github.com/repos/${REPO}/contents/gkd.version.json?ref=main`,
    {
      headers: {
        Accept: 'application/vnd.github.raw+json',
        Authorization: `Bearer ${TOKEN}`,
      },
    },
  );
  if (!r.ok) throw new Error('HTTP ' + r.status);
  return await r.text();
};
let remoteV;
try {
  remoteV = (await check()).trim();
} catch (e) {
  console.log('⚠️ 远端验证失败(' + e.message + ')，但 push 已执行；请稍后重试验证');
  process.exit(0);
}
console.log('远端(仓库) gkd.version.json =', remoteV);
if (remoteV.includes(`"version":${V}`)) {
  console.log(`✅ 发布成功 v${V}：手机上 GKD → 订阅 → 对「自用规则」点「检查更新」`);
} else {
  console.log('⚠️ 仓库内容未更新，请检查 push 是否成功');
}
