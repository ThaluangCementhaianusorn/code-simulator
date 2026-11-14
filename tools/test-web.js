/* test-web.js — ทดสอบตัวจำลองเว็บ (WebRunner) ในเบราว์เซอร์จริง และตรวจเฉลยทุกโจทย์กับชุดตรวจ
 * ต้องมี puppeteer-core + Chrome: NODE_PATH=<node_modules> node tools/test-web.js [--only=basic|content|showcase] */
const http = require('http'), fs = require('fs'), path = require('path'), vm = require('vm'), assert = require('assert');
const puppeteer = require('puppeteer-core');
const root = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'dist', 'demo.html'));
const src = p => fs.readFileSync(path.join(root, 'src', p), 'utf8');
const ctx = vm.createContext({});
vm.runInContext(src('Core.gs') + '\n' + src('Content.gs') + '\n' + src('Content2.gs') + '\n' + src('Content3.gs') + '\nthis.seed = getSeedCourse_(); this.cmp = compareOutput_;', ctx);
const only = (process.argv.find(a => a.startsWith('--only=')) || '').slice(7);
const server = http.createServer((q, r) => { r.writeHead(200, { 'content-type': 'text/html; charset=utf-8' }); r.end(html); }).listen(0);
const CHROME = ['C:/Program Files/Google/Chrome/Application/chrome.exe', 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'].find(p => fs.existsSync(p));
let pass = 0, fail = 0;
const t = async (name, fn) => { try { await fn(); pass++; console.log('  ✓ ' + name); } catch (e) { fail++; console.error('  ✗ ' + name + '\n    ' + String(e.message).split('\n').slice(0, 8).join('\n    ')); } };
const errText = r => r.errors.filter(e => e.kind !== 'resource').map(e => (e.line ? 'L' + e.line + ' ' : '') + e.message).join(' | ');

(async () => {
  const browser = await puppeteer.launch({ executablePath: CHROME, headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  page.on('pageerror', e => console.log('PAGEERROR', e.message));
  await page.goto('http://127.0.0.1:' + server.address().port + '/', { waitUntil: 'domcontentloaded', timeout: 180000 });
  await page.waitForFunction(() => window.WebRunner, { timeout: 180000 });
  const tests = (code, list, lang, sheets) => page.evaluate((c, l, g, sh) => WebRunner.tests(c, l, { lang: g, sheets: sh || undefined, timeoutMs: 90000 }), code, list, lang || 'html', sheets || null);
  const one = async (code, check, lang, sheets) => (await tests(code, [{ check }], lang, sheets))[0];
  const logs = code => page.evaluate(c => WebRunner.logs(c, 'js'), code);

  if (!only || only === 'basic') {
    console.log('ตัวจำลองเว็บ');
    await t('DOM + ตัวช่วย text/count/css', async () => {
      const r = await one('<!DOCTYPE html>\n<html><body><h1 style="color:red">สวัสดี  เว็บ</h1><ul><li>a</li><li>b</li></ul></body></html>', 'return [text("h1"), count("li"), css("h1","color")].join(",")');
      assert.strictEqual(r.output, 'สวัสดี เว็บ,2,rgb(255, 0, 0)', JSON.stringify(r));
    });
    await t('error บอกเลขบรรทัดตรงกับในตัวแก้ไข', async () => {
      const r = await one('<!DOCTYPE html>\n<html>\n<body>\n<script>\nlet a = 1;\nconsole.log(nmae);\n</script>\n</body>\n</html>', 'return 1');
      assert.strictEqual(r.errors[0].line, 6); assert.match(r.errors[0].message, /nmae is not defined/);
    });
    await t('ไม่มี doctype ก็บอกบรรทัดถูก', async () => {
      const r = await one('<p>x</p>\n<script>\nnull.x\n</script>', 'return 1');
      assert.strictEqual(r.errors[0].line, 3);
    });
    await t('โหมด js: console.log + เลขบรรทัด', async () => {
      const r = await logs('let x = 2;\nconsole.log("ผล", x * 3, [1, 2], {a: 1});\nfoo();');
      assert.strictEqual(r.output, 'ผล 6 [1, 2] { a: 1 }'); assert.strictEqual(r.errors[0].line, 3);
    });
    await t('ลูปไม่รู้จบถูกหยุด และหน้าเว็บยังทำงานต่อ', async () => {
      const s = Date.now();
      const r = await one('<p id="p">0</p><script>\nlet i = 0;\nwhile (true) { i++; }\ndocument.getElementById("p").textContent = "ok";\n</script>', 'return text("#p")');
      assert.ok(r.errors.some(e => e.name === 'LoopTimeout')); assert.strictEqual(r.output, 'ok'); assert.ok(Date.now() - s < 6000);
    });
    await t('for (…(…)…) ซ้อนวงเล็บยังทำงานถูก', async () => {
      const r = await logs('let s = 0;\nfor (let i = 0; i < Math.max(3, 2); i++) { s += i; }\nconsole.log(s);');
      assert.strictEqual(r.output, '3');
    });
    await t('localStorage จำลองใช้ได้', async () => {
      const r = await one('<script>localStorage.setItem("n", 5); localStorage.x = "y";</script>', 'return store("n") + localStorage.getItem("x") + localStorage.length');
      assert.strictEqual(r.output, '5y2');
    });
    await t('fetch /api: GET ค้นหา POST PATCH DELETE', async () => {
      const r = await one('<script></script>', `
        const a = await (await fetch('/api/students?q=ใจดี')).json();
        const p = await fetch('/api/students', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ name: 'ใหม่' }) });
        const n = await p.json();
        await fetch('/api/students/' + n.id, { method: 'PATCH', body: JSON.stringify({ room: 'X' }) });
        const g = await (await fetch('/api/students/' + n.id)).json();
        await fetch('/api/students/1', { method: 'DELETE' });
        const all = await (await fetch('/api/students')).json();
        const bad = await fetch('/api/students', { method: 'POST', body: { a: 1 } });
        const nf = await fetch('/api/nope');
        return [a.length, p.status, n.id, g.room + g.name, all.length, bad.status, nf.status].join(',');`);
      assert.strictEqual(r.output, '1,201,6,Xใหม่,5,400,404');
    });
    await t('Vue 3 จาก CDN + click/type', async () => {
      const r = await one('<div id="app"><input v-model="name"><button @click="n++">+</button><p>{{ name }} {{ n }}</p></div>\n<script src="https://cdnjs.cloudflare.com/ajax/libs/vue/3.4.38/vue.global.js"></script>\n<script>\nVue.createApp({ data() { return { name: "", n: 0 } } }).mount("#app")\n</script>', 'await type("input", "ดาว"); await click("button"); await click("button"); return text("p")');
      assert.strictEqual(r.output, 'ดาว 2');
    });
    await t('Vue warn แปลไทยได้', async () => {
      const r = await page.evaluate(() => thaiJsError({ message: '[Vue warn]: Property "count" was accessed during render but is not defined on instance.' }));
      assert.match(r, /count/);
    });
    await t('form submit ทำงาน (sandbox allow-forms) และ required กันการส่ง', async () => {
      const r = await one('<form id="f"><input id="a" required><button>ส่ง</button></form><p id="o"></p><script>\ndocument.getElementById("f").addEventListener("submit", e => { e.preventDefault(); document.getElementById("o").textContent = "ส่งแล้ว " + document.getElementById("a").value; });\n</script>', 'await submit("#f"); const x = text("#o"); await type("#a", "k"); await submit("#f"); return x + "|" + text("#o")');
      assert.strictEqual(r.output, '|ส่งแล้ว k');
    });
    await t('media query ใช้ความกว้างจอมือถือ 360px', async () => {
      const r = await one('<style>.b{display:flex} @media (max-width: 600px){ .b{display:block} }</style><div class="b">x</div>', 'return css(".b","display") + "," + innerWidth');
      assert.strictEqual(r.output, 'block,360');
    });
    await t('โหมด gas: SpreadsheetApp จำลอง + ชุดตรวจอ้างเซลล์ข้ามแท็บ + ข้อมูลชุดซ่อนต่อชุด', async () => {
      const rs = await tests('function add(x) { SpreadsheetApp.getActive().getSheetByName("T").appendRow([x, new Date()]); return SpreadsheetApp.getActive().getSheetByName("T").getLastRow(); }',
        [{ check: 'return add("a") + "|" + cell("T!A2")' }, { check: 'return add("b") + "|" + cell("T!A3")', sheets: { T: [['h'], ['old']] } }], 'gas', { T: [['h']] });
      assert.strictEqual(rs[0].output, '2|a', JSON.stringify(rs[0])); assert.strictEqual(rs[1].output, '3|b', JSON.stringify(rs[1]));
    });
    await t('โหมด gas: error ในฟังก์ชันบอกเลขบรรทัดของ Code.gs', async () => {
      const r = await one('function f() {\n  return 1;\n}\nnul.x;', 'return 1', 'gas');
      assert.ok(r.errors.some(e => e.line === 4), JSON.stringify(r.errors));
    });
    await t('alert ไม่บล็อกการตรวจ', async () => {
      const r = await one('<script>alert("hi"); confirm("x");</script><p>ok</p>', 'return text("p") + logs.length');
      assert.strictEqual(r.output, 'ok0');
    });
  }

  const seed = JSON.parse(JSON.stringify(ctx.seed));
  if (!only || only === 'content') {
    console.log('เฉลยทุกโจทย์ต้องผ่านชุดตรวจ และโค้ดตั้งต้นต้องยังไม่ผ่าน');
    for (const u of seed.units) for (const a of u.activities) {
      for (const tk of (a.data.tasks || [])) {
        if (tk.lang === 'python') continue;
        await t(a.id + ' ' + tk.title, async () => {
          const L = tk.lang === 'js' || tk.lang === 'gas' ? tk.lang : 'html';
          const rs = await tests(tk.solution, tk.tests, L, tk.sheets);
          rs.forEach((r, k) => {
            assert.ok(!r.error, 'ชุด ' + (k + 1) + ' (' + tk.tests[k].label + '): ' + JSON.stringify(r.error));
            assert.ok(ctx.cmp(r.output, tk.tests[k].expected, tk.tests[k].compare), 'ชุด ' + (k + 1) + ' (' + tk.tests[k].label + '): ได้ ' + JSON.stringify(r.output) + ' ต้องการ ' + JSON.stringify(tk.tests[k].expected));
          });
          const bad = rs.map(r => errText(r)).filter(Boolean); assert.ok(!bad.length, 'เฉลยมี error: ' + bad[0]);
          const st = await tests(tk.starterCode || '', tk.tests, L, tk.sheets);
          assert.ok(st.some((r, k) => r.error || !ctx.cmp(r.output, tk.tests[k].expected, tk.tests[k].compare)), 'โค้ดตั้งต้นไม่ควรผ่านทุกชุด');
        });
      }
      if (a.type === 'quiz') for (const q of a.data.questions.filter(q => q.type === 'output')) {
        await t(a.id + ' ' + q.id + ' (ทายผลลัพธ์)', async () => {
          const r = await logs(q.code); assert.ok(!errText(r), errText(r)); assert.ok(ctx.cmp(r.output, [].concat(q.answer)[0]), 'ได้ ' + JSON.stringify(r.output) + ' เฉลย ' + JSON.stringify(q.answer));
        });
      }
      if (a.type === 'knowledge') {
        const blocks = []; a.data.content.replace(/```(html|js|gas)([^\n]*)\n([\s\S]*?)\n```/g, (m, l, f, c) => { if (!/norun/.test(f)) blocks.push({ lang: l, code: c }); });
        await t(a.id + ' ตัวอย่างโค้ด ' + blocks.length + ' บล็อกรันได้ไม่มี error', async () => {
          assert.ok(blocks.length >= 3, 'ควรมีตัวอย่างอย่างน้อย 3 บล็อก');
          for (const [i, b] of blocks.entries()) {
            const r = b.lang === 'js' ? await logs(b.code) : b.lang === 'gas' ? await one(b.code, 'return 1', 'gas') : await one(b.code, 'await wait(400); return 1');
            assert.ok(!errText(r), 'บล็อก ' + (i + 1) + ': ' + errText(r) + '\n' + b.code.slice(0, 300));
          }
        });
      }
    }
  }
  if (!only || only === 'showcase') {
    console.log('ระบบตัวอย่าง 10 ระบบ');
    const list = await page.evaluate(() => SHOWCASE);
    await t('มี 10 ระบบ', async () => assert.strictEqual(list.length, 10));
    for (const s of list) await t(s.no + '. ' + s.name, async () => {
      const r = await one(s.code, s.check || 'await wait(500); return document.body.innerText.length > 20');
      assert.ok(!errText(r), errText(r)); assert.ok(!r.error, JSON.stringify(r.error)); assert.strictEqual(r.output, 'true');
    });
  }
  console.log('\nผ่าน ' + pass + ' / ไม่ผ่าน ' + fail);
  await browser.close(); server.close();
  process.exitCode = fail ? 1 : 0;
})();
