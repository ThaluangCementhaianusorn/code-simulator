/**
 * Setup.gs — ติดตั้งระบบ เมนูใน Google Sheet และข้อมูลตัวอย่าง
 * ใช้กฎ "สำเนาแล้วใช้ได้ทันที": ไม่ฝัง ID ใด ๆ ในโค้ด, setup() รันซ้ำได้โดยไม่สร้างของซ้ำ
 */
// SETTINGS_HELP อยู่ใน Core.gs (ใช้ร่วมกับหน้าตั้งค่าบนเว็บ)

function onOpen() {
  SpreadsheetApp.getUi().createMenu('⚙️ ตั้งค่าระบบ')
    .addItem('1) ติดตั้งระบบ', 'setup')
    .addItem('2) ตั้งรหัสผ่านครู', 'setTeacherPassword')
    .addItem('3) ใส่เนื้อหาและนักศึกษาตัวอย่าง', 'seedSample')
    .addSeparator()
    .addItem('ล้างนักศึกษาตัวอย่าง', 'clearSample')
    .addItem('ใส่เนื้อหา 5 ภารกิจใหม่ (แทนที่ของเดิม)', 'reseedContent')
    .addSeparator()
    .addItem('เปิดลิงก์หน้าเว็บ', 'showWebUrl')
    .addItem('วิธี Deploy', 'showDeployHelp')
    .addToUi();
}

function ui_() { try { return SpreadsheetApp.getUi(); } catch (e) { return null; } }
function say_(msg) { var u = ui_(); if (u) u.alert(msg); else Logger.log(msg); }

function setup() {
  var ss = SpreadsheetApp.getActive();
  var props = PropertiesService.getScriptProperties();
  var copied = props.getProperty('ssId') && props.getProperty('ssId') !== ss.getId();
  if (copied) props.deleteAllProperties(); // เป็นสำเนา: ล้างค่าลับของต้นฉบับ
  props.setProperty('ssId', ss.getId());
  if (!props.getProperty('salt')) props.setProperty('salt', Utilities.getUuid());

  Object.keys(SCHEMA).forEach(function (name) { ensureSheet_(ss, name, SCHEMA[name]); });
  var st = ss.getSheetByName('Settings') || ss.insertSheet('Settings');
  var vals = st.getDataRange().getValues();
  if (!vals.length || vals[0][0] !== 'key') { st.clear(); st.getRange(1, 1, 1, 3).setValues([['key', 'value', 'คำอธิบาย']]); vals = [['key']]; }
  var have = {}; vals.forEach(function (r) { have[r[0]] = true; });
  st.getRange('A:B').setNumberFormat('@'); // ต้องตั้งเป็นข้อความก่อนเขียน ไม่เช่นนั้น 2-3-3 จะกลายเป็นวันที่
  Object.keys(DEFAULT_SETTINGS).forEach(function (k) { if (!have[k]) st.appendRow([k, DEFAULT_SETTINGS[k], SETTINGS_HELP[k] || '']); });
  // ซ่อมค่าหน่วยกิตที่ Google Sheet แปลงเป็นวันที่ไปแล้ว
  st.getDataRange().getValues().forEach(function (r, i) {
    if (r[0] === 'courseCredit' && (r[1] instanceof Date || !/^\d{1,2}-\d{1,2}-\d{1,2}$/.test(String(r[1])))) st.getRange(i + 1, 2).setNumberFormat('@').setValue(DEFAULT_SETTINGS.courseCredit);
  });
  st.getRange(1, 1, 1, 3).setFontWeight('bold').setBackground('#1E40AF').setFontColor('#ffffff');
  st.setFrozenRows(1); st.setColumnWidth(1, 160); st.setColumnWidth(2, 320); st.setColumnWidth(3, 420);
  writeReadme_(ss);
  var first = ss.getSheetByName('README'); if (first) { ss.setActiveSheet(first); ss.moveActiveSheet(1); }
  var sheet1 = ss.getSheetByName('Sheet1') || ss.getSheetByName('ชีต1');
  if (sheet1 && sheet1.getLastRow() === 0 && ss.getSheets().length > 1) ss.deleteSheet(sheet1);
  say_('✅ ติดตั้งเสร็จ' + (copied ? ' (ตรวจพบว่าเป็นสำเนา จึงรีเซ็ตรหัสลับแล้ว — นักศึกษาเดิมต้องออก PIN ใหม่)' : '') +
    '\n\nขั้นต่อไป:\n2) ตั้งรหัสผ่านครู\n3) ใส่เนื้อหาและนักศึกษาตัวอย่าง (ถ้าต้องการ)\nจากนั้น Deploy เป็น Web app (ดูเมนู วิธี Deploy)');
}

function ensureSheet_(ss, name, head) {
  var sh = ss.getSheetByName(name) || ss.insertSheet(name);
  var cur = sh.getLastColumn() ? sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0].map(String) : [];
  if (!cur[0]) {
    sh.getRange(1, 1, 1, head.length).setValues([head]);
  } else {
    head.forEach(function (h) { if (cur.indexOf(h) < 0) { sh.getRange(1, sh.getLastColumn() + 1).setValue(h); } });
  }
  var cols = Math.max(sh.getLastColumn(), head.length);
  sh.getRange(1, 1, sh.getMaxRows(), cols).setNumberFormat('@'); // เก็บเป็นข้อความ กันวันที่/รหัสนักศึกษาถูกแปลง
  sh.getRange(1, 1, 1, cols).setFontWeight('bold').setBackground('#E0E7FF');
  sh.setFrozenRows(1);
  return sh;
}

function setTeacherPassword() {
  var u = ui_(); if (!u) throw new Error('ใช้คำสั่งนี้จากเมนูใน Google Sheet');
  sheetStore_();
  var r = u.prompt('ตั้งรหัสผ่านครู', 'อย่างน้อย 6 ตัวอักษร ใช้เข้าหลังบ้าน /exec?page=admin', u.ButtonSet.OK_CANCEL);
  if (r.getSelectedButton() !== u.Button.OK) return;
  var pw = r.getResponseText().trim();
  if (pw.length < 6) { u.alert('รหัสผ่านสั้นเกินไป (อย่างน้อย 6 ตัวอักษร)'); return; }
  var store = sheetStore_();
  store.setSecret('teacherPassHash', store.hash(store.secret('salt') + ':teacher:' + pw));
  u.alert('✅ ตั้งรหัสผ่านครูแล้ว');
}

function seedSample() {
  var store = sheetStore_();
  var withContent = store.all('Units').length === 0;
  if (!withContent) {
    var u = ui_();
    if (u) withContent = u.alert('มีเนื้อหาอยู่แล้ว', 'ต้องการแทนที่เนื้อหาด้วยชุดตัวอย่าง 5 ภารกิจหรือไม่?\n(YES = แทนที่ / NO = ใส่เฉพาะนักศึกษาตัวอย่าง)', u.ButtonSet.YES_NO) === u.Button.YES;
  }
  var r = seedSampleData_(store, withContent);
  say_('✅ เพิ่มนักศึกษาตัวอย่าง ' + r.students + ' คน (รหัส 692010001–692010010, PIN 1234)' + (withContent ? '\nใส่เนื้อหา ' + r.units + ' ภารกิจแล้ว' : ''));
}

function reseedContent() {
  var u = ui_();
  if (u && u.alert('ยืนยัน', 'แทนที่เนื้อหาทั้งหมดด้วยชุดตัวอย่าง 5 ภารกิจ? (คะแนนเดิมของกิจกรรมที่ id ตรงกันยังอยู่)', u.ButtonSet.YES_NO) !== u.Button.YES) return;
  var store = sheetStore_();
  store.lock(function () { importCourseData_(store, getSeedCourse_()); });
  say_('✅ ใส่เนื้อหา 5 ภารกิจแล้ว');
}

function clearSample() {
  var u = ui_();
  if (u && u.alert('ยืนยัน', 'ลบนักศึกษาตัวอย่าง พร้อมคะแนนและเกียรติบัตรของนักศึกษาตัวอย่างทั้งหมด?', u.ButtonSet.YES_NO) !== u.Button.YES) return;
  say_('✅ ลบนักศึกษาตัวอย่าง ' + clearSampleData_(sheetStore_()) + ' คนแล้ว');
}

function showWebUrl() {
  var url = ''; try { url = ScriptApp.getService().getUrl(); } catch (e) {}
  if (!url) { say_('ยังไม่ได้ Deploy เป็น Web app ดูเมนู "วิธี Deploy"'); return; }
  var html = HtmlService.createHtmlOutput('<div style="font-family:sans-serif;line-height:1.7">' +
    '<b>หน้านักศึกษา</b><br><a href="' + url + '" target="_blank">' + url + '</a><br><br>' +
    '<b>หลังบ้านครู</b><br><a href="' + url + '?page=admin" target="_blank">' + url + '?page=admin</a></div>').setWidth(520).setHeight(200);
  SpreadsheetApp.getUi().showModalDialog(html, 'ลิงก์หน้าเว็บ');
}

function showDeployHelp() {
  var html = HtmlService.createHtmlOutput('<div style="font-family:sans-serif;line-height:1.7;font-size:14px">' +
    '<ol><li>เปิด <b>ส่วนขยาย → Apps Script</b></li><li>กด <b>Deploy → New deployment</b> → ฟันเฟือง → <b>Web app</b></li>' +
    '<li>Execute as: <b>Me</b></li><li>Who has access: <b>Anyone</b> (นักศึกษาใช้รหัส + PIN ของระบบ) หรือ <b>Anyone within โดเมนวิทยาลัย</b></li>' +
    '<li>กด Deploy แล้วคัดลอก URL ที่ลงท้าย <b>/exec</b> ส่งให้นักศึกษา</li>' +
    '<li>หลังบ้านครู: เติม <b>?page=admin</b> ท้าย URL</li>' +
    '<li>แก้โค้ดภายหลัง: Deploy → Manage deployments → ✏️ → Version: <b>New version</b> (ลิงก์เดิมไม่เปลี่ยน)</li></ol></div>').setWidth(560).setHeight(360);
  SpreadsheetApp.getUi().showModalDialog(html, 'วิธี Deploy');
}

function writeReadme_(ss) {
  var lines = [
    ['ระบบสื่อการสอนเขียนโปรแกรมแบบปฏิสัมพันธ์ (Code Simulator) v' + APP_VERSION],
    [''],
    ['ติดตั้ง'],
    ['1) เมนู ⚙️ ตั้งค่าระบบ → 1) ติดตั้งระบบ'],
    ['2) เมนู ⚙️ ตั้งค่าระบบ → 2) ตั้งรหัสผ่านครู'],
    ['3) เมนู ⚙️ ตั้งค่าระบบ → 3) ใส่เนื้อหาและนักศึกษาตัวอย่าง (ทดลองใช้ รหัส 692010001 PIN 1234)'],
    ['4) แก้ค่าในแท็บ Settings เช่น ชื่อสถานศึกษา ชื่อผู้ลงนามเกียรติบัตร'],
    ['5) Deploy เป็น Web app (เมนู วิธี Deploy) แล้วแจกลิงก์ /exec ให้นักศึกษา หลังบ้านครูใช้ /exec?page=admin'],
    [''],
    ['โครงสร้างการเรียน'],
    ['ภารกิจ (หน่วยการเรียนรู้) → ใบความรู้ → ใบงาน → แบบฝึกปฏิบัติ → แบบทดสอบ'],
    ['ผ่านภารกิจเมื่อ ทำครบทุกกิจกรรม และได้คะแนนรวมตามเกณฑ์ (ค่าเริ่มต้น 60%) ระบบออกเกียรติบัตรให้อัตโนมัติ'],
    ['ระดับ: ดีเยี่ยม ≥ 90% / ดีมาก ≥ 75% / ผ่าน · ผ่านครบทุกภารกิจได้เกียรติบัตรสำเร็จหลักสูตร'],
    [''],
    ['แท็บข้อมูล (อย่าเปลี่ยนชื่อแท็บหรือหัวคอลัมน์)'],
    ['Students นักศึกษา · Units ภารกิจ · Activities กิจกรรม · Attempts การส่งงาน · HintsUsed คำใบ้ · QuizSessions รอบสอบ · Overrides ครูปรับคะแนน · Certificates เกียรติบัตร · Log ประวัติการแก้ไข'],
    [''],
    ['ข้อจำกัดที่ควรรู้'],
    ['• โค้ด HTML/CSS/JavaScript/Vue รันในเบราว์เซอร์ของนักศึกษา (iframe แยกส่วน) แสดงผลบนหน้าจอมือถือจำลอง ต้องต่ออินเทอร์เน็ตเพื่อโหลด Vue และ Bootstrap จาก CDN'],
    ['• ผลรันของงานเขียนโปรแกรมถูกส่งจากเครื่องนักศึกษา ผู้ที่ชำนาญอาจปลอมผลได้ ระบบจึงเก็บโค้ดทุกครั้งให้ครูเปิดตรวจ (หน้าครู → สมุดคะแนน → แตะชื่อ)'],
    ['• เฉลยแบบทดสอบและผลที่ควรได้ของชุดทดสอบที่ซ่อน ไม่ถูกส่งไปหน้าเว็บ ตรวจที่เซิร์ฟเวอร์เท่านั้น'],
    ['• PIN นักศึกษาเก็บแบบเข้ารหัส (SHA-256) ครูดู PIN เดิมไม่ได้ ต้องออก PIN ใหม่'],
    ['• Google Sheet 1 ช่องเก็บได้ไม่เกิน 50,000 ตัวอักษร เนื้อหาที่ยาวมากให้แบ่งเป็นหลายกิจกรรม']
  ];
  var sh = ss.getSheetByName('README') || ss.insertSheet('README');
  sh.clear(); sh.getRange(1, 1, lines.length, 1).setValues(lines); sh.setColumnWidth(1, 900);
  sh.getRange(1, 1).setFontSize(14).setFontWeight('bold');
  [3, 10, 15, 18].forEach(function (r) { sh.getRange(r, 1).setFontWeight('bold').setFontColor('#1E40AF'); });
  var ab = ss.getSheetByName('About') || ss.insertSheet('About');
  ab.clear();
  ab.getRange(1, 1, 5, 2).setValues([['ระบบ', 'Code Simulator — ห้องเรียนพัฒนาเว็บแอปพลิเคชัน (31909-2009)'], ['เวอร์ชัน', APP_VERSION], ['ผู้พัฒนา', '(ใส่ชื่อครู/นักศึกษาผู้พัฒนา)'], ['ติดต่อ', '(ช่องทางติดต่อ)'], ['เงื่อนไข', 'ใช้ภายในหน่วยงาน']]);
  ab.setColumnWidth(1, 120); ab.setColumnWidth(2, 500);
}
