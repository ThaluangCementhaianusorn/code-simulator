/**
 * Content.gs — เนื้อหาตัวอย่าง 10 ภารกิจ (หน่วยการเรียนรู้) ภาษา Python — ภารกิจ 1–5 อยู่ไฟล์นี้ 6–10 อยู่ใน Content2.gs
 * แต่ละภารกิจมี: ใบความรู้ → ใบงาน → แบบฝึกปฏิบัติ → แบบทดสอบ
 * ครูแก้ไขได้ในหน้าครู (แท็บ เนื้อหา) หรือส่งออก/นำเข้าเป็นไฟล์ JSON
 *
 * รูปแบบข้อมูล
 *  knowledge : { content: 'Markdown' }   บล็อก ```python รันได้ทันที (```python norun = แสดงอย่างเดียว)
 *  worksheet / practice : { intro, maxAttempts, tasks: [{ title, prompt, starterCode, sampleInput, hints:[], solution,
 *                           tests: [{ input, expected, score, hidden, compare: trim|exact|ignorespace|contains|number }] }] }
 *  quiz : { intro, timeLimitMin, maxAttempts, shuffle, questions: [{ id, type: mc|tf|output|fill, text, code, choices, answer, score, explain }] }
 */
function L_() { return Array.prototype.slice.call(arguments).join('\n'); }

function getSeedCourse_() {
  return { format: 'code-simulator-course', units: [unit1_(), unit2_(), unit3_(), unit4_(), unit5_(), unit6_(), unit7_(), unit8_(), unit9_(), unit10_()] };
}

/* ======================= ภารกิจที่ 1 ======================= */
function unit1_() {
  return {
    id: 'U1', order: 1, icon: '🚀', title: 'สวัสดีโลก Python',
    mission: 'สั่งให้คอมพิวเตอร์แสดงข้อความ และเก็บข้อมูลไว้ในตัวแปร',
    summary: 'print() • ข้อความและตัวเลข • ตัวแปร • f-string • คอมเมนต์',
    activities: [
      { id: 'U1-K', order: 1, type: 'knowledge', title: 'ใบความรู้ที่ 1: คำสั่ง print และตัวแปร', data: { content: L_(
        '# คำสั่งแรกของเรา: print()',
        'คอมพิวเตอร์ทำงานตาม **คำสั่ง** ที่เราเขียนทีละบรรทัด จากบนลงล่าง คำสั่งแรกที่ทุกคนต้องรู้คือ `print()` ใช้แสดงผลออกทางหน้าจอ',
        '',
        '```python',
        'print("สวัสดีชาวโลก")',
        'print("ฉันกำลังเรียน Python")',
        '```',
        '',
        '> 💡 กดปุ่ม **▶ รัน** ใต้โค้ดเพื่อดูผลลัพธ์ แล้วลองแก้ข้อความเป็นชื่อตัวเองแล้วรันอีกครั้ง',
        '',
        '## ข้อความ (str) และตัวเลข (int, float)',
        '- ข้อความต้องอยู่ในเครื่องหมายคำพูด `" "` หรือ `\' \'` เรียกว่า **สตริง (str)**',
        '- ตัวเลขจำนวนเต็ม เช่น `17` เรียกว่า **int** ส่วนทศนิยม เช่น `3.5` เรียกว่า **float**',
        '- print หลายค่าพร้อมกันได้ โดยคั่นด้วยจุลภาค `,` ระบบจะเว้นวรรคให้เอง',
        '',
        '```python',
        'print(10 + 5)',
        'print("10 + 5")',
        'print("ผลรวมคือ", 10 + 5)',
        '```',
        '',
        '## ตัวแปร: กล่องเก็บข้อมูล',
        'ตัวแปรคือชื่อที่เราตั้งไว้เก็บค่า ใช้เครื่องหมาย `=` เพื่อ **กำหนดค่า** (ไม่ใช่ "เท่ากับ" แบบคณิตศาสตร์)',
        '',
        '```python',
        'name = "มานี"',
        'age = 16',
        'height = 158.5',
        'print(name, "อายุ", age, "ปี")',
        'print(type(name), type(age), type(height))',
        '```',
        '',
        '**กฎการตั้งชื่อตัวแปร**',
        '| ใช้ได้ ✓ | ใช้ไม่ได้ ✗ | เหตุผล |',
        '|---|---|---|',
        '| `score` | `1score` | ห้ามขึ้นต้นด้วยตัวเลข |',
        '| `total_price` | `total price` | ห้ามมีช่องว่าง |',
        '| `student2` | `print` | ไม่ควรซ้ำกับคำสั่งของ Python |',
        '',
        '## f-string: แทรกตัวแปรลงในข้อความ',
        'ใส่ตัว `f` หน้าเครื่องหมายคำพูด แล้วเขียนชื่อตัวแปรใน `{ }`',
        '',
        '```python',
        'product = "ปากกา"',
        'price = 15',
        'print(f"{product} ราคา {price} บาท")',
        '```',
        '',
        '## คอมเมนต์ (#)',
        'ข้อความหลังเครื่องหมาย `#` คือ **คอมเมนต์** Python จะไม่ทำงานส่วนนี้ ใช้อธิบายโค้ดให้คนอ่าน',
        '',
        '```python',
        '# โปรแกรมคำนวณราคา',
        'qty = 3      # จำนวนชิ้น',
        'print(qty * 20)',
        '```',
        '',
        '## 👣 ลองดูการทำงานทีละบรรทัด',
        'กดปุ่ม **👣 ทีละบรรทัด** ในโค้ดด้านล่าง แล้วกด ▶ ทีละขั้น สังเกตว่าค่าของตัวแปร `a` และ `b` เปลี่ยนไปอย่างไร',
        '',
        '```python',
        'a = 5',
        'b = a + 2',
        'a = a * b',
        'print(a, b)',
        '```'
      ) } },
      { id: 'U1-W', order: 2, type: 'worksheet', title: 'ใบงานที่ 1: ตัวแปรและการแสดงผล', data: {
        intro: 'เขียนโปรแกรมให้ผลลัพธ์ **ตรงกับตัวอย่างทุกตัวอักษร** กด ▶ รัน เพื่อดูผล กด 🧪 ตรวจกับตัวอย่าง แล้วจึงกด **ส่งงาน** (ส่งได้ 3 ครั้ง ใช้คะแนนครั้งที่ดีที่สุด)',
        maxAttempts: 3,
        tasks: [
          { title: 'ข้อ 1 แนะนำตัว', prompt: L_('สร้างตัวแปร `name` เก็บ `"สมชาย"` และ `age` เก็บ `17` แล้วแสดงผลเป็น', '```text', 'สมชาย อายุ 17 ปี', '```'),
            starterCode: L_('name = "สมชาย"', 'age = 17', '# เขียนคำสั่ง print ด้านล่าง', ''),
            hints: ['ใช้ f-string: print(f"... {age} ...")', 'print(f"{name} อายุ {age} ปี")'],
            solution: L_('name = "สมชาย"', 'age = 17', 'print(f"{name} อายุ {age} ปี")'),
            tests: [{ input: '', expected: 'สมชาย อายุ 17 ปี', score: 5 }] },
          { title: 'ข้อ 2 ใบเสร็จร้านเครื่องเขียน', prompt: L_('กำหนดให้ `product = "ปากกา"`, `price = 15`, `qty = 4` ให้คำนวณราคารวม แล้วแสดง 2 บรรทัดดังนี้', '```text', 'สินค้า: ปากกา x 4', 'รวม 60 บาท', '```'),
            starterCode: L_('product = "ปากกา"', 'price = 15', 'qty = 4', 'total = 0   # แก้บรรทัดนี้ให้คำนวณราคารวม', ''),
            hints: ['ราคารวม = ราคาต่อชิ้น x จำนวน → total = price * qty', 'บรรทัดแรกใช้ print(f"สินค้า: {product} x {qty}")'],
            solution: L_('product = "ปากกา"', 'price = 15', 'qty = 4', 'total = price * qty', 'print(f"สินค้า: {product} x {qty}")', 'print(f"รวม {total} บาท")'),
            tests: [{ input: '', expected: 'สินค้า: ปากกา x 4\nรวม 60 บาท', score: 5 }] }
        ] } },
      { id: 'U1-P', order: 3, type: 'practice', title: 'แบบฝึกปฏิบัติที่ 1: วาดรูปด้วย print', data: {
        intro: 'ฝึกได้ไม่จำกัดครั้ง ระบบเก็บคะแนนครั้งที่ดีที่สุด การเปิดคำใบ้จะหักคะแนนข้อนั้นตามที่ครูตั้งไว้',
        tasks: [
          { title: 'ข้อ 1 สามเหลี่ยมดาว', prompt: L_('แสดงรูปสามเหลี่ยม 4 บรรทัด', '```text', '*', '**', '***', '****', '```'),
            starterCode: 'print("*")\n',
            hints: ['ใช้ print 4 ครั้ง หรือใช้ "*" * 3 จะได้ ***'],
            solution: L_('print("*")', 'print("**")', 'print("***")', 'print("****")'),
            tests: [{ input: '', expected: '*\n**\n***\n****', score: 5 }] },
          { title: 'ข้อ 2 พื้นที่สี่เหลี่ยมผืนผ้า', prompt: L_('กำหนด `width = 12` และ `height = 5` คำนวณพื้นที่แล้วแสดง', '```text', 'กว้าง 12 ยาว 5 พื้นที่ 60 ตารางเมตร', '```'),
            starterCode: L_('width = 12', 'height = 5', ''),
            hints: ['พื้นที่ = width * height', 'print(f"กว้าง {width} ยาว {height} พื้นที่ {area} ตารางเมตร")'],
            solution: L_('width = 12', 'height = 5', 'area = width * height', 'print(f"กว้าง {width} ยาว {height} พื้นที่ {area} ตารางเมตร")'),
            tests: [{ input: '', expected: 'กว้าง 12 ยาว 5 พื้นที่ 60 ตารางเมตร', score: 5 }] }
        ] } },
      { id: 'U1-Q', order: 4, type: 'quiz', title: 'แบบทดสอบภารกิจที่ 1', data: {
        intro: 'แบบทดสอบ 6 ข้อ เวลา 10 นาที ทำได้ 2 ครั้ง (ใช้คะแนนครั้งที่ดีที่สุด) ระบบบันทึกคำตอบไว้ในเครื่อง ถ้าเน็ตหลุดเปิดกลับมาทำต่อได้ เมื่อหมดเวลาระบบจะส่งให้อัตโนมัติ',
        timeLimitMin: 10, maxAttempts: 2, shuffle: true,
        questions: [
          { id: 'q1', type: 'mc', text: 'คำสั่งใดแสดงข้อความ สวัสดี ได้ถูกต้อง', choices: ['print(สวัสดี)', 'print("สวัสดี")', 'Print("สวัสดี")', 'echo "สวัสดี"'], answer: 1, score: 1, explain: 'ข้อความต้องอยู่ใน " " และ print เป็นตัวพิมพ์เล็ก' },
          { id: 'q2', type: 'output', text: 'ผลลัพธ์ของโปรแกรมนี้คืออะไร', code: 'print("A" + "B")', answer: 'AB', score: 1, explain: 'การบวกสตริงคือการนำข้อความมาต่อกัน' },
          { id: 'q3', type: 'output', text: 'ผลลัพธ์ของโปรแกรมนี้คืออะไร', code: 'print(2 + 3 * 4)', answer: '14', score: 1, explain: 'คูณก่อนบวก: 3*4 = 12 แล้วบวก 2' },
          { id: 'q4', type: 'mc', text: 'type(3.5) ได้ผลเป็นชนิดข้อมูลใด', choices: ['int', 'str', 'float', 'bool'], answer: 2, score: 1, explain: 'ตัวเลขมีทศนิยมคือ float' },
          { id: 'q5', type: 'tf', text: 'ชื่อตัวแปร 2name ใช้ได้ใน Python', answer: false, score: 1, explain: 'ชื่อตัวแปรห้ามขึ้นต้นด้วยตัวเลข' },
          { id: 'q6', type: 'fill', text: 'เครื่องหมายที่ใช้เขียนคอมเมนต์ 1 บรรทัดใน Python คือ ____', answer: ['#'], score: 1, explain: 'ข้อความหลัง # จะไม่ถูกรัน' }
        ] } }
    ]
  };
}

/* ======================= ภารกิจที่ 2 ======================= */
function unit2_() {
  return {
    id: 'U2', order: 2, icon: '🧮', title: 'รับข้อมูลและคำนวณ',
    mission: 'สร้างโปรแกรมที่รับข้อมูลจากผู้ใช้ แล้วคำนวณผลให้อัตโนมัติ',
    summary: 'input() • int() float() • ตัวดำเนินการ + - * / // % ** • การจัดทศนิยม',
    activities: [
      { id: 'U2-K', order: 1, type: 'knowledge', title: 'ใบความรู้ที่ 2: input และตัวดำเนินการ', data: { content: L_(
        '# รับข้อมูลด้วย input()',
        '`input()` หยุดรอให้ผู้ใช้พิมพ์ข้อมูล แล้วส่งค่ากลับมาเป็น **ข้อความ (str) เสมอ**',
        '',
        '> 💡 ในตัวจำลองนี้ ให้พิมพ์ข้อมูลไว้ล่วงหน้าในช่อง **ข้อมูลนำเข้า (input)** บรรทัดละ 1 ค่า แล้วกด ▶ รัน',
        '',
        '```python',
        'name = input("ชื่อของคุณ: ")',
        'print("สวัสดี", name)',
        '```',
        '',
        '## แปลงชนิดข้อมูล',
        'เมื่อจะนำไปคำนวณ ต้องแปลงข้อความเป็นตัวเลขก่อน',
        '| คำสั่ง | ความหมาย | ตัวอย่าง |',
        '|---|---|---|',
        '| `int(x)` | แปลงเป็นจำนวนเต็ม | `int("5")` → `5` |',
        '| `float(x)` | แปลงเป็นทศนิยม | `float("2.5")` → `2.5` |',
        '| `str(x)` | แปลงเป็นข้อความ | `str(10)` → `"10"` |',
        '',
        '```python',
        'a = input()',
        'b = input()',
        'print("ต่อข้อความ:", a + b)',
        'print("บวกเลข:", int(a) + int(b))',
        '```',
        '',
        '## ตัวดำเนินการทางคณิตศาสตร์',
        '| เครื่องหมาย | ความหมาย | `17 ? 5` |',
        '|---|---|---|',
        '| `+` `-` `*` | บวก ลบ คูณ | 22, 12, 85 |',
        '| `/` | หาร (ได้ทศนิยม) | 3.4 |',
        '| `//` | หารเอาส่วน (ปัดทิ้ง) | 3 |',
        '| `%` | หารเอาเศษ | 2 |',
        '| `**` | ยกกำลัง | 1419857 |',
        '',
        '```python',
        'x = 17',
        'y = 5',
        'print(x / y, x // y, x % y, x ** 2)',
        '```',
        '',
        '## ตัวอย่างจริง: แปลงวินาทีเป็นนาที',
        '```python',
        'sec = int(input("จำนวนวินาที: "))',
        'm = sec // 60',
        's = sec % 60',
        'print(f"{m} นาที {s} วินาที")',
        '```',
        '',
        '## จัดทศนิยม',
        'ใช้ `round(x, 2)` หรือ f-string แบบ `{x:.2f}` เพื่อแสดงทศนิยม 2 ตำแหน่ง',
        '```python',
        'price = 199',
        'vat = price * 0.07',
        'print(vat)',
        'print(f"{vat:.2f}")',
        '```',
        '',
        '> ⚠️ ตอนตรวจงาน ระบบจะ **ไม่แสดงข้อความคำถามใน input()** ให้ตรวจเฉพาะสิ่งที่ print ออกมา จึงใส่ข้อความคำถามได้ตามสะดวก'
      ) } },
      { id: 'U2-W', order: 2, type: 'worksheet', title: 'ใบงานที่ 2: โปรแกรมรับข้อมูล', data: {
        intro: 'โจทย์มีชุดทดสอบที่ซ่อนไว้ด้วย ต้องเขียนให้ใช้ได้กับทุกข้อมูล ไม่ใช่เฉพาะตัวอย่าง (ส่งได้ 3 ครั้ง)',
        maxAttempts: 3,
        tasks: [
          { title: 'ข้อ 1 ทักทาย', prompt: L_('รับชื่อ 1 บรรทัด แล้วแสดง `สวัสดี <ชื่อ>`', '', '| ข้อมูลนำเข้า | ผลลัพธ์ |', '|---|---|', '| `มานี` | `สวัสดี มานี` |'),
            starterCode: 'name = input("ชื่อ: ")\n', sampleInput: 'มานี',
            hints: ['print("สวัสดี", name) จะเว้นวรรคให้อัตโนมัติ'],
            solution: L_('name = input()', 'print("สวัสดี", name)'),
            tests: [{ input: 'มานี', expected: 'สวัสดี มานี', score: 2 }, { input: 'ปิติ', expected: 'สวัสดี ปิติ', score: 2, hidden: true }, { input: 'Somchai', expected: 'สวัสดี Somchai', score: 1, hidden: true }] },
          { title: 'ข้อ 2 บวกเลขสองจำนวน', prompt: L_('รับจำนวนเต็ม 2 บรรทัด แล้วแสดงผลบวก', '', '| ข้อมูลนำเข้า | ผลลัพธ์ |', '|---|---|', '| `3` และ `5` | `8` |'),
            starterCode: L_('a = input()', 'b = input()', 'print(a + b)   # ผลลัพธ์ยังผิด ลองรันดู แล้วแก้ให้ถูก', ''), sampleInput: '3\n5',
            hints: ['input() ได้ข้อความ "3" + "5" จึงกลายเป็น "35"', 'แปลงเป็นตัวเลขก่อน: a = int(input())'],
            solution: L_('a = int(input())', 'b = int(input())', 'print(a + b)'),
            tests: [{ input: '3\n5', expected: '8', score: 2 }, { input: '10\n-4', expected: '6', score: 2, hidden: true }, { input: '1000\n2500', expected: '3500', score: 1, hidden: true }] }
        ] } },
      { id: 'U2-P', order: 3, type: 'practice', title: 'แบบฝึกปฏิบัติที่ 2: นาฬิกาและ BMI', data: {
        intro: 'ฝึกได้ไม่จำกัดครั้ง ใช้ // และ % ให้คล่อง',
        tasks: [
          { title: 'ข้อ 1 แปลงนาทีเป็นชั่วโมง', prompt: L_('รับจำนวนนาที (จำนวนเต็ม) แล้วแสดงเป็นชั่วโมงและนาที', '', '| ข้อมูลนำเข้า | ผลลัพธ์ |', '|---|---|', '| `135` | `2 ชั่วโมง 15 นาที` |', '| `60` | `1 ชั่วโมง 0 นาที` |'),
            starterCode: 'minutes = int(input())\n', sampleInput: '135',
            hints: ['ชั่วโมง = minutes // 60', 'นาทีที่เหลือ = minutes % 60'],
            solution: L_('minutes = int(input())', 'print(f"{minutes // 60} ชั่วโมง {minutes % 60} นาที")'),
            tests: [{ input: '135', expected: '2 ชั่วโมง 15 นาที', score: 2 }, { input: '60', expected: '1 ชั่วโมง 0 นาที', score: 1 }, { input: '59', expected: '0 ชั่วโมง 59 นาที', score: 1, hidden: true }, { input: '1440', expected: '24 ชั่วโมง 0 นาที', score: 1, hidden: true }] },
          { title: 'ข้อ 2 ดัชนีมวลกาย (BMI)', prompt: L_('รับน้ำหนัก (กิโลกรัม) และส่วนสูง (เซนติเมตร) บรรทัดละค่า', 'คำนวณ BMI = น้ำหนัก ÷ (ส่วนสูงเป็นเมตร)² แล้วแสดงทศนิยม 2 ตำแหน่ง', '', '| ข้อมูลนำเข้า | ผลลัพธ์ |', '|---|---|', '| `60` และ `170` | `20.76` |'),
            starterCode: L_('weight = float(input())', 'height = float(input())', ''), sampleInput: '60\n170',
            hints: ['แปลงเซนติเมตรเป็นเมตร: h = height / 100', 'bmi = weight / h ** 2 แล้ว print(f"{bmi:.2f}")'],
            solution: L_('weight = float(input())', 'height = float(input())', 'h = height / 100', 'bmi = weight / h ** 2', 'print(f"{bmi:.2f}")'),
            tests: [{ input: '60\n170', expected: '20.76', score: 2, compare: 'number' }, { input: '80\n175', expected: '26.12', score: 2, compare: 'number', hidden: true }, { input: '45.5\n160', expected: '17.77', score: 1, compare: 'number', hidden: true }] }
        ] } },
      { id: 'U2-Q', order: 4, type: 'quiz', title: 'แบบทดสอบภารกิจที่ 2', data: {
        intro: 'แบบทดสอบ 6 ข้อ เวลา 10 นาที ทำได้ 2 ครั้ง',
        timeLimitMin: 10, maxAttempts: 2, shuffle: true,
        questions: [
          { id: 'q1', type: 'output', text: 'ผลลัพธ์คืออะไร', code: 'print(7 // 2)', answer: '3', score: 1, explain: '// คือหารแล้วปัดเศษทิ้ง' },
          { id: 'q2', type: 'output', text: 'ผลลัพธ์คืออะไร', code: 'print(7 % 2)', answer: '1', score: 1, explain: '% คือเศษจากการหาร 7 ÷ 2 = 3 เศษ 1' },
          { id: 'q3', type: 'output', text: 'ผลลัพธ์คืออะไร', code: 'print(2 ** 3)', answer: '8', score: 1, explain: '** คือยกกำลัง 2×2×2' },
          { id: 'q4', type: 'mc', text: 'ค่าที่ได้จาก input() เป็นชนิดข้อมูลใดเสมอ', choices: ['int', 'float', 'str', 'ขึ้นอยู่กับสิ่งที่พิมพ์'], answer: 2, score: 1, explain: 'input() คืนค่าเป็นข้อความเสมอ ต้องแปลงเองด้วย int() / float()' },
          { id: 'q5', type: 'tf', text: 'print("5" + "5") ได้ผลลัพธ์เป็น 10', answer: false, score: 1, explain: 'สตริงบวกกันคือการต่อข้อความ ได้ 55' },
          { id: 'q6', type: 'output', text: 'ผลลัพธ์คืออะไร', code: 'x = int("4")\nprint(x * 3)', answer: '12', score: 1, explain: 'แปลง "4" เป็น 4 แล้วคูณ 3' }
        ] } }
    ]
  };
}

/* ======================= ภารกิจที่ 3 ======================= */
function unit3_() {
  return {
    id: 'U3', order: 3, icon: '🔀', title: 'ตัดสินใจด้วย if',
    mission: 'ให้โปรแกรมเลือกทำงานตามเงื่อนไข เหมือนคนตัดสินใจ',
    summary: 'ตัวเปรียบเทียบ • if / elif / else • and or not • การย่อหน้า',
    activities: [
      { id: 'U3-K', order: 1, type: 'knowledge', title: 'ใบความรู้ที่ 3: คำสั่งเงื่อนไข', data: { content: L_(
        '# ตัวเปรียบเทียบ (ได้ผลเป็น True / False)',
        '| เครื่องหมาย | ความหมาย |',
        '|---|---|',
        '| `==` | เท่ากับ |',
        '| `!=` | ไม่เท่ากับ |',
        '| `>` `<` | มากกว่า น้อยกว่า |',
        '| `>=` `<=` | มากกว่าหรือเท่ากับ น้อยกว่าหรือเท่ากับ |',
        '',
        '```python',
        'print(5 > 3)',
        'print(5 == 3)',
        'print("a" != "b")',
        '```',
        '',
        '## if / else',
        'บรรทัด `if` ต้องลงท้ายด้วย `:` และคำสั่งที่อยู่ใต้เงื่อนไขต้อง **ย่อหน้า 4 ช่อง** (กด Tab)',
        '',
        '```python',
        'score = int(input())',
        'if score >= 50:',
        '    print("ผ่าน")',
        'else:',
        '    print("ไม่ผ่าน")',
        'print("จบโปรแกรม")',
        '```',
        '',
        '> 💡 ใส่ข้อมูลนำเข้า 72 แล้วรัน จากนั้นเปลี่ยนเป็น 30 แล้วกด **👣 ทีละบรรทัด** ดูว่าโปรแกรมกระโดดข้ามบรรทัดไหน',
        '',
        '## หลายทางเลือกด้วย elif',
        'Python ตรวจเงื่อนไขจากบนลงล่าง **เจอข้อแรกที่เป็นจริงแล้วจะไม่ตรวจข้อที่เหลือ**',
        '',
        '```python',
        'temp = 31',
        'if temp >= 35:',
        '    print("ร้อนมาก")',
        'elif temp >= 28:',
        '    print("ร้อน")',
        'elif temp >= 20:',
        '    print("สบาย ๆ")',
        'else:',
        '    print("หนาว")',
        '```',
        '',
        '## รวมเงื่อนไขด้วย and / or / not',
        '| คำ | เป็นจริงเมื่อ |',
        '|---|---|',
        '| `and` | ทั้งสองข้างเป็นจริง |',
        '| `or` | ข้างใดข้างหนึ่งเป็นจริง |',
        '| `not` | กลับค่าความจริง |',
        '',
        '```python',
        'age = 17',
        'has_card = True',
        'if age >= 15 and has_card:',
        '    print("เข้าห้องสมุดได้")',
        'if age < 12 or age >= 60:',
        '    print("ได้ส่วนลด")',
        'else:',
        '    print("ราคาปกติ")',
        '```',
        '',
        '## ตรวจเลขคู่-คี่',
        'จำนวนที่หาร 2 ลงตัว (`n % 2 == 0`) คือเลขคู่',
        '```python',
        'n = 7',
        'if n % 2 == 0:',
        '    print("คู่")',
        'else:',
        '    print("คี่")',
        '```'
      ) } },
      { id: 'U3-W', order: 2, type: 'worksheet', title: 'ใบงานที่ 3: โปรแกรมตัดสินใจ', data: {
        intro: 'ระวังเรื่องเครื่องหมาย : และการย่อหน้า (ส่งได้ 3 ครั้ง)',
        maxAttempts: 3,
        tasks: [
          { title: 'ข้อ 1 เลขคู่หรือเลขคี่', prompt: L_('รับจำนวนเต็ม 1 ค่า ถ้าเป็นเลขคู่ให้แสดง `คู่` ถ้าไม่ใช่ให้แสดง `คี่`', '', '| ข้อมูลนำเข้า | ผลลัพธ์ |', '|---|---|', '| `4` | `คู่` |', '| `7` | `คี่` |'),
            starterCode: 'n = int(input())\n', sampleInput: '4',
            hints: ['เลขคู่คือ n % 2 == 0'],
            solution: L_('n = int(input())', 'if n % 2 == 0:', '    print("คู่")', 'else:', '    print("คี่")'),
            tests: [{ input: '4', expected: 'คู่', score: 1 }, { input: '7', expected: 'คี่', score: 1 }, { input: '0', expected: 'คู่', score: 1, hidden: true }, { input: '-3', expected: 'คี่', score: 1, hidden: true }, { input: '1000', expected: 'คู่', score: 1, hidden: true }] },
          { title: 'ข้อ 2 ตัดเกรด', prompt: L_('รับคะแนน 0–100 แล้วแสดงเกรดตามเกณฑ์', '', '| คะแนน | ผลลัพธ์ |', '|---|---|', '| 80 ขึ้นไป | `เกรด 4` |', '| 70–79 | `เกรด 3` |', '| 60–69 | `เกรด 2` |', '| 50–59 | `เกรด 1` |', '| ต่ำกว่า 50 | `เกรด 0` |'),
            starterCode: L_('score = int(input())', 'if score >= 80:', '    print("เกรด 4")', '# เขียนต่อด้วย elif ...', ''), sampleInput: '85',
            hints: ['เรียงจากคะแนนมากไปน้อย: if >= 80, elif >= 70, elif >= 60, elif >= 50, else', 'ไม่ต้องเขียน score >= 70 and score < 80 เพราะ elif ตรวจต่อเมื่อข้อบนไม่จริงแล้ว'],
            solution: L_('score = int(input())', 'if score >= 80:', '    print("เกรด 4")', 'elif score >= 70:', '    print("เกรด 3")', 'elif score >= 60:', '    print("เกรด 2")', 'elif score >= 50:', '    print("เกรด 1")', 'else:', '    print("เกรด 0")'),
            tests: [{ input: '85', expected: 'เกรด 4', score: 1 }, { input: '72', expected: 'เกรด 3', score: 1 }, { input: '65', expected: 'เกรด 2', score: 1, hidden: true }, { input: '50', expected: 'เกรด 1', score: 1, hidden: true }, { input: '49', expected: 'เกรด 0', score: 1, hidden: true }] }
        ] } },
      { id: 'U3-P', order: 3, type: 'practice', title: 'แบบฝึกปฏิบัติที่ 3: ค่าโดยสารและค่ามากสุด', data: {
        intro: 'ฝึกได้ไม่จำกัดครั้ง',
        tasks: [
          { title: 'ข้อ 1 ค่าโดยสารรถรับส่ง', prompt: L_('รับอายุ แล้วแสดงค่าโดยสาร', '- อายุต่ำกว่า 12 ปี → `ค่าโดยสาร 10 บาท`', '- อายุ 60 ปีขึ้นไป → `ค่าโดยสาร 0 บาท`', '- นอกนั้น → `ค่าโดยสาร 20 บาท`'),
            starterCode: 'age = int(input())\n', sampleInput: '8',
            hints: ['มี 3 ทางเลือก ใช้ if / elif / else'],
            solution: L_('age = int(input())', 'if age < 12:', '    fare = 10', 'elif age >= 60:', '    fare = 0', 'else:', '    fare = 20', 'print(f"ค่าโดยสาร {fare} บาท")'),
            tests: [{ input: '8', expected: 'ค่าโดยสาร 10 บาท', score: 1 }, { input: '30', expected: 'ค่าโดยสาร 20 บาท', score: 1 }, { input: '65', expected: 'ค่าโดยสาร 0 บาท', score: 1 }, { input: '12', expected: 'ค่าโดยสาร 20 บาท', score: 1, hidden: true }, { input: '60', expected: 'ค่าโดยสาร 0 บาท', score: 1, hidden: true }] },
          { title: 'ข้อ 2 ค่ามากที่สุดของ 3 จำนวน', prompt: L_('รับจำนวนเต็ม 3 บรรทัด แสดงค่าที่มากที่สุด **โดยไม่ใช้ฟังก์ชัน max()**', '', '| ข้อมูลนำเข้า | ผลลัพธ์ |', '|---|---|', '| `4` `9` `2` | `9` |'),
            starterCode: L_('a = int(input())', 'b = int(input())', 'c = int(input())', ''), sampleInput: '4\n9\n2',
            hints: ['สมมติให้ m = a ก่อน แล้วเทียบกับ b และ c ทีละตัว', 'if b > m: m = b แล้วทำแบบเดียวกันกับ c'],
            solution: L_('a = int(input())', 'b = int(input())', 'c = int(input())', 'm = a', 'if b > m:', '    m = b', 'if c > m:', '    m = c', 'print(m)'),
            tests: [{ input: '4\n9\n2', expected: '9', score: 1 }, { input: '7\n3\n1', expected: '7', score: 1 }, { input: '1\n2\n3', expected: '3', score: 1, hidden: true }, { input: '-5\n-2\n-9', expected: '-2', score: 1, hidden: true }, { input: '5\n5\n5', expected: '5', score: 1, hidden: true }] }
        ] } },
      { id: 'U3-Q', order: 4, type: 'quiz', title: 'แบบทดสอบภารกิจที่ 3', data: {
        intro: 'แบบทดสอบ 6 ข้อ เวลา 10 นาที ทำได้ 2 ครั้ง',
        timeLimitMin: 10, maxAttempts: 2, shuffle: true,
        questions: [
          { id: 'q1', type: 'output', text: 'ผลลัพธ์คืออะไร', code: 'x = 5\nif x > 3:\n    print("A")\nelse:\n    print("B")', answer: 'A', score: 1, explain: '5 > 3 เป็นจริง จึงทำบรรทัดใต้ if' },
          { id: 'q2', type: 'mc', text: 'เครื่องหมายใดใช้ตรวจว่า "เท่ากัน"', choices: ['=', '==', '===', '=>'], answer: 1, score: 1, explain: '= ใช้กำหนดค่า ส่วน == ใช้เปรียบเทียบ' },
          { id: 'q3', type: 'output', text: 'ผลลัพธ์คืออะไร', code: 'n = 65\nif n >= 80:\n    print("ดีมาก")\nelif n >= 60:\n    print("ดี")\nelse:\n    print("ปรับปรุง")', answer: 'ดี', score: 1, explain: '65 ไม่ถึง 80 แต่ >= 60' },
          { id: 'q4', type: 'mc', text: 'ข้อใดได้ผลเป็น True', choices: ['5 > 3 and 2 > 4', '5 < 3 or 2 > 4', 'not (5 > 3)', '5 > 3 or 2 > 4'], answer: 3, score: 1, explain: 'or เป็นจริงเมื่อข้างใดข้างหนึ่งจริง และ 5 > 3 จริง' },
          { id: 'q5', type: 'tf', text: 'บรรทัด if ต้องลงท้ายด้วยเครื่องหมาย : (โคลอน)', answer: true, score: 1, explain: 'ถ้าลืม : จะเกิด SyntaxError' },
          { id: 'q6', type: 'fill', text: 'คำสั่งที่ใช้ตรวจเงื่อนไขถัดไป เมื่อ if ไม่เป็นจริง (ย่อมาจาก else if) คือ ____', answer: ['elif'], score: 1, explain: 'elif = else if' }
        ] } }
    ]
  };
}

/* ======================= ภารกิจที่ 4 ======================= */
function unit4_() {
  return {
    id: 'U4', order: 4, icon: '🔁', title: 'วนซ้ำด้วย for และ while',
    mission: 'สั่งให้คอมพิวเตอร์ทำงานซ้ำ ๆ แทนเรา โดยไม่ต้องเขียนคำสั่งซ้ำ',
    summary: 'range() • for • while • ตัวแปรสะสม • break',
    activities: [
      { id: 'U4-K', order: 1, type: 'knowledge', title: 'ใบความรู้ที่ 4: การวนซ้ำ', data: { content: L_(
        '# วนซ้ำด้วย for และ range()',
        '`range(n)` สร้างลำดับตัวเลข 0 ถึง n-1 ส่วน `range(a, b)` ได้ a ถึง b-1',
        '',
        '```python',
        'for i in range(5):',
        '    print("รอบที่", i)',
        '```',
        '',
        '| คำสั่ง | ได้ลำดับ |',
        '|---|---|',
        '| `range(4)` | 0 1 2 3 |',
        '| `range(1, 6)` | 1 2 3 4 5 |',
        '| `range(0, 10, 2)` | 0 2 4 6 8 |',
        '| `range(5, 0, -1)` | 5 4 3 2 1 |',
        '',
        '## ตัวแปรสะสม',
        'สร้างตัวแปรเริ่มต้นเป็น 0 ไว้ **นอกลูป** แล้วบวกเพิ่มทุกรอบ',
        '',
        '```python',
        'total = 0',
        'for i in range(1, 6):',
        '    total = total + i',
        'print("ผลรวม =", total)',
        '```',
        '',
        '> 💡 กด **👣 ทีละบรรทัด** ที่โค้ดด้านบน ดูค่า `i` และ `total` เปลี่ยนในแต่ละรอบ',
        '',
        '## สูตรคูณ',
        '```python',
        'n = 3',
        'for i in range(1, 13):',
        '    print(f"{n} x {i} = {n * i}")',
        '```',
        '',
        '## while: วนซ้ำตราบที่เงื่อนไขยังเป็นจริง',
        'ใช้เมื่อไม่รู้ล่วงหน้าว่าต้องวนกี่รอบ **ต้องเปลี่ยนค่าในลูป** ไม่อย่างนั้นจะวนไม่รู้จบ (ตัวจำลองจะหยุดให้อัตโนมัติ)',
        '',
        '```python',
        'money = 100',
        'day = 0',
        'while money > 0:',
        '    money = money - 30',
        '    day = day + 1',
        'print("เงินหมดในวันที่", day)',
        '```',
        '',
        '## break: ออกจากลูปทันที',
        '```python',
        'while True:',
        '    x = int(input())',
        '    if x == 0:',
        '        break',
        '    print("ได้รับ", x)',
        'print("จบ")',
        '```',
        '> ใส่ข้อมูลนำเข้า 5 / 8 / 0 (บรรทัดละค่า) แล้วรันดู'
      ) } },
      { id: 'U4-W', order: 2, type: 'worksheet', title: 'ใบงานที่ 4: สูตรคูณและผลรวม', data: {
        intro: 'ใช้ for กับ range() (ส่งได้ 3 ครั้ง)',
        maxAttempts: 3,
        tasks: [
          { title: 'ข้อ 1 สูตรคูณแม่ n', prompt: L_('รับจำนวนเต็ม n แล้วแสดงสูตรคูณแม่ n ตั้งแต่ 1 ถึง 12 รูปแบบ `n x i = ผลลัพธ์`', '', 'ตัวอย่าง ข้อมูลนำเข้า `2` ผลลัพธ์ 12 บรรทัด', '```text', '2 x 1 = 2', '2 x 2 = 4', '...', '2 x 12 = 24', '```'),
            starterCode: 'n = int(input())\n', sampleInput: '2',
            hints: ['for i in range(1, 13):', 'print(f"{n} x {i} = {n * i}")'],
            solution: L_('n = int(input())', 'for i in range(1, 13):', '    print(f"{n} x {i} = {n * i}")'),
            tests: [{ input: '2', expected: mulTable_(2), score: 2 }, { input: '7', expected: mulTable_(7), score: 2, hidden: true }, { input: '12', expected: mulTable_(12), score: 1, hidden: true }] },
          { title: 'ข้อ 2 ผลรวม 1 ถึง n', prompt: L_('รับจำนวนเต็ม n แล้วแสดงผลรวมของ 1 + 2 + ... + n', '', '| ข้อมูลนำเข้า | ผลลัพธ์ |', '|---|---|', '| `10` | `55` |'),
            starterCode: L_('n = int(input())', 'total = 0', ''), sampleInput: '10',
            hints: ['วน for i in range(1, n + 1): แล้ว total = total + i', 'print(total) ไว้นอกลูป (ไม่ย่อหน้า)'],
            solution: L_('n = int(input())', 'total = 0', 'for i in range(1, n + 1):', '    total = total + i', 'print(total)'),
            tests: [{ input: '10', expected: '55', score: 2 }, { input: '1', expected: '1', score: 1 }, { input: '100', expected: '5050', score: 2, hidden: true }] }
        ] } },
      { id: 'U4-P', order: 3, type: 'practice', title: 'แบบฝึกปฏิบัติที่ 4: จรวดและเครื่องคิดเงิน', data: {
        intro: 'ฝึกได้ไม่จำกัดครั้ง ถ้าโปรแกรมวนไม่รู้จบ ตัวจำลองจะหยุดให้เองใน 5 วินาที',
        tasks: [
          { title: 'ข้อ 1 นับถอยหลังปล่อยจรวด', prompt: L_('รับจำนวนเต็ม n แล้วแสดง n ลดลงทีละ 1 จนถึง 1 จากนั้นแสดง `ปล่อยจรวด!`', '', 'ข้อมูลนำเข้า `3`', '```text', '3', '2', '1', 'ปล่อยจรวด!', '```'),
            starterCode: 'n = int(input())\n', sampleInput: '3',
            hints: ['range(n, 0, -1) ได้ n, n-1, ..., 1'],
            solution: L_('n = int(input())', 'for i in range(n, 0, -1):', '    print(i)', 'print("ปล่อยจรวด!")'),
            tests: [{ input: '3', expected: '3\n2\n1\nปล่อยจรวด!', score: 2 }, { input: '5', expected: '5\n4\n3\n2\n1\nปล่อยจรวด!', score: 2, hidden: true }, { input: '1', expected: '1\nปล่อยจรวด!', score: 1, hidden: true }] },
          { title: 'ข้อ 2 เครื่องคิดเงินหน้าร้าน', prompt: L_('รับราคาสินค้าทีละบรรทัด (จำนวนเต็ม) จนกว่าจะพบ `0` จึงหยุด แล้วแสดง 2 บรรทัด', '```text', 'จำนวน 3 ชิ้น', 'รวม 145 บาท', '```', 'เมื่อข้อมูลนำเข้าคือ `50` `25` `70` `0`'),
            starterCode: L_('count = 0', 'total = 0', 'while True:', '    price = int(input())', '    # เขียนต่อ', ''), sampleInput: '50\n25\n70\n0',
            hints: ['if price == 0: break', 'นอกจากนั้น count = count + 1 และ total = total + price'],
            solution: L_('count = 0', 'total = 0', 'while True:', '    price = int(input())', '    if price == 0:', '        break', '    count += 1', '    total += price', 'print(f"จำนวน {count} ชิ้น")', 'print(f"รวม {total} บาท")'),
            tests: [{ input: '50\n25\n70\n0', expected: 'จำนวน 3 ชิ้น\nรวม 145 บาท', score: 2 }, { input: '0', expected: 'จำนวน 0 ชิ้น\nรวม 0 บาท', score: 1, hidden: true }, { input: '199\n1\n0', expected: 'จำนวน 2 ชิ้น\nรวม 200 บาท', score: 2, hidden: true }] }
        ] } },
      { id: 'U4-Q', order: 4, type: 'quiz', title: 'แบบทดสอบภารกิจที่ 4', data: {
        intro: 'แบบทดสอบ 6 ข้อ เวลา 10 นาที ทำได้ 2 ครั้ง ข้อที่ผลลัพธ์มีหลายบรรทัด ให้พิมพ์บรรทัดละค่า',
        timeLimitMin: 10, maxAttempts: 2, shuffle: true,
        questions: [
          { id: 'q1', type: 'output', text: 'ผลลัพธ์คืออะไร (หลายบรรทัด)', code: 'for i in range(3):\n    print(i)', answer: '0\n1\n2', score: 1, explain: 'range(3) คือ 0, 1, 2' },
          { id: 'q2', type: 'mc', text: 'range(1, 5) มีตัวเลขกี่ตัว', choices: ['3', '4', '5', '6'], answer: 1, score: 1, explain: '1, 2, 3, 4 (ไม่รวม 5)' },
          { id: 'q3', type: 'output', text: 'ผลลัพธ์คืออะไร', code: 'total = 0\nfor i in range(1, 5):\n    total += i\nprint(total)', answer: '10', score: 1, explain: '1+2+3+4 = 10' },
          { id: 'q4', type: 'tf', text: 'ลูป while อาจวนไม่รู้จบได้ ถ้าเงื่อนไขไม่เคยเป็นเท็จ', answer: true, score: 1, explain: 'ต้องเปลี่ยนค่าในลูปให้เงื่อนไขเป็นเท็จได้ หรือใช้ break' },
          { id: 'q5', type: 'mc', text: 'คำสั่งใดใช้ออกจากลูปทันที', choices: ['stop', 'exit loop', 'break', 'return loop'], answer: 2, score: 1, explain: 'break ออกจากลูปที่อยู่ใกล้ที่สุด' },
          { id: 'q6', type: 'fill', text: 'ฟังก์ชันที่ใช้สร้างลำดับตัวเลขให้ for วนซ้ำคือ ____', answer: ['range', 'range()'], score: 1, explain: 'range(start, stop, step)' }
        ] } }
    ]
  };
}

/* ======================= ภารกิจที่ 5 ======================= */
function unit5_() {
  return {
    id: 'U5', order: 5, icon: '🧰', title: 'ลิสต์และฟังก์ชัน',
    mission: 'เก็บข้อมูลหลายค่าในลิสต์ และสร้างคำสั่งใช้เองด้วยฟังก์ชัน',
    summary: 'list • len() append() • split() • def / return',
    activities: [
      { id: 'U5-K', order: 1, type: 'knowledge', title: 'ใบความรู้ที่ 5: ลิสต์และฟังก์ชัน', data: { content: L_(
        '# ลิสต์ (list): เก็บหลายค่าในตัวแปรเดียว',
        '```python',
        'scores = [70, 85, 92]',
        'print(scores[0])      # ตำแหน่งแรกคือ 0',
        'print(scores[-1])     # ตัวสุดท้าย',
        'print(len(scores))    # จำนวนสมาชิก',
        'scores.append(60)     # เพิ่มต่อท้าย',
        'print(scores)',
        'print(sum(scores), max(scores), min(scores))',
        '```',
        '',
        '## วนลูปทุกสมาชิกในลิสต์',
        '```python',
        'fruits = ["มะม่วง", "ทุเรียน", "มังคุด"]',
        'for f in fruits:',
        '    print("ฉันชอบ", f)',
        '```',
        '',
        '## รับตัวเลขหลายค่าในบรรทัดเดียวด้วย split()',
        '`split()` แยกข้อความตามช่องว่างได้เป็นลิสต์ของข้อความ แล้วแปลงเป็นตัวเลขทีละตัว',
        '```python',
        'line = input()            # เช่น 10 20 30',
        'nums = []',
        'for x in line.split():',
        '    nums.append(int(x))',
        'print(nums, sum(nums))',
        '```',
        '',
        '## ฟังก์ชัน: สร้างคำสั่งใช้เอง',
        'ใช้ `def` ตั้งชื่อฟังก์ชัน รับค่าผ่าน **พารามิเตอร์** และส่งผลกลับด้วย `return`',
        '```python',
        'def area(w, h):',
        '    return w * h',
        '',
        'print(area(3, 4))',
        'print(area(10, 2) + 5)',
        '```',
        '',
        '> 💡 กด **👣 ทีละบรรทัด** สังเกตว่าเมื่อเรียก `area(3, 4)` โปรแกรมกระโดดเข้าไปในฟังก์ชัน แล้วกลับออกมาพร้อมค่า 12',
        '',
        '## ฟังก์ชันที่คืนค่า True / False',
        '```python',
        'def is_even(n):',
        '    return n % 2 == 0',
        '',
        'for x in [3, 8, 11, 20]:',
        '    if is_even(x):',
        '        print(x, "เป็นเลขคู่")',
        '```'
      ) } },
      { id: 'U5-W', order: 2, type: 'worksheet', title: 'ใบงานที่ 5: ฟังก์ชันและค่าเฉลี่ย', data: {
        intro: 'ใช้ def และ return (ส่งได้ 3 ครั้ง)',
        maxAttempts: 3,
        tasks: [
          { title: 'ข้อ 1 ฟังก์ชันคำนวณภาษี VAT', prompt: L_('เขียนฟังก์ชัน `vat(price)` คืนค่าภาษี 7% ของราคา', 'รับราคา 1 บรรทัด แล้วแสดงภาษีทศนิยม 2 ตำแหน่ง', '', '| ข้อมูลนำเข้า | ผลลัพธ์ |', '|---|---|', '| `100` | `7.00` |', '| `250` | `17.50` |'),
            starterCode: L_('def vat(price):', '    return 0   # แก้ให้ถูก', '', 'p = float(input())', 'print(f"{vat(p):.2f}")', ''), sampleInput: '100',
            hints: ['7% = 0.07 → return price * 0.07'],
            solution: L_('def vat(price):', '    return price * 0.07', '', 'p = float(input())', 'print(f"{vat(p):.2f}")'),
            tests: [{ input: '100', expected: '7.00', score: 2, compare: 'number' }, { input: '250', expected: '17.50', score: 1, compare: 'number' }, { input: '999', expected: '69.93', score: 2, compare: 'number', hidden: true }] },
          { title: 'ข้อ 2 ค่าเฉลี่ยคะแนน', prompt: L_('รับคะแนนหลายค่าในบรรทัดเดียว คั่นด้วยช่องว่าง แล้วแสดง 2 บรรทัด: คะแนนสูงสุด และค่าเฉลี่ยทศนิยม 2 ตำแหน่ง', '', 'ข้อมูลนำเข้า `70 80 95`', '```text', 'สูงสุด 95', 'เฉลี่ย 81.67', '```'),
            starterCode: L_('line = input()', 'scores = []', 'for x in line.split():', '    scores.append(int(x))', ''), sampleInput: '70 80 95',
            hints: ['ใช้ max(scores) และ sum(scores) / len(scores)', 'print(f"เฉลี่ย {avg:.2f}")'],
            solution: L_('line = input()', 'scores = []', 'for x in line.split():', '    scores.append(int(x))', 'avg = sum(scores) / len(scores)', 'print(f"สูงสุด {max(scores)}")', 'print(f"เฉลี่ย {avg:.2f}")'),
            tests: [{ input: '70 80 95', expected: 'สูงสุด 95\nเฉลี่ย 81.67', score: 2 }, { input: '50', expected: 'สูงสุด 50\nเฉลี่ย 50.00', score: 1, hidden: true }, { input: '10 20 30 40', expected: 'สูงสุด 40\nเฉลี่ย 25.00', score: 2, hidden: true }] }
        ] } },
      { id: 'U5-P', order: 3, type: 'practice', title: 'แบบฝึกปฏิบัติที่ 5: นักสืบตัวเลข', data: {
        intro: 'ฝึกได้ไม่จำกัดครั้ง',
        tasks: [
          { title: 'ข้อ 1 นับเลขคู่ในลิสต์', prompt: L_('รับจำนวนเต็มหลายค่าในบรรทัดเดียว แล้วแสดงว่ามีเลขคู่กี่ตัว', '', '| ข้อมูลนำเข้า | ผลลัพธ์ |', '|---|---|', '| `1 2 3 4 6` | `3` |'),
            starterCode: L_('nums = []', 'for x in input().split():', '    nums.append(int(x))', ''), sampleInput: '1 2 3 4 6',
            hints: ['สร้าง count = 0 แล้ววน for n in nums: ถ้า n % 2 == 0 ให้ count += 1'],
            solution: L_('nums = []', 'for x in input().split():', '    nums.append(int(x))', 'count = 0', 'for n in nums:', '    if n % 2 == 0:', '        count += 1', 'print(count)'),
            tests: [{ input: '1 2 3 4 6', expected: '3', score: 2 }, { input: '1 3 5', expected: '0', score: 1, hidden: true }, { input: '0 -2 8 7', expected: '3', score: 2, hidden: true }] },
          { title: 'ข้อ 2 จำนวนเฉพาะ', prompt: L_('เขียนฟังก์ชัน `is_prime(n)` คืนค่า True ถ้า n เป็นจำนวนเฉพาะ (มากกว่า 1 และหารลงตัวด้วย 1 กับตัวมันเองเท่านั้น)', 'รับ n แล้วแสดง `เป็นจำนวนเฉพาะ` หรือ `ไม่เป็นจำนวนเฉพาะ`'),
            starterCode: L_('def is_prime(n):', '    # เขียนตรงนี้', '    return False', '', 'n = int(input())', 'if is_prime(n):', '    print("เป็นจำนวนเฉพาะ")', 'else:', '    print("ไม่เป็นจำนวนเฉพาะ")', ''), sampleInput: '7',
            hints: ['ถ้า n < 2 ให้ return False ทันที', 'วน for i in range(2, n): ถ้า n % i == 0 ให้ return False ถ้าวนครบให้ return True'],
            solution: L_('def is_prime(n):', '    if n < 2:', '        return False', '    for i in range(2, n):', '        if n % i == 0:', '            return False', '    return True', '', 'n = int(input())', 'if is_prime(n):', '    print("เป็นจำนวนเฉพาะ")', 'else:', '    print("ไม่เป็นจำนวนเฉพาะ")'),
            tests: [{ input: '7', expected: 'เป็นจำนวนเฉพาะ', score: 1 }, { input: '9', expected: 'ไม่เป็นจำนวนเฉพาะ', score: 1 }, { input: '1', expected: 'ไม่เป็นจำนวนเฉพาะ', score: 1, hidden: true }, { input: '2', expected: 'เป็นจำนวนเฉพาะ', score: 1, hidden: true }, { input: '97', expected: 'เป็นจำนวนเฉพาะ', score: 1, hidden: true }] }
        ] } },
      { id: 'U5-Q', order: 4, type: 'quiz', title: 'แบบทดสอบภารกิจที่ 5', data: {
        intro: 'แบบทดสอบ 6 ข้อ เวลา 10 นาที ทำได้ 2 ครั้ง',
        timeLimitMin: 10, maxAttempts: 2, shuffle: true,
        questions: [
          { id: 'q1', type: 'output', text: 'ผลลัพธ์คืออะไร', code: 'nums = [3, 5, 7]\nprint(nums[1])', answer: '5', score: 1, explain: 'ตำแหน่งเริ่มที่ 0 → nums[1] คือตัวที่สอง' },
          { id: 'q2', type: 'output', text: 'ผลลัพธ์คืออะไร', code: 'print(len([1, 2, 3, 4]))', answer: '4', score: 1, explain: 'len() นับจำนวนสมาชิก' },
          { id: 'q3', type: 'tf', text: 'ตำแหน่งแรกของลิสต์ใน Python คือตำแหน่งที่ 1', answer: false, score: 1, explain: 'ตำแหน่งแรกคือ 0' },
          { id: 'q4', type: 'mc', text: 'คำสั่งใดเพิ่มค่า 9 ต่อท้ายลิสต์ a', choices: ['a.add(9)', 'a.append(9)', 'a.push(9)', 'a + 9'], answer: 1, score: 1, explain: 'list ใช้ append()' },
          { id: 'q5', type: 'output', text: 'ผลลัพธ์คืออะไร', code: 'def f(x):\n    return x * 2\n\nprint(f(4) + 1)', answer: '9', score: 1, explain: 'f(4) คืนค่า 8 แล้วบวก 1' },
          { id: 'q6', type: 'fill', text: 'คำที่ใช้ประกาศ (สร้าง) ฟังก์ชันใน Python คือ ____', answer: ['def'], score: 1, explain: 'def ชื่อฟังก์ชัน(พารามิเตอร์):' }
        ] } }
    ]
  };
}

function mulTable_(n) { var r = []; for (var i = 1; i <= 12; i++) r.push(n + ' x ' + i + ' = ' + (n * i)); return r.join('\n'); }

/** นักศึกษาตัวอย่าง (PIN ของทุกคนคือ 1234 — ลบได้จากเมนู ล้างข้อมูลตัวอย่าง) */
function getSampleStudents_() {
  var names = [['นาย', 'ธนพล', 'ใจดี'], ['นางสาว', 'กมลชนก', 'สุขสันต์'], ['นาย', 'ณัฐวุฒิ', 'รักเรียน'], ['นางสาว', 'พิมพ์ชนก', 'มีสุข'], ['นาย', 'ภูมิพัฒน์', 'ศรีทอง'],
    ['นางสาว', 'ศิริพร', 'แก้วใส'], ['นาย', 'อนุชา', 'บุญมา'], ['นางสาว', 'ปวีณา', 'ทองดี'], ['นาย', 'กิตติพัฒน์', 'วงศ์ใหญ่'], ['นางสาว', 'วรรณิศา', 'เพชรงาม']];
  return names.map(function (n, i) {
    return { studentCode: '6920100' + ('0' + (i + 1)).slice(-2), prefix: n[0], firstName: n[1], lastName: n[2], room: i < 5 ? 'ปวช.1/1' : 'ปวช.1/2' };
  });
}
