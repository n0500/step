/* StepUp read saver — keeps the app inside the free Firestore quota.
   ---------------------------------------------------------------------
   Every screen used to re-read ALL of a student's (or a teacher's whole
   class's) saved attempts, including one record per answered Unit 2
   question. One teacher dashboard open with 40 students was ~9,000 reads.

   This layer sits under the app and, for "attempts" queries by
   studentId / teacherId (and the owner's whole collection):
     1. keeps a copy on the device (IndexedDB);
     2. asks the server only for records added since the last visit
        (new records carry a server time stamp "syncAt");
     3. shares one request between screens asking at the same moment and
        reuses a fresh copy for a few seconds;
     4. applies this device's own deletes / class moves to the copy;
     5. re-reads everything every few days to pick up changes made
        elsewhere (for example a record deleted from another device).
   If the delta query is refused (missing index) it falls back to a full
   read, so the app never shows less than before. */
(function(){
  'use strict';
  var VERSION = '20261001-readsaver-1';
  var FRESH_MS = 20000;                 // reuse a copy younger than this without asking the server
  var FULL_EVERY_MS = 4 * 24 * 3600e3;  // full re-read at most every 4 days
  var OVERLAP_MS = 5000;                // small overlap for server commit ordering
  var NOINDEX_RETRY_MS = 6 * 3600e3;    // after an index error, retry the delta query later

  var mem = {};        // key -> {docs: Map(id -> data), lastSync, fullAt, fetchedAt}
  var inflight = {};   // key -> Promise
  var stats = {full:0, delta:0, cached:0, docsRead:0};

  /* ---------- small IndexedDB store ---------- */
  var idbP = null;
  function idb(){
    if(idbP) return idbP;
    idbP = new Promise(function(res){
      try{
        var r = indexedDB.open('stepup-readsaver', 1);
        r.onupgradeneeded = function(){ r.result.createObjectStore('q'); };
        r.onsuccess = function(){ res(r.result); };
        r.onerror = function(){ res(null); };
        r.onblocked = function(){ res(null); };
      }catch(_){ res(null); }
    });
    return idbP;
  }
  function idbGet(key){
    return idb().then(function(db){
      if(!db) return null;
      return new Promise(function(res){
        try{
          var g = db.transaction('q','readonly').objectStore('q').get(key);
          g.onsuccess = function(){ res(g.result || null); };
          g.onerror = function(){ res(null); };
        }catch(_){ res(null); }
      });
    });
  }
  var saveTimers = {};
  function idbPut(key){
    clearTimeout(saveTimers[key]);
    saveTimers[key] = setTimeout(function(){
      var e = mem[key]; if(!e) return;
      idb().then(function(db){
        if(!db) return;
        try{
          var docs = [];
          e.docs.forEach(function(d, id){ docs.push([id, d]); });
          db.transaction('q','readwrite').objectStore('q').put({docs:docs, lastSync:e.lastSync, fullAt:e.fullAt, v:1}, key);
        }catch(_){}
      });
    }, 400);
  }

  /* ---------- helpers ---------- */
  function uid(){ try{ return firebase.auth().currentUser && firebase.auth().currentUser.uid || 'anon'; }catch(_){ return 'anon'; } }
  function ms(v){
    if(!v) return 0;
    if(typeof v === 'number') return v;
    if(typeof v.toMillis === 'function') return v.toMillis();
    if(typeof v.seconds === 'number') return v.seconds * 1000 + Math.floor((v.nanoseconds || 0) / 1e6);
    var t = Date.parse(v); return isNaN(t) ? 0 : t;
  }
  function clean(data){
    var o = Object.assign({}, data);
    if(o.syncAt) o.syncAt = ms(o.syncAt);
    return o;
  }
  function serverStamp(){
    try{ return firebase.firestore.FieldValue.serverTimestamp(); }catch(_){ return null; }
  }
  function tsFrom(msVal){
    try{ return firebase.firestore.Timestamp.fromMillis(msVal); }catch(_){ return new Date(msVal); }
  }
  function noIndex(kind, set){
    var k = 'sxReadSaverNoIndex_' + kind;
    try{
      if(set){ localStorage.setItem(k, String(Date.now())); return true; }
      var t = Number(localStorage.getItem(k) || 0);
      return t && Date.now() - t < NOINDEX_RETRY_MS;
    }catch(_){ return false; }
  }

  function makeSnap(entry, colRef, filter){
    var list = [];
    entry.docs.forEach(function(d, id){
      if(filter && d[filter.field] !== filter.value) return;
      list.push([id, d]);
    });
    var docs = list.map(function(p){
      var id = p[0], d = p[1], ref = null;
      return {
        id: id, exists: true,
        get ref(){ return ref || (ref = colRef.doc(id)); },
        data: function(){ return Object.assign({}, d); },
        get: function(f){ return d[f]; }
      };
    });
    return {docs:docs, size:docs.length, empty:!docs.length,
      forEach:function(fn){ docs.forEach(fn); }, metadata:{fromCache:true, readSaver:true}};
  }

  /* ---------- the cached fetch ---------- */
  async function load(key){
    if(mem[key]) return mem[key];
    var saved = await idbGet(key);
    if(mem[key]) return mem[key];
    var e = {docs:new Map(), lastSync:0, fullAt:0, fetchedAt:0};
    if(saved && Array.isArray(saved.docs)){
      saved.docs.forEach(function(p){ e.docs.set(p[0], p[1]); });
      e.lastSync = saved.lastSync || 0;
      e.fullAt = saved.fullAt || 0;
    }
    mem[key] = e;
    return e;
  }

  function cachedGet(key, kind, baseQuery, origGet, colRef, filter){
    if(inflight[key]) return inflight[key].then(function(e){ return makeSnap(e, colRef, filter); });
    var p = (async function(){
      var e = await load(key);
      var now = Date.now();
      if(e.fetchedAt && now - e.fetchedAt < FRESH_MS){ stats.cached++; return e; }

      var needFull = !e.fullAt || now - e.fullAt > FULL_EVERY_MS || noIndex(kind);
      if(!needFull){
        try{
          var since = Math.max(0, e.lastSync - OVERLAP_MS);
          var dq = baseQuery.where('syncAt', '>', tsFrom(since));
          var ds = await dq.get();   // a fresh, undecorated query
          ds.docs.forEach(function(d){
            var data = clean(d.data());
            e.docs.set(d.id, data);
            if(data.syncAt > e.lastSync) e.lastSync = data.syncAt;
          });
          stats.delta++; stats.docsRead += Math.max(1, ds.size);
          e.fetchedAt = Date.now();
          idbPut(key);
          return e;
        }catch(err){
          var code = String(err && err.code || '');
          if(code.indexOf('failed-precondition') >= 0){
            noIndex(kind, true);
            console.warn('StepUp read saver: Firestore index needed for "' + kind + '" (falling back to full reads). Create it from this link:', err.message);
          }else if(code.indexOf('permission') >= 0 || code.indexOf('unavailable') >= 0 || code.indexOf('resource-exhausted') >= 0){
            // Offline / quota: serve what the device has, if anything.
            if(e.fullAt){ console.warn('StepUp read saver: using saved copy', code); return e; }
            throw err;
          }else{
            console.warn('StepUp read saver: delta read failed, doing a full read', err);
          }
        }
      }

      var fs = await origGet.call(baseQuery);
      var fresh = new Map(), maxSync = 0;
      fs.docs.forEach(function(d){
        var data = clean(d.data());
        fresh.set(d.id, data);
        if(data.syncAt && data.syncAt > maxSync) maxSync = data.syncAt;
      });
      e.docs = fresh;
      e.lastSync = maxSync || Date.now() - 60000;
      e.fullAt = e.fetchedAt = Date.now();
      stats.full++; stats.docsRead += Math.max(1, fs.size);
      idbPut(key);
      return e;
    })();
    inflight[key] = p;
    var done = function(){ delete inflight[key]; };
    p.then(done, done);
    return p.then(function(e){ return makeSnap(e, colRef, filter); });
  }

  /* ---------- keep the copy in step with this device's own changes ---------- */
  function eachEntry(fn){ Object.keys(mem).forEach(function(k){ fn(mem[k], k); }); }
  function forgetDoc(id){
    eachEntry(function(e, k){ if(e.docs.delete(id)) idbPut(k); });
  }
  function patchDoc(id, data){
    eachEntry(function(e, k){
      var d = e.docs.get(id);
      if(d){ e.docs.set(id, Object.assign({}, d, clean(data))); idbPut(k); }
    });
  }
  function addDoc(id, data){
    var d = clean(data); d.syncAt = 0;
    var u = uid();
    eachEntry(function(e, k){
      var parts = k.split('|');            // uid|field|value
      if(parts[0] !== u) return;
      if(parts[1] === 'all' || d[parts[1]] === parts[2]){ e.docs.set(id, d); idbPut(k); }
    });
  }
  function isAttemptRef(ref){
    try{ return !!ref && (ref.__sxAttempt || (ref.parent && ref.parent.id === 'attempts')); }catch(_){ return false; }
  }

  function decorateDocRef(ref){
    if(!ref || ref.__sxAttempt) return ref;
    try{
      ref.__sxAttempt = true;
      var od = ref.delete, ou = ref.update, os = ref.set;
      if(od) ref.delete = function(){ var id = ref.id; return od.apply(ref, arguments).then(function(r){ forgetDoc(id); return r; }); };
      if(ou) ref.update = function(data){ var id = ref.id; return ou.apply(ref, arguments).then(function(r){ if(data && typeof data === 'object') patchDoc(id, data); return r; }); };
      if(os) ref.set = function(data){
        var args = Array.prototype.slice.call(arguments);
        if(data && typeof data === 'object' && !data.syncAt){ var st = serverStamp(); if(st) args[0] = Object.assign({}, data, {syncAt:st}); }
        var id = ref.id;
        return os.apply(ref, args).then(function(r){ addDoc(id, data); return r; });
      };
    }catch(_){}
    return ref;
  }

  function decorateAttempts(col){
    if(!col || col.__sxAttempts) return col;
    col.__sxAttempts = true;
    var origWhere = col.where, origAdd = col.add, origDoc = col.doc, origColGet = col.get;

    col.where = function(field, op, value){
      var q = origWhere.apply(col, arguments);
      if(op === '==' && (field === 'studentId' || field === 'teacherId') && typeof value === 'string' && q && typeof q.get === 'function'){
        var qGet = q.get;
        q.get = function(opts){
          if(opts && opts.source) return qGet.apply(q, arguments);
          return cachedGet(uid() + '|' + field + '|' + value, field, q, qGet, col, null);
        };
      }
      return q;
    };
    if(typeof origColGet === 'function'){
      col.get = function(opts){
        if(opts && opts.source) return origColGet.apply(col, arguments);
        return cachedGet(uid() + '|all|', 'all', col, origColGet, col, null);
      };
    }
    if(typeof origAdd === 'function'){
      col.add = function(data){
        var payload = data;
        if(data && typeof data === 'object' && !data.syncAt){ var st = serverStamp(); if(st) payload = Object.assign({}, data, {syncAt:st}); }
        return origAdd.call(col, payload).then(function(ref){ if(ref && ref.id) addDoc(ref.id, data); return ref; });
      };
    }
    if(typeof origDoc === 'function'){
      col.doc = function(){ return decorateDocRef(origDoc.apply(col, arguments)); };
    }
    return col;
  }

  function decorateBatch(b){
    if(!b || b.__sxBatch) return b;
    b.__sxBatch = true;
    var del = [], upd = [];
    var od = b.delete, ou = b.update, oc = b.commit;
    if(od) b.delete = function(ref){ if(isAttemptRef(ref)) del.push(ref.id); return od.apply(b, arguments); };
    if(ou) b.update = function(ref, data){ if(isAttemptRef(ref) && data && typeof data === 'object') upd.push([ref.id, data]); return ou.apply(b, arguments); };
    if(oc) b.commit = function(){
      return oc.apply(b, arguments).then(function(r){
        del.forEach(forgetDoc); upd.forEach(function(p){ patchDoc(p[0], p[1]); });
        return r;
      });
    };
    return b;
  }

  function patchDb(db){
    if(!db || db.__sxReadSaver) return db;
    try{
      db.__sxReadSaver = VERSION;
      var oc = db.collection, ob = db.batch;
      db.collection = function(name){
        var c = oc.apply(db, arguments);
        return name === 'attempts' ? decorateAttempts(c) : c;
      };
      if(ob) db.batch = function(){ return decorateBatch(ob.apply(db, arguments)); };
    }catch(e){ console.warn('StepUp read saver not active', e); }
    return db;
  }

  function install(){
    var fb = window.firebase;
    if(!fb || typeof fb.firestore !== 'function' || fb.firestore.__sxWrapped) return !!(fb && fb.firestore && fb.firestore.__sxWrapped);
    var orig = fb.firestore;
    var wrapped = function(){ return patchDb(orig.apply(this, arguments)); };
    try{ Object.setPrototypeOf(wrapped, orig); }catch(_){}
    Object.getOwnPropertyNames(orig).forEach(function(k){
      if(k in wrapped && ['length','name','prototype','arguments','caller'].indexOf(k) >= 0) return;
      try{ Object.defineProperty(wrapped, k, Object.getOwnPropertyDescriptor(orig, k)); }catch(_){}
    });
    wrapped.__sxWrapped = true;
    fb.firestore = wrapped;
    return true;
  }

  if(!install()){
    var tries = 0, t = setInterval(function(){ if(install() || ++tries > 50) clearInterval(t); }, 100);
  }
  try{
    var lastUid = null;
    setTimeout(function hook(){
      try{
        firebase.auth().onAuthStateChanged(function(u){
          var id = u && u.uid || null;
          if(lastUid && id !== lastUid){ mem = {}; inflight = {}; }
          lastUid = id;
        });
      }catch(_){ setTimeout(hook, 300); }
    }, 0);
  }catch(_){}

  window.STEPUP_READ_SAVER = {version:VERSION, stats:stats,
    reset:function(){ mem = {}; inflight = {}; idb().then(function(db){ try{ db && db.transaction('q','readwrite').objectStore('q').clear(); }catch(_){} }); }};
})();
