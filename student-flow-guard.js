/* StepUp student account guard — simplified
   Keeps student sign-in/profile recovery only.
   Progress saving is handled directly by app.js with no extra wrapper. */
(() => {
  'use strict';

  const VERSION = '20261007-auth-sync-retry';
  let refreshTimer = null;

  const fbReady = () => !!(window.firebase?.auth && window.firebase?.firestore);

  const sleep = ms => new Promise(resolve => setTimeout(resolve,ms));
  const isPermissionDenied = err => String(err?.code || '').includes('permission-denied');

  // Firebase Auth can finish before Firestore has picked up the fresh ID token,
  // especially inside in-app browsers. Retry only permission-denied briefly,
  // forcing a fresh token before the next attempt.
  async function withAuthRetry(user,operation){
    const waits = [0,250,750];
    let lastError = null;
    for(let attempt=0; attempt<waits.length; attempt++){
      if(waits[attempt]) await sleep(waits[attempt]);
      try{
        if(user?.getIdToken) await user.getIdToken(attempt > 0);
        return await operation();
      }catch(error){
        lastError = error;
        if(!isPermissionDenied(error) || attempt === waits.length - 1) throw error;
      }
    }
    throw lastError;
  }

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

  // Sign-in failures that mean "no such account yet" or "wrong PIN".
  const NEW_OR_WRONG = ['auth/invalid-credential','auth/invalid-login-credentials','auth/wrong-password','auth/user-not-found'];

  // A clear message (English + Arabic) for each kind of failure, with its code.
  function explain(err){
    const code = String(err?.code || err?.name || 'unknown');
    const msg = String(err?.message || '');
    let en, ar;
    if(code.includes('resource-exhausted') || /quota/i.test(msg)){
      en = 'StepUp is very busy right now (daily limit reached). Please try again later and tell your teacher.';
      ar = 'المنصة مزدحمة حاليًا (بلغت الحد اليومي). حاولي لاحقًا وأخبري معلمتك.';
    }else if(code.includes('too-many-requests')){
      en = 'Too many sign-in attempts from this network. Wait 2–3 minutes, then try again.';
      ar = 'محاولات دخول كثيرة من هذه الشبكة. انتظري دقيقتين أو ثلاثًا ثم حاولي مرة أخرى.';
    }else if(code.includes('network-request-failed') || code.includes('unavailable') || code.includes('deadline-exceeded')){
      en = 'No internet connection. Check the Wi-Fi or mobile data and try again.';
      ar = 'لا يوجد اتصال بالإنترنت. تأكدي من الشبكة وحاولي مرة أخرى.';
    }else if(code.includes('permission-denied')){
      en = 'Access to this class was refused. Ask your teacher to check the class.';
      ar = 'تم رفض الوصول إلى هذا الفصل. اطلبي من معلمتك التحقق من الفصل.';
    }else if(code.includes('user-disabled')){
      en = 'This account has been disabled. Ask your teacher.';
      ar = 'تم إيقاف هذا الحساب. راجعي معلمتك.';
    }else{
      en = 'Could not sign in right now. Please try again.';
      ar = 'تعذّر الدخول حاليًا. حاولي مرة أخرى.';
    }
    return en + '\n' + ar + '\n(' + code + ')';
  }

  function clearOldSaveGuards(){
    // Remove stale local keys/UI created by the temporary save-protection experiments.
    try{ localStorage.removeItem('stepup_pending_journey_attempt_v1'); }catch(_){}
    try{ localStorage.removeItem('stepup_pending_attempts_v1'); }catch(_){}
    document.getElementById('stepupPendingAttemptBanner')?.remove();
    document.getElementById('stepupProgressSaveToast')?.remove();
    document.getElementById('stepupAutoSaveToast')?.remove();
  }

  function patchStudentLogin(){
    if(!window.PROVE?.studentContinue || !fbReady()) return;
    if(window.PROVE.studentContinue.__accountGuardPatched) return;

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
        if(!snap.exists) return alert('Class not found. Check the class link or code.\nلم يُعثر على الفصل. تأكدي من رابط الفصل أو رمزه.');
        join = snap.data();
      }catch(e){
        console.error('StepUp class lookup failed',e);
        return alert(explain(e));
      }

      const creds = await studentCreds(name,classCode,pin);

      // 1) Sign in. Only "unknown account / wrong password" continues to sign-up;
      //    every other failure (busy network, limits, quota) gets its own message
      //    instead of the misleading "check your PIN".
      let cr = null;
      try{
        cr = await firebase.auth().signInWithEmailAndPassword(creds.email,creds.password);
      }catch(signInError){
        const code = signInError?.code || '';
        if(!NEW_OR_WRONG.includes(code)){
          console.error('StepUp sign-in failed',signInError);
          return alert(explain(signInError));
        }
      }

      if(cr){
        try{
          const ref = db.collection('users').doc(cr.user.uid);
          const profile = await withAuthRetry(cr.user,() => ref.get());
          if(!profile.exists){
            await withAuthRetry(cr.user,() => ref.set({
              role:'student',displayName:name,classId:join.classId,classCode,
              teacherId:join.teacherId,school:join.school || '',createdAt:new Date().toISOString()
            }));
          }

          // Reload once after a confirmed profile read/write so app.js starts
          // from a settled authenticated session instead of racing Firestore.
          try{ await cr.user.getIdToken(true); }catch(_){}
          window.location.reload();
        }catch(profileError){
          console.error('StepUp profile load failed',profileError);
          alert(explain(profileError));
        }
        return;
      }

      // 2) First visit: create the account.
      let createdUser = null;
      try{
        const created = await firebase.auth().createUserWithEmailAndPassword(creds.email,creds.password);
        createdUser = created.user;
        const createdRef = db.collection('users').doc(created.user.uid);
        await withAuthRetry(created.user,() => createdRef.set({
          role:'student',displayName:name,classId:join.classId,classCode,
          teacherId:join.teacherId,school:join.school || '',createdAt:new Date().toISOString()
        }));
        try{ await created.user.getIdToken(true); }catch(_){}
        window.location.reload();
      }catch(createError){
        if(createError?.code === 'auth/email-already-in-use'){
          return alert('This name is already registered with a different PIN. Check your PIN and try again.\nهذا الاسم مسجّل برمز مختلف. تأكدي من الرمز وحاولي مرة أخرى.');
        }
        if(createdUser){
          try{ await createdUser.delete(); }catch(_){}
        }
        console.error('StepUp student account creation failed',createError);
        alert(explain(createError));
      }
    };

    wrapped.__accountGuardPatched = VERSION;
    window.PROVE.studentContinue = wrapped;
  }

  function refresh(){
    clearOldSaveGuards();
    patchStudentLogin();
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

  window.STEPUP_ACCOUNT_GUARD = {version:VERSION,refresh};
})();
