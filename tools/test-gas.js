/* test-gas.js — ทดสอบ Google Apps Script จำลอง และภารกิจฐานข้อมูล (lang: gas) ด้วย Node: node tools/test-gas.js
 * ยืนยันว่า เฉลยทุกภารกิจได้คะแนนเต็ม · โค้ดตั้งต้น (ฟังก์ชันว่าง) ได้ 0 · คำตอบที่ตัดสต็อกบางส่วนในภารกิจที่ 3 ไม่ได้คะแนนเต็ม (6.5/10) */
const fs = require('fs'), path = require('path'), vm = require('vm'), assert = require('assert');
const root = path.join(__dirname, '..');
const src = p => fs.readFileSync(path.join(root, 'src', p), 'utf8');
const wr = src('WebRunner.html');
const mockSrc = wr.slice(wr.indexOf('/* ===== GAS-MOCK-START'), wr.indexOf('/* ===== GAS-MOCK-END'));
const ctx0 = vm.createContext({});
vm.runInContext(src('Core.gs') + '\n' + src('Content.gs') + '\n' + src('Content2.gs') + '\n' + src('Content3.gs') + '\nthis.seed = getSeedCourse_(); this.cmp = compareOutput_; this.coreApi = coreApi; this.seedSampleData_ = seedSampleData_;', ctx0);
let pass = 0, fail = 0;
const t = async (name, fn) => { try { await fn(); pass++; console.log('  ✓ ' + name); } catch (e) { fail++; console.error('  ✗ ' + name + '\n    ' + String(e.message).split('\n').slice(0, 6).join('\n    ')); } };

/** รันโค้ด + ชุดตรวจ 1 ชุดในบริบทใหม่ (เหมือนหน้าเว็บใหม่ทุกชุดในเบราว์เซอร์) */
async function runCheck(code, check, sheets) {
  const logs = [];
  const c = vm.createContext({ console: { log: (...a) => logs.push(a.join(' ')), error: () => {}, warn: () => {} }, Intl, Date, Math, JSON, String, Number, Array, Object });
  vm.runInContext(mockSrc + '\nthis.__G = __gasMock(' + JSON.stringify(sheets) + ', { log: function (s) { console.log(s); } });\nObject.keys(__G.globals).forEach(k => { this[k] = __G.globals[k]; }); Object.keys(__G.helpers).forEach(k => { this[k] = __G.helpers[k]; });', c);
  try {
    vm.runInContext(code, c, { timeout: 2000 });
    const v = await vm.runInContext('(async function () {\n' + check + '\n})()', c, { timeout: 2000 });
    return { output: v === undefined ? '' : typeof v === 'string' ? v : JSON.stringify(v), logs, G: c.__G };
  } catch (e) { return { output: '', error: e, logs, G: c.__G }; }
}
async function score(task, code) {
  let got = 0, max = 0; const bad = [];
  for (const [k, x] of task.tests.entries()) {
    const r = await runCheck(code, x.check, JSON.parse(JSON.stringify(x.sheets || task.sheets)));
    max += x.score;
    if (!r.error && ctx0.cmp(r.output, x.expected, x.compare)) got += x.score;
    else bad.push('ชุด ' + (k + 1) + ' (' + x.label + '): ได้ ' + JSON.stringify(r.error ? String(r.error) : r.output) + ' ต้องการ ' + JSON.stringify(x.expected));
  }
  return { got: Math.round(got * 10) / 10, max, bad };
}

(async () => {
  console.log('Google Apps Script จำลอง');
  await t('getRange/setValues/appendRow/getLastRow/insertSheet/clear', async () => {
    const r = await runCheck('', `const ss = SpreadsheetApp.getActive(); const sh = ss.getSheetByName("A");
      sh.appendRow(["x", 2]); sh.getRange(1, 3).setValue("c"); sh.getRange("A5:B5").setValues([[9, 8]]);
      const n = ss.insertSheet("R"); n.getRange(1, 1, 2, 2).setValues([[1, 2], [3, 4]]); n.clear();
      let e1 = ""; try { ss.insertSheet("R"); } catch (e) { e1 = "dup"; }
      let e2 = ""; try { sh.getRange(1, 1, 1, 2).setValues([[1]]); } catch (e) { e2 = "size"; }
      return [sh.getLastRow(), sh.getLastColumn(), cells("A!A1:C2").replace(/\\n/g, "/"), cell("A!A5"), ss.getSheetByName("ไม่มี"), n.getLastRow(), e1, e2, sh.getDataRange().getValues().length].join(",")`,
      { A: [['h1', 'h2']] });
    assert.strictEqual(r.error, undefined, String(r.error));
    assert.strictEqual(r.output, '5,3,h1|h2|c/x|2|,9,,0,dup,size,5');
  });
  await t('Utilities.formatDate, MailApp, LockService, Logger', async () => {
    const r = await runCheck('', `const d = new Date(Date.UTC(2026, 0, 2, 20, 5, 9));
      const lock = LockService.getScriptLock(); const before = lockUsed(); lock.waitLock(1000); lock.releaseLock();
      MailApp.sendEmail("a@b.c", "หัวเรื่อง", "เนื้อหา"); Logger.log("ค่า %s", 5);
      return [Utilities.formatDate(d, "Asia/Bangkok", "dd/MM/yyyy HH:mm:ss"), before, lockUsed(), mails()[0].to, mails().length].join(",")`, {});
    assert.strictEqual(r.output, '03/01/2026 03:05:09,false,true,a@b.c,1', String(r.error));
    assert.deepStrictEqual(r.logs, ['ค่า 5']);
  });

  const unit = ctx0.seed.units.find(u => u.id === 'U11');
  console.log('ภารกิจฐานข้อมูล (' + unit.title + ')');
  await t('เป็นภารกิจคะแนนพิเศษ มี 4 กิจกรรม และแบบทดสอบ 10 ข้อ (คำตอบกระจาย ก ข ค ง)', async () => {
    assert.strictEqual(unit.kind, 'bonus');
    assert.strictEqual(unit.activities.map(a => a.type).join(','), 'knowledge,worksheet,practice,quiz');
    const q = unit.activities[3].data.questions; assert.strictEqual(q.length, 10);
    assert.ok([0, 1, 2, 3].every(i => q.some(x => x.answer === i)));
    unit.activities.forEach(a => { assert.ok(JSON.stringify(a.data).length < 49000, a.id + ' ยาวเกิน 1 ช่องของชีต'); });
  });
  const tasks = [].concat(...unit.activities.filter(a => a.data.tasks).map(a => a.data.tasks));
  await t('5 ภารกิจ ภารกิจละ 10 คะแนน ทุกภารกิจมีชุดซ่อนที่ใช้ข้อมูลของตัวเอง', async () => {
    assert.strictEqual(tasks.length, 5);
    tasks.forEach(k => {
      assert.strictEqual(k.tests.reduce((s, x) => s + x.score, 0), 10, k.title);
      assert.ok(k.tests.some(x => x.hidden && x.sheets), k.title + ' ต้องมีชุดซ่อนพร้อมข้อมูลชุดซ่อน');
      assert.strictEqual(k.lang, 'gas');
    });
  });
  for (const k of tasks) {
    await t(k.title + ': เฉลยได้ 10/10 · โค้ดตั้งต้นได้ 0', async () => {
      const s = await score(k, k.solution); assert.strictEqual(s.got, 10, s.bad.join('\n'));
      const z = await score(k, k.starterCode); assert.strictEqual(z.got, 0, 'โค้ดตั้งต้นได้ ' + z.got);
      const call = await runCheck(k.solution, 'return ' + k.call, JSON.parse(JSON.stringify(k.sheets)));
      assert.ok(!call.error, 'คำสั่ง "เรียกใช้" ของโจทย์ error: ' + call.error);
    });
  }
  await t('ภารกิจที่ 3: คำตอบที่ตัดสต็อกทีละรายการ (ไม่ตรวจก่อน) ได้ 6.5/10', async () => {
    const k = tasks[2]; const s = await score(k, k.partialSolution);
    assert.strictEqual(s.got, 6.5, s.bad.join('\n'));
    assert.ok(s.bad.length === 1 && /ยกเลิกทั้งออเดอร์/.test(s.bad[0]), s.bad.join('\n'));
  });
  await t('ภารกิจที่ 1: เขียนเลขที่ตายตัว L0002 ไม่ผ่านชุดซ่อน', async () => {
    const k = tasks[0]; const s = await score(k, k.solution.replace('const id = "L" + String(Number(lastId.slice(1)) + 1).padStart(4, "0");', 'const id = "L0002";'));
    assert.ok(s.got < 10 && s.bad.some(b => /ชุดซ่อน/.test(b)), JSON.stringify(s));
  });
  await t('ใบความรู้: ตัวอย่าง ```gas ทุกบล็อกรันได้ไม่มี error', async () => {
    const blocks = []; unit.activities[0].data.content.replace(/```gas\n([\s\S]*?)\n```/g, (m, c) => blocks.push(c));
    assert.ok(blocks.length >= 5, 'ควรมีอย่างน้อย 5 บล็อก (5 หัวข้อ)');
    const sample = vm.runInContext('(' + wr.slice(wr.indexOf('var SAMPLE_SHEETS = '), wr.indexOf('function freshSheets()')).replace('var SAMPLE_SHEETS = ', '').trim().replace(/;$/, '') + ')', vm.createContext({}));
    for (const [i, b] of blocks.entries()) {
      const r = await runCheck(b, 'return 1', JSON.parse(JSON.stringify(sample)));
      assert.ok(!r.error, 'บล็อก ' + (i + 1) + ': ' + r.error); assert.ok(r.logs.length, 'บล็อก ' + (i + 1) + ' ควรมี console.log');
    }
  });

  console.log('ระบบคะแนน (ภารกิจพิเศษแยกจากคะแนนหลัก)');
  await t('คะแนนพิเศษไม่นับรวมคะแนนหลัก และไม่ล็อกตามลำดับ', async () => {
    const { makeMemStore } = require('./memstore.js');
    const store = makeMemStore({}); store.setSecret('salt', 's');
    ctx0.seedSampleData_(store, true);
    const tok = ctx0.coreApi(store, 'login', { studentCode: '692010001', pin: '1234' }).token;
    const m = ctx0.coreApi(store, 'courseMap', { token: tok });
    const b = m.units.find(u => u.bonus);
    assert.ok(b && !b.locked, 'ภารกิจพิเศษต้องเปิดได้ทันที');
    assert.strictEqual(m.bonus.max, 60);
    assert.strictEqual(m.overall.max, m.units.filter(u => !u.bonus).reduce((s, u) => s + u.max, 0));
  });

  console.log('\nผ่าน ' + pass + ' / ไม่ผ่าน ' + fail);
  process.exitCode = fail ? 1 : 0;
})();
