/* test-core.js — ทดสอบตรรกะหลัก (Core.gs + Content.gs) ด้วย Node: node tools/test-core.js */
const fs = require('fs'), path = require('path'), vm = require('vm'), crypto = require('crypto'), assert = require('assert');
const src = p => fs.readFileSync(path.join(__dirname, '..', 'src', p), 'utf8');
const { makeMemStore, sha256Hex } = require('./memstore');

const ctx = vm.createContext({ console, Math, JSON, Date });
vm.runInContext(src('Core.gs') + '\n' + src('Content.gs') + '\n' + src('Content2.gs') + '\n' + src('Content3.gs') + '\nthis.coreApi = coreApi; this.seedSampleData_ = seedSampleData_; this.clearSampleData_ = clearSampleData_; this.getSeedCourse_ = getSeedCourse_; this.compareOutput_ = compareOutput_;', ctx);

let pass = 0;
function t(name, fn) { try { fn(); pass++; console.log('  ✓ ' + name); } catch (e) { console.error('  ✗ ' + name + '\n    ' + (e.stack || e)); process.exitCode = 1; } }
function throws(fn, re) { let m = null; try { fn(); } catch (e) { m = e.message; } assert.ok(m !== null, 'ควร error'); if (re) assert.ok(re.test(m), 'ข้อความ error: ' + m); }

let clock = new Date('2026-11-10T02:00:00Z').getTime();
const store = makeMemStore({}, { now: () => new Date(clock), url: () => 'https://script.google.com/macros/s/X/exec' });
store.setSecret('salt', 'test-salt');
const api = (m, p) => JSON.parse(JSON.stringify(ctx.coreApi(store, m, p)));

console.log('ตรรกะพื้นฐาน');
t('sha256 ตรงกับ crypto', () => { for (const s of ['', 'abc', 'สวัสดี:1234', 'x'.repeat(200)]) assert.strictEqual(sha256Hex(s), crypto.createHash('sha256').update(s, 'utf8').digest('hex')); });
t('compareOutput_ โหมดต่าง ๆ', () => {
  const c = ctx.compareOutput_;
  assert.ok(c('8\n', '8')); assert.ok(c('a  \nb\n\n', 'a\nb')); assert.ok(!c('8', '9'));
  assert.ok(c('20.761245', '20.76', 'number')); assert.ok(!c('20.9', '20.76', 'number'));
  assert.ok(c('x = 1 2', 'x=12', 'ignorespace')); assert.ok(c('hello world', 'world', 'contains')); assert.ok(!c('8 ', '8', 'exact'));
});
t('เนื้อหาตัวอย่าง: ทุกกิจกรรมผ่านการตรวจรูปแบบ', () => {
  const c = JSON.parse(JSON.stringify(ctx.getSeedCourse_()));
  assert.strictEqual(c.units.length, 15); // 10 ภารกิจหลัก + ภารกิจฐานข้อมูล 11–15 (คะแนนพิเศษ)
  assert.strictEqual(c.units.filter(u => u.kind === 'bonus').length, 5);
  c.units.forEach(u => { assert.deepStrictEqual(u.activities.map(a => a.type), u.kind === 'bonus' ? ['knowledge', 'worksheet', 'quiz'] : ['knowledge', 'worksheet', 'practice', 'quiz']); u.activities.forEach(a => vm.runInContext('validateActivityData_', ctx)(a.type, a.data)); });
});

console.log('ติดตั้งและข้อมูลตัวอย่าง');
t('seedSampleData_ ใส่เนื้อหาและนักศึกษา 10 คน', () => {
  const r = ctx.seedSampleData_(store, true);
  assert.strictEqual(r.students, 10); assert.strictEqual(r.units, 15);
  assert.strictEqual(store.all('Units').length, 15); assert.strictEqual(store.all('Activities').length, 55);
  assert.ok(store.all('Certificates').length > 0, 'ควรมีเกียรติบัตรของนักศึกษาตัวอย่าง');
  assert.strictEqual(ctx.seedSampleData_(store, false).students, 0, 'รันซ้ำไม่สร้างซ้ำ');
});

console.log('นักศึกษา');
let tok;
t('login ผิด PIN ถูกปฏิเสธ และล็อกหลัง 5 ครั้ง', () => {
  for (let i = 0; i < 5; i++) throws(() => api('login', { studentCode: '692010002', pin: '0000' }), /ไม่ถูกต้อง/);
  throws(() => api('login', { studentCode: '692010002', pin: '1234' }), /หลายครั้ง/);
});
t('login ถูกต้อง', () => { const r = api('login', { studentCode: '692010001', pin: '1234' }); tok = r.token; assert.ok(tok); assert.strictEqual(r.student.firstName, 'ธนพล'); });
t('API นักศึกษาต้องมี token', () => throws(() => api('courseMap', {}), /เข้าสู่ระบบ/));
let map;
t('courseMap: ภารกิจ 1 เปิด ภารกิจ 2–5 ล็อก', () => {
  map = api('courseMap', { token: tok });
  assert.strictEqual(map.units.length, 15);
  assert.deepStrictEqual(map.units.map(u => u.locked), [false].concat(Array(9).fill(true), Array(5).fill(false))); // ภารกิจพิเศษเปิดเสมอ
  assert.strictEqual(map.overall.percent, 0);
});
t('เปิดกิจกรรมในภารกิจที่ล็อกไม่ได้', () => throws(() => api('getActivity', { token: tok, activityId: 'U2-K' }), /ล็อก/));
t('ใบความรู้ + markRead', () => {
  const a = api('getActivity', { token: tok, activityId: 'U1-K' });
  assert.ok(a.content.includes('```html'));
  api('markRead', { token: tok, activityId: 'U1-K' }); api('markRead', { token: tok, activityId: 'U1-K' });
  assert.strictEqual(store.all('Attempts').filter(x => x.activityId === 'U1-K' && x.studentId === map.student.id).length, 1, 'อ่านซ้ำไม่บันทึกซ้ำ');
});
const seed = ctx.getSeedCourse_();
const actData = id => seed.units.flatMap(u => u.activities).find(a => a.id === id).data;
t('ใบงาน: ไม่ส่ง solution และ expected ของชุดซ่อนไปหน้าเว็บ', () => {
  const a = api('getActivity', { token: tok, activityId: 'U2-W'.replace('U2', 'U1') });
  const s = JSON.stringify(a);
  assert.ok(!s.includes('"solution"'));
  a.tasks.forEach(tk => tk.tests.forEach(x => { if (x.hidden) assert.strictEqual(x.expected, null); }));
  const b = api('getActivity', { token: tok, activityId: 'U1-P' });
  assert.ok(!JSON.stringify(b).includes('print("**")'), 'เฉลยไม่หลุด');
});
t('คำใบ้: เปิดทีละข้อ และหักคะแนน', () => {
  const h = api('revealHint', { token: tok, activityId: 'U1-W', taskIndex: 0 });
  assert.ok(h.hint.includes('class'));
  const a = api('getActivity', { token: tok, activityId: 'U1-W' });
  assert.strictEqual(a.tasks[0].hints.length, 1);
});
t('ส่งใบงาน: ตรวจที่เซิร์ฟเวอร์ ผิดได้ 0 ถูกได้คะแนน (หักคำใบ้)', () => {
  const d = actData('U1-W');
  const wrong = api('submitTasks', { token: tok, activityId: 'U1-W', tasks: d.tasks.map(tk => ({ code: 'print(1)', outputs: tk.tests.map(() => '1') })) });
  assert.strictEqual(wrong.score, 0);
  const right = api('submitTasks', { token: tok, activityId: 'U1-W', tasks: d.tasks.map(tk => ({ code: tk.solution, outputs: tk.tests.map(x => x.expected + '\n') })) });
  assert.strictEqual(right.max, 10); assert.strictEqual(right.tasks[0].penalty, 0.5); assert.strictEqual(right.score, 9.5); assert.strictEqual(right.best, 9.5);
});
t('ใบงานส่งได้ไม่เกิน maxAttempts (3)', () => {
  const d = actData('U1-W');
  api('submitTasks', { token: tok, activityId: 'U1-W', tasks: [] });
  throws(() => api('submitTasks', { token: tok, activityId: 'U1-W', tasks: [] }), /ครบ 3 ครั้ง/);
});
t('แบบฝึก: คะแนนเต็ม', () => {
  const d = actData('U1-P');
  const r = api('submitTasks', { token: tok, activityId: 'U1-P', tasks: d.tasks.map(tk => ({ code: tk.solution, outputs: tk.tests.map(x => x.expected) })) });
  assert.strictEqual(r.score, r.max);
});
let sess;
t('แบบทดสอบ: ไม่ส่งเฉลยไปหน้าเว็บ และสุ่มลำดับ', () => {
  sess = api('startQuiz', { token: tok, activityId: 'U1-Q' });
  assert.strictEqual(sess.questions.length, 6);
  const s = JSON.stringify(sess); assert.ok(!s.includes('"answer"') && !s.includes('explain'));
  const again = api('startQuiz', { token: tok, activityId: 'U1-Q' });
  assert.strictEqual(again.sessionId, sess.sessionId, 'เปิดซ้ำได้รอบเดิม (ไม่เสียสิทธิ์)');
});
t('ส่งแบบทดสอบ → ผ่านภารกิจ 1 → ได้เกียรติบัตร และปลดล็อกภารกิจ 2', () => {
  const d = actData('U1-Q'), ans = {};
  d.questions.forEach(q => { ans[q.id] = q.type === 'fill' ? ' ' + q.answer[0].toUpperCase() + ' ' : q.type === 'tf' ? String(q.answer) : q.answer; });
  const r = api('submitQuiz', { token: tok, sessionId: sess.sessionId, answers: ans });
  assert.strictEqual(r.score, 6); assert.ok(!r.revealAnswers, 'ยังมีสิทธิ์อีกครั้ง จึงยังไม่เฉลย');
  assert.strictEqual(r.newCertificates.length, 1); assert.ok(r.unit.passed);
  assert.strictEqual(r.newCertificates[0].level, 'ดีเยี่ยม');
  throws(() => api('submitQuiz', { token: tok, sessionId: sess.sessionId, answers: ans }), /ไปแล้ว/);
  map = api('courseMap', { token: tok });
  assert.deepStrictEqual(map.units.map(u => u.locked), [false, false].concat(Array(8).fill(true), Array(5).fill(false)));
});
t('แบบทดสอบ: ครั้งสุดท้ายเฉลย, เกินสิทธิ์ไม่ได้, ส่งหลังหมดเวลาได้ 0', () => {
  const s2 = api('startQuiz', { token: tok, activityId: 'U1-Q' });
  clock += 12 * 60000; // เกิน 10 นาที + 60 วินาที
  const r = api('submitQuiz', { token: tok, sessionId: s2.sessionId, answers: { q1: 1 } });
  assert.ok(r.late); assert.strictEqual(r.score, 0); assert.ok(r.revealAnswers); assert.ok(r.results.every(x => x.answer !== undefined));
  throws(() => api('startQuiz', { token: tok, activityId: 'U1-Q' }), /ครบ 2 ครั้ง/);
  assert.strictEqual(api('courseMap', { token: tok }).units[0].activities[3].best, 6, 'ใช้คะแนนดีที่สุด');
});
t('ตรวจสอบเกียรติบัตรสาธารณะต้องมีรหัสตรวจสอบ', () => {
  const c = api('courseMap', { token: tok }).certificates[0];
  assert.ok(c.verifyUrl.includes('?cert=' + c.certNo));
  throws(() => api('getCertificate', { certNo: c.certNo, code: 'wrong' }), /ไม่ถูกต้อง/);
  assert.strictEqual(api('getCertificate', { certNo: c.certNo, code: c.verifyCode }).cert.studentName, 'นายธนพล ใจดี');
});
t('ทำครบ 10 ภารกิจ → เกียรติบัตรสำเร็จหลักสูตร', () => {
  ['U2', 'U3', 'U4', 'U5', 'U6', 'U7', 'U8', 'U9', 'U10'].forEach(u => {
    api('markRead', { token: tok, activityId: u + '-K' });
    ['W', 'P'].forEach(k => { const d = actData(u + '-' + k); api('submitTasks', { token: tok, activityId: u + '-' + k, tasks: d.tasks.map(tk => ({ code: tk.solution, outputs: tk.tests.map(x => x.expected) })) }); });
    const s = api('startQuiz', { token: tok, activityId: u + '-Q' }), d = actData(u + '-Q'), ans = {};
    d.questions.forEach(q => { ans[q.id] = Array.isArray(q.answer) ? q.answer[0] : (q.type === 'tf' ? String(q.answer) : q.answer); });
    const r = api('submitQuiz', { token: tok, sessionId: s.sessionId, answers: ans });
    assert.strictEqual(r.score, r.max, u + ' แบบทดสอบควรได้เต็ม');
  });
  const m = api('courseMap', { token: tok });
  assert.ok(m.overall.allPassed);
  assert.strictEqual(m.certificates.length, 11);
  assert.ok(m.certificates.some(c => c.unitId === 'COURSE'));
  const nos = store.all('Certificates').map(c => c.certNo); assert.strictEqual(new Set(nos).size, nos.length, 'เลขที่ไม่ซ้ำ');
});

console.log('ครู');
let tt;
t('ยังไม่ตั้งรหัสครู → แจ้งวิธีตั้ง', () => throws(() => api('teacherLogin', { password: 'x' }), /ตั้งรหัสผ่านครู/));
t('login ครู', () => {
  store.setSecret('teacherPassHash', sha256Hex('test-salt:teacher:secret99'));
  throws(() => api('teacherLogin', { password: 'nope' }), /ไม่ถูกต้อง/);
  tt = api('teacherLogin', { password: 'secret99' }).token; assert.ok(tt);
});
t('นักศึกษาเรียก API ครูไม่ได้', () => throws(() => api('tGradebook', { token: tok }), /สิทธิ์ครู/));
t('dashboard + gradebook', () => {
  const d = api('tDashboard', { token: tt });
  assert.strictEqual(d.kpi.students, 10); assert.ok(d.kpi.finished >= 2); assert.strictEqual(d.units.length, 15);
  const g = api('tGradebook', { token: tt });
  assert.strictEqual(g.rows.length, 10); assert.strictEqual(g.activities.length, 55);
  assert.ok(g.rows.find(r => r.student.studentCode === '692010001').allPassed);
});
t('ปรับคะแนน: ต้องมีเหตุผล ไม่เกินคะแนนเต็ม และออกเกียรติบัตรถ้าผ่าน', () => {
  const g = api('tGradebook', { token: tt });
  const r9 = g.rows.find(r => r.student.studentCode === '692010009'); // ยังไม่เริ่ม
  throws(() => api('tOverride', { token: tt, studentId: r9.student.id, activityId: 'U1-W', score: 5, reason: '' }), /เหตุผล/);
  throws(() => api('tOverride', { token: tt, studentId: r9.student.id, activityId: 'U1-W', score: 99, reason: 'x' }), /ระหว่าง 0/);
  ['U1-K', 'U1-W', 'U1-P', 'U1-Q'].forEach(a => {
    const max = g.activities.find(x => x.id === a).max;
    const r = api('tOverride', { token: tt, studentId: r9.student.id, activityId: a, score: max, reason: 'ตรวจงานกระดาษ' });
    if (a === 'U1-Q') assert.strictEqual(r.newCertificates.length, 1);
  });
});
t('เพิ่ม/นำเข้านักศึกษา + PIN ใช้ได้จริง + ออก PIN ใหม่', () => {
  const r = api('tImportStudents', { token: tt, rows: [{ studentCode: '700001', prefix: 'นาย', firstName: 'ทดสอบ', lastName: 'หนึ่ง', room: 'ปวส.1' }, { studentCode: '700001', firstName: 'ซ้ำ' }, { studentCode: '692010001', firstName: 'ซ้ำ' }] });
  assert.strictEqual(r.created.length, 1); assert.strictEqual(r.skipped.length, 2);
  assert.match(r.created[0].pin, /^\d{6}$/);
  assert.ok(api('login', { studentCode: '700001', pin: r.created[0].pin }).token);
  throws(() => api('tSaveStudent', { token: tt, student: { studentCode: '700001', firstName: 'อีก' } }), /มีอยู่แล้ว/);
  const id = store.all('Students').find(s => s.studentCode === '700001').id;
  const np = api('tResetPin', { token: tt, studentId: id }).pin;
  throws(() => api('login', { studentCode: '700001', pin: r.created[0].pin }), /ไม่ถูกต้อง/);
  assert.ok(api('login', { studentCode: '700001', pin: np }).token);
  api('tSaveStudent', { token: tt, student: { id, studentCode: '700001', firstName: 'ทดสอบ', lastName: 'หนึ่ง', status: 'inactive' } });
  throws(() => api('login', { studentCode: '700001', pin: np }), /ไม่ถูกต้อง/);
});
t('แก้ไขกิจกรรม: ตรวจ JSON และรูปแบบ', () => {
  throws(() => api('tSaveActivity', { token: tt, activity: { unitId: 'U1', type: 'quiz', title: 'x', dataJson: '{"questions":[{"id":"a","type":"mc","text":"?","choices":["a"],"answer":3}]}' } }), /mc ต้องมี/);
  const r = api('tSaveActivity', { token: tt, activity: { unitId: 'U1', type: 'practice', title: 'ฝึกเพิ่ม', order: 5, dataJson: JSON.stringify({ tasks: [{ title: 'a', prompt: 'b', tests: [{ input: '', expected: '1' }] }] }) } });
  assert.ok(r.id);
  assert.strictEqual(api('courseMap', { token: tok }).units[0].activities.length, 5);
});
t('ส่งออก → นำเข้าเนื้อหา (คะแนนเดิมยังอยู่)', () => {
  const ex = api('tExportCourse', { token: tt });
  assert.strictEqual(ex.units.length, 15); assert.strictEqual(ex.units[10].kind, 'bonus');
  ex.units[0].activities = ex.units[0].activities.filter(a => a.title !== 'ฝึกเพิ่ม');
  api('tImportCourse', { token: tt, json: JSON.stringify(ex) });
  const m = api('courseMap', { token: tok });
  assert.strictEqual(m.units[0].activities.length, 4); assert.ok(m.overall.allPassed);
});

console.log('ตั้งค่า แก้ไข และลบข้อมูล');
t('อ่านและบันทึกตั้งค่าจากหน้าเว็บ (ตรวจค่าที่ผิด)', () => {
  const s0 = api('tSettings', { token: tt });
  assert.ok(s0.items.find(x => x.key === 'schoolName' && x.help));
  throws(() => api('tSaveSettings', { token: tt, settings: { passPercent: '150' } }), /0–100/);
  throws(() => api('tSaveSettings', { token: tt, settings: { primaryColor: 'red' } }), /#RRGGBB/);
  throws(() => api('tSaveSettings', { token: tt, settings: { logoUrl: 'javascript:alert(1)' } }), /https/);
  throws(() => api('tSaveSettings', { token: tok, settings: { schoolName: 'x' } }), /สิทธิ์ครู/);
  api('tSaveSettings', { token: tt, settings: { schoolName: 'วิทยาลัยทดสอบ', passPercent: '70', publicUrl: 'https://example.github.io/cs/', unknownKey: 'x' } });
  assert.strictEqual(api('info', {}).schoolName, 'วิทยาลัยทดสอบ');
  assert.strictEqual(api('info', {}).passPercent, 70);
  assert.strictEqual(store.settings().unknownKey, undefined, 'คีย์แปลกไม่ถูกบันทึก');
  const c = api('courseMap', { token: tok }).certificates[0];
  assert.ok(c.verifyUrl.startsWith('https://example.github.io/cs/?cert='), 'ลิงก์ตรวจสอบใช้ publicUrl');
  api('tSaveSettings', { token: tt, settings: { passPercent: '60' } });
});
t('เปลี่ยนรหัสผ่านครู', () => {
  throws(() => api('tChangePassword', { token: tt, oldPassword: 'wrong', newPassword: 'newpass1' }), /เดิมไม่ถูกต้อง/);
  throws(() => api('tChangePassword', { token: tt, oldPassword: 'secret99', newPassword: '123' }), /6 ตัว/);
  api('tChangePassword', { token: tt, oldPassword: 'secret99', newPassword: 'newpass1' });
  throws(() => api('teacherLogin', { password: 'secret99' }), /ไม่ถูกต้อง/);
  tt = api('teacherLogin', { password: 'newpass1' }).token;
});
t('ล้างการส่งงานรายกิจกรรม → ทำแบบทดสอบใหม่ได้', () => {
  const sid = api('courseMap', { token: tok }).student.id;
  throws(() => api('startQuiz', { token: tok, activityId: 'U1-Q' }), /ครบ 2 ครั้ง/);
  const r = api('tResetActivity', { token: tt, studentId: sid, activityId: 'U1-Q' });
  assert.ok(r.removed >= 4);
  assert.ok(api('startQuiz', { token: tok, activityId: 'U1-Q' }).sessionId);
});
t('ลบ/เพิกถอนเกียรติบัตร ต้องมีเหตุผล', () => {
  const c = api('tCertificates', { token: tt })[0];
  throws(() => api('tRevokeCertificate', { token: tt, certNo: c.certNo, reason: '' }), /เหตุผล/);
  api('tRevokeCertificate', { token: tt, certNo: c.certNo, reason: 'ทดสอบ' });
  throws(() => api('getCertificate', { certNo: c.certNo, code: c.verifyCode }), /ไม่พบ/);
});
t('ลบการปรับคะแนน', () => {
  const o = store.all('Overrides')[0];
  api('tDeleteOverride', { token: tt, overrideId: o.id });
  assert.ok(!store.all('Overrides').some(x => x.id === o.id));
  throws(() => api('tDeleteOverride', { token: tt, overrideId: o.id }), /ไม่พบ/);
});
t('ลบกิจกรรม และลบภารกิจ (ต้องยืนยันเมื่อมีกิจกรรม)', () => {
  const a = api('tSaveActivity', { token: tt, activity: { unitId: 'U10', type: 'knowledge', title: 'ชั่วคราว', order: 9, dataJson: '{"content":"x"}' } });
  assert.strictEqual(api('courseMap', { token: tok }).units[9].activities.length, 5);
  api('tDeleteActivity', { token: tt, activityId: a.id });
  assert.strictEqual(api('courseMap', { token: tok }).units[9].activities.length, 4);
  const u = api('tSaveUnit', { token: tt, unit: { title: 'ภารกิจทดลอง', order: 11 } });
  api('tSaveActivity', { token: tt, activity: { unitId: u.id, type: 'knowledge', title: 'k', dataJson: '{"content":"x"}' } });
  throws(() => api('tDeleteUnit', { token: tt, unitId: u.id }), /ยืนยัน/);
  api('tDeleteUnit', { token: tt, unitId: u.id, cascade: true });
  assert.strictEqual(api('tCourse', { token: tt }).units.length, 15);
});
t('ลบนักศึกษาแบบซ่อน → กู้คืน → ลบถาวร (ต้องพิมพ์รหัสยืนยัน)', () => {
  const s = store.all('Students').find(x => x.studentCode === '692010002');
  api('tDeleteStudent', { token: tt, studentId: s.id, mode: 'soft' });
  assert.ok(!api('tGradebook', { token: tt }).rows.some(r => r.student.id === s.id));
  assert.ok(api('tDeletedStudents', { token: tt }).some(x => x.id === s.id));
  throws(() => api('login', { studentCode: '692010002', pin: '1234' }), /ไม่ถูกต้อง/);
  api('tDeleteStudent', { token: tt, studentId: s.id, mode: 'restore' });
  assert.ok(api('login', { studentCode: '692010002', pin: '1234' }).token);
  throws(() => api('tDeleteStudent', { token: tt, studentId: s.id, mode: 'hard', confirmCode: 'x' }), /พิมพ์รหัส/);
  const before = store.all('Attempts').filter(a => a.studentId === s.id).length;
  assert.ok(before > 0);
  api('tDeleteStudent', { token: tt, studentId: s.id, mode: 'hard', confirmCode: '692010002' });
  assert.ok(!store.all('Students').some(x => x.id === s.id));
  assert.strictEqual(store.all('Attempts').filter(a => a.studentId === s.id).length, 0);
  assert.ok(store.all('Log').some(l => l.action === 'ลบนักศึกษาถาวร'));
});
console.log('รุ่น 2.1: PIN ลายเซ็น กันทุจริต สุ่มข้อสอบ ภารกิจพิเศษ');
t('ครูตั้ง PIN ให้นักศึกษาเอง (4–8 หลัก) ใช้ได้ทันที PIN เดิมใช้ไม่ได้', () => {
  const s = store.all('Students').find(x => x.studentCode === '692010003');
  throws(() => api('tSetPin', { token: tt, studentId: s.id, pin: '12' }), /4–8 หลัก/);
  throws(() => api('tSetPin', { token: tt, studentId: s.id, pin: 'abcd' }), /4–8 หลัก/);
  throws(() => api('tSetPin', { token: tok, studentId: s.id, pin: '4826' }), /ครู/);
  const r = api('tSetPin', { token: tt, studentId: s.id, pin: '4826' });
  assert.strictEqual(r.pin, '4826');
  assert.ok(api('login', { studentCode: '692010003', pin: '4826' }).token);
  throws(() => api('login', { studentCode: '692010003', pin: '1234' }), /ไม่ถูกต้อง/);
});
t('ลายเซ็นครูผู้สอน/ผู้อำนวยการ: ตรวจรูปแบบ แสดงบนเกียรติบัตร แต่ไม่ส่งไปทุกหน้า', () => {
  const png = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
  throws(() => api('tSaveSettings', { token: tt, settings: { signer1Sig: 'javascript:alert(1)' } }), /PNG/);
  throws(() => api('tSaveSettings', { token: tt, settings: { signer2Sig: 'data:image/png;base64,' + 'A'.repeat(46000) } }), /ใหญ่เกินไป/);
  api('tSaveSettings', { token: tt, settings: { signer1Sig: png, signer2Sig: png } });
  assert.ok(!JSON.stringify(api('info', {})).includes('base64'), 'info ไม่ควรมีภาพลายเซ็น');
  const c = store.all('Certificates')[0];
  const r = api('getCertificate', { certNo: c.certNo, code: c.verifyCode });
  assert.strictEqual(r.settings.signer1Sig, png); assert.strictEqual(r.settings.signer2Sig, png);
  api('tSaveSettings', { token: tt, settings: { signer2Sig: '' } });
  assert.strictEqual(api('getCertificate', { certNo: c.certNo, code: c.verifyCode }).settings.signer2Sig, '');
});
t('ใบงาน: วางข้อความจากภายนอก → บันทึก + หักคะแนน 10% ต่อครั้ง', () => {
  const t2 = api('login', { studentCode: '692010001', pin: '1234' }).token;
  const d = actData('U1-P');
  const r1 = api('reportIntegrity', { token: t2, activityId: 'U1-P', kind: 'paste', detail: 'โค้ดจากเว็บ' });
  assert.strictEqual(r1.count, 1); assert.strictEqual(r1.penaltyPct, 10); assert.strictEqual(r1.kickOut, false);
  api('reportIntegrity', { token: t2, activityId: 'U1-P', kind: 'paste' }); // ภายใน 2 วินาที นับครั้งเดียว
  clock += 5000;
  assert.strictEqual(api('reportIntegrity', { token: t2, activityId: 'U1-P', kind: 'drop' }).count, 2);
  assert.strictEqual(api('getActivity', { token: t2, activityId: 'U1-P' }).integrity.count, 2);
  const r = api('submitTasks', { token: t2, activityId: 'U1-P', tasks: d.tasks.map(tk => ({ code: tk.solution, outputs: tk.tests.map(x => x.expected) })) });
  assert.strictEqual(r.integrity.count, 2);
  assert.strictEqual(r.integrity.penalty, Math.round(r.max * 0.2 * 10) / 10);
  assert.strictEqual(r.score, Math.round((r.max - r.integrity.penalty) * 10) / 10);
  const me = store.all('Students').find(x => x.studentCode === '692010001');
  const det = api('tStudentDetail', { token: tt, studentId: me.id });
  assert.strictEqual(det.integrity.length, 2);
  assert.ok(api('tDashboard', { token: tt }).integrity.total >= 2);
  assert.strictEqual(api('tGradebook', { token: tt }).integrity[me.id], 2);
  // ครูล้างการส่งงาน → ประวัติทุจริตของกิจกรรมนั้นหายด้วย
  api('tResetActivity', { token: tt, studentId: me.id, activityId: 'U1-P' });
  assert.strictEqual(api('getActivity', { token: t2, activityId: 'U1-P' }).integrity.count, 0);
});
t('แบบทดสอบ: ออกจากหน้าสอบครบ 2 ครั้ง → ให้ออกจากการสอบ ถือว่าทุจริต และหักคะแนน', () => {
  clock += 60000;
  const t2 = api('login', { studentCode: '692010001', pin: '1234' }).token;
  const q = api('startQuiz', { token: t2, activityId: 'U1-Q' });
  assert.strictEqual(q.maxStrikes, 2); assert.strictEqual(q.strikes, 0);
  throws(() => api('reportIntegrity', { token: t2, activityId: 'U1-Q', kind: 'leave' }), /รอบการสอบ/);
  const a = api('reportIntegrity', { token: t2, activityId: 'U1-Q', sessionId: q.sessionId, kind: 'leave' });
  assert.strictEqual(a.kickOut, false);
  clock += 3000;
  const b = api('reportIntegrity', { token: t2, activityId: 'U1-Q', sessionId: q.sessionId, kind: 'copy' });
  assert.strictEqual(b.count, 2); assert.strictEqual(b.kickOut, true);
  const qd = actData('U1-Q'), ans = {}; qd.questions.forEach(x => { ans[x.id] = x.type === 'mc' ? x.answer : String([].concat(x.answer)[0]); });
  const r = api('submitQuiz', { token: t2, sessionId: q.sessionId, answers: ans, forced: true });
  assert.strictEqual(r.integrity.cheat, true); assert.strictEqual(r.integrity.count, 2);
  assert.strictEqual(r.score, Math.round((r.max - r.max * 0.2) * 10) / 10);
  assert.ok(store.all('Log').some(l => l.action === 'ทุจริตในการสอบ'));
});
t('แบบทดสอบสุ่มจากคลัง (drawCount): ได้ข้อไม่ซ้ำกัน ตรวจเฉพาะข้อที่ได้ และคะแนนเต็มคงที่', () => {
  const u1q = store.all('Activities').find(a => a.id === 'U1-Q');
  const dd = JSON.parse(u1q.dataJson); dd.drawCount = 3; dd.maxAttempts = 0;
  api('tSaveActivity', { token: tt, activity: { id: u1q.id, unitId: u1q.unitId, order: u1q.order, type: 'quiz', title: u1q.title, status: 'active', dataJson: JSON.stringify(dd) } });
  const t2 = api('login', { studentCode: '692010001', pin: '1234' }).token;
  const info = api('getActivity', { token: t2, activityId: 'U1-Q' });
  assert.strictEqual(info.questionCount, 3); assert.strictEqual(info.bankSize, 6); assert.strictEqual(info.max, 3);
  const q = api('startQuiz', { token: t2, activityId: 'U1-Q' });
  assert.strictEqual(q.questions.length, 3);
  const ans = {}; dd.questions.forEach(x => { ans[x.id] = x.type === 'mc' ? x.answer : x.type === 'tf' ? String(x.answer) : String([].concat(x.answer)[0]); });
  const r = api('submitQuiz', { token: t2, sessionId: q.sessionId, answers: ans });
  assert.strictEqual(r.results.length, 3); assert.strictEqual(r.max, 3); assert.strictEqual(r.score, 3);
  dd.drawCount = 0; dd.maxAttempts = 2;
  api('tSaveActivity', { token: tt, activity: { id: u1q.id, unitId: u1q.unitId, order: u1q.order, type: 'quiz', title: u1q.title, status: 'active', dataJson: JSON.stringify(dd) } });
});
t('ตั้งค่ากันทุจริต: ตรวจค่า', () => {
  throws(() => api('tSaveSettings', { token: tt, settings: { quizMaxStrikes: '0' } }), /1–10/);
  throws(() => api('tSaveSettings', { token: tt, settings: { integrityPenalty: '150' } }), /0–100/);
  api('tSaveSettings', { token: tt, settings: { quizMaxStrikes: '3', integrityPenalty: '5' } });
  assert.strictEqual(api('info', {}).quizMaxStrikes, 3);
  api('tSaveSettings', { token: tt, settings: { quizMaxStrikes: '2', integrityPenalty: '10' } });
});
t('ภารกิจพิเศษ: ไม่นับรวมคะแนนหลัก และได้เกียรติบัตร "ภารกิจพิเศษ"', () => {
  const t2 = api('login', { studentCode: '692010001', pin: '1234' }).token;
  const before = api('courseMap', { token: t2 });
  const bonus = before.units.find(u => u.bonus);
  assert.ok(!bonus.locked);
  [].concat(...seed.units.filter(u => u.kind === 'bonus').map(u => u.activities)).forEach(a => {
    if (a.type === 'knowledge') api('markRead', { token: t2, activityId: a.id });
    else if (a.type === 'quiz') { const q = api('startQuiz', { token: t2, activityId: a.id }); const ans = {}; a.data.questions.forEach(x => { ans[x.id] = x.answer; }); api('submitQuiz', { token: t2, sessionId: q.sessionId, answers: ans }); }
    else api('submitTasks', { token: t2, activityId: a.id, tasks: a.data.tasks.map(tk => ({ code: tk.solution, outputs: tk.tests.map(x => x.expected) })) });
  });
  const after = api('courseMap', { token: t2 });
  assert.strictEqual(after.bonus.earned, 60); assert.strictEqual(after.bonus.max, 60);
  assert.strictEqual(after.overall.earned, before.overall.earned, 'คะแนนหลักต้องไม่เปลี่ยน');
  assert.strictEqual(after.certificates.filter(c => /^U1[1-5]$/.test(c.unitId)).length, 5);
  assert.ok(after.certificates.some(c => c.unitId === 'U11' && /คะแนนพิเศษ/.test(c.title)));
});
t('ping สำหรับทดสอบการเชื่อมต่อ', () => { const p = api('ping', {}); assert.ok(p.ok); assert.strictEqual(p.units, 15); });

t('ล้างข้อมูลตัวอย่าง', () => {
  const n = ctx.clearSampleData_(store);
  assert.strictEqual(n, 9);
  assert.strictEqual(store.all('Students').length, 1);
  assert.ok(store.all('Attempts').every(a => a.studentId === store.all('Students')[0].id || false) || store.all('Attempts').length === 0);
});

console.log('\nผ่าน ' + pass + ' รายการ' + (process.exitCode ? ' (มีรายการไม่ผ่าน)' : ''));
