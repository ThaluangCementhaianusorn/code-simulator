/**
 * Code.gs — จุดเข้าเว็บแอป และ store ที่ใช้ Google Sheet เป็นฐานข้อมูล
 * ระบบสื่อการสอนเขียนโปรแกรมแบบปฏิสัมพันธ์ (Code Simulator)
 *
 * /exec              = หน้านักศึกษา
 * /exec?page=admin   = หลังบ้านครู
 * /exec?cert=..&code=.. = หน้าตรวจสอบเกียรติบัตร
 */
function doGet(e) {
  var p = (e && e.parameter) || {};
  if (p.api === 'ping') { // ทดสอบการเชื่อมต่อ: เปิด /exec?api=ping ในเบราว์เซอร์
    var res; try { res = { ok: true, data: api('ping', {}) }; } catch (err) { res = { ok: false, error: String(err.message || err) }; }
    return ContentService.createTextOutput(JSON.stringify(res)).setMimeType(ContentService.MimeType.JSON);
  }
  var boot = { page: p.page === 'admin' ? 'teacher' : (p.cert ? 'cert' : 'student'), cert: String(p.cert || ''), code: String(p.code || '') };
  var t = HtmlService.createTemplateFromFile('App');
  t.bootJson = JSON.stringify(boot).replace(/</g, '\\u003c');
  var title = 'ห้องเรียนพัฒนาเว็บแอปพลิเคชัน';
  try { title = settings_(sheetStore_()).courseName; } catch (err) { /* ยังไม่ติดตั้ง */ }
  return t.evaluate()
    .setTitle(title)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

/**
 * API แบบ JSON สำหรับหน้าเว็บที่อยู่นอก Google (เช่น GitHub Pages)
 * หน้าเว็บส่ง POST (Content-Type: text/plain เพื่อเลี่ยง CORS preflight) body = {"method": "...", "payload": {...}}
 * ตอบกลับ {"ok": true, "data": ...} หรือ {"ok": false, "error": "ข้อความ"}
 */
function doPost(e) {
  var out;
  try {
    var body = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    out = { ok: true, data: api(String(body.method || ''), body.payload || {}) };
  } catch (err) {
    out = { ok: false, error: String((err && err.message) || err) };
  }
  return ContentService.createTextOutput(JSON.stringify(out)).setMimeType(ContentService.MimeType.JSON);
}

function include(name) {
  return HtmlService.createHtmlOutputFromFile(name).getContent();
}

/** ฟังก์ชันเดียวที่หน้าเว็บเรียก: google.script.run.api(method, payload) */
function api(method, payload) {
  var store = sheetStore_();
  var result = coreApi(store, method, payload || {});
  return JSON.parse(JSON.stringify(result === undefined ? null : result));
}

/* ---------------- store บน Google Sheet ---------------- */
function sheetStore_() {
  var ss = SpreadsheetApp.getActive();
  if (!ss) throw new Error('สคริปต์ต้องผูกกับ Google Sheet');
  var props = PropertiesService.getScriptProperties();
  var savedId = props.getProperty('ssId');
  if (savedId !== ss.getId()) {
    throw new Error(savedId ? 'ไฟล์นี้เป็นสำเนา กรุณาเปิด Google Sheet แล้วเลือกเมนู ⚙️ ตั้งค่าระบบ → 1) ติดตั้งระบบ ก่อนใช้งาน'
      : 'ระบบยังไม่ได้ติดตั้ง กรุณาเปิด Google Sheet แล้วเลือกเมนู ⚙️ ตั้งค่าระบบ → 1) ติดตั้งระบบ');
  }
  var cache = CacheService.getScriptCache();
  var memo = {}, settingsMemo = null;

  function table(name) {
    if (memo[name]) return memo[name];
    var sh = ss.getSheetByName(name);
    if (!sh) throw new Error('ไม่พบแท็บ "' + name + '" กรุณาเลือกเมนู ⚙️ ตั้งค่าระบบ → 1) ติดตั้งระบบ');
    var values = sh.getDataRange().getValues();
    var head = (values[0] || []).map(String).filter(String);
    if (!head.length) head = SCHEMA[name];
    var rows = [];
    for (var i = 1; i < values.length; i++) {
      var r = values[i];
      if (r[0] === '' || r[0] === null) continue;
      var o = {};
      for (var j = 0; j < head.length; j++) { var v = r[j]; o[head[j]] = v instanceof Date ? v.toISOString() : (v === null || v === undefined ? '' : v); }
      Object.defineProperty(o, '__row', { value: i + 1, enumerable: false, writable: true });
      rows.push(o);
    }
    memo[name] = { sh: sh, head: head, rows: rows };
    return memo[name];
  }
  function cell(v) {
    if (v === undefined || v === null) return '';
    if (typeof v === 'object') v = JSON.stringify(v);
    if (typeof v === 'string' && /^[=+@]/.test(v)) return "'" + v; // กันกลายเป็นสูตร
    return v;
  }
  function toRow(t, obj) { return t.head.map(function (h) { return cell(obj[h]); }); }

  return {
    all: function (name) { return table(name).rows.slice(); },
    insert: function (name, obj) {
      var t = table(name);
      t.sh.appendRow(toRow(t, obj));
      var o = {}; t.head.forEach(function (h) { o[h] = obj[h] === undefined || obj[h] === null ? '' : obj[h]; });
      Object.defineProperty(o, '__row', { value: t.sh.getLastRow(), enumerable: false, writable: true });
      t.rows.push(o);
      return o;
    },
    update: function (name, id, patch) {
      var t = table(name);
      var o = t.rows.filter(function (r) { return r.id === id; })[0];
      if (!o) throw new Error('ไม่พบข้อมูล ' + id + ' ในแท็บ ' + name);
      Object.keys(patch).forEach(function (k) { o[k] = patch[k]; });
      t.sh.getRange(o.__row, 1, 1, t.head.length).setValues([toRow(t, o)]);
      return o;
    },
    removeWhere: function (name, fn) {
      var t = table(name);
      var keep = t.rows.filter(function (r) { return !fn(r); });
      if (keep.length === t.rows.length) return 0;
      var last = t.sh.getLastRow();
      if (last > 1) t.sh.getRange(2, 1, last - 1, t.head.length).clearContent();
      if (keep.length) t.sh.getRange(2, 1, keep.length, t.head.length).setValues(keep.map(function (r) { return toRow(t, r); }));
      keep.forEach(function (r, i) { r.__row = i + 2; });
      var removed = t.rows.length - keep.length;
      t.rows = keep;
      return removed;
    },
    settings: function () {
      if (settingsMemo) return settingsMemo;
      var sh = ss.getSheetByName('Settings'), out = {};
      if (sh) sh.getDataRange().getValues().slice(1).forEach(function (r) { if (r[0] !== '') out[String(r[0]).trim()] = r[1] instanceof Date ? r[1].toISOString() : String(r[1]); });
      settingsMemo = out;
      return out;
    },
    setSettings: function (patch) {
      var sh = ss.getSheetByName('Settings');
      if (!sh) throw new Error('ไม่พบแท็บ Settings กรุณาติดตั้งระบบ');
      var vals = sh.getDataRange().getValues();
      Object.keys(patch).forEach(function (k) {
        var row = -1;
        for (var i = 1; i < vals.length; i++) if (String(vals[i][0]).trim() === k) { row = i + 1; break; }
        if (row > 0) sh.getRange(row, 2).setValue(cell(patch[k]));
        else { sh.appendRow([k, cell(patch[k]), SETTINGS_HELP[k] || '']); vals.push([k]); }
      });
      settingsMemo = null;
    },
    secret: function (k) { return props.getProperty(k); },
    setSecret: function (k, v) { props.setProperty(k, v); },
    cacheGet: function (k) { return cache.get(k); },
    cachePut: function (k, v, sec) { cache.put(k, String(v), Math.min(21600, sec || 600)); },
    cacheRemove: function (k) { cache.remove(k); },
    now: function () { return new Date(); },
    uuid: function () { return Utilities.getUuid(); },
    hash: function (s) {
      return Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, s, Utilities.Charset.UTF_8)
        .map(function (b) { return ('0' + (b & 0xff).toString(16)).slice(-2); }).join('');
    },
    lock: function (fn) {
      var lock = LockService.getScriptLock();
      lock.waitLock(30000);
      memo = {}; // อ่านข้อมูลล่าสุดหลังได้ lock
      try { var r = fn(); SpreadsheetApp.flush(); return r; } finally { lock.releaseLock(); }
    },
    webAppUrl: function () { try { return ScriptApp.getService().getUrl() || ''; } catch (e) { return ''; } },
    activeUserEmail: function () { try { return Session.getActiveUser().getEmail(); } catch (e) { return ''; } }
  };
}
