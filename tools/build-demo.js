/* build-demo.js — สร้างหน้าเว็บไฟล์เดียวจาก src/
 *   dist/demo.html       เว็บสาธิต (ข้อมูลอยู่ใน localStorage ของเบราว์เซอร์)
 *   dist/web/            สำหรับ GitHub Pages: index.html + config.js
 *                        ใส่ลิงก์ Apps Script /exec ใน web/config.js → อ่าน/เขียน Google Sheet แบบเรียลไทม์
 *                        ถ้า apiUrl ว่าง จะทำงานเป็นโหมดสาธิต
 * ใช้: node tools/build-demo.js */
const fs = require('fs'), path = require('path');
const root = path.join(__dirname, '..');
const src = p => fs.readFileSync(path.join(root, 'src', p), 'utf8');

let shell = src('App.html');
shell = shell.replace(/<\?!= include\('(\w+)'\) \?>/g, (_, n) => src(n + '.html'));
shell = shell.replace('<base target="_top">', '');
shell = shell.replace('var BOOT = <?!= bootJson ?>;', [
  'var BOOT = (function () {',
  '  var q = {}; location.search.replace(/^\\?/, "").split("&").forEach(function (kv) { if (!kv) return; var p = kv.split("="); q[decodeURIComponent(p[0])] = decodeURIComponent((p[1] || "").replace(/\\+/g, " ")); });',
  '  var admin = q.page === "admin" || location.hash === "#admin";',
  '  return { page: admin ? "teacher" : (q.cert ? "cert" : "student"), cert: q.cert || "", code: q.code || "" };',
  '})();',
  'window.addEventListener("hashchange", function () { location.reload(); });'
].join('\n'));
if (/<\?/.test(shell)) throw new Error('ยังมี scriptlet ของ Apps Script หลงเหลือ');
// ตรวจไวยากรณ์ทุก <script> แบบเดียวกับที่เบราว์เซอร์แบ่ง (เนื้อหาจบที่ </script ตัวแรก)
(function checkScripts(s) {
  let pos = 0, i, n = 0;
  while ((i = s.indexOf('<script', pos)) >= 0) {
    const gt = s.indexOf('>', i), end = s.indexOf('</script', gt), tag = s.slice(i, gt + 1); pos = end + 9; n++;
    if (/\bsrc=|type="text\/python"/.test(tag)) continue;
    try { new Function(s.slice(gt + 1, end)); } catch (e) { throw new Error('<script> ที่ ' + n + ' ผิดไวยากรณ์: ' + e.message + ' → ' + JSON.stringify(s.slice(gt + 1, gt + 120))); }
  }
})(shell);

const backend = [
  fs.readFileSync(path.join(__dirname, 'memstore.js'), 'utf8').replace(/if \(typeof module[^\n]*\n/, ''),
  src('Core.gs'),
  src('Content.gs'),
  src('Content2.gs'),
  src('Content3.gs'),
  `var DemoBackend = null;
if (!(window.CS_CONFIG && window.CS_CONFIG.apiUrl)) DemoBackend = (function () {
  var KEY = 'cs_demo_db_v3', db = null, timer = null;
  try { db = JSON.parse(localStorage.getItem(KEY)); } catch (e) { db = null; }
  var fresh = !db;
  var st = makeMemStore(db || {}, {
    onWrite: function (d) { if (timer) return; timer = setTimeout(function () { timer = null; try { localStorage.setItem(KEY, JSON.stringify(d)); } catch (e) {} }, 0); },
    url: function () { return location.href.split('#')[0].split('?')[0]; }
  });
  if (fresh) {
    st.setSecret('salt', st.uuid());
    st.setSecret('teacherPassHash', st.hash(st.secret('salt') + ':teacher:teacher1234'));
    st.db.settings.schoolName = 'วิทยาลัยสาธิต (ข้อมูลสมมติ)';
    st.db.settings.signer1Name = 'ครูผู้สอน ตัวอย่าง';
    st.db.settings.signer2Name = 'ผู้อำนวยการ ตัวอย่าง';
    seedSampleData_(st, true);
  }
  return {
    api: function (m, p) { return coreApi(st, m, p); },
    reset: function () { try { Object.keys(localStorage).filter(function (k) { return /^cs_/.test(k); }).forEach(function (k) { localStorage.removeItem(k); }); } catch (e) {} }
  };
})();`
].join('\n;\n').replace(/<\/script/gi, '<\\/script');

const inject = (html, head) => html.replace('<body>', () => '<body>\n' + head + '<script>\n' + backend + '\n</script>');

fs.mkdirSync(path.join(root, 'dist', 'web'), { recursive: true });
// เว็บสาธิต: ไม่อ่าน config.js
const demo = inject(shell, '');
fs.writeFileSync(path.join(root, 'dist', 'demo.html'), demo);

// GitHub Pages: อ่าน config.js ก่อน (ถ้ามี apiUrl จะต่อ Google Sheet)
const web = inject(shell, '<script src="config.js"></script>\n');
fs.writeFileSync(path.join(root, 'dist', 'web', 'index.html'), web);
const cfgSrc = path.join(root, 'web', 'config.js');
if (!fs.existsSync(cfgSrc)) {
  fs.mkdirSync(path.dirname(cfgSrc), { recursive: true });
  fs.writeFileSync(cfgSrc, [
    '/* config.js — ตั้งค่าการเชื่อมต่อฐานข้อมูล Google Sheet',
    ' * apiUrl = ลิงก์ Web app ของ Apps Script ที่ลงท้ายด้วย /exec (Deploy แบบ Who has access: Anyone)',
    ' * เว้นว่าง = โหมดสาธิต (ข้อมูลเก็บในเบราว์เซอร์) */',
    'window.CS_CONFIG = {',
    "  apiUrl: ''",
    '};', ''].join('\n'));
}
fs.copyFileSync(cfgSrc, path.join(root, 'dist', 'web', 'config.js'));
fs.writeFileSync(path.join(root, 'dist', 'web', '.nojekyll'), '');
console.log('dist/demo.html', Math.round(demo.length / 1024) + ' KB');
console.log('dist/web/index.html + config.js', Math.round(web.length / 1024) + ' KB');
