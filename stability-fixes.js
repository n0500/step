(() => {
  'use strict';

  const VERSION = '20261009-stability-idle';
  let uiTimer = null;
  let motivationBusy = false;
  let motivationCache = { uid: null, at: 0, attempts: [] };
  let disabledAlertShown = false;

  const esc = (s='') => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const ownerEmail = () => String(window.PROVEIT_CONFIG?.ownerEmail || '').toLowerCase();
  const fbReady = () => !!(window.firebase?.auth && window.firebase?.firestore);

  async function sha256(txt){
    const data = new TextEncoder().encode(txt);
    const hash = await crypto.subtle.digest('SHA-256', data);
    return [...new Uint8Array(hash)].map(b => b.toString(16).padStart(2,'0')).join('');
  }

  async function studentCreds(name,classCode,pin){
    const normalized = `${String(classCode).toUpperCase().trim()}|${String(name).toLowerCase().trim().replace(/\s+/g,' ')}`;
    const h = await sha256(normalized);
    return { email:`s_${h.slice(0,24)}@students.proveit.local`, password:`${pin}Aa!${h.slice(0,4)}` };
  }

  function stableJourneyAttempts(attempts){
    const keep = [];
    const best = new Map();
    for(const a of (attempts || [])){
      const id = String(a?.trainingId || '');
      // Full-review mastery credits answers across every saved Unit 1 attempt.
      // Older adaptive runs can contain different question IDs, even at lower scores.
      if(!id.startsWith('journey-') || id.startsWith('journey-u1-')){
        keep.push(a);
        continue;
      }
      const prev = best.get(id);
      const p = Number(a?.percentage || 0);
      const prevP = Number(prev?.percentage || -1);
      const newer = String(a?.submittedAt || '') > String(prev?.submittedAt || '');
      if(!prev || p > prevP || (p === prevP && newer)) best.set(id,a);
    }
    return [...keep, ...best.values()];
  }

  function patchJourney(){
    const j = window.STEPUP_JOURNEY;
    if(!j || j.__stabilityPatched) return;
    ['homeHTML','html','progressHTML'].forEach(name => {
      if(typeof j[name] !== 'function') return;
      const original = j[name].bind(j);
      j[name] = (attempts,...rest) => original(stableJourneyAttempts(attempts),...rest);
    });
    j.__stabilityPatched = VERSION;
  }

  function patchTeacherRegistration(){
    if(!window.PROVE || window.PROVE.__teacherRegistrationPatched) return;
    window.PROVE.teacherRegister = () => {
      alert('Teacher self-registration is disabled. Teacher access is managed by the StepUp owner.');
    };
    window.PROVE.__teacherRegistrationPatched = VERSION;
  }

  function patchStudentAccess(){
    if(!window.PROVE || window.PROVE.__studentAccessPatched) return;

    const originalContinue = window.PROVE.studentContinue;
    window.PROVE.studentContinue = async function(forcedClassCode=''){
      if(!fbReady()) return originalContinue(forcedClassCode);

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

      const c = await studentCreds(name,classCode,pin);
      try{
        const cr = await firebase.auth().signInWithEmailAndPassword(c.email,c.password);
        const userRef = db.collection('users').doc(cr.user.uid);
        const profile = await userRef.get();
        if(!profile.exists){
          await userRef.set({
            role:'student', displayName:name, classId:join.classId, classCode,
            teacherId:join.teacherId, school:join.school || '', createdAt:new Date().toISOString()
          });
          window.location.reload();
        }
        return;
      }catch(loginError){
        // First visit with a valid 4-digit PIN continues to profile creation.
      }

      try{
        const cr = await firebase.auth().createUserWithEmailAndPassword(c.email,c.password);
        await db.collection('users').doc(cr.user.uid).set({
          role:'student', displayName:name, classId:join.classId, classCode,
          teacherId:join.teacherId, school:join.school || '', createdAt:new Date().toISOString()
        });
        window.location.reload();
      }catch(createError){
        if(createError?.code === 'auth/email-already-in-use'){
          return alert('The name is already registered. Check your PIN and try again.');
        }
        console.error('StepUp student profile creation failed',createError);
        alert('Could not continue. Please try again.');
      }
    };

    window.PROVE.editStudentName = async function(){
      if(!fbReady()) return alert('Name editing is unavailable right now.');
      const user = firebase.auth().currentUser;
      if(!user) return alert('You are not signed in.');
      const db = firebase.firestore();
      const ref = db.collection('users').doc(user.uid);
      const snap = await ref.get();
      if(!snap.exists) return alert('Student profile not found.');
      const profile = snap.data();
      const current = String(profile.displayName || '').trim();
      const next = (prompt('Enter the student name:',current) || '').trim().replace(/\s+/g,' ');
      if(!next || next === current) return;
      if(next.length < 2 || next.length > 80) return alert('Please enter a valid name.');
      const pin = (prompt('Enter your current PIN to confirm the name change:') || '').trim();
      if(!/^[0-9]{4}$/.test(pin)) return alert('Enter your current 4-digit PIN.');
      try{
        const oldCreds = await studentCreds(current,profile.classCode,pin);
        const newCreds = await studentCreds(next,profile.classCode,pin);
        const credential = firebase.auth.EmailAuthProvider.credential(oldCreds.email,oldCreds.password);
        await user.reauthenticateWithCredential(credential);
        if(user.email !== newCreds.email) await user.updateEmail(newCreds.email);
        await user.updatePassword(newCreds.password);
        await ref.update({displayName:next});
        alert('Name updated. Use the new name with the same PIN next time.');
        window.location.reload();
      }catch(e){
        console.error('StepUp name update failed',e);
        alert(e?.code === 'auth/email-already-in-use' ? 'That name is already in use in this class.' : 'Could not update the name. Check your PIN and try again.');
      }
    };

    window.PROVE.__studentAccessPatched = VERSION;
  }

  function improveAuthUI(){
    document.querySelectorAll('button[onclick*="teacherRegister"]').forEach(btn => {
      btn.disabled = true;
      btn.textContent = 'Teacher access by owner';
      btn.removeAttribute('onclick');
      btn.title = 'Teacher accounts are managed by the StepUp owner.';
    });

    const pin = document.getElementById('stPin');
    if(pin){
      pin.maxLength = 4;
      const field = pin.closest('.field');
      const label = field?.querySelector('label');
      if(label && label.textContent !== 'PIN (4 digits)') label.textContent = 'PIN (4 digits)';
      if(field && !field.querySelector('.stepup-pin-note')){
        const note = document.createElement('small');
        note.className = 'muted stepup-pin-note';
        note.textContent = 'Use a 4-digit PIN.';
        field.appendChild(note);
      }
    }
  }

  async function enforceTeacherStatus(user){
    if(!user || !fbReady()) return;
    try{
      const snap = await firebase.firestore().collection('users').doc(user.uid).get();
      if(!snap.exists) return;
      const p = snap.data();
      if(p.role === 'teacher' && p.status === 'disabled'){
        await firebase.auth().signOut();
        if(!disabledAlertShown){
          disabledAlertShown = true;
          alert('This teacher account is disabled. Contact the StepUp owner.');
        }
      }
    }catch(e){
      console.warn('StepUp teacher status check unavailable',e);
    }
  }

  async function renderOwnerAccess(){
    if(!fbReady()) return;
    const user = firebase.auth().currentUser;
    if(!user || String(user.email || '').toLowerCase() !== ownerEmail()) return;
    if(document.getElementById('stepupOwnerAccess')) return;
    const container = document.querySelector('main.container');
    if(!container || !/Platform Overview/.test(container.textContent || '')) return;

    const section = document.createElement('section');
    section.id = 'stepupOwnerAccess';
    section.className = 'card';
    section.innerHTML = '<h2>Teacher Access</h2><p class="muted">Loading teacher accounts…</p>';
    const tables = container.querySelectorAll('.card');
    (tables[0] || container.lastElementChild)?.insertAdjacentElement('afterend',section);

    try{
      const snap = await firebase.firestore().collection('users').where('role','==','teacher').get();
      const teachers = snap.docs.map(d => ({id:d.id,...d.data()}));
      if(!teachers.length){
        section.innerHTML = '<h2>Teacher Access</h2><p class="muted">No teacher accounts yet.</p>';
        return;
      }
      section.innerHTML = `<h2>Teacher Access</h2><p class="muted">Only the owner can activate or disable teacher access.</p><div class="table-wrap"><table><thead><tr><th>Teacher</th><th>School</th><th>Status</th><th>Access</th></tr></thead><tbody>${teachers.map(t => {
        const status = t.status === 'disabled' ? 'disabled' : 'active';
        const next = status === 'disabled' ? 'active' : 'disabled';
        return `<tr><td>${esc(t.displayName || 'Teacher')}</td><td>${esc(t.school || '')}</td><td>${status}</td><td><button class="btn btn-secondary stepup-teacher-status" data-id="${esc(t.id)}" data-next="${next}">${status === 'disabled' ? 'Activate' : 'Disable'}</button></td></tr>`;
      }).join('')}</tbody></table></div>`;
      section.querySelectorAll('.stepup-teacher-status').forEach(btn => btn.addEventListener('click', async () => {
        btn.disabled = true;
        try{
          await firebase.firestore().collection('users').doc(btn.dataset.id).update({status:btn.dataset.next});
          section.remove();
          await renderOwnerAccess();
        }catch(e){
          console.error('StepUp teacher access update failed',e);
          alert('Could not update teacher access. Make sure the new Firestore rules are published.');
          btn.disabled = false;
        }
      }));
    }catch(e){
      console.warn('StepUp owner access panel unavailable',e);
      section.remove();
    }
  }

  function pointsForAttempt(a){
    const p = Math.max(0,Math.min(100,Number(a?.percentage || 0)));
    return 25 + (p >= 95 ? 35 : p >= 80 ? 25 : p >= 60 ? 15 : 8);
  }

  function uniqueBestStats(attempts){
    const best = new Map();
    for(const a of attempts){
      const key = a?.trainingId || a?.id;
      if(!key) continue;
      const prev = best.get(key);
      if(!prev || Number(a.percentage || 0) > Number(prev.percentage || 0)) best.set(key,a);
    }
    const xp = [...best.values()].reduce((s,a) => s + pointsForAttempt(a),0);
    const levels = [
      {min:0,name:'Explorer'},{min:300,name:'Momentum'},{min:700,name:'Achiever'},
      {min:1200,name:'Trailblazer'},{min:1800,name:'Champion'},{min:2600,name:'Master'}
    ];
    let idx = 0;
    for(let i=0;i<levels.length;i++) if(xp >= levels[i].min) idx = i;
    const cur = levels[idx], next = levels[idx+1] || null;
    const progress = next ? Math.max(4,Math.min(100,Math.round((xp-cur.min)/(next.min-cur.min)*100))) : 100;
    return {xp,levelNum:idx+1,name:cur.name,nextName:next?.name || 'Master',remaining:next?Math.max(0,next.min-xp):0,progress};
  }

  async function getAttemptsFresh(){
    if(!fbReady()) return [];
    const uid = firebase.auth().currentUser?.uid;
    if(!uid) return [];
    const now = Date.now();
    const home = document.querySelector('.student-home-clean');
    if(motivationCache.uid === uid && motivationCache.home === home && now - motivationCache.at < 120000) return motivationCache.attempts;
    const snap = await firebase.firestore().collection('attempts').where('studentId','==',uid).get();
    const attempts = snap.docs.map(d => ({id:d.id,...d.data()})).filter(a => a.recordKind !== 'question');
    motivationCache = {uid,at:now,attempts,home};
    return attempts;
  }

  async function fixMotivation(){
    const panel = document.getElementById('stepupMotivation');
    if(!panel || motivationBusy || !fbReady()) return;
    motivationBusy = true;
    try{
      const attempts = await getAttemptsFresh();
      const stats = uniqueBestStats(attempts);
      const levelNo = panel.querySelector('.motivation-level-no');
      const levelName = panel.querySelector('.motivation-level b');
      const xpText = panel.querySelector('.motivation-level small');
      const nextStrong = panel.querySelector('.motivation-xp-line strong');
      const track = panel.querySelector('.motivation-xp-track i');
      // Write only when the text really changes: rewriting it on every run
      // re-triggered every page observer in a constant loop.
      const put = (el,v) => { if(el && el.textContent !== v) el.textContent = v; };
      put(levelNo, `Level ${stats.levelNum}`);
      put(levelName, stats.name);
      put(xpText, `${stats.xp} XP`);
      put(nextStrong, stats.remaining ? `${stats.remaining} XP to ${stats.nextName}` : 'Keep your momentum');
      if(track && track.style.width !== `${stats.progress}%`) track.style.width = `${stats.progress}%`;

      const toast = document.querySelector('.motivation-toast small');
      if(toast && attempts.length){
        const sorted = [...attempts].sort((a,b) => String(b.submittedAt || b.createdAt || '').localeCompare(String(a.submittedAt || a.createdAt || '')));
        const latest = sorted[0];
        const prior = sorted.slice(1).filter(a => a.trainingId === latest.trainingId);
        const previousBest = prior.reduce((m,a) => Math.max(m,Number(a.percentage || 0)),-1);
        put(toast, Number(latest.percentage || 0) > previousBest ? `+${pointsForAttempt(latest)} XP • new best` : 'Practice saved • keep going');
      }
    }catch(e){
      console.warn('StepUp XP correction unavailable',e);
    }finally{
      motivationBusy = false;
    }
  }

  function refreshUI(){
    patchJourney();
    patchTeacherRegistration();
    patchStudentAccess();
    improveAuthUI();
    renderOwnerAccess();
    fixMotivation();
  }

  const observer = new MutationObserver(() => {
    clearTimeout(uiTimer);
    uiTimer = setTimeout(refreshUI,120);
  });
  observer.observe(document.documentElement,{childList:true,subtree:true});

  if(fbReady()){
    firebase.auth().onAuthStateChanged(user => {
      disabledAlertShown = false;
      enforceTeacherStatus(user);
      motivationCache = {uid:null,at:0,attempts:[]};
      setTimeout(refreshUI,180);
    });
  }

  document.addEventListener('DOMContentLoaded',refreshUI,{once:true});
  window.addEventListener('load',refreshUI,{once:true});
  setTimeout(refreshUI,250);
  setTimeout(refreshUI,900);
  window.STEPUP_STABILITY_FIXES = {version:VERSION,stableJourneyAttempts,refresh:refreshUI};
})();

