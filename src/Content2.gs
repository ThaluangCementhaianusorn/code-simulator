/**
 * Content2.gs — เนื้อหาภารกิจที่ 6–10 (ต่อจาก Content.gs)
 * ข้อความ • ลูปซ้อน • ดิกชันนารี • try/except • โปรเจกต์รวมระบบร้านค้า
 */

/* ======================= ภารกิจที่ 6 ======================= */
function unit6_() {
  return {
    id: 'U6', order: 6, icon: '🔤', title: 'จัดการข้อความ (String)',
    mission: 'ตัด ต่อ ค้นหา และแปลงข้อความ เหมือนโปรแกรมตรวจคำในชีวิตจริง',
    summary: 'len() • ตำแหน่งและการตัด [a:b] • upper() lower() replace() • in • วนลูปทีละตัวอักษร',
    activities: [
      { id: 'U6-K', order: 1, type: 'knowledge', title: 'ใบความรู้ที่ 6: ข้อความ (String)', data: { content: L_(
        '# ข้อความคือลำดับของตัวอักษร',
        'ทุกตัวอักษรในข้อความมี **ตำแหน่ง (index)** เริ่มที่ 0 และนับจากท้ายได้ด้วยเลขติดลบ',
        '',
        '| ตัวอักษร | P | y | t | h | o | n |',
        '|---|---|---|---|---|---|---|',
        '| ตำแหน่ง | 0 | 1 | 2 | 3 | 4 | 5 |',
        '| นับจากท้าย | -6 | -5 | -4 | -3 | -2 | -1 |',
        '',
        '```python',
        'word = "Python"',
        'print(len(word))',
        'print(word[0], word[-1])',
        'print(word[0:3])    # ตำแหน่ง 0 ถึง 2',
        'print(word[2:])     # ตั้งแต่ตำแหน่ง 2 จนจบ',
        'print(word[::-1])   # กลับข้อความ',
        '```',
        '',
        '## คำสั่ง (method) ที่ใช้บ่อย',
        '| คำสั่ง | ผลลัพธ์ของ `"Hello World"` |',
        '|---|---|',
        '| `.upper()` | HELLO WORLD |',
        '| `.lower()` | hello world |',
        '| `.replace("World", "Thai")` | Hello Thai |',
        '| `.count("o")` | 2 |',
        '| `.split()` | [\'Hello\', \'World\'] |',
        '| `"World" in s` | True |',
        '',
        '```python',
        's = "Hello World"',
        'print(s.upper())',
        'print(s.replace("World", "Thai"))',
        'print(s.count("o"))',
        'print("World" in s)',
        '```',
        '',
        '## วนลูปทีละตัวอักษร',
        '```python',
        'text = "banana"',
        'count = 0',
        'for ch in text:',
        '    if ch == "a":',
        '        count += 1',
        'print("มีตัว a", count, "ตัว")',
        '```',
        '',
        '> ⚠️ ข้อความแก้ไขทีละตัวไม่ได้ (`s[0] = "A"` จะ error) ต้องสร้างข้อความใหม่ เช่น `s = "A" + s[1:]`',
        '',
        '```python',
        's = "cat"',
        's = "C" + s[1:]',
        'print(s)',
        '```'
      ) } },
      { id: 'U6-W', order: 2, type: 'worksheet', title: 'ใบงานที่ 6: ตรวจข้อความ', data: {
        intro: 'ใช้ตำแหน่ง len() และการวนลูปทีละตัวอักษร (ส่งได้ 3 ครั้ง)', maxAttempts: 3,
        tasks: [
          { title: 'ข้อ 1 ตัวแรก ตัวสุดท้าย และความยาว', prompt: L_('รับคำภาษาอังกฤษ 1 คำ แล้วแสดง 3 บรรทัด', '', 'ข้อมูลนำเข้า `Python`', '```text', 'ตัวแรก: P', 'ตัวสุดท้าย: n', 'ยาว 6 ตัวอักษร', '```'),
            starterCode: 'word = input()\n', sampleInput: 'Python',
            hints: ['ตัวแรกคือ word[0] ตัวสุดท้ายคือ word[-1]', 'ความยาวใช้ len(word)'],
            solution: L_('word = input()', 'print(f"ตัวแรก: {word[0]}")', 'print(f"ตัวสุดท้าย: {word[-1]}")', 'print(f"ยาว {len(word)} ตัวอักษร")'),
            tests: [{ input: 'Python', expected: 'ตัวแรก: P\nตัวสุดท้าย: n\nยาว 6 ตัวอักษร', score: 2 }, { input: 'a', expected: 'ตัวแรก: a\nตัวสุดท้าย: a\nยาว 1 ตัวอักษร', score: 1, hidden: true }, { input: 'Computer', expected: 'ตัวแรก: C\nตัวสุดท้าย: r\nยาว 8 ตัวอักษร', score: 2, hidden: true }] },
          { title: 'ข้อ 2 นับสระภาษาอังกฤษ', prompt: L_('รับข้อความ 1 บรรทัด นับจำนวนสระ a e i o u (ตัวพิมพ์ใหญ่หรือเล็กก็นับ) แล้วแสดงจำนวน', '', '| ข้อมูลนำเข้า | ผลลัพธ์ |', '|---|---|', '| `Hello World` | `3` |'),
            starterCode: L_('text = input()', 'count = 0', ''), sampleInput: 'Hello World',
            hints: ['แปลงเป็นตัวเล็กก่อน: text.lower()', 'for ch in text.lower(): if ch in "aeiou": count += 1'],
            solution: L_('text = input()', 'count = 0', 'for ch in text.lower():', '    if ch in "aeiou":', '        count += 1', 'print(count)'),
            tests: [{ input: 'Hello World', expected: '3', score: 2 }, { input: 'PYTHON', expected: '1', score: 2, hidden: true }, { input: 'sky', expected: '0', score: 1, hidden: true }] }
        ] } },
      { id: 'U6-P', order: 3, type: 'practice', title: 'แบบฝึกปฏิบัติที่ 6: กลับคำและพาลินโดรม', data: {
        intro: 'ฝึกได้ไม่จำกัดครั้ง',
        tasks: [
          { title: 'ข้อ 1 กลับข้อความ', prompt: L_('รับข้อความ แล้วแสดงข้อความนั้นแบบกลับหลัง', '', '| ข้อมูลนำเข้า | ผลลัพธ์ |', '|---|---|', '| `abc` | `cba` |'),
            starterCode: 's = input()\n', sampleInput: 'abc',
            hints: ['ใช้การตัดแบบถอยหลัง s[::-1]'],
            solution: L_('s = input()', 'print(s[::-1])'),
            tests: [{ input: 'abc', expected: 'cba', score: 2 }, { input: 'Python', expected: 'nohtyP', score: 2, hidden: true }, { input: 'a', expected: 'a', score: 1, hidden: true }] },
          { title: 'ข้อ 2 พาลินโดรม', prompt: L_('คำที่อ่านจากหน้าไปหลังและหลังไปหน้าเหมือนกัน (ไม่สนตัวพิมพ์ใหญ่-เล็ก) เรียกว่า **พาลินโดรม**', 'รับคำ 1 คำ แสดง `เป็นพาลินโดรม` หรือ `ไม่เป็นพาลินโดรม`', '', '| ข้อมูลนำเข้า | ผลลัพธ์ |', '|---|---|', '| `Level` | `เป็นพาลินโดรม` |', '| `hello` | `ไม่เป็นพาลินโดรม` |'),
            starterCode: 'word = input()\n', sampleInput: 'Level',
            hints: ['w = word.lower() แล้วเทียบ w == w[::-1]'],
            solution: L_('word = input().lower()', 'if word == word[::-1]:', '    print("เป็นพาลินโดรม")', 'else:', '    print("ไม่เป็นพาลินโดรม")'),
            tests: [{ input: 'Level', expected: 'เป็นพาลินโดรม', score: 1 }, { input: 'hello', expected: 'ไม่เป็นพาลินโดรม', score: 1 }, { input: 'a', expected: 'เป็นพาลินโดรม', score: 1, hidden: true }, { input: 'Racecar', expected: 'เป็นพาลินโดรม', score: 1, hidden: true }, { input: 'ab', expected: 'ไม่เป็นพาลินโดรม', score: 1, hidden: true }] }
        ] } },
      { id: 'U6-Q', order: 4, type: 'quiz', title: 'แบบทดสอบภารกิจที่ 6', data: {
        intro: 'แบบทดสอบ 6 ข้อ เวลา 10 นาที ทำได้ 2 ครั้ง', timeLimitMin: 10, maxAttempts: 2, shuffle: true,
        questions: [
          { id: 'q1', type: 'output', text: 'ผลลัพธ์คืออะไร', code: 'print(len("hello"))', answer: '5', score: 1, explain: 'h e l l o = 5 ตัวอักษร' },
          { id: 'q2', type: 'output', text: 'ผลลัพธ์คืออะไร', code: 'print("Python"[0])', answer: 'P', score: 1, explain: 'ตำแหน่งแรกคือ 0' },
          { id: 'q3', type: 'output', text: 'ผลลัพธ์คืออะไร', code: 'print("abcdef"[1:4])', answer: 'bcd', score: 1, explain: 'ตำแหน่ง 1 ถึง 3 (ไม่รวม 4)' },
          { id: 'q4', type: 'output', text: 'ผลลัพธ์คืออะไร', code: 'print("hi".upper())', answer: 'HI', score: 1, explain: 'upper() เปลี่ยนเป็นตัวพิมพ์ใหญ่' },
          { id: 'q5', type: 'tf', text: 'เขียน s[0] = "A" เพื่อแก้ตัวอักษรแรกของข้อความได้', answer: false, score: 1, explain: 'ข้อความแก้ทีละตัวไม่ได้ ต้องสร้างข้อความใหม่' },
          { id: 'q6', type: 'fill', text: 'คำสั่งที่ใช้แทนที่คำในข้อความ เช่น s.____("a", "b") คือ', answer: ['replace'], score: 1, explain: 'replace(เดิม, ใหม่)' }
        ] } }
    ]
  };
}

/* ======================= ภารกิจที่ 7 ======================= */
function unit7_() {
  return {
    id: 'U7', order: 7, icon: '🔷', title: 'ลูปซ้อนและการวาดรูปแบบ',
    mission: 'ใช้ลูปซ้อนลูปสร้างตาราง รูปทรง และรูปแบบตัวเลข',
    summary: 'for ซ้อน for • print(end="") • สร้างตารางและรูปทรงจากดาว',
    activities: [
      { id: 'U7-K', order: 1, type: 'knowledge', title: 'ใบความรู้ที่ 7: ลูปซ้อน', data: { content: L_(
        '# ลูปซ้อนลูป',
        'ลูปด้านใน **ทำงานครบทุกรอบ** ทุกครั้งที่ลูปด้านนอกทำงาน 1 รอบ ถ้าลูปนอก 3 รอบ ลูปใน 4 รอบ จะทำงานทั้งหมด 3 × 4 = 12 ครั้ง',
        '',
        '```python',
        'for i in range(1, 4):',
        '    for j in range(1, 3):',
        '        print("i =", i, "j =", j)',
        '```',
        '',
        '> 💡 กด **👣 ทีละบรรทัด** ที่โค้ดด้านบน ดูว่า j กลับไปเริ่มที่ 1 ใหม่ทุกครั้งที่ i เปลี่ยน',
        '',
        '## print ไม่ขึ้นบรรทัดใหม่ด้วย end',
        'ปกติ print จะขึ้นบรรทัดใหม่เสมอ ถ้าใส่ `end=""` จะพิมพ์ต่อกันในบรรทัดเดิม',
        '```python',
        'print("A", end="")',
        'print("B", end=" ")',
        'print("C")',
        'print("D")',
        '```',
        '',
        '## สร้างสี่เหลี่ยมและสามเหลี่ยม',
        '```python',
        'n = 4',
        'for row in range(n):',
        '    for col in range(n):',
        '        print("*", end="")',
        '    print()          # จบแถว ขึ้นบรรทัดใหม่',
        '',
        'for row in range(1, n + 1):',
        '    print("*" * row)',
        '```',
        '',
        '## ตารางสูตรคูณ',
        'ใช้ `" ".join(...)` รวมตัวเลขในแถวเดียวกันโดยคั่นด้วยช่องว่าง',
        '```python',
        'n = 4',
        'for i in range(1, n + 1):',
        '    row = []',
        '    for j in range(1, n + 1):',
        '        row.append(str(i * j))',
        '    print(" ".join(row))',
        '```',
        '',
        '## ปิรามิดจัดกึ่งกลาง',
        'แถวที่ i มีช่องว่าง n - i ช่อง และดาว 2i - 1 ดวง',
        '```python',
        'n = 3',
        'for i in range(1, n + 1):',
        '    print(" " * (n - i) + "*" * (2 * i - 1))',
        '```'
      ) } },
      { id: 'U7-W', order: 2, type: 'worksheet', title: 'ใบงานที่ 7: วาดรูปด้วยลูปซ้อน', data: {
        intro: 'ระวังช่องว่างและการขึ้นบรรทัด (ส่งได้ 3 ครั้ง)', maxAttempts: 3,
        tasks: [
          { title: 'ข้อ 1 สี่เหลี่ยมดาว n × n', prompt: L_('รับจำนวนเต็ม n แล้วแสดงดาว n แถว แถวละ n ดวง', '', 'ข้อมูลนำเข้า `3`', '```text', '***', '***', '***', '```'),
            starterCode: 'n = int(input())\n', sampleInput: '3',
            hints: ['ลูปนอกวน n แถว ลูปในพิมพ์ "*" n ครั้งด้วย end=""', 'จบแต่ละแถวด้วย print()'],
            solution: L_('n = int(input())', 'for i in range(n):', '    for j in range(n):', '        print("*", end="")', '    print()'),
            tests: [{ input: '3', expected: '***\n***\n***', score: 2 }, { input: '1', expected: '*', score: 1, hidden: true }, { input: '5', expected: '*****\n*****\n*****\n*****\n*****', score: 2, hidden: true }] },
          { title: 'ข้อ 2 สามเหลี่ยมตัวเลข', prompt: L_('รับ n แล้วแสดง n แถว แถวที่ i มีตัวเลข 1 ถึง i คั่นด้วยช่องว่าง', '', 'ข้อมูลนำเข้า `3`', '```text', '1', '1 2', '1 2 3', '```'),
            starterCode: 'n = int(input())\n', sampleInput: '3',
            hints: ['ลูปนอก i = 1..n ลูปใน j = 1..i', 'เก็บตัวเลขในลิสต์ แล้ว print(" ".join(row))'],
            solution: L_('n = int(input())', 'for i in range(1, n + 1):', '    row = []', '    for j in range(1, i + 1):', '        row.append(str(j))', '    print(" ".join(row))'),
            tests: [{ input: '3', expected: '1\n1 2\n1 2 3', score: 2 }, { input: '1', expected: '1', score: 1, hidden: true }, { input: '5', expected: '1\n1 2\n1 2 3\n1 2 3 4\n1 2 3 4 5', score: 2, hidden: true }] }
        ] } },
      { id: 'U7-P', order: 3, type: 'practice', title: 'แบบฝึกปฏิบัติที่ 7: ตารางและปิรามิด', data: {
        intro: 'ฝึกได้ไม่จำกัดครั้ง',
        tasks: [
          { title: 'ข้อ 1 ตารางสูตรคูณ n × n', prompt: L_('รับ n แล้วแสดงตาราง n แถว แถวที่ i คือ i×1 ถึง i×n คั่นด้วยช่องว่าง', '', 'ข้อมูลนำเข้า `3`', '```text', '1 2 3', '2 4 6', '3 6 9', '```'),
            starterCode: 'n = int(input())\n', sampleInput: '3',
            hints: ['ค่าในแถว i คอลัมน์ j คือ i * j', 'ใช้ str() แปลงก่อน join'],
            solution: L_('n = int(input())', 'for i in range(1, n + 1):', '    print(" ".join(str(i * j) for j in range(1, n + 1)))'),
            tests: [{ input: '3', expected: '1 2 3\n2 4 6\n3 6 9', score: 2 }, { input: '1', expected: '1', score: 1, hidden: true }, { input: '4', expected: '1 2 3 4\n2 4 6 8\n3 6 9 12\n4 8 12 16', score: 2, hidden: true }] },
          { title: 'ข้อ 2 ปิรามิดดาว', prompt: L_('รับ n แล้วแสดงปิรามิดสูง n แถว จัดกึ่งกลาง (มีช่องว่างนำหน้า ไม่ต้องมีช่องว่างต่อท้าย)', '', 'ข้อมูลนำเข้า `3`', '```text', '  *', ' ***', '*****', '```'),
            starterCode: 'n = int(input())\n', sampleInput: '3',
            hints: ['แถวที่ i มีช่องว่าง n - i ช่อง', 'และดาว 2 * i - 1 ดวง'],
            solution: L_('n = int(input())', 'for i in range(1, n + 1):', '    print(" " * (n - i) + "*" * (2 * i - 1))'),
            tests: [{ input: '3', expected: '  *\n ***\n*****', score: 2 }, { input: '1', expected: '*', score: 1, hidden: true }, { input: '4', expected: '   *\n  ***\n *****\n*******', score: 2, hidden: true }] }
        ] } },
      { id: 'U7-Q', order: 4, type: 'quiz', title: 'แบบทดสอบภารกิจที่ 7', data: {
        intro: 'แบบทดสอบ 6 ข้อ เวลา 10 นาที ทำได้ 2 ครั้ง', timeLimitMin: 10, maxAttempts: 2, shuffle: true,
        questions: [
          { id: 'q1', type: 'output', text: 'ผลลัพธ์คืออะไร', code: 'c = 0\nfor i in range(3):\n    for j in range(4):\n        c += 1\nprint(c)', answer: '12', score: 1, explain: 'ลูปใน 4 รอบ × ลูปนอก 3 รอบ = 12' },
          { id: 'q2', type: 'output', text: 'ผลลัพธ์คืออะไร', code: 'print("a", end="")\nprint("b")', answer: 'ab', score: 1, explain: 'end="" ทำให้ไม่ขึ้นบรรทัดใหม่' },
          { id: 'q3', type: 'mc', text: 'print("x", end="") ต่างจาก print("x") อย่างไร', choices: ['พิมพ์ตัว x สองครั้ง', 'ไม่ขึ้นบรรทัดใหม่หลังพิมพ์', 'พิมพ์ตัวพิมพ์ใหญ่', 'ไม่แสดงผล'], answer: 1, score: 1, explain: 'end คือสิ่งที่พิมพ์ต่อท้าย ค่าเริ่มต้นคือขึ้นบรรทัดใหม่' },
          { id: 'q4', type: 'tf', text: 'ลูปด้านในทำงานครบทุกรอบ ทุกครั้งที่ลูปด้านนอกทำงาน 1 รอบ', answer: true, score: 1, explain: 'จึงทำงานทั้งหมด = รอบนอก × รอบใน' },
          { id: 'q5', type: 'output', text: 'ผลลัพธ์คืออะไร (หลายบรรทัด)', code: 'for i in range(1, 4):\n    print("*" * i)', answer: '*\n**\n***', score: 1, explain: '"*" * i คือดาว i ดวง' },
          { id: 'q6', type: 'fill', text: 'พารามิเตอร์ของ print ที่ใช้กำหนดสิ่งที่พิมพ์ต่อท้าย (ใช้ทำให้ไม่ขึ้นบรรทัดใหม่) คือ ____', answer: ['end'], score: 1, explain: 'print(..., end="")' }
        ] } }
    ]
  };
}

/* ======================= ภารกิจที่ 8 ======================= */
function unit8_() {
  return {
    id: 'U8', order: 8, icon: '📒', title: 'ดิกชันนารี (Dictionary)',
    mission: 'เก็บข้อมูลแบบคู่ "คีย์ : ค่า" เหมือนสมุดราคาสินค้าหรือสมุดรายชื่อ',
    summary: '{คีย์: ค่า} • เพิ่ม/แก้/ค้นหา • get() • in • วนลูป items() • นับความถี่',
    activities: [
      { id: 'U8-K', order: 1, type: 'knowledge', title: 'ใบความรู้ที่ 8: ดิกชันนารี', data: { content: L_(
        '# ดิกชันนารี: ค้นหาด้วยชื่อ ไม่ใช่ตำแหน่ง',
        'ลิสต์ค้นหาด้วยตำแหน่ง 0, 1, 2 ส่วนดิกชันนารีค้นหาด้วย **คีย์** เช่น ชื่อสินค้า รหัสนักศึกษา',
        '',
        '```python',
        'prices = {"ปากกา": 15, "ดินสอ": 8, "ยางลบ": 5}',
        'print(prices["ปากกา"])',
        'prices["ไม้บรรทัด"] = 12     # เพิ่มรายการใหม่',
        'prices["ดินสอ"] = 10         # แก้ราคา',
        'print(prices)',
        'print(len(prices))',
        '```',
        '',
        '## ตรวจก่อนค้นหา เพื่อไม่ให้ error',
        'ถ้าเรียกคีย์ที่ไม่มีจะเกิด `KeyError` ให้ตรวจด้วย `in` หรือใช้ `.get(คีย์, ค่าเริ่มต้น)`',
        '```python',
        'prices = {"ปากกา": 15, "ดินสอ": 8}',
        'name = "สมุด"',
        'if name in prices:',
        '    print(prices[name])',
        'else:',
        '    print("ไม่มีสินค้านี้")',
        'print(prices.get("สมุด", 0))',
        '```',
        '',
        '## วนลูปทุกคู่ด้วย items()',
        '```python',
        'scores = {"Ann": 70, "Ben": 85, "Cat": 60}',
        'for name, score in scores.items():',
        '    print(name, score)',
        'best = max(scores, key=scores.get)',
        'print("สูงสุด:", best)',
        '```',
        '',
        '## นับความถี่ (ใช้บ่อยมาก)',
        'ดิกชันนารีจำลำดับที่เพิ่มคีย์ไว้ จึงแสดงผลตามลำดับที่พบครั้งแรก',
        '```python',
        'words = "a b a c b a".split()',
        'count = {}',
        'for w in words:',
        '    count[w] = count.get(w, 0) + 1',
        'for w, c in count.items():',
        '    print(w, c)',
        '```'
      ) } },
      { id: 'U8-W', order: 2, type: 'worksheet', title: 'ใบงานที่ 8: สมุดราคาและการนับคำ', data: {
        intro: 'ใช้ดิกชันนารีค้นหาและนับ (ส่งได้ 3 ครั้ง)', maxAttempts: 3,
        tasks: [
          { title: 'ข้อ 1 ค้นหาราคาสินค้า', prompt: L_('ใช้ดิกชันนารีที่กำหนด รับชื่อสินค้า แล้วแสดง `ราคา X บาท` ถ้าไม่มีให้แสดง `ไม่มีสินค้านี้`', '', '| ข้อมูลนำเข้า | ผลลัพธ์ |', '|---|---|', '| `ปากกา` | `ราคา 15 บาท` |', '| `สมุด` | `ไม่มีสินค้านี้` |'),
            starterCode: L_('prices = {"ปากกา": 15, "ดินสอ": 8, "ยางลบ": 5}', 'name = input()', ''), sampleInput: 'ปากกา',
            hints: ['ตรวจด้วย if name in prices:'],
            solution: L_('prices = {"ปากกา": 15, "ดินสอ": 8, "ยางลบ": 5}', 'name = input()', 'if name in prices:', '    print(f"ราคา {prices[name]} บาท")', 'else:', '    print("ไม่มีสินค้านี้")'),
            tests: [{ input: 'ปากกา', expected: 'ราคา 15 บาท', score: 1 }, { input: 'สมุด', expected: 'ไม่มีสินค้านี้', score: 1 }, { input: 'ยางลบ', expected: 'ราคา 5 บาท', score: 1, hidden: true }, { input: 'ดินสอ', expected: 'ราคา 8 บาท', score: 1, hidden: true }, { input: 'ไม้บรรทัด', expected: 'ไม่มีสินค้านี้', score: 1, hidden: true }] },
          { title: 'ข้อ 2 นับคำ', prompt: L_('รับข้อความ 1 บรรทัด (คำคั่นด้วยช่องว่าง) แล้วแสดงแต่ละคำกับจำนวนครั้ง ตามลำดับที่พบครั้งแรก', '', 'ข้อมูลนำเข้า `a b a c b a`', '```text', 'a 3', 'b 2', 'c 1', '```'),
            starterCode: L_('words = input().split()', 'count = {}', ''), sampleInput: 'a b a c b a',
            hints: ['count[w] = count.get(w, 0) + 1', 'วน for w, c in count.items(): print(w, c)'],
            solution: L_('words = input().split()', 'count = {}', 'for w in words:', '    count[w] = count.get(w, 0) + 1', 'for w, c in count.items():', '    print(w, c)'),
            tests: [{ input: 'a b a c b a', expected: 'a 3\nb 2\nc 1', score: 2 }, { input: 'cat', expected: 'cat 1', score: 1, hidden: true }, { input: 'red blue red green blue red', expected: 'red 3\nblue 2\ngreen 1', score: 2, hidden: true }] }
        ] } },
      { id: 'U8-P', order: 3, type: 'practice', title: 'แบบฝึกปฏิบัติที่ 8: คะแนนสูงสุดและอ่านตัวเลข', data: {
        intro: 'ฝึกได้ไม่จำกัดครั้ง',
        tasks: [
          { title: 'ข้อ 1 ใครได้คะแนนสูงสุด', prompt: L_('บรรทัดแรกรับจำนวนคน n จากนั้นรับ n บรรทัด รูปแบบ `ชื่อ คะแนน`', 'แสดง `สูงสุด: ชื่อ (คะแนน)` (ถ้าเท่ากันเลือกคนที่มาก่อน)', '', 'ข้อมูลนำเข้า `3` `Ann 70` `Ben 85` `Cat 60` → `สูงสุด: Ben (85)`'),
            starterCode: L_('n = int(input())', 'scores = {}', 'for i in range(n):', '    name, score = input().split()', '    scores[name] = int(score)', ''), sampleInput: '3\nAnn 70\nBen 85\nCat 60',
            hints: ['best = max(scores, key=scores.get)', 'print(f"สูงสุด: {best} ({scores[best]})")'],
            solution: L_('n = int(input())', 'scores = {}', 'for i in range(n):', '    name, score = input().split()', '    scores[name] = int(score)', 'best = max(scores, key=scores.get)', 'print(f"สูงสุด: {best} ({scores[best]})")'),
            tests: [{ input: '3\nAnn 70\nBen 85\nCat 60', expected: 'สูงสุด: Ben (85)', score: 2 }, { input: '1\nDee 50', expected: 'สูงสุด: Dee (50)', score: 1, hidden: true }, { input: '4\nA 90\nB 95\nC 95\nD 10', expected: 'สูงสุด: B (95)', score: 2, hidden: true }] },
          { title: 'ข้อ 2 อ่านตัวเลขเป็นคำไทย', prompt: L_('รับตัวเลข (เป็นข้อความ) แล้วแสดงคำอ่านทีละหลักคั่นด้วยช่องว่าง', '', '| ข้อมูลนำเข้า | ผลลัพธ์ |', '|---|---|', '| `305` | `สาม ศูนย์ ห้า` |'),
            starterCode: L_('words = {"0": "ศูนย์", "1": "หนึ่ง", "2": "สอง", "3": "สาม", "4": "สี่",', '         "5": "ห้า", "6": "หก", "7": "เจ็ด", "8": "แปด", "9": "เก้า"}', 'digits = input()', ''), sampleInput: '305',
            hints: ['วนทีละตัวอักษร: for d in digits: แล้วเก็บ words[d] ลงลิสต์', 'print(" ".join(result))'],
            solution: L_('words = {"0": "ศูนย์", "1": "หนึ่ง", "2": "สอง", "3": "สาม", "4": "สี่",', '         "5": "ห้า", "6": "หก", "7": "เจ็ด", "8": "แปด", "9": "เก้า"}', 'digits = input()', 'print(" ".join(words[d] for d in digits))'),
            tests: [{ input: '305', expected: 'สาม ศูนย์ ห้า', score: 2 }, { input: '9', expected: 'เก้า', score: 1, hidden: true }, { input: '1200', expected: 'หนึ่ง สอง ศูนย์ ศูนย์', score: 2, hidden: true }] }
        ] } },
      { id: 'U8-Q', order: 4, type: 'quiz', title: 'แบบทดสอบภารกิจที่ 8', data: {
        intro: 'แบบทดสอบ 6 ข้อ เวลา 10 นาที ทำได้ 2 ครั้ง', timeLimitMin: 10, maxAttempts: 2, shuffle: true,
        questions: [
          { id: 'q1', type: 'output', text: 'ผลลัพธ์คืออะไร', code: 'd = {"a": 1, "b": 2}\nprint(d["b"])', answer: '2', score: 1, explain: 'ค่าของคีย์ "b" คือ 2' },
          { id: 'q2', type: 'output', text: 'ผลลัพธ์คืออะไร', code: 'd = {"a": 1, "b": 2}\nd["c"] = 3\nprint(len(d))', answer: '3', score: 1, explain: 'เพิ่มคีย์ใหม่ 1 คู่ รวมเป็น 3' },
          { id: 'q3', type: 'output', text: 'ผลลัพธ์คืออะไร', code: 'd = {"a": 1}\nprint(d.get("x", 0))', answer: '0', score: 1, explain: 'ไม่มีคีย์ x จึงได้ค่าเริ่มต้น 0' },
          { id: 'q4', type: 'tf', text: 'ในดิกชันนารีเดียวกัน มีคีย์ซ้ำกัน 2 ตัวได้', answer: false, score: 1, explain: 'คีย์ไม่ซ้ำ ถ้ากำหนดซ้ำจะเป็นการแก้ค่าเดิม' },
          { id: 'q5', type: 'mc', text: 'เรียก d["x"] เมื่อไม่มีคีย์ x จะเกิดอะไรขึ้น', choices: ['ได้ค่า 0', 'ได้ค่า None', 'เกิด KeyError', 'เพิ่มคีย์ x ให้อัตโนมัติ'], answer: 2, score: 1, explain: 'ต้องตรวจด้วย in หรือใช้ get()' },
          { id: 'q6', type: 'fill', text: 'คำสั่งที่ใช้วนลูปได้ทั้งคีย์และค่า เช่น for k, v in d.____(): คือ', answer: ['items', 'items()'], score: 1, explain: 'items() คืนคู่ (คีย์, ค่า)' }
        ] } }
    ]
  };
}

/* ======================= ภารกิจที่ 9 ======================= */
function unit9_() {
  return {
    id: 'U9', order: 9, icon: '🛡️', title: 'จัดการข้อผิดพลาด (try / except)',
    mission: 'ทำให้โปรแกรมไม่ล้มเมื่อผู้ใช้กรอกข้อมูลผิด และแจ้งเตือนอย่างสุภาพ',
    summary: 'try / except • ValueError ZeroDivisionError • ถามซ้ำจนกว่าจะถูก • ตรวจความถูกต้องของข้อมูล',
    activities: [
      { id: 'U9-K', order: 1, type: 'knowledge', title: 'ใบความรู้ที่ 9: try / except', data: { content: L_(
        '# เมื่อผู้ใช้กรอกผิด โปรแกรมไม่ควรล้ม',
        'ถ้าผู้ใช้พิมพ์ `abc` ตอนเราใช้ `int(input())` จะเกิด `ValueError` และโปรแกรมหยุดทันที เราใช้ `try / except` เพื่อ "ดัก" ข้อผิดพลาดไว้',
        '',
        '```python',
        'text = input()',
        'try:',
        '    n = int(text)',
        '    print("ตัวเลข", n)',
        'except ValueError:',
        '    print("ไม่ใช่ตัวเลข")',
        '```',
        '',
        '> 💡 ใส่ข้อมูลนำเข้าเป็น `abc` แล้วรัน จากนั้นเปลี่ยนเป็น `72` แล้วรันอีกครั้ง',
        '',
        '## ข้อผิดพลาดที่พบบ่อย',
        '| ชื่อ | เกิดเมื่อ |',
        '|---|---|',
        '| `ValueError` | แปลงข้อความที่ไม่ใช่ตัวเลข เช่น `int("abc")` |',
        '| `ZeroDivisionError` | หารด้วยศูนย์ |',
        '| `IndexError` | เรียกตำแหน่งที่ไม่มีในลิสต์ |',
        '| `KeyError` | เรียกคีย์ที่ไม่มีในดิกชันนารี |',
        '',
        '```python',
        'a = 10',
        'b = 0',
        'try:',
        '    print(a / b)',
        'except ZeroDivisionError:',
        '    print("หารด้วยศูนย์ไม่ได้")',
        'finally:',
        '    print("จบการคำนวณ")     # ทำเสมอ ไม่ว่าจะ error หรือไม่',
        '```',
        '',
        '## ถามซ้ำจนกว่าจะได้ข้อมูลที่ถูกต้อง',
        '```python',
        'while True:',
        '    text = input("อายุ: ")',
        '    try:',
        '        age = int(text)',
        '        if 1 <= age <= 120:',
        '            break',
        '        print("อายุต้องอยู่ระหว่าง 1–120")',
        '    except ValueError:',
        '        print("กรุณากรอกเป็นตัวเลข")',
        'print("อายุของคุณคือ", age)',
        '```',
        '> ใส่ข้อมูลนำเข้า `abc` / `200` / `17` (บรรทัดละค่า) แล้วรันดู',
        '',
        '> ⚠️ อย่าใช้ `except:` เปล่า ๆ ครอบโค้ดทั้งหมด เพราะจะซ่อนข้อผิดพลาดจริงที่เราควรแก้ ให้ระบุชื่อข้อผิดพลาดที่คาดไว้เสมอ'
      ) } },
      { id: 'U9-W', order: 2, type: 'worksheet', title: 'ใบงานที่ 9: โปรแกรมที่ไม่ล้ม', data: {
        intro: 'ใช้ try / except ดักข้อผิดพลาด (ส่งได้ 3 ครั้ง)', maxAttempts: 3,
        tasks: [
          { title: 'ข้อ 1 หารอย่างปลอดภัย', prompt: L_('รับจำนวน a และ b (บรรทัดละค่า) แสดง a ÷ b ทศนิยม 2 ตำแหน่ง ถ้า b เป็น 0 ให้แสดง `หารด้วยศูนย์ไม่ได้`', '', '| ข้อมูลนำเข้า | ผลลัพธ์ |', '|---|---|', '| `10` และ `4` | `2.50` |', '| `5` และ `0` | `หารด้วยศูนย์ไม่ได้` |'),
            starterCode: L_('a = float(input())', 'b = float(input())', ''), sampleInput: '10\n4',
            hints: ['try: print(f"{a / b:.2f}")', 'except ZeroDivisionError: print("หารด้วยศูนย์ไม่ได้")'],
            solution: L_('a = float(input())', 'b = float(input())', 'try:', '    print(f"{a / b:.2f}")', 'except ZeroDivisionError:', '    print("หารด้วยศูนย์ไม่ได้")'),
            tests: [{ input: '10\n4', expected: '2.50', score: 2 }, { input: '5\n0', expected: 'หารด้วยศูนย์ไม่ได้', score: 2 }, { input: '-9\n3', expected: '-3.00', score: 1, hidden: true }] },
          { title: 'ข้อ 2 ตรวจว่าเป็นจำนวนเต็มไหม', prompt: L_('รับข้อความ 1 บรรทัด ถ้าแปลงเป็นจำนวนเต็มได้ให้แสดง `ตัวเลข N` ถ้าไม่ได้ให้แสดง `ไม่ใช่ตัวเลข`', '', '| ข้อมูลนำเข้า | ผลลัพธ์ |', '|---|---|', '| `42` | `ตัวเลข 42` |', '| `abc` | `ไม่ใช่ตัวเลข` |'),
            starterCode: 'text = input()\n', sampleInput: '42',
            hints: ['int("3.5") ก็เกิด ValueError เช่นกัน', 'try: n = int(text) ... except ValueError: ...'],
            solution: L_('text = input()', 'try:', '    n = int(text)', '    print("ตัวเลข", n)', 'except ValueError:', '    print("ไม่ใช่ตัวเลข")'),
            tests: [{ input: '42', expected: 'ตัวเลข 42', score: 1 }, { input: 'abc', expected: 'ไม่ใช่ตัวเลข', score: 1 }, { input: '-7', expected: 'ตัวเลข -7', score: 1, hidden: true }, { input: '3.5', expected: 'ไม่ใช่ตัวเลข', score: 1, hidden: true }, { input: '0', expected: 'ตัวเลข 0', score: 1, hidden: true }] }
        ] } },
      { id: 'U9-P', order: 3, type: 'practice', title: 'แบบฝึกปฏิบัติที่ 9: ถามซ้ำและกรองข้อมูล', data: {
        intro: 'ฝึกได้ไม่จำกัดครั้ง',
        tasks: [
          { title: 'ข้อ 1 ถามจนกว่าจะถูก', prompt: L_('รับข้อมูลทีละบรรทัดจนกว่าจะได้จำนวนเต็ม 1–10', 'ทุกครั้งที่ไม่ถูกต้องให้แสดง `ลองใหม่` เมื่อถูกต้องให้แสดง `ได้ N` แล้วจบ', '', 'ข้อมูลนำเข้า `abc` `15` `7`', '```text', 'ลองใหม่', 'ลองใหม่', 'ได้ 7', '```'),
            starterCode: L_('while True:', '    text = input()', '    # เขียนต่อ', ''), sampleInput: 'abc\n15\n7',
            hints: ['ใน try แปลง n = int(text) แล้วตรวจ if 1 <= n <= 10: break', 'ทั้ง except และกรณีนอกช่วงให้ print("ลองใหม่")'],
            solution: L_('while True:', '    text = input()', '    try:', '        n = int(text)', '        if 1 <= n <= 10:', '            break', '    except ValueError:', '        pass', '    print("ลองใหม่")', 'print("ได้", n)'),
            tests: [{ input: 'abc\n15\n7', expected: 'ลองใหม่\nลองใหม่\nได้ 7', score: 2 }, { input: '1', expected: 'ได้ 1', score: 1, hidden: true }, { input: '0\n-3\n2.5\n10', expected: 'ลองใหม่\nลองใหม่\nลองใหม่\nได้ 10', score: 2, hidden: true }] },
          { title: 'ข้อ 2 รวมเฉพาะตัวเลข', prompt: L_('รับข้อความ 1 บรรทัด (คั่นด้วยช่องว่าง) รวมเฉพาะส่วนที่เป็นจำนวนเต็ม และนับส่วนที่ข้าม', '', 'ข้อมูลนำเข้า `5 x 3 y 2`', '```text', 'รวม 10', 'ข้าม 2', '```'),
            starterCode: L_('total = 0', 'skip = 0', 'for part in input().split():', '    # เขียนต่อ', ''), sampleInput: '5 x 3 y 2',
            hints: ['try: total += int(part)', 'except ValueError: skip += 1'],
            solution: L_('total = 0', 'skip = 0', 'for part in input().split():', '    try:', '        total += int(part)', '    except ValueError:', '        skip += 1', 'print("รวม", total)', 'print("ข้าม", skip)'),
            tests: [{ input: '5 x 3 y 2', expected: 'รวม 10\nข้าม 2', score: 2 }, { input: 'a b', expected: 'รวม 0\nข้าม 2', score: 1, hidden: true }, { input: '10 -4 1.5 20', expected: 'รวม 26\nข้าม 1', score: 2, hidden: true }] }
        ] } },
      { id: 'U9-Q', order: 4, type: 'quiz', title: 'แบบทดสอบภารกิจที่ 9', data: {
        intro: 'แบบทดสอบ 6 ข้อ เวลา 10 นาที ทำได้ 2 ครั้ง', timeLimitMin: 10, maxAttempts: 2, shuffle: true,
        questions: [
          { id: 'q1', type: 'output', text: 'ผลลัพธ์คืออะไร', code: 'try:\n    print(1 / 0)\nexcept ZeroDivisionError:\n    print("E")', answer: 'E', score: 1, explain: 'หารด้วยศูนย์จึงไปทำใน except' },
          { id: 'q2', type: 'mc', text: 'int("abc") ทำให้เกิดข้อผิดพลาดชนิดใด', choices: ['TypeError', 'ValueError', 'NameError', 'KeyError'], answer: 1, score: 1, explain: 'ค่าที่ให้มาแปลงเป็นตัวเลขไม่ได้' },
          { id: 'q3', type: 'tf', text: 'คำสั่งใน finally ทำงานเสมอ ไม่ว่าจะเกิดข้อผิดพลาดหรือไม่', answer: true, score: 1, explain: 'finally ใช้ปิดงาน เช่น ปิดไฟล์' },
          { id: 'q4', type: 'output', text: 'ผลลัพธ์คืออะไร', code: 'try:\n    x = int("5")\nexcept ValueError:\n    x = 0\nprint(x + 1)', answer: '6', score: 1, explain: 'แปลงได้ x = 5 จึงไม่เข้า except' },
          { id: 'q5', type: 'mc', text: 'เหตุใดจึงไม่ควรใช้ except: เปล่า ๆ ครอบโค้ดทั้งหมด', choices: ['ทำให้โปรแกรมช้า', 'ซ่อนข้อผิดพลาดจริงที่ควรแก้', 'Python ไม่อนุญาต', 'ใช้หน่วยความจำมาก'], answer: 1, score: 1, explain: 'ควรระบุชื่อข้อผิดพลาดที่คาดไว้' },
          { id: 'q6', type: 'fill', text: 'คำที่ใช้คู่กับ try เพื่อดักจับข้อผิดพลาดคือ ____', answer: ['except'], score: 1, explain: 'try: ... except ชื่อข้อผิดพลาด: ...' }
        ] } }
    ]
  };
}

/* ======================= ภารกิจที่ 10 ======================= */
function unit10_() {
  return {
    id: 'U10', order: 10, icon: '🛒', title: 'โปรเจกต์รวม: ระบบคิดเงินร้านค้า',
    mission: 'นำทุกเรื่องที่เรียนมาสร้างโปรแกรมคิดเงิน ส่วนลด ใบเสร็จ และเงินทอน',
    summary: 'แบ่งงานเป็นฟังก์ชัน • เมนูด้วยดิกชันนารี • ใบเสร็จ • เงินทอนตามชนิดธนบัตร',
    activities: [
      { id: 'U10-K', order: 1, type: 'knowledge', title: 'ใบความรู้ที่ 10: ออกแบบโปรแกรมทีละส่วน', data: { content: L_(
        '# จากโจทย์ใหญ่ สู่ฟังก์ชันเล็ก ๆ',
        'โปรแกรมจริงยาวหลายร้อยบรรทัด นักพัฒนาจะ **แบ่งงานเป็นฟังก์ชันย่อย** ที่แต่ละตัวทำหน้าที่เดียว ทดสอบง่าย และนำกลับมาใช้ซ้ำได้',
        '',
        '| ขั้น | คำถามที่ต้องตอบ | ตัวอย่างระบบร้านค้า |',
        '|---|---|---|',
        '| 1. ข้อมูลเข้า | ผู้ใช้ป้อนอะไร | รหัสสินค้า จำนวนเงินที่จ่าย |',
        '| 2. เก็บข้อมูล | ใช้โครงสร้างไหน | เมนู = ดิกชันนารี รหัส → (ชื่อ, ราคา) |',
        '| 3. ประมวลผล | แบ่งเป็นฟังก์ชันอะไร | คิดยอดรวม, คิดส่วนลด, คิดเงินทอน |',
        '| 4. ผลลัพธ์ | แสดงอะไร | ใบเสร็จ ยอดสุทธิ เงินทอน |',
        '',
        '## เมนูร้านด้วยดิกชันนารี + tuple',
        '```python',
        'menu = {"A": ("ข้าวผัด", 50), "B": ("ต้มยำ", 80), "C": ("น้ำเปล่า", 10)}',
        'name, price = menu["B"]',
        'print(name, price)',
        'for code, (name, price) in menu.items():',
        '    print(code, name, price)',
        '```',
        '',
        '## ฟังก์ชันที่มีค่าเริ่มต้น',
        '```python',
        'def vat(amount, rate=0.07):',
        '    return amount * rate',
        '',
        'print(vat(100))          # ใช้ rate ค่าเริ่มต้น 0.07',
        'print(vat(100, 0.10))    # ส่ง rate เอง',
        '```',
        '',
        '## คิดส่วนลดเป็นขั้น',
        '```python',
        'def discount(total):',
        '    if total >= 1000:',
        '        return total * 0.90',
        '    elif total >= 500:',
        '        return total * 0.95',
        '    return total',
        '',
        'for t in [300, 600, 1200]:',
        '    print(t, "→", discount(t))',
        '```',
        '',
        '## เงินทอนตามชนิดธนบัตร',
        'ใช้ `//` หาจำนวนใบ และ `%` หาเงินที่เหลือ เรียงจากธนบัตรใหญ่ไปเล็ก',
        '```python',
        'change = 365',
        'for note in [1000, 500, 100, 50, 20, 10, 5, 1]:',
        '    if change >= note:',
        '        print(note, "x", change // note)',
        '        change = change % note',
        '```',
        '',
        '> 🎓 ภารกิจนี้คือภารกิจสุดท้าย เมื่อผ่านครบ 10 ภารกิจ จะได้รับ **เกียรติบัตรสำเร็จหลักสูตร**'
      ) } },
      { id: 'U10-W', order: 2, type: 'worksheet', title: 'ใบงานที่ 10: ส่วนลดและใบเสร็จ', data: {
        intro: 'แบ่งงานเป็นฟังก์ชัน (ส่งได้ 3 ครั้ง)', maxAttempts: 3,
        tasks: [
          { title: 'ข้อ 1 ฟังก์ชันคิดส่วนลด', prompt: L_('เขียนฟังก์ชัน `discount(total)` ซื้อครบ 1,000 บาทลด 10% ครบ 500 บาทลด 5% นอกนั้นไม่ลด', 'รับยอดซื้อ แล้วแสดงยอดสุทธิทศนิยม 2 ตำแหน่ง', '', '| ข้อมูลนำเข้า | ผลลัพธ์ |', '|---|---|', '| `1200` | `1080.00` |', '| `600` | `570.00` |', '| `300` | `300.00` |'),
            starterCode: L_('def discount(total):', '    return total   # แก้ให้ถูก', '', 'total = float(input())', 'print(f"{discount(total):.2f}")', ''), sampleInput: '1200',
            hints: ['ตรวจจากเงื่อนไขมากไปน้อย: >= 1000 ก่อน >= 500', 'ลด 10% = total * 0.90'],
            solution: L_('def discount(total):', '    if total >= 1000:', '        return total * 0.90', '    elif total >= 500:', '        return total * 0.95', '    return total', '', 'total = float(input())', 'print(f"{discount(total):.2f}")'),
            tests: [{ input: '1200', expected: '1080.00', score: 1, compare: 'number' }, { input: '600', expected: '570.00', score: 1, compare: 'number' }, { input: '300', expected: '300.00', score: 1, compare: 'number' }, { input: '500', expected: '475.00', score: 1, compare: 'number', hidden: true }, { input: '1000', expected: '900.00', score: 1, compare: 'number', hidden: true }] },
          { title: 'ข้อ 2 พิมพ์ใบเสร็จ', prompt: L_('รับรหัสสินค้าหลายตัวในบรรทัดเดียว แสดงชื่อและราคาทีละรายการ รหัสที่ไม่มีให้แสดง `ไม่มีรหัส X` สุดท้ายแสดง `รวม N บาท`', '', 'ข้อมูลนำเข้า `A C Z`', '```text', 'ข้าวผัด 50', 'น้ำเปล่า 10', 'ไม่มีรหัส Z', 'รวม 60 บาท', '```'),
            starterCode: L_('menu = {"A": ("ข้าวผัด", 50), "B": ("ต้มยำ", 80), "C": ("น้ำเปล่า", 10)}', 'total = 0', 'for code in input().split():', '    # เขียนต่อ', ''), sampleInput: 'A C Z',
            hints: ['if code in menu: name, price = menu[code]', 'บวก price เข้า total แล้วแสดง print(name, price)'],
            solution: L_('menu = {"A": ("ข้าวผัด", 50), "B": ("ต้มยำ", 80), "C": ("น้ำเปล่า", 10)}', 'total = 0', 'for code in input().split():', '    if code in menu:', '        name, price = menu[code]', '        print(name, price)', '        total += price', '    else:', '        print("ไม่มีรหัส", code)', 'print(f"รวม {total} บาท")'),
            tests: [{ input: 'A C Z', expected: 'ข้าวผัด 50\nน้ำเปล่า 10\nไม่มีรหัส Z\nรวม 60 บาท', score: 2 }, { input: 'B', expected: 'ต้มยำ 80\nรวม 80 บาท', score: 1, hidden: true }, { input: 'A A B C', expected: 'ข้าวผัด 50\nข้าวผัด 50\nต้มยำ 80\nน้ำเปล่า 10\nรวม 190 บาท', score: 2, hidden: true }] }
        ] } },
      { id: 'U10-P', order: 3, type: 'practice', title: 'แบบฝึกปฏิบัติที่ 10: ยอดขายและเงินทอน', data: {
        intro: 'ฝึกได้ไม่จำกัดครั้ง',
        tasks: [
          { title: 'ข้อ 1 สรุปยอดขาย', prompt: L_('บรรทัดแรกรับจำนวนรายการ n แล้วรับ n บรรทัด รูปแบบ `สินค้า จำนวน ราคาต่อชิ้น`', 'แสดง `รวม X บาท` และ `ขายดี: สินค้าที่จำนวนมากที่สุด` (เท่ากันเลือกรายการแรก)', '', 'ข้อมูลนำเข้า `3` `ชา 5 20` `กาแฟ 8 35` `น้ำ 2 10`', '```text', 'รวม 400 บาท', 'ขายดี: กาแฟ', '```'),
            starterCode: L_('n = int(input())', 'total = 0', 'qty = {}', 'for i in range(n):', '    name, q, price = input().split()', ''), sampleInput: '3\nชา 5 20\nกาแฟ 8 35\nน้ำ 2 10',
            hints: ['total += int(q) * int(price) และ qty[name] = int(q)', 'best = max(qty, key=qty.get)'],
            solution: L_('n = int(input())', 'total = 0', 'qty = {}', 'for i in range(n):', '    name, q, price = input().split()', '    total += int(q) * int(price)', '    qty[name] = int(q)', 'print(f"รวม {total} บาท")', 'print("ขายดี:", max(qty, key=qty.get))'),
            tests: [{ input: '3\nชา 5 20\nกาแฟ 8 35\nน้ำ 2 10', expected: 'รวม 400 บาท\nขายดี: กาแฟ', score: 2 }, { input: '1\nขนม 3 15', expected: 'รวม 45 บาท\nขายดี: ขนม', score: 1, hidden: true }, { input: '2\nA 4 10\nB 4 50', expected: 'รวม 240 บาท\nขายดี: A', score: 2, hidden: true }] },
          { title: 'ข้อ 2 เครื่องทอนเงิน', prompt: L_('รับราคาสินค้าและเงินที่จ่าย (จำนวนเต็ม บรรทัดละค่า) ถ้าจ่ายไม่พอแสดง `เงินไม่พอ`', 'ถ้าพอ แสดง `เงินทอน N` แล้วแสดงธนบัตร/เหรียญที่ใช้ เรียงจากใหญ่ไปเล็ก เฉพาะชนิดที่ใช้ รูปแบบ `ชนิด x จำนวน`', 'ชนิดที่มี: 1000 500 100 50 20 10 5 1', '', 'ข้อมูลนำเข้า `135` และ `500`', '```text', 'เงินทอน 365', '100 x 3', '50 x 1', '10 x 1', '5 x 1', '```'),
            starterCode: L_('price = int(input())', 'paid = int(input())', ''), sampleInput: '135\n500',
            hints: ['change = paid - price แล้ววน for note in [1000, 500, 100, 50, 20, 10, 5, 1]:', 'ถ้า change >= note ให้แสดง note x change // note แล้ว change = change % note'],
            solution: L_('price = int(input())', 'paid = int(input())', 'if paid < price:', '    print("เงินไม่พอ")', 'else:', '    change = paid - price', '    print("เงินทอน", change)', '    for note in [1000, 500, 100, 50, 20, 10, 5, 1]:', '        if change >= note:', '            print(note, "x", change // note)', '            change = change % note'),
            tests: [{ input: '135\n500', expected: 'เงินทอน 365\n100 x 3\n50 x 1\n10 x 1\n5 x 1', score: 2 }, { input: '100\n50', expected: 'เงินไม่พอ', score: 1, hidden: true }, { input: '1\n2000', expected: 'เงินทอน 1999\n1000 x 1\n500 x 1\n100 x 4\n50 x 1\n20 x 2\n5 x 1\n1 x 4', score: 1, hidden: true }, { input: '80\n80', expected: 'เงินทอน 0', score: 1, hidden: true }] }
        ] } },
      { id: 'U10-Q', order: 4, type: 'quiz', title: 'แบบทดสอบภารกิจที่ 10 (ปลายภาค)', data: {
        intro: 'แบบทดสอบ 6 ข้อ เวลา 10 นาที ทำได้ 2 ครั้ง', timeLimitMin: 10, maxAttempts: 2, shuffle: true,
        questions: [
          { id: 'q1', type: 'output', text: 'ผลลัพธ์คืออะไร', code: 'items = [50, 80, 10]\nprint(sum(items))', answer: '140', score: 1, explain: '50 + 80 + 10' },
          { id: 'q2', type: 'output', text: 'ผลลัพธ์คืออะไร', code: 'def f(x, rate=0.1):\n    return x - x * rate\n\nprint(f(200))', answer: '180.0', score: 1, explain: 'ใช้ rate ค่าเริ่มต้น 0.1 ได้ 200 - 20 = 180.0' },
          { id: 'q3', type: 'mc', text: 'ข้อมูลเมนูแบบ "รหัส → ราคา" ควรเก็บในโครงสร้างใด', choices: ['ข้อความ (str)', 'จำนวนเต็ม (int)', 'ดิกชันนารี (dict)', 'ค่าความจริง (bool)'], answer: 2, score: 1, explain: 'ค้นหาราคาด้วยรหัสได้ทันที' },
          { id: 'q4', type: 'tf', text: 'การแบ่งโปรแกรมใหญ่เป็นฟังก์ชันย่อยช่วยให้ทดสอบและแก้ไขได้ง่ายขึ้น', answer: true, score: 1, explain: 'แต่ละฟังก์ชันทำหน้าที่เดียว ตรวจแยกได้' },
          { id: 'q5', type: 'output', text: 'ผลลัพธ์คืออะไร', code: 'change = 70\nprint(change // 50, change % 50)', answer: '1 20', score: 1, explain: 'ธนบัตร 50 ได้ 1 ใบ เหลือ 20' },
          { id: 'q6', type: 'fill', text: 'คำสั่งที่ใช้ส่งค่าผลลัพธ์กลับจากฟังก์ชันคือ ____', answer: ['return'], score: 1, explain: 'return ค่า' }
        ] } }
    ]
  };
}
