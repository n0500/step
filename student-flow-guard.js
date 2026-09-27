/* StepUp student flow guard — 2026-09-27 */
(() => {
  'use strict';

  const VERSION = '20260927-flow-guard-1';
  const PENDING_KEY = 'stepup_pending_journey_attempt_v1';
  let originalRecordJourneyAttempt = null;
  let refreshTimer = null;

  const fbReady = () => !!(window.firebase?.auth && window.firebase?.firestore);

  async function sha256(txt){
    const data = new TextEncoder().encode(txt);
    const hash = await crypto.subtle.digest('SHA-256', data);
    return [...new Uint8Array(hash)].map(b => b.toString(16).padStart(2,'0')).join('');
  }

  async function studentCreds(name,classCode,pin){
    const normalized = `${String(classCode).toUpperCase().trim()}|${String(name).toLowerCase().trim().replace(/\s+/g,' ')}`;
    const h = await sha256(normalized);
    return {
      email:`s_${h.slice(0,24)}@students.proveit.local`,
      password:`${pin}Aa!${h.slice(0,4)}`
    };
  }

  function savePending(payload){
    const uid = firebase.auth().currentUser?.uid || null;
    const item = {uid,payload,failedAt:Date.now(),version:VERSION};
    try{ localStorage.setItem(PENDING_KEY,JSON.stringify(item)); }catch(_){}
    return item;
  }

  function readPending(){
    try{
      const item = JSON.parse(localStorage.getItem(PENDING_KEY) || 'null');
      if(!item?.payload) return null;
      const uid = firebase.auth().currentUser?.uid || null;
      if(item.uid && uid && item.uid !== uid) return null;
      return item;
    }catch(_){ return null; }
  }

  function clearPending(){
    try{ localStorage.removeItem(PENDING_KEY); }catch(_){}
  }

  async function alreadySaved(pending){
    if(!fbReady() || !pending?.payload) return false;
    const uid = firebase.auth().currentUser?.uid;
    if(!uid) return false;
    try{
      const snap = await firebase.firestore()
        .collection('attempts')
        .where('studentId','==',uid)
        .get();

      const floor = Number(pending.failedAt || 0) - 120000;
      return snap.docs.some(doc => {
        const a = doc.data() || {};
        const when = Date.parse(a.submittedAt || '') || 0;
        return a.trainingId === pending.payload.trainingId &&
          Number(a.score || 0) === Number(pending.payload.score || 0) &&
          Number(a.total || 0) === Number(pending.payload.total || 0) &&
          Number(a.percentage || 0) === Number(pending.payload.percentage || 0) &&
          (!when || when >= floor);
      });
    }catch(_){ return false; }
  }

  function installStyles(){
    if(document.getElementById('stepupFlowGuardStyle')) return;
    const style = document.createElement('style');
    style.id = 'stepupFlowGuardStyle';
    style.textContent = `
      .stepup-save-guard{
        background:#fff!important;border:1.5px solid #f0c36d!important;
        border-radius:20px!important;padding:20px!important;
        box-shadow:0 10px 30px -20px rgba(45,55,75,.35)!important;
      }
      .stepup-save-guard h2{margin:0 0 8px!important}
      .stepup-save-guard p{margin:0 0 14px!important;line-height:1.65!important}
      .stepup-pending-banner{
        margin:0 0 14px;padding:12px 14px;display:flex;align-items:center;
        justify-content:space-between;gap:12px;border:1.5px solid #f0c36d;
        border-radius:16px;background:#fffaf0;color:#4b3a17;
      }
      .stepup-pending-banner b{display:block;margin-bottom:2px}
      .stepup-pending-banner small{display:block;line-height:1.45}
      @media(max-width:520px){
        .stepup-pending-banner{align-items:stretch;flex-direction:column}
        .stepup-pending-banner .btn{width:100%}
      }`;
    document.head.appendChild(style);
  }

  function showPendingState(){
    const pending = readPending();
    if(!pending) return;

    const result = document.querySelector('.journey-result');
    if(result && !result.classList.contains('stepup-save-guard')){
      result.className = 'journey-result review stepup-save-guard';
      result.innerHTML = `
        <h2>Result not saved yet</h2>
        <p>Your answers are still available on this device. Check your internet connection, then save the result before continuing.</p>
        <div class="journey-result-actions">
          <button class="journey-main-btn" onclick="STEPUP_FLOW_GUARD.retrySave()">Retry Save</button>
        </div>`;
    }

    const view = document.querySelector('.student-view');
    if(view && !document.getElementById('stepupPendingAttemptBanner')){
      const banner = document.createElement('div');
      banner.id = 'stepupPendingAttemptBanner';
      banner.className = 'stepup-pending-banner';
      banner.innerHTML = `
        <div><b>One result is waiting to be saved.</b><small>Save it before starting another activity.</small></div>
        <button class="btn btn-primary" onclick="STEPUP_FLOW_GUARD.retrySave()">Retry Save</button>`;
      view.prepend(banner);
    }
  }

  async function retrySave(){
    const pending = readPending();
    if(!pending?.payload) return;

    document.querySelectorAll('[onclick="STEPUP_FLOW_GUARD.retrySave()"]').forEach(b => {
      b.disabled = true;
      b.textContent = 'Saving…';
    });

    try{
      if(await alreadySaved(pending)){
        clearPending();
      }else{
        if(typeof originalRecordJourneyAttempt !== 'function') throw new Error('Save function unavailable');
        await originalRecordJourneyAttempt(pending.payload);
        clearPending();
      }
      alert('Result saved successfully.');
      if(window.PROVE?.setStudentTab) window.PROVE.setStudentTab('progress');
      else window.location.reload();
    }catch(e){
      console.error('StepUp retry save failed',e);
      alert('The result still could not be saved. Check your connection and try again.');
      document.querySelectorAll('[onclick="STEPUP_FLOW_GUARD.retrySave()"]').forEach(b => {
        b.disabled = false;
        b.textContent = 'Retry Save';
      });
    }
  }

  function patchAttemptSaving(){
    if(!window.PROVE?.recordJourneyAttempt) return;
    if(window.PROVE.recordJourneyAttempt.__flowGuardPatched) return;

    originalRecordJourneyAttempt = window.PROVE.recordJourneyAttempt.bind(window.PROVE);

    const wrapped = async function(payload){
      try{
        const result = await originalRecordJourneyAttempt(payload);
        clearPending();
        return result;
      }catch(e){
        savePending(payload);
        throw e;
      }
    };

    wrapped.__flowGuardPatched = VERSION;
    window.PROVE.recordJourneyAttempt = wrapped;
  }

  function patchStudentLogin(){
    if(!window.PROVE?.studentContinue || !fbReady()) return;
    if(window.PROVE.studentContinue.__flowGuardPatched) return;

    const wrapped = async function(forcedClassCode=''){
      const name = (document.getElementById('stName')?.value || '').trim().replace(/\s+/g,' ');
      const classCode = (forcedClassCode || document.getElementById('stClassCode')?.value || '').trim().toUpperCase();
      const pin = (document.getElementById('stPin')?.value || '').trim();

      if(!name || !classCode || !/^[0-9]{4}$/.test(pin)){
        return alert('Please enter your full name and a 4-digit PIN.');
      }

      const db = firebase.firestore();
      let join;
      try{
        const snap = await db.collection('joinCodes').doc(classCode).get();
        if(!snap.exists) return alert('Class not found. Check the class link or code.');
        join = snap.data();
      }catch(e){
        console.error('StepUp class lookup failed',e);
        return alert('Could not check the class right now. Please try again.');
      }

      const creds = await studentCreds(name,classCode,pin);

      try{
        const cr = await firebase.auth().signInWithEmailAndPassword(creds.email,creds.password);
        const ref = db.collection('users').doc(cr.user.uid);
        const profile = await ref.get();

        if(!profile.exists){
          try{
            await ref.set({
              role:'student',displayName:name,classId:join.classId,classCode,
              teacherId:join.teacherId,school:join.school || '',createdAt:new Date().toISOString()
            });
            window.location.reload();
          }catch(profileError){
            console.error('StepUp profile recovery failed',profileError);
            alert('Signed in, but the student profile could not be restored. Check the connection and try again.');
          }
        }
        return;
      }catch(signInError){
        // New student continues to account creation.
      }

      let createdUser = null;
      try{
        const cr = await firebase.auth().createUserWithEmailAndPassword(creds.email,creds.password);
        createdUser = cr.user;

        await db.collection('users').doc(cr.user.uid).set({
          role:'student',displayName:name,classId:join.classId,classCode,
          teacherId:join.teacherId,school:join.school || '',createdAt:new Date().toISOString()
        });

        window.location.reload();
      }catch(createError){
        if(createError?.code === 'auth/email-already-in-use'){
          return alert('The name is already registered. Check your PIN and try again.');
        }

        if(createdUser){
          try{ await createdUser.delete(); }catch(_){}
        }

        console.error('StepUp student account creation failed',createError);
        alert('Could not create the student profile. Check the connection and try again.');
      }
    };

    wrapped.__flowGuardPatched = VERSION;
    window.PROVE.studentContinue = wrapped;
  }

  function refresh(){
    installStyles();
    patchAttemptSaving();
    patchStudentLogin();
    showPendingState();
  }

  const observer = new MutationObserver(() => {
    clearTimeout(refreshTimer);
    refreshTimer = setTimeout(refresh,100);
  });
  observer.observe(document.documentElement,{childList:true,subtree:true});

  if(fbReady()){
    firebase.auth().onAuthStateChanged(() => setTimeout(refresh,120));
  }

  document.addEventListener('DOMContentLoaded',refresh,{once:true});
  window.addEventListener('load',refresh,{once:true});
  setTimeout(refresh,220);
  setTimeout(refresh,850);

  window.STEPUP_FLOW_GUARD = {version:VERSION,retrySave,refresh};
})();
