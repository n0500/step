/* StepUp student account guard — simplified
   Keeps student sign-in/profile recovery only.
   Progress saving is handled directly by app.js with no extra wrapper. */
(() => {
  'use strict';

  const VERSION = '20260929-account-guard-lite';
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
            alert('Signed in, but the student profile could not be restored. Please try again.');
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
        alert('Could not create the student profile. Please try again.');
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
