import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import JSON5 from 'json5';
import { Selector, createDefaultSelectorTypeModel } from '@gkd-kit/selector';

const HERE = path.dirname(fileURLToPath(import.meta.url));
// 源规则在上一级目录（未上传到仓库），输出写在本目录
const SRC = path.resolve(HERE, '..');

const CATEGORIES = [
  { key: 0, name: '开屏广告' },
  { key: 1, name: '青少年模式' },
  { key: 2, name: '更新提示' },
  { key: 3, name: '评价提示' },
  { key: 4, name: '通知提示' },
  { key: 5, name: '定位提示' },
  { key: -1, name: '权限提示' },
  { key: 6, name: '局部广告' },
  { key: 7, name: '全屏广告' },
  { key: 8, name: '分段广告' },
  { key: 9, name: '功能类' },
];

const read = (p) => JSON5.parse(fs.readFileSync(path.join(SRC, p), 'utf8'));
const kp = read('gkd-rules-kproduce/app-rule.json5');
const xcf = read('gkd-rules-xiachufang/app-rule.json5');
const fish = read('gkd-rules-idlefish/app-rule.json5');
const glb = read('gkd-rules-global/global-rule.json5');

// 全局规则里的 apps 追加已有专用规则的包
const disabled = new Set(glb.apps.map((a) => a.id));
for (const id of [kp.id, xcf.id, fish.id]) {
  if (!disabled.has(id)) glb.apps.push({ id, enable: false });
}

const VERSION = Number(process.env.SUB_VERSION || 1);

const sub = {
  id: 202611250930,
  name: process.env.SUB_NAME || '自用规则',
  version: VERSION,
  author: process.env.SUB_AUTHOR || 'local',
  updateUrl: process.env.SUB_URL || undefined,
  checkUpdateUrl: process.env.SUB_CHECK_URL || undefined,
  supportUri: process.env.SUB_SUPPORT || 'https://gkd.li/',
  categories: CATEGORIES,
  globalGroups: [glb],
  apps: [kp, xcf, fish],
};

// ---- 校验 ----
const typeModel = createDefaultSelectorTypeModel();
let n = 0;
let bad = 0;
const check = (matches, where) => {
  n++;
  try {
    const res = Selector.parse(matches);
    if (res.error && !res.value) throw res.error;
    const sel = res.value;
    sel.toString();
    const terr = sel.getTypeErrors(typeModel);
    if (terr && terr.length) throw new Error('type errors: ' + terr.length);
  } catch (e) {
    bad++;
    console.log('FAIL', where, '|', matches, '|', e.message);
  }
};
for (const g of sub.globalGroups) for (const r of g.rules) check(r.matches, 'global:' + g.key);
for (const a of sub.apps) {
  for (const g of a.groups) for (const r of g.rules) check(r.matches, a.id + ':' + g.key);
}
console.log('selectors checked', n, 'failed', bad);

// 组名必须等于分类名或以「分类名-」开头
const catNames = new Set(CATEGORIES.map((c) => c.name));
const badNames = [];
for (const a of sub.apps) {
  for (const g of a.groups) {
    const ok = [...catNames].some(
      (c) => g.name === c || g.name.startsWith(c + '-'),
    );
    if (!ok) badNames.push(a.id + ':' + g.name);
  }
}
console.log('bad group names', badNames.length, badNames.join(', '));

// 组 key 唯一性
for (const a of sub.apps) {
  const keys = a.groups.map((g) => g.key);
  if (keys.length !== new Set(keys).size) console.log('DUP GROUP KEY', a.id);
}
// 规则 key 唯一性
for (const a of sub.apps) {
  for (const g of a.groups) {
    const keys = g.rules.map((r) => r.key);
    if (keys.length !== new Set(keys).size) {
      console.log('DUP RULE KEY', a.id, g.key, g.name);
    }
  }
}

const json5 = JSON5.stringify(sub, null, 2);
const write = (name, text) =>
  fs.writeFileSync(path.join(HERE, name), text, 'utf8');
write('gkd.json5', json5 + '\n');
write('gkd.json', JSON.stringify(sub, null, 2) + '\n');
// 检查更新用小文件
write(
  'gkd.version.json',
  JSON.stringify({ id: sub.id, version: sub.version }) + '\n',
);
console.log(
  'version', sub.version,
  'apps', sub.apps.length,
  'globalGroups', sub.globalGroups.length,
  'chars', json5.length,
);
