/**
 * Core.gs — ตรรกะหลักของระบบ (ไม่เรียก SpreadsheetApp โดยตรง)
 * ทุกฟังก์ชันทำงานผ่าน "store" เพื่อให้ไฟล์เดียวกันนี้ใช้ได้ทั้ง
 *   - Google Apps Script (store = Google Sheet, ดู Code.gs)
 *   - เว็บสาธิต / ชุดทดสอบ (store = localStorage หรือหน่วยความจำ)
 *
 * store ต้องมี: all(table), insert(table,obj), update(table,id,patch), removeWhere(table,fn),
 *               settings(), secret(k), setSecret(k,v), cacheGet(k), cachePut(k,v,sec), cacheRemove(k),
 *               now(), uuid(), hash(s), lock(fn), webAppUrl(), activeUserEmail()
 */
var APP_VERSION = '2.1.0';

var SCHEMA = {
  Students: ['id', 'studentCode', 'prefix', 'firstName', 'lastName', 'room', 'pinHash', 'status', 'isSample', 'createdAt'],
  Units: ['id', 'order', 'title', 'mission', 'icon', 'summary', 'passPercent', 'status', 'kind'],
  Activities: ['id', 'unitId', 'order', 'type', 'title', 'dataJson', 'status'],
  Attempts: ['id', 'studentId', 'activityId', 'attemptNo', 'submittedAt', 'score', 'maxScore', 'detailJson'],
  HintsUsed: ['id', 'studentId', 'activityId', 'taskIndex', 'hintIndex', 'at'],
  QuizSessions: ['id', 'studentId', 'activityId', 'startedAt', 'deadlineAt', 'submittedAt', 'orderJson'],
  Overrides: ['id', 'studentId', 'activityId', 'score', 'reason', 'by', 'at'],
  Certificates: ['id', 'certNo', 'studentId', 'unitId', 'title', 'percent', 'level', 'issuedAt', 'updatedAt', 'verifyCode'],
  Integrity: ['id', 'studentId', 'activityId', 'sessionId', 'kind', 'detail', 'at'],
  Log: ['id', 'at', 'actor', 'action', 'detail']
};

var DEFAULT_SETTINGS = {
  schoolName: 'วิทยาลัยตัวอย่าง',
  department: 'แผนกวิชาเทคโนโลยีสารสนเทศ',
  courseName: 'การพัฒนาเว็บแอปพลิเคชัน',
  courseCode: '31909-2009',
  courseCredit: '2-3-3',
  courseDescription: 'ศึกษาและปฏิบัติเกี่ยวกับหลักการออกแบบเว็บแอปพลิเคชันโดยใช้เฟรมเวิร์ก หลักการพัฒนาเว็บแอปพลิเคชันโดยใช้เฟรมเวิร์กที่ได้รับความนิยมในปัจจุบัน การเชื่อมต่อฐานข้อมูล การตกแต่งเว็บแอปพลิเคชันด้วยสไตล์ชีตเฟรมเวิร์ก และอัปโหลดเว็บไซต์ขึ้นบนระบบเครือข่ายอินเทอร์เน็ต',
  academicYear: '2569',
  semester: '2',
  passPercent: '60',
  hintPenalty: '10',
  lockSequential: 'yes',
  primaryColor: '#4F46E5',
  logoUrl: '',
  certPrefix: 'WEB',
  signer1Name: '',
  signer1Position: 'ครูผู้สอน',
  signer2Name: '',
  signer2Position: 'ผู้อำนวยการ',
  signer1Sig: '',
  signer2Sig: '',
  integrityPenalty: '10',
  quizMaxStrikes: '2',
  adminEmails: '',
  publicUrl: ''
};

/** ชื่อวิชาเดิม (รุ่น Python) ใช้ตรวจว่าควรเปลี่ยนเป็นวิชาใหม่ตอนใส่เนื้อหาตัวอย่าง */
var OLD_COURSE_NAMES = ['การเขียนโปรแกรมคอมพิวเตอร์เบื้องต้นด้วยภาษา Python'];
var TYPE_NAMES = { knowledge: 'ใบความรู้', worksheet: 'ใบงาน', practice: 'แบบฝึกปฏิบัติ', quiz: 'แบบทดสอบ' };
var TOKEN_TTL = 6 * 60 * 60;      // 6 ชั่วโมง (สูงสุดของ CacheService)
var QUIZ_GRACE_MS = 60 * 1000;    // เผื่อเน็ตช้า 60 วินาทีหลังหมดเวลา
var MAX_CODE_CHARS = 20000;

/* ---------------- ตัวช่วยทั่วไป ---------------- */
function num_(v, d) { var n = Number(v); return isFinite(n) && v !== '' && v !== null ? n : (d === undefined ? 0 : d); }
function parseJson_(s, d) {
  if (s === null || s === undefined || s === '') return d;
  if (typeof s === 'object') return s;
  try { return JSON.parse(s); } catch (e) { return d; }
}
function round1_(n) { return Math.round(n * 10) / 10; }
function sum_(arr, fn) { var t = 0; arr.forEach(function (x) { t += fn(x); }); return t; }
function iso_(store) { return store.now().toISOString(); }
function fail_(msg) { throw new Error(msg); }
function settings_(store) {
  var s = store.settings() || {}, out = {};
  Object.keys(DEFAULT_SETTINGS).forEach(function (k) { out[k] = (s[k] !== undefined && s[k] !== '') ? String(s[k]) : DEFAULT_SETTINGS[k]; });
  Object.keys(s).forEach(function (k) { if (out[k] === undefined) out[k] = String(s[k]); });
  return out;
}
function log_(store, actor, action, detail) {
  try { store.insert('Log', { id: store.uuid(), at: iso_(store), actor: actor, action: action, detail: typeof detail === 'string' ? detail : JSON.stringify(detail) }); } catch (e) { /* ไม่ให้ log ทำให้งานหลักล้ม */ }
}
function fullName_(s) { return (s.prefix || '') + s.firstName + ' ' + s.lastName; }
function publicStudent_(s) { return { id: s.id, studentCode: s.studentCode, prefix: s.prefix, firstName: s.firstName, lastName: s.lastName, room: s.room, name: fullName_(s) }; }
function randomPin_(store) {
  var hex = store.uuid().replace(/-/g, ''), pin = '';
  for (var i = 0; pin.length < 6; i++) pin += (parseInt(hex.charAt(i % hex.length), 16) + i) % 10;
  return pin;
}
function pinHash_(store, code, pin) { return store.hash(store.secret('salt') + ':' + String(code).trim() + ':' + String(pin).trim()); }
function shuffle_(arr) {
  var a = arr.slice();
  for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; }
  return a;
}

/* ---------------- การเปรียบเทียบผลลัพธ์ ---------------- */
function normalizeOut_(s) {
  return String(s === null || s === undefined ? '' : s).replace(/\r\n?/g, '\n')
    .split('\n').map(function (l) { return l.replace(/\s+$/, ''); }).join('\n').replace(/\n+$/, '').replace(/^\n+/, '');
}
/** mode: trim (ค่าเริ่มต้น ไม่สนช่องว่างท้ายบรรทัด) | exact | ignorespace | contains | number */
function compareOutput_(actual, expected, mode) {
  mode = mode || 'trim';
  if (mode === 'exact') return String(actual) === String(expected);
  var a = normalizeOut_(actual), e = normalizeOut_(expected);
  if (mode === 'contains') return a.indexOf(e) >= 0;
  if (mode === 'ignorespace') return a.replace(/\s+/g, '') === e.replace(/\s+/g, '');
  if (mode === 'number') {
    var re = /-?\d+(?:\.\d+)?/g, an = a.match(re) || [], en = e.match(re) || [];
    if (an.length !== en.length || !en.length) return false;
    return en.every(function (x, i) { return Math.abs(Number(x) - Number(an[i])) <= 0.01; });
  }
  return a === e;
}
function normalizeAnswer_(s) { return String(s === null || s === undefined ? '' : s).trim().replace(/\s+/g, ' ').toLowerCase(); }

/* ---------------- เนื้อหาและความก้าวหน้า ---------------- */
function activityMax_(a) {
  var d = a.data || {};
  if (a.type === 'knowledge') return 0;
  if (a.type === 'quiz') {
    var qs = d.questions || [], all = sum_(qs, function (q) { return num_(q.score, 1); });
    return quizDraw_(d) < qs.length ? round1_(all * quizDraw_(d) / qs.length) : all;
  }
  return sum_(d.tasks || [], taskMax_);
}
/** จำนวนข้อที่สุ่มออกมาให้ทำ (drawCount = สุ่มจากคลังข้อสอบ, ไม่ระบุ = ทุกข้อ) */
function quizDraw_(d) {
  var n = (d.questions || []).length, k = num_(d.drawCount, 0);
  return k > 0 && k < n ? k : n;
}
function taskMax_(t) { return sum_(t.tests || [], function (x) { return num_(x.score, 1); }); }

function loadCourse_(store) {
  var units = store.all('Units').filter(function (u) { return u.status !== 'hidden' && u.status !== 'deleted'; })
    .sort(function (a, b) { return num_(a.order) - num_(b.order); });
  var unitIds = {}; units.forEach(function (u) { unitIds[u.id] = true; });
  var acts = store.all('Activities').filter(function (a) { return a.status !== 'hidden' && a.status !== 'deleted' && unitIds[a.unitId]; })
    .map(function (a) { var x = {}; for (var k in a) x[k] = a[k]; x.data = parseJson_(a.dataJson, {}); x.max = activityMax_(x); return x; })
    .sort(function (a, b) { return num_(a.order) - num_(b.order); });
  var actById = {}; acts.forEach(function (a) { actById[a.id] = a; });
  return { units: units, acts: acts, actById: actById };
}

function levelOf_(p) {
  if (p >= 90) return { key: 'gold', name: 'ดีเยี่ยม' };
  if (p >= 75) return { key: 'silver', name: 'ดีมาก' };
  return { key: 'bronze', name: 'ผ่าน' };
}

/** คำนวณความก้าวหน้าของนักศึกษา 1 คน จากข้อมูลที่กรองเฉพาะคนนั้นแล้ว (ฟังก์ชันบริสุทธิ์) */
function computeProgress_(course, atts, ovs, S) {
  var basePass = num_(S.passPercent, 60);
  var act = {};
  course.acts.forEach(function (a) { act[a.id] = { attempts: 0, best: null, done: false, max: a.max, last: null, override: null }; });
  atts.forEach(function (t) {
    var p = act[t.activityId]; if (!p) return;
    p.attempts++; p.done = true;
    var sc = num_(t.score);
    if (p.best === null || sc > p.best) p.best = sc;
    if (!p.last || String(t.submittedAt) > p.last) p.last = String(t.submittedAt);
  });
  ovs.slice().sort(function (a, b) { return String(a.at) < String(b.at) ? -1 : 1; }).forEach(function (o) {
    var p = act[o.activityId]; if (!p) return;
    p.override = num_(o.score); p.best = p.override; p.done = true;
  });
  var prevPassed = true, totalE = 0, totalM = 0, bonusE = 0, bonusM = 0;
  var allPassed = course.units.some(function (u) { return u.kind !== 'bonus'; });
  var units = course.units.map(function (u) {
    var bonus = u.kind === 'bonus';
    var list = course.acts.filter(function (a) { return a.unitId === u.id; });
    var earned = sum_(list, function (a) { return act[a.id].best || 0; });
    var max = sum_(list, function (a) { return a.max; });
    var doneCount = list.filter(function (a) { return act[a.id].done; }).length;
    var allDone = list.length > 0 && doneCount === list.length;
    var percent = max > 0 ? round1_(earned / max * 100) : (allDone ? 100 : 0);
    var need = num_(u.passPercent, basePass);
    var passed = allDone && percent >= need;
    // ภารกิจคะแนนพิเศษ (kind = bonus): เปิดได้เสมอ ไม่นับรวมคะแนนหลัก และไม่เป็นเงื่อนไขจบหลักสูตร
    var locked = !bonus && S.lockSequential === 'yes' && !prevPassed;
    if (bonus) { bonusE += earned; bonusM += max; }
    else {
      prevPassed = passed;
      if (!passed) allPassed = false;
      totalE += earned; totalM += max;
    }
    return { id: u.id, earned: earned, max: max, percent: percent, need: need, doneCount: doneCount, total: list.length, bonus: bonus,
      allDone: allDone, passed: passed, locked: locked, level: passed ? levelOf_(percent) : null };
  });
  var unitById = {}; units.forEach(function (u) { unitById[u.id] = u; });
  var overall = totalM > 0 ? round1_(totalE / totalM * 100) : 0;
  return { act: act, units: units, unitById: unitById, earned: totalE, max: totalM, percent: overall, allPassed: allPassed,
    bonus: { earned: round1_(bonusE), max: bonusM, percent: bonusM > 0 ? round1_(bonusE / bonusM * 100) : 0 } };
}

function progressFor_(store, studentId, course, S) {
  var atts = store.all('Attempts').filter(function (t) { return t.studentId === studentId; });
  var ovs = store.all('Overrides').filter(function (o) { return o.studentId === studentId; });
  return computeProgress_(course, atts, ovs, S);
}

/** ออก/ปรับปรุงเกียรติบัตรตามผลล่าสุด คืนรายการที่ออกใหม่ */
function syncCertificates_(store, student, course, prog, S) {
  var issued = [];
  var certs = store.all('Certificates');
  var mine = certs.filter(function (c) { return c.studentId === student.id; });
  var targets = [];
  course.units.forEach(function (u, i) {
    var p = prog.unitById[u.id];
    if (p && p.passed) targets.push({ unitId: u.id, title: 'ภารกิจที่ ' + (i + 1) + ': ' + u.title + (p.bonus ? ' (คะแนนพิเศษ)' : ''), percent: p.percent });
  });
  if (prog.allPassed) targets.push({ unitId: 'COURSE', title: 'สำเร็จหลักสูตร ' + S.courseName, percent: prog.percent });
  var seq = certs.length;
  targets.forEach(function (t) {
    var lv = levelOf_(t.percent);
    var ex = mine.filter(function (c) { return c.unitId === t.unitId; })[0];
    if (!ex) {
      seq++;
      var c = { id: store.uuid(), certNo: S.certPrefix + '-' + S.academicYear + '-' + ('0000' + seq).slice(-4), studentId: student.id, unitId: t.unitId,
        title: t.title, percent: t.percent, level: lv.name, issuedAt: iso_(store), updatedAt: iso_(store),
        verifyCode: store.uuid().replace(/-/g, '').slice(0, 10) };
      store.insert('Certificates', c);
      issued.push(publicCert_(c, student, S, store));
    } else if (t.percent > num_(ex.percent)) {
      store.update('Certificates', ex.id, { percent: t.percent, level: lv.name, title: t.title, updatedAt: iso_(store) });
    }
  });
  return issued;
}

function publicCert_(c, student, S, store) {
  var base = (S && S.publicUrl) || store.webAppUrl();
  return { certNo: c.certNo, unitId: c.unitId, title: c.title, percent: num_(c.percent), level: c.level, issuedAt: c.issuedAt,
    studentName: student ? fullName_(student) : '', studentCode: student ? student.studentCode : '', room: student ? student.room : '',
    verifyCode: c.verifyCode, verifyUrl: base ? base + '?cert=' + encodeURIComponent(c.certNo) + '&code=' + encodeURIComponent(c.verifyCode) : '' };
}

function publicSettings_(S, store) {
  return { schoolName: S.schoolName, department: S.department, courseName: S.courseName, courseCode: S.courseCode, courseCredit: S.courseCredit, courseDescription: S.courseDescription, academicYear: S.academicYear, semester: S.semester,
    passPercent: num_(S.passPercent, 60), hintPenalty: num_(S.hintPenalty, 10), primaryColor: S.primaryColor, logoUrl: S.logoUrl,
    signer1Name: S.signer1Name, signer1Position: S.signer1Position, signer2Name: S.signer2Name, signer2Position: S.signer2Position,
    integrityPenalty: num_(S.integrityPenalty, 10), quizMaxStrikes: num_(S.quizMaxStrikes, 2),
    webAppUrl: S.publicUrl || store.webAppUrl(), version: APP_VERSION };
}
/** ค่าที่ใช้พิมพ์เกียรติบัตร = publicSettings + ภาพลายเซ็น (ไม่ส่งไปทุกหน้าเพราะข้อมูลภาพมีขนาดใหญ่) */
function certSettings_(S, store) {
  var o = publicSettings_(S, store);
  o.signer1Sig = S.signer1Sig || ''; o.signer2Sig = S.signer2Sig || '';
  return o;
}

/** จำนวนการส่งงานรายวันย้อนหลัง n วัน (ใช้วาดกราฟ) → [{ d: 'YYYY-MM-DD', n }] */
function activitySeries_(atts, now, n) {
  var day = 86400000, end = new Date(now.getTime() + 7 * 3600000); // นับวันตามเวลาไทย (UTC+7)
  var keys = [], idx = {};
  for (var i = n - 1; i >= 0; i--) { var k = new Date(end.getTime() - i * day).toISOString().slice(0, 10); idx[k] = keys.length; keys.push({ d: k, n: 0 }); }
  atts.forEach(function (t) {
    if (num_(t.maxScore) <= 0) return;
    var d = new Date(t.submittedAt); if (isNaN(d)) return;
    var k = new Date(d.getTime() + 7 * 3600000).toISOString().slice(0, 10);
    if (idx[k] !== undefined) keys[idx[k]].n++;
  });
  return keys;
}

/* ---------------- ความซื่อสัตย์ทางวิชาการ (กันคัดลอก/ทุจริต) ---------------- */
var INTEGRITY_KINDS = { paste: 'วางข้อความจากภายนอก', drop: 'ลากข้อความจากภายนอกมาวาง', copy: 'คัดลอกข้อสอบ', leave: 'ออกจากหน้าสอบ/สลับแท็บ', print: 'สั่งพิมพ์/บันทึกหน้าสอบ', devtools: 'เปิดเครื่องมือนักพัฒนา' };
function integrityOf_(store, studentId, activityId, sessionId) {
  return store.all('Integrity').filter(function (x) { return x.studentId === studentId && x.activityId === activityId && (!sessionId || x.sessionId === sessionId); });
}
/** คะแนนที่ถูกหักจากการทุจริต = pct% ของคะแนนเต็ม ต่อ 1 ครั้ง (ไม่เกินคะแนนที่ได้) */
function integrityPenalty_(earned, max, count, pct) {
  return earned > 0 && count > 0 ? Math.min(earned, round1_(max * pct / 100 * count)) : 0;
}

/* ---------------- สิทธิ์ ---------------- */
function session_(store, p) {
  if (!p || !p.token) fail_('กรุณาเข้าสู่ระบบ');
  var s = parseJson_(store.cacheGet('tok_' + p.token), null);
  if (!s) fail_('หมดเวลาการใช้งาน กรุณาเข้าสู่ระบบใหม่');
  return s;
}
function requireStudent_(store, p) {
  var s = session_(store, p);
  if (s.role !== 'student') fail_('หน้านี้สำหรับนักศึกษา');
  var st = store.all('Students').filter(function (x) { return x.id === s.studentId; })[0];
  if (!st || st.status === 'inactive' || st.status === 'deleted') fail_('บัญชีนี้ถูกปิดการใช้งาน');
  return st;
}
function requireTeacher_(store, p) {
  var s = session_(store, p);
  if (s.role !== 'teacher') fail_('ต้องเข้าสู่ระบบด้วยสิทธิ์ครู');
  return s;
}
function newToken_(store, data) {
  var t = (store.uuid() + store.uuid()).replace(/-/g, '');
  store.cachePut('tok_' + t, JSON.stringify(data), TOKEN_TTL);
  return t;
}

function activityForStudent_(store, st, activityId) {
  var S = settings_(store), course = loadCourse_(store);
  var a = course.actById[activityId];
  if (!a) fail_('ไม่พบกิจกรรมนี้');
  var prog = progressFor_(store, st.id, course, S);
  if (prog.unitById[a.unitId].locked) fail_('ภารกิจนี้ยังล็อกอยู่ ต้องผ่านภารกิจก่อนหน้าก่อน');
  return { S: S, course: course, act: a, prog: prog };
}

function afterChange_(store, st, course, S) {
  var prog = progressFor_(store, st.id, course, S);
  var issued = syncCertificates_(store, st, course, prog, S);
  return { prog: prog, issued: issued };
}

/* ---------------- API ---------------- */
var API_ = {};

API_.info = function (store) {
  var out = publicSettings_(settings_(store), store);
  try {
    var course = loadCourse_(store);
    out.outline = course.units.map(function (u, i) { return { no: i + 1, icon: u.icon, title: u.title, summary: u.summary, bonus: u.kind === 'bonus',
      acts: course.acts.filter(function (a) { return a.unitId === u.id; }).length }; });
    out.stats = { units: course.units.length, activities: course.acts.length,
      tasks: sum_(course.acts, function (a) { return (a.data.tasks || []).length; }),
      students: store.all('Students').filter(function (s) { return s.status !== 'deleted' && s.status !== 'inactive'; }).length,
      certificates: store.all('Certificates').length };
  } catch (e) { out.outline = []; out.stats = null; }
  return out;
};

API_.login = function (store, p) {
  var code = String(p.studentCode || '').trim(), pin = String(p.pin || '').trim();
  if (!code || !pin) fail_('กรอกรหัสนักศึกษาและ PIN ให้ครบ');
  var fk = 'fail_' + code, fails = num_(store.cacheGet(fk));
  if (fails >= 5) fail_('ใส่ PIN ผิดหลายครั้ง กรุณารอ 10 นาที หรือติดต่อครูผู้สอน');
  var st = store.all('Students').filter(function (x) { return String(x.studentCode).trim() === code && x.status !== 'inactive' && x.status !== 'deleted'; })[0];
  if (!st || st.pinHash !== pinHash_(store, code, pin)) {
    store.cachePut(fk, String(fails + 1), 600);
    fail_('รหัสนักศึกษาหรือ PIN ไม่ถูกต้อง');
  }
  store.cacheRemove(fk);
  return { token: newToken_(store, { role: 'student', studentId: st.id }), student: publicStudent_(st) };
};

API_.teacherLogin = function (store, p) {
  var h = store.secret('teacherPassHash');
  if (!h) fail_('ยังไม่ได้ตั้งรหัสผ่านครู ให้เปิด Google Sheet แล้วเลือกเมนู ⚙️ ตั้งค่าระบบ → ตั้งรหัสผ่านครู');
  var fk = 'tfail', fails = num_(store.cacheGet(fk));
  if (fails >= 8) fail_('ใส่รหัสผิดหลายครั้ง กรุณารอ 10 นาที');
  if (store.hash(store.secret('salt') + ':teacher:' + String(p.password || '')) !== h) {
    store.cachePut(fk, String(fails + 1), 600);
    fail_('รหัสผ่านครูไม่ถูกต้อง');
  }
  return { token: newToken_(store, { role: 'teacher', name: 'ครู' }) };
};

/** ครูที่ใช้บัญชี Google อยู่ในรายชื่อ adminEmails เข้าได้ทันทีโดยไม่ต้องใส่รหัส */
API_.teacherAuto = function (store) {
  var email = String(store.activeUserEmail() || '').toLowerCase();
  var list = settings_(store).adminEmails.toLowerCase().split(/[,\s]+/).filter(String);
  if (!email || list.indexOf(email) < 0) return { token: null };
  return { token: newToken_(store, { role: 'teacher', name: email }), email: email };
};

API_.logout = function (store, p) { if (p.token) store.cacheRemove('tok_' + p.token); return { ok: true }; };

API_.courseMap = function (store, p) {
  var st = requireStudent_(store, p), S = settings_(store), course = loadCourse_(store);
  var prog = progressFor_(store, st.id, course, S);
  var certs = store.all('Certificates').filter(function (c) { return c.studentId === st.id; }).map(function (c) { return publicCert_(c, st, S, store); });
  return {
    student: publicStudent_(st), settings: publicSettings_(S, store),
    overall: { percent: prog.percent, earned: prog.earned, max: prog.max, allPassed: prog.allPassed }, bonus: prog.bonus,
    activity: activitySeries_(store.all('Attempts').filter(function (t) { return t.studentId === st.id; }), store.now(), 14),
    units: course.units.map(function (u, i) {
      var up = prog.unitById[u.id];
      return { id: u.id, no: i + 1, title: u.title, mission: u.mission, icon: u.icon, summary: u.summary, bonus: up.bonus,
        percent: up.percent, need: up.need, passed: up.passed, locked: up.locked, level: up.level, doneCount: up.doneCount, total: up.total,
        earned: up.earned, max: up.max,
        activities: course.acts.filter(function (a) { return a.unitId === u.id; }).map(function (a) {
          var ap = prog.act[a.id];
          return { id: a.id, type: a.type, typeName: TYPE_NAMES[a.type], title: a.title, max: a.max, best: ap.best, attempts: ap.attempts, done: ap.done, override: ap.override !== null };
        }) };
    }),
    certificates: certs
  };
};

API_.getActivity = function (store, p) {
  var st = requireStudent_(store, p), ctx = activityForStudent_(store, st, p.activityId), a = ctx.act, d = a.data;
  var ap = ctx.prog.act[a.id];
  var unitIndex = ctx.course.units.map(function (u) { return u.id; }).indexOf(a.unitId);
  var out = { id: a.id, unitId: a.unitId, unitNo: unitIndex + 1, unitTitle: ctx.course.units[unitIndex].title, unitBonus: ctx.course.units[unitIndex].kind === 'bonus', type: a.type, typeName: TYPE_NAMES[a.type], title: a.title,
    max: a.max, best: ap.best, attempts: ap.attempts, done: ap.done, hintPenalty: num_(ctx.S.hintPenalty, 10),
    integrity: { penaltyPct: num_(ctx.S.integrityPenalty, 10), maxStrikes: Math.max(1, num_(ctx.S.quizMaxStrikes, 2)), count: 0 } };
  if (a.type === 'knowledge') { out.content = d.content || ''; return out; }
  if (a.type === 'quiz') {
    var sessions = store.all('QuizSessions').filter(function (q) { return q.studentId === st.id && q.activityId === a.id; });
    var now = store.now().getTime();
    var active = sessions.filter(function (q) { return !q.submittedAt && new Date(q.deadlineAt).getTime() + QUIZ_GRACE_MS > now; })[0];
    out.intro = d.intro || ''; out.questionCount = quizDraw_(d); out.bankSize = (d.questions || []).length; out.timeLimitMin = num_(d.timeLimitMin, 0);
    out.maxAttempts = num_(d.maxAttempts, 0); out.attemptsUsed = sessions.length; out.activeSession = !!active;
    return out;
  }
  var hints = store.all('HintsUsed').filter(function (h) { return h.studentId === st.id && h.activityId === a.id; });
  var last = store.all('Attempts').filter(function (t) { return t.studentId === st.id && t.activityId === a.id; })
    .sort(function (x, y) { return String(x.submittedAt) < String(y.submittedAt) ? 1 : -1; })[0];
  var lastDetail = last ? parseJson_(last.detailJson, {}) : {};
  out.intro = d.intro || '';
  out.maxAttempts = num_(d.maxAttempts, 0);
  out.integrity.count = integrityOf_(store, st.id, a.id).length;
  out.tasks = (d.tasks || []).map(function (t, i) {
    var used = hints.filter(function (h) { return num_(h.taskIndex) === i; }).map(function (h) { return num_(h.hintIndex); }).sort();
    var lt = (lastDetail.tasks || [])[i];
    return { title: t.title, prompt: t.prompt || '', lang: t.lang || 'html', starterCode: t.starterCode || '', sampleInput: t.sampleInput || '', max: taskMax_(t),
      hintCount: (t.hints || []).length, hints: used.map(function (k) { return (t.hints || [])[k]; }).filter(String),
      lastCode: lt ? lt.code : null, sheets: t.sheets || null, call: t.call || '',
      tests: (t.tests || []).map(function (x) { return { input: x.input || '', check: x.check || '', label: x.label || '', expected: x.hidden ? null : String(x.expected), hidden: !!x.hidden, score: num_(x.score, 1), compare: x.compare || 'trim', sheets: x.sheets || null }; }) };
  });
  return out;
};

API_.markRead = function (store, p) {
  var st = requireStudent_(store, p);
  return store.lock(function () {
    var ctx = activityForStudent_(store, st, p.activityId);
    if (ctx.act.type !== 'knowledge') fail_('กิจกรรมนี้ไม่ใช่ใบความรู้');
    if (!ctx.prog.act[ctx.act.id].done) {
      store.insert('Attempts', { id: store.uuid(), studentId: st.id, activityId: ctx.act.id, attemptNo: 1, submittedAt: iso_(store), score: 0, maxScore: 0, detailJson: '{"read":true}' });
    }
    var r = afterChange_(store, st, ctx.course, ctx.S);
    return { ok: true, unit: r.prog.unitById[ctx.act.unitId], newCertificates: r.issued };
  });
};

API_.revealHint = function (store, p) {
  var st = requireStudent_(store, p);
  return store.lock(function () {
    var ctx = activityForStudent_(store, st, p.activityId);
    var task = ((ctx.act.data.tasks) || [])[num_(p.taskIndex)];
    if (!task) fail_('ไม่พบข้อนี้');
    var hints = task.hints || [];
    var used = store.all('HintsUsed').filter(function (h) { return h.studentId === st.id && h.activityId === ctx.act.id && num_(h.taskIndex) === num_(p.taskIndex); });
    if (used.length >= hints.length) fail_('ใช้คำใบ้ครบทุกข้อแล้ว');
    store.insert('HintsUsed', { id: store.uuid(), studentId: st.id, activityId: ctx.act.id, taskIndex: num_(p.taskIndex), hintIndex: used.length, at: iso_(store) });
    return { hint: hints[used.length], hintIndex: used.length, remaining: hints.length - used.length - 1 };
  });
};

/**
 * ส่งงานเขียนโปรแกรม (ใบงาน/แบบฝึก)
 * p.tasks = [{ code, outputs: [ผลลัพธ์ของแต่ละ test case ตามลำดับ] }]
 * เซิร์ฟเวอร์เป็นคนเทียบกับผลที่ควรได้ (expected ของ test ที่ซ่อนไม่เคยส่งไปหน้าเว็บ)
 */
API_.submitTasks = function (store, p) {
  var st = requireStudent_(store, p);
  return store.lock(function () {
    var ctx = activityForStudent_(store, st, p.activityId), a = ctx.act;
    if (a.type !== 'worksheet' && a.type !== 'practice') fail_('กิจกรรมนี้ส่งงานแบบเขียนโปรแกรมไม่ได้');
    var maxAtt = num_(a.data.maxAttempts, 0), ap = ctx.prog.act[a.id];
    if (maxAtt && ap.attempts >= maxAtt) fail_('ส่งงานครบ ' + maxAtt + ' ครั้งแล้ว');
    var penaltyPct = num_(ctx.S.hintPenalty, 10);
    var hints = store.all('HintsUsed').filter(function (h) { return h.studentId === st.id && h.activityId === a.id; });
    var sent = p.tasks || [];
    var total = 0, max = 0;
    var detail = (a.data.tasks || []).map(function (t, i) {
      var s = sent[i] || {}, outs = s.outputs || [];
      var code = String(s.code || '');
      if (code.length > MAX_CODE_CHARS) fail_('โค้ดข้อ ' + (i + 1) + ' ยาวเกิน ' + MAX_CODE_CHARS + ' ตัวอักษร');
      var tmax = taskMax_(t), earned = 0;
      var results = (t.tests || []).map(function (x, j) {
        var ok = outs[j] !== undefined && outs[j] !== null && compareOutput_(outs[j], x.expected, x.compare);
        if (ok) earned += num_(x.score, 1);
        return { pass: ok, hidden: !!x.hidden, expected: x.hidden ? null : String(x.expected), actual: x.hidden ? null : (outs[j] === undefined ? null : String(outs[j]).slice(0, 2000)) };
      });
      var nh = hints.filter(function (h) { return num_(h.taskIndex) === i; }).length;
      var penalty = earned > 0 ? Math.min(earned, round1_(tmax * penaltyPct / 100 * nh)) : 0;
      earned = round1_(earned - penalty);
      total += earned; max += tmax;
      return { code: code, earned: earned, max: tmax, penalty: penalty, hintsUsed: nh, results: results };
    });
    // หักคะแนนเมื่อพยายามวางข้อความจากภายนอกลงพื้นที่ทำงาน (บันทึกไว้ในแท็บ Integrity)
    var vio = integrityOf_(store, st.id, a.id).length;
    var ipen = integrityPenalty_(round1_(total), max, vio, num_(ctx.S.integrityPenalty, 10));
    total = round1_(total - ipen);
    store.insert('Attempts', { id: store.uuid(), studentId: st.id, activityId: a.id, attemptNo: ap.attempts + 1, submittedAt: iso_(store),
      score: round1_(total), maxScore: max, detailJson: JSON.stringify({ integrity: { count: vio, penalty: ipen }, tasks: detail.map(function (x) { return { code: x.code, earned: x.earned, max: x.max, penalty: x.penalty, pass: x.results.map(function (r) { return r.pass; }) }; }) }) });
    var r = afterChange_(store, st, ctx.course, ctx.S);
    return { score: round1_(total), max: max, best: r.prog.act[a.id].best, attemptNo: ap.attempts + 1, tasks: detail.map(function (x) { delete x.code; return x; }),
      integrity: { count: vio, penalty: ipen }, unit: r.prog.unitById[a.unitId], newCertificates: r.issued };
  });
};

function publicQuestions_(d, order) {
  var qById = {}; (d.questions || []).forEach(function (q) { qById[q.id] = q; });
  return order.map(function (o) {
    var q = qById[o.id]; if (!q) return null;
    var pq = { id: q.id, type: q.type, text: q.text, code: q.code || '', score: num_(q.score, 1) };
    if (q.type === 'mc') pq.choices = o.choices.map(function (i) { return { i: i, text: q.choices[i] }; });
    return pq;
  }).filter(Boolean);
}

API_.startQuiz = function (store, p) {
  var st = requireStudent_(store, p);
  return store.lock(function () {
    var ctx = activityForStudent_(store, st, p.activityId), a = ctx.act, d = a.data;
    if (a.type !== 'quiz') fail_('กิจกรรมนี้ไม่ใช่แบบทดสอบ');
    var now = store.now();
    var sessions = store.all('QuizSessions').filter(function (q) { return q.studentId === st.id && q.activityId === a.id; });
    var active = sessions.filter(function (q) { return !q.submittedAt && new Date(q.deadlineAt).getTime() + QUIZ_GRACE_MS > now.getTime(); })[0];
    if (!active) {
      var maxAtt = num_(d.maxAttempts, 0);
      if (maxAtt && sessions.length >= maxAtt) fail_('ทำแบบทดสอบครบ ' + maxAtt + ' ครั้งแล้ว');
      var qs = d.questions || [];
      // สุ่มลำดับข้อ (และสุ่มเลือกจากคลังเมื่อกำหนด drawCount) ทุกคนจึงได้ข้อสอบไม่เหมือนกัน
      var drawn = quizDraw_(d) < qs.length ? shuffle_(qs).slice(0, quizDraw_(d)) : qs;
      var picked = d.shuffle === false ? qs.filter(function (q) { return drawn.indexOf(q) >= 0; }) : shuffle_(drawn);
      var order = picked.map(function (q) {
        var idx = (q.choices || []).map(function (_, i) { return i; });
        return { id: q.id, choices: q.type === 'mc' && d.shuffleChoices !== false ? shuffle_(idx) : idx };
      });
      var mins = num_(d.timeLimitMin, 0) || 24 * 60;
      active = { id: store.uuid(), studentId: st.id, activityId: a.id, startedAt: now.toISOString(),
        deadlineAt: new Date(now.getTime() + mins * 60000).toISOString(), submittedAt: '', orderJson: JSON.stringify(order) };
      store.insert('QuizSessions', active);
    }
    return { sessionId: active.id, deadlineAt: active.deadlineAt, serverNow: now.toISOString(), timeLimitMin: num_(d.timeLimitMin, 0),
      attemptNo: sessions.filter(function (q) { return q.id !== active.id; }).length + 1,
      strikes: integrityOf_(store, st.id, a.id, active.id).length, maxStrikes: Math.max(1, num_(ctx.S.quizMaxStrikes, 2)), penaltyPct: num_(ctx.S.integrityPenalty, 10),
      questions: publicQuestions_(d, parseJson_(active.orderJson, [])) };
  });
};

function gradeQuestion_(q, ans) {
  if (ans === undefined || ans === null || ans === '') return false;
  if (q.type === 'mc') return num_(ans, -1) === num_(q.answer, -2);
  if (q.type === 'tf') return String(ans) === String(q.answer);
  var accepted = [].concat(q.answer);
  if (q.type === 'output') return accepted.some(function (x) { return normalizeOut_(ans) === normalizeOut_(x); });
  return accepted.some(function (x) { return normalizeAnswer_(ans) === normalizeAnswer_(x); });
}
function answerText_(q) {
  if (q.type === 'mc') return q.choices[num_(q.answer)];
  if (q.type === 'tf') return String(q.answer) === 'true' ? 'ถูก' : 'ผิด';
  return [].concat(q.answer)[0];
}

API_.submitQuiz = function (store, p) {
  var st = requireStudent_(store, p);
  return store.lock(function () {
    var sess = store.all('QuizSessions').filter(function (q) { return q.id === p.sessionId && q.studentId === st.id; })[0];
    if (!sess) fail_('ไม่พบรอบการสอบนี้');
    if (sess.submittedAt) fail_('ส่งคำตอบรอบนี้ไปแล้ว');
    var ctx = activityForStudent_(store, st, sess.activityId), a = ctx.act, d = a.data;
    var now = store.now();
    var late = now.getTime() > new Date(sess.deadlineAt).getTime() + QUIZ_GRACE_MS;
    var answers = p.answers || {};
    var total = 0, max = 0;
    var inSession = {}; parseJson_(sess.orderJson, []).forEach(function (o) { inSession[o.id] = true; });
    var results = (d.questions || []).filter(function (q) { return inSession[q.id]; }).map(function (q) {
      var sc = num_(q.score, 1), ok = !late && gradeQuestion_(q, answers[q.id]);
      max += sc; if (ok) total += sc;
      return { id: q.id, correct: ok, score: ok ? sc : 0, max: sc };
    });
    // สุ่มจากคลัง: ปรับคะแนนให้เทียบกับคะแนนเต็มของกิจกรรม
    if (max > 0 && max !== a.max) { total = round1_(total / max * a.max); max = a.max; }
    // ทุจริต: หักคะแนนตามจำนวนครั้ง และถ้าครบจำนวนที่กำหนดหรือถูกให้ออกจากการสอบ ถือว่าทุจริต
    var strikes = integrityOf_(store, st.id, a.id, sess.id).length, maxStrikes = Math.max(1, num_(ctx.S.quizMaxStrikes, 2));
    var cheat = !!p.forced || strikes >= maxStrikes;
    var ipen = integrityPenalty_(total, max, strikes, num_(ctx.S.integrityPenalty, 10));
    total = round1_(total - ipen);
    if (cheat) log_(store, st.studentCode, 'ทุจริตในการสอบ', a.title + ' (' + strikes + ' ครั้ง)');
    store.update('QuizSessions', sess.id, { submittedAt: now.toISOString() });
    var used = store.all('QuizSessions').filter(function (q) { return q.studentId === st.id && q.activityId === a.id; }).length;
    var maxAtt = num_(d.maxAttempts, 0);
    var finished = maxAtt > 0 && used >= maxAtt;
    var ap = ctx.prog.act[a.id];
    store.insert('Attempts', { id: store.uuid(), studentId: st.id, activityId: a.id, attemptNo: ap.attempts + 1, submittedAt: now.toISOString(),
      score: total, maxScore: max, detailJson: JSON.stringify({ sessionId: sess.id, late: late, answers: answers, correct: results.map(function (r) { return r.correct; }), integrity: { count: strikes, penalty: ipen, cheat: cheat } }) });
    var r = afterChange_(store, st, ctx.course, ctx.S);
    var qById = {}; (d.questions || []).forEach(function (q) { qById[q.id] = q; });
    return { score: total, max: max, late: late, best: r.prog.act[a.id].best, attemptsUsed: used, maxAttempts: maxAtt,
      integrity: { count: strikes, penalty: ipen, cheat: cheat },
      revealAnswers: finished || d.revealAnswers === 'always',
      results: results.map(function (x) {
        var q = qById[x.id];
        var o = { id: x.id, correct: x.correct, score: x.score, max: x.max, explain: q.explain || '' };
        if (finished || d.revealAnswers === 'always') o.answer = answerText_(q);
        return o;
      }),
      unit: r.prog.unitById[a.unitId], newCertificates: r.issued };
  });
};

/**
 * บันทึกพฤติกรรมที่ไม่ซื่อสัตย์ (วางข้อความจากภายนอกในใบงาน / คัดลอกหรือออกจากหน้าแบบทดสอบ)
 * p = { activityId, kind: paste|drop|copy|leave|print|devtools, sessionId (แบบทดสอบ), detail }
 */
API_.reportIntegrity = function (store, p) {
  var st = requireStudent_(store, p);
  var kind = INTEGRITY_KINDS[p.kind] ? p.kind : 'paste';
  return store.lock(function () {
    var ctx = activityForStudent_(store, st, p.activityId), a = ctx.act;
    if (a.type === 'knowledge') fail_('ใบความรู้ไม่มีการตรวจการคัดลอก');
    var sid = '';
    if (a.type === 'quiz') {
      var sess = store.all('QuizSessions').filter(function (q) { return q.id === p.sessionId && q.studentId === st.id && q.activityId === a.id && !q.submittedAt; })[0];
      if (!sess) fail_('ไม่พบรอบการสอบที่กำลังทำ');
      sid = sess.id;
    }
    var maxStrikes = Math.max(1, num_(ctx.S.quizMaxStrikes, 2)), pct = num_(ctx.S.integrityPenalty, 10);
    // เหตุการณ์เดียวกันอาจถูกจับได้หลายทาง (เช่น blur + สลับแท็บ) นับครั้งเดียวภายใน 2 วินาที
    var ck = 'int_' + st.id + '_' + a.id + '_' + kind;
    if (!store.cacheGet(ck)) {
      store.cachePut(ck, '1', 2);
      store.insert('Integrity', { id: store.uuid(), studentId: st.id, activityId: a.id, sessionId: sid, kind: kind, detail: String(p.detail || '').slice(0, 200), at: iso_(store) });
      log_(store, st.studentCode, 'แจ้งเตือนทุจริต', a.title + ' · ' + INTEGRITY_KINDS[kind]);
    }
    var count = integrityOf_(store, st.id, a.id, sid).length;
    return { count: count, penaltyPct: pct, maxStrikes: maxStrikes, kickOut: a.type === 'quiz' && count >= maxStrikes, kindName: INTEGRITY_KINDS[kind] };
  });
};

API_.myScores = function (store, p) {
  var st = requireStudent_(store, p), S = settings_(store), course = loadCourse_(store);
  var prog = progressFor_(store, st.id, course, S);
  var atts = store.all('Attempts').filter(function (t) { return t.studentId === st.id && num_(t.maxScore) > 0; })
    .sort(function (a, b) { return String(a.submittedAt) < String(b.submittedAt) ? 1 : -1; }).slice(0, 50)
    .map(function (t) { var a = course.actById[t.activityId]; return { at: t.submittedAt, title: a ? a.title : '-', type: a ? TYPE_NAMES[a.type] : '', score: num_(t.score), max: num_(t.maxScore) }; });
  var byType = {};
  course.acts.forEach(function (a) {
    if (!a.max) return;
    var x = byType[a.type] = byType[a.type] || { type: a.type, name: TYPE_NAMES[a.type], earned: 0, max: 0 };
    x.earned += prog.act[a.id].best || 0; x.max += a.max;
  });
  return { student: publicStudent_(st), overall: { percent: prog.percent, earned: prog.earned, max: prog.max }, bonus: prog.bonus,
    byType: Object.keys(byType).map(function (k) { var x = byType[k]; x.percent = x.max ? round1_(x.earned / x.max * 100) : 0; return x; }),
    activity: activitySeries_(store.all('Attempts').filter(function (t) { return t.studentId === st.id; }), store.now(), 14),
    units: course.units.map(function (u, i) {
      var up = prog.unitById[u.id];
      return { no: i + 1, title: u.title, icon: u.icon, bonus: up.bonus, percent: up.percent, passed: up.passed, level: up.level, earned: up.earned, max: up.max,
        activities: course.acts.filter(function (a) { return a.unitId === u.id; }).map(function (a) {
          var x = prog.act[a.id]; return { title: a.title, typeName: TYPE_NAMES[a.type], best: x.best, max: a.max, attempts: x.attempts, done: x.done, override: x.override !== null };
        }) };
    }), history: atts };
};

/** ตรวจสอบเกียรติบัตร (สาธารณะ ต้องมีทั้งเลขที่และรหัสตรวจสอบ) */
API_.getCertificate = function (store, p) {
  var c = store.all('Certificates').filter(function (x) { return x.certNo === p.certNo; })[0];
  var S = settings_(store);
  var allowed = c && (String(p.code || '') === c.verifyCode);
  if (!allowed && c && p.token) {
    try { var s = session_(store, p); allowed = s.role === 'teacher' || s.studentId === c.studentId; } catch (e) { allowed = false; }
  }
  if (!allowed) fail_('ไม่พบเกียรติบัตร หรือรหัสตรวจสอบไม่ถูกต้อง');
  var st = store.all('Students').filter(function (x) { return x.id === c.studentId; })[0];
  return { cert: publicCert_(c, st, S, store), settings: certSettings_(S, store) };
};

/* ---------------- API ฝั่งครู ---------------- */
function allProgress_(store) {
  var S = settings_(store), course = loadCourse_(store);
  var students = store.all('Students').filter(function (s) { return s.status !== 'deleted'; });
  var atts = store.all('Attempts'), ovs = store.all('Overrides');
  var aBy = {}, oBy = {};
  atts.forEach(function (t) { (aBy[t.studentId] = aBy[t.studentId] || []).push(t); });
  ovs.forEach(function (o) { (oBy[o.studentId] = oBy[o.studentId] || []).push(o); });
  var rows = students.map(function (s) {
    var mine = aBy[s.id] || [];
    var last = mine.reduce(function (m, t) { return String(t.submittedAt) > m ? String(t.submittedAt) : m; }, '');
    return { student: s, prog: computeProgress_(course, mine, oBy[s.id] || [], S), last: last };
  });
  return { S: S, course: course, rows: rows, atts: atts };
}

API_.tDashboard = function (store, p) {
  requireTeacher_(store, p);
  var all = allProgress_(store), course = all.course;
  var now = store.now().getTime(), week = 7 * 86400000;
  var active = all.rows.filter(function (r) { return r.student.status !== 'inactive'; });
  var certs = store.all('Certificates');
  var nameOf = {}; all.rows.forEach(function (r) { nameOf[r.student.id] = fullName_(r.student); });
  return {
    settings: publicSettings_(all.S, store),
    kpi: {
      students: active.length,
      avgPercent: active.length ? round1_(sum_(active, function (r) { return r.prog.percent; }) / active.length) : 0,
      certificates: certs.length,
      finished: active.filter(function (r) { return r.prog.allPassed; }).length
    },
    activity: activitySeries_(all.atts, store.now(), 14),
    distribution: [0, 10, 20, 30, 40, 50, 60, 70, 80, 90].map(function (lo) {
      return { lo: lo, hi: lo + 10, n: active.filter(function (r) { var p = r.prog.percent; return p >= lo && (lo === 90 ? p <= 100 : p < lo + 10); }).length };
    }),
    status: {
      finished: active.filter(function (r) { return r.prog.allPassed; }).length,
      learning: active.filter(function (r) { return !r.prog.allPassed && r.last; }).length,
      notStarted: active.filter(function (r) { return !r.last; }).length
    },
    integrity: (function () {
      var rows = store.all('Integrity'), acts = course.actById;
      return { total: rows.length, students: Object.keys(rows.reduce(function (m, x) { m[x.studentId] = 1; return m; }, {})).length,
        recent: rows.sort(function (a, b) { return String(a.at) < String(b.at) ? 1 : -1; }).slice(0, 10).map(function (x) {
          return { at: x.at, name: nameOf[x.studentId] || '-', title: acts[x.activityId] ? acts[x.activityId].title : '-', kind: INTEGRITY_KINDS[x.kind] || x.kind, quiz: !!x.sessionId };
        }) };
    })(),
    units: course.units.map(function (u, i) {
      return { no: i + 1, title: u.title, icon: u.icon, bonus: u.kind === 'bonus',
        passed: active.filter(function (r) { return r.prog.unitById[u.id].passed; }).length,
        started: active.filter(function (r) { return r.prog.unitById[u.id].doneCount > 0; }).length,
        avg: active.length ? round1_(sum_(active, function (r) { return r.prog.unitById[u.id].percent; }) / active.length) : 0 };
    }),
    inactive: active.filter(function (r) { return !r.last || now - new Date(r.last).getTime() > week; })
      .map(function (r) { return { id: r.student.id, name: fullName_(r.student), studentCode: r.student.studentCode, room: r.student.room, last: r.last }; }),
    recent: all.atts.filter(function (t) { return num_(t.maxScore) > 0; }).sort(function (a, b) { return String(a.submittedAt) < String(b.submittedAt) ? 1 : -1; }).slice(0, 12)
      .map(function (t) { var a = course.actById[t.activityId]; return { at: t.submittedAt, name: nameOf[t.studentId] || '-', title: a ? a.title : '-', score: num_(t.score), max: num_(t.maxScore) }; })
  };
};

API_.tGradebook = function (store, p) {
  requireTeacher_(store, p);
  var all = allProgress_(store), course = all.course;
  return {
    settings: publicSettings_(all.S, store),
    units: course.units.map(function (u, i) { return { id: u.id, no: i + 1, title: u.title, icon: u.icon, bonus: u.kind === 'bonus' }; }),
    integrity: store.all('Integrity').reduce(function (m, x) { m[x.studentId] = (m[x.studentId] || 0) + 1; return m; }, {}),
    activities: course.acts.map(function (a) { return { id: a.id, unitId: a.unitId, type: a.type, typeName: TYPE_NAMES[a.type], title: a.title, max: a.max }; }),
    rows: all.rows.map(function (r) {
      var acts = {}; course.acts.forEach(function (a) { var x = r.prog.act[a.id]; acts[a.id] = { best: x.best, attempts: x.attempts, done: x.done, override: x.override !== null }; });
      var units = {}; r.prog.units.forEach(function (u) { units[u.id] = { percent: u.percent, passed: u.passed, level: u.level ? u.level.name : '' }; });
      return { student: publicStudent_(r.student), status: r.student.status || 'active', isSample: r.student.isSample === 'yes',
        percent: r.prog.percent, earned: r.prog.earned, max: r.prog.max, allPassed: r.prog.allPassed, bonus: r.prog.bonus, last: r.last, acts: acts, units: units };
    })
  };
};

API_.tStudentDetail = function (store, p) {
  requireTeacher_(store, p);
  var st = store.all('Students').filter(function (s) { return s.id === p.studentId; })[0];
  if (!st) fail_('ไม่พบนักศึกษา');
  var course = loadCourse_(store);
  var atts = store.all('Attempts').filter(function (t) { return t.studentId === st.id && num_(t.maxScore) > 0; })
    .sort(function (a, b) { return String(a.submittedAt) < String(b.submittedAt) ? 1 : -1; })
    .map(function (t) { var a = course.actById[t.activityId]; return { at: t.submittedAt, activityId: t.activityId, title: a ? a.title : '-', type: a ? a.type : '', score: num_(t.score), max: num_(t.maxScore), detail: parseJson_(t.detailJson, {}) }; });
  var ovs = store.all('Overrides').filter(function (o) { return o.studentId === st.id; });
  var certs = store.all('Certificates').filter(function (c) { return c.studentId === st.id; }).map(function (c) { return publicCert_(c, st, settings_(store), store); });
  var integrity = store.all('Integrity').filter(function (x) { return x.studentId === st.id; })
    .sort(function (a, b) { return String(a.at) < String(b.at) ? 1 : -1; })
    .map(function (x) { var a = course.actById[x.activityId]; return { at: x.at, title: a ? a.title : '-', kind: INTEGRITY_KINDS[x.kind] || x.kind, quiz: !!x.sessionId }; });
  return { student: publicStudent_(st), status: st.status || 'active', attempts: atts, overrides: ovs, certificates: certs, integrity: integrity };
};

/** ครูตั้ง PIN ให้นักศึกษาเอง (ตัวเลข 4–8 หลัก) */
API_.tSetPin = function (store, p) {
  var t = requireTeacher_(store, p);
  var pin = String(p.pin || '').trim();
  if (!/^\d{4,8}$/.test(pin)) fail_('PIN ต้องเป็นตัวเลข 4–8 หลัก');
  return store.lock(function () {
    var st = store.all('Students').filter(function (s) { return s.id === p.studentId; })[0];
    if (!st) fail_('ไม่พบนักศึกษา');
    store.update('Students', st.id, { pinHash: pinHash_(store, st.studentCode, pin) });
    store.cacheRemove('fail_' + String(st.studentCode).trim());
    log_(store, t.name, 'ตั้ง PIN ใหม่', st.studentCode);
    return { ok: true, pin: pin, studentCode: st.studentCode, name: fullName_(st) };
  });
};

API_.tSaveStudent = function (store, p) {
  var t = requireTeacher_(store, p), s = p.student || {};
  return store.lock(function () {
    var code = String(s.studentCode || '').trim();
    if (!code || !String(s.firstName || '').trim()) fail_('กรอกรหัสนักศึกษาและชื่อให้ครบ');
    var all = store.all('Students');
    var dup = all.filter(function (x) { return String(x.studentCode).trim() === code && x.id !== s.id && x.status !== 'deleted'; })[0];
    if (dup) fail_('รหัสนักศึกษา ' + code + ' มีอยู่แล้ว');
    var patch = { studentCode: code, prefix: String(s.prefix || '').trim(), firstName: String(s.firstName).trim(), lastName: String(s.lastName || '').trim(), room: String(s.room || '').trim(), status: s.status || 'active' };
    if (s.id) {
      var old = all.filter(function (x) { return x.id === s.id; })[0];
      if (!old) fail_('ไม่พบนักศึกษา');
      if (String(old.studentCode).trim() !== code) fail_('เปลี่ยนรหัสนักศึกษาไม่ได้ ให้เพิ่มเป็นคนใหม่ แล้วปิดบัญชีเดิม');
      store.update('Students', s.id, patch);
      log_(store, t.name, 'แก้ไขนักศึกษา', code);
      return { ok: true };
    }
    var pin = randomPin_(store);
    patch.id = store.uuid(); patch.pinHash = pinHash_(store, code, pin); patch.isSample = ''; patch.createdAt = iso_(store);
    store.insert('Students', patch);
    log_(store, t.name, 'เพิ่มนักศึกษา', code);
    return { ok: true, id: patch.id, pin: pin };
  });
};

/** p.rows = [{studentCode, prefix, firstName, lastName, room}] คืน PIN ของคนที่เพิ่มใหม่ (แสดงครั้งเดียว) */
API_.tImportStudents = function (store, p) {
  var t = requireTeacher_(store, p);
  return store.lock(function () {
    var existing = {}; store.all('Students').forEach(function (s) { if (s.status !== 'deleted') existing[String(s.studentCode).trim()] = true; });
    var created = [], skipped = [];
    (p.rows || []).forEach(function (r) {
      var code = String(r.studentCode || '').trim();
      if (!code || !String(r.firstName || '').trim()) { skipped.push({ studentCode: code, reason: 'ข้อมูลไม่ครบ' }); return; }
      if (existing[code]) { skipped.push({ studentCode: code, reason: 'รหัสซ้ำ' }); return; }
      var pin = randomPin_(store);
      var s = { id: store.uuid(), studentCode: code, prefix: String(r.prefix || '').trim(), firstName: String(r.firstName).trim(), lastName: String(r.lastName || '').trim(),
        room: String(r.room || '').trim(), pinHash: pinHash_(store, code, pin), status: 'active', isSample: '', createdAt: iso_(store) };
      store.insert('Students', s); existing[code] = true;
      created.push({ studentCode: code, name: fullName_(s), room: s.room, pin: pin });
    });
    log_(store, t.name, 'นำเข้านักศึกษา', created.length + ' คน');
    return { created: created, skipped: skipped };
  });
};

API_.tResetPin = function (store, p) {
  var t = requireTeacher_(store, p);
  return store.lock(function () {
    var st = store.all('Students').filter(function (s) { return s.id === p.studentId; })[0];
    if (!st) fail_('ไม่พบนักศึกษา');
    var pin = randomPin_(store);
    store.update('Students', st.id, { pinHash: pinHash_(store, st.studentCode, pin) });
    store.cacheRemove('fail_' + String(st.studentCode).trim());
    log_(store, t.name, 'ออก PIN ใหม่', st.studentCode);
    return { pin: pin, studentCode: st.studentCode, name: fullName_(st) };
  });
};

API_.tOverride = function (store, p) {
  var t = requireTeacher_(store, p);
  return store.lock(function () {
    var st = store.all('Students').filter(function (s) { return s.id === p.studentId; })[0];
    if (!st) fail_('ไม่พบนักศึกษา');
    var S = settings_(store), course = loadCourse_(store), a = course.actById[p.activityId];
    if (!a) fail_('ไม่พบกิจกรรม');
    var sc = Number(p.score);
    if (!isFinite(sc) || sc < 0 || sc > a.max) fail_('คะแนนต้องอยู่ระหว่าง 0 ถึง ' + a.max);
    if (!String(p.reason || '').trim()) fail_('ต้องระบุเหตุผลในการแก้คะแนน');
    store.insert('Overrides', { id: store.uuid(), studentId: st.id, activityId: a.id, score: sc, reason: String(p.reason).trim(), by: t.name, at: iso_(store) });
    log_(store, t.name, 'แก้คะแนน', st.studentCode + ' / ' + a.title + ' = ' + sc + ' (' + p.reason + ')');
    var r = afterChange_(store, st, course, S);
    return { ok: true, newCertificates: r.issued };
  });
};

API_.tCertificates = function (store, p) {
  requireTeacher_(store, p);
  var S = settings_(store), stBy = {};
  store.all('Students').forEach(function (s) { stBy[s.id] = s; });
  return store.all('Certificates').sort(function (a, b) { return String(a.issuedAt) < String(b.issuedAt) ? 1 : -1; })
    .map(function (c) { return publicCert_(c, stBy[c.studentId], S, store); });
};

/* ----- จัดการเนื้อหา ----- */
var ACTIVITY_TYPES = ['knowledge', 'worksheet', 'practice', 'quiz'];
function validateActivityData_(type, d) {
  if (ACTIVITY_TYPES.indexOf(type) < 0) fail_('ประเภทกิจกรรมต้องเป็น ' + ACTIVITY_TYPES.join(', '));
  if (type === 'knowledge') { if (typeof d.content !== 'string') fail_('ใบความรู้ต้องมี content (ข้อความ Markdown)'); return; }
  if (type === 'quiz') {
    if (!Array.isArray(d.questions) || !d.questions.length) fail_('แบบทดสอบต้องมี questions อย่างน้อย 1 ข้อ');
    var ids = {};
    d.questions.forEach(function (q, i) {
      var n = 'ข้อ ' + (i + 1) + ': ';
      if (!q.id) fail_(n + 'ต้องมี id'); if (ids[q.id]) fail_(n + 'id ซ้ำ'); ids[q.id] = true;
      if (['mc', 'tf', 'output', 'fill'].indexOf(q.type) < 0) fail_(n + 'type ต้องเป็น mc, tf, output หรือ fill');
      if (!q.text) fail_(n + 'ต้องมี text');
      if (q.type === 'mc' && (!Array.isArray(q.choices) || q.choices.length < 2 || !q.choices[num_(q.answer, -1)])) fail_(n + 'mc ต้องมี choices และ answer เป็นเลขตำแหน่ง (เริ่ม 0)');
      if (q.type === 'tf' && ['true', 'false'].indexOf(String(q.answer)) < 0) fail_(n + 'tf ต้องมี answer เป็น true หรือ false');
      if ((q.type === 'output' || q.type === 'fill') && (q.answer === undefined || q.answer === '')) fail_(n + 'ต้องมี answer');
    });
    return;
  }
  if (!Array.isArray(d.tasks) || !d.tasks.length) fail_('ใบงาน/แบบฝึกต้องมี tasks อย่างน้อย 1 ข้อ');
  d.tasks.forEach(function (t, i) {
    if (!t.title || !t.prompt) fail_('ข้อ ' + (i + 1) + ' ต้องมี title และ prompt');
    if (!Array.isArray(t.tests) || !t.tests.length) fail_('ข้อ ' + (i + 1) + ' ต้องมี tests อย่างน้อย 1 ชุด');
    t.tests.forEach(function (x, j) { if (x.expected === undefined) fail_('ข้อ ' + (i + 1) + ' test ' + (j + 1) + ' ต้องมี expected'); });
  });
}

API_.tCourse = function (store, p) {
  requireTeacher_(store, p);
  var units = store.all('Units').sort(function (a, b) { return num_(a.order) - num_(b.order); });
  var acts = store.all('Activities').sort(function (a, b) { return num_(a.order) - num_(b.order); });
  return { settings: publicSettings_(settings_(store), store), units: units, activities: acts.map(function (a) { return { id: a.id, unitId: a.unitId, order: a.order, type: a.type, typeName: TYPE_NAMES[a.type], title: a.title, status: a.status, dataJson: a.dataJson }; }) };
};

API_.tSaveUnit = function (store, p) {
  var t = requireTeacher_(store, p), u = p.unit || {};
  return store.lock(function () {
    if (!String(u.title || '').trim()) fail_('ต้องมีชื่อภารกิจ');
    var patch = { order: num_(u.order, 1), title: String(u.title).trim(), mission: String(u.mission || ''), icon: String(u.icon || '🎯'), summary: String(u.summary || ''), passPercent: u.passPercent === '' || u.passPercent === undefined ? '' : num_(u.passPercent, 60), status: u.status || 'active', kind: u.kind === 'bonus' ? 'bonus' : '' };
    if (u.id && store.all('Units').some(function (x) { return x.id === u.id; })) store.update('Units', u.id, patch);
    else { patch.id = u.id || ('U' + store.uuid().slice(0, 6)); store.insert('Units', patch); }
    log_(store, t.name, 'บันทึกภารกิจ', patch.title);
    return { ok: true, id: patch.id || u.id };
  });
};

API_.tSaveActivity = function (store, p) {
  var t = requireTeacher_(store, p), a = p.activity || {};
  return store.lock(function () {
    if (!String(a.title || '').trim()) fail_('ต้องมีชื่อกิจกรรม');
    if (!store.all('Units').some(function (u) { return u.id === a.unitId; })) fail_('ไม่พบภารกิจที่เลือก');
    var d = parseJson_(a.dataJson, null);
    if (!d) fail_('dataJson ไม่ใช่ JSON ที่ถูกต้อง');
    validateActivityData_(a.type, d);
    var patch = { unitId: a.unitId, order: num_(a.order, 1), type: a.type, title: String(a.title).trim(), dataJson: JSON.stringify(d), status: a.status || 'active' };
    if (patch.dataJson.length > 49000) fail_('เนื้อหายาวเกินที่ 1 ช่องของ Google Sheet เก็บได้ (50,000 ตัวอักษร) ให้แบ่งเป็นหลายกิจกรรม');
    if (a.id && store.all('Activities').some(function (x) { return x.id === a.id; })) store.update('Activities', a.id, patch);
    else { patch.id = a.id || ('A' + store.uuid().slice(0, 6)); store.insert('Activities', patch); }
    log_(store, t.name, 'บันทึกกิจกรรม', patch.title);
    return { ok: true, id: patch.id || a.id };
  });
};

API_.tExportCourse = function (store, p) {
  requireTeacher_(store, p);
  var acts = store.all('Activities');
  return { format: 'code-simulator-course', version: APP_VERSION, courseName: settings_(store).courseName,
    units: store.all('Units').sort(function (a, b) { return num_(a.order) - num_(b.order); }).map(function (u) {
      return { id: u.id, order: num_(u.order), title: u.title, mission: u.mission, icon: u.icon, summary: u.summary, passPercent: u.passPercent, status: u.status, kind: u.kind || '',
        activities: acts.filter(function (a) { return a.unitId === u.id; }).sort(function (a, b) { return num_(a.order) - num_(b.order); })
          .map(function (a) { return { id: a.id, order: num_(a.order), type: a.type, title: a.title, status: a.status, data: parseJson_(a.dataJson, {}) }; }) };
    }) };
};

/** แทนที่เนื้อหาทั้งหมดด้วยไฟล์ JSON (คะแนนเดิมยังอยู่ ถ้า id กิจกรรมตรงกัน) */
API_.tImportCourse = function (store, p) {
  var t = requireTeacher_(store, p);
  var c = parseJson_(p.json, null);
  if (!c || !Array.isArray(c.units)) fail_('ไฟล์ไม่ใช่รูปแบบเนื้อหาของระบบนี้');
  c.units.forEach(function (u) { (u.activities || []).forEach(function (a) { validateActivityData_(a.type, a.data || {}); }); });
  return store.lock(function () {
    importCourseData_(store, c);
    log_(store, t.name, 'นำเข้าเนื้อหา', c.units.length + ' ภารกิจ');
    return { ok: true, units: c.units.length };
  });
};

function importCourseData_(store, c) {
  store.removeWhere('Units', function () { return true; });
  store.removeWhere('Activities', function () { return true; });
  c.units.forEach(function (u, i) {
    var uid = u.id || ('U' + (i + 1));
    store.insert('Units', { id: uid, order: u.order || i + 1, title: u.title, mission: u.mission || '', icon: u.icon || '🎯', summary: u.summary || '', passPercent: u.passPercent === undefined ? '' : u.passPercent, status: u.status || 'active', kind: u.kind === 'bonus' ? 'bonus' : '' });
    (u.activities || []).forEach(function (a, j) {
      store.insert('Activities', { id: a.id || (uid + '-' + (j + 1)), unitId: uid, order: a.order || j + 1, type: a.type, title: a.title, dataJson: JSON.stringify(a.data || {}), status: a.status || 'active' });
    });
  });
}

/** จุดเรียกเดียวของทุก API */
function coreApi(store, method, payload) {
  var h = API_[method];
  if (!h) fail_('ไม่พบคำสั่ง ' + method);
  return h(store, payload || {});
}

/* ---------------- ข้อมูลตัวอย่าง ---------------- */
/** ใส่เนื้อหาตัวอย่าง + นักศึกษาตัวอย่าง 10 คน (PIN 1234) + ผลการเรียนสมมติ เพื่อให้เห็นภาพแดชบอร์ด */
function seedSampleData_(store, withContent) {
  return store.lock(function () {
    if (withContent) {
      importCourseData_(store, getSeedCourse_());
      // ระบบที่ติดตั้งรุ่น Python ไว้ → เปลี่ยนข้อมูลรายวิชาเป็นวิชาใหม่ (ถ้าครูไม่ได้แก้ชื่อวิชาเอง)
      var cur = store.settings() || {};
      if (!cur.courseName || OLD_COURSE_NAMES.indexOf(String(cur.courseName)) >= 0) {
        var patch = {}; ['courseName', 'courseCode', 'courseCredit', 'courseDescription'].forEach(function (k) { patch[k] = DEFAULT_SETTINGS[k]; });
        if (!cur.certPrefix || cur.certPrefix === 'CS') patch.certPrefix = DEFAULT_SETTINGS.certPrefix;
        store.setSettings(patch);
      }
    }
    var S = settings_(store), course = loadCourse_(store);
    var existing = {}; store.all('Students').forEach(function (s) { existing[String(s.studentCode)] = s; });
    var done = [0, 1, 2, 3, 10, 2, 1, 4, 0, 3];
    var created = 0, now = store.now().getTime();
    getSampleStudents_().forEach(function (x, k) {
      if (existing[x.studentCode]) return;
      var s = { id: store.uuid(), studentCode: x.studentCode, prefix: x.prefix, firstName: x.firstName, lastName: x.lastName, room: x.room,
        pinHash: pinHash_(store, x.studentCode, '1234'), status: 'active', isSample: 'yes', createdAt: new Date(now - 30 * 86400000).toISOString() };
      store.insert('Students', s); created++;
      var nUnits = Math.min(done[k], course.units.length);
      var day = 3 + (k % 4) * 3;
      course.units.forEach(function (u, ui) {
        var acts = course.acts.filter(function (a) { return a.unitId === u.id; });
        var partial = ui === nUnits && k !== 0 && k !== 8;
        if (ui > nUnits || (ui === nUnits && !partial)) return;
        acts.forEach(function (a, ai) {
          if (partial && ai > 1) return;
          var pct = a.max ? Math.min(1, 0.62 + ((k * 7 + ui * 3 + ai * 5) % 38) / 100) : 0;
          var at = new Date(now - (day + (nUnits - ui) * 2) * 86400000 + ai * 3600000).toISOString();
          store.insert('Attempts', { id: store.uuid(), studentId: s.id, activityId: a.id, attemptNo: 1, submittedAt: at,
            score: a.max ? Math.round(a.max * pct) : 0, maxScore: a.max, detailJson: '{"sample":true}' });
        });
      });
      syncCertificates_(store, s, course, progressFor_(store, s.id, course, S), S);
    });
    return { students: created, units: course.units.length };
  });
}

/** ลบนักศึกษาตัวอย่างและข้อมูลทั้งหมดของพวกเขา */
function clearSampleData_(store) {
  return store.lock(function () {
    var ids = {}; store.all('Students').forEach(function (s) { if (s.isSample === 'yes') ids[s.id] = true; });
    var mine = function (r) { return !!ids[r.studentId]; };
    ['Attempts', 'HintsUsed', 'QuizSessions', 'Overrides', 'Certificates', 'Integrity'].forEach(function (t) { store.removeWhere(t, mine); });
    store.removeWhere('Students', function (s) { return !!ids[s.id]; });
    return Object.keys(ids).length;
  });
}

/* ---------------- ตั้งค่าระบบ (แก้จากหน้าเว็บครู) ---------------- */
var SETTINGS_HELP = {
  schoolName: 'ชื่อสถานศึกษา (แสดงบนเกียรติบัตร)',
  department: 'แผนกวิชา',
  courseName: 'ชื่อรายวิชา',
  courseCode: 'รหัสวิชา เช่น 31909-2009',
  courseCredit: 'ทฤษฎี-ปฏิบัติ-หน่วยกิต เช่น 2-3-3',
  courseDescription: 'คำอธิบายรายวิชา (แสดงหน้าแรก)',
  academicYear: 'ปีการศึกษา (พ.ศ.)',
  semester: 'ภาคเรียน',
  passPercent: 'เกณฑ์ผ่านแต่ละภารกิจ (%) ตั้งรายภารกิจได้ในแท็บ เนื้อหา',
  hintPenalty: 'หักคะแนนต่อการเปิดคำใบ้ 1 ครั้ง (% ของคะแนนเต็มข้อนั้น)',
  lockSequential: 'yes = ต้องผ่านภารกิจก่อนหน้าจึงเปิดภารกิจถัดไป / no = เปิดทุกภารกิจ',
  primaryColor: 'สีหลักของหน้าเว็บ เช่น #4F46E5',
  logoUrl: 'ลิงก์รูปตราสถานศึกษา (https://...) สำหรับเกียรติบัตร เว้นว่างได้',
  certPrefix: 'อักษรนำหน้าเลขที่เกียรติบัตร',
  signer1Name: 'ชื่อผู้ลงนามคนที่ 1 (เช่น ครูผู้สอน)',
  signer1Position: 'ตำแหน่งผู้ลงนามคนที่ 1',
  signer2Name: 'ชื่อผู้ลงนามคนที่ 2 (เช่น ผู้อำนวยการ)',
  signer2Position: 'ตำแหน่งผู้ลงนามคนที่ 2',
  signer1Sig: 'ภาพลายเซ็นผู้ลงนามคนที่ 1 (ครูผู้สอน) อัปโหลดจากหน้าครู → ตั้งค่า',
  signer2Sig: 'ภาพลายเซ็นผู้ลงนามคนที่ 2 (ผู้อำนวยการ) อัปโหลดจากหน้าครู → ตั้งค่า',
  integrityPenalty: 'หักคะแนนต่อการทุจริต 1 ครั้ง (% ของคะแนนเต็มกิจกรรม) เช่น วางข้อความจากภายนอก ออกจากหน้าสอบ',
  quizMaxStrikes: 'จำนวนครั้งที่ออกจากหน้าสอบ/คัดลอกข้อสอบได้ ก่อนถูกให้ออกจากการสอบอัตโนมัติ',
  adminEmails: 'อีเมลครูที่เข้าหลังบ้านได้ทันทีโดยไม่ต้องใส่รหัส (คั่นด้วย ,) ใช้ได้เมื่อ Deploy แบบในโดเมนวิทยาลัย',
  publicUrl: 'ลิงก์หน้าเว็บบน GitHub Pages (เช่น https://ชื่อผู้ใช้.github.io/code-simulator/) ใช้ทำลิงก์ตรวจสอบเกียรติบัตร เว้นว่าง = ใช้ลิงก์ Apps Script'
};

function validateSetting_(k, v) {
  v = String(v === undefined || v === null ? '' : v).trim();
  if (k === 'signer1Sig' || k === 'signer2Sig') {
    if (v && !/^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+\/=]+$/.test(v)) fail_('ลายเซ็นต้องเป็นไฟล์ภาพ PNG / JPG');
    if (v.length > 45000) fail_('ไฟล์ลายเซ็นใหญ่เกินไป (ต้องไม่เกินประมาณ 33 KB) ลองครอปให้เหลือเฉพาะลายเซ็น');
    return v;
  }
  if (k === 'quizMaxStrikes') { var ms = Number(v); if (!/^\d+$/.test(v) || ms < 1 || ms > 10) fail_(SETTINGS_HELP[k] + ': ต้องเป็นจำนวนเต็ม 1–10'); return String(ms); }
  if (k === 'passPercent' || k === 'hintPenalty' || k === 'integrityPenalty') { var n = Number(v); if (v === '' || !isFinite(n) || n < 0 || n > 100) fail_(SETTINGS_HELP[k] + ': ต้องเป็นตัวเลข 0–100'); return String(n); }
  if (k === 'lockSequential' && v !== 'yes' && v !== 'no') fail_('lockSequential ต้องเป็น yes หรือ no');
  if (k === 'primaryColor' && !/^#[0-9a-fA-F]{6}$/.test(v)) fail_('สีหลักต้องอยู่ในรูป #RRGGBB เช่น #1E40AF');
  if ((k === 'logoUrl' || k === 'publicUrl') && v && !/^https:\/\/\S+$/.test(v)) fail_(k + ' ต้องขึ้นต้นด้วย https://');
  if ((k === 'schoolName' || k === 'courseName' || k === 'certPrefix') && !v) fail_(SETTINGS_HELP[k] + ' ห้ามว่าง');
  if (k === 'certPrefix' && !/^[A-Za-z0-9]{1,8}$/.test(v)) fail_('อักษรนำหน้าเกียรติบัตรใช้ A–Z หรือตัวเลข ไม่เกิน 8 ตัว');
  if (k === 'courseCredit' && v && !/^\d+-\d+-\d+$/.test(v)) fail_('หน่วยกิตต้องอยู่ในรูป ทฤษฎี-ปฏิบัติ-หน่วยกิต เช่น 2-3-3');
  if (v.length > (k === 'courseDescription' ? 2000 : 300)) fail_(k + ' ยาวเกินไป');
  return v;
}

API_.tSettings = function (store, p) {
  requireTeacher_(store, p);
  var S = settings_(store);
  return { items: Object.keys(DEFAULT_SETTINGS).map(function (k) { return { key: k, value: S[k], help: SETTINGS_HELP[k] || '', defaultValue: DEFAULT_SETTINGS[k] }; }),
    hasTeacherPassword: !!store.secret('teacherPassHash'), version: APP_VERSION };
};

API_.tSaveSettings = function (store, p) {
  var t = requireTeacher_(store, p), input = p.settings || {};
  return store.lock(function () {
    var patch = {};
    Object.keys(input).forEach(function (k) { if (DEFAULT_SETTINGS.hasOwnProperty(k)) patch[k] = validateSetting_(k, input[k]); });
    if (!Object.keys(patch).length) fail_('ไม่มีค่าที่เปลี่ยน');
    store.setSettings(patch);
    log_(store, t.name, 'แก้ตั้งค่า', Object.keys(patch).join(', '));
    return { ok: true, saved: Object.keys(patch) };
  });
};

API_.tChangePassword = function (store, p) {
  var t = requireTeacher_(store, p);
  var cur = store.secret('teacherPassHash'), salt = store.secret('salt');
  if (cur && store.hash(salt + ':teacher:' + String(p.oldPassword || '')) !== cur) fail_('รหัสผ่านเดิมไม่ถูกต้อง');
  var pw = String(p.newPassword || '');
  if (pw.length < 6) fail_('รหัสผ่านใหม่ต้องยาวอย่างน้อย 6 ตัวอักษร');
  store.setSecret('teacherPassHash', store.hash(salt + ':teacher:' + pw));
  log_(store, t.name, 'เปลี่ยนรหัสผ่านครู', '');
  return { ok: true };
};

/* ---------------- ลบข้อมูล ---------------- */
var SCORE_TABLES = ['Attempts', 'HintsUsed', 'QuizSessions', 'Overrides', 'Integrity'];

API_.tDeleteActivity = function (store, p) {
  var t = requireTeacher_(store, p);
  return store.lock(function () {
    var a = store.all('Activities').filter(function (x) { return x.id === p.activityId; })[0];
    if (!a) fail_('ไม่พบกิจกรรม');
    store.removeWhere('Activities', function (x) { return x.id === a.id; });
    var removed = 0;
    if (p.withScores) SCORE_TABLES.forEach(function (tb) { removed += store.removeWhere(tb, function (r) { return r.activityId === a.id; }); });
    log_(store, t.name, 'ลบกิจกรรม', a.title + (p.withScores ? ' พร้อมคะแนน ' + removed + ' แถว' : ''));
    return { ok: true, removedScores: removed };
  });
};

API_.tDeleteUnit = function (store, p) {
  var t = requireTeacher_(store, p);
  return store.lock(function () {
    var u = store.all('Units').filter(function (x) { return x.id === p.unitId; })[0];
    if (!u) fail_('ไม่พบภารกิจ');
    var acts = store.all('Activities').filter(function (a) { return a.unitId === u.id; });
    if (acts.length && !p.cascade) fail_('ภารกิจนี้ยังมีกิจกรรม ' + acts.length + ' รายการ ต้องยืนยันการลบพร้อมกิจกรรม');
    var ids = {}; acts.forEach(function (a) { ids[a.id] = true; });
    store.removeWhere('Activities', function (a) { return !!ids[a.id]; });
    store.removeWhere('Units', function (x) { return x.id === u.id; });
    if (p.withScores) SCORE_TABLES.forEach(function (tb) { store.removeWhere(tb, function (r) { return !!ids[r.activityId]; }); });
    log_(store, t.name, 'ลบภารกิจ', u.title + ' (' + acts.length + ' กิจกรรม)');
    return { ok: true, activities: acts.length };
  });
};

/** mode: soft = ซ่อน (คะแนนยังอยู่ กู้คืนได้) · hard = ลบถาวรพร้อมคะแนนและเกียรติบัตร · restore = กู้คืน */
API_.tDeleteStudent = function (store, p) {
  var t = requireTeacher_(store, p);
  return store.lock(function () {
    var st = store.all('Students').filter(function (s) { return s.id === p.studentId; })[0];
    if (!st) fail_('ไม่พบนักศึกษา');
    if (p.mode === 'restore') {
      var dup = store.all('Students').filter(function (s) { return s.id !== st.id && s.status !== 'deleted' && String(s.studentCode).trim() === String(st.studentCode).trim(); })[0];
      if (dup) fail_('มีนักศึกษารหัสนี้ใช้งานอยู่แล้ว กู้คืนไม่ได้');
      store.update('Students', st.id, { status: 'active' }); log_(store, t.name, 'กู้คืนนักศึกษา', st.studentCode); return { ok: true };
    }
    if (p.mode === 'hard') {
      if (String(p.confirmCode || '').trim() !== String(st.studentCode).trim()) fail_('พิมพ์รหัสนักศึกษาให้ตรงเพื่อยืนยันการลบถาวร');
      var mine = function (r) { return r.studentId === st.id; };
      SCORE_TABLES.concat(['Certificates']).forEach(function (tb) { store.removeWhere(tb, mine); });
      store.removeWhere('Students', function (s) { return s.id === st.id; });
      log_(store, t.name, 'ลบนักศึกษาถาวร', st.studentCode);
      return { ok: true };
    }
    store.update('Students', st.id, { status: 'deleted' });
    log_(store, t.name, 'ลบนักศึกษา (ซ่อน)', st.studentCode);
    return { ok: true };
  });
};

/** ล้างการส่งงานของนักศึกษา 1 คนใน 1 กิจกรรม ให้ทำใหม่ได้ */
API_.tResetActivity = function (store, p) {
  var t = requireTeacher_(store, p);
  return store.lock(function () {
    var st = store.all('Students').filter(function (s) { return s.id === p.studentId; })[0];
    if (!st) fail_('ไม่พบนักศึกษา');
    var match = function (r) { return r.studentId === st.id && r.activityId === p.activityId; };
    var n = 0;
    SCORE_TABLES.forEach(function (tb) { n += store.removeWhere(tb, match); });
    log_(store, t.name, 'ล้างการส่งงาน', st.studentCode + ' / ' + p.activityId + ' (' + n + ' แถว)');
    return { ok: true, removed: n };
  });
};

API_.tDeleteOverride = function (store, p) {
  var t = requireTeacher_(store, p);
  return store.lock(function () {
    var n = store.removeWhere('Overrides', function (o) { return o.id === p.overrideId; });
    if (!n) fail_('ไม่พบรายการปรับคะแนน');
    log_(store, t.name, 'ลบการปรับคะแนน', p.overrideId);
    return { ok: true };
  });
};

API_.tRevokeCertificate = function (store, p) {
  var t = requireTeacher_(store, p);
  return store.lock(function () {
    var c = store.all('Certificates').filter(function (x) { return x.certNo === p.certNo; })[0];
    if (!c) fail_('ไม่พบเกียรติบัตร');
    if (!String(p.reason || '').trim()) fail_('ต้องระบุเหตุผลในการเพิกถอน');
    store.removeWhere('Certificates', function (x) { return x.id === c.id; });
    log_(store, t.name, 'เพิกถอนเกียรติบัตร', c.certNo + ' (' + p.reason + ')');
    return { ok: true };
  });
};

/** ทดสอบการเชื่อมต่อฐานข้อมูล (ใช้จากหน้า GitHub Pages) */
API_.ping = function (store) {
  return { ok: true, version: APP_VERSION, time: iso_(store), units: store.all('Units').length, students: store.all('Students').length };
};

API_.tDeletedStudents = function (store, p) {
  requireTeacher_(store, p);
  return store.all('Students').filter(function (s) { return s.status === 'deleted'; }).map(publicStudent_);
};
