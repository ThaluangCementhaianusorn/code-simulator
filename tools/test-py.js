/* test-py.js — ทดสอบตัวจำลอง Python (harness ใน Runner.html) และตรวจเฉลยทุกโจทย์กับชุดทดสอบ
 * ต้องมีแพ็กเกจ pyodide: NODE_PATH=<โฟลเดอร์ node_modules> node tools/test-py.js */
const fs = require('fs'), path = require('path'), vm = require('vm'), assert = require('assert');
const { loadPyodide } = require('pyodide');
const src = p => fs.readFileSync(path.join(__dirname, '..', 'src', p), 'utf8');
const runner = src('Runner.html');
const harness = runner.split('# ===== PY-HARNESS-START =====')[1].split('# ===== PY-HARNESS-END =====')[0];
const ctx = vm.createContext({});
vm.runInContext(src('Core.gs') + '\n' + src('Content.gs') + '\n' + src('Content2.gs') + '\nthis.seed = getSeedCourse_(); this.cmp = compareOutput_;', ctx);

(async () => {
  const py = await loadPyodide();
  py.runPython(harness);
  const call = (op, args) => { const f = py.globals.get('__sim_' + op); const r = JSON.parse(f(JSON.stringify(args))); f.destroy(); return r; };
  let pass = 0, fail = 0;
  const t = (name, fn) => { try { fn(); pass++; console.log('  ✓ ' + name); } catch (e) { fail++; console.error('  ✗ ' + name + '\n    ' + e.message); } };

  console.log('ตัวจำลอง');
  t('print + input แบบแสดงข้อความคำถาม', () => { const r = call('run', { code: 'n = input("ชื่อ: ")\nprint("สวัสดี", n)', stdin: 'มานี' }); assert.strictEqual(r.output, 'ชื่อ: มานี\nสวัสดี มานี\n'); assert.strictEqual(r.error, null); });
  t('โหมดตรวจ: ไม่แสดงข้อความคำถาม', () => { const r = call('tests', { code: 'a=int(input("a? "))\nb=int(input())\nprint(a+b)', inputs: ['3\n5', '10\n-4'] }); assert.deepStrictEqual(r.map(x => x.output), ['8\n', '6\n']); });
  t('input ไม่พอ → EOFError', () => { const r = call('run', { code: 'x = input()\ny = input()', stdin: '1' }); assert.strictEqual(r.error.type, 'EOFError'); assert.strictEqual(r.error.line, 2); });
  t('SyntaxError ลืม : บอกบรรทัด', () => { const r = call('run', { code: 'x = 1\nif x > 0\n    print(x)' }); assert.strictEqual(r.error.type, 'SyntaxError'); assert.strictEqual(r.error.line, 2); assert.match(r.error.message, /expected ':'/); });
  t('NameError บอกบรรทัด', () => { const r = call('run', { code: 'print(1)\nprint(nmae)' }); assert.strictEqual(r.error.type, 'NameError'); assert.strictEqual(r.error.line, 2); assert.strictEqual(r.output, '1\n'); });
  t('ลูปไม่รู้จบถูกหยุดใน ~1 วินาที', () => { const s = Date.now(); const r = call('run', { code: 'while True:\n    pass', timeLimit: 1 }); assert.ok(r.timeout); assert.ok(Date.now() - s < 3000); });
  t('try/except ไม่กลืนการหยุด', () => { const r = call('run', { code: 'while True:\n    try:\n        x = 1\n    except Exception:\n        pass', timeLimit: 1 }); assert.ok(r.timeout); });
  t('print ไม่รู้จบถูกตัด', () => { const r = call('run', { code: 'while True:\n    print("x")', timeLimit: 5 }); assert.ok(r.truncated); assert.ok(r.output.length <= 100000); });
  t('trace: ค่าตัวแปรทีละบรรทัด', () => {
    const r = call('trace', { code: 'a = 5\nb = a + 2\na = a * b\nprint(a, b)' });
    assert.deepStrictEqual(r.steps.map(s => s.line), [1, 2, 3, 4, 4].slice(0, r.steps.length));
    const last = r.steps[r.steps.length - 1]; assert.strictEqual(last.vars.a.v, '35'); assert.strictEqual(r.output, '35 7\n');
  });
  t('trace: เข้าไปในฟังก์ชันและค่าที่ return', () => {
    const r = call('trace', { code: 'def area(w, h):\n    return w * h\n\nprint(area(3, 4))' });
    const ret = r.steps.find(s => s.ev === 'return' && s.fn === 'area'); assert.strictEqual(ret.ret, '12'); assert.strictEqual(ret.vars.w.v, '3');
  });
  t('trace: จำกัดจำนวนขั้น', () => { const r = call('trace', { code: 'for i in range(10000):\n    x = i', limit: 50 }); assert.strictEqual(r.steps.length, 50); assert.ok(r.truncated); });
  t('รันซ้ำไม่ค้างตัวแปรเดิม', () => { call('run', { code: 'zz = 1' }); const r = call('run', { code: 'print(zz)' }); assert.strictEqual(r.error.type, 'NameError'); });

  console.log('(เนื้อหารายวิชาปัจจุบันเป็นเว็บ ตรวจด้วย tools/test-web.js — ไฟล์นี้ตรวจเฉพาะโจทย์ lang: python)');
  console.log('เฉลยของทุกโจทย์ต้องผ่านชุดทดสอบ และโค้ดตั้งต้นต้องยังไม่ผ่าน');
  const seed = JSON.parse(JSON.stringify(ctx.seed));
  seed.units.forEach(u => u.activities.forEach(a => {
    (a.data.tasks || []).filter(tk => tk.lang === 'python').forEach(tk => t(a.id + ' ' + tk.title, () => {
      const rs = call('tests', { code: tk.solution, inputs: tk.tests.map(x => x.input) });
      rs.forEach((r, k) => { assert.strictEqual(r.error, null, JSON.stringify(r.error)); assert.ok(ctx.cmp(r.output, tk.tests[k].expected, tk.tests[k].compare), 'ชุด ' + (k + 1) + ': ได้ ' + JSON.stringify(r.output) + ' ต้องการ ' + JSON.stringify(tk.tests[k].expected)); });
      const st = call('tests', { code: tk.starterCode || '', inputs: tk.tests.map(x => x.input) });
      assert.ok(st.some((r, k) => r.error || !ctx.cmp(r.output, tk.tests[k].expected, tk.tests[k].compare)), 'โค้ดตั้งต้นไม่ควรผ่านทุกชุด');
    }));
    if (a.type === 'quiz') a.data.questions.filter(q => q.type === 'output' && q.lang === 'python').forEach(q => t(a.id + ' ' + q.id + ' (ทายผลลัพธ์)', () => {
      const r = call('run', { code: q.code }); assert.strictEqual(r.error, null); assert.ok(ctx.cmp(r.output, [].concat(q.answer)[0]), 'ได้ ' + JSON.stringify(r.output));
    }));
    if (a.type === 'knowledge' && a.data.content.includes('```python')) {
      const blocks = a.data.content.split('```python').slice(1).map(b => b.split('```')[0].replace(/^\s*norun.*\n/, '').replace(/^\n/, ''));
      t(a.id + ' โค้ดตัวอย่าง ' + blocks.length + ' บล็อกรันได้', () => blocks.forEach((b, i) => {
        const r = call('run', { code: b, stdin: '72\n5\n8\n0\n10 20 30' }); assert.strictEqual(r.error, null, 'บล็อก ' + (i + 1) + ': ' + JSON.stringify(r.error) + '\n' + b);
      }));
    }
  }));
  console.log('\nผ่าน ' + pass + ' / ไม่ผ่าน ' + fail);
  process.exitCode = fail ? 1 : 0;
})();
