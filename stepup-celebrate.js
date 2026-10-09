/* StepUp — celebrations, unit map progress & certificates (design: Nuha Almutairi)
   1  Mastered (first try)        "Excellent! ⭐"
   2  Improved to mastery          "Amazing progress! 🚀"   previous → now
   3  Completed, can improve       "Good progress! 💪"
   4  Big improvement (not 100%)   "Big improvement! 🎉"    before % → now %
   5  Unit map: status under every stop + "X of N skills mastered"
   6  Unit completion celebration  "Unit N Completed! 🏆"
   7  Certificate of Achievement   (download / share, kept under My Certificates)
   Unit 1 + Unit 2 mastery model: required learning + 80% overall; STEP never blocks.
   Presentation only: it reads results the app already loaded. Extra reads: the
   student's profile and class (once, for names on the certificate). */
(function(){
  'use strict';

  var J = window.STEPUP_JOURNEY;
  var P = window.PROVE;
  if(!J || !P) return;

  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var attempts = [];
  var profile = null;
  var lastResult = null;   // {payload, prev, at}
  var CERT_MASTERY = 80;   // Unit certificate: meaningful mastery, not completion alone.
  var STEP_READY = 75;     // Motivating readiness badge; STEP remains practice, not a blocker.

  /* ---------- capture data the app already has ---------- */
  // Capture the full list at the outermost layer: stability-fixes.js later wraps these
  // and keeps only the best attempt per stop, which would hide improvement history.
  var depth = 0;
  function wrapJourney(){
    ['html','homeHTML','progressHTML'].forEach(function(name){
      var orig = J[name];
      if(typeof orig !== 'function' || orig.__sxCelebrate) return;
      var w = function(list){
        if(depth === 0 && Array.isArray(list)) attempts = list;
        depth++; try{ return orig.apply(this, arguments); } finally{ depth--; }
      };
      w.__sxCelebrate = true; J[name] = w;
    });
  }
  wrapJourney();
  var origRecord = P.recordJourneyAttempt;
  if(typeof origRecord === 'function' && !origRecord.__sxCelebrate){
    var rec = async function(payload){
      var prev = history(payload && payload.trainingId);
      lastResult = {payload: payload, prev: prev, at: Date.now()};
      var r = await origRecord.apply(this, arguments);
      attempts.push(Object.assign({}, payload, {submittedAt: new Date().toISOString()}));
      return r;
    };
    rec.__sxCelebrate = true; P.recordJourneyAttempt = rec;
  }

  /* ---------- helpers ---------- */
  function esc(s){ return String(s == null ? '' : s).replace(/[&<>"']/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]; }); }
  function pick(a){ return a[Math.floor(Math.random()*a.length)]; }
  function history(id){
    return attempts.filter(function(a){ return a && a.trainingId === id && a.recordKind !== 'question'; })
      .sort(function(a,b){ return String(a.submittedAt||'').localeCompare(String(b.submittedAt||'')); });
  }
  function best(id){ var h = history(id); return h.length ? Math.max.apply(null, h.map(function(a){ return Number(a.percentage||0); })) : -1; }
  function uid(){
    try{ if(window.firebase && firebase.auth && firebase.auth().currentUser) return firebase.auth().currentUser.uid; }catch(_){}
    try{ var s = JSON.parse(localStorage.getItem('proveit_session')||'null'); if(s && s.uid) return s.uid; }catch(_){}
    return 'student';
  }
  function fb(){ return window.firebase && firebase.firestore && firebase.auth && firebase.auth().currentUser ? firebase : null; }
  async function getProfile(){
    if(profile && profile.uid === uid()) return profile;
    var id = uid(), p = {}, cls = {};
    try{
      if(fb()){
        var s = await firebase.firestore().collection('users').doc(id).get();
        p = s.exists ? (s.data()||{}) : {};
      }else{
        p = (JSON.parse(localStorage.getItem('proveit_users')||'[]')).find(function(u){ return u.id === id; }) || {};
      }
    }catch(_){}
    if(!p.displayName){ var h = document.querySelector('.student-welcome h1'); p.displayName = h ? h.textContent.replace(/^Hi,\s*/,'') : 'StepUp Student'; }
    profile = {uid:id, role:p.role||'student', name:String(p.displayName||'').trim(), school:String(p.school||'').trim(), classId:p.classId||'', teacherName:''};
    return profile;
  }
  async function getTeacherName(){
    var p = await getProfile();
    if(p.teacherName) return p.teacherName;
    var t = '';
    try{
      if(fb() && p.classId){
        var c = await firebase.firestore().collection('classes').doc(p.classId).get();
        if(c.exists){ var d = c.data()||{}; t = d.teacherName || ''; if(!p.school && d.school) p.school = d.school; }
      }
    }catch(_){}
    p.teacherName = t || 'Nuha Almutairi';
    return p.teacherName;
  }
  function titled(name){
    name = String(name||'').trim();
    if(/[؀-ۿ]/.test(name)) return /^(أ\.|أ\/|الأستاذة|المعلمة)/.test(name) ? name : 'أ. ' + name;
    return /^(ms|mrs|miss|mr|dr|teacher)\.?\s/i.test(name) ? name : 'Ms. ' + name;
  }
  function firstName(){ return profile && profile.name ? profile.name.split(/\s+/)[0] : ''; }
  getProfile().then(syncTeacherName);

  /* A teacher's own classes remember her name, so her students' certificates carry it. */
  async function syncTeacherName(p){
    try{
      if(!fb() || !p || p.role !== 'teacher' || !p.name) return;
      if(sessionStorage.getItem('sxTeacherNameSynced') === p.uid) return;
      sessionStorage.setItem('sxTeacherNameSynced', p.uid);
      var snap = await firebase.firestore().collection('classes').where('teacherId','==',p.uid).get();
      snap.docs.forEach(function(d){ if((d.data()||{}).teacherName !== p.name) d.ref.update({teacherName:p.name}).catch(function(){}); });
    }catch(_){}
  }

  /* ---------- stops of a unit ---------- */
  var U2 = function(){ return window.STEPUP_U2_EXAM; };
  var U1 = function(){ return window.STEPUP_U1_REVIEW; };
  var U3 = function(){ return window.STEPUP_U3_REVIEW; };
  function usesExam(u){ return u && u.id === 'u2' && U2() && U2().getProgress; }
  function usesUnit1Mastery(u){ return u && u.id === 'u1'; }
  function usesUnit3Mastery(u){ return u && u.id === 'u3' && U3() && U3().getProgress; }
  function usesFullReview(u){ return usesUnit1Mastery(u) || usesUnit3Mastery(u); }
  function unit1RequiredStops(u){
    return stopsOf(u).filter(function(x){ return x.key !== 'step'; });
  }
  function unit1Progress(u){
    if(U1() && U1().getProgress){
      try{
        var g = U1().getProgress();
        return {answered:Number(g.answered||0),total:Number(g.total||0),accuracy:Number(g.accuracy||0),eligible:Number(g.total||0)>0 && Number(g.answered||0)>=Number(g.total||0) && Number(g.accuracy||0)>=CERT_MASTERY,nextSection:g.nextSection||null};
      }catch(_){}
    }
    var req = unit1RequiredStops(u);
    var attempted = req.filter(function(x){ return history(x.id).length > 0; }).length;
    var vals = req.map(function(x){ return best(x.id); }).filter(function(v){ return v >= 0; });
    var accuracy = vals.length ? Math.round(vals.reduce(function(a,b){ return a+b; },0) / vals.length) : 0;
    return {answered:attempted,total:req.length,accuracy:accuracy,eligible:req.length>0 && attempted===req.length && accuracy>=CERT_MASTERY,nextSection:null};
  }
  function unit3RequiredStops(u){
    return stopsOf(u).filter(function(x){ return x.key !== 'step'; });
  }
  function unit3Progress(u){
    if(U3() && U3().getProgress){
      try{
        var g = U3().getProgress();
        return {answered:Number(g.answered||0),total:Number(g.total||0),accuracy:Number(g.accuracy||0),eligible:Number(g.total||0)>0 && Number(g.answered||0)>=Number(g.total||0) && Number(g.accuracy||0)>=CERT_MASTERY,nextSection:g.nextSection||null};
      }catch(_){}
    }
    var req = unit3RequiredStops(u);
    var attempted = req.filter(function(x){ return history(x.id).length > 0; }).length;
    var vals = req.map(function(x){ return best(x.id); }).filter(function(v){ return v >= 0; });
    var accuracy = vals.length ? Math.round(vals.reduce(function(a,b){ return a+b; },0) / vals.length) : 0;
    return {answered:attempted,total:req.length,accuracy:accuracy,eligible:req.length>0 && attempted===req.length && accuracy>=CERT_MASTERY,nextSection:null};
  }

  function stopsOf(u){
    if(!u) return [];
    if(usesExam(u)){
      return [
        {key:'vocab', id:'journey-u2-core-1', label:'Vocabulary', icon:'💬', pass:67, required:true, go:function(){ U2().start('vocab'); }},
        {key:'grammar', id:'journey-u2-core-2', label:'Grammar', icon:'🧩', pass:67, required:true, go:function(){ U2().start('grammar'); }},
        {key:'functions', id:'journey-u2-core-3', label:'Functions', icon:'🎯', pass:67, required:true, go:function(){ U2().start('functions'); }},
        {key:'reading', id:'journey-u2-reading', label:'Reading', icon:'📖', pass:67, required:true, go:function(){ U2().readingLesson ? U2().readingLesson() : U2().start('reading'); }},
        {key:'listening', id:'journey-u2-listening', label:'Listening', icon:'🎧', pass:67, required:true, go:function(){ U2().start('listening'); }},
        {key:'step', id:'journey-u2-step', label:'STEP Practice', icon:'⚡', pass:0, required:false, go:function(){ U2().stepIntro ? U2().stepIntro() : U2().start('step'); }}
      ];
    }
    var cores = (u.missions||[]).filter(function(m){ return m.type==='core'; });
    var list = cores.map(function(m,i){
      return {key:'core-'+(i+1), id:'journey-'+u.id+'-core-'+(i+1), label:m.title, icon:'🧩', pass:67, core:true,
        go:function(){ J.go(u.id,'core-'+(i+1)); }};
    });
    list.push({key:'reading', id:'journey-'+u.id+'-reading', label:'Reading', icon:'📖', pass:67, go:function(){ J.go(u.id,'reading'); }});
    list.push({key:'listening', id:'journey-'+u.id+'-listening', label:'Listening', icon:'🎧', pass:67, go:function(){ J.go(u.id,'listening'); }});
    list.push({key:'step', id:'journey-'+u.id+'-step', label:'STEP Practice', icon:'⚡', pass:0, go:function(){ J.go(u.id,'step'); }});
    list.push({key:'final', id:'journey-'+u.id+'-final', label:'Final Challenge', icon:'🏁', pass:83, go:function(){ J.go(u.id,'final'); }});
    return list;
  }
  function statusOf(stop){
    var h = history(stop.id);
    if(!h.length) return 'todo';
    var b = Math.max.apply(null, h.map(function(a){ return Number(a.percentage||0); }));
    if(b >= 100) return 'mastered';
    if(b < stop.pass) return 'tried';
    if(h.length > 1 && Number(h[h.length-1].percentage||0) > Number(h[0].percentage||0)) return 'improved';
    return 'completed';
  }
  function passedStop(stop){ var s = statusOf(stop); return s === 'mastered' || s === 'improved' || s === 'completed'; }
  function unitOf(id){ var m = String(id||'').match(/^journey-(u\d+)-/); return m ? J.data.units.find(function(u){ return u.id === m[1]; }) : null; }
  function unitComplete(u){
    if(!u) return false;
    // Cumulative mastery across saved review answers earns a unit certificate;
    // legacy and prior full-check awards remain protected.
    if(['u1','u2','u3','u4','u5','u6'].includes(u.id)){
      return !!window.STEPUP_MASTERY?.status?.(u.id,attempts)?.earned;
    }
    if(usesExam(u)){
      try{
        var g = U2().getProgress();
        // Unit 2 certificate unlocks only after the full required review is complete
        // AND overall mastery reaches 80%. STEP remains an important extra practice stop.
        return g.total > 0 && g.answered >= g.total && Number(g.accuracy||0) >= CERT_MASTERY;
      }catch(_){ return false; }
    }
    if(usesUnit1Mastery(u)){
      // Unit 1: full review + 80% mastery; STEP is extra practice.
      return unit1Progress(u).eligible;
    }
    if(usesUnit3Mastery(u)){
      // Unit 3 uses the same full-review mastery rule.
      return unit3Progress(u).eligible;
    }
    var s = stopsOf(u); return s.length > 0 && s.every(passedStop);
  }
  function unitStats(u){
    var s = usesUnit1Mastery(u) ? unit1RequiredStops(u) : usesUnit3Mastery(u) ? unit3RequiredStops(u) : stopsOf(u).filter(function(x){ return x.key !== 'step' && x.key !== 'final'; }), acc;
    if(usesExam(u)){ try{ acc = U2().getProgress().accuracy; }catch(_){} }
    if(usesUnit1Mastery(u)){ acc = unit1Progress(u).accuracy; }
    if(usesUnit3Mastery(u)){ acc = unit3Progress(u).accuracy; }
    var masteryState=window.STEPUP_MASTERY?.status?.(u.id,attempts);
    if(masteryState?.progress?.total && !usesExam(u) && !usesUnit1Mastery(u) && !usesUnit3Mastery(u))acc=masteryState.progress.accuracy;
    if(masteryState?.earned && ['cumulative','assessment','legacy'].includes(masteryState.mode) &&
      !usesExam(u) && !usesUnit1Mastery(u) && !usesUnit3Mastery(u))acc=masteryState.accuracy;
    if(masteryState?.earned && masteryState.mode==='assessment')acc=masteryState.accuracy;
    if(acc == null){
      var vals = s.map(function(x){ return best(x.id); }).filter(function(v){ return v>=0; });
      acc = vals.length ? Math.round(vals.reduce(function(a,b){ return a+b; },0)/vals.length) : 0;
    }
    // 80% is the mastery line used by the certificate and by Needs Practice.
    if(usesUnit1Mastery(u) && U1() && U1().sectionProgress){
      var keys=s.map(function(x){ return x.key; });
      var stats=keys.map(function(k){ try{return U1().sectionProgress(k);}catch(_){return null;} }).filter(Boolean);
      var masteredU1=stats.filter(function(g){ return g.done && g.total>0 && Math.round((g.correct||0)/g.total*100)>=CERT_MASTERY; }).length;
      var needsU1=stats.filter(function(g){ return g.answered>0 && Math.round((g.correct||0)/Math.max(1,g.answered)*100)<CERT_MASTERY; }).length;
      return {mastered:masteredU1,total:stats.length,accuracy:acc,needs:needsU1};
    }
    if(usesUnit3Mastery(u) && U3() && U3().sectionProgress){
      var keys3=s.map(function(x){ return x.key; });
      var stats3=keys3.map(function(k){ try{return U3().sectionProgress(k);}catch(_){return null;} }).filter(Boolean);
      var masteredU3=stats3.filter(function(g){ return g.done && g.total>0 && Math.round((g.correct||0)/g.total*100)>=CERT_MASTERY; }).length;
      var needsU3=stats3.filter(function(g){ return g.answered>0 && Math.round((g.correct||0)/Math.max(1,g.answered)*100)<CERT_MASTERY; }).length;
      return {mastered:masteredU3,total:stats3.length,accuracy:acc,needs:needsU3};
    }
    var mastered = s.filter(function(x){ return best(x.id) >= CERT_MASTERY; }).length;
    var needs = s.filter(function(x){ var b = best(x.id); return b >= 0 && b < CERT_MASTERY; }).length;
    return {mastered:mastered, total:s.length, accuracy:acc, needs:needs};
  }
  function stepStats(u){
    var stop = stopsOf(u).find(function(x){ return x.key === 'step'; });
    if(!stop) return {attempts:0,best:-1,bestScore:0,bestTotal:0,bestTime:0,ready:false};
    var h = history(stop.id);
    var bestAttempt = null, bestPercent = -1, bestScore = 0, bestTotal = 0;
    var fastest = 0, fastestReady = 0;
    h.forEach(function(a){
      var pct = Number(a.bestPercentage != null ? a.bestPercentage : a.percentage || 0);
      var score = Number(a.bestScore != null ? a.bestScore : a.score || 0);
      var total = Number(a.bestTotal != null ? a.bestTotal : a.total || 0);
      // For Unit 2, a summary can include cumulative correct answers across
      // multiple tries. Use the ACTUAL saved score of a full STEP run instead.
      if(u && u.id === 'u2' && a.attemptTotal != null){
        var isFullRun = Number(a.total) > 0 && Number(a.attemptTotal) === Number(a.total);
        pct = isFullRun ? Number(a.attemptPercentage || 0) : -1;
        score = isFullRun ? Number(a.attemptScore || 0) : 0;
        total = Number(a.attemptTotal || 0);
      }
      if(Number.isFinite(pct) && pct > bestPercent){
        bestAttempt = a;
        bestPercent = pct;
        bestScore = score;
        bestTotal = total;
      }
      var time = Number(a.elapsedSeconds || 0);
      if(time > 0 && (!fastest || time < fastest)) fastest = time;
      if(pct >= STEP_READY && time > 0 && (!fastestReady || time < fastestReady)) fastestReady = time;
    });
    // Recover a fully completed, individually scored Unit 2 STEP attempt even
    // if saving its aggregate summary failed. Partial and cumulative answers
    // alone never earn a stamp.
    var completedRuns = 0;
    if(u && u.id === 'u2' && U2() && typeof U2().getStepProgress === 'function'){
      try{
        var qp = U2().getStepProgress();
        completedRuns = Math.max(0, Number(qp && qp.completeRuns || 0));
        var recoveredPct = Number(qp && qp.bestRunPercentage);
        if(completedRuns > 0 && Number.isFinite(recoveredPct) && recoveredPct > bestPercent){
          bestPercent = recoveredPct;
          bestScore = Number(qp.bestRunScore || 0);
          bestTotal = Number(qp.total || 0);
          bestAttempt = null;
        }
      }catch(_){}
    }
    if(fastestReady) fastest = fastestReady;
    return {attempts:Math.max(h.length,completedRuns),best:bestPercent,
      bestScore:bestScore,bestTotal:bestTotal,bestTime:fastest,
      ready:bestPercent >= STEP_READY};
  }
  function fmtTime(seconds){
    seconds = Math.max(0, Math.round(Number(seconds)||0));
    var m = Math.floor(seconds/60), sec = seconds%60;
    return m+':'+String(sec).padStart(2,'0');
  }
  function nextStop(u, afterId){
    var s = stopsOf(u);
    if(usesUnit1Mastery(u)){
      // Unit 1 full-review mode tracks every approved question. Route back to the
      // review map until all questions are seen and the 80% certificate goal is met.
      if(U1() && U1().getProgress){
        var ug=unit1Progress(u);
        if(!ug.eligible) return {key:'review',id:'u1-full-review',label:'Unit 1 Review',icon:'✓',pass:80,go:function(){ U1().open(); }};
        return null;
      }
      var req = unit1RequiredStops(u);
      var missing = req.find(function(x){ return history(x.id).length === 0; });
      if(missing) return missing;
      if(!unitComplete(u)) return req.slice().sort(function(a,b){ return best(a.id)-best(b.id); })[0] || null;
      return null;
    }
    if(usesUnit3Mastery(u)){
      if(U3() && U3().getProgress){
        var ug3=unit3Progress(u);
        if(!ug3.eligible) return {key:'review',id:'u3-full-review',label:'Unit 3 Review',icon:'✓',pass:80,go:function(){ U3().open(); }};
        return null;
      }
      var req3 = unit3RequiredStops(u);
      var missing3 = req3.find(function(x){ return history(x.id).length === 0; });
      if(missing3) return missing3;
      if(!unitComplete(u)) return req3.slice().sort(function(a,b){ return best(a.id)-best(b.id); })[0] || null;
      return null;
    }
    var i = s.findIndex(function(x){ return x.id === afterId; });
    var ordered = i >= 0 ? s.slice(i+1).concat(s.slice(0,i+1)) : s;
    return ordered.find(function(x){ return !passedStop(x); }) || null;
  }
  function seenKey(){ return 'stepup_cert_seen_v1_' + uid(); }
  function seen(){ try{ return JSON.parse(localStorage.getItem(seenKey())||'[]'); }catch(_){ return []; } }
  function markSeen(id){ try{ var s = seen(); if(s.indexOf(id) < 0){ s.push(id); localStorage.setItem(seenKey(), JSON.stringify(s)); } }catch(_){} }
  function streakDays(){
    var days = new Set();
    attempts.forEach(function(a){ var d = new Date(a.submittedAt||0); if(!isNaN(d)) days.add(d.toDateString()); });
    var n = 0, d = new Date(); if(!days.has(d.toDateString())) d.setDate(d.getDate()-1);
    while(days.has(d.toDateString())){ n++; d.setDate(d.getDate()-1); }
    return n;
  }

  /* ---------- illustrations ---------- */
  var ART = {
    star: '<svg viewBox="0 0 120 110"><defs><linearGradient id="sxS" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffe27a"/><stop offset="1" stop-color="#f6b21b"/></linearGradient></defs><path class="sxc-pop" d="M60 6l15.6 31.6 34.9 5.1-25.3 24.6 6 34.7L60 85.6 28.8 102l6-34.7L9.5 42.7l34.9-5.1z" fill="url(#sxS)" stroke="#e79a0c" stroke-width="3" stroke-linejoin="round"/><path d="M44 40l8-2" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity=".7"/></svg>',
    rocket: '<svg viewBox="0 0 130 110"><rect class="sxc-bar" x="14" y="72" width="18" height="26" rx="4" fill="#c9d8ff"/><rect class="sxc-bar" x="38" y="60" width="18" height="38" rx="4" fill="#a9c1ff"/><rect class="sxc-bar" x="62" y="46" width="18" height="52" rx="4" fill="#7f9dff"/><rect class="sxc-bar" x="86" y="30" width="18" height="68" rx="4" fill="#6b6ff0"/><path class="sxc-draw" d="M14 64C40 60 70 44 108 12" stroke="#ff5a7a" stroke-width="7" fill="none" stroke-linecap="round" stroke-dasharray="140"/><path class="sxc-pop" d="M96 8l20-2-4 20z" fill="#ff5a7a"/></svg>',
    trophy: '<svg viewBox="0 0 120 120"><defs><linearGradient id="sxT" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffd85a"/><stop offset="1" stop-color="#f0a417"/></linearGradient></defs><g class="sxc-pop"><path d="M28 18h64v18c0 22-14 38-32 38S28 58 28 36z" fill="url(#sxT)"/><path d="M28 24H12c0 18 8 28 20 30M92 24h16c0 18-8 28-20 30" stroke="#f0a417" stroke-width="7" fill="none" stroke-linecap="round"/><rect x="52" y="72" width="16" height="16" fill="#f0a417"/><rect x="36" y="88" width="48" height="12" rx="4" fill="#e08e0b"/><rect x="30" y="100" width="60" height="10" rx="4" fill="#c97a06"/><path d="M48 30l4 22" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity=".55"/></g></svg>',
    bars: '<svg viewBox="0 0 130 110"><rect class="sxc-bar" x="14" y="70" width="18" height="28" rx="4" fill="#9fe3c2"/><rect class="sxc-bar" x="38" y="56" width="18" height="42" rx="4" fill="#5fcf98"/><rect class="sxc-bar" x="62" y="40" width="18" height="58" rx="4" fill="#2fb576"/><rect class="sxc-bar" x="86" y="24" width="18" height="74" rx="4" fill="#178a55"/><path class="sxc-draw" d="M12 60C42 54 72 36 110 10" stroke="#f3b53d" stroke-width="7" fill="none" stroke-linecap="round" stroke-dasharray="140"/><path class="sxc-pop" d="M98 6l20-2-5 19z" fill="#f3b53d"/></svg>'
  };

  /* ---------- confetti ---------- */
  function confetti(){
    if(reduceMotion) return;
    var c = document.createElement('canvas'); c.className = 'sxc-confetti';
    var dpr = Math.min(2, window.devicePixelRatio||1); c.width = innerWidth*dpr; c.height = innerHeight*dpr;
    document.body.appendChild(c);
    var x = c.getContext('2d'); x.scale(dpr,dpr);
    var colors = ['#6b6ff0','#17a36f','#f3b53d','#ec4d6a','#5fe0d0','#f39a3c','#2a6ff0'], parts = [];
    for(var i=0;i<160;i++){
      var left = i%2===0;
      parts.push({x:left?-10:innerWidth+10, y:innerHeight*.6+Math.random()*innerHeight*.25, vx:(left?1:-1)*(5+Math.random()*7), vy:-(9+Math.random()*9),
        w:6+Math.random()*6, h:8+Math.random()*8, r:Math.random()*6, vr:(Math.random()-.5)*.35, col:colors[i%colors.length], sh:i%3});
    }
    var t0 = performance.now(), last = t0;
    (function frame(t){
      var k = Math.min(32, t-last)/16; last = t;
      x.clearRect(0,0,innerWidth,innerHeight);
      parts.forEach(function(p){
        p.vy += .32*k; p.vx *= Math.pow(.992,k); p.x += p.vx*k; p.y += p.vy*k; p.r += p.vr*k;
        x.save(); x.translate(p.x,p.y); x.rotate(p.r); x.fillStyle = p.col;
        if(p.sh===0) x.fillRect(-p.w/2,-p.h/2,p.w,p.h);
        else if(p.sh===1){ x.beginPath(); x.arc(0,0,p.w/2,0,Math.PI*2); x.fill(); }
        else { x.beginPath(); x.moveTo(0,-p.h/2); x.lineTo(p.w/2,p.h/2); x.lineTo(-p.w/2,p.h/2); x.closePath(); x.fill(); }
        x.restore();
      });
      if(t-t0 < 2600) requestAnimationFrame(frame); else c.remove();
    })(t0);
  }
  function buzz(){ try{ if(navigator.vibrate) navigator.vibrate([25,40,25]); }catch(_){} }

  /* ---------- overlay ---------- */
  var queue = [];
  function overlay(html, cls){
    var old = document.querySelector('.sxc-overlay'); if(old) old.remove();
    var o = document.createElement('div');
    o.className = 'sxc-overlay ' + (cls||''); o.setAttribute('role','dialog'); o.setAttribute('aria-modal','true');
    o.innerHTML = '<div class="sxc-card"><div class="sxc-brand"><span class="sxc-logo">'+BOOK+'</span>StepUp</div>'+html+'</div>';
    o.addEventListener('click', function(e){ if(e.target === o) closeOverlay(); });
    document.body.appendChild(o);
    requestAnimationFrame(function(){ o.classList.add('show'); });
    setTimeout(function(){ var b = o.querySelector('.sxc-primary'); if(b) try{ b.focus(); }catch(_){} }, 60);
    return o;
  }
  function closeOverlay(then){
    var o = document.querySelector('.sxc-overlay');
    var run = function(){ if(typeof then === 'function') then(); else if(queue.length) queue.shift()(); };
    if(!o){ run(); return; }
    o.classList.remove('show');
    setTimeout(function(){ o.remove(); run(); }, 200);
  }
  document.addEventListener('keydown', function(e){ if(e.key === 'Escape') closeOverlay(); });
  var BOOK = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 5.5C5.5 4 8.5 4 11 5.5V19c-2.5-1.5-5.5-1.5-8 0z" fill="#2a6ff0"/><path d="M21 5.5C18.5 4 15.5 4 13 5.5V19c2.5-1.5 5.5-1.5 8 0z" fill="#5b8cff"/></svg>';

  function nextStopHTML(ns){
    if(!ns) return '';
    return '<div class="sxc-next-label">Next Stop</div><button type="button" class="sxc-next" data-sxc-next><span class="sxc-next-ic">'+ns.icon+'</span><b>'+esc(ns.label)+'</b><span class="sxc-chev">›</span></button>';
  }

  /* ---------- 1–4: result celebration ---------- */
  var PRAISE_TIP = ['Great understanding. Keep it up!','You really know this. Keep shining!','Strong work — your effort shows!'];
  var EFFORT = ['Good effort! Mistakes are how we learn.','You are closer than you think.','Every try makes you stronger.','Review the clue — you have got this.'];

  function celebrateResult(node){
    var good = node.classList.contains('good');
    var m = ((node.querySelector('.journey-result-score')||{}).textContent||'').match(/(\d+)\s*\/\s*(\d+)/);
    var lr = lastResult && Date.now() - lastResult.at < 20000 ? lastResult : null;
    var pl = lr ? lr.payload : null;
    var score = pl ? Number(pl.score||0) : (m ? +m[1] : 0);
    var total = pl ? Number(pl.total||0) : (m ? +m[2] : 0);
    var pct = total ? Math.round(score/total*100) : 0;
    var name = firstName();

    if(!good){
      if(node.querySelector('.sxc-effort')) return;
      var tip = document.createElement('div'); tip.className = 'sxc-effort';
      tip.innerHTML = '<span aria-hidden="true">💪</span><div><b>'+(name ? 'Keep going, <bdi>'+esc(name)+'</bdi>!' : 'Keep going!')+'</b><small>'+esc(pick(EFFORT))+(score ? ' You already got '+score+' right.' : '')+'</small></div>';
      node.insertBefore(tip, node.firstChild);
      return;
    }

    var prevList = lr ? lr.prev : [];
    var prev = prevList.length ? prevList[prevList.length-1] : null;
    var prevPct = prev ? Number(prev.percentage||0) : null;
    var u = pl ? unitOf(pl.trainingId) : null;
    var stopName = (function(){
      if(!pl) return 'your';
      var t = String(pl.trainingType||'').toLowerCase();
      if(t === 'reading') return 'Reading'; if(t === 'listening') return 'Listening';
      return String(pl.trainingTitle||'skill').replace(/\s*[•|].*$/,'');
    })();

    var v, html;
    var isStep = pl && (String(pl.trainingType||'').toLowerCase() === 'step' || /journey-u\d+-step/.test(String(pl.trainingId||'')));
    if(isStep){
      var ss = u ? stepStats(u) : {attempts:1,best:pct,bestScore:score,bestTotal:total,bestTime:Number(pl && pl.elapsedSeconds||0),ready:pct>=STEP_READY};
      var thisTryTotal = u && u.id === 'u2' && pl && pl.attemptTotal != null ? Number(pl.attemptTotal) : total;
      var thisTryScore = u && u.id === 'u2' && pl && pl.attemptTotal != null ? Number(pl.attemptScore||0) : score;
      var thisTryPct = thisTryTotal > 0 ? Math.round(thisTryScore/thisTryTotal*100) : 0;
      // A partial retake does not count as a complete STEP attempt.
      if(u && u.id === 'u2' && pl && pl.attemptTotal != null && Number(pl.total)!==thisTryTotal) thisTryPct = -1;
      var readyNow = ss.ready || thisTryPct >= STEP_READY;
      v = readyNow ? 'stepready' : 'stepprogress';
      html = '<div class="sxc-step-badge">'+(readyNow?'STEP READY':'STEP PRACTICE')+'</div><div class="sxc-art">'+(readyNow?ART.rocket:ART.bars)+'</div>'+
        '<h2>'+(readyNow?'STEP Ready! ⚡':'STEP progress! ⚡')+'</h2>'+
        '<p class="sxc-sub">'+(readyNow?'You’re building strong STEP habits.':'Good practice. One more try can raise your best score.')+'</p>'+
        '<div class="sxc-box three"><span><small>This Try</small><b>'+thisTryScore+' / '+thisTryTotal+'</b></span><span><small>Best Score</small><b>'+Math.max(0,thisTryPct,ss.best)+'%</b></span><span><small>Best Time</small><b>'+(ss.bestTime?fmtTime(ss.bestTime):'—')+'</b></span></div>'+
        '<div class="sxc-tip '+(readyNow?'green':'gold')+'"><span>'+(readyNow?'🏅':'🎯')+'</span><p>'+(readyNow?'STEP Ready badge earned. Keep practicing whenever you want.':'Reach '+STEP_READY+'% to earn your STEP Ready badge. Your best result is always kept.')+'</p></div>';
    }else if(prev && pct > prevPct && pct >= 100){
      v = 'improved';
      html = '<div class="sxc-art">'+ART.rocket+'</div><h2>Amazing progress! 🚀</h2><p class="sxc-sub">Your score improved.</p>'+
        '<div class="sxc-box sxc-cmp"><span><b>'+Number(prev.score||0)+' / '+Number(prev.total||total)+'</b><small>Previous</small></span><i>→</i><span class="now"><b>'+score+' / '+total+'</b><small>Now</small></span></div>'+
        '<div class="sxc-tip green"><span>📊</span><p>You improved by '+(pct-prevPct)+'%.<br>That’s great progress!</p></div>';
    }else if(prev && pct > prevPct){
      v = 'big';
      html = '<div class="sxc-art">'+ART.bars+'</div><h2>Big improvement! 🎉</h2><p class="sxc-sub">Your '+esc(stopName)+' accuracy improved by:</p><div class="sxc-big">'+(pct-prevPct)+'%</div>'+
        '<div class="sxc-box sxc-cmp"><span><b>'+prevPct+'%</b><small>Before</small></span><i>→</i><span class="now"><b>'+pct+'%</b><small>Now</small></span></div>'+
        '<div class="sxc-tip green"><span>📈</span><p>You’re getting better!<br>Keep going!</p></div>';
    }else if(pct >= 100){
      v = 'mastered';
      html = '<div class="sxc-art">'+ART.star+'</div><h2>Excellent! ⭐</h2><p class="sxc-sub">'+(name ? 'Well done, <bdi>'+esc(name)+'</bdi>! ' : '')+'You mastered this skill.</p>'+
        '<div class="sxc-box"><span><b>'+score+' / '+total+'</b><small>Correct Answers</small></span><span><b>'+pct+'%</b><small>Accuracy</small></span></div>'+
        '<div class="sxc-tip gold"><span>👑</span><p>'+esc(pick(PRAISE_TIP))+'</p></div>';
    }else{
      v = 'good';
      html = '<div class="sxc-art">'+ART.trophy+'</div><h2>Good progress! 💪</h2><p class="sxc-sub">You completed the task.</p>'+
        '<div class="sxc-box"><span><b>'+score+' / '+total+'</b><small>Correct Answers</small></span><span><b>'+pct+'%</b><small>Accuracy</small></span></div>'+
        '<div class="sxc-tip gold"><span>😊</span><p>One quick practice can<br>make it even better.</p></div>';
    }

    var complete = u && unitComplete(u);
    var showUnit = complete && seen().indexOf(u.id) < 0;
    var ns = (!complete && u && pl) ? nextStop(u, pl.trainingId) : null;
    var streak = streakDays();
    html += (streak > 1 ? '<div class="sxc-streak">🔥 '+streak+'-day streak · +'+(25+(pct>=95?35:pct>=80?25:pct>=60?15:8))+' XP</div>' : '') +
      nextStopHTML(ns) +
      '<button type="button" class="sxc-primary" data-sxc-continue>'+(showUnit ? 'See your reward' : 'Continue Journey')+' <span>→</span></button>';

    var show = function(){
      var o = overlay(html, 'sxc-'+v);
      confetti(); buzz();
      var nb = o.querySelector('[data-sxc-next]');
      if(nb) nb.onclick = function(){ closeOverlay(function(){ try{ ns.go(); }catch(e){ P.setStudentTab('journey'); } }); };
      o.querySelector('[data-sxc-continue]').onclick = function(){
        if(showUnit){ markSeen(u.id); closeOverlay(function(){ showUnitComplete(u); }); }
        else closeOverlay(function(){ P.setStudentTab('journey'); });
      };
    };
    if(document.querySelector('.sxc-overlay')) queue.push(show); else show();
  }

  /* ---------- 6: unit completion ---------- */
  function showUnitComplete(u){
    if(!unitComplete(u)){
      var locked = unitStats(u);
      var goal='Complete all required Unit '+u.number+' review questions and reach <b>'+CERT_MASTERY+'% cumulative mastery</b> to unlock your certificate. Your correct answers stay saved when you try again.';
      var lo = overlay('<div class="sxc-step-badge">CERTIFICATE GOAL</div><div class="sxc-art">'+ART.bars+'</div><h2>Almost there! 🎯</h2><p class="sxc-sub">'+goal+'</p><div class="sxc-box"><span><b>'+locked.accuracy+'%</b><small>Review Accuracy</small></span><span><b>'+CERT_MASTERY+'%</b><small>Certificate Goal</small></span></div><button type="button" class="sxc-primary" data-sxc-journey>Continue Journey →</button>', 'sxc-unit');
      lo.querySelector('[data-sxc-journey]').onclick = function(){ closeOverlay(function(){ P.setStudentTab('journey'); }); };
      return;
    }
    var st = unitStats(u), name = firstName();
    var o = overlay(
      '<div class="sxc-art">'+ART.trophy+'</div>'+
      '<h2>Unit '+u.number+' Completed! 🏆</h2>'+
      '<h3>'+(name ? 'You did it, <bdi>'+esc(name)+'</bdi>!' : 'You did it!')+'</h3>'+
      '<p class="sxc-sub">You completed your learning journey in<br><b class="sxc-unit">Unit '+u.number+' • '+esc(u.title)+'</b></p>'+
      '<div class="sxc-box three"><span><small>Skills Mastered</small><b>'+st.mastered+' / '+st.total+'</b></span><span><small>Overall Accuracy</small><b>'+st.accuracy+'%</b></span><span><small>Needs Practice</small><b>'+st.needs+'</b></span></div>'+
      '<div class="sxc-two"><button type="button" class="sxc-primary" data-sxc-cert>View Certificate 🏆</button><button type="button" class="sxc-ghost" data-sxc-journey>My Journey →</button></div>',
      'sxc-unit');
    confetti(); buzz();
    o.querySelector('[data-sxc-cert]').onclick = function(){ closeOverlay(function(){ showCertificate(u); }); };
    o.querySelector('[data-sxc-journey]').onclick = function(){ closeOverlay(function(){ P.setStudentTab('journey'); }); };
  }

  /* ---------- 7: certificate ---------- */
  var fontsReady = null;
  function loadCertFonts(){
    if(fontsReady) return fontsReady;
    if(!document.getElementById('sxcCertFonts')){
      var l = document.createElement('link'); l.id = 'sxcCertFonts'; l.rel = 'stylesheet';
      l.href = 'https://fonts.googleapis.com/css2?family=Great+Vibes&family=Aref+Ruqaa:wght@700&display=swap';
      document.head.appendChild(l);
    }
    var wait = Promise.all(['64px "Great Vibes"','700 60px "Aref Ruqaa"','800 40px Tajawal','700 30px Tajawal','500 30px Tajawal']
      .map(function(f){ return document.fonts ? document.fonts.load(f).catch(function(){}) : null; }));
    fontsReady = Promise.race([wait, new Promise(function(r){ setTimeout(r, 5000); })]);
    return fontsReady;
  }

  /* ---------- certificate design: Bilingual Formal (chosen 2026-10-01) ---------- */
  var CW = 2000, CH = 1414;
  function ar(s){ return /[؀-ۿ]/.test(s||''); }
  function rr(x,a,b,w,h,r){ x.beginPath(); x.moveTo(a+r,b); x.arcTo(a+w,b,a+w,b+h,r); x.arcTo(a+w,b+h,a,b+h,r); x.arcTo(a,b+h,a,b,r); x.arcTo(a,b,a+w,b,r); x.closePath(); }
  function fit(x, text, maxW, size, font, min){ var s = size; do { x.font = font.replace('$', s); s -= 2; } while(x.measureText(text).width > maxW && s > (min||24)); }
  function gold(x,a,b,c,d){ var g = x.createLinearGradient(a,b,c,d); g.addColorStop(0,'#a8761c'); g.addColorStop(.3,'#e9c46a'); g.addColorStop(.5,'#f8e3a1'); g.addColorStop(.7,'#d4a03f'); g.addColorStop(1,'#a8761c'); return g; }
  function spaced(x, text, cx, y, gap){ // letter-spaced centred text
    var chars = text.split(''), w = chars.reduce(function(s,c){ return s + x.measureText(c).width + gap; }, -gap), px = cx - w/2;
    var al = x.textAlign; x.textAlign = 'left';
    chars.forEach(function(c){ x.fillText(c, px, y); px += x.measureText(c).width + gap; });
    x.textAlign = al; return w;
  }
  function nameText(x, d, cx, y, maxW, latin, arabic){
    if(ar(d.name)){ x.direction = 'rtl'; fit(x, d.name, maxW, arabic[0], arabic[1]); }
    else fit(x, d.name, maxW, latin[0], latin[1]);
    x.fillText(d.name, cx, y); x.direction = 'ltr';
  }
  function star(x, cx, cy, ro, ri, n){ x.beginPath(); for(var k=0;k<n*2;k++){ var a=-Math.PI/2+k*Math.PI/n, r=k%2?ri:ro; x.lineTo(cx+Math.cos(a)*r, cy+Math.sin(a)*r); } x.closePath(); }
  function book(x, cx, cy, s, c1, c2){
    x.save(); x.translate(cx, cy); x.scale(s, s); x.translate(-12,-12);
    x.fillStyle = c1; x.beginPath(); x.moveTo(3,5.5); x.bezierCurveTo(5.5,4,8.5,4,11,5.5); x.lineTo(11,19); x.bezierCurveTo(8.5,17.5,5.5,17.5,3,19); x.closePath(); x.fill();
    x.fillStyle = c2; x.beginPath(); x.moveTo(21,5.5); x.bezierCurveTo(18.5,4,15.5,4,13,5.5); x.lineTo(13,19); x.bezierCurveTo(15.5,17.5,18.5,17.5,21,19); x.closePath(); x.fill();
    x.restore();
  }
  /* Official header: Arabic block on the right, English on the left. */
  var OFFICIAL = {
    ar: ['المملكة العربية السعودية','وزارة التعليم','الإدارة العامة للتعليم بمنطقة القصيم'],
    en: ['Kingdom of Saudi Arabia','Ministry of Education','General Administration of Education','Qassim Region']
  };
  function officialHeader(x, d, o){
    var lh = o.lh || 42, y0 = o.top, al = x.textAlign, dir = x.direction;
    x.textBaseline = 'middle';
    // Arabic (right)
    x.textAlign = 'right'; x.direction = 'rtl';
    OFFICIAL.ar.forEach(function(t,i){ x.fillStyle = i===0 ? o.main : o.sub; x.font = (i===0?'800 ':'700 ')+(o.size||30)+'px Tajawal'; x.fillText(t, o.right, y0+i*lh); });
    if(d.school){ x.fillStyle = o.main; fit(x, d.school, o.maxW||620, o.size||30, '800 $px Tajawal'); x.fillText(d.school, o.right, y0+3*lh); }
    // English (left)
    x.textAlign = 'left'; x.direction = 'ltr';
    OFFICIAL.en.forEach(function(t,i){ x.fillStyle = i===0 ? o.main : o.sub; x.font = (i===0?'700 ':'500 ')+((o.size||30)-3)+'px Tajawal'; x.fillText(t, o.left, y0+i*lh); });
    x.textAlign = al; x.direction = dir;
  }

  function leaf(x, cx, cy, s, rot, c1, c2){
    x.save(); x.translate(cx,cy); x.rotate(rot); x.scale(s,s);
    x.fillStyle = c1; x.beginPath(); x.moveTo(0,40); x.bezierCurveTo(-11,28,-12,10,0,-10); x.bezierCurveTo(12,10,11,28,0,40); x.fill();
    x.fillStyle = c2; x.beginPath(); x.moveTo(0,-6); x.bezierCurveTo(8,8,8,24,0,38); x.fill();
    x.restore();
  }

  /* Official header: Arabic block on the right, English on the left. */
  var OFFICIAL = {
    ar: ['المملكة العربية السعودية','وزارة التعليم','الإدارة العامة للتعليم بمنطقة القصيم'],
    en: ['Kingdom of Saudi Arabia','Ministry of Education','General Administration of Education','Qassim Region']
  };
  function officialHeader(x, d, o){
    var lh = o.lh || 42, y0 = o.top, al = x.textAlign, dir = x.direction;
    x.textBaseline = 'middle';
    // Arabic (right)
    x.textAlign = 'right'; x.direction = 'rtl';
    OFFICIAL.ar.forEach(function(t,i){ x.fillStyle = i===0 ? o.main : o.sub; x.font = (i===0?'800 ':'700 ')+(o.size||30)+'px Tajawal'; x.fillText(t, o.right, y0+i*lh); });
    if(d.school){ x.fillStyle = o.main; fit(x, d.school, o.maxW||620, o.size||30, '800 $px Tajawal'); x.fillText(d.school, o.right, y0+3*lh); }
    // English (left)
    x.textAlign = 'left'; x.direction = 'ltr';
    OFFICIAL.en.forEach(function(t,i){ x.fillStyle = i===0 ? o.main : o.sub; x.font = (i===0?'700 ':'500 ')+((o.size||30)-3)+'px Tajawal'; x.fillText(t, o.left, y0+i*lh); });
    x.textAlign = al; x.direction = dir;
  }

  function sparkle(x, cx, cy, r, col){
    x.fillStyle = col; x.beginPath();
    x.moveTo(cx, cy-r); x.quadraticCurveTo(cx, cy, cx+r, cy); x.quadraticCurveTo(cx, cy, cx, cy+r);
    x.quadraticCurveTo(cx, cy, cx-r, cy); x.quadraticCurveTo(cx, cy, cx, cy-r); x.fill();
  }
  /* ================= D — StepUp identity ================= */
  function brand(x, d){
    var W = 2000, H = 1414, T1 = '#1b6f71', T2 = '#0f4e59', T3 = '#0a3f4a', AQ = '#5fe0d0', BL = '#1d5fd6', BL2 = '#2a6ff0',
        ink = '#0f213d', muted = '#6a778c', ln = '#e3eaf3';
    // teal frame like the app hero
    var bg = x.createLinearGradient(0,0,W,H); bg.addColorStop(0,T1); bg.addColorStop(.55,T2); bg.addColorStop(1,T3);
    x.fillStyle = bg; x.fillRect(0,0,W,H);
    x.fillStyle = 'rgba(95,224,208,.16)'; x.beginPath(); x.arc(W-120,60,330,0,Math.PI*2); x.fill();
    x.fillStyle = 'rgba(95,224,208,.10)'; x.beginPath(); x.arc(80,H-40,300,0,Math.PI*2); x.fill();
    for(var i=0;i<40;i++){ x.fillStyle = 'rgba(255,255,255,'+(.05+((i*37)%10)/100)+')'; x.beginPath(); x.arc((i*211)%W, (i*97)%H, 3+(i%3), 0, 7); x.fill(); }
    // paper
    var pp = x.createLinearGradient(0,70,0,H-70); pp.addColorStop(0,'#ffffff'); pp.addColorStop(1,'#eef5fc');
    x.save(); x.shadowColor = 'rgba(0,0,0,.25)'; x.shadowBlur = 40; x.shadowOffsetY = 12;
    x.fillStyle = pp; rr(x,70,70,W-140,H-140,44); x.fill(); x.restore();
    x.strokeStyle = 'rgba(95,224,208,.55)'; x.lineWidth = 3; rr(x,96,96,W-192,H-192,32); x.stroke();
    // corner leaves + sparkles (app illustration language)
    var LF = ['#2f8c5f','rgba(91,183,132,.65)'];
    leaf(x,92,118,1.7,-0.75,LF[0],LF[1]); leaf(x,140,86,1.3,-0.2,LF[0],LF[1]);
    leaf(x,W-92,118,1.7,0.75,LF[0],LF[1]); leaf(x,W-140,86,1.3,0.2,LF[0],LF[1]);
    sparkle(x,W/2-150,190,12,'#ffd461'); sparkle(x,W/2+150,214,10,'#5fe0d0'); sparkle(x,W/2+330,640,12,'#ffd461'); sparkle(x,W/2-360,690,10,'#5fe0d0');
    // header
    officialHeader(x, d, {top:178, left:210, right:W-210, main:ink, sub:'#55627a', size:28, lh:38, maxW:560});
    // app logo square
    x.save(); x.shadowColor='rgba(10,63,74,.35)'; x.shadowBlur=18; x.shadowOffsetY=6;
    var lg = x.createLinearGradient(W/2-48,140,W/2+48,236); lg.addColorStop(0,T1); lg.addColorStop(1,T3);
    x.fillStyle = lg; rr(x,W/2-48,140,96,96,26); x.fill(); x.restore();
    x.fillStyle = '#fff'; x.textAlign='center'; x.textBaseline='middle'; x.font = '800 40px Tajawal'; x.fillText('SU', W/2, 190);
    x.fillStyle = ink; x.font = '800 34px Tajawal'; x.fillText('StepUp', W/2, 268);
    x.fillStyle = muted; x.font = '500 20px Tajawal'; x.fillText('Created by Nuha Almutairi', W/2, 300);
    x.strokeStyle = ln; x.lineWidth = 3; x.beginPath(); x.moveTo(200,336); x.lineTo(W-200,336); x.stroke();
    // title with teal→blue gradient
    var tg = x.createLinearGradient(W/2-280,0,W/2+280,0); tg.addColorStop(0,T1); tg.addColorStop(1,BL2);
    x.fillStyle = tg; x.direction='rtl'; x.font = '800 108px Tajawal'; x.fillText('شهادة إنجاز', W/2, 418); x.direction='ltr';
    // pill like the app
    x.font = '800 26px Tajawal'; var pw = spacedWidth(x,'CERTIFICATE OF ACHIEVEMENT',6) + 70;
    x.fillStyle = '#dff1e6'; rr(x,W/2-pw/2,474,pw,52,26); x.fill();
    x.fillStyle = '#123a2a'; spaced(x,'CERTIFICATE OF ACHIEVEMENT',W/2,501,6);
    x.fillStyle = muted; x.direction='rtl'; x.font = '500 34px Tajawal'; x.fillText('تُمنح هذه الشهادة للطالبة المتميزة', W/2, 576); x.direction='ltr';
    x.font = '500 28px Tajawal'; x.fillText('Proudly presented to', W/2, 618);
    // name
    x.fillStyle = ink; nameText(x, d, W/2, 712, 1100, [132,'$px "Great Vibes"'], [104,'700 $px "Aref Ruqaa"']);
    var ug = x.createLinearGradient(W/2-220,0,W/2+220,0); ug.addColorStop(0,AQ); ug.addColorStop(1,'#2fd27a');
    x.fillStyle = ug; rr(x,W/2-220,786,440,12,6); x.fill();
    x.fillStyle = muted; x.direction='rtl'; x.font = '500 32px Tajawal'; x.fillText('لإتمامها بنجاح', W/2, 842); x.direction='ltr';
    x.font = '500 26px Tajawal'; x.fillText('for successfully completing', W/2, 880);
    // unit on a teal ribbon
    var ut = 'Unit '+d.unitNo+' · '+d.unitTitle; x.font = '800 52px Tajawal';
    var bw = Math.min(1000, x.measureText(ut).width) + 150, by = 958;
    x.fillStyle = T3;
    [-1,1].forEach(function(sd){ x.beginPath(); x.moveTo(W/2+sd*(bw/2-40), by-34+14); x.lineTo(W/2+sd*(bw/2+70), by-34+14); x.lineTo(W/2+sd*(bw/2+40), by+14); x.lineTo(W/2+sd*(bw/2+70), by+34+14); x.lineTo(W/2+sd*(bw/2-40), by+34+14); x.closePath(); x.fill(); });
    var rb = x.createLinearGradient(W/2-bw/2,0,W/2+bw/2,0); rb.addColorStop(0,T1); rb.addColorStop(1,T2);
    x.fillStyle = rb; rr(x,W/2-bw/2,by-44,bw,88,14); x.fill();
    x.fillStyle = '#fff'; fit(x, ut, bw-90, 52, '800 $px Tajawal'); x.fillText(ut, W/2+26, by+2);
    // tiny stairs icon on the ribbon
    var ix = W/2 - x.measureText(ut).width/2 - 24, iy = by+14;
    ['#8fb3ef','#5b93f3','#ffffff'].forEach(function(c,i){ x.fillStyle=c; rr(x, ix-30+i*14, iy-12-i*10, 11, 14+i*10, 2); x.fill(); });
    x.fillStyle = '#ffd461'; x.beginPath(); x.moveTo(ix+3,iy-46); x.lineTo(ix+18,iy-41); x.lineTo(ix+3,iy-36); x.fill();
    // bottom: three app-style tiles + seal
    var ty = 1062, th = 200, tw = 430;
    function tile(cx, fill){ x.fillStyle = fill; rr(x,cx-tw/2,ty,tw,th,30); x.fill(); }
    tile(470,'#e8f2fd'); tile(W-470,'#efeefc');
    // accuracy ring tile
    var rx = 390, ry = ty+th/2;
    x.lineWidth = 14; x.strokeStyle = 'rgba(29,95,214,.15)'; x.beginPath(); x.arc(rx,ry,58,0,Math.PI*2); x.stroke();
    var rg = x.createLinearGradient(rx-60,ry-60,rx+60,ry+60); rg.addColorStop(0,AQ); rg.addColorStop(1,BL2);
    x.strokeStyle = rg; x.lineCap='round'; x.beginPath(); x.arc(rx,ry,58,-Math.PI/2,-Math.PI/2+Math.PI*2*Math.max(.02,Math.min(1,d.acc/100))); x.stroke(); x.lineCap='butt';
    x.fillStyle = BL; x.font = '800 34px Tajawal'; x.fillText(d.acc+'%', rx, ry+2);
    x.textAlign='left'; x.fillStyle = ink; x.font = '800 32px Tajawal'; x.fillText('Accuracy', rx+86, ry-26);
    x.fillStyle = muted; x.direction='rtl'; x.textAlign='right'; x.font = '700 28px Tajawal'; x.fillText('نسبة الإنجاز', rx+86+165, ry+22); x.direction='ltr'; x.textAlign='center';
    // teacher tile
    var tx = W-470;
    x.fillStyle = '#1b2f63'; if(ar(d.teacher)){ x.direction='rtl'; x.font='700 48px "Aref Ruqaa"'; } else x.font = '68px "Great Vibes"';
    x.fillText(d.teacherFirst, tx, ty+58); x.direction='ltr';
    x.strokeStyle = '#c9c3f2'; x.lineWidth = 2; x.beginPath(); x.moveTo(tx-150,ty+96); x.lineTo(tx+150,ty+96); x.stroke();
    x.fillStyle = ink; x.direction = ar(d.teacherTitled)?'rtl':'ltr'; x.font = '800 28px Tajawal'; x.fillText(d.teacherTitled, tx, ty+132); x.direction='ltr';
    x.fillStyle = '#5a4fc4'; x.font = '700 24px Tajawal'; x.fillText('Teacher · المعلمة', tx, ty+170);
    // centre seal (teal + aqua + gold star) with blue ribbons, date in a mint pill
    var sx = W/2, sy = ty+64;
    x.fillStyle = BL;
    [-1,1].forEach(function(s){ x.beginPath(); x.moveTo(sx+s*40,sy+46); x.lineTo(sx+s*60,sy+96); x.lineTo(sx+s*44,sy+88); x.lineTo(sx+s*28,sy+104); x.lineTo(sx+s*6,sy+54); x.closePath(); x.fill(); });
    x.fillStyle = '#ffd461'; star(x,sx,sy,88,78,28); x.fill();
    x.fillStyle = AQ; x.beginPath(); x.arc(sx,sy,68,0,Math.PI*2); x.fill();
    var sg = x.createLinearGradient(sx-60,sy-60,sx+60,sy+60); sg.addColorStop(0,T1); sg.addColorStop(1,T3);
    x.fillStyle = sg; x.beginPath(); x.arc(sx,sy,60,0,Math.PI*2); x.fill();
    x.fillStyle = '#ffd461'; star(x,sx,sy-6,30,13,5); x.fill();
    x.fillStyle = '#fff'; x.font = '800 15px Tajawal'; spaced(x,'STEPUP',sx,sy+34,4);
    x.font = '800 28px Tajawal'; var dw = x.measureText(d.date).width + 60;
    x.fillStyle = '#e9f6ef'; rr(x,sx-dw/2,ty+176,dw,48,24); x.fill();
    x.fillStyle = '#178a55'; x.fillText(d.date, sx, ty+201);
    // stairs illustration in the bottom corners
    function stairs(bx, byy, sc){
      ['#8fb3ef','#5b93f3','#2a6ff0','#1b4fb8'].forEach(function(c,i){ x.fillStyle=c; rr(x,bx+i*24*sc,byy-(18+i*16)*sc,20*sc,(18+i*16)*sc,4*sc); x.fill(); });
      x.strokeStyle='#1b4fb8'; x.lineWidth=3*sc; x.beginPath(); x.moveTo(bx+3*24*sc+10*sc,byy-66*sc); x.lineTo(bx+3*24*sc+10*sc,byy-96*sc); x.stroke();
      x.fillStyle='#ffd461'; x.beginPath(); x.moveTo(bx+3*24*sc+11*sc,byy-96*sc); x.lineTo(bx+3*24*sc+30*sc,byy-89*sc); x.lineTo(bx+3*24*sc+11*sc,byy-82*sc); x.fill();
    }
    stairs(118, H-108, 1.0); leaf(x, W-160, H-150, 1.8, 0.6, LF[0], LF[1]); leaf(x, W-215, H-128, 1.4, 0.1, LF[0], LF[1]);
  }
  function spacedWidth(x, text, gap){ return text.split('').reduce(function(s,c){ return s + x.measureText(c).width + gap; }, -gap); }


  /* STEP completion is an extra achievement on the existing unit certificate.
     The saved attempt history is the source of truth; STEP never blocks mastery. */
  function drawStepAchievementStamp(x, u){
    var award = stepStats(u);
    if(!award || !award.ready) return;
    var cx = 1668, cy = 814, radius = 110;
    x.save();
    x.translate(cx, cy);
    x.rotate(-0.09);
    x.textAlign = 'center'; x.textBaseline = 'middle'; x.direction = 'ltr';
    x.shadowColor = 'rgba(10,63,74,.20)'; x.shadowBlur = 18; x.shadowOffsetY = 5;
    x.fillStyle = gold(x,-radius,-radius,radius,radius);
    x.beginPath(); x.arc(0,0,radius,0,Math.PI*2); x.fill();
    x.shadowColor = 'transparent'; x.shadowBlur = 0; x.shadowOffsetY = 0;
    x.fillStyle = '#fffcf0'; x.beginPath(); x.arc(0,0,97,0,Math.PI*2); x.fill();
    x.strokeStyle = '#ba8a2d'; x.lineWidth = 3;
    x.beginPath(); x.arc(0,0,91,0,Math.PI*2); x.stroke();
    x.strokeStyle = 'rgba(15,78,89,.45)'; x.lineWidth = 1.5;
    x.beginPath(); x.arc(0,0,84,0,Math.PI*2); x.stroke();
    x.fillStyle = '#0f4e59'; x.font = '900 34px Tajawal'; x.fillText('STEP',0,-53);
    x.fillStyle = '#d1a043'; star(x,0,-12,20,9,5); x.fill();
    x.fillStyle = '#0f4e59'; x.font = '800 20px Tajawal'; x.fillText('CHALLENGE',0,24);
    x.font = '900 25px Tajawal'; x.fillText('ACHIEVED',0,54);
    x.restore();
    if(award.ready){
      x.save(); x.textAlign = 'center'; x.textBaseline = 'middle'; x.direction = 'ltr';
      x.fillStyle = '#0c7259'; rr(x,cx-99,cy+116,198,46,23); x.fill();
      x.strokeStyle = '#f7d77b'; x.lineWidth = 3; rr(x,cx-99,cy+116,198,46,23); x.stroke();
      x.fillStyle = '#ffffff'; x.font = '800 23px Tajawal'; x.fillText('STEP READY',cx,cy+139);
      x.restore();
    }
  }

  async function drawCertificate(u){
    var p = await getProfile(); var teacher = await getTeacherName(); await loadCertFonts();
    var st = unitStats(u);
    var c = document.createElement('canvas'); c.width = CW; c.height = CH;
    var x = c.getContext('2d'); x.textAlign = 'center'; x.textBaseline = 'middle';
    brand(x, {
      name: p.name || 'StepUp Student', unitNo: u.number, unitTitle: u.title, acc: st.accuracy,
      date: new Date().toLocaleDateString('en-GB',{day:'numeric',month:'long',year:'numeric'}),
      school: p.school || '', teacher: teacher, teacherFirst: teacher.split(/\s+/)[0], teacherTitled: titled(teacher),
      year: new Date().getFullYear()
    });
    drawStepAchievementStamp(x, u);
    return c;
  }
  function fileName(u){
    var n = (profile && profile.name || 'student').replace(/[^\w؀-ۿ]+/g,'-').replace(/^-|-$/g,'');
    return 'StepUp-Certificate-Unit'+u.number+'-'+n+'.png';
  }
  async function showCertificate(u){
    if(!unitComplete(u)) return showUnitComplete(u);
    var o = overlay(
      '<h2 class="sxc-cert-title">Certificate of Achievement</h2><p class="sxc-sub">Unit '+u.number+' • '+esc(u.title)+'</p>'+
      '<div class="sxc-cert"><span class="sxc-cert-loading">Preparing your certificate…</span></div>'+
      '<div class="sxc-two"><button type="button" class="sxc-primary" data-sxc-dl disabled>Download</button><button type="button" class="sxc-ghost" data-sxc-share disabled>Share</button></div>'+
      '<button type="button" class="sxc-link" data-sxc-close>Close</button>', 'sxc-certwrap');
    o.querySelector('[data-sxc-close]').onclick = function(){ closeOverlay(); };
    var canvas = await drawCertificate(u);
    if(!document.body.contains(o)) return;
    var img = new Image(); img.alt = 'Certificate for Unit '+u.number; img.src = canvas.toDataURL('image/png');
    var holder = o.querySelector('.sxc-cert'); holder.innerHTML = ''; holder.appendChild(img);
    canvas.toBlob(function(blob){
      if(!blob) return;
      var dl = o.querySelector('[data-sxc-dl]'), sh = o.querySelector('[data-sxc-share]');
      dl.disabled = false;
      dl.onclick = function(){ var a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = fileName(u); document.body.appendChild(a); a.click(); setTimeout(function(){ URL.revokeObjectURL(a.href); a.remove(); }, 1500); };
      var file = null; try{ file = new File([blob], fileName(u), {type:'image/png'}); }catch(_){}
      if(file && navigator.canShare && navigator.canShare({files:[file]})){
        sh.disabled = false;
        sh.onclick = function(){ navigator.share({files:[file], title:'My StepUp certificate', text:'I completed Unit '+u.number+' on StepUp!'}).catch(function(){}); };
      }else sh.remove();
    }, 'image/png');
  }

  /* ---------- 5: unit map statuses ---------- */
  var LABEL_TO_KEY = {master:'master', vocab:'vocab', vocabulary:'vocab', grammar:'grammar', functions:'functions', read:'reading', reading:'reading',
    listen:'listening', listening:'listening', step:'step', final:'final', form:'functions'};
  var STATUS_TEXT = {mastered:'Mastered', improved:'Improved', completed:'Completed'};
  function decorateUnitMap(view){
    var road = view.querySelector('.journey-focus-roadmap');
    var head = view.querySelector('.journey-focus-head');
    if(!road || !head) return;
    var t = ((head.querySelector('h1')||{}).textContent||'').trim();
    var u = J.data.units.find(function(x){ return x.title === t; });
    if(!u) return;
    var stops = stopsOf(u), byKey = {};
    stops.forEach(function(s){ byKey[s.key] = s; });
    var sig = stops.map(function(s){ return statusOf(s); }).join(',');
    if(road.getAttribute('data-sxc-sig') === sig && head.querySelector('.sxc-mastery')) return;
    road.setAttribute('data-sxc-sig', sig);
    road.querySelectorAll('.journey-focus-stage').forEach(function(stage){
      var sm = stage.querySelector('small'); if(!sm) return;
      var label = String(sm.getAttribute('title') || sm.textContent || '').toLowerCase().split(/[\s,&•]+/)[0];
      var key = LABEL_TO_KEY[label], status = null;
      if(key === 'master'){
        if(usesExam(u)) return;
        var cores = stops.filter(function(s){ return s.core; }), cs = cores.map(statusOf);
        if(cs.length && cs.every(function(s){ return s==='mastered'; })) status = 'mastered';
        else if(cs.length && cs.every(function(s){ return s!=='todo' && s!=='tried'; })) status = cs.some(function(s){ return s==='improved'; }) ? 'improved' : 'completed';
      }else if(byKey[key]) status = statusOf(byKey[key]);
      stage.classList.remove('sxc-mastered','sxc-improved','sxc-completed');
      var old = stage.querySelector('.sxc-stage-status'); if(old) old.remove();
      if(status && STATUS_TEXT[status]){
        stage.classList.add('sxc-'+status);
        var e = document.createElement('em'); e.className = 'sxc-stage-status'; e.textContent = STATUS_TEXT[status];
        stage.appendChild(e);
      }
    });
    var counted = stops.filter(function(s){ return s.key !== 'step'; });
    var mastered = counted.filter(function(s){ return usesFullReview(u) ? best(s.id) >= CERT_MASTERY : statusOf(s) === 'mastered'; }).length;
    var bar = head.querySelector('.sxc-mastery');
    if(!bar){ bar = document.createElement('div'); bar.className = 'sxc-mastery'; head.appendChild(bar); }
    bar.innerHTML = '<span><b>'+mastered+' of '+counted.length+'</b> skills mastered</span><i><em style="width:'+Math.round(mastered/Math.max(1,counted.length)*100)+'%"></em></i>';
  }

  /* ---------- Unit 1: same mastery model + STEP Ready ---------- */
  function decorateUnit1(view){
    if(!view) return;
    var unitTitle = ((view.querySelector('.journey-unit-hero h1')||{}).textContent||'').trim();
    if(unitTitle !== 'Big Changes') return;
    var u = (J.data.units||[]).find(function(x){ return x.id === 'u1'; }); if(!u) return;
    var g = unit1Progress(u), hero = view.querySelector('.journey-unit-hero');

    if(hero){
      var sig = [g.eligible?1:0,g.answered,g.total,g.accuracy].join('|');
      var award = hero.querySelector('.sxc-u1-award');
      if(!award){ award = document.createElement('div'); award.className = 'sxc-u2-award sxc-u1-award'; hero.appendChild(award); }
      if(award.getAttribute('data-sig') !== sig){
        award.setAttribute('data-sig',sig); award.className = 'sxc-u2-award sxc-u1-award '+(g.eligible?'unlocked':'');
        if(g.eligible){
          award.innerHTML = '<span class="sxc-u2-award-icon">🏆</span><div><b>Certificate unlocked</b><small>Unit 1 mastered • '+g.accuracy+'% overall accuracy</small></div>';
        }else if(g.total && g.answered >= g.total){
          award.innerHTML = '<span class="sxc-u2-award-icon">🎯</span><div><b>Certificate goal: '+CERT_MASTERY+'%</b><small>Current accuracy '+g.accuracy+'% • Practice your weakest skill to unlock it.</small></div>';
        }else{
          award.innerHTML = '<span class="sxc-u2-award-icon">🎓</span><div><b>Certificate goal</b><small>Complete all required Unit 1 stops and reach '+CERT_MASTERY+'% overall accuracy.</small></div>';
        }
      }
    }

    var list = view.querySelector('.journey-stops');
    if(list){
      var buttons = Array.prototype.slice.call(list.querySelectorAll('.journey-stop'));
      var stepBtn = buttons.find(function(b){ return /STEP Practice/i.test(((b.querySelector('b')||{}).textContent)||''); });
      var finalBtn = buttons.find(function(b){ return /Final Challenge/i.test(((b.querySelector('b')||{}).textContent)||''); });
      var listenStop = stopsOf(u).find(function(x){ return x.key==='listening'; });
      var finalStop = stopsOf(u).find(function(x){ return x.key==='final'; });

      // Final Challenge opens after Listening; STEP is no longer a gate.
      if(finalBtn && listenStop && passedStop(listenStop) && finalStop && !passedStop(finalStop)){
        finalBtn.classList.remove('locked');
        finalBtn.setAttribute('onclick',"STEPUP_JOURNEY.startFinal('u1')");
        var ar = finalBtn.querySelector('.journey-stop-arrow'); if(ar) ar.textContent='›';
        var sm = finalBtn.querySelector('small'); if(sm) sm.textContent='Finish the unit with confidence.';
      }

      if(stepBtn){
        var ss = stepStats(u), stepSig = [ss.attempts,ss.best,ss.bestScore,ss.bestTotal,ss.bestTime,ss.ready?1:0].join('|');
        var summary = list.querySelector('.sxc-u1-step-summary');
        if(!summary){ summary = document.createElement('div'); summary.className='sxc-step-summary sxc-u1-step-summary'; stepBtn.insertAdjacentElement('afterend',summary); }
        if(summary.getAttribute('data-sig') !== stepSig){
          summary.setAttribute('data-sig',stepSig); summary.className='sxc-step-summary sxc-u1-step-summary '+(ss.ready?'ready':'');
          if(ss.attempts){
            summary.innerHTML='<span class="sxc-step-summary-badge">'+(ss.ready?'STEP READY':'STEP PRACTICE')+'</span><div><b>Best '+ss.best+'%</b><small>'+(ss.bestScore&&ss.bestTotal?ss.bestScore+' / '+ss.bestTotal+' • ':'')+(ss.bestTime?'Best time '+fmtTime(ss.bestTime)+' • ':'')+ss.attempts+' attempt'+(ss.attempts===1?'':'s')+'</small></div>';
          }else{
            summary.innerHTML='<span class="sxc-step-summary-badge">STEP</span><div><b>Earn your STEP Ready badge</b><small>Reach '+STEP_READY+'% or higher. STEP is extra practice and never blocks your unit certificate.</small></div>';
          }
        }
      }
    }
  }

  // Avoid rewriting the same DOM on each MutationObserver scan.
  // Rewriting identical text repeatedly can create a self-sustaining render loop
  // that makes question buttons feel unresponsive on low-memory phones.
  function putText(el,value){ if(el&&el.textContent!==String(value))el.textContent=String(value); }
  function putHTML(el,value){ if(el&&el.innerHTML!==value)el.innerHTML=value; }
  function decorateUnit1JourneyHome(view){
    if(!view) return;
    var u=(J.data.units||[]).find(function(x){ return x.id==='u1'; }); if(!u) return;
    var g=unit1Progress(u), req=unit1RequiredStops(u);

    // Correct the Unit 1 card so old STEP-gated state does not make a mastered unit look incomplete.
    var cards=Array.prototype.slice.call(view.querySelectorAll('.journey-unit-card'));
    var card=cards.find(function(c){ return (((c.querySelector('h3')||{}).textContent)||'').trim()==='Big Changes'; });
    if(card){
      var pct=Math.round((g.answered/Math.max(1,g.total))*100);
      var status=card.querySelector('.journey-status'); putText(status,g.eligible?'Complete':(g.answered?'In progress':'Ready'));
      card.classList.toggle('complete',g.eligible);
      var bar=card.querySelector('.journey-mini-progress i'); if(bar && bar.style.width!==pct+'%') bar.style.width=pct+'%';
      var foot=card.querySelector('.journey-unit-foot'); putHTML(foot,'<span>'+g.answered+'/'+g.total+(U1()&&U1().getProgress?' review questions':' required stops')+'</span><strong>'+pct+'%</strong>');
    }

    // The home continue card should never make STEP a prerequisite for Final Challenge.
    var cont=view.querySelector('.journey-continue');
    var h2=cont && cont.querySelector('h2');
    if(cont && h2 && /Unit 1\s*•\s*Big Changes/i.test(h2.textContent||'')){
      var btn=cont.querySelector('.journey-main-btn');
      if(U1() && U1().getProgress){
        var ug=unit1Progress(u), pfull=cont.querySelector('p');
        if(ug.eligible){
          putHTML(pfull,'<strong>Unit mastered</strong> — All review questions are complete and your certificate is unlocked.');
          if(btn){ putText(btn,'Open Unit 1'); btn.onclick=function(){ U1().open(); }; }
        }else{
          putHTML(pfull,'<strong>Continue Unit 1 Review</strong> — '+ug.answered+'/'+ug.total+' approved review questions completed • '+ug.accuracy+'% accuracy.');
          if(btn){ putText(btn,'Continue Review'); btn.onclick=function(){ U1().open(); }; }
        }
        return;
      }
      var strong=cont.querySelector('p strong');
      var p=cont.querySelector('p');
      var final=req.find(function(x){ return x.key==='final'; });
      var listening=req.find(function(x){ return x.key==='listening'; });
      if(g.eligible){
        putText(strong,'Unit mastered');
        putHTML(p,'<strong>Unit mastered</strong> — Your certificate is unlocked. STEP Practice is still available anytime.');
        if(btn){ putText(btn,'Open Unit 1'); btn.onclick=function(){ J.openUnit('u1'); }; }
      }else if(listening && passedStop(listening) && final && history(final.id).length===0){
        putText(strong,'Final Challenge');
        putHTML(p,'<strong>Final Challenge</strong> — Finish the required journey. STEP Practice is extra and can be done anytime.');
        if(btn){ putText(btn,'Continue'); btn.onclick=function(){ J.startFinal('u1'); }; }
      }else if(g.answered===g.total && g.accuracy<CERT_MASTERY){
        var weak=req.slice().sort(function(a,b){ return best(a.id)-best(b.id); })[0];
        if(weak){
          putHTML(p,'<strong>Raise your mastery</strong> — Current overall accuracy '+g.accuracy+'%. Practice your weakest stop to reach '+CERT_MASTERY+'%.');
          if(btn){ putText(btn,'Practice '+weak.label); btn.onclick=function(){ weak.go(); }; }
        }
      }
    }
  }

  /* ---------- Unit 3: full-review card correction ---------- */
  function decorateUnit3JourneyHome(view){
    if(!view || !U3() || !U3().getProgress) return;
    var u=(J.data.units||[]).find(function(x){ return x.id==='u3'; }); if(!u) return;
    var g=unit3Progress(u);
    var cards=Array.prototype.slice.call(view.querySelectorAll('.journey-unit-card'));
    var card=cards.find(function(c){ return (((c.querySelector('h3')||{}).textContent)||'').trim()==='What Will Be, Will Be'; });
    if(card){
      var pct=Math.round((g.answered/Math.max(1,g.total))*100);
      var status=card.querySelector('.journey-status'); putText(status,g.eligible?'Complete':(g.answered?'In progress':'Ready'));
      card.classList.toggle('complete',g.eligible);
      var bar=card.querySelector('.journey-mini-progress i'); if(bar && bar.style.width!==pct+'%') bar.style.width=pct+'%';
      var foot=card.querySelector('.journey-unit-foot'); putHTML(foot,'<span>'+g.answered+'/'+g.total+' review questions</span><strong>'+pct+'%</strong>');
    }
    var cont=view.querySelector('.journey-continue'), h2=cont&&cont.querySelector('h2');
    if(cont && h2 && /Unit 3\s*•\s*What Will Be, Will Be/i.test(h2.textContent||'')){
      var btn=cont.querySelector('.journey-main-btn'), p=cont.querySelector('p');
      if(g.eligible){ putHTML(p,'<strong>Unit mastered</strong> — All Unit 3 review questions are complete and your certificate is unlocked.'); if(btn){putText(btn,'Open Unit 3');btn.onclick=function(){U3().open();};} }
      else { putHTML(p,'<strong>Continue Unit 3 Review</strong> — '+g.answered+'/'+g.total+' approved review questions completed • '+g.accuracy+'% accuracy.'); if(btn){putText(btn,'Continue Review');btn.onclick=function(){U3().open();};} }
    }
  }

  /* ---------- Unit 2: certificate goal + STEP Ready badge ---------- */
  function decorateUnit2Exam(view){
    if(!U2() || !U2().getProgress || !view) return;
    var unitTitle = ((view.querySelector('.journey-unit-hero h1')||{}).textContent||'').trim();
    if(unitTitle !== 'Careers') return;
    var u = (J.data.units||[]).find(function(x){ return x.id === 'u2'; }); if(!u) return;
    var g; try{ g = U2().getProgress(); }catch(_){ return; }
    var hero = view.querySelector('.journey-unit-hero');
    if(hero){
      var eligible = unitComplete(u), answered = Number(g.answered||0), total = Number(g.total||0), acc = Number(g.accuracy||0);
      var heroSig = [eligible?1:0,answered,total,acc].join('|');
      var box = hero.querySelector('.sxc-u2-award');
      if(!box){ box = document.createElement('div'); box.className = 'sxc-u2-award'; hero.appendChild(box); }
      if(box.getAttribute('data-sig') !== heroSig){
        box.setAttribute('data-sig', heroSig); box.className = 'sxc-u2-award '+(eligible?'unlocked':'');
        if(eligible){
          box.innerHTML = '<span class="sxc-u2-award-icon">🏆</span><div><b>Certificate unlocked</b><small>Unit 2 mastered • '+acc+'% overall accuracy</small></div>';
        }else if(total && answered >= total){
          box.innerHTML = '<span class="sxc-u2-award-icon">🎯</span><div><b>Certificate goal · '+CERT_MASTERY+'%</b><small>Review your missed answers. Your previous correct answers still count.</small></div>';
        }else{
          box.innerHTML = '<span class="sxc-u2-award-icon">🎓</span><div><b>Certificate goal · '+CERT_MASTERY+'%</b><small>Complete the unit review and improve your cumulative mastery.</small></div>';
        }
      }
    }
    var card = view.querySelector('.u2-step-separate-card');
    if(card){
      var ss = stepStats(u), stepSig = [ss.attempts,ss.best,ss.bestScore,ss.bestTotal,ss.bestTime,ss.ready?1:0].join('|');
      var summary = card.querySelector('.sxc-step-summary');
      if(!summary){ summary = document.createElement('div'); summary.className = 'sxc-step-summary'; var title = card.querySelector('.journey-stage-title'); if(title) title.insertAdjacentElement('afterend', summary); else card.prepend(summary); }
      if(summary.getAttribute('data-sig') !== stepSig){
        summary.setAttribute('data-sig', stepSig); summary.className = 'sxc-step-summary '+(ss.ready?'ready':'');
        if(ss.attempts){
          summary.innerHTML = '<span class="sxc-step-summary-badge">'+(ss.ready?'STEP READY':'STEP PRACTICE')+'</span><div><b>Best '+ss.best+'%</b><small>'+(ss.bestScore&&ss.bestTotal?ss.bestScore+' / '+ss.bestTotal+' • ':'')+(ss.bestTime?'Best time '+fmtTime(ss.bestTime)+' • ':'')+ss.attempts+' attempt'+(ss.attempts===1?'':'s')+'</small></div>';
        }else{
          summary.innerHTML = '<span class="sxc-step-summary-badge">STEP</span><div><b>Earn your STEP Ready badge</b><small>Reach '+STEP_READY+'% or higher. Your best score and fastest time will be kept.</small></div>';
        }
      }
    }
  }

  /* ---------- My Certificates on Progress ---------- */
  function addShelf(view){
    var onProgress = !!view.querySelector('.journey-progress-card, .sx-progress-hero') || /progress/i.test(((view.querySelector('.student-page-head h1')||{}).textContent)||'');
    if(!onProgress || view.querySelector('.sxc-shelf')) return;
    var units = J.data.units||[], done = units.filter(unitComplete), next = units.find(function(u){ return !unitComplete(u); });
    var shelf = document.createElement('section'); shelf.className = 'sxc-shelf';
    shelf.innerHTML = '<div class="sxc-shelf-head"><h2>🎓 My Certificates</h2><span>'+done.length+' earned</span></div>'+
      (done.length ? '<div class="sxc-shelf-list">'+done.map(function(u){
          var award = stepStats(u);
          var achievement = award.ready ? ' • STEP Ready' : '';
          return '<button type="button" class="sxc-cert-item" data-unit="'+u.id+'"><span class="sxc-medal">'+u.number+'</span><span><b>Unit '+u.number+'</b><small>'+esc(u.title)+achievement+'</small></span><span class="sxc-view">View</span></button>';
        }).join('')+'</div>'
        : '<p class="sxc-empty">Complete the unit mastery goal to earn its certificate.'+(next ? ' Next up: <b>Unit '+next.number+'</b>.' : '')+'</p>');
    shelf.addEventListener('click', function(e){
      var b = e.target.closest('[data-unit]'); if(!b) return;
      var u = units.find(function(x){ return x.id === b.getAttribute('data-unit'); }); if(u) showCertificate(u);
    });
    var anchor = view.querySelector('.journey-progress-card') || view.querySelector('.sx-progress-hero');
    if(anchor) anchor.insertAdjacentElement('afterend', shelf); else view.appendChild(shelf);
  }

  /* ---------- watch ---------- */
  var app = document.getElementById('app'), busy = false, timer = null;
  function scan(){
    busy = true;
    try{
      wrapJourney();
      var view = app && app.querySelector('.student-view');
      if(view){
        var r = view.querySelector('.journey-result:not([data-sxc])');
        if(r){ r.setAttribute('data-sxc','1'); getProfile().then(function(){ celebrateResult(r); }); }
        decorateUnitMap(view);
        decorateUnit1(view);
        decorateUnit1JourneyHome(view);
        decorateUnit3JourneyHome(view);
        decorateUnit2Exam(view);
        addShelf(view);
      }
    }catch(e){ console.warn('StepUp celebrations:', e); }
    busy = false;
  }
  // Debounce, but never wait more than 300 ms: animations elsewhere change the page
  // every frame and would otherwise postpone the scan indefinitely.
  var firstPending = 0;
  if(app) new MutationObserver(function(){
    if(busy) return;
    var now = Date.now(); if(!firstPending) firstPending = now;
    clearTimeout(timer);
    var run = function(){ firstPending = 0; scan(); };
    if(now - firstPending > 300) run(); else timer = setTimeout(run, 60);
  }).observe(app, {childList:true, subtree:true});

  window.STEPUP_CELEBRATE = {showCertificate:showCertificate, showUnitComplete:showUnitComplete, drawCertificate:drawCertificate,
    completedUnits:function(){ return (J.data.units||[]).filter(unitComplete); }, certificateMastery:CERT_MASTERY, stepReady:STEP_READY};
})();
