/* e2e.js — ทดสอบเว็บสาธิตในเบราว์เซอร์จริง (Chrome + puppeteer-core)
 * NODE_PATH=<node_modules ที่มี puppeteer-core> node tools/e2e.js [โฟลเดอร์เก็บภาพหน้าจอ] */
const http = require('http'), fs = require('fs'), path = require('path');
const puppeteer = require('puppeteer-core');
const shots = process.argv[2] || path.join(__dirname, '..', 'dist', 'shots');
fs.mkdirSync(shots, { recursive: true });
const html = fs.readFileSync(path.join(__dirname, '..', 'dist', 'demo.html'));
const server = http.createServer((q, r) => { r.writeHead(200, { 'content-type': 'text/html; charset=utf-8' }); r.end(html); }).listen(0);
const URL0 = 'http://127.0.0.1:' + server.address().port + '/';
const CHROME = ['C:/Program Files/Google/Chrome/Application/chrome.exe', 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'].find(p => fs.existsSync(p));
const sleep = ms => new Promise(r => setTimeout(r, ms));
let step = 0;

(async () => {
  const browser = await puppeteer.launch({ executablePath: CHROME, headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage(); global.__page = page;
  const errors = [];
  page.on('pageerror', e => { if (!/nmae is not defined/.test(e.message)) errors.push('pageerror: ' + e.message); }); // nmae = error ที่ตั้งใจให้เกิดในหน้าเว็บของผู้เรียน
  page.on('console', m => { if (m.type() === 'error') errors.push('console: ' + m.text()); });
  page.on('dialog', d => d.accept());
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  const shot = async name => { await sleep(300); await page.screenshot({ path: path.join(shots, String(++step).padStart(2, '0') + '-' + name + '.png') }); };
  const clickText = async (sel, text) => {
    await page.waitForFunction((s, t) => [...document.querySelectorAll(s)].some(e => e.textContent.includes(t) && e.offsetParent !== null), { timeout: 20000 }, sel, text);
    await page.evaluate((s, t) => { const e = [...document.querySelectorAll(s)].filter(e => e.textContent.includes(t) && e.offsetParent !== null).pop(); e.scrollIntoView({ block: 'center' }); e.click(); }, sel, text);
  };
  const confirmOk = async label => { await page.waitForSelector('.modal'); await clickText('.modal button', label); };
  const ok = (cond, msg) => { if (!cond) throw new Error('ไม่ผ่าน: ' + msg); console.log('  ✓ ' + msg); };

  await page.evaluateOnNewDocument(() => { const _t = setInterval(() => { const b = document.getElementById('toast'); if (b && !b.__o) { b.__o = new MutationObserver(() => b.childNodes.forEach(n => { if (!n.__l) { n.__l = 1; console.log('TOAST: ' + n.textContent); } })); b.__o.observe(b, { childList: true }); } }, 50); });
  page.on('console', m => { if (m.text().startsWith('TOAST')) console.log('   ' + m.text()); });
  await page.goto(URL0); await page.evaluate(() => localStorage.clear()); await page.goto(URL0);
  await page.waitForSelector('#lc');
  await shot('login');
  await page.type('#lc', '692010001'); await page.type('#lp', '1234');
  await clickText('button', 'เข้าสู่ระบบ');
  await page.waitForSelector('.mission');
  ok((await page.$$('.mission')).length === 10, 'หน้าแรกมี 10 ภารกิจ');
  ok((await page.$$('.mission.locked')).length === 9, 'ภารกิจ 2–10 ล็อก');
  await shot('home');

  // หน้าแรก: ระบบตัวอย่าง 10 ระบบ
  await clickText('.showcase-cta', 'ระบบตัวอย่าง');
  await page.waitForSelector('.sc-card');
  ok((await page.$$('.sc-card')).length === 10, 'แกลเลอรีมีระบบตัวอย่าง 10 ระบบ');
  await shot('gallery');
  await clickText('.sc-card b', 'ระบบเรียกคิว');
  await page.waitForSelector('.wsim .CodeMirror');
  await clickText('.wsim-seg button', 'หน้าจอ');
  const inFrame = async sel => { for (const fr of page.frames()) { try { const t = await fr.evaluate(s => document.querySelector(s) ? document.querySelector(s).textContent : null, sel); if (t) return t; } catch (e) {} } return ''; };
  await page.waitForFunction(() => true); let qt = ''; for (let i = 0; i < 60 && !qt.includes('A00'); i++) { await sleep(500); qt = await inFrame('.num'); }
  ok(qt.includes('---') || qt.includes('A00'), 'ระบบเรียกคิวรันบนหน้าจอมือถือ (' + qt.trim() + ')');
  await shot('showcase-phone');
  await page.click('.topbar .back');
  await page.waitForSelector('.sc-card');
  await clickText('.bottomnav button', 'ภารกิจ');
  await page.waitForSelector('.mission');

  await clickText('.mission h3', 'เว็บแอปพลิเคชันและ HTML5');
  await page.waitForSelector('.act');
  await shot('unit');
  await clickText('.act b', 'ใบความรู้ที่ 1');
  await page.waitForSelector('.wsim .CodeMirror');
  ok((await page.$$('.wsim')).length === 4, 'ใบความรู้มีตัวจำลองหน้าจอมือถือ 4 จุด');
  await page.evaluate(() => [...document.querySelectorAll('.wsim')[0].querySelectorAll('button')].find(b => b.textContent.includes('▶ รัน')).click());
  let h1 = ''; for (let i = 0; i < 40 && !h1.includes('สวัสดีชาวโลก'); i++) { await sleep(300); for (const fr of page.frames()) { try { const t = await fr.evaluate(() => document.body ? document.body.innerText : ''); if (t.includes('สวัสดีชาวโลก')) h1 = t; } catch (e) {} } }
  ok(h1.includes('สวัสดีชาวโลก'), 'รัน HTML แล้วแสดงบนหน้าจอมือถือ');
  await page.evaluate(() => document.querySelectorAll('.wsim')[0].scrollIntoView());
  await shot('knowledge-run');
  // error ภาษาไทย + เลขบรรทัด
  await page.evaluate(() => { document.querySelectorAll('.wsim .CodeMirror')[0].CodeMirror.setValue('<p>x</p>\n<script>\nconsole.log(nmae);\n</' + 'script>'); });
  await page.evaluate(() => [...document.querySelectorAll('.wsim')[0].querySelectorAll('button')].find(b => b.textContent.includes('▶ รัน')).click());
  await page.waitForFunction(() => document.querySelector('.wsim .wcon').textContent.includes('ไม่รู้จักชื่อ nmae'), { timeout: 20000 });
  ok(await page.evaluate(() => document.querySelector('.wsim .wcon').textContent.includes('บรรทัด 3')), 'แปล error เป็นภาษาไทยพร้อมเลขบรรทัด');
  await shot('thai-error');
  await clickText('button', 'อ่านจบแล้ว');
  await page.waitForSelector('.act');

  // ใบงาน: วางเฉลย ตรวจตัวอย่าง แล้วส่ง
  const seed = await page.evaluate(() => getSeedCourse_());
  const data = id => seed.units.flatMap(u => u.activities).find(a => a.id === id).data;
  for (const [id, title] of [['U1-W', 'ใบงานที่ 1'], ['U1-P', 'แบบฝึกปฏิบัติที่ 1']]) {
    await clickText('.act b', title);
    await page.waitForSelector('.wsim .CodeMirror');
    await page.evaluate(sols => document.querySelectorAll('.wsim .CodeMirror').forEach((c, i) => c.CodeMirror.setValue(sols[i])), data(id).tasks.map(t => t.solution));
    await clickText('.wsim .tools button', 'ตรวจกับตัวอย่าง');
    await page.waitForFunction(() => /ผ่าน \d+\/\d+ รายการ/.test(document.body.textContent), { timeout: 30000 });
    if (id === 'U1-W') await shot('worksheet-check');
    await clickText('.sticky-foot button', 'ส่งงาน');
    await confirmOk('ส่งงาน');
    await page.waitForFunction(() => /ได้ \d+ \/ \d+ คะแนน/.test((document.querySelector('.modal') || {}).textContent || ''), { timeout: 60000 });
    const txt = await page.evaluate(() => document.querySelector('.modal h2').textContent);
    ok(/ได้ (\d+) \/ \1 คะแนน/.test(txt), title + ' ส่งแล้วได้คะแนนเต็ม (' + txt + ')');
    if (id === 'U1-W') await shot('worksheet-result');
    await clickText('.modal button', 'กลับไปที่ภารกิจ');
    await page.waitForSelector('.act');
  }

  // แบบทดสอบ
  await clickText('.act b', 'แบบทดสอบภารกิจที่ 1');
  await clickText('button', 'เริ่มทำแบบทดสอบ');
  await confirmOk('เริ่มเลย');
  await page.waitForSelector('.q');
  await page.evaluate(qs => {
    qs.forEach(q => {
      const c = document.getElementById('q_' + q.id);
      if (q.type === 'mc' || q.type === 'tf') { const v = q.type === 'mc' ? String(q.answer) : String(q.answer); const r = c.querySelector('input[value="' + v + '"]'); r.click(); }
      else { const i = c.querySelector('textarea, input'); i.value = [].concat(q.answer)[0]; i.dispatchEvent(new Event('input')); }
    });
  }, data('U1-Q').questions);
  await shot('quiz');
  await clickText('.sticky-foot button', 'ส่งคำตอบ');
  await confirmOk('ส่งคำตอบ');
  await page.waitForFunction(() => document.body.textContent.includes('ยินดีด้วย! ได้รับเกียรติบัตรใหม่'), { timeout: 20000 });
  ok(true, 'ผ่านภารกิจ 1 แล้วได้เกียรติบัตร');
  await shot('celebrate');
  await clickText('.modal button', 'ดูเกียรติบัตร');
  await page.waitForSelector('.cert .name');
  ok((await page.$eval('.cert .name', e => e.textContent)) === 'นายธนพล ใจดี', 'เกียรติบัตรมีชื่อนักศึกษา');
  ok(!!(await page.$('.cert .qr img, .cert .qr canvas')), 'เกียรติบัตรมี QR ตรวจสอบ');
  await shot('certificate-mobile');
  const certUrl = await page.evaluate(() => [...document.querySelectorAll('a')].find(a => a.textContent.includes('เปิดหน้าเต็ม')).href);
  await page.setViewport({ width: 1280, height: 860 });
  await page.goto(certUrl);
  await page.waitForFunction(() => document.body.textContent.includes('เกียรติบัตรนี้ออกโดยระบบจริง'), { timeout: 20000 });
  ok(true, 'หน้าตรวจสอบเกียรติบัตรสาธารณะทำงาน');
  await shot('certificate-verify-desktop');
  await page.goto(certUrl.replace(/code=[^&]+/, 'code=wrong'));
  await page.waitForFunction(() => document.body.textContent.includes('ตรวจสอบไม่ผ่าน'), { timeout: 20000 });
  ok(true, 'รหัสตรวจสอบผิดถูกปฏิเสธ');

  // กลับหน้าแรก: ภารกิจ 2 ปลดล็อก
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  await page.goto(URL0);
  await page.waitForSelector('.mission');
  ok((await page.$$('.mission.locked')).length === 8, 'ภารกิจ 2 ปลดล็อกแล้ว');
  await shot('home-after');
  await clickText('.bottomnav button', 'คะแนน');
  await page.waitForSelector('.tests');
  await shot('scores');

  // หน้าครู
  await page.setViewport({ width: 1280, height: 860 });
  await page.goto(URL0 + '#admin');
  await page.waitForSelector('#tp');
  await page.type('#tp', 'teacher1234');
  await clickText('button', 'เข้าสู่ระบบ');
  await page.waitForSelector('.kpi');
  const k = await page.$$eval('.kpi b', e => e.map(x => x.textContent));
  ok(k[0] === '10', 'แดชบอร์ดครู: นักศึกษา 10 คน');
  await shot('teacher-dashboard');
  await clickText('.sidebar button', 'สมุดคะแนน');
  await page.waitForSelector('table.tbl tr.click');
  await shot('teacher-gradebook');
  await page.evaluate(() => document.querySelector('tr.click').click());
  await page.waitForFunction(() => document.querySelector('.modal') && document.querySelector('.modal').textContent.includes('ประวัติการส่ง'), { timeout: 20000 });
  await page.evaluate(() => { const d = document.querySelector('.modal details'); if (d) d.open = true; });
  await shot('teacher-student-detail');
  await page.evaluate(() => document.querySelector('.modal .x').click());
  await clickText('.sidebar button', 'เนื้อหา');
  await page.waitForSelector('.acts .act');
  await clickText('.acts .act b', 'แบบฝึกปฏิบัติที่ 3');
  await clickText('.modal button', 'ทดสอบเฉลย');
  await page.waitForFunction(() => (document.querySelector('.modal').textContent.match(/เฉลยผ่านครบ/g) || []).length === 2, { timeout: 60000 });
  ok(true, 'ครูทดสอบเฉลยกับชุดทดสอบได้');
  await shot('teacher-content-editor');
  await page.evaluate(() => document.querySelector('.modal .x').click());
  await clickText('.sidebar button', 'เกียรติบัตร');
  await page.waitForSelector('table.tbl');
  await shot('teacher-certs');
  await clickText('.sidebar button', 'ตั้งค่า');
  await page.waitForSelector('#set-schoolName');
  await page.evaluate(() => { const i = document.getElementById('set-schoolName'); i.value = 'วิทยาลัยทดสอบระบบ'; });
  await clickText('button', 'บันทึกการตั้งค่า');
  await page.waitForFunction(() => document.getElementById('set-schoolName') && document.getElementById('set-schoolName').dataset.orig === 'วิทยาลัยทดสอบระบบ', { timeout: 20000 });
  ok(true, 'บันทึกตั้งค่าจากหน้าเว็บได้');
  await shot('teacher-settings');

  ok(errors.length === 0, 'ไม่มี JavaScript error' + (errors.length ? '\n' + errors.join('\n') : ''));
  await browser.close(); server.close();
  console.log('ภาพหน้าจอ: ' + shots);
})().catch(async e => { console.error('✗ ' + e.message); try { await global.__page.screenshot({ path: path.join(shots, 'FAIL.png') }); console.error('TEXT=', (await global.__page.evaluate(() => (document.querySelector('.modal')||document.body).innerText)).slice(0,600)); } catch (x) {} process.exitCode = 1; process.exit(1); });
