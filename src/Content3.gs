/**
 * Content3.gs — ภารกิจพิเศษ: ภารกิจฐานข้อมูล 5 ภารกิจ (Google Sheets หลายแท็บเป็นฐานข้อมูล)
 * โจทย์ใช้ lang: 'gas' = รันใน Google Apps Script จำลอง (SpreadsheetApp, LockService, MailApp, Utilities)
 *   task.sheets = ข้อมูลเริ่มต้น { ชื่อแท็บ: [[หัวคอลัมน์...], [แถวข้อมูล...]] }
 *   task.call   = คำสั่งที่รันเมื่อกด ▶ รัน (แก้ได้ในช่อง "เรียกใช้")
 *   test.sheets = ข้อมูลชุดซ่อน (ใช้แทน task.sheets เฉพาะชุดตรวจนั้น)
 *   ตัวช่วยในชุดตรวจ: cell("Loans!A3") cells("Report!A2:F4") values("Students") lastRow("Loans") sheetNames() mails() lockUsed()
 * ภารกิจละ 10 คะแนน (ใบงาน 3 ภารกิจ = 30, แบบฝึก 2 ภารกิจ = 20) + แบบทดสอบ 10 ข้อ = 60 คะแนนพิเศษ (kind: bonus)
 */

var DB_TODAY_ = 'Utilities.formatDate(new Date(), "Asia/Bangkok", "dd/MM/yyyy")';

/* ---------- ข้อมูลตัวอย่าง ---------- */
function dbStudents_() { return [['รหัส', 'ชื่อ-สกุล', 'ห้อง'], ['6701001', 'ธนพล ใจดี', 'ปวส.1/1'], ['6701002', 'กมลวรรณ แสงทอง', 'ปวส.1/1'], ['6701003', 'ปิยะพงษ์ ศรีสุข', 'ปวส.1/2']]; }
function dbItems_() { return [['รหัสครุภัณฑ์', 'ชื่อ', 'สถานะ'], ['T01', 'มัลติมิเตอร์ดิจิทัล', 'ว่าง'], ['T02', 'หัวแร้งบัดกรี', 'ถูกยืม'], ['T03', 'ออสซิลโลสโคป', 'ว่าง'], ['T04', 'แหล่งจ่ายไฟ DC', 'ว่าง']]; }
function dbLoans_() { return [['เลขที่', 'รหัสนักเรียน', 'รหัสครุภัณฑ์', 'วันที่ยืม', 'สถานะ'], ['L0001', '6701002', 'T02', '10/11/2026', 'ยืมอยู่']]; }
/** สร้างข้อมูลเช็คชื่อ: map = { รหัส: 'มมมสข...' } ม=มา ส=สาย ข=ขาด ล=ลา (ตัวอักษรละ 1 วัน) */
function dbAttendance_(map) {
  var names = { 'ม': 'มา', 'ส': 'สาย', 'ข': 'ขาด', 'ล': 'ลา' }, rows = [['วันที่', 'รหัส', 'สถานะ']];
  var days = Math.max.apply(null, Object.keys(map).map(function (k) { return map[k].length; }));
  for (var d = 0; d < days; d++) Object.keys(map).forEach(function (code) {
    var ch = map[code].charAt(d); if (ch) rows.push([('0' + (2 + d)).slice(-2) + '/11/2026', code, names[ch]]);
  });
  return rows;
}
function dbProducts_() { return [['รหัส', 'ชื่อสินค้า', 'ราคา', 'คงเหลือ'], ['P01', 'ปากกาลูกลื่น', 10, 50], ['P02', 'สมุดปกอ่อน', 25, 3], ['P03', 'ยางลบ', 5, 20], ['P04', 'น้ำดื่ม', 7, 0]]; }
function dbOrders_() { return [['เลขที่', 'รหัสนักเรียน', 'รายการ', 'ยอดรวม', 'เวลา']]; }
function dbTickets_() {
  return [['เลขที่', 'รายการ', 'สถานที่', 'สถานะ', 'ผู้รับผิดชอบ'], ['R001', 'คอมพิวเตอร์เปิดไม่ติด', 'ห้อง 301', 'แจ้งแล้ว', ''], ['R002', 'โปรเจกเตอร์ภาพไม่ชัด', 'ห้องประชุม 1', 'กำลังซ่อม', 'ช่างสมชาย'],
    ['R003', 'แอร์มีน้ำหยด', 'ห้องสมุด', 'เสร็จแล้ว', 'ช่างวิชัย'], ['R004', 'ปลั๊กไฟชำรุด', 'ห้อง 205', 'รออะไหล่', 'ช่างสมชาย']];
}
function dbHistory_() { return [['เวลา', 'เลขที่', 'จาก', 'เป็น', 'โดย']]; }
function dbGradeOf_() {
  return ['/** แปลงคะแนนเป็นเกรดตามเกณฑ์อาชีวศึกษา (จากใบงานที่ 2) */', 'function gradeOf(score) {', '  if (score >= 80) return 4;', '  if (score >= 75) return 3.5;', '  if (score >= 70) return 3;', '  if (score >= 65) return 2.5;',
    '  if (score >= 60) return 2;', '  if (score >= 55) return 1.5;', '  if (score >= 50) return 1;', '  return 0;', '}'];
}

/** เนื้อหาต้นฉบับทั้งชุด (ใช้แยกเป็นภารกิจที่ 11–15 ใน dbUnits_) */
function dbParts_() {
  return {
    id: 'U11', order: 11, kind: 'bonus', icon: '🗄️', title: 'ภารกิจฐานข้อมูลด้วย Google Sheets',
    mission: 'ใช้ Google Sheet หลายแท็บเป็นฐานข้อมูล แก้ปัญหางานจริงในวิทยาลัย 5 ระบบ (คะแนนพิเศษ แยกจากคะแนนหลัก)',
    summary: 'Table • Primary/Foreign Key • Lookup ข้ามตาราง • Running number • GROUP BY • Transaction • LockService • State machine • JOIN',
    activities: [
      { id: 'U11-K', order: 1, type: 'knowledge', title: 'ใบความรู้: หลักการใช้ Google Sheets เป็นฐานข้อมูล', data: { content: L_(
        '# Google Sheets เป็นฐานข้อมูลได้อย่างไร',
        'ระบบงานจริงในวิทยาลัยหลายระบบ (ยืมครุภัณฑ์ เช็คชื่อ ร้านค้า แจ้งซ่อม ผลการเรียน) เก็บข้อมูลใน Google Sheet แล้วใช้ **Google Apps Script** อ่าน/เขียน ถ้าจัดชีตให้ถูกหลัก ชีตจะทำงานเหมือนฐานข้อมูลจริง',
        '',
        '| หลักการ | ในฐานข้อมูลจริง | ใน Google Sheets |',
        '|---|---|---|',
        '| 1 แท็บ = 1 ตาราง | Table | แท็บ `Students`, `Items`, `Loans` |',
        '| แถวแรกเป็นหัวคอลัมน์ | Field / Column | ห้ามเว้นแถว ห้ามผสานเซลล์ |',
        '| รหัสไม่ซ้ำ | Primary Key | รหัสนักเรียน, `L0001`, `ORD-001` |',
        '| อ้างอิงข้ามตาราง | Foreign Key | `Loans` เก็บแค่รหัสนักเรียน ไม่เก็บชื่อซ้ำ |',
        '| ค้นหาข้อมูล | SELECT … WHERE | `getValues()` แล้ว `find` / `filter` |',
        '| ทำทั้งหมดหรือไม่ทำเลย | Transaction | ตรวจทุกเงื่อนไขก่อน แล้วค่อยเขียน |',
        '| กันการเขียนชนกัน | Lock | `LockService.getScriptLock()` |',
        '| ไม่ลบข้อมูลจริง | Soft delete | เปลี่ยนสถานะแทนการลบแถว |',
        '',
        '> 💡 ในตัวจำลอง แต่ละตารางแสดงเป็น**แท็บด้านล่างของชีต** กดสลับดูผลได้ทุกตาราง ช่องที่ข้อมูลเปลี่ยนจะเป็นสีเหลือง และกด 🗄 เพื่อคืนข้อมูลเริ่มต้น',
        '',
        '## 1. เปิดตาราง: getSheetByName และ getValues',
        '`getDataRange().getValues()` คืนค่าเป็น **Array 2 มิติ** แถวที่ 0 คือหัวคอลัมน์ ข้อมูลจริงเริ่มที่แถว 1 (ในชีตคือแถวที่ 2)',
        '```gas',
        'function listStudents() {',
        '  const ss = SpreadsheetApp.getActive();',
        '  const rows = ss.getSheetByName("Students").getDataRange().getValues();',
        '  console.log("หัวคอลัมน์:", rows[0]);',
        '  rows.slice(1).forEach(r => console.log(r[0], r[1], r[2]));',
        '  console.log("จำนวนนักเรียน", rows.length - 1, "คน");',
        '}',
        'listStudents();',
        '```',
        '',
        '## 2. ค้นหาข้ามตาราง (Lookup / JOIN)',
        'ตาราง `Loans` เก็บแค่ **รหัส** (Foreign Key) เวลาแสดงผลต้องไปหาชื่อจากตาราง `Students` และ `Items`',
        '```gas',
        'function showLoans() {',
        '  const ss = SpreadsheetApp.getActive();',
        '  const students = ss.getSheetByName("Students").getDataRange().getValues().slice(1);',
        '  const items = ss.getSheetByName("Items").getDataRange().getValues().slice(1);',
        '  const loans = ss.getSheetByName("Loans").getDataRange().getValues().slice(1);',
        '  loans.forEach(l => {',
        '    const st = students.find(s => String(s[0]) === String(l[1]));',
        '    const it = items.find(i => i[0] === l[2]);',
        '    console.log(l[0], (st ? st[1] : "ไม่พบนักเรียน") + " ยืม " + (it ? it[1] : "ไม่พบครุภัณฑ์"));',
        '  });',
        '}',
        'showLoans();',
        '```',
        '',
        '## 3. เลขที่อัตโนมัติ (Running number)',
        'อ่านเลขที่ของ**แถวสุดท้าย** ตัดตัวอักษรนำหน้า บวก 1 แล้วเติม 0 ด้านหน้าด้วย `padStart`',
        '```gas',
        'function nextLoanId() {',
        '  const sh = SpreadsheetApp.getActive().getSheetByName("Loans");',
        '  const last = sh.getLastRow();                        // แถวสุดท้ายที่มีข้อมูล',
        '  const lastId = last > 1 ? sh.getRange(last, 1).getValue() : "L0000";',
        '  const n = Number(String(lastId).slice(1)) + 1;',
        '  return "L" + String(n).padStart(4, "0");',
        '}',
        'console.log("เลขที่ถัดไป:", nextLoanId());',
        'SpreadsheetApp.getActive().getSheetByName("Loans").appendRow([nextLoanId(), "6701001", "T01", ' + DB_TODAY_ + ', "ยืมอยู่"]);',
        'console.log("หลังเพิ่มแถว เลขที่ถัดไป:", nextLoanId());',
        '```',
        '',
        '## 4. Transaction: ตรวจทั้งหมดก่อน แล้วค่อยเขียน',
        'ถ้าคำสั่งซื้อมีหลายรายการ ห้าม "ตัดสต็อกไปทีละรายการ" เพราะถ้ารายการหลัง ๆ ของไม่พอ รายการแรกถูกตัดไปแล้ว ข้อมูลจะผิด ให้ **ตรวจทุกรายการให้ผ่านก่อน** จึงเขียนข้อมูล',
        '```gas',
        'function tryOrder(items) {',
        '  const sh = SpreadsheetApp.getActive().getSheetByName("Products");',
        '  const data = sh.getDataRange().getValues();',
        '  // ขั้นที่ 1: ตรวจ (ยังไม่เขียนอะไรเลย)',
        '  for (const [code, qty] of items) {',
        '    const row = data.find(r => r[0] === code);',
        '    if (!row) return "ไม่พบสินค้า: " + code;',
        '    if (row[3] < qty) return "สินค้าไม่พอ: " + code;',
        '  }',
        '  // ขั้นที่ 2: ผ่านทุกข้อแล้วจึงเขียน',
        '  items.forEach(([code, qty]) => {',
        '    const i = data.findIndex(r => r[0] === code);',
        '    sh.getRange(i + 1, 4).setValue(data[i][3] - qty);',
        '  });',
        '  return "สำเร็จ";',
        '}',
        'console.log(tryOrder([["P01", 2], ["P02", 9]]));   // P02 มีแค่ 3 → ไม่เขียนอะไรเลย',
        'console.log(tryOrder([["P01", 2], ["P03", 1]]));   // สำเร็จ ดูแท็บ Products',
        '```',
        '',
        '## 5. LockService: กันคนกดพร้อมกัน',
        'เว็บแอปมีผู้ใช้หลายคนพร้อมกัน ถ้า 2 คนอ่านเลขที่ล่าสุดพร้อมกัน จะได้เลขซ้ำ ให้ล็อกก่อนอ่าน-เขียน และ**ปลดล็อกใน finally เสมอ**',
        '```gas',
        'function addOrder(studentCode) {',
        '  const lock = LockService.getScriptLock();',
        '  lock.waitLock(10000);              // รอคิวได้สูงสุด 10 วินาที',
        '  try {',
        '    const sh = SpreadsheetApp.getActive().getSheetByName("Orders");',
        '    const id = "ORD-" + String(sh.getLastRow()).padStart(3, "0");',
        '    sh.appendRow([id, studentCode, "P03x1", 5, Utilities.formatDate(new Date(), "Asia/Bangkok", "dd/MM/yyyy HH:mm")]);',
        '    return id;',
        '  } finally {',
        '    lock.releaseLock();              // ปลดล็อกแม้เกิด error',
        '  }',
        '}',
        'console.log(addOrder("6701001"), addOrder("6701002"));',
        '```',
        '',
        '## Soft delete และสถานะ',
        '- ไม่ลบแถวจริง (`deleteRow`) เพราะประวัติหาย ให้เปลี่ยนคอลัมน์ **สถานะ** เช่น `ยืมอยู่` → `คืนแล้ว`',
        '- งานที่มีขั้นตอน (แจ้งซ่อม) ให้เก็บขั้นที่อนุญาตไว้ใน object เช่น `{ "แจ้งแล้ว": ["รับเรื่อง"] }` แล้วบันทึกทุกการเปลี่ยนแปลงลงตารางประวัติ (Audit log)',
        '',
        '## คำสั่งที่ใช้บ่อย',
        '| คำสั่ง | ความหมาย |',
        '|---|---|',
        '| `ss.getSheetByName("ชื่อ")` | เปิดแท็บ (ไม่มีคืน `null`) |',
        '| `ss.insertSheet("ชื่อ")` | สร้างแท็บใหม่ |',
        '| `sh.getDataRange().getValues()` | อ่านทั้งตาราง (Array 2 มิติ) |',
        '| `sh.getRange(แถว, คอลัมน์).setValue(v)` | เขียน 1 ช่อง (เริ่มนับที่ 1) |',
        '| `sh.getRange(แถว, คอลัมน์, จำนวนแถว, จำนวนคอลัมน์).setValues(arr)` | เขียนหลายช่อง ขนาด arr ต้องตรงกัน |',
        '| `sh.appendRow([..])` | เพิ่มแถวต่อท้าย |',
        '| `sh.getLastRow()` | แถวสุดท้ายที่มีข้อมูล |',
        '| `sh.clear()` | ล้างข้อมูลทั้งแท็บ |',
        '| `Utilities.formatDate(new Date(), "Asia/Bangkok", "dd/MM/yyyy")` | วันที่เป็นข้อความ |',
        '| `MailApp.sendEmail(ถึง, หัวเรื่อง, เนื้อหา)` | ส่งอีเมล |'
      ) } },

      /* ======================= ใบงาน: ภารกิจที่ 1–3 ======================= */
      { id: 'U11-W', order: 2, type: 'worksheet', title: 'ใบงาน: ภารกิจฐานข้อมูล 1–3 (ยืมครุภัณฑ์ · เวลาเรียน · ร้านค้าสหกรณ์)', data: {
        intro: 'เขียนฟังก์ชัน Apps Script ที่อ่าน/เขียน Google Sheet หลายแท็บ กด **▶ รัน** เพื่อเรียกคำสั่งในช่อง "เรียกใช้" แล้วดูผลในแต่ละแท็บ · **🧪 ตรวจกับตัวอย่าง** ก่อนส่ง · ส่งได้ 3 ครั้ง ใช้คะแนนดีที่สุด · ชุดตรวจบางชุดใช้**ข้อมูลชุดซ่อน** จึงห้ามเขียนผลลัพธ์ตายตัว',
        maxAttempts: 3,
        tasks: [
          { title: 'ภารกิจที่ 1 ระบบยืมครุภัณฑ์แผนกช่าง ⭐⭐', lang: 'gas',
            prompt: L_('**สถานการณ์:** ห้องเครื่องมือแผนกช่างอิเล็กทรอนิกส์ต้องรู้ว่าเครื่องมือชิ้นไหนอยู่กับใคร',
              '',
              '**ฐานข้อมูล 3 ตาราง:** `Students` (รหัส, ชื่อ-สกุล, ห้อง) · `Items` (รหัสครุภัณฑ์, ชื่อ, สถานะ `ว่าง`/`ถูกยืม`) · `Loans` (เลขที่, รหัสนักเรียน, รหัสครุภัณฑ์, วันที่ยืม, สถานะ)',
              '',
              'เขียน `borrowItem(studentCode, itemCode)`',
              '1. ไม่พบนักเรียน → return `ไม่พบนักเรียน`',
              '2. ไม่พบครุภัณฑ์ → return `ไม่พบครุภัณฑ์`',
              '3. สถานะไม่ใช่ `ว่าง` → return `ครุภัณฑ์ไม่ว่าง` (ไม่บันทึกอะไร)',
              '4. ผ่าน: สร้างเลขที่ต่อจากแถวสุดท้าย (`L0001` → `L0002`) บันทึกลง `Loans` = [เลขที่, รหัสนักเรียน, รหัสครุภัณฑ์, วันที่ `dd/MM/yyyy`, `ยืมอยู่`] เปลี่ยนสถานะครุภัณฑ์เป็น `ถูกยืม` แล้ว return เลขที่',
              '',
              '> ต่อยอดใช้จริง: เพิ่ม `returnItem(loanId)` และหน้าเว็บให้สแกน QR บนเครื่องมือ'),
            sheets: { Students: dbStudents_(), Items: dbItems_(), Loans: dbLoans_() },
            call: 'borrowItem("6701001", "T01")',
            starterCode: L_('function borrowItem(studentCode, itemCode) {', '  const ss = SpreadsheetApp.getActive();', '  // 1) อ่านตาราง Students, Items, Loans ด้วย getDataRange().getValues()', '  // 2) หา studentCode ใน Students ไม่พบ → return "ไม่พบนักเรียน"',
              '  // 3) หา itemCode ใน Items ไม่พบ → return "ไม่พบครุภัณฑ์"', '  // 4) สถานะไม่ใช่ "ว่าง" → return "ครุภัณฑ์ไม่ว่าง"', '  // 5) สร้างเลขที่ใหม่ต่อจากแถวสุดท้ายของ Loans (L0001 → L0002)',
              '  // 6) appendRow ลง Loans พร้อมวันที่ dd/MM/yyyy และสถานะ "ยืมอยู่"', '  // 7) เปลี่ยนสถานะใน Items เป็น "ถูกยืม" แล้ว return เลขที่', '}', ''),
            hints: ['ค้นหาด้วย const i = items.findIndex((r, k) => k > 0 && r[0] === itemCode); แถวในชีตคือ i + 1', 'เลขที่ใหม่: "L" + String(Number(lastId.slice(1)) + 1).padStart(4, "0") · วันที่: ' + DB_TODAY_],
            solution: L_('function borrowItem(studentCode, itemCode) {', '  const ss = SpreadsheetApp.getActive();', '  const students = ss.getSheetByName("Students").getDataRange().getValues();', '  const itemSheet = ss.getSheetByName("Items");',
              '  const items = itemSheet.getDataRange().getValues();', '  const loans = ss.getSheetByName("Loans");', '  if (!students.some((r, k) => k > 0 && String(r[0]) === String(studentCode))) return "ไม่พบนักเรียน";',
              '  const i = items.findIndex((r, k) => k > 0 && r[0] === itemCode);', '  if (i < 0) return "ไม่พบครุภัณฑ์";', '  if (items[i][2] !== "ว่าง") return "ครุภัณฑ์ไม่ว่าง";', '  const last = loans.getLastRow();',
              '  const lastId = last > 1 ? String(loans.getRange(last, 1).getValue()) : "L0000";', '  const id = "L" + String(Number(lastId.slice(1)) + 1).padStart(4, "0");',
              '  loans.appendRow([id, studentCode, itemCode, ' + DB_TODAY_ + ', "ยืมอยู่"]);', '  itemSheet.getRange(i + 1, 3).setValue("ถูกยืม");', '  return id;', '}'),
            tests: [
              { label: 'ยืมสำเร็จ ได้เลขที่ L0002', check: 'return borrowItem("6701001", "T01")', expected: 'L0002', score: 2 },
              { label: 'บันทึก Loans ครบ 5 คอลัมน์ และอัปเดตสถานะ T01 เป็น ถูกยืม', check: 'borrowItem("6701001", "T01"); return [cell("Items!C2"), cells("Loans!A3:C3"), cell("Loans!D3") === ' + DB_TODAY_ + ', cell("Loans!E3")].join("|")', expected: 'ถูกยืม|L0002|6701001|T01|true|ยืมอยู่', score: 2 },
              { label: 'ของไม่ว่าง (T02) → ครุภัณฑ์ไม่ว่าง และไม่บันทึก', check: 'return borrowItem("6701001", "T02") + "|" + lastRow("Loans")', expected: 'ครุภัณฑ์ไม่ว่าง|2', score: 1.5 },
              { label: 'ไม่พบนักเรียน', check: 'return borrowItem("9999999", "T01") + "|" + lastRow("Loans")', expected: 'ไม่พบนักเรียน|2', score: 1.5 },
              { label: 'ไม่พบครุภัณฑ์', check: 'return borrowItem("6701001", "X99") + "|" + lastRow("Loans") + "|" + cell("Items!C2")', expected: 'ไม่พบครุภัณฑ์|2|ว่าง', score: 1.5 },
              { label: 'เลขที่ต่อจากข้อมูลเดิม (ชุดซ่อน)', hidden: true, check: 'return borrowItem("6701003", "T03") + "|" + cell("Loans!A5") + "|" + cell("Items!C4")', expected: 'L0004|L0004|ถูกยืม', score: 1.5,
                sheets: { Students: dbStudents_(), Items: dbItems_(), Loans: dbLoans_().concat([['L0002', '6701001', 'T04', '11/11/2026', 'คืนแล้ว'], ['L0003', '6701003', 'T01', '12/11/2026', 'คืนแล้ว']]) } }
            ] },

          { title: 'ภารกิจที่ 2 สรุปเวลาเรียนและสิทธิ์สอบ (เกณฑ์ 80%) ⭐⭐', lang: 'gas',
            prompt: L_('**สถานการณ์:** ครูที่ปรึกษาต้องรู้ก่อนสอบปลายภาคว่าใครเวลาเรียนไม่ถึง 80%',
              '',
              '**ฐานข้อมูล:** `Students` (รหัส, ชื่อ-สกุล) · `Attendance` (วันที่, รหัส, สถานะ `มา`/`สาย`/`ขาด`/`ลา`) · `Report` (สร้างโดยโปรแกรม)',
              '',
              'เขียน `summarizeAttendance()`',
              '1. ถ้ายังไม่มีแท็บ `Report` ให้สร้างด้วย `insertSheet` ถ้ามีแล้วให้ล้างข้อมูลเก่า (`clear()`)',
              '2. หัวตาราง: `รหัส, ชื่อ-สกุล, มา, สาย, ขาด, ลา, ร้อยละการมาเรียน, สถานะ` เรียงนักเรียนตามตาราง Students',
              '3. ร้อยละ = (มา + สาย) ÷ จำนวนวันทั้งหมดของคนนั้น × 100 ทศนิยม 1 ตำแหน่ง',
              '4. ร้อยละ ≥ 80 → `มีสิทธิ์สอบ` ไม่เช่นนั้น `หมดสิทธิ์สอบ`',
              '5. return จำนวนคนที่หมดสิทธิ์สอบ',
              '',
              '> ต่อยอดใช้จริง: เชื่อมกับระบบเช็คชื่อ QR แล้วตั้ง Trigger ให้สรุปทุกวันศุกร์'),
            sheets: { Students: [['รหัส', 'ชื่อ-สกุล'], ['6701001', 'ธนพล ใจดี'], ['6701002', 'กมลวรรณ แสงทอง'], ['6701003', 'ปิยะพงษ์ ศรีสุข']],
              Attendance: dbAttendance_({ '6701001': 'มมมมขมมมมม', '6701002': 'มสมมขมลมสม', '6701003': 'มขสมขมสขมม' }) },
            call: 'summarizeAttendance()',
            starterCode: L_('function summarizeAttendance() {', '  const ss = SpreadsheetApp.getActive();', '  // 1) หาแท็บ Report ถ้าไม่มีให้ insertSheet("Report") ถ้ามีให้ clear()', '  // 2) อ่าน Students และ Attendance',
              '  // 3) นับ มา / สาย / ขาด / ลา ของแต่ละคน', '  // 4) ร้อยละ = (มา + สาย) / ทั้งหมด * 100 ทศนิยม 1 ตำแหน่ง → ≥ 80 มีสิทธิ์สอบ', '  // 5) เขียนหัวตาราง + ข้อมูลลง Report ด้วย setValues', '  // 6) return จำนวนคนที่หมดสิทธิ์สอบ', '}', ''),
            hints: ['let report = ss.getSheetByName("Report"); if (!report) report = ss.insertSheet("Report"); else report.clear();', 'const c = { "มา": 0, "สาย": 0, "ขาด": 0, "ลา": 0 }; แล้ว c[a[2]]++ · ร้อยละ Number((x).toFixed(1)) · เขียนครั้งเดียว report.getRange(1, 1, out.length, 8).setValues(out)'],
            solution: L_('function summarizeAttendance() {', '  const ss = SpreadsheetApp.getActive();', '  const students = ss.getSheetByName("Students").getDataRange().getValues().slice(1);',
              '  const att = ss.getSheetByName("Attendance").getDataRange().getValues().slice(1);', '  let report = ss.getSheetByName("Report");', '  if (!report) report = ss.insertSheet("Report"); else report.clear();',
              '  const out = [["รหัส", "ชื่อ-สกุล", "มา", "สาย", "ขาด", "ลา", "ร้อยละการมาเรียน", "สถานะ"]];', '  let failed = 0;', '  students.forEach(s => {', '    const c = { "มา": 0, "สาย": 0, "ขาด": 0, "ลา": 0 };',
              '    att.filter(a => String(a[1]) === String(s[0])).forEach(a => { if (c[a[2]] !== undefined) c[a[2]]++; });', '    const total = c["มา"] + c["สาย"] + c["ขาด"] + c["ลา"];',
              '    const pct = total ? Number(((c["มา"] + c["สาย"]) / total * 100).toFixed(1)) : 0;', '    const ok = pct >= 80;', '    if (!ok) failed++;', '    out.push([s[0], s[1], c["มา"], c["สาย"], c["ขาด"], c["ลา"], pct, ok ? "มีสิทธิ์สอบ" : "หมดสิทธิ์สอบ"]);', '  });',
              '  report.getRange(1, 1, out.length, out[0].length).setValues(out);', '  return failed;', '}'),
            tests: [
              { label: 'สร้างแท็บ Report พร้อมหัวตาราง 8 คอลัมน์', check: 'summarizeAttendance(); return sheetNames().includes("Report") + "|" + cells("Report!A1:H1")', expected: 'true|รหัส|ชื่อ-สกุล|มา|สาย|ขาด|ลา|ร้อยละการมาเรียน|สถานะ', score: 2 },
              { label: 'นับ มา/สาย/ขาด/ลา ของแต่ละคนถูกต้อง', check: 'summarizeAttendance(); return cells("Report!A2:F4")', expected: '6701001|ธนพล ใจดี|9|0|1|0\n6701002|กมลวรรณ แสงทอง|6|2|1|1\n6701003|ปิยะพงษ์ ศรีสุข|5|2|3|0', score: 2.5 },
              { label: 'ร้อยละและเกณฑ์ 80% พอดี (80.0 = มีสิทธิ์สอบ)', check: 'summarizeAttendance(); return values("Report").slice(1).map(r => Number(r[6]).toFixed(1) + " " + r[7]).join(", ")', expected: '90.0 มีสิทธิ์สอบ, 80.0 มีสิทธิ์สอบ, 70.0 หมดสิทธิ์สอบ', score: 2.5 },
              { label: 'return จำนวนคนที่หมดสิทธิ์สอบ', check: 'return summarizeAttendance()', expected: '1', score: 1.5 },
              { label: 'รันซ้ำแล้วไม่มีข้อมูลเก่าค้าง (ชุดซ่อน)', hidden: true, check: 'summarizeAttendance(); const n = summarizeAttendance(); return n + "|" + lastRow("Report") + "|" + cells("Report!G2:H3").replace(/\\n/g, ",")', expected: '2|3|25|หมดสิทธิ์สอบ,75|หมดสิทธิ์สอบ', score: 1.5,
                sheets: { Students: [['รหัส', 'ชื่อ-สกุล'], ['6802001', 'วรเมธ ทองคำ'], ['6802002', 'สุดารัตน์ ใจงาม']], Attendance: dbAttendance_({ '6802001': 'มลขข', '6802002': 'มสมล' }),
                  Report: [['ข้อมูลเก่า'], ['x'], ['x'], ['x'], ['x'], ['x'], ['x']] } }
            ] },

          { title: 'ภารกิจที่ 3 ร้านค้าสหกรณ์ ตัดสต็อกอัตโนมัติ ⭐⭐⭐', lang: 'gas',
            prompt: L_('**สถานการณ์:** ร้านค้าสหกรณ์วิทยาลัยให้นักเรียนสั่งของล่วงหน้า สต็อกต้องไม่ติดลบ',
              '',
              '**ฐานข้อมูล:** `Products` (รหัส, ชื่อสินค้า, ราคา, คงเหลือ) · `Orders` (เลขที่, รหัสนักเรียน, รายการ, ยอดรวม, เวลา)',
              '',
              'เขียน `placeOrder(studentCode, items)` โดย items เช่น `[["P01", 2], ["P03", 1]]`',
              '1. **ตรวจทุกรายการก่อน** ไม่พบสินค้า → `ไม่พบสินค้า: P09` ของไม่พอ → `สินค้าไม่พอ: P02` และ**ห้ามแก้ไขข้อมูลใด ๆ**',
              '2. ผ่านทั้งหมด: ตัดสต็อก คำนวณยอดรวม บันทึกคำสั่งซื้อเลขที่ `ORD-001` (ต่อจากแถวสุดท้าย) รายการรูปแบบ `P01x2, P03x1` แล้ว return เลขที่',
              '3. ครอบการทำงานด้วย `LockService` (ปลดล็อกใน `finally`)',
              '',
              '> ⚠️ จุดที่พลาดบ่อย: ตัดสต็อกทีละรายการโดยไม่ตรวจก่อน ถ้ารายการที่ 2 ของไม่พอ รายการแรกจะถูกตัดไปแล้ว ชุดตรวจจับข้อผิดพลาดนี้ได้'),
            sheets: { Products: dbProducts_(), Orders: dbOrders_() },
            call: 'placeOrder("6701001", [["P01", 2], ["P03", 1]])',
            starterCode: L_('function placeOrder(studentCode, items) {', '  // 1) const lock = LockService.getScriptLock(); lock.waitLock(10000); แล้วใช้ try { ... } finally { lock.releaseLock(); }', '  // 2) อ่าน Products',
              '  // 3) ตรวจทุกรายการก่อน: ไม่พบ → "ไม่พบสินค้า: รหัส" · ของไม่พอ → "สินค้าไม่พอ: รหัส" (ยังไม่เขียนอะไร)', '  // 4) ผ่านทั้งหมดแล้วจึงตัดสต็อกและคำนวณยอดรวม',
              '  // 5) เลขที่ใหม่ ORD-001 ต่อจากแถวสุดท้ายของ Orders · รายการ "P01x2, P03x1"', '  // 6) appendRow ลง Orders แล้ว return เลขที่', '}', ''),
            hints: ['ตรวจก่อนด้วย for (const [code, qty] of items) { ... return "สินค้าไม่พอ: " + code; } ถ้าวนครบแสดงว่าผ่านทุกข้อ', 'เลขที่: Number(String(lastId).split("-")[1]) + 1 แล้ว "ORD-" + String(n).padStart(3, "0") · รายการ: items.map(([c, q]) => c + "x" + q).join(", ")'],
            solution: L_('function placeOrder(studentCode, items) {', '  const lock = LockService.getScriptLock();', '  lock.waitLock(10000);', '  try {', '    const ss = SpreadsheetApp.getActive();', '    const sh = ss.getSheetByName("Products");',
              '    const data = sh.getDataRange().getValues();', '    // 1) ตรวจทุกรายการก่อน', '    for (const [code, qty] of items) {', '      const row = data.find((r, i) => i > 0 && r[0] === code);', '      if (!row) return "ไม่พบสินค้า: " + code;',
              '      if (Number(row[3]) < qty) return "สินค้าไม่พอ: " + code;', '    }', '    // 2) ผ่านทั้งหมดแล้วจึงเขียน', '    let total = 0;', '    items.forEach(([code, qty]) => {', '      const i = data.findIndex((r, k) => k > 0 && r[0] === code);',
              '      data[i][3] = Number(data[i][3]) - qty;', '      total += Number(data[i][2]) * qty;', '      sh.getRange(i + 1, 4).setValue(data[i][3]);', '    });', '    const orders = ss.getSheetByName("Orders");', '    const last = orders.getLastRow();',
              '    const n = last > 1 ? Number(String(orders.getRange(last, 1).getValue()).split("-")[1]) + 1 : 1;', '    const id = "ORD-" + String(n).padStart(3, "0");',
              '    orders.appendRow([id, studentCode, items.map(([c, q]) => c + "x" + q).join(", "), total, Utilities.formatDate(new Date(), "Asia/Bangkok", "dd/MM/yyyy HH:mm")]);', '    return id;', '  } finally {', '    lock.releaseLock();', '  }', '}'),
            /** คำตอบที่ผิดแบบที่พบบ่อย (ตัดสต็อกทีละรายการ) ใช้ในชุดทดสอบระบบ: ต้องได้ 6.5/10 */
            partialSolution: L_('function placeOrder(studentCode, items) {', '  const lock = LockService.getScriptLock();', '  lock.waitLock(10000);', '  try {', '    const ss = SpreadsheetApp.getActive();', '    const sh = ss.getSheetByName("Products");',
              '    const data = sh.getDataRange().getValues();', '    let total = 0;', '    for (const [code, qty] of items) {', '      const i = data.findIndex((r, k) => k > 0 && r[0] === code);', '      if (i < 0) return "ไม่พบสินค้า: " + code;',
              '      if (Number(data[i][3]) < qty) return "สินค้าไม่พอ: " + code;', '      sh.getRange(i + 1, 4).setValue(Number(data[i][3]) - qty);', '      total += Number(data[i][2]) * qty;', '    }', '    const orders = ss.getSheetByName("Orders");', '    const last = orders.getLastRow();',
              '    const n = last > 1 ? Number(String(orders.getRange(last, 1).getValue()).split("-")[1]) + 1 : 1;', '    const id = "ORD-" + String(n).padStart(3, "0");',
              '    orders.appendRow([id, studentCode, items.map(([c, q]) => c + "x" + q).join(", "), total, ""]);', '    return id;', '  } finally {', '    lock.releaseLock();', '  }', '}'),
            tests: [
              { label: 'สั่งสำเร็จ ได้ ORD-001 รายการ P01x2, P03x1 ยอด 25', check: 'return placeOrder("6701001", [["P01", 2], ["P03", 1]]) + "|" + cells("Orders!A2:D2")', expected: 'ORD-001|ORD-001|6701001|P01x2, P03x1|25', score: 1.5 },
              { label: 'ตัดสต็อกถูกต้อง', check: 'placeOrder("6701001", [["P01", 2], ["P03", 1]]); return cells("Products!D2:D5").replace(/\\n/g, ",")', expected: '48,3,19,0', score: 1.5 },
              { label: 'ของไม่พอต้องยกเลิกทั้งออเดอร์ (ไม่ตัดสต็อกรายการแรก)', check: 'const r = placeOrder("6701001", [["P01", 2], ["P02", 5]]); return r + "|" + cells("Products!D2:D3").replace(/\\n/g, ",") + "|" + lastRow("Orders")', expected: 'สินค้าไม่พอ: P02|50,3|1', score: 3.5 },
              { label: 'ไม่พบสินค้า', check: 'return placeOrder("6701001", [["P09", 1]]) + "|" + lastRow("Orders")', expected: 'ไม่พบสินค้า: P09|1', score: 1.5 },
              { label: 'เลขที่ต่อจากเดิม (ชุดซ่อน)', hidden: true, check: 'return placeOrder("6701002", [["P02", 3]]) + "|" + cell("Orders!D4") + "|" + cell("Products!D3")', expected: 'ORD-008|75|0', score: 1,
                sheets: { Products: dbProducts_(), Orders: dbOrders_().concat([['ORD-006', '6701001', 'P01x1', 10, '01/11/2026 08:00'], ['ORD-007', '6701003', 'P03x2', 10, '01/11/2026 09:30']]) } },
              { label: 'ใช้ LockService', check: 'placeOrder("6701001", [["P03", 1]]); return lockUsed()', expected: 'true', score: 1 }
            ] }
        ] } },

      /* ======================= แบบฝึก: ภารกิจที่ 4–5 ======================= */
      { id: 'U11-P', order: 3, type: 'practice', title: 'แบบฝึกปฏิบัติ: ภารกิจฐานข้อมูล 4–5 (แจ้งซ่อม · ใบแจ้งผลการเรียน GPA)', data: {
        intro: 'ฝึกได้ไม่จำกัดครั้ง ระบบเก็บคะแนนครั้งที่ดีที่สุด การเปิดคำใบ้จะหักคะแนนข้อนั้นตามที่ครูตั้งไว้ · ภารกิจละ 10 คะแนน',
        tasks: [
          { title: 'ภารกิจที่ 4 ระบบแจ้งซ่อม ห้ามข้ามขั้นตอน ⭐⭐⭐', lang: 'gas',
            prompt: L_('**สถานการณ์:** งานอาคารสถานที่ต้องการให้ใบแจ้งซ่อมเดินตามขั้นตอน ห้ามข้ามขั้น และตรวจย้อนหลังได้',
              '',
              '**ฐานข้อมูล:** `Tickets` (เลขที่, รายการ, สถานที่, สถานะ, ผู้รับผิดชอบ) · `History` (เวลา, เลขที่, จาก, เป็น, โดย)',
              '',
              '**ขั้นตอนที่อนุญาต:** `แจ้งแล้ว` → `รับเรื่อง` → `กำลังซ่อม` → (`รออะไหล่` ↔ `กำลังซ่อม`) → `เสร็จแล้ว` (เสร็จแล้วเปลี่ยนต่อไม่ได้)',
              '',
              'เขียน `updateTicket(ticketId, newStatus, by)`',
              '1. ไม่พบใบแจ้งซ่อม → `ไม่พบใบแจ้งซ่อม`',
              '2. ขั้นตอนไม่อนุญาต → `เปลี่ยนสถานะไม่ได้` (ไม่บันทึก)',
              '3. ผ่าน: อัปเดตสถานะและผู้รับผิดชอบ บันทึกประวัติลง `History` = [เวลา, เลขที่, จาก, เป็น, โดย] แล้ว return `สำเร็จ`',
              '',
              '> ได้ฝึก: State machine ด้วย object (FLOW), audit log, business rules'),
            sheets: { Tickets: dbTickets_(), History: dbHistory_() },
            call: 'updateTicket("R001", "รับเรื่อง", "ช่างสมชาย")',
            starterCode: L_('// ขั้นตอนที่อนุญาต: สถานะปัจจุบัน → รายการสถานะที่เปลี่ยนไปได้', 'const FLOW = {', '  "แจ้งแล้ว": ["รับเรื่อง"]', '  // เติมขั้นตอนที่เหลือให้ครบ', '};', '',
              'function updateTicket(ticketId, newStatus, by) {', '  // 1) อ่าน Tickets หาแถวของ ticketId ไม่พบ → return "ไม่พบใบแจ้งซ่อม"', '  // 2) ถ้า FLOW[สถานะเดิม] ไม่มี newStatus → return "เปลี่ยนสถานะไม่ได้"',
              '  // 3) เขียนสถานะ (คอลัมน์ D) และผู้รับผิดชอบ (คอลัมน์ E)', '  // 4) appendRow ลง History: [เวลา, เลขที่, จาก, เป็น, โดย] แล้ว return "สำเร็จ"', '}', ''),
            hints: ['FLOW: "รับเรื่อง": ["กำลังซ่อม"], "กำลังซ่อม": ["รออะไหล่", "เสร็จแล้ว"], "รออะไหล่": ["กำลังซ่อม"], "เสร็จแล้ว": []', 'ตรวจด้วย (FLOW[from] || []).includes(newStatus) · เขียน 2 ช่องพร้อมกัน sh.getRange(i + 1, 4, 1, 2).setValues([[newStatus, by]])'],
            solution: L_('const FLOW = {', '  "แจ้งแล้ว": ["รับเรื่อง"],', '  "รับเรื่อง": ["กำลังซ่อม"],', '  "กำลังซ่อม": ["รออะไหล่", "เสร็จแล้ว"],', '  "รออะไหล่": ["กำลังซ่อม"],', '  "เสร็จแล้ว": []', '};', '',
              'function updateTicket(ticketId, newStatus, by) {', '  const ss = SpreadsheetApp.getActive();', '  const sh = ss.getSheetByName("Tickets");', '  const data = sh.getDataRange().getValues();', '  const i = data.findIndex((r, k) => k > 0 && r[0] === ticketId);',
              '  if (i < 0) return "ไม่พบใบแจ้งซ่อม";', '  const from = data[i][3];', '  if (!(FLOW[from] || []).includes(newStatus)) return "เปลี่ยนสถานะไม่ได้";', '  sh.getRange(i + 1, 4, 1, 2).setValues([[newStatus, by]]);',
              '  ss.getSheetByName("History").appendRow([Utilities.formatDate(new Date(), "Asia/Bangkok", "dd/MM/yyyy HH:mm:ss"), ticketId, from, newStatus, by]);', '  return "สำเร็จ";', '}'),
            tests: [
              { label: 'แจ้งแล้ว → รับเรื่อง สำเร็จ และบันทึกผู้รับผิดชอบ', check: 'return updateTicket("R001", "รับเรื่อง", "ช่างสมชาย") + "|" + cells("Tickets!D2:E2")', expected: 'สำเร็จ|รับเรื่อง|ช่างสมชาย', score: 2 },
              { label: 'บันทึกประวัติลง History', check: 'updateTicket("R001", "รับเรื่อง", "ช่างสมชาย"); return lastRow("History") + "|" + cells("History!B2:E2") + "|" + (cell("History!A2").length >= 10)', expected: '2|R001|แจ้งแล้ว|รับเรื่อง|ช่างสมชาย|true', score: 2 },
              { label: 'ข้ามขั้นไม่ได้ (แจ้งแล้ว → เสร็จแล้ว)', check: 'const r = updateTicket("R001", "เสร็จแล้ว", "ช่างสมชาย"); return r + "|" + cell("Tickets!D2") + "|" + lastRow("History")', expected: 'เปลี่ยนสถานะไม่ได้|แจ้งแล้ว|1', score: 2 },
              { label: 'กำลังซ่อม → เสร็จแล้ว', check: 'return updateTicket("R002", "เสร็จแล้ว", "ช่างสมชาย") + "|" + cell("Tickets!D3")', expected: 'สำเร็จ|เสร็จแล้ว', score: 1.5 },
              { label: 'งานที่เสร็จแล้วแก้ไม่ได้ และรออะไหล่ → กำลังซ่อมได้ (ชุดซ่อน)', hidden: true, check: 'const a = updateTicket("R101", "กำลังซ่อม", "ช่างวิชัย"); const b = updateTicket("R102", "กำลังซ่อม", "ช่างวิชัย"); return a + "|" + b + "|" + cells("Tickets!D2:D3").replace(/\\n/g, ",") + "|" + lastRow("History")', expected: 'เปลี่ยนสถานะไม่ได้|สำเร็จ|เสร็จแล้ว,กำลังซ่อม|2', score: 1.5,
                sheets: { Tickets: [dbTickets_()[0], ['R101', 'ก๊อกน้ำรั่ว', 'อาคาร 2', 'เสร็จแล้ว', 'ช่างวิชัย'], ['R102', 'พัดลมเพดานไม่หมุน', 'ห้อง 104', 'รออะไหล่', 'ช่างสมชาย']], History: dbHistory_() } },
              { label: 'ไม่พบใบแจ้งซ่อม', check: 'return updateTicket("R999", "รับเรื่อง", "ช่างสมชาย") + "|" + lastRow("History")', expected: 'ไม่พบใบแจ้งซ่อม|1', score: 1 }
            ] },

          { title: 'ภารกิจที่ 5 ใบแจ้งผลการเรียนและ GPA ส่งอีเมล ⭐⭐⭐', lang: 'gas',
            prompt: L_('**สถานการณ์:** งานวัดผลต้องคำนวณ GPA และส่งผลการเรียนถึงผู้ปกครองทุกภาคเรียน',
              '',
              '**ฐานข้อมูล 3 ตาราง:** `Students` (รหัส, ชื่อ-สกุล, อีเมลผู้ปกครอง, GPA) · `Subjects` (รหัสวิชา, ชื่อวิชา, หน่วยกิต) · `Scores` (รหัสนักเรียน, รหัสวิชา, คะแนน)',
              '',
              'เขียน `sendReportCards()`',
              '1. แปลงคะแนนเป็นเกรดด้วย `gradeOf(score)` (เตรียมไว้ให้แล้ว)',
              '2. GPA = Σ(เกรด × หน่วยกิต) ÷ Σหน่วยกิต ทศนิยม 2 ตำแหน่ง เขียนลงคอลัมน์ `GPA` (D)',
              '3. ส่งอีเมลด้วย `MailApp.sendEmail(อีเมล, "ผลการเรียน ภาคเรียนที่ 1", เนื้อหา)` เนื้อหามีชื่อ รายวิชา เกรด และ GPA',
              '4. ข้ามคนที่ไม่มีอีเมล (แต่ยังคำนวณ GPA) แล้ว return จำนวนอีเมลที่ส่ง',
              '',
              '> ต่อยอดใช้จริง: สร้างใบแจ้งผลเป็น PDF จาก Google Docs แทนอีเมลข้อความ'),
            sheets: { Students: [['รหัส', 'ชื่อ-สกุล', 'อีเมลผู้ปกครอง', 'GPA'], ['6701001', 'ธนพล ใจดี', 'parent1@example.com', ''], ['6701002', 'กมลวรรณ แสงทอง', 'parent2@example.com', ''], ['6701003', 'ปิยะพงษ์ ศรีสุข', '', '']],
              Subjects: [['รหัสวิชา', 'ชื่อวิชา', 'หน่วยกิต'], ['31909-2009', 'การพัฒนาเว็บแอปพลิเคชัน', 3], ['30000-1201', 'ภาษาอังกฤษ', 2], ['30000-1601', 'พลศึกษา', 1]],
              Scores: [['รหัสนักเรียน', 'รหัสวิชา', 'คะแนน'], ['6701001', '31909-2009', 85], ['6701001', '30000-1201', 72], ['6701001', '30000-1601', 62], ['6701002', '31909-2009', 77], ['6701002', '30000-1201', 70], ['6701002', '30000-1601', 60],
                ['6701003', '31909-2009', 90], ['6701003', '30000-1201', 95], ['6701003', '30000-1601', 80]] },
            call: 'sendReportCards()',
            starterCode: L_.apply(null, dbGradeOf_().concat(['', 'function sendReportCards() {', '  const ss = SpreadsheetApp.getActive();', '  // 1) อ่าน Students, Subjects, Scores', '  // 2) ทำ object ค้นหาวิชาจากรหัส: { "31909-2009": { name, credit } }',
              '  // 3) วนนักเรียนทีละคน: หาคะแนนของคนนั้น → เกรด × หน่วยกิต รวมกัน', '  // 4) GPA = ผลรวม ÷ หน่วยกิตรวม ปัด 2 ตำแหน่ง เขียนลงคอลัมน์ D', '  // 5) มีอีเมล → MailApp.sendEmail(อีเมล, "ผลการเรียน ภาคเรียนที่ 1", เนื้อหา)',
              '  // 6) return จำนวนอีเมลที่ส่ง', '}', ''])),
            hints: ['const subj = {}; subjects.forEach(r => subj[r[0]] = { name: r[1], credit: Number(r[2]) }); · ปัด 2 ตำแหน่ง Math.round(x * 100) / 100', 'เขียน GPA แถวที่ i + 1 คอลัมน์ 4 · เนื้อหาอีเมลใส่ "- " + ชื่อวิชา + " เกรด " + เกรด ทีละบรรทัด และ "GPA = " + gpa.toFixed(2)'],
            solution: L_.apply(null, dbGradeOf_().concat(['', 'function sendReportCards() {', '  const ss = SpreadsheetApp.getActive();', '  const stSheet = ss.getSheetByName("Students");', '  const students = stSheet.getDataRange().getValues();',
              '  const subjects = ss.getSheetByName("Subjects").getDataRange().getValues().slice(1);', '  const scores = ss.getSheetByName("Scores").getDataRange().getValues().slice(1);', '  const subj = {};',
              '  subjects.forEach(r => subj[r[0]] = { name: r[1], credit: Number(r[2]) });', '  let sent = 0;', '  for (let i = 1; i < students.length; i++) {', '    const [code, name, email] = students[i];',
              '    const mine = scores.filter(r => String(r[0]) === String(code) && subj[r[1]]);', '    let points = 0, credits = 0;', '    const lines = mine.map(r => {', '      const s = subj[r[1]], g = gradeOf(Number(r[2]));',
              '      points += g * s.credit; credits += s.credit;', '      return "- " + s.name + " (" + s.credit + " หน่วยกิต) เกรด " + g;', '    });', '    const gpa = credits ? Math.round(points / credits * 100) / 100 : 0;',
              '    stSheet.getRange(i + 1, 4).setValue(gpa);', '    if (!email) continue;', '    MailApp.sendEmail(email, "ผลการเรียน ภาคเรียนที่ 1", "เรียน ผู้ปกครองของ " + name + "\\n\\n" + lines.join("\\n") + "\\n\\nGPA = " + gpa.toFixed(2));',
              '    sent++;', '  }', '  return sent;', '}'])),
            tests: [
              { label: 'GPA ถ่วงหน่วยกิตถูกต้อง (3.33 / 3.08 / 4.00)', check: 'sendReportCards(); return values("Students").slice(1).map(r => r[3] === "" ? "-" : Number(r[3]).toFixed(2)).join(" / ")', expected: '3.33 / 3.08 / 4.00', score: 4 },
              { label: 'ส่งเฉพาะคนที่มีอีเมล และ return จำนวนที่ส่ง', check: 'const n = sendReportCards(); return n + "|" + mails().map(m => m.to).join(",")', expected: '2|parent1@example.com,parent2@example.com', score: 2.5 },
              { label: 'หัวเรื่องและเนื้อหาอีเมลครบ (ชื่อ รายวิชา เกรด GPA)', check: 'sendReportCards(); const m = mails(); const a = m[0] || {}, b = m[1] || {}; return [a.subject, ["ธนพล ใจดี", "การพัฒนาเว็บแอปพลิเคชัน", "ภาษาอังกฤษ", "พลศึกษา", "3.33"].every(w => String(a.body).includes(w)), ["กมลวรรณ แสงทอง", "3.5", "3.08"].every(w => String(b.body).includes(w))].join("|")', expected: 'ผลการเรียน ภาคเรียนที่ 1|true|true', score: 2 },
              { label: 'ข้อมูลชุดอื่น (ชุดซ่อน)', hidden: true, check: 'const n = sendReportCards(); return n + "|" + values("Students").slice(1).map(r => Number(r[3]).toFixed(2)).join(",")', expected: '1|1.17,2.00', score: 1.5,
                sheets: { Students: [['รหัส', 'ชื่อ-สกุล', 'อีเมลผู้ปกครอง', 'GPA'], ['6802001', 'วรเมธ ทองคำ', 'home@example.com', ''], ['6802002', 'สุดารัตน์ ใจงาม', '', '']],
                  Subjects: [['รหัสวิชา', 'ชื่อวิชา', 'หน่วยกิต'], ['A1', 'คณิตศาสตร์', 2], ['B2', 'วิทยาศาสตร์', 3], ['C3', 'ศิลปะ', 1]],
                  Scores: [['รหัสนักเรียน', 'รหัสวิชา', 'คะแนน'], ['6802001', 'A1', 55], ['6802001', 'B2', 49], ['6802001', 'C3', 100], ['6802002', 'A1', 64], ['6802002', 'B2', 61], ['6802002', 'C3', 60]] } }
            ] }
        ] } },

      /* ======================= แบบทดสอบ ======================= */
      { id: 'U11-Q', order: 4, type: 'quiz', title: 'แบบทดสอบ: แนวคิดฐานข้อมูลด้วย Google Sheets', data: {
        intro: 'แบบทดสอบ 10 ข้อ เวลา 15 นาที ทำได้ 2 ครั้ง (ใช้คะแนนครั้งที่ดีที่สุด) ระบบสุ่มลำดับข้อและตัวเลือก ห้ามออกจากหน้าสอบระหว่างทำ',
        timeLimitMin: 15, maxAttempts: 2, shuffle: true, shuffleChoices: true,
        questions: [
          { id: 'q1', type: 'mc', text: 'ใน Google Sheets ที่ใช้เป็นฐานข้อมูล **1 ตาราง (Table)** ควรตรงกับอะไร', choices: ['1 แท็บ (Sheet)', '1 แถว', '1 เซลล์', '1 ไฟล์ต่อ 1 คอลัมน์'], answer: 0, score: 1, explain: 'แต่ละแท็บคือ 1 ตาราง แถวแรกเป็นหัวคอลัมน์' },
          { id: 'q2', type: 'mc', text: 'ข้อใดเป็น **Primary Key** ที่เหมาะสมของตาราง Loans', choices: ['ชื่อนักเรียน', 'เลขที่การยืม เช่น L0001', 'วันที่ยืม', 'สถานะการยืม'], answer: 1, score: 1, explain: 'Primary Key ต้องไม่ซ้ำและไม่เปลี่ยน' },
          { id: 'q3', type: 'mc', text: 'ตาราง Loans เก็บ "รหัสนักเรียน" แทนการเก็บชื่อ เพราะเหตุใด', choices: ['เพราะชื่อยาวเกินไป', 'เพราะ Google Sheets เก็บภาษาไทยไม่ได้', 'เป็น Foreign Key อ้างอิงตาราง Students ลดข้อมูลซ้ำและแก้ชื่อที่เดียว', 'เพื่อให้คำนวณ GPA ได้'], answer: 2, score: 1, explain: 'Foreign Key ทำให้ข้อมูลไม่ซ้ำซ้อน' },
          { id: 'q4', type: 'mc', text: 'คำสั่งใดเทียบได้กับ `SELECT * FROM Items WHERE สถานะ = "ว่าง"`', choices: ['sh.appendRow(["ว่าง"])', 'sh.clear()', 'ss.insertSheet("ว่าง")', 'sh.getDataRange().getValues().filter(r => r[2] === "ว่าง")'], answer: 3, score: 1, explain: 'อ่านทั้งตารางแล้วกรองด้วย filter' },
          { id: 'q5', type: 'mc', text: 'แถวสุดท้ายของ Loans มีเลขที่ `L0009` เลขที่ถัดไปที่ถูกต้องคือ', choices: ['L00010', 'L0010', 'L10', 'L0009-1'], answer: 1, score: 1, explain: '"L" + String(9 + 1).padStart(4, "0") = L0010' },
          { id: 'q6', type: 'mc', text: 'คำสั่งซื้อมี 2 รายการ รายการที่ 2 สินค้าไม่พอ วิธีที่ถูกต้องตามหลัก **Transaction** คือ', choices: ['ตัดสต็อกรายการแรกไว้ก่อน', 'ไม่แก้ไขข้อมูลใด ๆ และแจ้งว่าสินค้าไม่พอ', 'ตัดสต็อกจนติดลบ', 'ลบแถวสินค้านั้นทิ้ง'], answer: 1, score: 1, explain: 'ทำทั้งหมดหรือไม่ทำเลย: ตรวจทุกเงื่อนไขก่อนเขียน' },
          { id: 'q7', type: 'mc', text: '`LockService.getScriptLock()` ใช้แก้ปัญหาใด', choices: ['ผู้ใช้หลายคนเขียนข้อมูลพร้อมกันจนเลขที่ซ้ำหรือข้อมูลชนกัน', 'ป้องกันไม่ให้คนอื่นเปิดดูชีต', 'เข้ารหัสรหัสผ่าน', 'ทำให้สคริปต์ทำงานเร็วขึ้น'], answer: 0, score: 1, explain: 'ล็อกให้ทำงานทีละคน และปลดล็อกใน finally' },
          { id: 'q8', type: 'mc', text: 'การ **Soft delete** หมายถึงข้อใด', choices: ['ลบแถวด้วย deleteRow', 'ลบทั้งแท็บ', 'เปลี่ยนคอลัมน์สถานะ เช่น "คืนแล้ว" แทนการลบแถวจริง', 'ซ่อนคอลัมน์'], answer: 2, score: 1, explain: 'เก็บประวัติไว้ตรวจย้อนหลังได้' },
          { id: 'q9', type: 'mc', text: 'สรุปเวลาเรียนแล้วต้องการให้ **รันซ้ำได้โดยไม่มีข้อมูลเก่าค้าง** ควรทำอย่างไรกับแท็บ Report', choices: ['appendRow ต่อท้ายทุกครั้ง', 'สร้างแท็บใหม่ชื่อเดิมทุกครั้ง', 'ลบไฟล์ทั้งไฟล์', 'ถ้ามีแท็บแล้วให้ clear() ก่อนเขียน ถ้าไม่มีให้ insertSheet'], answer: 3, score: 1, explain: 'insertSheet ชื่อซ้ำจะเกิด error' },
          { id: 'q10', type: 'mc', text: 'วิชา A 3 หน่วยกิต ได้เกรด 4 และวิชา B 1 หน่วยกิต ได้เกรด 2 **GPA ถ่วงหน่วยกิต** เท่ากับเท่าไร', choices: ['3.00', '3.25', '3.50', '2.75'], answer: 2, score: 1, explain: '(4×3 + 2×1) ÷ 4 = 3.50' }
        ] } }
    ]
  };
}

/**
 * ภารกิจที่ 11–15: แยกภารกิจฐานข้อมูลเป็น 5 ภารกิจ (ภารกิจละ ใบความรู้ + ใบงาน 10 คะแนน + แบบทดสอบ 2 ข้อ)
 * kind: 'bonus' = คะแนนพิเศษ แยกจากคะแนนหลัก (ครูเปลี่ยนเป็นภารกิจหลักได้ที่หน้าครู → เนื้อหา → แก้ไขภารกิจ)
 */
function dbUnits_() {
  var P = dbParts_(), acts = P.activities;
  var tasks = acts[1].data.tasks.concat(acts[2].data.tasks);
  var qById = {}; acts[3].data.questions.forEach(function (q) { qById[q.id] = q; });
  // แบ่งใบความรู้ตามหัวข้อ ## …
  var sec = {}, cur = 'intro';
  acts[0].data.content.split('\n').forEach(function (ln) {
    var m = ln.match(/^## (\S+)/); if (m) cur = m[1].replace(/\.$/, '');
    (sec[cur] = sec[cur] || []).push(ln);
  });
  function S(k) { return (sec[k] || []).join('\n'); }
  var intro = S('intro'), cmds = S('คำสั่งที่ใช้บ่อย');
  var EX_GROUP = L_('## สรุปยอดแบบจัดกลุ่ม (GROUP BY) และสร้างตารางรายงาน',
    'นับจำนวนตามกลุ่มด้วย object ที่ใช้รหัสเป็นคีย์ แล้วเขียนผลลงแท็บรายงาน ถ้าแท็บมีอยู่แล้วต้อง `clear()` ก่อน เพื่อให้**รันซ้ำได้โดยข้อมูลไม่ค้าง**',
    '```gas',
    'function loanReport() {',
    '  const ss = SpreadsheetApp.getActive();',
    '  const loans = ss.getSheetByName("Loans").getDataRange().getValues().slice(1);',
    '  const count = {};                                   // { รหัสนักเรียน: จำนวนครั้ง }',
    '  loans.forEach(r => { count[r[1]] = (count[r[1]] || 0) + 1; });',
    '  let rep = ss.getSheetByName("LoanReport");',
    '  if (!rep) rep = ss.insertSheet("LoanReport"); else rep.clear();',
    '  const out = [["รหัสนักเรียน", "จำนวนครั้งที่ยืม"]].concat(Object.keys(count).map(k => [k, count[k]]));',
    '  rep.getRange(1, 1, out.length, 2).setValues(out);    // เขียนครั้งเดียวทั้งตาราง (เร็วกว่าเขียนทีละช่อง)',
    '  console.log("สร้างรายงาน", out.length - 1, "แถว ดูแท็บ LoanReport");',
    '}',
    'loanReport();',
    'loanReport(); // รันซ้ำแล้วข้อมูลไม่ซ้อน',
    '```',
    '',
    '> 💡 ร้อยละทศนิยม 1 ตำแหน่ง: `Number((x / total * 100).toFixed(1))` · เทียบเกณฑ์ด้วย `>=` เพื่อให้ 80.0 พอดีผ่านเกณฑ์');
  var EX_FLOW = L_('## ควบคุมลำดับขั้นตอนด้วย object (State machine) และบันทึกประวัติ (Audit log)',
    'เก็บ "ขั้นที่ไปต่อได้" ของแต่ละสถานะไว้ใน object แล้วตรวจด้วย `includes` ก่อนเปลี่ยน ทุกครั้งที่เปลี่ยนให้เพิ่มแถวในตารางประวัติ จึงย้อนดูได้ว่าใครเปลี่ยนอะไรเมื่อไร',
    '```gas',
    'const LOAN_FLOW = { "ยืมอยู่": ["คืนแล้ว", "สูญหาย"], "คืนแล้ว": [], "สูญหาย": [] };',
    'function setLoanStatus(loanId, next, by) {',
    '  const ss = SpreadsheetApp.getActive();',
    '  const sh = ss.getSheetByName("Loans");',
    '  const data = sh.getDataRange().getValues();',
    '  const i = data.findIndex((r, k) => k > 0 && r[0] === loanId);',
    '  if (i < 0) return "ไม่พบรายการ";',
    '  const from = data[i][4];',
    '  if (!LOAN_FLOW[from].includes(next)) return "เปลี่ยนจาก " + from + " เป็น " + next + " ไม่ได้";',
    '  sh.getRange(i + 1, 5).setValue(next);                    // Soft delete: เปลี่ยนสถานะ ไม่ลบแถว',
    '  let log = ss.getSheetByName("LoanLog") || ss.insertSheet("LoanLog");',
    '  if (log.getLastRow() === 0) log.appendRow(["เวลา", "เลขที่", "จาก", "เป็น", "โดย"]);',
    '  log.appendRow([Utilities.formatDate(new Date(), "Asia/Bangkok", "dd/MM/yyyy HH:mm:ss"), loanId, from, next, by]);',
    '  return "สำเร็จ";',
    '}',
    'console.log(setLoanStatus("L0001", "คืนแล้ว", "ครูสมศรี"));   // สำเร็จ',
    'console.log(setLoanStatus("L0001", "ยืมอยู่", "ครูสมศรี"));   // ย้อนขั้นไม่ได้',
    '```');
  var EX_GPA = L_('## ค่าเฉลี่ยถ่วงน้ำหนัก (GPA) และส่งอีเมล',
    'GPA = Σ(เกรด × หน่วยกิต) ÷ Σหน่วยกิต ทำ object ค้นหาวิชาจากรหัสก่อน (JOIN) แล้วรวมผล คนที่ไม่มีอีเมลให้ข้ามการส่ง แต่ยังคำนวณให้',
    '```gas',
    'const subjects = { "WEB": { name: "การพัฒนาเว็บแอปพลิเคชัน", credit: 3 }, "ENG": { name: "ภาษาอังกฤษ", credit: 2 }, "PE": { name: "พลศึกษา", credit: 1 } };',
    'const grades = [["WEB", 4], ["ENG", 3], ["PE", 2]];       // [รหัสวิชา, เกรด]',
    'let points = 0, credits = 0;',
    'const lines = grades.map(([code, g]) => {',
    '  const s = subjects[code];',
    '  points += g * s.credit; credits += s.credit;',
    '  return "- " + s.name + " (" + s.credit + " หน่วยกิต) เกรด " + g;',
    '});',
    'const gpa = Math.round(points / credits * 100) / 100;',
    'console.log("GPA =", gpa.toFixed(2));                       // (12 + 6 + 2) ÷ 6 = 3.33',
    'MailApp.sendEmail("parent@example.com", "ผลการเรียน ภาคเรียนที่ 1", lines.join("\\n") + "\\nGPA = " + gpa.toFixed(2));',
    'console.log("อีเมลคงเหลือวันนี้", MailApp.getRemainingDailyQuota());',
    '```',
    '',
    '> 💡 Gmail ส่งได้จำกัดต่อวัน (บัญชีทั่วไปประมาณ 100 ฉบับ) ระบบจริงควรตรวจ `MailApp.getRemainingDailyQuota()` ก่อนส่ง');
  var EX_PCT = L_('## คำนวณร้อยละและตัดสินตามเกณฑ์',
    'เมื่อนับได้แล้ว ให้คิดร้อยละจากจำนวนทั้งหมดของกลุ่มนั้น ปัดทศนิยม 1 ตำแหน่ง แล้วเทียบเกณฑ์',
    '```gas',
    'const items = SpreadsheetApp.getActive().getSheetByName("Items").getDataRange().getValues().slice(1);',
    'const free = items.filter(r => r[2] === "ว่าง").length;',
    'const pct = Number((free / items.length * 100).toFixed(1));',
    'console.log("ครุภัณฑ์ว่าง", free + "/" + items.length, "=", pct + "%", pct >= 50 ? "เพียงพอ" : "ไม่พอให้ยืม");',
    '```');
  var EX_FIND = L_('## ค้นหาตามสถานะ (WHERE สถานะ = …)',
    'งานที่มีขั้นตอน มักต้องแสดงรายการตามสถานะ เช่น "งานที่ยังไม่เสร็จ" ใช้ `filter` กับคอลัมน์สถานะ',
    '```gas',
    'const loans = SpreadsheetApp.getActive().getSheetByName("Loans").getDataRange().getValues().slice(1);',
    'const open = loans.filter(r => r[4] === "ยืมอยู่");',
    'console.log("ยังไม่คืน", open.length, "รายการ:", open.map(r => r[0] + " (" + r[2] + ")").join(", "));',
    '```');
  var plan = [
    { no: 11, icon: '🧰', title: 'ฐานข้อมูล 1: ระบบยืมครุภัณฑ์แผนกช่าง', task: 0, q: ['q2', 'q5'],
      mission: 'ออกแบบตาราง Students / Items / Loans ค้นหาข้ามตาราง และสร้างเลขที่การยืมอัตโนมัติ',
      summary: 'Sheets เป็นฐานข้อมูล • Primary/Foreign Key • getValues • Lookup ข้ามตาราง • Running number',
      know: [intro, S('1'), S('2'), S('3'), cmds] },
    { no: 12, icon: '🗓️', title: 'ฐานข้อมูล 2: สรุปเวลาเรียนและสิทธิ์สอบ', task: 1, q: ['q4', 'q9'],
      mission: 'สรุปเวลาเรียนแบบจัดกลุ่ม สร้างตารางรายงานอัตโนมัติ และตัดสิทธิ์สอบตามเกณฑ์ 80%',
      summary: 'Aggregate (GROUP BY) • insertSheet / clear • setValues ทั้งตาราง • ออกแบบให้รันซ้ำได้',
      know: [intro, S('1'), EX_GROUP, EX_PCT, cmds] },
    { no: 13, icon: '🛒', title: 'ฐานข้อมูล 3: ร้านค้าสหกรณ์ ตัดสต็อกอัตโนมัติ', task: 2, q: ['q6', 'q7'],
      mission: 'รับคำสั่งซื้อหลายรายการโดยสต็อกไม่ติดลบ ทำทั้งหมดหรือไม่ทำเลย และกันการเขียนชนกัน',
      summary: 'Transaction • ตรวจก่อนเขียน • LockService • try/finally • คำนวณยอดเงิน',
      know: [S('4'), S('5'), S('3'), cmds] },
    { no: 14, icon: '🛠️', title: 'ฐานข้อมูล 4: ระบบแจ้งซ่อม ห้ามข้ามขั้นตอน', task: 3, q: ['q8', 'q1'],
      mission: 'ควบคุมสถานะใบแจ้งซ่อมให้เดินตามขั้นตอน และบันทึกประวัติทุกการเปลี่ยนแปลง',
      summary: 'State machine ด้วย object • Business rules • Audit log • Soft delete',
      know: [S('Soft'), EX_FIND, EX_FLOW, S('3'), cmds] },
    { no: 15, icon: '📧', title: 'ฐานข้อมูล 5: ใบแจ้งผลการเรียนและ GPA', task: 4, q: ['q10', 'q3'],
      mission: 'เชื่อมข้อมูล 3 ตาราง คำนวณ GPA ถ่วงหน่วยกิต และส่งผลการเรียนถึงผู้ปกครองทางอีเมล',
      summary: 'JOIN 3 ตาราง • ค่าเฉลี่ยถ่วงน้ำหนัก • MailApp • จัดการข้อมูลไม่ครบ',
      know: [S('1'), S('2'), EX_GPA, cmds] }
  ];
  return plan.map(function (u) {
    var id = 'U' + u.no, tk = tasks[u.task];
    return { id: id, order: u.no, kind: 'bonus', icon: u.icon, title: u.title, mission: u.mission, summary: u.summary,
      activities: [
        { id: id + '-K', order: 1, type: 'knowledge', title: 'ใบความรู้ที่ ' + u.no + ': ' + u.title.replace(/^ฐานข้อมูล \d: /, ''), data: { content: u.know.join('\n\n') } },
        { id: id + '-W', order: 2, type: 'worksheet', title: 'ใบงานที่ ' + u.no + ': ' + tk.title.replace(/^ภารกิจที่ \d /, ''), data: {
          intro: 'เขียนฟังก์ชัน Apps Script ที่อ่าน/เขียน Google Sheet หลายแท็บ กด **▶ รัน** เพื่อเรียกคำสั่งในช่อง "เรียกใช้" แล้วดูผลในแต่ละแท็บ · **🧪 ตรวจกับตัวอย่าง** ก่อนส่ง · ส่งได้ 3 ครั้ง ใช้คะแนนดีที่สุด · ชุดตรวจบางชุดใช้**ข้อมูลชุดซ่อน** จึงห้ามเขียนผลลัพธ์ตายตัว',
          maxAttempts: 3, tasks: [tk] } },
        { id: id + '-Q', order: 3, type: 'quiz', title: 'แบบทดสอบภารกิจที่ ' + u.no, data: {
          intro: 'แบบทดสอบ 2 ข้อ เวลา 5 นาที ทำได้ 2 ครั้ง ระบบสุ่มลำดับข้อและตัวเลือก ห้ามออกจากหน้าสอบระหว่างทำ',
          timeLimitMin: 5, maxAttempts: 2, shuffle: true, shuffleChoices: true,
          questions: u.q.map(function (k) { return qById[k]; }) } }
      ] };
  });
}
