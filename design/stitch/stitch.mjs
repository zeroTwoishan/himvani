// Thin Stitch CLI. The stitch-mcp-server wrapper (v1.0.7) sends stale args to get_screen,
// so we call the remote tools directly. API key is read from ~/.claude.json, never stored here.
// Usage: node stitch.mjs <cmd> [args]
//   list                                   list screens in the project
//   get <screenId> <outBase>               save <outBase>.webp (screenshot) and <outBase>.html
//   gen <DESKTOP|MOBILE|TABLET> <promptFile> [designSystemAssetId]
//   edit <screenId> <promptFile>
//   variants <screenId> <promptFile> <count> <REFINE|EXPLORE|REIMAGINE> [ASPECT,ASPECT]
//   ds-list | ds-upload <designMdFile> | project
import { StitchToolClient } from 'file:///C:/Users/ivank/AppData/Local/npm-cache/_npx/ff86ca5391c1fd7a/node_modules/@google/stitch-sdk/dist/src/index.js';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const PROJECT = process.env.STITCH_PROJECT || '15456917565346686486';
const cfg = JSON.parse(fs.readFileSync(path.join(os.homedir(), '.claude.json'), 'utf8'));
const apiKey = process.env.STITCH_API_KEY || cfg.mcpServers?.stitch?.env?.STITCH_API_KEY
  || Object.values(cfg.projects || {}).map(p => p.mcpServers?.stitch?.env?.STITCH_API_KEY).find(Boolean);
if (!apiKey) throw new Error('STITCH_API_KEY not found');
const c = new StitchToolClient({ apiKey });
const call = (name, args) => c.callTool(name, args);
const screenIds = r => JSON.stringify(r).match(/screens\/([0-9a-f]{32})/g)?.map(s => s.slice(8)) ?? [];

async function download(url, file) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${file}`);
  fs.writeFileSync(file, Buffer.from(await res.arrayBuffer()));
}

const [cmd, ...a] = process.argv.slice(2);
const out = x => console.log(typeof x === 'string' ? x : JSON.stringify(x, null, 2));

if (cmd === 'list') {
  const r = await call('list_screens', { projectId: PROJECT });
  out((r.screens || []).map(s => ({ id: s.name.split('/').pop(), title: s.title, device: s.deviceType })));
} else if (cmd === 'project') {
  out(await call('get_project', { name: `projects/${PROJECT}` }));
} else if (cmd === 'get') {
  const [id, base] = a;
  const s = await call('get_screen', { name: `projects/${PROJECT}/screens/${id}` });
  fs.mkdirSync(path.dirname(path.resolve(base)), { recursive: true });
  // lh3 URLs serve a downscaled image unless a size suffix is given.
  await download(s.screenshot.downloadUrl + '=w1440-rw', `${base}.webp`);
  await download(s.htmlCode.downloadUrl, `${base}.html`);
  out({ id, title: s.title, device: s.deviceType, img: `${base}.webp`, html: `${base}.html` });
} else if (cmd === 'gen') {
  const [deviceType, promptFile, designSystem] = a;
  const r = await call('generate_screen_from_text', {
    projectId: PROJECT, deviceType, prompt: fs.readFileSync(promptFile, 'utf8'),
    ...(designSystem ? { designSystem } : {}),
  });
  out({ screenIds: screenIds(r), text: JSON.stringify(r).slice(0, 800) });
} else if (cmd === 'edit') {
  const [id, promptFile] = a;
  const r = await call('edit_screens', { projectId: PROJECT, selectedScreenIds: [id], prompt: fs.readFileSync(promptFile, 'utf8') });
  out({ screenIds: screenIds(r).filter(x => x !== id), text: JSON.stringify(r).slice(0, 800) });
} else if (cmd === 'variants') {
  const [id, promptFile, count, creativeRange, aspects] = a;
  const r = await call('generate_variants', {
    projectId: PROJECT, selectedScreenIds: [id], prompt: fs.readFileSync(promptFile, 'utf8'),
    variantOptions: { variantCount: Number(count), creativeRange, ...(aspects ? { aspects: aspects.split(',') } : {}) },
  });
  out({ screenIds: screenIds(r).filter(x => x !== id), text: JSON.stringify(r).slice(0, 800) });
} else if (cmd === 'ds-list') {
  out(await call('list_design_systems', { projectId: PROJECT }));
} else if (cmd === 'ds-upload') {
  const md = fs.readFileSync(a[0]);
  const up = await call('upload_design_md', { projectId: PROJECT, designMdBase64: md.toString('base64') });
  out(up);
} else {
  console.error('unknown command; see header');
  process.exit(1);
}
