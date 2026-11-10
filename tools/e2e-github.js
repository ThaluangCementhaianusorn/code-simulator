/* e2e-github.js — ทดสอบโหมด GitHub Pages ↔ Google Sheet
 * เปิด dist/web/index.html พร้อม config.js ที่ชี้ไป Apps Script แล้วดักคำขอ POST ไปยัง script.google.com
 * ตอบด้วย Core.gs ตัวจริงที่รันใน Node (แทน doPost ของ Apps Script) เพื่อตรวจว่าหน้าเว็บอ่าน/เขียนข้อมูลผ่าน API จริง
 * NODE_PATH=<node_modules ที่มี puppeteer-core> node tools/e2e-github.js */
const http = require('http'), fs = require('fs'), path = require('path'), vm = require('vm');
const puppeteer = require('puppeteer-core');
const { makeMemStore } = require('./memstore');
const root = path.join(__dirname, '..');
const src = p => fs.readFileSync(path.join(root, 'src', p), 'utf8');

// "ฐานข้อมูล Google Sheet" จำลอง
const ctx = vm.createContext({ console, Math, JSON, Date });
vm.runInContext(src('Core.gs') + '\n' + src('Content.gs') + '\n' + src('Content2.gs') + '\nthis.coreApi = coreApi; this.seedSampleData_ = seedSampleData_;', ctx);
const sheet = makeMemStore({}, { url: () => 'https://script.google.com/macros/s/TEST/exec' });
sheet.setSecret('salt', 'gh-salt');
sheet.setSecret('teacherPassHash', sheet.hash('gh-salt:teacher:teacher1234'));
ctx.seedSampleData_(sheet, true);
const API = 'https://script.google.com/macros/s/TEST/exec';
let calls = 0;

const html = fs.readFileSync(path.join(root, 'dist', 'web', 'index.html'));
const server = http.createServer((q, r) => {
  if (q.url.startsWith('/config.js')) { r.writeHead(200, { 'content-type': 'text/javascript' }); r.end('window.CS_CONFIG = { apiUrl: ' + JSON.stringify(API) + ' };'); return; }
  r.writeHead(200, { 'content-type': 'text/html; charset=utf-8' }); r.end(html);
}).listen(0);
const URL0 = 'http://127.0.0.1:' + server.address().port + '/';
const CHROME = ['C:/Program Files/Google/Chrome/Application/chrome.exe', 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'].find(p => fs.existsSync(p));
const ok = (c, m) => { if (!c) throw new Error('ไม่ผ่าน: ' + m); console.log('  ✓ ' + m); };

(async () => {
  const browser = await puppeteer.launch({ executablePath: CHROME, headless: true });
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('dialog', d => d.accept());
  await page.setRequestInterception(true);
  page.on('request', req => {
    if (!req.url().startsWith(API)) return req.continue();
    if (req.method() === 'OPTIONS') return req.respond({ status: 405, body: '' }); // Apps Script ไม่รองรับ preflight
    calls++;
    let out;
    try { const b = JSON.parse(req.postData() || '{}'); out = { ok: true, data: JSON.parse(JSON.stringify(ctx.coreApi(sheet, b.method, b.payload || {}))) }; }
    catch (e) { out = { ok: false, error: e.message }; }
    req.respond({ status: 200, contentType: 'application/json', headers: { 'Access-Control-Allow-Origin': '*' }, body: JSON.stringify(out) });
  });
  const clickText = async (sel, text) => {
    await page.waitForFunction((s, t) => [...document.querySelectorAll(s)].some(e => e.textContent.includes(t) && e.offsetParent !== null), { timeout: 20000 }, sel, text);
    await page.evaluate((s, t) => { const e = [...document.querySelectorAll(s)].filter(e => e.textContent.includes(t) && e.offsetParent !== null).pop(); e.click(); }, sel, text);
  };
  await page.setViewport({ width: 1280, height: 860 });
  await page.goto(URL0); await page.evaluate(() => localStorage.clear()); await page.goto(URL0);
  await page.waitForSelector('#lc');
  ok(await page.evaluate(() => Api.mode() === 'github' && !window.DemoBackend), 'หน้าเว็บอยู่ในโหมด GitHub ↔ Google Sheet (ไม่ใช้ข้อมูลสาธิต)');
  ok(!(await page.evaluate(() => document.body.innerText.includes('โหมดสาธิต'))), 'ไม่แสดงคำแนะนำโหมดสาธิต');
  await page.type('#lc', '692010004'); await page.type('#lp', '1234');
  await clickText('button', 'เข้าสู่ระบบ');
  await page.waitForFunction(() => document.querySelectorAll('.mission').length === 10, { timeout: 20000 });
  ok((await page.$$('.mission.passed')).length === 3, 'อ่านความก้าวหน้าจาก Sheet ได้ (ผ่าน 3 ภารกิจ)');
  ok(calls >= 2, 'ทุกคำขอวิ่งผ่าน Apps Script API (' + calls + ' ครั้ง)');

  // เรียลไทม์: ครูแก้ข้อมูลใน Sheet โดยตรง แล้วนักศึกษาเห็นทันทีเมื่อกลับมาที่หน้า
  sheet.update('Units', 'U1', { title: 'สวัสดีโลก (แก้จาก Google Sheet)' });
  await page.evaluate(() => { Object.defineProperty(document, 'visibilityState', { value: 'visible', configurable: true }); document.dispatchEvent(new Event('visibilitychange')); });
  await page.waitForFunction(() => document.body.innerText.includes('แก้จาก Google Sheet'), { timeout: 20000 });
  ok(true, 'แก้ข้อมูลใน Sheet แล้วหน้าเว็บแสดงผลใหม่ทันที');

  // ครู: ตั้งค่า + ลบนักศึกษา เขียนกลับลง Sheet
  await page.goto(URL0 + '#admin');
  await page.waitForSelector('#tp'); await page.type('#tp', 'teacher1234');
  await clickText('button', 'เข้าสู่ระบบ');
  await page.waitForSelector('.kpi');
  ok((await page.$eval('.conn', e => e.textContent)).includes('GitHub'), 'หน้าครูแสดงสถานะเชื่อม GitHub ↔ Google Sheet');
  await clickText('.sidebar button', 'ตั้งค่า');
  await page.waitForSelector('#set-schoolName');
  await page.evaluate(() => { document.getElementById('set-schoolName').value = 'วิทยาลัยเทคนิคทดสอบ'; document.getElementById('set-passPercent').value = '65'; });
  await clickText('button', 'บันทึกการตั้งค่า');
  await page.waitForFunction(() => (document.getElementById('set-passPercent') || {}).dataset && document.getElementById('set-passPercent').dataset.orig === '65', { timeout: 20000 });
  ok(sheet.settings().schoolName === 'วิทยาลัยเทคนิคทดสอบ' && sheet.settings().passPercent === '65', 'บันทึกตั้งค่าลง Google Sheet แล้ว');
  await clickText('button', 'ทดสอบการเชื่อมต่อ');
  await page.waitForFunction(() => /เชื่อมต่อได้/.test(document.body.innerText), { timeout: 20000 });
  ok(true, 'ปุ่มทดสอบการเชื่อมต่อทำงาน');

  await clickText('.sidebar button', 'นักศึกษา');
  await page.waitForSelector('button[data-id]');
  await page.evaluate(() => document.querySelector('button[data-id]').click());
  await clickText('.modal button', 'ลบแบบซ่อน');
  await clickText('.modal button', 'ลบ');
  await page.waitForFunction(() => /นักศึกษาที่ลบแบบซ่อน/.test(document.body.innerText), { timeout: 20000 });
  const del = sheet.all('Students').filter(s => s.status === 'deleted');
  ok(del.length === 1, 'ลบนักศึกษาแบบซ่อน → สถานะ deleted ใน Sheet (' + del[0].studentCode + ')');
  await clickText('button', 'กู้คืน');
  await page.waitForFunction(() => !/นักศึกษาที่ลบแบบซ่อน/.test(document.body.innerText), { timeout: 20000 });
  ok(sheet.all('Students').every(s => s.status !== 'deleted'), 'กู้คืนนักศึกษาได้');

  await clickText('.sidebar button', 'เนื้อหา');
  await page.waitForSelector('.acts .act');
  await clickText('.acts .act b', 'แบบทดสอบภารกิจที่ 10');
  await clickText('.modal button', '🗑 ลบ');
  await clickText('.modal button', 'ลบ');
  await page.waitForFunction(() => !/แบบทดสอบภารกิจที่ 10/.test(document.body.innerText), { timeout: 20000 });
  ok(!sheet.all('Activities').some(a => a.id === 'U10-Q'), 'ลบกิจกรรมออกจาก Sheet แล้ว');
  ok(sheet.all('Log').some(l => l.action === 'ลบกิจกรรม'), 'บันทึกประวัติการลบในแท็บ Log');

  ok(errors.length === 0, 'ไม่มี JavaScript error' + (errors.length ? '\n' + errors.join('\n') : ''));
  await browser.close(); server.close();
})().catch(e => { console.error('✗ ' + e.message); process.exit(1); });
