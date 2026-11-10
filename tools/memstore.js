/* memstore.js — store ในหน่วยความจำ ใช้กับชุดทดสอบ (Node) และเว็บสาธิต (เบราว์เซอร์) */
function sha256Hex(ascii) {
  // SHA-256 แบบ synchronous (รับสตริง UTF-8)
  function rr(v, n) { return (v >>> n) | (v << (32 - n)); }
  var bytes = unescape(encodeURIComponent(ascii)), words = [], i, j;
  var K = [], H = [], isP = {}, n = 0;
  for (var c = 2; n < 64; c++) { if (!isP[c]) { for (i = 0; i < 313; i += c) isP[i] = c; if (n < 8) H[n] = (Math.pow(c, .5) * 4294967296) | 0; K[n++] = (Math.pow(c, 1 / 3) * 4294967296) | 0; } }
  var len = bytes.length * 8; bytes += '\x80';
  while (bytes.length % 64 - 56) bytes += '\x00';
  for (i = 0; i < bytes.length; i++) { j = bytes.charCodeAt(i); words[i >> 2] |= j << ((3 - i) % 4) * 8; }
  words[words.length] = (len / 4294967296) | 0; words[words.length] = len;
  for (j = 0; j < words.length;) {
    var w = words.slice(j, j += 16), old = H.slice(0);
    for (i = 0; i < 64; i++) {
      var w15 = w[i - 15], w2 = w[i - 2], a = H[0], e = H[4];
      var t1 = H[7] + (rr(e, 6) ^ rr(e, 11) ^ rr(e, 25)) + ((e & H[5]) ^ ((~e) & H[6])) + K[i] +
        (w[i] = i < 16 ? w[i] : (w[i - 16] + (rr(w15, 7) ^ rr(w15, 18) ^ (w15 >>> 3)) + w[i - 7] + (rr(w2, 17) ^ rr(w2, 19) ^ (w2 >>> 10))) | 0);
      var t2 = (rr(a, 2) ^ rr(a, 13) ^ rr(a, 22)) + ((a & H[1]) ^ (a & H[2]) ^ (H[1] & H[2]));
      H = [(t1 + t2) | 0].concat(H); H[4] = (H[4] + t1) | 0; H.length = 8;
    }
    for (i = 0; i < 8; i++) H[i] = (H[i] + old[i]) | 0;
  }
  var out = '';
  for (i = 0; i < 8; i++) for (j = 3; j + 1; j--) { var b = (H[i] >> (j * 8)) & 255; out += (b < 16 ? '0' : '') + b.toString(16); }
  return out;
}

function makeMemStore(db, opts) {
  opts = opts || {};
  db = db || {};
  db.tables = db.tables || {}; db.settings = db.settings || {}; db.secrets = db.secrets || {}; db.cache = db.cache || {};
  function now() { return opts.now ? opts.now() : new Date(); }
  function changed() { if (opts.onWrite) opts.onWrite(db); }
  function t(name) { return db.tables[name] = db.tables[name] || []; }
  function uuid() {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) { var r = Math.random() * 16 | 0; return (c === 'x' ? r : (r & 3 | 8)).toString(16); });
  }
  return {
    db: db,
    all: function (name) { return t(name).slice(); },
    insert: function (name, obj) { var o = {}; Object.keys(obj).forEach(function (k) { o[k] = obj[k]; }); t(name).push(o); changed(); return o; },
    update: function (name, id, patch) {
      var o = t(name).filter(function (r) { return r.id === id; })[0];
      if (!o) throw new Error('ไม่พบข้อมูล ' + id + ' ใน ' + name);
      Object.keys(patch).forEach(function (k) { o[k] = patch[k]; }); changed(); return o;
    },
    removeWhere: function (name, fn) { var before = t(name).length; db.tables[name] = t(name).filter(function (r) { return !fn(r); }); changed(); return before - db.tables[name].length; },
    settings: function () { return db.settings; },
    setSettings: function (patch) { Object.keys(patch).forEach(function (k) { db.settings[k] = patch[k]; }); changed(); },
    secret: function (k) { return db.secrets[k] === undefined ? null : db.secrets[k]; },
    setSecret: function (k, v) { db.secrets[k] = v; changed(); },
    cacheGet: function (k) { var e = db.cache[k]; if (!e) return null; if (e.exp < now().getTime()) { delete db.cache[k]; return null; } return e.v; },
    cachePut: function (k, v, sec) { db.cache[k] = { v: String(v), exp: now().getTime() + (sec || 600) * 1000 }; changed(); },
    cacheRemove: function (k) { delete db.cache[k]; changed(); },
    now: now,
    uuid: uuid,
    hash: opts.hash || sha256Hex,
    lock: function (fn) { return fn(); },
    webAppUrl: function () { return opts.url ? opts.url() : ''; },
    activeUserEmail: function () { return opts.email || ''; }
  };
}

if (typeof module !== 'undefined') module.exports = { makeMemStore: makeMemStore, sha256Hex: sha256Hex };
