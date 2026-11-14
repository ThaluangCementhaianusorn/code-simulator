/**
 * Content.gs — เนื้อหารายวิชา 31909-2009 การพัฒนาเว็บแอปพลิเคชัน (ท-ป-น 2-3-3)
 * 10 ภารกิจ: ภารกิจ 1–5 อยู่ไฟล์นี้ 6–10 อยู่ใน Content2.gs
 * แต่ละภารกิจมี: ใบความรู้ → ใบงาน → แบบฝึกปฏิบัติ → แบบทดสอบ
 * ครูแก้ไขได้ในหน้าครู (แท็บ เนื้อหา) หรือส่งออก/นำเข้าเป็นไฟล์ JSON
 *
 * รูปแบบข้อมูล
 *  knowledge : { content: 'Markdown' }  บล็อก ```html หรือ ```js รันได้ทันทีบนหน้าจอมือถือจำลอง (```html norun = แสดงอย่างเดียว)
 *  worksheet / practice : { intro, maxAttempts, tasks: [{ title, prompt, lang: html|js, starterCode, hints:[], solution,
 *                           tests: [{ label, check, expected, score, hidden, compare: trim|exact|ignorespace|contains|number }] }] }
 *     check = โค้ด JavaScript (async) ที่รันในหน้าเว็บของผู้เรียน แล้ว return ค่าเพื่อเทียบกับ expected
 *     ตัวช่วย: text(sel) texts(sel) val(sel) count(sel) exists(sel) css(sel, prop) attr(sel, name) visible(sel)
 *              click(sel) type(sel, value) submit(sel) wait(ms) waitFor(fn|sel) logs db store(key) $ $$
 *  quiz : { intro, timeLimitMin, maxAttempts, shuffle, questions: [{ id, type: mc|tf|output|fill, text, code, choices, answer, score, explain }] }
 *     output = ทายผลลัพธ์ของ console.log
 */
function L_() { return Array.prototype.slice.call(arguments).join('\n'); }
var VUE_TAG_ = '<script src="https://cdnjs.cloudflare.com/ajax/libs/vue/3.4.38/vue.global.js"></script>';
var BS_TAG_ = '<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.3.3/css/bootstrap.min.css">';
/** โครงหน้า HTML5 มาตรฐาน */
function doc_(title, head, body) {
  return L_.apply(null, ['<!DOCTYPE html>', '<html lang="th">', '<head>', '  <meta charset="UTF-8">', '  <meta name="viewport" content="width=device-width, initial-scale=1">', '  <title>' + title + '</title>']
    .concat(head || [], ['</head>', '<body>'], body || [], ['</body>', '</html>']));
}
var QUIZ_INTRO_ = 'แบบทดสอบ 6 ข้อ เวลา 10 นาที ทำได้ 2 ครั้ง (ใช้คะแนนครั้งที่ดีที่สุด) ระบบบันทึกคำตอบไว้ในเครื่อง ถ้าเน็ตหลุดเปิดกลับมาทำต่อได้ เมื่อหมดเวลาระบบจะส่งให้อัตโนมัติ';
var WS_INTRO_ = 'เขียนโค้ดในช่องแก้ไข หน้าจอมือถือด้านขวาจะเปลี่ยนตามทันที (⚡ สด) กด **🧪 ตรวจกับตัวอย่าง** เพื่อดูว่าผ่านข้อใดแล้ว จากนั้นกด **ส่งงาน** (ส่งได้ 3 ครั้ง ใช้คะแนนครั้งที่ดีที่สุด)';
var PR_INTRO_ = 'ฝึกได้ไม่จำกัดครั้ง ระบบเก็บคะแนนครั้งที่ดีที่สุด การเปิดคำใบ้จะหักคะแนนข้อนั้นตามที่ครูตั้งไว้';

function getSeedCourse_() {
  return { format: 'code-simulator-course', units: [unit1_(), unit2_(), unit3_(), unit4_(), unit5_(), unit6_(), unit7_(), unit8_(), unit9_(), unit10_(), unit11_()] };
}

/* ======================= ภารกิจที่ 1 ======================= */
function unit1_() {
  return {
    id: 'U1', order: 1, icon: '🌐', title: 'เว็บแอปพลิเคชันและ HTML5',
    mission: 'เข้าใจการทำงานของเว็บแอปพลิเคชัน และสร้างหน้าโปรไฟล์ด้วยโครงสร้าง HTML5',
    summary: 'Client–Server • HTTP • เทคโนโลยีที่ต้องเรียน • โครงสร้าง HTML5 • Semantic Tag • ฟอร์ม',
    activities: [
      { id: 'U1-K', order: 1, type: 'knowledge', title: 'ใบความรู้ที่ 1: เว็บแอปพลิเคชันทำงานอย่างไร และโครงสร้าง HTML5', data: { content: L_(
        '# เว็บแอปพลิเคชันคืออะไร',
        '**เว็บไซต์** เน้นแสดงข้อมูลให้อ่าน ส่วน **เว็บแอปพลิเคชัน** คือโปรแกรมที่ทำงานผ่านเบราว์เซอร์ ผู้ใช้ *โต้ตอบ* และ *บันทึกข้อมูล* ได้ เช่น ระบบจองห้อง ร้านค้าออนไลน์ ระบบแจ้งซ่อม Google Docs',
        '',
        '## สถาปัตยกรรม Client–Server',
        '1. ผู้ใช้พิมพ์ URL หรือกดปุ่ม → **เบราว์เซอร์ (Client)** ส่ง *Request* ผ่านโปรโตคอล HTTP/HTTPS',
        '2. **เซิร์ฟเวอร์ (Server)** ประมวลผล อ่าน/เขียน **ฐานข้อมูล** แล้วส่ง *Response* กลับ (HTML, CSS, JS หรือข้อมูล JSON)',
        '3. เบราว์เซอร์นำผลลัพธ์มาแสดงบนหน้าจอ',
        '',
        '| รหัสสถานะ HTTP | ความหมาย |',
        '|---|---|',
        '| `200` | สำเร็จ (OK) |',
        '| `201` | สร้างข้อมูลใหม่สำเร็จ (Created) |',
        '| `404` | ไม่พบสิ่งที่ร้องขอ (Not Found) |',
        '| `500` | เซิร์ฟเวอร์ผิดพลาด (Server Error) |',
        '',
        '## ถ้าจะสร้างเว็บแอปพลิเคชัน ต้องเรียนอะไรบ้าง',
        '| ลำดับ | เรื่องที่ต้องเรียน | ใช้ทำอะไร | ภารกิจ |',
        '|---|---|---|---|',
        '| 1 | **HTML5** | โครงสร้างและเนื้อหาของหน้าเว็บ | 1 |',
        '| 2 | **CSS3 + Responsive** | ตกแต่งและจัดหน้าให้พอดีทุกจอ | 2 |',
        '| 3 | **JavaScript + DOM** | ทำให้หน้าเว็บโต้ตอบได้ | 3 |',
        '| 4 | **หลักการออกแบบด้วยเฟรมเวิร์ก (Vue 3)** | สร้าง UI แบบ Component และ Reactive | 4–6 |',
        '| 5 | **สไตล์ชีตเฟรมเวิร์ก (Bootstrap 5)** | ตกแต่งเร็ว สวย สม่ำเสมอ | 7 |',
        '| 6 | **API + ฐานข้อมูล** | อ่าน/เพิ่ม/แก้/ลบข้อมูลจริง (CRUD) | 8–9 |',
        '| 7 | **การอัปโหลดเว็บไซต์** | Domain, Hosting, GitHub Pages, HTTPS | 10 |',
        '',
        '> 💡 ระบบนี้มี **ตัวจำลอง (Simulator)** พิมพ์โค้ดด้านซ้าย แล้วดูผลบน **หน้าจอมือถือ** ด้านขวาได้ทันที บนมือถือให้แตะแท็บ **📱 หน้าจอ** เพื่อสลับดู',
        '',
        '## โครงสร้างหน้าเว็บ HTML5',
        'HTML ประกอบด้วย **แท็ก (tag)** เปิด `<p>` และปิด `</p>` ครอบเนื้อหา ทุกหน้าต้องมีโครงสร้างดังนี้ ลองแก้ข้อความแล้วดูหน้าจอเปลี่ยนตาม',
        '',
        '```html',
        doc_('หน้าแรกของฉัน', [], [
          '  <h1>สวัสดีชาวโลก 👋</h1>',
          '  <p>นี่คือหน้าเว็บแรกของฉัน เขียนด้วย <b>HTML5</b></p>',
          '  <a href="https://developer.mozilla.org/th/">อ่านคู่มือ HTML เพิ่มเติม</a>'
        ]),
        '```',
        '',
        '- `<!DOCTYPE html>` บอกว่าเป็น HTML5',
        '- `<meta name="viewport">` ทำให้แสดงผลพอดีจอมือถือ **ต้องมีทุกหน้า**',
        '- `<head>` เก็บข้อมูลของหน้า ส่วน `<body>` คือสิ่งที่ผู้ใช้เห็น',
        '',
        '## แท็กที่ใช้บ่อย',
        '```html',
        '<h1>หัวข้อใหญ่</h1>',
        '<h2>หัวข้อรอง</h2>',
        '<p>ย่อหน้า <strong>ตัวหนา</strong> <em>ตัวเอียง</em></p>',
        '<img src="https://picsum.photos/320/120" alt="ภาพตัวอย่าง" width="100%">',
        '<ul>',
        '  <li>HTML</li>',
        '  <li>CSS</li>',
        '  <li>JavaScript</li>',
        '</ul>',
        '<table border="1">',
        '  <tr><th>วัน</th><th>วิชา</th></tr>',
        '  <tr><td>จันทร์</td><td>พัฒนาเว็บแอป</td></tr>',
        '</table>',
        '```',
        '',
        '## Semantic Tag: แท็กที่บอกความหมาย',
        'ช่วยให้โค้ดอ่านง่าย เครื่องมือค้นหา (SEO) และโปรแกรมอ่านหน้าจอเข้าใจโครงสร้าง',
        '',
        '| แท็ก | ใช้กับ |',
        '|---|---|',
        '| `<header>` | ส่วนหัว โลโก้ |',
        '| `<nav>` | กลุ่มลิงก์เมนู |',
        '| `<main>` | เนื้อหาหลัก (มีได้ 1 ครั้งต่อหน้า) |',
        '| `<section>` / `<article>` | กลุ่มเนื้อหา / บทความ |',
        '| `<footer>` | ส่วนท้าย ลิขสิทธิ์ ติดต่อ |',
        '',
        '```html',
        '<header><h1>☕ ร้านกาแฟวิทยาลัย</h1></header>',
        '<nav>',
        '  <a href="#menu">เมนู</a> | <a href="#about">เกี่ยวกับเรา</a> | <a href="#contact">ติดต่อ</a>',
        '</nav>',
        '<main>',
        '  <section id="menu"><h2>เมนูแนะนำ</h2><p>กาแฟเย็น 45 บาท</p></section>',
        '  <section id="about"><h2>เกี่ยวกับเรา</h2><p>ร้านกาแฟของนักศึกษา</p></section>',
        '</main>',
        '<footer id="contact">© 2569 ร้านกาแฟวิทยาลัย</footer>',
        '```',
        '',
        '## ฟอร์ม: ช่องทางรับข้อมูลจากผู้ใช้',
        'เว็บแอปทุกระบบต้องรับข้อมูล `<label for>` ต้องตรงกับ `id` ของช่อง และ `type` ช่วยให้มือถือแสดงแป้นที่เหมาะสม',
        '',
        '```html',
        '<form>',
        '  <label for="email">อีเมล</label><br>',
        '  <input id="email" type="email" placeholder="you@example.com" required><br>',
        '  <label for="tel">เบอร์โทร</label><br>',
        '  <input id="tel" type="tel"><br>',
        '  <label for="level">ระดับชั้น</label><br>',
        '  <select id="level"><option>ปวช.</option><option>ปวส.</option></select><br><br>',
        '  <button type="submit">สมัคร</button>',
        '</form>',
        '```'
      ) } },
      { id: 'U1-W', order: 2, type: 'worksheet', title: 'ใบงานที่ 1: หน้าโปรไฟล์ด้วย HTML5', data: {
        intro: WS_INTRO_, maxAttempts: 3,
        tasks: [
          { title: 'ข้อ 1 หน้าโปรไฟล์ของฉัน', lang: 'html', prompt: L_('แก้หน้าเว็บให้มีข้อมูลดังนี้',
              '- `<h1>` ข้อความ `สมชาย ใจดี`',
              '- `<p class="role">` ข้อความ `นักศึกษา ปวส. เทคโนโลยีสารสนเทศ`',
              '- รายการทักษะ `<ul>` อย่างน้อย **3** รายการ'),
            starterCode: doc_('โปรไฟล์', [], ['  <h1>ชื่อของฉัน</h1>', '  <!-- เพิ่ม <p class="role"> ตรงนี้ -->', '  <h2>ทักษะ</h2>', '  <ul>', '    <li>HTML</li>', '  </ul>']),
            hints: ['class เขียนในแท็กเปิด: <p class="role">ข้อความ</p>', 'เพิ่ม <li>CSS</li> และ <li>JavaScript</li> ใน <ul>'],
            solution: doc_('โปรไฟล์', [], ['  <h1>สมชาย ใจดี</h1>', '  <p class="role">นักศึกษา ปวส. เทคโนโลยีสารสนเทศ</p>', '  <h2>ทักษะ</h2>', '  <ul>', '    <li>HTML</li>', '    <li>CSS</li>', '    <li>JavaScript</li>', '  </ul>']),
            tests: [
              { label: 'h1 แสดงชื่อ สมชาย ใจดี', check: 'return text("h1")', expected: 'สมชาย ใจดี', score: 2 },
              { label: 'p.role แสดงข้อความถูกต้อง', check: 'return text("p.role")', expected: 'นักศึกษา ปวส. เทคโนโลยีสารสนเทศ', score: 1 },
              { label: 'มีทักษะใน ul อย่างน้อย 3 รายการ', check: 'return count("ul li") >= 3', expected: 'true', score: 2 }
            ] },
          { title: 'ข้อ 2 โครงสร้าง Semantic', lang: 'html', prompt: L_('จัดหน้าเว็บร้านค้าให้ใช้ Semantic Tag',
              '- มี `<header>` `<main>` และ `<footer>`',
              '- `<nav>` มีลิงก์ `<a>` อย่างน้อย **3** ลิงก์',
              '- ใน `<footer>` มีสัญลักษณ์ลิขสิทธิ์ `©`'),
            starterCode: doc_('ร้านค้า', [], ['  <div>', '    <h1>ร้านของฉัน</h1>', '  </div>', '  <div>', '    <a href="#">หน้าแรก</a>', '  </div>', '  <div>', '    <p>สินค้าแนะนำ</p>', '  </div>']),
            hints: ['เปลี่ยน <div> ตัวแรกเป็น <header> ตัวที่สองเป็น <nav> ตัวที่สามเป็น <main>', 'เพิ่ม <footer>© 2569 ร้านของฉัน</footer> ก่อน </body>'],
            solution: doc_('ร้านค้า', [], ['  <header>', '    <h1>ร้านของฉัน</h1>', '  </header>', '  <nav>', '    <a href="#">หน้าแรก</a> <a href="#">สินค้า</a> <a href="#">ติดต่อ</a>', '  </nav>', '  <main>', '    <p>สินค้าแนะนำ</p>', '  </main>', '  <footer>© 2569 ร้านของฉัน</footer>']),
            tests: [
              { label: 'มี header, main และ footer', check: 'return exists("header") && exists("main") && exists("footer")', expected: 'true', score: 2 },
              { label: 'nav มีลิงก์อย่างน้อย 3 ลิงก์', check: 'return count("nav a") >= 3', expected: 'true', score: 2 },
              { label: 'footer มีสัญลักษณ์ ©', check: 'return (text("footer") || "").includes("©")', expected: 'true', score: 1, hidden: true }
            ] }
        ] } },
      { id: 'U1-P', order: 3, type: 'practice', title: 'แบบฝึกปฏิบัติที่ 1: ตารางและฟอร์ม', data: {
        intro: PR_INTRO_,
        tasks: [
          { title: 'ข้อ 1 ตารางเรียน', lang: 'html', prompt: L_('สร้างตาราง `<table>` ที่มี', '- `<caption>` ข้อความ `ตารางเรียน`', '- `<thead>` เป็นหัวตาราง', '- `<tbody>` มีข้อมูล **3** แถว (`<tr>`)'),
            starterCode: L_('<table border="1">', '  <tr><th>วัน</th><th>วิชา</th></tr>', '  <tr><td>จันทร์</td><td>เว็บแอป</td></tr>', '</table>', ''),
            hints: ['โครง: <table><caption>…</caption><thead><tr>…</tr></thead><tbody>…</tbody></table>'],
            solution: L_('<table border="1">', '  <caption>ตารางเรียน</caption>', '  <thead><tr><th>วัน</th><th>วิชา</th></tr></thead>', '  <tbody>', '    <tr><td>จันทร์</td><td>เว็บแอป</td></tr>', '    <tr><td>อังคาร</td><td>ฐานข้อมูล</td></tr>', '    <tr><td>พุธ</td><td>ภาษาอังกฤษ</td></tr>', '  </tbody>', '</table>'),
            tests: [
              { label: 'มี thead', check: 'return exists("table thead")', expected: 'true', score: 1 },
              { label: 'tbody มี 3 แถว', check: 'return count("table tbody tr")', expected: '3', score: 2 },
              { label: 'caption คือ ตารางเรียน', check: 'return text("caption")', expected: 'ตารางเรียน', score: 1, hidden: true }
            ] },
          { title: 'ข้อ 2 ฟอร์มสมัครสมาชิก', lang: 'html', prompt: L_('สร้างฟอร์มสมัครสมาชิกที่มี', '- ช่องอีเมล `id="email"` ชนิด `email` และต้องกรอก (`required`)', '- ช่องรหัสผ่าน `id="password"` ชนิด `password` ยาวอย่างน้อย 8 ตัว (`minlength="8"`)', '- `<label for>` ของทั้ง 2 ช่อง และปุ่มส่งในฟอร์ม'),
            starterCode: L_('<form>', '  <p>สมัครสมาชิก</p>', '  <input id="email" type="text">', '</form>', ''),
            hints: ['<label for="email">อีเมล</label> <input id="email" type="email" required>', '<input id="password" type="password" minlength="8">'],
            solution: L_('<form>', '  <p>สมัครสมาชิก</p>', '  <label for="email">อีเมล</label>', '  <input id="email" type="email" required>', '  <label for="password">รหัสผ่าน</label>', '  <input id="password" type="password" minlength="8">', '  <button type="submit">สมัคร</button>', '</form>'),
            tests: [
              { label: 'ช่องอีเมลเป็นชนิด email และ required', check: 'return attr("#email", "type") === "email" && $("#email").required', expected: 'true', score: 2 },
              { label: 'รหัสผ่าน minlength เท่ากับ 8', check: 'return attr("#password", "type") + " " + attr("#password", "minlength")', expected: 'password 8', score: 1 },
              { label: 'มี label for อย่างน้อย 2 อัน', check: 'return count("label[for]") >= 2', expected: 'true', score: 1 },
              { label: 'มีปุ่มในฟอร์ม', check: 'return exists("form button")', expected: 'true', score: 1, hidden: true }
            ] }
        ] } },
      { id: 'U1-Q', order: 4, type: 'quiz', title: 'แบบทดสอบภารกิจที่ 1', data: {
        intro: QUIZ_INTRO_, timeLimitMin: 10, maxAttempts: 2, shuffle: true,
        questions: [
          { id: 'q1', type: 'mc', text: 'ข้อใดคือหน้าที่ของ **เบราว์เซอร์** ในสถาปัตยกรรม Client–Server', choices: ['ส่งคำขอ (Request) และแสดงผลที่ได้รับ', 'เก็บฐานข้อมูลของเว็บไซต์', 'ประมวลผลคำสั่ง SQL', 'จดทะเบียนชื่อโดเมน'], answer: 0, score: 1, explain: 'เบราว์เซอร์คือฝั่ง Client ส่ง Request และแสดงผล Response' },
          { id: 'q2', type: 'mc', text: 'แท็กใดใช้สร้างลิงก์ไปยังหน้าอื่น', choices: ['<link>', '<a>', '<href>', '<url>'], answer: 1, score: 1, explain: '<a href="..."> คือลิงก์ ส่วน <link> ใช้โหลดไฟล์ CSS' },
          { id: 'q3', type: 'tf', text: 'แท็ก `<nav>` เป็น Semantic Tag สำหรับกลุ่มลิงก์นำทาง', answer: true, score: 1, explain: 'nav = navigation' },
          { id: 'q4', type: 'mc', text: 'รหัสสถานะ HTTP `404` หมายถึงอะไร', choices: ['สำเร็จ', 'ไม่พบสิ่งที่ร้องขอ', 'เซิร์ฟเวอร์ผิดพลาด', 'สร้างข้อมูลสำเร็จ'], answer: 1, score: 1, explain: '404 Not Found' },
          { id: 'q5', type: 'fill', text: 'แท็ก `<meta name="____">` ทำให้หน้าเว็บแสดงผลพอดีจอมือถือ', answer: ['viewport'], score: 1, explain: '<meta name="viewport" content="width=device-width, initial-scale=1">' },
          { id: 'q6', type: 'mc', text: 'ข้อใดเป็นเทคโนโลยีฝั่ง **Front-end** ทั้งหมด', choices: ['HTML, CSS, JavaScript', 'MySQL, PostgreSQL, MongoDB', 'Apache, Nginx, IIS', 'DNS, FTP, SSH'], answer: 0, score: 1, explain: 'Front-end คือสิ่งที่ทำงานบนเบราว์เซอร์' }
        ] } }
    ]
  };
}

/* ======================= ภารกิจที่ 2 ======================= */
function unit2_() {
  return {
    id: 'U2', order: 2, icon: '🎨', title: 'CSS3 และการออกแบบ Responsive',
    mission: 'ตกแต่งหน้าเว็บด้วย CSS3 และจัดเลย์เอาต์ให้แสดงผลสวยทั้งบนมือถือและคอมพิวเตอร์',
    summary: 'Selector • Box Model • Flexbox • Grid • Media Query • Mobile-first • CSS Variables',
    activities: [
      { id: 'U2-K', order: 1, type: 'knowledge', title: 'ใบความรู้ที่ 2: CSS3, Flexbox, Grid และ Responsive', data: { content: L_(
        '# CSS: ภาษาตกแต่งหน้าเว็บ',
        'CSS กำหนด *หน้าตา* ของ HTML รูปแบบคือ `ตัวเลือก { คุณสมบัติ: ค่า; }` เขียนได้ 3 ที่ คือ ในแท็ก (`style=""`), ใน `<style>` และไฟล์แยก `.css` (แนะนำสำหรับงานจริง)',
        '',
        '```html',
        '<style>',
        '  body { font-family: sans-serif; background: #f1f5f9; margin: 0; padding: 16px; }',
        '  h1 { color: #4f46e5; }          /* แท็ก */',
        '  .price { color: #dc2626; font-weight: bold; }   /* class ใช้ซ้ำได้ */',
        '  #special { background: #fef3c7; }             /* id ใช้ครั้งเดียว */',
        '</style>',
        '<h1>เมนูวันนี้</h1>',
        '<p>กาแฟเย็น <span class="price">45 บาท</span></p>',
        '<p id="special">โปรโมชัน: ซื้อ 2 แก้ว ลด 10 บาท</p>',
        '```',
        '',
        '## Box Model',
        'ทุก element คือกล่อง ประกอบด้วย **content → padding → border → margin** (จากในออกนอก) ใช้ `box-sizing: border-box` เพื่อให้ width รวม padding และ border แล้ว',
        '',
        '```html',
        '<style>',
        '  * { box-sizing: border-box; }',
        '  .card { width: 100%; padding: 16px; border: 2px solid #c7d2fe; border-radius: 16px; margin: 12px 0;',
        '          background: white; box-shadow: 0 4px 12px rgba(0,0,0,.08); font-family: sans-serif; }',
        '</style>',
        '<div class="card"><h3>☕ กาแฟเย็น</h3><p>45 บาท</p></div>',
        '<div class="card"><h3>🍵 ชาเขียว</h3><p>40 บาท</p></div>',
        '```',
        '',
        '## Flexbox: จัดเรียงในแนวเดียว',
        '| คุณสมบัติ | ใช้ทำ |',
        '|---|---|',
        '| `display: flex` | เปิดใช้ Flexbox (ลูกเรียงแนวนอน) |',
        '| `justify-content` | จัดแนวแกนหลัก: `center`, `space-between` |',
        '| `align-items` | จัดแนวแกนขวาง: `center` |',
        '| `gap` | ระยะห่างระหว่างลูก |',
        '| `flex-wrap: wrap` | ขึ้นบรรทัดใหม่เมื่อไม่พอ |',
        '',
        '```html',
        '<style>',
        '  nav ul { display: flex; justify-content: space-between; list-style: none; padding: 12px; margin: 0; background: #4f46e5; border-radius: 12px; }',
        '  nav a { color: white; text-decoration: none; font-family: sans-serif; }',
        '</style>',
        '<nav><ul><li><a href="#">หน้าแรก</a></li><li><a href="#">เมนู</a></li><li><a href="#">ติดต่อ</a></li></ul></nav>',
        '```',
        '',
        '## CSS Grid: จัดเป็นตาราง 2 มิติ',
        '```html',
        '<style>',
        '  .gallery { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; }',
        '  .gallery div { background: #e0e7ff; border-radius: 12px; padding: 24px; text-align: center; font-size: 28px; }',
        '</style>',
        '<div class="gallery"><div>☕</div><div>🍰</div><div>🥐</div><div>🧃</div></div>',
        '```',
        '',
        '## Responsive Design และ Media Query',
        'แนวคิด **Mobile-first**: เขียน CSS สำหรับจอเล็กก่อน แล้วใช้ `@media (min-width: …)` เพิ่มสำหรับจอใหญ่ ลองกดปุ่ม **📱 / 💻** เหนือหน้าจอเพื่อสลับขนาดจอ',
        '',
        '```html',
        '<style>',
        '  .grid { display: grid; grid-template-columns: 1fr; gap: 10px; font-family: sans-serif; }',
        '  .grid div { background: #fde68a; padding: 20px; border-radius: 10px; }',
        '  @media (min-width: 768px) {',
        '    .grid { grid-template-columns: repeat(3, 1fr); }',
        '    .grid div { background: #a7f3d0; }',
        '  }',
        '</style>',
        '<p>จอมือถือ: 1 คอลัมน์ สีเหลือง · จอคอม: 3 คอลัมน์ สีเขียว</p>',
        '<div class="grid"><div>กล่อง 1</div><div>กล่อง 2</div><div>กล่อง 3</div></div>',
        '```',
        '',
        '## CSS Variables: เปลี่ยนธีมทั้งเว็บในที่เดียว',
        '```html',
        '<style>',
        '  :root { --brand: #4f46e5; --radius: 999px; }',
        '  .btn { background: var(--brand); color: white; border: 0; padding: 12px 22px; border-radius: var(--radius); font-size: 16px; cursor: pointer; }',
        '  .btn:hover { opacity: .85; }',
        '</style>',
        '<button class="btn">สั่งซื้อเลย</button>',
        '```'
      ) } },
      { id: 'U2-W', order: 2, type: 'worksheet', title: 'ใบงานที่ 2: การ์ดเมนูและแถบเมนู', data: {
        intro: WS_INTRO_, maxAttempts: 3,
        tasks: [
          { title: 'ข้อ 1 การ์ดเมนู', lang: 'html', prompt: L_('เขียน CSS ให้การ์ดเมนู', '- `.card` มุมโค้ง `16px` และ padding `16px`', '- หัวข้อ `.card h2` ขนาดตัวอักษร `20px`', '- ราคา `.price` สีแดง `#dc2626`'),
            starterCode: L_('<style>', '  .card { border: 1px solid #ddd; }', '  /* เขียน CSS ต่อที่นี่ */', '</style>', '<div class="card">', '  <h2>☕ กาแฟเย็น</h2>', '  <p class="price">45 บาท</p>', '</div>', ''),
            hints: ['.card { border-radius: 16px; padding: 16px; }', '.card h2 { font-size: 20px; } .price { color: #dc2626; }'],
            solution: L_('<style>', '  .card { border: 1px solid #ddd; border-radius: 16px; padding: 16px; }', '  .card h2 { font-size: 20px; }', '  .price { color: #dc2626; }', '</style>', '<div class="card">', '  <h2>☕ กาแฟเย็น</h2>', '  <p class="price">45 บาท</p>', '</div>'),
            tests: [
              { label: '.card มุมโค้ง 16px', check: 'return css(".card", "border-top-left-radius")', expected: '16px', score: 1 },
              { label: '.card padding 16px', check: 'return css(".card", "padding-top")', expected: '16px', score: 1 },
              { label: '.price สีแดง #dc2626', check: 'return css(".price", "color")', expected: 'rgb(220, 38, 38)', score: 1 },
              { label: 'หัวข้อขนาด 20px', check: 'return css(".card h2", "font-size")', expected: '20px', score: 2 }
            ] },
          { title: 'ข้อ 2 แถบเมนูแบบ Flexbox', lang: 'html', prompt: L_('จัดเมนูให้เรียงแนวนอน', '- `nav ul` ใช้ `display: flex` และ `justify-content: space-between`', '- `nav li` ไม่มีจุดหน้ารายการ (`list-style: none`)'),
            starterCode: L_('<style>', '  nav ul { background: #4f46e5; padding: 12px; }', '  nav a { color: white; }', '</style>', '<nav>', '  <ul>', '    <li><a href="#">หน้าแรก</a></li>', '    <li><a href="#">เมนู</a></li>', '    <li><a href="#">ติดต่อ</a></li>', '  </ul>', '</nav>', ''),
            hints: ['nav ul { display: flex; justify-content: space-between; }', 'nav li { list-style: none; }'],
            solution: L_('<style>', '  nav ul { background: #4f46e5; padding: 12px; display: flex; justify-content: space-between; }', '  nav li { list-style: none; }', '  nav a { color: white; }', '</style>', '<nav>', '  <ul>', '    <li><a href="#">หน้าแรก</a></li>', '    <li><a href="#">เมนู</a></li>', '    <li><a href="#">ติดต่อ</a></li>', '  </ul>', '</nav>'),
            tests: [
              { label: 'nav ul เป็น flex', check: 'return css("nav ul", "display")', expected: 'flex', score: 2 },
              { label: 'จัดแบบ space-between', check: 'return css("nav ul", "justify-content")', expected: 'space-between', score: 2 },
              { label: 'li ไม่มีจุดหน้ารายการ', check: 'return css("nav li", "list-style-type")', expected: 'none', score: 1, hidden: true }
            ] }
        ] } },
      { id: 'U2-P', order: 3, type: 'practice', title: 'แบบฝึกปฏิบัติที่ 2: Grid ที่ Responsive และ CSS Variables', data: {
        intro: PR_INTRO_,
        tasks: [
          { title: 'ข้อ 1 แกลเลอรีแบบ Grid', lang: 'html', prompt: L_('ทำ `.gallery` เป็น Grid แบบ Mobile-first', '- บนมือถือแสดง **2 คอลัมน์** ระยะห่าง `gap: 12px`', '- เพิ่ม `@media (min-width: 768px)` ให้เป็น 4 คอลัมน์ (ลองกด 💻 ดู)'),
            starterCode: L_('<style>', '  .gallery div { background: #e0e7ff; padding: 24px; text-align: center; font-size: 28px; }', '</style>', '<div class="gallery">', '  <div>☕</div><div>🍰</div><div>🥐</div><div>🧃</div>', '</div>', ''),
            hints: ['.gallery { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; }', '@media (min-width: 768px) { .gallery { grid-template-columns: repeat(4, 1fr); } }'],
            solution: L_('<style>', '  .gallery { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; }', '  .gallery div { background: #e0e7ff; padding: 24px; text-align: center; font-size: 28px; }', '  @media (min-width: 768px) {', '    .gallery { grid-template-columns: repeat(4, 1fr); }', '  }', '</style>', '<div class="gallery">', '  <div>☕</div><div>🍰</div><div>🥐</div><div>🧃</div>', '</div>'),
            tests: [
              { label: '.gallery เป็น grid', check: 'return css(".gallery", "display")', expected: 'grid', score: 1 },
              { label: 'จอมือถือมี 2 คอลัมน์', check: 'return css(".gallery", "grid-template-columns").split(" ").length', expected: '2', score: 2 },
              { label: 'gap 12px', check: 'return css(".gallery", "row-gap")', expected: '12px', score: 1 },
              { label: 'มี @media (min-width) สำหรับจอใหญ่', check: 'return Array.from(document.styleSheets).some(s => Array.from(s.cssRules).some(r => r.media && /min-width/.test(r.conditionText || r.media.mediaText)))', expected: 'true', score: 1, hidden: true }
            ] },
          { title: 'ข้อ 2 ปุ่มด้วย CSS Variables', lang: 'html', prompt: L_('ประกาศตัวแปรสี `--brand: #4f46e5` ใน `:root` แล้วใช้กับปุ่ม `.btn`', '- พื้นหลังปุ่ม = `var(--brand)`', '- มุมโค้ง `999px`', '- เคอร์เซอร์เป็นรูปมือ (`cursor: pointer`)'),
            starterCode: L_('<style>', '  .btn { color: white; border: 0; padding: 12px 22px; }', '</style>', '<button class="btn">สั่งซื้อเลย</button>', ''),
            hints: [':root { --brand: #4f46e5; }', '.btn { background: var(--brand); border-radius: 999px; cursor: pointer; }'],
            solution: L_('<style>', '  :root { --brand: #4f46e5; }', '  .btn { color: white; border: 0; padding: 12px 22px; background: var(--brand); border-radius: 999px; cursor: pointer; }', '</style>', '<button class="btn">สั่งซื้อเลย</button>'),
            tests: [
              { label: 'ประกาศ --brand เป็น #4f46e5', check: 'return getComputedStyle(document.documentElement).getPropertyValue("--brand").trim().toLowerCase()', expected: '#4f46e5', score: 1 },
              { label: 'พื้นหลังปุ่มใช้สี brand', check: 'return css(".btn", "background-color")', expected: 'rgb(79, 70, 229)', score: 2 },
              { label: 'มุมโค้ง 999px', check: 'return css(".btn", "border-top-left-radius")', expected: '999px', score: 1 },
              { label: 'cursor: pointer', check: 'return css(".btn", "cursor")', expected: 'pointer', score: 1, hidden: true }
            ] }
        ] } },
      { id: 'U2-Q', order: 4, type: 'quiz', title: 'แบบทดสอบภารกิจที่ 2', data: {
        intro: QUIZ_INTRO_, timeLimitMin: 10, maxAttempts: 2, shuffle: true,
        questions: [
          { id: 'q1', type: 'mc', text: 'ตัวเลือก CSS `.menu` เลือก element ใด', choices: ['แท็กชื่อ menu', 'element ที่มี class="menu"', 'element ที่มี id="menu"', 'ทุก element ในหน้า'], answer: 1, score: 1, explain: 'จุด (.) = class, # = id' },
          { id: 'q2', type: 'mc', text: 'ลำดับของ Box Model จาก **ในสุดไปนอกสุด** คือข้อใด', choices: ['content → padding → border → margin', 'margin → border → padding → content', 'content → border → padding → margin', 'padding → content → margin → border'], answer: 0, score: 1, explain: 'padding อยู่ในกรอบ margin อยู่นอกกรอบ' },
          { id: 'q3', type: 'tf', text: '`display: flex` ทำให้ element ลูกเรียงในแนวนอนเป็นค่าเริ่มต้น', answer: true, score: 1, explain: 'flex-direction เริ่มต้นคือ row' },
          { id: 'q4', type: 'mc', text: '`@media (min-width: 768px) { … }` หมายถึงอะไร', choices: ['ใช้เมื่อจอกว้างไม่เกิน 768px', 'ใช้เมื่อจอกว้างตั้งแต่ 768px ขึ้นไป', 'ใช้เฉพาะตอนพิมพ์', 'ใช้กับจอแนวตั้งเท่านั้น'], answer: 1, score: 1, explain: 'min-width = ความกว้างขั้นต่ำ' },
          { id: 'q5', type: 'fill', text: 'Flexbox: จัดลูกให้อยู่กึ่งกลางแกนนอนด้วย `justify-content: ____`', answer: ['center'], score: 1, explain: 'justify-content: center' },
          { id: 'q6', type: 'mc', text: 'แนวคิด **Mobile-first** คือข้อใด', choices: ['ทำแอปมือถือก่อนทำเว็บ', 'เขียน CSS สำหรับจอเล็กก่อน แล้วเพิ่มสำหรับจอใหญ่ด้วย min-width', 'ห้ามแสดงผลบนคอมพิวเตอร์', 'ใช้รูปภาพขนาดใหญ่ที่สุด'], answer: 1, score: 1, explain: 'เริ่มจากจอเล็ก แล้วขยาย' }
        ] } }
    ]
  };
}

/* ======================= ภารกิจที่ 3 ======================= */
function unit3_() {
  return {
    id: 'U3', order: 3, icon: '⚡', title: 'JavaScript และ DOM',
    mission: 'ใช้ JavaScript รับค่า คำนวณ และเปลี่ยนหน้าเว็บตามการกระทำของผู้ใช้',
    summary: 'ตัวแปร • ฟังก์ชัน • Array/Object • map/filter/reduce • DOM • Event',
    activities: [
      { id: 'U3-K', order: 1, type: 'knowledge', title: 'ใบความรู้ที่ 3: JavaScript, DOM และ Event', data: { content: L_(
        '# JavaScript: สมองของหน้าเว็บ',
        'HTML = โครงสร้าง, CSS = หน้าตา, **JavaScript = การทำงาน** โค้ดบล็อก `js` ด้านล่างแสดงผลทาง **Console** (ผลของ `console.log`) กด ▶ รัน ได้เลย',
        '',
        '```js',
        'let name = "มานี";        // let = เปลี่ยนค่าได้',
        'const price = 45;         // const = ค่าคงที่',
        'let qty = 3;',
        'console.log(name, "ซื้อ", qty, "แก้ว");',
        'console.log(`รวม ${price * qty} บาท`);   // template literal ใช้ ` ` และ ${ }',
        'console.log(typeof name, typeof price);',
        '```',
        '',
        '## เงื่อนไข ลูป และฟังก์ชัน',
        '```js',
        'function grade(score) {',
        '  if (score >= 80) return "A";',
        '  else if (score >= 70) return "B";',
        '  else if (score >= 60) return "C";',
        '  return "F";',
        '}',
        'const toBaht = (n) => n.toLocaleString("th-TH") + " บาท";   // arrow function',
        'for (let s of [85, 72, 40]) {',
        '  console.log(s, grade(s));',
        '}',
        'console.log(toBaht(1250));',
        '```',
        '',
        '## Array และ Object: เก็บข้อมูลหลายรายการ',
        'ข้อมูลในเว็บแอปเกือบทั้งหมดอยู่ในรูป **Array ของ Object** (เหมือนแถวในตารางฐานข้อมูล)',
        '',
        '```js',
        'const menu = [',
        '  { name: "กาแฟเย็น", price: 45, type: "drink" },',
        '  { name: "ครัวซองต์", price: 35, type: "bakery" },',
        '  { name: "ชาเขียว", price: 40, type: "drink" }',
        '];',
        'const drinks = menu.filter(m => m.type === "drink");         // กรอง',
        'const names = menu.map(m => m.name);                         // แปลง',
        'const total = menu.reduce((sum, m) => sum + m.price, 0);     // รวม',
        'console.log(drinks.length, names.join(", "), total);',
        '```',
        '',
        '## DOM: ให้ JavaScript ควบคุมหน้าเว็บ',
        '| คำสั่ง | ใช้ทำ |',
        '|---|---|',
        '| `document.querySelector("#id")` | เลือก element (ใช้ตัวเลือกแบบ CSS) |',
        '| `el.textContent = "…"` | เปลี่ยนข้อความ |',
        '| `el.classList.toggle("on")` | เพิ่ม/ลบ class |',
        '| `el.addEventListener("click", fn)` | รอฟังเหตุการณ์ |',
        '| `input.value` | ค่าที่ผู้ใช้กรอก |',
        '',
        '```html',
        '<h2 id="msg">กดปุ่มด้านล่าง</h2>',
        '<button id="btn">👋 ทักทาย</button>',
        '<script>',
        '  const btn = document.querySelector("#btn");',
        '  const msg = document.querySelector("#msg");',
        '  let n = 0;',
        '  btn.addEventListener("click", () => {',
        '    n++;',
        '    msg.textContent = `สวัสดีครั้งที่ ${n}`;',
        '    console.log("คลิกแล้ว", n, "ครั้ง");',
        '  });',
        '</script>',
        '```',
        '',
        '> 💡 วาง `<script>` ไว้ **ท้าย body** เพื่อให้ HTML ถูกสร้างก่อน ไม่เช่นนั้น querySelector จะหา element ไม่เจอ (ได้ `null`)',
        '',
        '## รับค่าจากช่องกรอก แล้วคำนวณ',
        '```html',
        '<input id="price" type="number" placeholder="ราคา" value="120">',
        '<input id="qty" type="number" placeholder="จำนวน" value="2">',
        '<button id="calc">คำนวณ</button>',
        '<p id="out"></p>',
        '<script>',
        '  document.querySelector("#calc").addEventListener("click", () => {',
        '    const price = Number(document.querySelector("#price").value);',
        '    const qty = Number(document.querySelector("#qty").value);',
        '    document.querySelector("#out").textContent = `รวม ${price * qty} บาท`;',
        '  });',
        '</script>',
        '```',
        '',
        '## สร้างรายการจาก Array (Render)',
        '```html',
        '<ul id="list"></ul>',
        '<script>',
        '  const fruits = ["มะม่วง", "กล้วย", "ส้มโอ"];',
        '  const ul = document.querySelector("#list");',
        '  fruits.forEach(f => {',
        '    const li = document.createElement("li");',
        '    li.textContent = f;',
        '    ul.appendChild(li);',
        '  });',
        '</script>',
        '```',
        '',
        'การเขียนแบบนี้เรียกว่า **Imperative** ต้องสั่ง DOM ทีละขั้นเอง ภารกิจถัดไปจะใช้ **เฟรมเวิร์ก** ที่อัปเดตหน้าจอให้อัตโนมัติ'
      ) } },
      { id: 'U3-W', order: 2, type: 'worksheet', title: 'ใบงานที่ 3: Counter และเครื่องคำนวณ BMI', data: {
        intro: WS_INTRO_, maxAttempts: 3,
        tasks: [
          { title: 'ข้อ 1 ปุ่มนับจำนวน', lang: 'html', prompt: L_('ทำปุ่มนับจำนวน', '- กด `#plus` เพิ่มค่า 1 กด `#minus` ลดค่า 1', '- แสดงค่าใน `#count` (เริ่มที่ 0)', '- **ค่าต้องไม่ต่ำกว่า 0**'),
            starterCode: L_('<button id="minus">−</button>', '<span id="count">0</span>', '<button id="plus">+</button>', '<script>', '  let count = 0;', '  const show = document.querySelector("#count");', '  // เขียน addEventListener ของปุ่ม plus และ minus', '</script>', ''),
            hints: ['document.querySelector("#plus").addEventListener("click", () => { count++; show.textContent = count; });', 'ปุ่มลบ: if (count > 0) count--;'],
            solution: L_('<button id="minus">−</button>', '<span id="count">0</span>', '<button id="plus">+</button>', '<script>', '  let count = 0;', '  const show = document.querySelector("#count");', '  document.querySelector("#plus").addEventListener("click", () => { count++; show.textContent = count; });', '  document.querySelector("#minus").addEventListener("click", () => { if (count > 0) count--; show.textContent = count; });', '</script>'),
            tests: [
              { label: 'เริ่มต้นแสดง 0', check: 'return text("#count")', expected: '0', score: 1 },
              { label: 'กด + 3 ครั้ง ได้ 3', check: 'await click("#plus"); await click("#plus"); await click("#plus"); return text("#count")', expected: '3', score: 2 },
              { label: 'กด + 1 ครั้ง − 3 ครั้ง ต้องได้ 0 (ไม่ติดลบ)', check: 'await click("#plus"); await click("#minus"); await click("#minus"); await click("#minus"); return text("#count")', expected: '0', score: 2, hidden: true }
            ] },
          { title: 'ข้อ 2 เครื่องคำนวณ BMI', lang: 'html', prompt: L_('รับน้ำหนัก `#weight` (กก.) และส่วนสูง `#height` (ซม.) เมื่อกด `#calc` ให้แสดงใน `#result` ว่า', '```text', 'BMI 22.86 (สมส่วน)', '```', 'สูตร BMI = น้ำหนัก ÷ (ส่วนสูงเป็นเมตร)² ทศนิยม 2 ตำแหน่ง (`toFixed(2)`)', '', '| BMI | ผล |', '|---|---|', '| น้อยกว่า 18.5 | ผอม |', '| น้อยกว่า 23 | สมส่วน |', '| น้อยกว่า 25 | ท้วม |', '| ตั้งแต่ 25 | อ้วน |'),
            starterCode: L_('<input id="weight" type="number" placeholder="น้ำหนัก (กก.)">', '<input id="height" type="number" placeholder="ส่วนสูง (ซม.)">', '<button id="calc">คำนวณ</button>', '<p id="result"></p>', '<script>', '  document.querySelector("#calc").addEventListener("click", () => {', '    const w = Number(document.querySelector("#weight").value);', '    // เขียนต่อ', '  });', '</script>', ''),
            hints: ['const h = Number(...) / 100; const bmi = w / (h * h);', 'ใช้ if เลือกผล แล้ว result.textContent = `BMI ${bmi.toFixed(2)} (${level})`'],
            solution: L_('<input id="weight" type="number" placeholder="น้ำหนัก (กก.)">', '<input id="height" type="number" placeholder="ส่วนสูง (ซม.)">', '<button id="calc">คำนวณ</button>', '<p id="result"></p>', '<script>', '  document.querySelector("#calc").addEventListener("click", () => {', '    const w = Number(document.querySelector("#weight").value);', '    const h = Number(document.querySelector("#height").value) / 100;', '    const bmi = w / (h * h);', '    let level = "อ้วน";', '    if (bmi < 18.5) level = "ผอม";', '    else if (bmi < 23) level = "สมส่วน";', '    else if (bmi < 25) level = "ท้วม";', '    document.querySelector("#result").textContent = `BMI ${bmi.toFixed(2)} (${level})`;', '  });', '</script>'),
            tests: [
              { label: '70 กก. 175 ซม. → BMI 22.86 (สมส่วน)', check: 'await type("#weight", "70"); await type("#height", "175"); await click("#calc"); return text("#result")', expected: 'BMI 22.86 (สมส่วน)', score: 2 },
              { label: '50 กก. 170 ซม. → BMI 17.30 (ผอม)', check: 'await type("#weight", "50"); await type("#height", "170"); await click("#calc"); return text("#result")', expected: 'BMI 17.30 (ผอม)', score: 2 },
              { label: '85 กก. 170 ซม. → อ้วน', check: 'await type("#weight", "85"); await type("#height", "170"); await click("#calc"); return text("#result")', expected: 'BMI 29.41 (อ้วน)', score: 1, hidden: true }
            ] }
        ] } },
      { id: 'U3-P', order: 3, type: 'practice', title: 'แบบฝึกปฏิบัติที่ 3: แสดงรายการและค้นหา', data: {
        intro: PR_INTRO_,
        tasks: [
          { title: 'ข้อ 1 แสดงเมนูจาก Array', lang: 'html', prompt: L_('นำ Array `menu` มาแสดงใน `<ul id="menu">` รายการละ 1 `<li>` รูปแบบ `กาแฟเย็น - 45 บาท`', 'และแสดงราคารวมใน `#total` เป็น `รวม 120 บาท`'),
            starterCode: L_('<ul id="menu"></ul>', '<p id="total"></p>', '<script>', '  const menu = [', '    { name: "กาแฟเย็น", price: 45 },', '    { name: "ชาเขียว", price: 40 },', '    { name: "โกโก้", price: 35 }', '  ];', '  // เขียนต่อ', '</script>', ''),
            hints: ['menu.forEach(m => { const li = document.createElement("li"); li.textContent = `${m.name} - ${m.price} บาท`; ... })', 'const sum = menu.reduce((s, m) => s + m.price, 0);'],
            solution: L_('<ul id="menu"></ul>', '<p id="total"></p>', '<script>', '  const menu = [', '    { name: "กาแฟเย็น", price: 45 },', '    { name: "ชาเขียว", price: 40 },', '    { name: "โกโก้", price: 35 }', '  ];', '  const ul = document.querySelector("#menu");', '  menu.forEach(m => {', '    const li = document.createElement("li");', '    li.textContent = `${m.name} - ${m.price} บาท`;', '    ul.appendChild(li);', '  });', '  const sum = menu.reduce((s, m) => s + m.price, 0);', '  document.querySelector("#total").textContent = `รวม ${sum} บาท`;', '</script>'),
            tests: [
              { label: 'มี li 3 รายการ', check: 'return count("#menu li")', expected: '3', score: 1 },
              { label: 'ข้อความแต่ละรายการถูกต้อง', check: 'return texts("#menu li")', expected: 'กาแฟเย็น - 45 บาท|ชาเขียว - 40 บาท|โกโก้ - 35 บาท', score: 2 },
              { label: 'ราคารวม 120 บาท', check: 'return text("#total")', expected: 'รวม 120 บาท', score: 2 }
            ] },
          { title: 'ข้อ 2 ช่องค้นหาผลไม้', lang: 'html', prompt: L_('แสดงผลไม้ทั้งหมดใน `<ul id="list">` เมื่อพิมพ์ใน `#search` ให้แสดงเฉพาะรายการที่มีคำค้น', 'และแสดงจำนวนใน `#found` เช่น `พบ 3 รายการ`'),
            starterCode: L_('<input id="search" placeholder="ค้นหา…">', '<p id="found"></p>', '<ul id="list"></ul>', '<script>', '  const fruits = ["มะม่วง", "มะละกอ", "กล้วย", "ส้มโอ", "มะพร้าว"];', '  function render(word) {', '    // แสดงรายการที่มีคำว่า word', '  }', '  render("");', '</script>', ''),
            hints: ['const show = fruits.filter(f => f.includes(word));', 'ล้างก่อนด้วย list.innerHTML = "" แล้วเพิ่ม li ใหม่ และผูก search.addEventListener("input", …)'],
            solution: L_('<input id="search" placeholder="ค้นหา…">', '<p id="found"></p>', '<ul id="list"></ul>', '<script>', '  const fruits = ["มะม่วง", "มะละกอ", "กล้วย", "ส้มโอ", "มะพร้าว"];', '  const list = document.querySelector("#list");', '  function render(word) {', '    const show = fruits.filter(f => f.includes(word));', '    list.innerHTML = "";', '    show.forEach(f => { const li = document.createElement("li"); li.textContent = f; list.appendChild(li); });', '    document.querySelector("#found").textContent = `พบ ${show.length} รายการ`;', '  }', '  document.querySelector("#search").addEventListener("input", e => render(e.target.value.trim()));', '  render("");', '</script>'),
            tests: [
              { label: 'เริ่มต้นแสดง 5 รายการ', check: 'return count("#list li")', expected: '5', score: 1 },
              { label: 'พิมพ์ "มะ" เหลือ 3 รายการ', check: 'await type("#search", "มะ"); return count("#list li")', expected: '3', score: 2 },
              { label: 'แสดง พบ 3 รายการ', check: 'await type("#search", "มะ"); return text("#found")', expected: 'พบ 3 รายการ', score: 1 },
              { label: 'ค้นคำที่ไม่มี → พบ 0 รายการ', check: 'await type("#search", "xyz"); return text("#found") + count("#list li")', expected: 'พบ 0 รายการ0', score: 1, hidden: true }
            ] }
        ] } },
      { id: 'U3-Q', order: 4, type: 'quiz', title: 'แบบทดสอบภารกิจที่ 3', data: {
        intro: QUIZ_INTRO_, timeLimitMin: 10, maxAttempts: 2, shuffle: true,
        questions: [
          { id: 'q1', type: 'output', text: 'ผลลัพธ์ใน Console คืออะไร', code: 'let a = 5;\nlet b = "5";\nconsole.log(a + b);', answer: '55', score: 1, explain: 'ตัวเลข + ข้อความ = ต่อข้อความกัน' },
          { id: 'q2', type: 'output', text: 'ผลลัพธ์ใน Console คืออะไร', code: 'const nums = [1, 2, 3, 4];\nconst total = nums.filter(n => n % 2 === 0).reduce((s, n) => s + n, 0);\nconsole.log(total);', answer: '6', score: 1, explain: 'เลขคู่คือ 2 และ 4 รวมได้ 6' },
          { id: 'q3', type: 'mc', text: 'คำสั่งใดเลือก element ที่มี `id="title"` ได้ถูกต้อง', choices: ['document.querySelector(".title")', 'document.getElementById("title")', 'document.getElement("#title")', 'document.id("title")'], answer: 1, score: 1, explain: 'หรือใช้ document.querySelector("#title")' },
          { id: 'q4', type: 'tf', text: 'ตัวแปรที่ประกาศด้วย `const` กำหนดค่าใหม่ด้วยเครื่องหมาย `=` ได้', answer: false, score: 1, explain: 'ต้องใช้ let ถ้าจะเปลี่ยนค่า' },
          { id: 'q5', type: 'output', text: 'ผลลัพธ์ใน Console คืออะไร', code: 'const p = { name: "ฟ้า", age: 17 };\nconsole.log(`${p.name} อายุ ${p.age + 1}`);', answer: 'ฟ้า อายุ 18', score: 1, explain: 'template literal แทนค่าใน ${ }' },
          { id: 'q6', type: 'fill', text: 'เมธอดที่ใช้ผูกฟังก์ชันกับเหตุการณ์ เช่น `btn.____("click", fn)`', answer: ['addEventListener'], score: 1, explain: 'addEventListener' }
        ] } }
    ]
  };
}

/* ======================= ภารกิจที่ 4 ======================= */
function unit4_() {
  return {
    id: 'U4', order: 4, icon: '🧩', title: 'หลักการออกแบบเว็บแอปด้วยเฟรมเวิร์ก (Vue 3)',
    mission: 'เข้าใจหลักการออกแบบเว็บแอปด้วยเฟรมเวิร์ก และสร้างระบบเรียกคิวด้วย Vue 3',
    summary: 'ทำไมต้องใช้เฟรมเวิร์ก • SPA • MVVM • Component • Reactive • Vue: createApp, {{ }}, @click, :class',
    activities: [
      { id: 'U4-K', order: 1, type: 'knowledge', title: 'ใบความรู้ที่ 4: หลักการออกแบบเว็บแอปด้วยเฟรมเวิร์ก', data: { content: L_(
        '# ทำไมต้องใช้เฟรมเวิร์ก',
        'ภารกิจที่ 3 เราต้องสั่ง DOM เองทุกครั้งที่ข้อมูลเปลี่ยน (Imperative) เมื่อแอปใหญ่ขึ้นโค้ดจะยุ่งมาก **เฟรมเวิร์ก** ช่วยให้เราแค่ *ประกาศ* ว่าหน้าจอหน้าตาเป็นอย่างไรตามข้อมูล (Declarative) แล้วเฟรมเวิร์กอัปเดตให้เอง',
        '',
        '## เฟรมเวิร์กที่ได้รับความนิยมในปัจจุบัน',
        '| เฟรมเวิร์ก | ผู้พัฒนา | จุดเด่น |',
        '|---|---|---|',
        '| **React** | Meta | ใช้มากที่สุดในโลก เขียนด้วย JSX ระบบนิเวศใหญ่ (Next.js) |',
        '| **Vue** | ชุมชน (Evan You) | เรียนง่าย ใช้ผ่าน CDN ได้ทันที เหมาะกับผู้เริ่มต้น (Nuxt) |',
        '| **Angular** | Google | ครบชุด ใช้ TypeScript เหมาะองค์กรใหญ่ |',
        '| **Svelte** | ชุมชน | คอมไพล์เป็น JS ล้วน เร็วและเล็ก (SvelteKit) |',
        '',
        'หลักการของทุกตัวคล้ายกัน รายวิชานี้ใช้ **Vue 3** เพราะเริ่มได้ด้วยไฟล์ HTML ไฟล์เดียว',
        '',
        '## หลักการออกแบบเว็บแอปด้วยเฟรมเวิร์ก',
        '1. **Component-based** แบ่งหน้าจอเป็นชิ้นส่วนย่อยที่นำกลับมาใช้ซ้ำได้ เช่น การ์ดสินค้า ปุ่ม แถบเมนู',
        '2. **Reactive Data Binding** ผูกข้อมูลกับหน้าจอ ข้อมูลเปลี่ยน → หน้าจอเปลี่ยนเอง',
        '3. **MVVM** แยก *Model* (ข้อมูล) *View* (หน้าจอ) และ *ViewModel* (ตัวกลางที่ Vue จัดการ)',
        '4. **SPA (Single Page Application)** โหลดหน้าเดียว แล้วสลับเนื้อหาด้วย JavaScript เร็วเหมือนแอปมือถือ',
        '5. **Separation of Concerns** แยกส่วนแสดงผล ตรรกะ และข้อมูล/การเรียก API ออกจากกัน',
        '6. **ออกแบบทุกสถานะของหน้าจอ** กำลังโหลด / ไม่มีข้อมูล / ผิดพลาด / สำเร็จ',
        '',
        '## ขั้นตอนออกแบบเว็บแอป',
        '| ขั้น | สิ่งที่ทำ | ตัวอย่าง (ระบบเรียกคิว) |',
        '|---|---|---|',
        '| 1. ความต้องการ | ใครใช้ ทำอะไรได้ | พนักงานกดเรียกคิวถัดไป ลูกค้าดูเลขคิว |',
        '| 2. Wireframe | ร่างหน้าจอ (มือถือก่อน) | เลขคิวใหญ่กลางจอ + ปุ่มเรียก |',
        '| 3. Component | แบ่งชิ้นส่วน | QueueDisplay, CallButton, History |',
        '| 4. Data Model | ข้อมูลที่ต้องเก็บ | current, waiting, history[] |',
        '| 5. API/ฐานข้อมูล | ที่เก็บข้อมูลถาวร | /api/queues (ภารกิจ 8–9) |',
        '',
        '## Vue 3 เบื้องต้น',
        'ใส่ `<script src>` ของ Vue แล้วสร้างแอปด้วย `Vue.createApp({ … }).mount("#app")`',
        '',
        '```html',
        '<div id="app">',
        '  <h1>{{ title }}</h1>',
        '  <p>คลิกแล้ว {{ count }} ครั้ง</p>',
        '  <button @click="count++">➕ เพิ่ม</button>',
        '  <button @click="reset">↺ รีเซ็ต</button>',
        '</div>',
        VUE_TAG_,
        '<script>',
        '  Vue.createApp({',
        '    data() {',
        '      return { title: "Vue นับเลข", count: 0 };   // ข้อมูล (Model)',
        '    },',
        '    methods: {',
        '      reset() { this.count = 0; }                // ฟังก์ชันของแอป',
        '    }',
        '  }).mount("#app");',
        '</script>',
        '```',
        '',
        '| ไวยากรณ์ | ความหมาย |',
        '|---|---|',
        '| `{{ ค่า }}` | แสดงข้อมูล (interpolation) |',
        '| `@click="..."` | ผูกเหตุการณ์ (ย่อจาก `v-on:click`) |',
        '| `:class="{ on: isOn }"` | ผูกค่า attribute (ย่อจาก `v-bind`) |',
        '| `:disabled="waiting === 0"` | ปิดปุ่มตามเงื่อนไข |',
        '| `this.ชื่อ` | อ้างถึงข้อมูลใน methods |',
        '',
        '```html',
        '<style>',
        '  #app { font-family: sans-serif; }',
        '  button { padding: 10px 16px; border-radius: 12px; border: 1px solid #cbd5e1; background: white; font-size: 16px; }',
        '  button.on { background: #ec4899; color: white; border-color: #ec4899; }',
        '</style>',
        '<div id="app">',
        '  <button :class="{ on: liked }" @click="liked = !liked">{{ liked ? "❤️ ถูกใจแล้ว" : "🤍 ถูกใจ" }}</button>',
        '  <p>ขนาดตัวอักษร: <input type="range" min="12" max="40" v-model.number="size"> {{ size }}px</p>',
        '  <p :style="{ fontSize: size + \'px\' }">ข้อความนี้ผูกกับข้อมูล size</p>',
        '</div>',
        VUE_TAG_,
        '<script>',
        '  Vue.createApp({ data() { return { liked: false, size: 18 }; } }).mount("#app");',
        '</script>',
        '```',
        '',
        '## ตัวอย่าง: ระบบเรียกคิว',
        '```html',
        '<style>',
        '  #app { font-family: sans-serif; text-align: center; padding: 20px; }',
        '  .num { font-size: 64px; font-weight: bold; color: #4f46e5; }',
        '  .busy { color: #dc2626; }',
        '  button { font-size: 18px; padding: 12px 24px; border-radius: 12px; border: 0; background: #4f46e5; color: white; }',
        '  button:disabled { background: #cbd5e1; }',
        '</style>',
        '<div id="app">',
        '  <p>หมายเลขที่เรียก</p>',
        '  <div class="num">{{ code }}</div>',
        '  <p :class="{ busy: waiting > 3 }">รอ {{ waiting }} คิว</p>',
        '  <button @click="next" :disabled="waiting === 0">📢 เรียกคิวถัดไป</button>',
        '</div>',
        VUE_TAG_,
        '<script>',
        '  Vue.createApp({',
        '    data() { return { number: 1, waiting: 5 }; },',
        '    computed: {',
        '      code() { return "A" + String(this.number).padStart(3, "0"); }',
        '    },',
        '    methods: {',
        '      next() { if (this.waiting > 0) { this.number++; this.waiting--; } }',
        '    }',
        '  }).mount("#app");',
        '</script>',
        '```',
        '',
        '> 💡 สังเกตว่าเราไม่ได้เขียน `textContent` เลย แค่เปลี่ยนข้อมูล `number` และ `waiting` หน้าจอเปลี่ยนเอง นี่คือ **Reactive**'
      ) } },
      { id: 'U4-W', order: 2, type: 'worksheet', title: 'ใบงานที่ 4: Hello Vue และระบบเรียกคิว', data: {
        intro: WS_INTRO_, maxAttempts: 3,
        tasks: [
          { title: 'ข้อ 1 Hello Vue', lang: 'html', prompt: L_('สร้างแอป Vue ที่มีข้อมูล `name: "นักพัฒนาเว็บ"` และ `year: 2569`', '- `<h1>` แสดง `สวัสดี นักพัฒนาเว็บ`', '- `<p id="year">` แสดง `2569`'),
            starterCode: L_('<div id="app">', '  <h1>สวัสดี {{ name }}</h1>', '  <p id="year">{{ year }}</p>', '</div>', VUE_TAG_, '<script>', '  Vue.createApp({', '    data() {', '      return { };', '    }', '  }).mount("#app");', '</script>', ''),
            hints: ['ข้อมูลอยู่ใน return { … } ของ data()', 'return { name: "นักพัฒนาเว็บ", year: 2569 };'],
            solution: L_('<div id="app">', '  <h1>สวัสดี {{ name }}</h1>', '  <p id="year">{{ year }}</p>', '</div>', VUE_TAG_, '<script>', '  Vue.createApp({', '    data() {', '      return { name: "นักพัฒนาเว็บ", year: 2569 };', '    }', '  }).mount("#app");', '</script>'),
            tests: [
              { label: 'โหลด Vue สำเร็จ', check: 'return typeof Vue !== "undefined" && !!document.querySelector("#app").__vue_app__', expected: 'true', score: 1 },
              { label: 'h1 แสดง สวัสดี นักพัฒนาเว็บ', check: 'return text("h1")', expected: 'สวัสดี นักพัฒนาเว็บ', score: 2 },
              { label: '#year แสดง 2569', check: 'return text("#year")', expected: '2569', score: 2 }
            ] },
          { title: 'ข้อ 2 ระบบเรียกคิว', lang: 'html', prompt: L_('เริ่มที่คิว `A001` มีคนรอ 5 คิว', '- `#current` แสดงเลขคิวรูปแบบ `A` + เลข 3 หลัก (`padStart(3, "0")`)', '- `#waiting` แสดง `รอ 5 คิว`', '- กด `#next` → เลขคิวเพิ่ม 1 คนรอลด 1', '- เมื่อไม่มีคนรอ ปุ่ม `#next` ต้องกดไม่ได้ (`:disabled`)'),
            starterCode: L_('<div id="app">', '  <h2 id="current">{{ number }}</h2>', '  <p id="waiting">รอ {{ waiting }} คิว</p>', '  <button id="next">เรียกคิวถัดไป</button>', '</div>', VUE_TAG_, '<script>', '  Vue.createApp({', '    data() { return { number: 1, waiting: 5 }; },', '    methods: {', '      next() {', '        // เขียนต่อ', '      }', '    }', '  }).mount("#app");', '</script>', ''),
            hints: ['ปุ่ม: <button id="next" @click="next" :disabled="waiting === 0">', 'แสดงเลขคิว: {{ "A" + String(number).padStart(3, "0") }}'],
            solution: L_('<div id="app">', '  <h2 id="current">{{ "A" + String(number).padStart(3, "0") }}</h2>', '  <p id="waiting">รอ {{ waiting }} คิว</p>', '  <button id="next" @click="next" :disabled="waiting === 0">เรียกคิวถัดไป</button>', '</div>', VUE_TAG_, '<script>', '  Vue.createApp({', '    data() { return { number: 1, waiting: 5 }; },', '    methods: {', '      next() {', '        if (this.waiting > 0) { this.number++; this.waiting--; }', '      }', '    }', '  }).mount("#app");', '</script>'),
            tests: [
              { label: 'เริ่มต้นแสดง A001', check: 'return text("#current")', expected: 'A001', score: 1 },
              { label: 'กด 2 ครั้ง → A003 รอ 3 คิว', check: 'await click("#next"); await click("#next"); return text("#current") + "|" + text("#waiting")', expected: 'A003|รอ 3 คิว', score: 2 },
              { label: 'กด 6 ครั้ง → หยุดที่ A006 รอ 0 คิว และปุ่มกดไม่ได้', check: 'for (let i = 0; i < 6; i++) await click("#next"); return text("#current") + "|" + text("#waiting") + "|" + $("#next").disabled', expected: 'A006|รอ 0 คิว|true', score: 2, hidden: true }
            ] }
        ] } },
      { id: 'U4-P', order: 3, type: 'practice', title: 'แบบฝึกปฏิบัติที่ 4: ธีมมืด และป้ายคะแนน', data: {
        intro: PR_INTRO_,
        tasks: [
          { title: 'ข้อ 1 สลับธีมมืด/สว่าง', lang: 'html', prompt: L_('ใช้ข้อมูล `dark` (เริ่ม `false`)', '- `#box` มี class `dark` เมื่อ `dark` เป็นจริง (`:class`)', '- ปุ่ม `#toggle` สลับค่า และแสดง `🌙 โหมดมืด` เมื่อยังสว่าง / `☀️ โหมดสว่าง` เมื่อมืด'),
            starterCode: L_('<style>', '  #box { padding: 20px; border-radius: 12px; background: #f8fafc; }', '  #box.dark { background: #0f172a; color: white; }', '</style>', '<div id="app">', '  <div id="box">', '    <p>ทดลองเปลี่ยนธีม</p>', '    <button id="toggle">🌙 โหมดมืด</button>', '  </div>', '</div>', VUE_TAG_, '<script>', '  Vue.createApp({', '    data() { return { dark: false }; }', '  }).mount("#app");', '</script>', ''),
            hints: ['<div id="box" :class="{ dark: dark }">', '<button id="toggle" @click="dark = !dark">{{ dark ? "☀️ โหมดสว่าง" : "🌙 โหมดมืด" }}</button>'],
            solution: L_('<style>', '  #box { padding: 20px; border-radius: 12px; background: #f8fafc; }', '  #box.dark { background: #0f172a; color: white; }', '</style>', '<div id="app">', '  <div id="box" :class="{ dark: dark }">', '    <p>ทดลองเปลี่ยนธีม</p>', '    <button id="toggle" @click="dark = !dark">{{ dark ? "☀️ โหมดสว่าง" : "🌙 โหมดมืด" }}</button>', '  </div>', '</div>', VUE_TAG_, '<script>', '  Vue.createApp({', '    data() { return { dark: false }; }', '  }).mount("#app");', '</script>'),
            tests: [
              { label: 'เริ่มต้นเป็นธีมสว่าง', check: 'return $("#box").classList.contains("dark") + "|" + text("#toggle")', expected: 'false|🌙 โหมดมืด', score: 1 },
              { label: 'กด 1 ครั้ง → มืด', check: 'await click("#toggle"); return $("#box").classList.contains("dark") + "|" + text("#toggle")', expected: 'true|☀️ โหมดสว่าง', score: 2 },
              { label: 'กด 2 ครั้ง → กลับมาสว่าง', check: 'await click("#toggle"); await click("#toggle"); return $("#box").classList.contains("dark")', expected: 'false', score: 2, hidden: true }
            ] },
          { title: 'ข้อ 2 ป้ายคะแนนการแข่งขัน', lang: 'html', prompt: L_('ทีม A และ B เริ่มที่ 0 คะแนน', '- ปุ่ม `#a1` `#a3` เพิ่มคะแนนทีม A 1 และ 3 แต้ม / `#b1` `#b3` ของทีม B', '- `#scoreA` `#scoreB` แสดงคะแนน', '- `#leader` แสดง `ทีม A นำ` / `ทีม B นำ` / `เสมอ` (เขียนเป็น method `leader()`)', '- `#reset` ล้างคะแนน'),
            starterCode: L_('<div id="app">', '  <h2><span id="scoreA">{{ a }}</span> : <span id="scoreB">{{ b }}</span></h2>', '  <p id="leader"></p>', '  <button id="a1">A +1</button> <button id="a3">A +3</button>', '  <button id="b1">B +1</button> <button id="b3">B +3</button>', '  <button id="reset">รีเซ็ต</button>', '</div>', VUE_TAG_, '<script>', '  Vue.createApp({', '    data() { return { a: 0, b: 0 }; },', '    methods: {', '      leader() { return ""; }', '    }', '  }).mount("#app");', '</script>', ''),
            hints: ['<button id="a1" @click="a += 1">', '<p id="leader">{{ leader() }}</p> และ leader() { if (this.a > this.b) return "ทีม A นำ"; … }'],
            solution: L_('<div id="app">', '  <h2><span id="scoreA">{{ a }}</span> : <span id="scoreB">{{ b }}</span></h2>', '  <p id="leader">{{ leader() }}</p>', '  <button id="a1" @click="a += 1">A +1</button> <button id="a3" @click="a += 3">A +3</button>', '  <button id="b1" @click="b += 1">B +1</button> <button id="b3" @click="b += 3">B +3</button>', '  <button id="reset" @click="a = 0; b = 0">รีเซ็ต</button>', '</div>', VUE_TAG_, '<script>', '  Vue.createApp({', '    data() { return { a: 0, b: 0 }; },', '    methods: {', '      leader() {', '        if (this.a > this.b) return "ทีม A นำ";', '        if (this.b > this.a) return "ทีม B นำ";', '        return "เสมอ";', '      }', '    }', '  }).mount("#app");', '</script>'),
            tests: [
              { label: 'เริ่มต้น เสมอ', check: 'return text("#leader")', expected: 'เสมอ', score: 1 },
              { label: 'A+3, B+1 → 3|1|ทีม A นำ', check: 'await click("#a3"); await click("#b1"); return text("#scoreA") + "|" + text("#scoreB") + "|" + text("#leader")', expected: '3|1|ทีม A นำ', score: 2 },
              { label: 'B+3 สองครั้ง → ทีม B นำ', check: 'await click("#b3"); await click("#b3"); await click("#a1"); return text("#leader")', expected: 'ทีม B นำ', score: 1 },
              { label: 'รีเซ็ตแล้วกลับเป็น 0|0|เสมอ', check: 'await click("#a3"); await click("#reset"); return text("#scoreA") + "|" + text("#scoreB") + "|" + text("#leader")', expected: '0|0|เสมอ', score: 1, hidden: true }
            ] }
        ] } },
      { id: 'U4-Q', order: 4, type: 'quiz', title: 'แบบทดสอบภารกิจที่ 4', data: {
        intro: QUIZ_INTRO_, timeLimitMin: 10, maxAttempts: 2, shuffle: true,
        questions: [
          { id: 'q1', type: 'mc', text: '**SPA** ต่างจากเว็บแบบหลายหน้า (MPA) อย่างไร', choices: ['โหลดหน้าเดียว แล้วเปลี่ยนเนื้อหาด้วย JavaScript โดยไม่โหลดหน้าใหม่ทั้งหมด', 'ใช้ได้เฉพาะบนมือถือ', 'ไม่ต้องใช้ HTML', 'ต้องมีหน้าเว็บเพียงหน้าเดียวบนเซิร์ฟเวอร์และห้ามมีลิงก์'], answer: 0, score: 1, explain: 'Single Page Application' },
          { id: 'q2', type: 'mc', text: 'ข้อใด **ไม่ใช่** เฟรมเวิร์ก/ไลบรารี JavaScript สำหรับสร้าง UI', choices: ['React', 'Vue', 'Angular', 'Bootstrap'], answer: 3, score: 1, explain: 'Bootstrap เป็นสไตล์ชีตเฟรมเวิร์ก (CSS)' },
          { id: 'q3', type: 'tf', text: '**Reactive** หมายถึง เมื่อข้อมูลเปลี่ยน หน้าจอที่ผูกกับข้อมูลนั้นจะอัปเดตเอง', answer: true, score: 1, explain: 'หัวใจของเฟรมเวิร์กสมัยใหม่' },
          { id: 'q4', type: 'output', text: 'ผลลัพธ์ใน Console คืออะไร (การสร้างรหัสคิว)', code: 'const n = 7;\nconsole.log("A" + String(n).padStart(3, "0"));', answer: 'A007', score: 1, explain: 'padStart เติม 0 ด้านหน้าให้ครบ 3 หลัก' },
          { id: 'q5', type: 'fill', text: 'ใน Vue ผูกเหตุการณ์คลิกด้วย `@____="..."`', answer: ['click'], score: 1, explain: '@click ย่อจาก v-on:click' },
          { id: 'q6', type: 'mc', text: 'แนวคิด **Component-based** ช่วยอะไร', choices: ['แบ่ง UI เป็นชิ้นเล็กที่นำกลับมาใช้ซ้ำได้', 'ทำให้ไม่ต้องใช้ฐานข้อมูล', 'ทำให้เว็บไม่ต้องมี CSS', 'ช่วยจดทะเบียนโดเมน'], answer: 0, score: 1, explain: 'เช่น การ์ดสินค้า 1 คอมโพเนนต์ใช้ซ้ำได้หลายสินค้า' }
        ] } }
    ]
  };
}

/* ======================= ภารกิจที่ 5 ======================= */
function unit5_() {
  return {
    id: 'U5', order: 5, icon: '✅', title: 'Vue Directives และ Computed: แอป To-do',
    mission: 'ใช้ v-model, v-if, v-for, computed และ watch สร้างแอปจดงานที่บันทึกข้อมูลได้',
    summary: 'v-model • v-if / v-show • v-for + :key • :class • computed • watch + localStorage',
    activities: [
      { id: 'U5-K', order: 1, type: 'knowledge', title: 'ใบความรู้ที่ 5: Directives, Computed และ Watch', data: { content: L_(
        '# Directives: คำสั่งพิเศษในเทมเพลตของ Vue',
        '| Directive | ใช้ทำ | ตัวอย่าง |',
        '|---|---|---|',
        '| `v-model` | ผูกค่าช่องกรอกแบบ 2 ทาง | `<input v-model="name">` |',
        '| `v-if` / `v-else` | แสดงเมื่อเงื่อนไขจริง (ไม่จริง = ไม่สร้าง element) | `<p v-if="ok">` |',
        '| `v-show` | ซ่อนด้วย CSS `display:none` | `<p v-show="open">` |',
        '| `v-for` | วนสร้างรายการ ต้องมี `:key` | `<li v-for="t in todos" :key="t.id">` |',
        '| `:class` | ใส่ class ตามเงื่อนไข | `:class="{ done: t.done }"` |',
        '| `@submit.prevent` | ส่งฟอร์มโดยไม่โหลดหน้าใหม่ | `<form @submit.prevent="add">` |',
        '',
        '## v-model และ v-if',
        '```html',
        '<div id="app">',
        '  <input v-model="name" placeholder="พิมพ์ชื่อ">',
        '  <select v-model="lang"><option value="th">ไทย</option><option value="en">English</option></select>',
        '  <p v-if="name === \'\'">กรุณากรอกชื่อ</p>',
        '  <p v-else-if="lang === \'th\'">สวัสดี {{ name }} 🙏</p>',
        '  <p v-else>Hello {{ name }} 👋</p>',
        '</div>',
        VUE_TAG_,
        '<script>',
        '  Vue.createApp({ data() { return { name: "", lang: "th" }; } }).mount("#app");',
        '</script>',
        '```',
        '',
        '## v-for: วนแสดงรายการ',
        '```html',
        '<div id="app">',
        '  <ul>',
        '    <li v-for="(p, i) in products" :key="p.id" :class="{ out: p.stock === 0 }">',
        '      {{ i + 1 }}. {{ p.icon }} {{ p.name }} - {{ p.price }} บาท',
        '      <b v-if="p.stock === 0">(หมด)</b>',
        '    </li>',
        '  </ul>',
        '</div>',
        '<style>.out { color: #94a3b8; text-decoration: line-through; }</style>',
        VUE_TAG_,
        '<script>',
        '  Vue.createApp({ data() { return { products: [',
        '    { id: 1, icon: "☕", name: "กาแฟเย็น", price: 45, stock: 12 },',
        '    { id: 2, icon: "🍰", name: "เค้กช็อกโกแลต", price: 65, stock: 0 },',
        '    { id: 3, icon: "🥐", name: "ครัวซองต์", price: 35, stock: 5 }',
        '  ] }; } }).mount("#app");',
        '</script>',
        '```',
        '',
        '## computed: ค่าที่คำนวณจากข้อมูลอื่น',
        '`computed` คำนวณใหม่เมื่อข้อมูลที่ใช้เปลี่ยนเท่านั้น และจำค่าไว้ (cache) เหมาะกับยอดรวม ตัวกรอง จำนวนที่เหลือ',
        '',
        '## watch + localStorage: บันทึกข้อมูลไว้ในเครื่อง',
        '`localStorage` เก็บข้อความถาวรในเบราว์เซอร์ ใช้ `JSON.stringify` ตอนบันทึก และ `JSON.parse` ตอนอ่าน ลองเพิ่มงาน แล้วกด ▶ รัน ใหม่ ข้อมูลยังอยู่ (ปุ่ม 🗄 ล้างข้อมูล)',
        '',
        '```html',
        '<style>',
        '  #app { font-family: sans-serif; max-width: 420px; }',
        '  .done span { text-decoration: line-through; color: #94a3b8; }',
        '  form { display: flex; gap: 6px; } input[type=text] { flex: 1; padding: 8px; }',
        '</style>',
        '<div id="app">',
        '  <h2>📝 งานของฉัน</h2>',
        '  <form @submit.prevent="add"><input type="text" v-model="text" placeholder="เพิ่มงาน…"><button>เพิ่ม</button></form>',
        '  <p>เหลือ {{ left }} งาน จาก {{ todos.length }}</p>',
        '  <ul>',
        '    <li v-for="t in todos" :key="t.id" :class="{ done: t.done }">',
        '      <input type="checkbox" v-model="t.done"> <span>{{ t.text }}</span>',
        '      <button @click="remove(t.id)">🗑</button>',
        '    </li>',
        '  </ul>',
        '  <p v-if="todos.length === 0">ยังไม่มีงาน 🎉</p>',
        '</div>',
        VUE_TAG_,
        '<script>',
        '  Vue.createApp({',
        '    data() { return { text: "", todos: JSON.parse(localStorage.getItem("todos") || "[]") }; },',
        '    computed: { left() { return this.todos.filter(t => !t.done).length; } },',
        '    watch: { todos: { deep: true, handler(v) { localStorage.setItem("todos", JSON.stringify(v)); } } },',
        '    methods: {',
        '      add() {',
        '        if (!this.text.trim()) return;',
        '        this.todos.push({ id: Date.now(), text: this.text.trim(), done: false });',
        '        this.text = "";',
        '      },',
        '      remove(id) { this.todos = this.todos.filter(t => t.id !== id); }',
        '    }',
        '  }).mount("#app");',
        '</script>',
        '```'
      ) } },
      { id: 'U5-W', order: 2, type: 'worksheet', title: 'ใบงานที่ 5: ฟอร์มทักทายและ To-do List', data: {
        intro: WS_INTRO_, maxAttempts: 3,
        tasks: [
          { title: 'ข้อ 1 ฟอร์มทักทาย 2 ภาษา', lang: 'html', prompt: L_('ใช้ `v-model` ผูก `#name` และ `#lang` (ค่า `th` / `en`) แล้วแสดงใน `#greet`', '- ยังไม่กรอกชื่อ → `กรุณากรอกชื่อ`', '- ภาษาไทย → `สวัสดี ชื่อ`', '- ภาษาอังกฤษ → `Hello ชื่อ`'),
            starterCode: L_('<div id="app">', '  <input id="name" placeholder="ชื่อ">', '  <select id="lang"><option value="th">ไทย</option><option value="en">English</option></select>', '  <p id="greet"></p>', '</div>', VUE_TAG_, '<script>', '  Vue.createApp({ data() { return { name: "", lang: "th" }; } }).mount("#app");', '</script>', ''),
            hints: ['<input id="name" v-model="name"> และ <select id="lang" v-model="lang">', '<p id="greet">{{ name === "" ? "กรุณากรอกชื่อ" : (lang === "th" ? "สวัสดี " : "Hello ") + name }}</p>'],
            solution: L_('<div id="app">', '  <input id="name" v-model.trim="name" placeholder="ชื่อ">', '  <select id="lang" v-model="lang"><option value="th">ไทย</option><option value="en">English</option></select>', '  <p id="greet" v-if="name === \'\'">กรุณากรอกชื่อ</p>', '  <p id="greet" v-else>{{ lang === "th" ? "สวัสดี" : "Hello" }} {{ name }}</p>', '</div>', VUE_TAG_, '<script>', '  Vue.createApp({ data() { return { name: "", lang: "th" }; } }).mount("#app");', '</script>'),
            tests: [
              { label: 'ยังไม่กรอก → กรุณากรอกชื่อ', check: 'return text("#greet")', expected: 'กรุณากรอกชื่อ', score: 1 },
              { label: 'พิมพ์ ต้น → สวัสดี ต้น', check: 'await type("#name", "ต้น"); return text("#greet")', expected: 'สวัสดี ต้น', score: 2 },
              { label: 'เลือก English → Hello ต้น', check: 'await type("#name", "ต้น"); await type("#lang", "en"); return text("#greet")', expected: 'Hello ต้น', score: 2 }
            ] },
          { title: 'ข้อ 2 To-do List', lang: 'html', prompt: L_('สร้างแอปจดงาน', '- พิมพ์ใน `#task` กด `#add` เพิ่มงานลง `<ul id="list">` (ไม่เพิ่มถ้าว่าง หรือมีแต่ช่องว่าง)', '- แต่ละ `<li>` มี checkbox ติ๊กแล้ว `<li>` มี class `done`', '- `#left` แสดง `เหลือ N งาน` (ใช้ `computed`)'),
            starterCode: L_('<div id="app">', '  <input id="task" v-model="text"> <button id="add">เพิ่ม</button>', '  <p id="left"></p>', '  <ul id="list">', '  </ul>', '</div>', VUE_TAG_, '<script>', '  Vue.createApp({', '    data() { return { text: "", todos: [] }; },', '    methods: {', '      add() {', '        // เขียนต่อ', '      }', '    }', '  }).mount("#app");', '</script>', ''),
            hints: ['<li v-for="t in todos" :key="t.id" :class="{ done: t.done }"><input type="checkbox" v-model="t.done"> {{ t.text }}</li>', 'computed: { left() { return this.todos.filter(t => !t.done).length; } } และ add(): if (!this.text.trim()) return;'],
            solution: L_('<div id="app">', '  <input id="task" v-model="text"> <button id="add" @click="add">เพิ่ม</button>', '  <p id="left">เหลือ {{ left }} งาน</p>', '  <ul id="list">', '    <li v-for="t in todos" :key="t.id" :class="{ done: t.done }"><input type="checkbox" v-model="t.done"> {{ t.text }}</li>', '  </ul>', '</div>', VUE_TAG_, '<script>', '  Vue.createApp({', '    data() { return { text: "", todos: [] }; },', '    computed: { left() { return this.todos.filter(t => !t.done).length; } },', '    methods: {', '      add() {', '        if (!this.text.trim()) return;', '        this.todos.push({ id: this.todos.length + 1, text: this.text.trim(), done: false });', '        this.text = "";', '      }', '    }', '  }).mount("#app");', '</script>'),
            tests: [
              { label: 'เพิ่ม 2 งาน → มี 2 รายการ เหลือ 2 งาน', check: 'await type("#task", "อ่านหนังสือ"); await click("#add"); await type("#task", "ทำการบ้าน"); await click("#add"); return count("#list li") + "|" + text("#left")', expected: '2|เหลือ 2 งาน', score: 2 },
              { label: 'ไม่เพิ่มงานว่าง', check: 'await type("#task", "   "); await click("#add"); return count("#list li")', expected: '0', score: 1 },
              { label: 'ติ๊กงานแรก → li.done 1 รายการ เหลือ 1 งาน', check: 'await type("#task", "ก"); await click("#add"); await type("#task", "ข"); await click("#add"); await click("#list li input[type=checkbox]"); return count("#list li.done") + "|" + text("#left")', expected: '1|เหลือ 1 งาน', score: 2, hidden: true }
            ] }
        ] } },
      { id: 'U5-P', order: 3, type: 'practice', title: 'แบบฝึกปฏิบัติที่ 5: ตัวกรองสินค้า และ To-do บันทึกถาวร', data: {
        intro: PR_INTRO_,
        tasks: [
          { title: 'ข้อ 1 ตัวกรองสินค้าด้วย computed', lang: 'html', prompt: L_('แสดงสินค้าเป็น `.item` ตามตัวกรอง', '- `#q` ค้นหาจากชื่อสินค้า', '- `#cat` เลือกหมวด (`ทั้งหมด` / `เครื่องดื่ม` / `เบเกอรี่`)', '- `#count` แสดง `แสดง N จาก 5 รายการ`', 'เขียนตัวกรองเป็น `computed` ชื่อ `shown`'),
            starterCode: L_('<div id="app">', '  <input id="q" v-model="q" placeholder="ค้นหา">', '  <select id="cat" v-model="cat"><option>ทั้งหมด</option><option>เครื่องดื่ม</option><option>เบเกอรี่</option></select>', '  <p id="count"></p>', '  <div class="item" v-for="p in products" :key="p.id">{{ p.name }}</div>', '</div>', VUE_TAG_, '<script>', '  Vue.createApp({', '    data() { return { q: "", cat: "ทั้งหมด", products: [', '      { id: 1, name: "กาแฟเย็น", cat: "เครื่องดื่ม" },', '      { id: 2, name: "ชาเขียวนม", cat: "เครื่องดื่ม" },', '      { id: 3, name: "ครัวซองต์", cat: "เบเกอรี่" },', '      { id: 4, name: "เค้กช็อกโกแลต", cat: "เบเกอรี่" },', '      { id: 5, name: "น้ำส้มคั้น", cat: "เครื่องดื่ม" }', '    ] }; }', '  }).mount("#app");', '</script>', ''),
            hints: ['computed: { shown() { return this.products.filter(p => p.name.includes(this.q) && (this.cat === "ทั้งหมด" || p.cat === this.cat)); } }', 'เปลี่ยน v-for="p in shown" และ #count: แสดง {{ shown.length }} จาก {{ products.length }} รายการ'],
            solution: L_('<div id="app">', '  <input id="q" v-model="q" placeholder="ค้นหา">', '  <select id="cat" v-model="cat"><option>ทั้งหมด</option><option>เครื่องดื่ม</option><option>เบเกอรี่</option></select>', '  <p id="count">แสดง {{ shown.length }} จาก {{ products.length }} รายการ</p>', '  <div class="item" v-for="p in shown" :key="p.id">{{ p.name }}</div>', '</div>', VUE_TAG_, '<script>', '  Vue.createApp({', '    data() { return { q: "", cat: "ทั้งหมด", products: [', '      { id: 1, name: "กาแฟเย็น", cat: "เครื่องดื่ม" },', '      { id: 2, name: "ชาเขียวนม", cat: "เครื่องดื่ม" },', '      { id: 3, name: "ครัวซองต์", cat: "เบเกอรี่" },', '      { id: 4, name: "เค้กช็อกโกแลต", cat: "เบเกอรี่" },', '      { id: 5, name: "น้ำส้มคั้น", cat: "เครื่องดื่ม" }', '    ] }; },', '    computed: {', '      shown() { return this.products.filter(p => p.name.includes(this.q.trim()) && (this.cat === "ทั้งหมด" || p.cat === this.cat)); }', '    }', '  }).mount("#app");', '</script>'),
            tests: [
              { label: 'เริ่มต้น แสดง 5 จาก 5 รายการ', check: 'return text("#count")', expected: 'แสดง 5 จาก 5 รายการ', score: 1 },
              { label: 'เลือกหมวดเบเกอรี่ → 2 รายการ', check: 'await type("#cat", "เบเกอรี่"); return count(".item") + "|" + text("#count")', expected: '2|แสดง 2 จาก 5 รายการ', score: 2 },
              { label: 'ค้นหา "ชา" → 1 รายการ', check: 'await type("#q", "ชา"); return texts(".item")', expected: 'ชาเขียวนม', score: 2, hidden: true }
            ] },
          { title: 'ข้อ 2 To-do บันทึกลง localStorage', lang: 'html', prompt: L_('ทำให้รายการงานบันทึกลง `localStorage` คีย์ `todos` ทุกครั้งที่เปลี่ยน (ใช้ `watch` แบบ `deep`)', '- กด `#add` เพิ่มงาน', '- ปุ่ม `.del` ในแต่ละ `<li>` ลบงานนั้น', '- ข้อมูลที่บันทึกเป็น Array ของ `{ id, text }`'),
            starterCode: L_('<div id="app">', '  <input id="task" v-model="text"> <button id="add" @click="add">เพิ่ม</button>', '  <ul>', '    <li v-for="t in todos" :key="t.id">{{ t.text }} <button class="del">ลบ</button></li>', '  </ul>', '</div>', VUE_TAG_, '<script>', '  Vue.createApp({', '    data() { return { text: "", todos: JSON.parse(localStorage.getItem("todos") || "[]") }; },', '    methods: {', '      add() { if (this.text.trim()) { this.todos.push({ id: Date.now() + Math.random(), text: this.text.trim() }); this.text = ""; } }', '    }', '  }).mount("#app");', '</script>', ''),
            hints: ['watch: { todos: { deep: true, handler(v) { localStorage.setItem("todos", JSON.stringify(v)); } } }', '<button class="del" @click="remove(t.id)"> และ remove(id) { this.todos = this.todos.filter(t => t.id !== id); }'],
            solution: L_('<div id="app">', '  <input id="task" v-model="text"> <button id="add" @click="add">เพิ่ม</button>', '  <ul>', '    <li v-for="t in todos" :key="t.id">{{ t.text }} <button class="del" @click="remove(t.id)">ลบ</button></li>', '  </ul>', '</div>', VUE_TAG_, '<script>', '  Vue.createApp({', '    data() { return { text: "", todos: JSON.parse(localStorage.getItem("todos") || "[]") }; },', '    watch: { todos: { deep: true, handler(v) { localStorage.setItem("todos", JSON.stringify(v)); } } },', '    methods: {', '      add() { if (this.text.trim()) { this.todos.push({ id: Date.now() + Math.random(), text: this.text.trim() }); this.text = ""; } },', '      remove(id) { this.todos = this.todos.filter(t => t.id !== id); }', '    }', '  }).mount("#app");', '</script>'),
            tests: [
              { label: 'เพิ่ม 2 งาน → บันทึก 2 รายการ', check: 'await type("#task", "งานแรก"); await click("#add"); await type("#task", "งานสอง"); await click("#add"); await wait(50); return JSON.parse(store("todos") || "[]").length', expected: '2', score: 2 },
              { label: 'บันทึกข้อความงานถูกต้อง', check: 'await type("#task", "งานแรก"); await click("#add"); await wait(50); return JSON.parse(store("todos") || "[]").map(t => t.text).join(",")', expected: 'งานแรก', score: 1 },
              { label: 'ลบงาน → หน้าจอและที่บันทึกเหลือ 1', check: 'await type("#task", "ก"); await click("#add"); await type("#task", "ข"); await click("#add"); await click(".del"); await wait(50); return count("li") + "|" + JSON.parse(store("todos") || "[]").length', expected: '1|1', score: 2, hidden: true }
            ] }
        ] } },
      { id: 'U5-Q', order: 4, type: 'quiz', title: 'แบบทดสอบภารกิจที่ 5', data: {
        intro: QUIZ_INTRO_, timeLimitMin: 10, maxAttempts: 2, shuffle: true,
        questions: [
          { id: 'q1', type: 'mc', text: 'Directive ใดผูกค่าช่องกรอกกับข้อมูลแบบ 2 ทาง', choices: ['v-if', 'v-for', 'v-model', 'v-show'], answer: 2, score: 1, explain: 'v-model' },
          { id: 'q2', type: 'mc', text: 'เมื่อใช้ `v-for` ควรใส่อะไรเพื่อให้ Vue ติดตามแต่ละรายการได้ถูกต้อง', choices: [':key', ':class', '@click', 'v-model'], answer: 0, score: 1, explain: ':key ที่ไม่ซ้ำกัน เช่น id' },
          { id: 'q3', type: 'tf', text: '`computed` จะคำนวณใหม่เมื่อข้อมูลที่ใช้เปลี่ยน และจำค่าไว้ (cache)', answer: true, score: 1, explain: 'ต่างจาก methods ที่เรียกใหม่ทุกครั้ง' },
          { id: 'q4', type: 'mc', text: '`v-if` กับ `v-show` ต่างกันอย่างไร', choices: ['v-if ไม่สร้าง element เมื่อเงื่อนไขเป็นเท็จ ส่วน v-show ซ่อนด้วย display:none', 'เหมือนกันทุกอย่าง', 'v-show ใช้กับ input เท่านั้น', 'v-if ทำงานเฉพาะบนมือถือ'], answer: 0, score: 1, explain: 'v-show เหมาะกับการสลับบ่อย ๆ' },
          { id: 'q5', type: 'output', text: 'ผลลัพธ์ใน Console คืออะไร', code: 'const todos = [{ t: "a", done: true }, { t: "b", done: false }, { t: "c", done: false }];\nconsole.log(todos.filter(x => !x.done).length);', answer: '2', score: 1, explain: 'งานที่ยังไม่เสร็จคือ b และ c' },
          { id: 'q6', type: 'fill', text: 'ใช้ `:____="{ done: item.done }"` เพื่อใส่ class ตามเงื่อนไข', answer: ['class'], score: 1, explain: ':class' }
        ] } }
    ]
  };
}

/** นักศึกษาตัวอย่าง (PIN ของทุกคนคือ 1234 — ลบได้จากเมนู ล้างข้อมูลตัวอย่าง) */
function getSampleStudents_() {
  var names = [['นาย', 'ธนพล', 'ใจดี'], ['นางสาว', 'กมลชนก', 'สุขสันต์'], ['นาย', 'ณัฐวุฒิ', 'รักเรียน'], ['นางสาว', 'พิมพ์ชนก', 'มีสุข'], ['นาย', 'ภูมิพัฒน์', 'ศรีทอง'],
    ['นางสาว', 'ศิริพร', 'แก้วใส'], ['นาย', 'อนุชา', 'บุญมา'], ['นางสาว', 'ปวีณา', 'ทองดี'], ['นาย', 'กิตติพัฒน์', 'วงศ์ใหญ่'], ['นางสาว', 'วรรณิศา', 'เพชรงาม']];
  return names.map(function (n, i) {
    return { studentCode: '6920100' + ('0' + (i + 1)).slice(-2), prefix: n[0], firstName: n[1], lastName: n[2], room: i < 5 ? 'ปวส.1/1' : 'ปวส.1/2' };
  });
}
