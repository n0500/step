// StepUp UI + guided learning build 2026-09-12
(() => {
  const cfg = window.PROVEIT_CONFIG;
  const DATA = window.PROVEIT_DATA;
  const app = document.getElementById("app");
  const state = {
    fb: null, user: null, profile: null, route: "home",
    activeTraining: null, exam: null, classes: [], attempts: [],
    selectedClassId: null, selectedStudentId: null,
    studentTab: "home", teacherTab: "home", classMode: null
  };

  const esc = (s="") => String(s).replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]));
  const uid = () => "loc_" + Math.random().toString(36).slice(2,10);
  const nowISO = () => new Date().toISOString();
  const fmtTime = sec => `${Math.floor(sec/60)}:${String(sec%60).padStart(2,"0")}`;
  const slug = s => String(s).toLowerCase().trim().replace(/\s+/g," ").replace(/[^\p{L}\p{N}]+/gu,"-").replace(/^-|-$/g,"");
  async function sha256(txt){
    const data = new TextEncoder().encode(txt);
    const hash = await crypto.subtle.digest("SHA-256",data);
    return [...new Uint8Array(hash)].map(b=>b.toString(16).padStart(2,"0")).join("");
  }

  function initFirebase(){
    try{
      if(!cfg.firebase.enabled) return null;
      if(!firebase.apps.length) firebase.initializeApp(cfg.firebase);
      return {auth: firebase.auth(), db: firebase.firestore()};
    }catch(e){ console.warn(e); return null; }
  }
  state.fb = initFirebase();

  const local = {
    get(k, fallback){ try{return JSON.parse(localStorage.getItem("proveit_"+k)) ?? fallback}catch{return fallback} },
    set(k,v){localStorage.setItem("proveit_"+k,JSON.stringify(v))},
    users(){return this.get("users",[])},
    classes(){return this.get("classes",[])},
    attempts(){return this.get("attempts",[])},
    saveUser(u){let a=this.users().filter(x=>x.id!==u.id);a.push(u);this.set("users",a)},
    saveClass(c){let a=this.classes().filter(x=>x.id!==c.id);a.push(c);this.set("classes",a)},
    saveAttempt(at){let a=this.attempts();a.push(at);this.set("attempts",a)}
  };

  function classCodeFromUrl(){
    const code=new URLSearchParams(window.location.search).get("class");
    return code ? code.trim().toUpperCase() : "";
  }

  async function boot(){
    if(state.fb){
      state.fb.auth.onAuthStateChanged(async user=>{
        state.user=user||null;
        if(user){
          await loadProfile();
          await renderDashboard();
        }else{
          state.profile=null;
          const classCode=classCodeFromUrl();
          if(classCode) await renderClassJoin(classCode);
          else renderLanding();
        }
      });
    } else {
      const sess = local.get("session",null);
      if(sess){
        state.user={uid:sess.uid,email:sess.email||null};
        state.profile=local.users().find(x=>x.id===sess.uid)||null;
        if(state.profile) return renderDashboard();
      }
      const classCode=classCodeFromUrl();
      if(classCode) await renderClassJoin(classCode);
      else renderLanding();
    }
  }

  async function loadProfile(){
    if(!state.fb || !state.user) return;
    const snap = await state.fb.db.collection("users").doc(state.user.uid).get();
    state.profile = snap.exists ? {id:snap.id,...snap.data()} : null;
  }

  function shell(content, title=""){
    const isStudent=state.profile?.role==="student";
    const initial=esc((state.profile?.displayName||"S").trim().charAt(0).toUpperCase()||"S");
    return `
      <header class="appbar ${isStudent?"student-appbar":""}">
        <div class="brand"><div class="logo">SU</div><div><strong>StepUp</strong><small>STEP Training Lab${title?` • ${esc(title)}`:""}</small></div></div>
        <div class="nav-actions">
          ${state.profile?(isStudent
            ?`<button class="student-header-avatar" aria-label="Open profile" onclick="PROVE.setStudentTab('profile')">${initial}</button>`
            :`<span>${esc(state.profile.displayName||state.profile.name||state.profile.role)}</span><button class="btn btn-outline" onclick="PROVE.logout()">Logout</button>`):""}
        </div>
      </header>
      ${content}`;
  }

  function renderLanding(){
    app.innerHTML = `
      <div class="auth-shell">
        <div class="card hero">
          <div class="hero-badge">✨ StepUp</div>
          <div class="eyebrow" style="margin-top:12px">Mega Goal 1 • STEP-style Training</div>
          <h1>StepUp</h1>
          <p class="hero-subtitle">STEP Training Lab</p>
          <p class="muted">A modern training space for STEP reading and grammar practice, progress tracking, and teacher reports.</p>
          ${!state.fb?`<div class="notice">Demo mode is active. Connect Firebase before sharing with students.</div>`:""}
          <h3>Choose your role</h3>
          <div class="auth-role">
            <div class="role-card active" data-role="student" onclick="PROVE.pickRole('student')"><strong>Student</strong><small>طالبة</small></div>
            <div class="role-card" data-role="teacher" onclick="PROVE.pickRole('teacher')"><strong>Teacher</strong><small>معلمة</small></div>
            <div class="role-card" data-role="owner" onclick="PROVE.pickRole('owner')"><strong>Owner</strong><small>المالكة</small></div>
          </div>
          <div id="authBox"></div>
        </div>
      </div>`;
    pickRole("student");
  }

  function pickRole(role){
    document.querySelectorAll(".role-card").forEach(x=>x.classList.toggle("active",x.dataset.role===role));
    const box=document.getElementById("authBox");
    if(role==="student"){
      box.innerHTML=`
        <div style="margin-top:18px">
          <div class="form-grid">
            <div class="field"><label>Full name / الاسم الكامل</label><input id="stName" autocomplete="name"></div>
            <div class="field"><label>Class code / كود الفصل</label><input id="stClassCode" autocapitalize="characters"></div>
            <div class="field"><label>PIN (4 digits)</label><input id="stPin" type="password" inputmode="numeric" maxlength="4" autocomplete="current-password"></div>
          </div>
          <div class="quick-entry-note">First time? Your profile will be created automatically. Returning student? The same button signs you in.</div>
          <button class="btn btn-primary" style="margin-top:12px" onclick="PROVE.studentContinue()">Continue</button>
        </div>`;
    } else {
      box.innerHTML=`
        <div class="form-grid" style="margin-top:18px">
          <div class="field"><label>Email</label><input id="authEmail" type="email"></div>
          <div class="field"><label>Password</label><input id="authPassword" type="password"></div>
        </div>
        <div style="display:flex;gap:8px;margin-top:12px">
          <button class="btn btn-primary" onclick="PROVE.emailLogin('${role}')">Sign in</button>
          ${role==="teacher"?`<button class="btn btn-secondary" onclick="PROVE.teacherRegister()">Create teacher account</button>`:""}
        </div>
        <p class="muted" style="font-size:12px">${role==="owner"?"Owner account must match the owner email configured in Firebase.":"Teacher registration creates a teacher profile."}</p>`;
    }
  }

  async function renderClassJoin(classCode){
    const classObj=await findClassByCode(classCode);
    if(!classObj){
      history.replaceState({}, "", window.location.pathname);
      renderLanding();
      setTimeout(()=>alert("This class link is not valid."),50);
      return;
    }
    app.innerHTML=`
      <div class="auth-shell">
        <div class="card student-entry-card">
          <div class="student-entry-head">
            <div class="hero-badge">StepUp</div>
            <div class="eyebrow" style="margin-top:12px">Student Access</div>
            <h1>Welcome 👋</h1>
            <p class="hero-subtitle">STEP Training Lab</p>
            <div class="class-badge">📘 ${esc(classObj.name||"Your Class")}</div>
            ${classObj.school?`<p class="muted">${esc(classObj.school)}</p>`:""}
          </div>
          <div class="form-grid">
            <div class="field"><label>Full name / الاسم الكامل</label><input id="stName" autocomplete="name"></div>
            <div class="field"><label>PIN (4 digits)</label><input id="stPin" type="password" inputmode="numeric" maxlength="4" autocomplete="current-password"></div>
          </div>
          <div class="quick-entry-note">Use the same name and PIN every time. If this is your first visit, your profile is created automatically.</div>
          <button class="btn btn-primary" style="width:100%;margin-top:14px" onclick="PROVE.studentContinue('${esc(classCode)}')">Continue</button>
        </div>
      </div>`;
  }

  function goMainLogin(){
    history.replaceState({}, "", window.location.pathname);
    renderLanding();
  }

  async function studentCreds(name,classCode,pin){
    const normalized = `${classCode.toUpperCase().trim()}|${name.toLowerCase().trim().replace(/\s+/g," ")}`;
    const h = await sha256(normalized);
    return { email:`s_${h.slice(0,24)}@students.proveit.local`, password:`${pin}Aa!${h.slice(0,4)}` };
  }

  async function studentContinue(forcedClassCode=""){
    const name=(document.getElementById("stName")?.value||"").trim();
    const classCode=(forcedClassCode || document.getElementById("stClassCode")?.value || "").trim().toUpperCase();
    const pin=(document.getElementById("stPin")?.value||"").trim();

    if(!name || !classCode || !/^\d{4}$/.test(pin)){
      return alert("Please enter your full name and a 4-digit PIN.");
    }

    const classObj=await findClassByCode(classCode);
    if(!classObj)return alert("Class not found. Check the class link or code.");

    const c=await studentCreds(name,classCode,pin);

    if(state.fb){
      try{
        // Returning student: sign in.
        const cr=await state.fb.auth.signInWithEmailAndPassword(c.email,c.password);

        // If a teacher previously deleted this student from StepUp, the
        // Firebase Authentication account may still exist. Recreate only the
        // StepUp profile document so the same name + PIN can be used again.
        const userRef=state.fb.db.collection("users").doc(cr.user.uid);
        const existingProfile=await userRef.get();
        if(!existingProfile.exists){
          const prof={
            role:"student",displayName:name,classId:classObj.id,classCode,
            teacherId:classObj.teacherId,school:classObj.school||"",createdAt:nowISO()
          };
          await userRef.set(prof);
          state.profile={id:cr.user.uid,...prof};
          state.studentTab="home";
          await renderDashboard();
        }
        return;
      }catch(loginError){
        // First visit: create profile automatically.
        try{
          const cr=await state.fb.auth.createUserWithEmailAndPassword(c.email,c.password);
          const prof={
            role:"student",displayName:name,classId:classObj.id,classCode,
            teacherId:classObj.teacherId,school:classObj.school||"",createdAt:nowISO()
          };
          await state.fb.db.collection("users").doc(cr.user.uid).set(prof);
          state.profile={id:cr.user.uid,...prof};
          state.studentTab="home";
          await renderDashboard();
          return;
        }catch(createError){
          if(createError.code==="auth/email-already-in-use"){
            return alert("The name is already registered. Check your PIN and try again.");
          }
          return alert("Could not continue: "+createError.message);
        }
      }
    }else{
      const existing=local.users().find(x=>x.loginEmail===c.email);
      if(existing){
        if(existing.loginPassword!==c.password)return alert("Incorrect PIN.");
        local.set("session",{uid:existing.id,email:c.email});
        state.user={uid:existing.id,email:c.email};state.profile=existing;state.studentTab="home";
        return renderDashboard();
      }
      const id=uid(),prof={
        id,role:"student",displayName:name,classId:classObj.id,classCode,
        teacherId:classObj.teacherId,school:classObj.school||"",
        loginEmail:c.email,loginPassword:c.password,createdAt:nowISO()
      };
      local.saveUser(prof);local.set("session",{uid:id,email:c.email});
      state.user={uid:id,email:c.email};state.profile=prof;state.studentTab="home";
      return renderDashboard();
    }
  }

  async function studentRegister(){
    const name=document.getElementById("stName").value.trim(), classCode=document.getElementById("stClassCode").value.trim().toUpperCase(), pin=document.getElementById("stPin").value.trim();
    if(!name || !classCode || !/^\d{4}$/.test(pin)) return alert("Enter full name, class code, and a 4-digit PIN.");
    const classObj = await findClassByCode(classCode);
    if(!classObj) return alert("Class code not found.");
    const c=await studentCreds(name,classCode,pin);
    if(state.fb){
      try{
        const cr=await state.fb.auth.createUserWithEmailAndPassword(c.email,c.password);
        const prof={role:"student",displayName:name,classId:classObj.id,classCode,teacherId:classObj.teacherId,school:classObj.school||"",createdAt:nowISO()};
        await state.fb.db.collection("users").doc(cr.user.uid).set(prof);
        state.profile={id:cr.user.uid,...prof};
        await renderDashboard();
      }catch(e){alert("Could not create profile: "+e.message)}
    } else {
      const existing=local.users().find(x=>x.loginEmail===c.email);
      if(existing) return alert("This profile already exists. Use Login.");
      const id=uid(), prof={id,role:"student",displayName:name,classId:classObj.id,classCode,teacherId:classObj.teacherId,school:classObj.school||"",loginEmail:c.email,loginPassword:c.password,createdAt:nowISO()};
      local.saveUser(prof);local.set("session",{uid:id,email:c.email});state.user={uid:id,email:c.email};state.profile=prof;renderDashboard();
    }
  }

  async function studentLogin(){
    const name=document.getElementById("stName").value.trim(), classCode=document.getElementById("stClassCode").value.trim().toUpperCase(), pin=document.getElementById("stPin").value.trim();
    if(!name || !classCode || !/^\d{4}$/.test(pin)) return alert("Enter full name, class code, and a 4-digit PIN.");
    const c=await studentCreds(name,classCode,pin);
    if(state.fb){
      try{await state.fb.auth.signInWithEmailAndPassword(c.email,c.password)}catch(e){alert("Login failed. Check name, class code and PIN.")}
    }else{
      const u=local.users().find(x=>x.loginEmail===c.email && x.loginPassword===c.password);
      if(!u)return alert("Profile not found.");
      local.set("session",{uid:u.id,email:c.email});state.user={uid:u.id,email:c.email};state.profile=u;renderDashboard();
    }
  }

  async function teacherRegister(){
    const email=document.getElementById("authEmail").value.trim(), password=document.getElementById("authPassword").value;
    const name=prompt("Teacher name / اسم المعلمة:"); if(!name)return;
    const school=prompt("School / المدرسة:")||"";
    if(state.fb){
      try{
        const cr=await state.fb.auth.createUserWithEmailAndPassword(email,password);
        const prof={role:"teacher",displayName:name,school,createdAt:nowISO(),status:"active"};
        await state.fb.db.collection("users").doc(cr.user.uid).set(prof);
      }catch(e){alert("Registration failed: "+e.message)}
    } else {
      if(local.users().some(x=>x.loginEmail===email)) return alert("Email already exists.");
      const id=uid(),prof={id,role:"teacher",displayName:name,school,loginEmail:email,loginPassword:password,createdAt:nowISO(),status:"active"};
      local.saveUser(prof);local.set("session",{uid:id,email});state.user={uid:id,email};state.profile=prof;renderDashboard();
    }
  }

  async function emailLogin(role){
    const email=document.getElementById("authEmail").value.trim(), password=document.getElementById("authPassword").value;
    if(state.fb){
      try{
        const cr=await state.fb.auth.signInWithEmailAndPassword(email,password);
        const snap=await state.fb.db.collection("users").doc(cr.user.uid).get();
        let prof=snap.exists?{id:snap.id,...snap.data()}:null;
        if(role==="owner" && email.toLowerCase()===cfg.ownerEmail.toLowerCase() && !prof){
          const p={role:"owner",displayName:"Owner",createdAt:nowISO()};await state.fb.db.collection("users").doc(cr.user.uid).set(p);prof={id:cr.user.uid,...p};
        }
        if(!prof || prof.role!==role){await state.fb.auth.signOut();return alert("This account is not registered for this role.");}
        state.profile=prof;renderDashboard();
      }catch(e){alert("Sign in failed: "+e.message)}
    } else {
      let u=local.users().find(x=>x.loginEmail===email && x.loginPassword===password && x.role===role);
      if(!u && role==="owner" && email.toLowerCase()===cfg.ownerEmail.toLowerCase()){
        const id=uid();u={id,role:"owner",displayName:"Owner",loginEmail:email,loginPassword:password,createdAt:nowISO()};local.saveUser(u);
      }
      if(!u)return alert("Account not found in demo mode.");
      local.set("session",{uid:u.id,email});state.user={uid:u.id,email};state.profile=u;renderDashboard();
    }
  }

  async function logout(){
    if(state.fb) await state.fb.auth.signOut();
    else {localStorage.removeItem("proveit_session");state.user=null;state.profile=null;renderLanding();}
  }

  async function findClassByCode(code){
    if(state.fb){
      const d=await state.fb.db.collection("joinCodes").doc(code).get();
      if(!d.exists)return null;
      const j=d.data();
      return {id:j.classId,code,name:j.className||"",teacherId:j.teacherId,school:j.school||"",openUnits:j.openUnits||["u1"]};
    }
    return local.classes().find(x=>x.code===code)||null;
  }


  function navIcon(id){
    const icons={
      home:`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 10.7 12 3l9 7.7v9.1a1.2 1.2 0 0 1-1.2 1.2H15v-6H9v6H4.2A1.2 1.2 0 0 1 3 19.8z"/></svg>`,
      practice:`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 4.5A2.5 2.5 0 0 1 7.5 2H20v17H7.5A2.5 2.5 0 0 0 5 21.5z"/><path d="M5 4.5v17M9 6h7M9 10h7M9 14h5"/></svg>`,
      tools:`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 3 1.4 4.1L17.5 8.5l-4.1 1.4L12 14l-1.4-4.1-4.1-1.4 4.1-1.4z"/><path d="m18.5 13 .9 2.6 2.6.9-2.6.9-.9 2.6-.9-2.6-2.6-.9 2.6-.9z"/></svg>`,
      progress:`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 19V9M10 19V5M16 19v-7M22 19H2"/></svg>`,
      profile:`<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="4"/><path d="M4.5 21a7.5 7.5 0 0 1 15 0"/></svg>`
    };
    return icons[id]||"";
  }

  function studentTabs(){
    const items=[
      ["home","Home"],
      ["practice","Practice"],
      ["tools","Tools"],
      ["progress","Progress"],
      ["profile","Profile"]
    ];
    return `<nav class="role-tabs student-nav" data-role="student" aria-label="Student navigation">${items.map(([id,label])=>`<button class="role-tab ${state.studentTab===id?"active":""}" data-student-tab="${id}" onclick="PROVE.setStudentTab('${id}')"><span class="student-nav-icon">${navIcon(id)}</span><span class="student-nav-label">${label}</span></button>`).join("")}</nav>`;
  }

  function teacherTabs(){
    const items=[
      ["home","🏠 Home"],
      ["classes","👥 Classes"],
      ["classmode","🖥️ Class Mode"],
      ["reports","📊 Reports"],
      ["profile","👤 Profile"]
    ];
    return `<nav class="role-tabs" data-role="teacher">${items.map(([id,label])=>`<button class="role-tab ${state.teacherTab===id?"active":""}" onclick="PROVE.setTeacherTab('${id}')">${label}</button>`).join("")}</nav>`;
  }

  function setStudentTab(tab){
    state.studentTab=tab;
    renderStudent();
  }

  function setTeacherTab(tab){
    state.teacherTab=tab;
    renderTeacher();
  }

  async function renderDashboard(){
    if(!state.profile)return renderLanding();
    if(state.profile.role==="owner")return renderOwner();
    if(state.profile.role==="teacher")return renderTeacher();
    return renderStudent();
  }

  async function getAllUsers(){
    if(state.fb){
      const s=await state.fb.db.collection("users").get();return s.docs.map(d=>({id:d.id,...d.data()}));
    } return local.users();
  }
  async function getUserById(id){
    if(state.fb){
      const d=await state.fb.db.collection("users").doc(id).get();
      return d.exists?{id:d.id,...d.data()}:null;
    }
    return local.users().find(x=>x.id===id)||null;
  }
  async function getStudentsForTeacher(teacherId){
    if(state.fb){
      const s=await state.fb.db.collection("users").where("teacherId","==",teacherId).get();
      return s.docs.map(d=>({id:d.id,...d.data()})).filter(x=>x.role==="student");
    }
    return local.users().filter(x=>x.role==="student"&&x.teacherId===teacherId);
  }
  async function getClassById(id){
    if(state.fb){
      const d=await state.fb.db.collection("classes").doc(id).get();
      return d.exists?{id:d.id,...d.data(),openUnits:d.data().openUnits||["u1"]}:null;
    }
    const c=local.classes().find(x=>x.id===id);
    return c?{...c,openUnits:c.openUnits||["u1"]}:null;
  }

  async function getClasses(filterTeacher=null){
    if(state.fb){
      let q=state.fb.db.collection("classes"); if(filterTeacher)q=q.where("teacherId","==",filterTeacher);
      const s=await q.get();return s.docs.map(d=>({id:d.id,...d.data(),openUnits:d.data().openUnits||["u1"]}));
    }
    return local.classes().filter(c=>!filterTeacher||c.teacherId===filterTeacher).map(c=>({...c,openUnits:c.openUnits||["u1"]}));
  }
  async function getAttempts(filters={}){
    let arr;
    if(state.fb){
      let q=state.fb.db.collection("attempts");
      if(filters.studentId)q=q.where("studentId","==",filters.studentId);
      if(filters.teacherId)q=q.where("teacherId","==",filters.teacherId);
      if(filters.classId)q=q.where("classId","==",filters.classId);
      const s=await q.get();arr=s.docs.map(d=>({id:d.id,...d.data()}));
    } else arr=local.attempts();
    return arr.filter(a=>(!filters.studentId||a.studentId===filters.studentId)&&(!filters.teacherId||a.teacherId===filters.teacherId)&&(!filters.classId||a.classId===filters.classId));
  }


  function pctAverage(arr){
    return arr.length ? Math.round(arr.reduce((s,a)=>s+(a.percentage||0),0)/arr.length) : 0;
  }
  function latestPerTraining(attempts){
    const map={};
    [...attempts].sort((a,b)=>(b.submittedAt||"").localeCompare(a.submittedAt||"")).forEach(a=>{
      if(!map[a.trainingId]) map[a.trainingId]=a;
    });
    return Object.values(map);
  }
  function resultLevel(p){
    if(p>=80) return {label:"Mastered",cls:"mastered"};
    if(p>=60) return {label:"Developing",cls:"developing"};
    return {label:"Needs Practice",cls:"needs"};
  }
  function availableTrainingCount(){
    return DATA.units.filter(u=>u.available).reduce((n,u)=>n+(u.trainings||[]).length,0);
  }
  function trainingTypeAverage(attempts,type){
    return pctAverage(attempts.filter(a=>a.trainingType===type));
  }
  function unitProgress(attempts,unit){
    const total=(unit.trainings||[]).length;
    if(!total) return {done:0,total:0,pct:0};
    const done=new Set(attempts.filter(a=>a.unitId===unit.id).map(a=>a.trainingId)).size;
    return {done,total,pct:Math.round(done/total*100)};
  }
  function skillStats(attempts){
    const m={};
    attempts.forEach(a=>(a.answers||[]).forEach(x=>{
      m[x.skill]??={ok:0,total:0,need:x.need||""};
      m[x.skill].total++;
      if(x.correct)m[x.skill].ok++;
      if(!m[x.skill].need && x.need)m[x.skill].need=x.need;
    }));
    return Object.entries(m).map(([skill,v])=>({
      skill, ok:v.ok, total:v.total, pct:Math.round(v.ok/v.total*100), need:v.need
    })).sort((a,b)=>a.pct-b.pct);
  }
  function renderStudentSkillBars(attempts){
    const stats=skillStats(attempts);
    if(!stats.length)return "<p class='muted'>Your skill profile will appear after your first practice.</p>";
    return stats.map(s=>{
      const level=resultLevel(s.pct);
      return `<div class="skill-row"><div>${esc(s.skill)}</div><div class="bar"><div class="fill" style="width:${s.pct}%"></div></div><div>${s.pct}%</div></div>
      <div class="mini-stat"><span class="result-badge ${level.cls}">${level.label}</span></div>`;
    }).join("");
  }
  function renderStudentNeeds(attempts){
    const weak=skillStats(attempts).filter(s=>s.pct<80).slice(0,4);
    if(!attempts.length)return "<p class='muted'>Complete a practice to get personalized recommendations.</p>";
    if(!weak.length)return "<div class='notice success'>Excellent. Your current skill profile shows strong mastery. Keep practicing to maintain it.</div>";
    return `<ul class="action-list">${weak.map(s=>`<li><strong>${esc(s.skill)} — ${s.pct}%:</strong> ${esc(s.need||"Review this skill and try another focused practice.")}</li>`).join("")}</ul>`;
  }
  function unitById(id){
    return DATA.units.find(u=>u.id===id)||null;
  }
  function openUnitsForClass(cls){
    const ids=cls?.openUnits||["u1"];
    return DATA.units.filter(u=>ids.includes(u.id)&&(u.trainings||[]).length>0).sort((a,b)=>a.number-b.number);
  }
  function latestAttemptFor(attempts,trainingId){
    return attempts.find(a=>a.trainingId===trainingId)||null;
  }
  function latestSkillStats(attempts){
    return skillStats(latestPerTraining(attempts));
  }
  function weakSkillsForUnit(attempts,unit){
    const ids=new Set((unit.trainings||[]).map(t=>t.id));
    return latestSkillStats(attempts.filter(a=>ids.has(a.trainingId))).filter(s=>s.pct<80);
  }
  async function buildStudentContext(){
    const attempts=(await getAttempts({studentId:state.profile.id})).sort((a,b)=>b.submittedAt.localeCompare(a.submittedAt));
    const cls=await getClassById(state.profile.classId);
    const openUnits=openUnitsForClass(cls);
    return {attempts,cls,openUnits};
  }
  function nextStudentStep(ctx){
    for(const unit of ctx.openUnits){
      for(const t of unit.trainings){
        if(!ctx.attempts.some(a=>a.trainingId===t.id))return {kind:"training",unit,training:t};
      }
      const weak=weakSkillsForUnit(ctx.attempts,unit);
      const remedialId=`${unit.id}-remedial`;
      if(weak.length&&!ctx.attempts.some(a=>a.trainingId===remedialId))return {kind:"remedial",unit,weak};
    }
    if(ctx.openUnits.length)return {kind:"waiting",unit:ctx.openUnits[ctx.openUnits.length-1]};
    return {kind:"none"};
  }

  async function classReportData(classId){
    const classes=await getClasses(state.profile.role==="teacher"?state.profile.id:null);
    const cls=classes.find(c=>c.id===classId);
    let students,attempts;
    if(state.profile.role==="teacher"){
      const teacherStudents=await getStudentsForTeacher(state.profile.id);
      students=teacherStudents.filter(x=>x.classId===classId);
      const teacherAttempts=await getAttempts({teacherId:state.profile.id});
      attempts=teacherAttempts.filter(a=>a.classId===classId);
    } else {
      const users=await getAllUsers();
      students=users.filter(x=>x.role==="student"&&x.classId===classId);
      attempts=(await getAttempts()).filter(a=>a.classId===classId);
    }
    const available=(cls?.openUnits||["u1"]).flatMap(id=>(unitById(id)?.trainings||[]));
    const totalTrainings=available.length;
    const studentRows=students.map(s=>{
      const sa=attempts.filter(a=>a.studentId===s.id),latest=latestPerTraining(sa.filter(a=>a.trainingType!=="remedial"));
      const completed=new Set(sa.filter(a=>a.trainingType!=="remedial").map(a=>a.trainingId)).size;
      return {id:s.id,name:s.displayName,attempts:sa.length,completed,totalTrainings,overall:pctAverage(latest),reading:trainingTypeAverage(latest,"reading"),grammar:trainingTypeAverage(latest,"grammar"),last:sa.length?[...sa].sort((a,b)=>b.submittedAt.localeCompare(a.submittedAt))[0].submittedAt:""};
    });
    const completedPairs=new Set(attempts.filter(a=>a.trainingType!=="remedial").map(a=>`${a.studentId}|${a.trainingId}`)).size;
    const possible=students.length*totalTrainings;
    return {cls,students,attempts,studentRows,totalTrainings,completion:possible?Math.round(completedPairs/possible*100):0,readingAvg:trainingTypeAverage(attempts,"reading"),grammarAvg:trainingTypeAverage(attempts,"grammar"),overallAvg:pctAverage(attempts)};
  }

  async function renderOwner(){
    const users=await getAllUsers(), classes=await getClasses(), attempts=await getAttempts();
    const teachers=users.filter(x=>x.role==="teacher"), students=users.filter(x=>x.role==="student");
    const rows=teachers.map(t=>{
      const tc=classes.filter(c=>c.teacherId===t.id), ts=students.filter(s=>s.teacherId===t.id);
      return `<tr><td>${esc(t.displayName)}</td><td>${esc(t.school||"")}</td><td>${tc.length}</td><td>${ts.length}</td><td>${esc(t.status||"active")}</td></tr>`;
    }).join("");
    app.innerHTML=shell(`
      <main class="container">
        <div class="report-head"><div><div class="eyebrow">Owner Control Center</div><h1>Platform Overview</h1><p class="muted">Global usage and growth across teachers, classes, and students.</p></div><div class="no-print"><button class="btn btn-secondary" onclick="PROVE.printPage()">Save PDF</button><button class="btn btn-primary" onclick="PROVE.exportOwnerCSV()">Export CSV</button></div></div>
        <div class="grid grid-4">
          <div class="card kpi"><div class="num">${teachers.length}</div><div class="label">Teachers</div></div>
          <div class="card kpi"><div class="num">${classes.length}</div><div class="label">Classes</div></div>
          <div class="card kpi"><div class="num">${students.length}</div><div class="label">Students</div></div>
          <div class="card kpi"><div class="num">${attempts.length}</div><div class="label">Attempts</div></div>
        </div>
        <div class="card"><h2>Teachers</h2><div class="table-wrap"><table><thead><tr><th>Teacher</th><th>School</th><th>Classes</th><th>Students</th><th>Status</th></tr></thead><tbody>${rows||"<tr><td colspan='5'>No teachers yet.</td></tr>"}</tbody></table></div></div>
        ${renderPlatformSkillSummary(attempts)}
      </main>`,"Owner");
  }

  function renderPlatformSkillSummary(attempts){
    const map={};attempts.forEach(a=>(a.answers||[]).forEach(x=>{map[x.skill]??={ok:0,total:0};map[x.skill].total++;if(x.correct)map[x.skill].ok++;}));
    const rows=Object.entries(map).sort((a,b)=>(a[1].ok/a[1].total)-(b[1].ok/b[1].total)).map(([k,v])=>{const p=Math.round(v.ok/v.total*100);return `<div class="skill-row"><div>${esc(k)}</div><div class="bar"><div class="fill" style="width:${p}%"></div></div><div>${p}%</div></div>`}).join("");
    return `<div class="card"><h2>Platform Skill Performance</h2>${rows||"<p class='muted'>No attempt data yet.</p>"}</div>`;
  }

  async function renderTeacher(){
    const classes=await getClasses(state.profile.id);
    if(!state.selectedClassId&&classes[0])state.selectedClassId=classes[0].id;
    const cls=classes.find(c=>c.id===state.selectedClassId);
    let body="";
    if(state.teacherTab==="home")body=await teacherHome(classes,cls);
    if(state.teacherTab==="classes")body=await teacherClasses(classes,cls);
    if(state.teacherTab==="classmode")body=await teacherClassMode(classes,cls);
    if(state.teacherTab==="reports")body=await teacherReports(classes,cls);
    if(state.teacherTab==="profile")body=teacherProfile(classes);
    app.innerHTML=shell(`<main class="container">${teacherTabs()}${body}</main>`,"Teacher");
  }
  function classSelect(classes){return `<div class="field"><label>Class</label><select onchange="PROVE.selectClass(this.value)">${classes.map(c=>`<option value="${c.id}" ${c.id===state.selectedClassId?"selected":""}>${esc(c.name)} (${esc(c.code)})</option>`).join("")||"<option>No classes</option>"}</select></div>`}

  function teacherRecentActivity(attempts){
    const recent=[...attempts].sort((a,b)=>(b.submittedAt||"").localeCompare(a.submittedAt||"")).slice(0,5);
    if(!recent.length)return `<div class="teacher-empty-state"><strong>No activity yet</strong><span>Student activity will appear here after the first practice.</span></div>`;
    return `<div class="teacher-activity-list">${recent.map(a=>{
      const level=resultLevel(a.percentage||0);
      return `<div class="teacher-activity-item">
        <div>
          <strong>${esc(a.studentName||"Student")}</strong>
          <span>${esc(a.trainingTitle||"Practice")}</span>
        </div>
        <div class="teacher-activity-score">
          <span class="result-badge ${level.cls}">${a.percentage||0}%</span>
          <small>${a.submittedAt?new Date(a.submittedAt).toLocaleDateString("en-GB"):""}</small>
        </div>
      </div>`;
    }).join("")}</div>`;
  }

  function teacherQuickActions(cls){
    if(!cls)return "";
    return `<div class="teacher-quick-actions">
      <button class="teacher-action-card" onclick="PROVE.setTeacherTab('classes')">
        <span class="teacher-action-icon">👥</span>
        <span><strong>Manage Classes</strong><small>Links, QR, unit access</small></span>
      </button>
      <button class="teacher-action-card" onclick="PROVE.showClassQR('${esc(cls.code)}','${esc(cls.name).replace(/'/g,"&#39;")}')">
        <span class="teacher-action-icon">▦</span>
        <span><strong>Class QR</strong><small>Open student access</small></span>
      </button>
      <button class="teacher-action-card" onclick="PROVE.setTeacherTab('classmode')">
        <span class="teacher-action-icon">▶</span>
        <span><strong>Class Mode</strong><small>Project and solve together</small></span>
      </button>
      <button class="teacher-action-card" onclick="PROVE.setTeacherTab('reports')">
        <span class="teacher-action-icon">▤</span>
        <span><strong>Reports</strong><small>Class and student results</small></span>
      </button>
    </div>`;
  }

  async function teacherHome(classes,cls){
    if(!cls){
      return `<section class="teacher-home-v2">
        <div class="teacher-hero">
          <div>
            <div class="eyebrow">Teacher Workspace</div>
            <h1>${esc(state.profile.displayName)}</h1>
            <p>${esc(state.profile.school||"")}</p>
          </div>
          <button class="btn btn-success" onclick="PROVE.createClass()">+ Create Class</button>
        </div>
        <div class="teacher-empty-main card">
          <div class="teacher-empty-icon">👥</div>
          <h2>Create your first class</h2>
          <p class="muted">Each class gets its own student link, QR code, unit access, and reports.</p>
          <button class="btn btn-primary" onclick="PROVE.createClass()">Create Class</button>
        </div>
      </section>`;
    }

    const [r,allStudents,allAttempts]=await Promise.all([
      classReportData(cls.id),
      getStudentsForTeacher(state.profile.id),
      getAttempts({teacherId:state.profile.id})
    ]);

    const open=openUnitsForClass(cls);
    const current=open[open.length-1];
    const currentStats=skillStats(r.attempts);
    const weak=currentStats[0]||null;
    const allLatest=latestPerTraining(allAttempts.filter(a=>a.trainingType!=="remedial"));
    const overallReading=trainingTypeAverage(allLatest,"reading");
    const overallGrammar=trainingTypeAverage(allLatest,"grammar");
    const activeClasses=classes.length;
    const currentUnitLabel=current?`Unit ${current.number}: ${current.title}`:"No unit open";

    return `<section class="teacher-home-v2">
      <div class="teacher-hero">
        <div class="teacher-hero-copy">
          <div class="eyebrow">Teacher Workspace</div>
          <h1>${esc(state.profile.displayName)}</h1>
          <p>${esc(state.profile.school||"")}</p>
          <div class="teacher-hero-meta">
            <span>${activeClasses} ${activeClasses===1?"class":"classes"}</span>
            <span>${allStudents.length} students</span>
            <span>${esc(currentUnitLabel)}</span>
          </div>
        </div>
        <div class="teacher-hero-control">
          ${classSelect(classes)}
          <button class="btn btn-primary" onclick="PROVE.copyStudentLink('${esc(cls.code)}')">Copy Student Link</button>
        </div>
      </div>

      <div class="teacher-section-head">
        <div>
          <div class="eyebrow">All Students</div>
          <h2>Teaching Overview</h2>
        </div>
        <button class="btn btn-success" onclick="PROVE.createClass()">+ Create Class</button>
      </div>

      <div class="teacher-metric-grid">
        <div class="teacher-metric-card">
          <span class="teacher-metric-label">Students</span>
          <strong>${allStudents.length}</strong>
          <small>Across all classes</small>
        </div>
        <div class="teacher-metric-card">
          <span class="teacher-metric-label">Classes</span>
          <strong>${classes.length}</strong>
          <small>Active classes</small>
        </div>
        <div class="teacher-metric-card">
          <span class="teacher-metric-label">Reading</span>
          <strong>${overallReading}%</strong>
          <small>Latest performance</small>
        </div>
        <div class="teacher-metric-card">
          <span class="teacher-metric-label">Grammar</span>
          <strong>${overallGrammar}%</strong>
          <small>Latest performance</small>
        </div>
      </div>

      <div class="teacher-section-head compact">
        <div>
          <div class="eyebrow">Selected Class</div>
          <h2>${esc(cls.name)}</h2>
        </div>
        <span class="teacher-code-pill">${esc(cls.code)}</span>
      </div>

      <div class="teacher-class-snapshot">
        <div class="teacher-snapshot-main card">
          <div class="teacher-snapshot-top">
            <div>
              <span class="mini-stat">Current open content</span>
              <h3>${esc(currentUnitLabel)}</h3>
            </div>
            <span class="pill open-chip">${r.completion}% complete</span>
          </div>
          <div class="teacher-class-kpis">
            <div><strong>${r.students.length}</strong><span>Students</span></div>
            <div><strong>${r.completion}%</strong><span>Completion</span></div>
            <div><strong>${r.readingAvg}%</strong><span>Reading</span></div>
            <div><strong>${r.grammarAvg}%</strong><span>Grammar</span></div>
          </div>
        </div>

        <div class="teacher-insight-card card">
          <div class="eyebrow">Priority</div>
          ${weak?`
            <h3>${esc(weak.skill)}</h3>
            <div class="teacher-insight-number">${weak.pct}%</div>
            <p class="muted">${esc(weak.need||"This is currently the lowest-performing skill in the selected class.")}</p>
          `:`<div class="teacher-empty-state"><strong>No skill data yet</strong><span>Insights will appear after students begin practicing.</span></div>`}
        </div>
      </div>

      ${teacherQuickActions(cls)}

      <div class="grid grid-2 teacher-bottom-grid">
        <div class="card">
          <div class="teacher-card-head"><div><div class="eyebrow">Needs</div><h2>Class Focus</h2></div><button class="btn btn-secondary" onclick="PROVE.setTeacherTab('reports')">Full Report</button></div>
          ${renderNeeds(r.attempts)}
        </div>
        <div class="card">
          <div class="teacher-card-head"><div><div class="eyebrow">Activity</div><h2>Recent Attempts</h2></div></div>
          ${teacherRecentActivity(r.attempts)}
        </div>
      </div>
    </section>`;
  }
  function studentClassLink(code){
    const base=window.location.origin+window.location.pathname;
    return `${base}?class=${encodeURIComponent(code)}`;
  }

  async function copyStudentLink(code){
    const link=studentClassLink(code);
    try{
      await navigator.clipboard.writeText(link);
      alert("Student link copied.");
    }catch(e){
      prompt("Copy this student link:",link);
    }
  }

  function showClassQR(code,className=""){
    const link=studentClassLink(code);
    const overlay=document.createElement("div");
    overlay.className="qr-overlay";
    overlay.id="classQrOverlay";
    overlay.innerHTML=`
      <div class="qr-modal">
        <div class="eyebrow">Student Access</div>
        <h2>${esc(className||"Class QR")}</h2>
        <p class="muted">Students scan this QR and enter only their name + PIN.</p>
        <div id="classQrBox" class="qr-box"></div>
        <div class="qr-link">${esc(link)}</div>
        <div style="display:flex;gap:8px;margin-top:14px">
          <button class="btn btn-primary" style="flex:1" onclick="PROVE.copyStudentLink('${esc(code)}')">Copy Link</button>
          <button class="btn btn-secondary" style="flex:1" onclick="PROVE.closeClassQR()">Close</button>
        </div>
      </div>`;
    document.body.appendChild(overlay);
    if(window.QRCode){
      new QRCode(document.getElementById("classQrBox"),{
        text:link,width:205,height:205,
        colorDark:"#17324d",colorLight:"#ffffff",
        correctLevel:QRCode.CorrectLevel.M
      });
    }else{
      document.getElementById("classQrBox").innerHTML="<span>QR library did not load. Use Copy Link.</span>";
    }
  }

  function closeClassQR(){
    document.getElementById("classQrOverlay")?.remove();
  }


  async function teacherClasses(classes,cls){
    const students=await getStudentsForTeacher(state.profile.id);
    const cards=classes.map(c=>{
      const count=students.filter(s=>s.classId===c.id).length;
      const openCount=(c.openUnits||["u1"]).filter(id=>(unitById(id)?.trainings||[]).length>0).length;
      const isSelected=c.id===state.selectedClassId;
      return `
      <div class="card teacher-class-card ${isSelected?"selected":""}">
        <div class="teacher-class-card-head">
          <div>
            <div class="teacher-class-title-row">
              <h2>${esc(c.name)}</h2>
              ${isSelected?`<span class="pill open-chip">Selected</span>`:""}
            </div>
            <div class="teacher-class-meta">
              <span><strong>${count}</strong> students</span>
              <span><strong>${openCount}</strong> open units</span>
              <span class="teacher-code-pill">${esc(c.code)}</span>
            </div>
          </div>
          <div class="teacher-class-actions">
            <button class="btn btn-secondary" onclick="PROVE.selectClass('${c.id}')">Select</button>
          </div>
        </div>

        <div class="teacher-class-share">
          <button class="btn btn-primary" onclick="PROVE.copyStudentLink('${esc(c.code)}')">Copy Student Link</button>
          <button class="btn btn-secondary" onclick="PROVE.showClassQR('${esc(c.code)}','${esc(c.name).replace(/'/g,"&#39;")}')">Class QR</button>
        </div>

        <div class="teacher-unit-access">
          <div class="teacher-card-head"><div><h3>Unit Access</h3><p class="muted">Control what this class can practice.</p></div></div>
          ${DATA.units.map(u=>{
            const isOpen=(c.openUnits||["u1"]).includes(u.id),ready=(u.trainings||[]).length>0;
            return `<div class="lock-row">
              <div>
                <strong>Unit ${u.number}: ${esc(u.title)}</strong>
                <div class="mini-stat">${!ready?"Content not added yet":isOpen?"Available to students":"Hidden from students"}</div>
              </div>
              <div class="teacher-unit-actions">
                <span class="pill ${isOpen&&ready?"open-chip":"locked-chip"}">${isOpen&&ready?"Open":"Locked"}</span>
                ${u.id!=="u1"&&ready?`<button class="btn btn-secondary" onclick="PROVE.toggleUnit('${c.id}','${u.id}',${!isOpen})">${isOpen?"Lock":"Open Unit"}</button>`:""}
              </div>
            </div>`;
          }).join("")}
        </div>
      </div>`;
    }).join("");

    return `<section class="teacher-classes-v2">
      <div class="teacher-section-head">
        <div>
          <div class="eyebrow">Classes</div>
          <h1>Classes & Unit Access</h1>
          <p class="muted">Each class has its own student link, QR code, unit access, and results.</p>
        </div>
        <button class="btn btn-success" onclick="PROVE.createClass()">+ Create Class</button>
      </div>
      <div class="teacher-class-list">${cards||"<div class='notice'>No classes yet.</div>"}</div>
    </section>`;
  }
  function findRecommendedClassTraining(openUnits,attempts){
    const ordered=openUnits.flatMap(u=>u.trainings.map(t=>({...t,unitId:u.id})));if(!ordered.length)return null;let best=ordered[0],bestCount=Infinity;
    for(const t of ordered){const count=new Set(attempts.filter(a=>a.trainingId===t.id).map(a=>a.studentId)).size;if(count<bestCount){best=t;bestCount=count}}
    return best;
  }

  async function teacherClassMode(classes,cls){
    if(!cls)return `<section class="teacher-classmode-v2"><div class="teacher-section-head"><div><div class="eyebrow">Class Mode</div><h1>Teach & Solve Together</h1></div></div><div class="notice">Create a class first.</div></section>`;
    const open=openUnitsForClass(cls),r=await classReportData(cls.id),rec=findRecommendedClassTraining(open,r.attempts);
    const items=open.flatMap(u=>u.trainings.map(t=>`
      <div class="teacher-practice-row">
        <div class="teacher-practice-icon">${t.type==="reading"?"📖":"✍️"}</div>
        <div class="teacher-practice-copy">
          <strong>Unit ${u.number} • ${esc(t.title)}</strong>
          <span>${esc(t.subtitle)}</span>
        </div>
        <button class="btn btn-primary" onclick="PROVE.startClassMode('${t.id}')">Start</button>
      </div>`)).join("");

    return `<section class="teacher-classmode-v2">
      <div class="teacher-section-head">
        <div>
          <div class="eyebrow">Class Mode</div>
          <h1>Teach & Solve Together</h1>
          <p class="muted">Project a large question, discuss, then reveal the answer. Student scores are never changed.</p>
        </div>
      </div>

      <div class="teacher-classmode-controls card">
        ${classSelect(classes)}
        <div class="teacher-classmode-summary">
          <span class="teacher-code-pill">${esc(cls.code)}</span>
          <span>${r.students.length} students</span>
          <span>${r.completion}% completion</span>
        </div>
      </div>

      ${rec?`<div class="teacher-recommended card">
        <div>
          <div class="eyebrow">Recommended Next</div>
          <h2>${esc(rec.title)}</h2>
          <p class="muted">${rec.type==="reading"?"Reading":"Grammar"} • based on the selected class activity</p>
        </div>
        <button class="btn btn-primary" onclick="PROVE.startClassMode('${rec.id}')">Start Recommended Practice</button>
      </div>`:""}

      <div class="card">
        <div class="teacher-card-head"><div><div class="eyebrow">Available</div><h2>Open Unit Practices</h2></div></div>
        <div class="teacher-practice-list">${items||"<p class='muted'>No open content.</p>"}</div>
      </div>
    </section>`;
  }

  async function teacherReports(classes,cls){
    if(!cls)return `<section class="teacher-reports-v2"><div class="teacher-section-head"><div><div class="eyebrow">Reports</div><h1>Class Results</h1></div></div><div class="notice">Create a class first.</div></section>`;
    const r=await classReportData(cls.id);
    const rows=r.studentRows.map(s=>{
      const l=resultLevel(s.overall);
      return `<tr>
        <td><button class="teacher-student-link" onclick="PROVE.openStudent('${s.id}')">${esc(s.name)}</button></td>
        <td>${s.completed}/${s.totalTrainings}</td>
        <td>${s.reading||"-"}${s.reading?"%":""}</td>
        <td>${s.grammar||"-"}${s.grammar?"%":""}</td>
        <td>${s.overall||"-"}${s.overall?"%":""}</td>
        <td><span class="result-badge ${l.cls}">${s.attempts?l.label:"No data"}</span></td>
        <td><button class="btn btn-danger teacher-delete-student" onclick="PROVE.deleteStudent('${s.id}')">Delete</button></td>
      </tr>`;
    }).join("");

    return `<section class="teacher-reports-v2">
      <div class="teacher-section-head">
        <div>
          <div class="eyebrow">Reports</div>
          <h1>Class Results</h1>
          <p class="muted">Open an individual student or export the selected class report.</p>
        </div>
        <div class="teacher-export-actions">
          <button class="btn btn-secondary" onclick="PROVE.exportClassPDF()">Export PDF</button>
          <button class="btn btn-primary" onclick="PROVE.exportClassExcel()">Export Excel</button>
        </div>
      </div>

      <div class="teacher-report-toolbar card">
        ${classSelect(classes)}
        <div class="teacher-report-code">
          <span>Class Code</span>
          <strong>${esc(cls.code)}</strong>
        </div>
      </div>

      <div class="teacher-metric-grid compact">
        <div class="teacher-metric-card"><span class="teacher-metric-label">Students</span><strong>${r.students.length}</strong><small>Selected class</small></div>
        <div class="teacher-metric-card"><span class="teacher-metric-label">Completion</span><strong>${r.completion}%</strong><small>Core practices</small></div>
        <div class="teacher-metric-card"><span class="teacher-metric-label">Reading</span><strong>${r.readingAvg}%</strong><small>Class average</small></div>
        <div class="teacher-metric-card"><span class="teacher-metric-label">Grammar</span><strong>${r.grammarAvg}%</strong><small>Class average</small></div>
      </div>

      <div class="grid grid-2 teacher-report-insights">
        <div class="card"><div class="teacher-card-head"><div><div class="eyebrow">Priority</div><h2>Class Needs</h2></div></div>${renderNeeds(r.attempts)}</div>
        <div class="card"><div class="teacher-card-head"><div><div class="eyebrow">Mastery</div><h2>Skill Performance</h2></div></div>${renderSkillBars(r.attempts)}</div>
      </div>

      <div class="card teacher-students-table">
        <div class="teacher-card-head"><div><div class="eyebrow">Students</div><h2>Individual Results</h2></div><span class="teacher-code-pill">${r.studentRows.length} students</span></div>
        <div class="table-wrap"><table>
          <thead><tr><th>Student</th><th>Completed</th><th>Reading</th><th>Grammar</th><th>Overall</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>${rows||"<tr><td colspan='7'>No students yet.</td></tr>"}</tbody>
        </table></div>
      </div>
    </section>`;
  }
  function teacherProfile(classes){
    return `<section class="teacher-profile-v2">
      <div class="teacher-section-head">
        <div><div class="eyebrow">Profile</div><h1>${esc(state.profile.displayName)}</h1><p class="muted">${esc(state.profile.school||"")}</p></div>
      </div>
      <div class="card teacher-profile-card">
        <div class="teacher-profile-avatar">T</div>
        <div class="teacher-profile-info">
          <strong>${esc(state.profile.displayName||"")}</strong>
          <span>${esc(state.profile.school||"")}</span>
          <div class="teacher-profile-meta"><span>${classes.length} classes</span><span>StepUp Teacher</span></div>
        </div>
      </div>
    </section>`;
  }

  async function createClass(){
    const name=prompt("Class name / اسم الفصل (e.g. 1ث1):"); if(!name)return;
    let code=`MG1-${Math.random().toString(36).slice(2,6).toUpperCase()}`;
    const c={teacherId:state.profile.id,name,code,school:state.profile.school||"",openUnits:["u1"],createdAt:nowISO()};
    if(state.fb){
      for(let i=0;i<5;i++){
        const chk=await state.fb.db.collection("joinCodes").doc(code).get();
        if(!chk.exists)break;
        code=`MG1-${Math.random().toString(36).slice(2,6).toUpperCase()}`;
        c.code=code;
      }
      const classRef=state.fb.db.collection("classes").doc();
      const joinRef=state.fb.db.collection("joinCodes").doc(code);
      const batch=state.fb.db.batch();
      batch.set(classRef,c);
      batch.set(joinRef,{classId:classRef.id,className:name,code,teacherId:state.profile.id,school:state.profile.school||"",openUnits:["u1"],createdAt:nowISO()});
      await batch.commit();
      state.selectedClassId=classRef.id;
    }else{
      c.id=uid();local.saveClass(c);state.selectedClassId=c.id;
    }
    renderTeacher();
  }
  function selectClass(id){state.selectedClassId=id;renderTeacher()}
  async function toggleUnit(classId,unitId,open){
    const classes=await getClasses(state.profile.id),c=classes.find(x=>x.id===classId);if(!c)return;
    let openUnits=[...(c.openUnits||["u1"])];
    if(open&&!openUnits.includes(unitId))openUnits.push(unitId);
    if(!open)openUnits=openUnits.filter(x=>x!==unitId);
    if(!openUnits.includes("u1"))openUnits.unshift("u1");
    openUnits.sort((a,b)=>(unitById(a)?.number||0)-(unitById(b)?.number||0));
    if(state.fb){
      const batch=state.fb.db.batch();
      batch.update(state.fb.db.collection("classes").doc(classId),{openUnits});
      if(c.code)batch.update(state.fb.db.collection("joinCodes").doc(c.code),{openUnits});
      await batch.commit();
    }else{c.openUnits=openUnits;local.saveClass(c)}
    renderTeacher();
  }
  function renderSkillBars(attempts){
    const m={};attempts.forEach(a=>(a.answers||[]).forEach(x=>{m[x.skill]??={ok:0,total:0};m[x.skill].total++;if(x.correct)m[x.skill].ok++;}));
    return Object.entries(m).map(([k,v])=>{const p=Math.round(v.ok/v.total*100);return `<div class="skill-row"><div>${esc(k)}</div><div class="bar"><div class="fill" style="width:${p}%"></div></div><div>${p}%</div></div>`}).join("")||"<p class='muted'>No data yet.</p>";
  }
  function renderNeeds(attempts){
    const m={};attempts.forEach(a=>(a.answers||[]).forEach(x=>{m[x.skill]??={ok:0,total:0};m[x.skill].total++;if(x.correct)m[x.skill].ok++;}));
    const weak=Object.entries(m).map(([k,v])=>[k,Math.round(v.ok/v.total*100)]).sort((a,b)=>a[1]-b[1]).slice(0,3);
    return weak.length?`<ul class="action-list">${weak.map(([k,p])=>`<li><strong>${esc(k)}</strong> — ${p}% ${p<70?"⚠️ Needs attention":""}</li>`).join("")}</ul>`:"<p class='muted'>No data yet.</p>";
  }

  async function openStudent(id){
    state.selectedStudentId=id;
    const s=await getUserById(id); if(!s)return;
    const attempts=(await getAttempts({studentId:id})).sort((a,b)=>b.submittedAt.localeCompare(a.submittedAt));
    const latest=latestPerTraining(attempts);
    const avg=pctAverage(latest.length?latest:attempts);
    const reading=trainingTypeAverage(latest.length?latest:attempts,"reading");
    const grammar=trainingTypeAverage(latest.length?latest:attempts,"grammar");
    const completed=new Set(attempts.map(a=>a.trainingId)).size;
    const total=availableTrainingCount();
    const rows=attempts.map(a=>{
      const level=resultLevel(a.percentage);
      return `<tr><td>${esc(a.trainingTitle)}</td><td>${esc(a.trainingType)}</td><td>${a.score}/${a.total} (${a.percentage}%)</td><td><span class="result-badge ${level.cls}">${level.label}</span></td><td>${fmtTime(a.elapsedSeconds)}</td><td>${new Date(a.submittedAt).toLocaleString()}</td></tr>`;
    }).join("");
    app.innerHTML=shell(`
      <main class="container">
        <div class="report-head">
          <div><div class="eyebrow">Student Profile</div><h1>${esc(s.displayName)}</h1><p class="muted">${esc(s.classCode||"")}</p></div>
          <div class="no-print"><button class="btn btn-secondary" onclick="PROVE.setTeacherTab('reports')">← Back</button><button class="btn btn-secondary" onclick="PROVE.downloadStudentPDF('${s.id}')">Export PDF</button><button class="btn btn-primary" onclick="PROVE.downloadStudentExcel('${s.id}')">Export Excel</button><button class="btn btn-danger" onclick="PROVE.deleteStudent('${s.id}',true)">Delete Student</button></div>
        </div>
        <div class="grid grid-4">
          <div class="card kpi"><div class="num">${completed}/${total}</div><div class="label">Trainings completed</div></div>
          <div class="card kpi"><div class="num">${reading}%</div><div class="label">Reading</div></div>
          <div class="card kpi"><div class="num">${grammar}%</div><div class="label">Grammar</div></div>
          <div class="card kpi"><div class="num">${avg}%</div><div class="label">Overall</div></div>
        </div>
        <div class="grid grid-2"><div class="card"><h2>Skill Profile</h2>${renderSkillBars(attempts)}</div><div class="card"><h2>Recommended Focus</h2>${renderNeeds(attempts)}</div></div>
        <div class="card"><h2>Attempt History</h2><div class="table-wrap"><table><thead><tr><th>Training</th><th>Type</th><th>Score</th><th>Status</th><th>Time</th><th>Date</th></tr></thead><tbody>${rows||"<tr><td colspan='6'>No attempts yet.</td></tr>"}</tbody></table></div></div>
      </main>`,"Student Report");
  }

  function studentStepCopy(step){
    if(step.kind==="training")return {
      eyebrow:"Next Step",
      title:`Continue with Unit ${step.unit.number}`,
      desc:`${step.training.title} — ${step.training.subtitle}`,
      primary:`<button class="btn btn-primary" onclick="PROVE.startTraining('${step.training.id}')">Continue Practice</button>`
    };
    if(step.kind==="remedial")return {
      eyebrow:"Recommended Focus",
      title:`Quick Review • Unit ${step.unit.number}`,
      desc:`Focus on: ${step.weak.slice(0,3).map(x=>x.skill).join(", ")}`,
      primary:`<button class="btn btn-primary" onclick="PROVE.startRemedial('${step.unit.id}')">Practice Weak Skills</button>`
    };
    if(step.kind==="waiting")return {
      eyebrow:"Completed",
      title:`Unit ${step.unit.number} completed ✅`,
      desc:`Nice work. The next unit will open soon.`,
      primary:`<button class="btn btn-secondary" onclick="PROVE.setStudentTab('progress')">View Progress</button>`
    };
    return {
      eyebrow:"Start Here",
      title:"Begin your first practice",
      desc:"Start with the first available training to build your dashboard.",
      primary:`<button class="btn btn-primary" onclick="PROVE.setStudentTab('practice')">Open Practice</button>`
    };
  }

  function renderStudentFocusCards(stats){
    const weak=stats.filter(s=>s.pct<80).slice(0,3);
    if(!stats.length)return "<p class='muted'>Complete a practice to get personalized recommendations.</p>";
    if(!weak.length)return "<div class='notice success'>Excellent work. You do not have urgent weak skills right now. Keep practicing to maintain your level.</div>";
    return `<div class="focus-list">${weak.map(s=>`<div class="focus-item"><div class="focus-head"><strong>${esc(s.skill)}</strong><span class="result-badge ${resultLevel(s.pct).cls}">${s.pct}%</span></div><p>${esc(s.need||"Review this skill and try another focused practice.")}</p></div>`).join("")}</div>`;
  }

  function renderStudentRecentAttempt(attempts){
    const recent=attempts[0];
    if(!recent)return "<p class='muted'>Your recent activity will appear after your first practice.</p>";
    const level=resultLevel(recent.percentage);
    return `<div class="recent-attempt-card"><div class="recent-title"><div><strong>${esc(recent.trainingTitle)}</strong><div class="mini-stat">${esc(recent.trainingType)} • ${new Date(recent.submittedAt).toLocaleDateString()}</div></div><span class="result-badge ${level.cls}">${level.label}</span></div><div class="recent-metrics"><div><span class="mini-stat">Score</span><strong>${recent.percentage}%</strong></div><div><span class="mini-stat">Correct</span><strong>${recent.score}/${recent.total}</strong></div><div><span class="mini-stat">Time</span><strong>${fmtTime(recent.elapsedSeconds)}</strong></div></div></div>`;
  }

  function renderStudentSkillHighlights(stats, mode="strong"){
    let list=[];
    if(mode==="strong") list=[...stats].sort((a,b)=>b.pct-a.pct).slice(0,3);
    else list=stats.filter(s=>s.pct<80).slice(0,3);
    if(!list.length){
      return mode==="strong"
        ? "<p class='muted'>Your strengths will appear after a completed practice.</p>"
        : "<div class='notice success'>No major weak skills at the moment. Great job.</div>";
    }
    return `<div class="mini-skill-list">${list.map(s=>`<div class="mini-skill-item"><div><strong>${esc(s.skill)}</strong><div class="mini-stat">${mode==="strong"?"Strong area":"Needs support"}</div></div><span>${s.pct}%</span></div>`).join("")}</div>`;
  }

  function renderCompactSkillOverview(stats){
    if(!stats.length)return "<p class='muted'>Your skill overview will appear after your first practice.</p>";
    return `${stats.slice(0,6).map(s=>`<div class="skill-row compact"><div>${esc(s.skill)}</div><div class="bar"><div class="fill" style="width:${s.pct}%"></div></div><div>${s.pct}%</div></div>`).join("")}${stats.length>6?`<div class="mini-stat">Showing 6 of ${stats.length} tracked skills.</div>`:""}`;
  }


  async function deleteStudent(studentId,fromProfile=false){
    try{
      if(!studentId)return;

      const student=await getUserById(studentId);
      if(!student)return alert("Student not found.");

      if(state.profile?.role!=="teacher"){
        return alert("Only the teacher can delete a student.");
      }
      if(student.teacherId!==state.profile.id){
        return alert("You can delete only students in your own classes.");
      }

      const attempts=await getAttempts({studentId});
      const ok=confirm(
        `Delete ${student.displayName || "this student"}?\n\n` +
        `This will remove the student from StepUp and delete ${attempts.length} saved attempt(s)/result(s).\n\n` +
        `If the student joins again later using the same name and PIN, a new StepUp profile can be created.`
      );
      if(!ok)return;

      if(state.fb){
        // Delete attempts in safe batches, then remove the StepUp profile.
        const refs=attempts.map(a=>state.fb.db.collection("attempts").doc(a.id));
        for(let i=0;i<refs.length;i+=400){
          const batch=state.fb.db.batch();
          refs.slice(i,i+400).forEach(ref=>batch.delete(ref));
          await batch.commit();
        }
        await state.fb.db.collection("users").doc(studentId).delete();
      }else{
        local.set("attempts",local.attempts().filter(a=>a.studentId!==studentId));
        local.set("users",local.users().filter(u=>u.id!==studentId));
      }

      state.selectedStudentId=null;
      alert("Student deleted successfully.");
      state.teacherTab="reports";
      await renderTeacher();
    }catch(e){
      console.error("Delete student failed",e);
      alert("Could not delete the student: "+(e?.message||e));
    }
  }

  async function renderStudent(){
    const ctx=await buildStudentContext();let body="";
    if(state.studentTab==="home")body=studentHome(ctx);
    if(state.studentTab==="practice")body=studentPractice(ctx);
    if(state.studentTab==="tools")body=studentTools(ctx);
    if(state.studentTab==="progress")body=studentProgress(ctx);
    if(state.studentTab==="profile")body=studentProfile(ctx);
    if(!body){state.studentTab="home";body=studentHome(ctx);}
    app.innerHTML=shell(`<main class="container student-app-shell">${studentTabs()}<section class="student-view">${body}</section></main>`,"Student");
  }

  function studentToolIcon(kind){
    const icons={
      assistant:`<svg viewBox="0 0 24 24"><path d="M12 2.8 13.7 8l5.2 1.7-5.2 1.7L12 16.6l-1.7-5.2-5.2-1.7L10.3 8z"/><path d="m18.4 14.3.8 2.4 2.4.8-2.4.8-.8 2.4-.8-2.4-2.4-.8 2.4-.8z"/></svg>`,
      writing:`<svg viewBox="0 0 24 24"><path d="M4 20h4l11-11-4-4L4 16z"/><path d="m13.5 6.5 4 4M4 20h16"/></svg>`,
      dictionary:`<svg viewBox="0 0 24 24"><path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v17H6.5A2.5 2.5 0 0 0 4 21.5z"/><path d="M4 4.5v17M8 7h8M8 11h6"/></svg>`,
      growth:`<svg viewBox="0 0 24 24"><path d="M12 21V11M12 14c-4.5 0-7-2.3-7-6 4.5 0 7 2.3 7 6ZM12 11c0-4.5 2.3-7 6-7 0 4.5-2.3 7-6 7Z"/></svg>`
    };
    return icons[kind]||"";
  }

  function learningToolsList(compact=false){
    const tools=[
      {id:"assistant",title:"MG1 Assistant",tag:"AI Tutor",desc:"Learn MegaGoal 1 step by step with guided practice."},
      {id:"writing",title:"Writing Coach",tag:"Writing",desc:"Plan, revise, and improve your writing one step at a time."},
      {id:"dictionary",title:"Dictionary",tag:"Quick",desc:"English meaning, Arabic support, IPA, examples, and pronunciation."},
      {id:"growth",title:"My Growth",tag:"Progress",desc:"Goals, assignments, achievements, and your learning history."}
    ];
    const rows=tools.map((t,i)=>`<button class="student-tool-row ${i===0?"featured":""}" onclick="PROVE.openStudentTool('${t.id}')">
      <span class="student-tool-icon tool-${t.id}">${studentToolIcon(t.id)}</span>
      <span class="student-tool-copy"><span class="student-tool-title-line"><strong>${t.title}</strong><span class="student-tool-tag">${t.tag}</span></span><small>${t.desc}</small></span>
      <span class="student-tool-arrow" aria-hidden="true">›</span>
    </button>`).join("");
    return `<div class="student-tools-list ${compact?"compact":""}">${rows}</div>`;
  }

  function weeklyJourney(attempts){
    const now=new Date();
    const day=(now.getDay()+6)%7; // Monday = 0
    const start=new Date(now); start.setHours(0,0,0,0); start.setDate(start.getDate()-day);
    const active=new Set();
    attempts.forEach(a=>{
      const d=new Date(a.submittedAt||a.createdAt||0);
      if(!Number.isNaN(d.getTime()) && d>=start && d<=now) active.add(d.toLocaleDateString("en-CA"));
    });
    const days=Math.min(active.size,7);
    const goal=5;
    const level=days>=5?"Diamond":days===4?"Gold":days===3?"Silver":days>=1?"Bronze":"Ready";
    const pct=Math.min(100,Math.round(days/goal*100));
    const dots=Array.from({length:goal},(_,i)=>`<span class="journey-dot ${i<days?"done":""}"></span>`).join("");
    return `<section class="student-weekly-card">
      <div class="weekly-copy"><div class="section-kicker">My Weekly Journey</div><h2>${days} active ${days===1?"day":"days"} this week</h2><p>Complete practice on ${Math.max(0,goal-days)} more ${goal-days===1?"day":"days"} to reach the weekly goal.</p></div>
      <div class="weekly-status"><span class="weekly-level">${level}</span><strong>${pct}%</strong></div>
      <div class="journey-track" aria-label="${days} of ${goal} active practice days">${dots}</div>
    </section>`;
  }

  function studentHome(ctx){
    const latest=latestPerTraining(ctx.attempts.filter(a=>a.trainingType!=="remedial"));
    const reading=trainingTypeAverage(latest,"reading");
    const grammar=trainingTypeAverage(latest,"grammar");
    const available=ctx.openUnits.flatMap(u=>u.trainings);
    const completed=new Set(ctx.attempts.filter(a=>a.trainingType!=="remedial").map(a=>a.trainingId)).size;
    const completion=available.length?Math.round(Math.min(completed,available.length)/available.length*100):0;
    const step=nextStudentStep(ctx);
    const stepCopy=studentStepCopy(step);
    const firstName=esc((state.profile.displayName||"Student").trim().split(/\s+/)[0]);
    return `<div class="student-home-clean">
      <div class="student-welcome"><div><div class="section-kicker">Welcome back</div><h1>Hi, ${firstName}</h1><p>${esc(ctx.cls?.name||state.profile.classCode||"Your class")} ${ctx.cls?.school?`• ${esc(ctx.cls.school)}`:""}</p></div></div>

      <section class="student-continue-card">
        <div class="continue-copy"><div class="section-kicker">${stepCopy.eyebrow}</div><h2>${stepCopy.title}</h2><p>${stepCopy.desc}</p></div>
        <div class="continue-action">${stepCopy.primary}</div>
      </section>

      <section class="student-home-section tools-home-section">
        <div class="student-section-head"><div><div class="section-kicker">Smart support</div><h2>Learning Tools</h2></div><button class="text-link" onclick="PROVE.setStudentTab('tools')">View all</button></div>
        ${learningToolsList(true)}
      </section>

      ${weeklyJourney(ctx.attempts)}

      <section class="student-home-section">
        <div class="student-section-head"><div><div class="section-kicker">At a glance</div><h2>Your Progress</h2></div><button class="text-link" onclick="PROVE.setStudentTab('progress')">Details</button></div>
        <div class="student-quick-stats">
          <div><span>Overall</span><strong>${completion}%</strong></div>
          <div><span>Reading</span><strong>${reading}%</strong></div>
          <div><span>Grammar</span><strong>${grammar}%</strong></div>
        </div>
      </section>
    </div>`;
  }

  function studentPractice(ctx){
    const openSet=new Set(ctx.openUnits.map(u=>u.id));
    const cards=DATA.units.map(u=>{const ready=(u.trainings||[]).length>0,open=ready&&openSet.has(u.id);return `<div class="card unit-card ${open?"":"locked"}"><span class="pill ${open?"ok":"warn"}">${open?"Available":"🔒 Coming Soon"}</span><h3>Unit ${u.number}: ${esc(u.title)}</h3>${open?u.trainings.map(t=>{const at=latestAttemptFor(ctx.attempts,t.id);return `<div class="training-card"><div><h4>${t.type==="reading"?"Reading":"Grammar"} • ${esc(t.title)}</h4><div class="muted">${esc(t.subtitle)}</div>${at?`<div class="pill">Latest: ${at.percentage}%</div>`:""}</div><button class="btn btn-primary" onclick="PROVE.startTraining('${t.id}')">${at?"Practice Again":"Start"}</button></div>`}).join(""):`<p class="muted">This unit is not open yet.</p>`}</div>`}).join("");
    return `<div class="student-page-head"><div class="section-kicker">Practice</div><h1>Training Library</h1><p>Choose an open unit and continue at your pace.</p></div><div class="grid grid-2">${cards}</div>`;
  }

  function studentTools(){
    return `<div class="student-page-head"><div class="section-kicker">Learning Tools</div><h1>Learn smarter</h1><p>Choose the support you need. Every tool stays inside StepUp.</p></div>${learningToolsList(false)}`;
  }

  function studentProgress(ctx){
    const cards=ctx.openUnits.map(u=>{const done=u.trainings.filter(t=>ctx.attempts.some(a=>a.trainingId===t.id)).length,p=u.trainings.length?Math.round(done/u.trainings.length*100):0;return `<div class="card progress-card"><div class="progress-head"><div><strong>Unit ${u.number}: ${esc(u.title)}</strong><div class="mini-stat">${done}/${u.trainings.length} core practices completed</div></div><strong>${p}%</strong></div><div class="progress-track"><div class="progress-value" style="width:${p}%"></div></div></div>`}).join("");
    const latest=latestPerTraining(ctx.attempts.filter(a=>a.trainingType!=="remedial"));
    const rows=ctx.attempts.slice(0,12).map(a=>{const l=resultLevel(a.percentage);return `<tr><td>${esc(a.trainingTitle)}</td><td>${esc(a.trainingType)}</td><td>${a.percentage}%</td><td><span class="result-badge ${l.cls}">${l.label}</span></td><td>${new Date(a.submittedAt).toLocaleDateString()}</td></tr>`}).join("");
    return `<div class="student-page-head"><div class="section-kicker">Progress</div><h1>My Progress</h1><p>Your results, skill profile, and recommended focus in one place.</p></div>
      <div class="grid grid-2">${cards}</div>
      <div class="card"><h2>Current Skill Profile</h2>${renderStudentSkillBars(latest)}</div>
      <div class="card"><h2>Recommended Focus</h2>${renderStudentNeeds(latest)}</div>
      <div class="card"><div class="student-section-head"><div><div class="section-kicker">History</div><h2>Recent Results</h2></div></div><div class="table-wrap"><table><thead><tr><th>Training</th><th>Type</th><th>Score</th><th>Status</th><th>Date</th></tr></thead><tbody>${rows||"<tr><td colspan='5'>No results yet.</td></tr>"}</tbody></table></div></div>`;
  }

  function studentProfile(){
    return `<div class="student-page-head"><div class="section-kicker">Profile</div><h1>My Profile</h1><p>Keep your name accurate. Class and school information are managed by your teacher.</p></div>
      <div class="student-profile-clean card">
        <div class="student-profile-avatar">${esc((state.profile.displayName||"S").trim().charAt(0).toUpperCase()||"S")}</div>
        <div class="student-profile-main"><strong>${esc(state.profile.displayName||"")}</strong><span>StepUp Student</span></div>
        <button class="btn btn-secondary" onclick="PROVE.editStudentName()">Edit Name</button>
      </div>
      <div class="card student-profile-details">
        <div><span>Class</span><strong>${esc(state.profile.classCode||"—")}</strong></div>
        <div><span>School</span><strong>${esc(state.profile.school||"—")}</strong></div>
        <div><span>Account</span><strong>Student</strong></div>
      </div>
      <button class="btn btn-outline student-logout-btn" onclick="PROVE.logout()">Log out</button>`;
  }

  async function openStudentTool(kind){
    state.studentTab="tools";
    if(kind==="assistant" && window.MG1Assistant?.render)return window.MG1Assistant.render();
    if(kind==="writing" && window.MG1Assistant?.openWritingCoach)return window.MG1Assistant.openWritingCoach();
    if(kind==="dictionary" && window.MG1Assistant?.openDictionary)return window.MG1Assistant.openDictionary();
    if(kind==="growth" && window.STEPUP_ADV?.renderStudentGrowth)return window.STEPUP_ADV.renderStudentGrowth();
    alert("This tool is still loading. Please try again in a moment.");
  }

  async function editStudentName(){
    const current=(state.profile.displayName||"").trim();
    const next=(prompt("Enter the student name:",current)||"").trim().replace(/\s+/g," ");
    if(!next || next===current)return;
    if(next.length<2 || next.length>80)return alert("Please enter a valid name.");
    const pin=(prompt("Enter your current 4-digit PIN to confirm the name change:")||"").trim();
    if(!/^\d{4}$/.test(pin))return alert("Enter your current 4-digit PIN.");
    try{
      if(state.fb){
        const user=state.fb.auth.currentUser;
        if(!user)throw new Error("You are not signed in.");
        const oldCreds=await studentCreds(current,state.profile.classCode,pin);
        const newCreds=await studentCreds(next,state.profile.classCode,pin);
        const credential=firebase.auth.EmailAuthProvider.credential(oldCreds.email,oldCreds.password);
        await user.reauthenticateWithCredential(credential);
        if(user.email!==newCreds.email)await user.updateEmail(newCreds.email);
        await user.updatePassword(newCreds.password);
        await state.fb.db.collection("users").doc(state.profile.id).update({displayName:next});
        state.profile.displayName=next;
      }else{
        const oldCreds=await studentCreds(current,state.profile.classCode,pin);
        if(state.profile.loginEmail!==oldCreds.email || state.profile.loginPassword!==oldCreds.password)throw new Error("Incorrect PIN.");
        const newCreds=await studentCreds(next,state.profile.classCode,pin);
        state.profile.displayName=next; state.profile.loginEmail=newCreds.email; state.profile.loginPassword=newCreds.password;
        local.saveUser(state.profile);
      }
      alert("Name updated. Use the new name with the same PIN the next time you sign in.");
      renderStudent();
    }catch(e){
      console.error("Name update failed",e);
      alert(e?.code==="auth/email-already-in-use"?"That name is already in use in this class.":"Could not update the name. Check your PIN and try again.");
    }
  }

  function findTraining(id){
    for(const u of DATA.units){const t=u.trainings.find(x=>x.id===id);if(t)return {...t,unitId:u.id,unitNumber:u.number,unitTitle:u.title}}
    return null;
  }
  function startTraining(id){
    const t=findTraining(id);if(!t)return;
    state.activeTraining=t;
    state.exam={current:0,answers:Array(t.questions.length).fill(null),flagged:Array(t.questions.length).fill(false),remaining:t.durationSeconds,startedAt:Date.now(),timer:null};
    renderExam();state.exam.timer=setInterval(()=>{state.exam.remaining--;updateExamTimer();if(state.exam.remaining<=0){clearInterval(state.exam.timer);submitExam(true)}},1000);
  }
  async function startRemedial(unitId){
    const ctx=await buildStudentContext(),unit=unitById(unitId);if(!unit)return;
    const weak=weakSkillsForUnit(ctx.attempts,unit).slice(0,3),weakSet=new Set(weak.map(x=>x.skill));let pool=[];
    unit.trainings.forEach(t=>t.questions.forEach(q=>{if(weakSet.has(q.skill))pool.push({...q})}));
    if(pool.length<3)unit.trainings.forEach(t=>t.questions.forEach(q=>{if(pool.length<3&&!pool.some(x=>x.stem===q.stem))pool.push({...q})}));
    pool=pool.slice(0,3);
    const t={id:`${unit.id}-remedial`,type:"remedial",title:`Unit ${unit.number} Quick Review`,subtitle:"Targeted practice for your current needs",durationSeconds:180,questions:pool,unitId:unit.id,unitNumber:unit.number,unitTitle:unit.title,topics:weak.map(x=>x.skill)};
    state.activeTraining=t;state.exam={current:0,answers:Array(t.questions.length).fill(null),flagged:Array(t.questions.length).fill(false),remaining:t.durationSeconds,startedAt:Date.now(),timer:null};
    renderExam();state.exam.timer=setInterval(()=>{state.exam.remaining--;updateExamTimer();if(state.exam.remaining<=0){clearInterval(state.exam.timer);submitExam(true)}},1000);
  }

  function renderExam(){
    const t=state.activeTraining,e=state.exam,q=t.questions[e.current];
    const left=t.type==="reading"?`<section class="passage"><div class="eyebrow">Reading Passage</div><h2>${esc(t.title)}</h2><div class="muted" style="font-size:12px;margin-bottom:12px">${esc(t.source)}</div><div class="passage-text">${t.passage}</div></section>`:`<section class="passage"><div class="eyebrow">${t.type==="remedial"?"Quick Review":"Grammar Focus"}</div><h2>${esc(t.title)}</h2>${t.source?`<p class="muted">${esc(t.source)}</p>`:""}<h3>Skills in this practice</h3><ul>${(t.topics||[]).map(x=>`<li>${esc(x)}</li>`).join("")}</ul><div class="notice">Choose the best answer. No explanations are shown until you submit.</div></section>`;
    app.innerHTML=`
      <header class="exam-top"><div><strong>${esc(t.subtitle)}</strong><div style="font-size:12px;opacity:.8">Unit ${t.unitNumber}: ${esc(t.unitTitle)}</div></div><div class="exam-metrics"><div class="metric">Answered <strong id="ansCount"></strong></div><div class="metric">Time <strong id="examTimer"></strong></div></div></header>
      <main class="exam-shell">${left}<section class="question-side"><div class="qnav">${t.questions.map((_,i)=>`<button class="qdot ${e.answers[i]!==null?"answered":""} ${i===e.current?"current":""} ${e.flagged[i]?"flagged":""}" onclick="PROVE.goQ(${i})">${i+1}</button>`).join("")}</div>
      <div class="qbox"><div style="display:flex;justify-content:space-between;align-items:center"><span class="muted">Question ${e.current+1} of ${t.questions.length}</span><button class="flag ${e.flagged[e.current]?"active":""}" onclick="PROVE.toggleFlag()">⚑ Flag for Review</button></div><div class="stem">${esc(q.stem)}</div>
      ${q.choices.map((c,i)=>`<label class="choice ${e.answers[e.current]===i?"selected":""}" onclick="PROVE.choose(${i})"><input type="radio" ${e.answers[e.current]===i?"checked":""}><strong>${String.fromCharCode(65+i)}.</strong><span>${esc(c)}</span></label>`).join("")}
      <div class="exam-actions"><button class="btn btn-secondary" ${e.current===0?"disabled":""} onclick="PROVE.prevQ()">Previous</button><button class="btn btn-primary" onclick="PROVE.nextQ()">${e.current===t.questions.length-1?"Submit Test":"Save & Next"}</button></div></div></section></main>`;
    updateExamTimer();
  }
  function updateExamTimer(){
    const el=document.getElementById("examTimer"), ac=document.getElementById("ansCount");if(!el)return;
    el.textContent=fmtTime(Math.max(0,state.exam.remaining));ac.textContent=`${state.exam.answers.filter(x=>x!==null).length}/${state.activeTraining.questions.length}`;
  }
  function choose(i){state.exam.answers[state.exam.current]=i;renderExam()}
  function goQ(i){state.exam.current=i;renderExam()}
  function toggleFlag(){state.exam.flagged[state.exam.current]=!state.exam.flagged[state.exam.current];renderExam()}
  function prevQ(){if(state.exam.current>0){state.exam.current--;renderExam()}}
  function nextQ(){if(state.exam.current<state.activeTraining.questions.length-1){state.exam.current++;renderExam()}else submitExam(false)}

  async function submitExam(auto){
    if(!auto){
      const un=state.exam.answers.filter(x=>x===null).length, fl=state.exam.flagged.filter(Boolean).length;
      if(!confirm(`Unanswered: ${un}\nFlagged: ${fl}\nSubmit now?`))return;
    }
    clearInterval(state.exam.timer);
    const t=state.activeTraining;let score=0;
    const answers=t.questions.map((q,i)=>{const correct=state.exam.answers[i]===q.answer;if(correct)score++;return {question:i+1,skill:q.skill,selected:state.exam.answers[i],correctAnswer:q.answer,correct,need:q.need||""}});
    const attempt={
      studentId:state.profile.id,studentName:state.profile.displayName,classId:state.profile.classId,classCode:state.profile.classCode,
      teacherId:state.profile.teacherId,trainingId:t.id,trainingTitle:t.title,trainingType:t.type,unitId:t.unitId,unitNumber:t.unitNumber,
      score,total:t.questions.length,percentage:Math.round(score/t.questions.length*100),elapsedSeconds:Math.min(t.durationSeconds,Math.round((Date.now()-state.exam.startedAt)/1000)),
      autoSubmitted:auto,answers,submittedAt:nowISO()
    };
    if(state.fb) await state.fb.db.collection("attempts").add(attempt); else{attempt.id=uid();local.saveAttempt(attempt)}
    showAttemptReport(attempt,t);
  }

  function showAttemptReport(a,t){
    const weak=a.answers.filter(x=>!x.correct);
    const by={};a.answers.forEach(x=>{by[x.skill]??={ok:0,total:0,need:x.need};by[x.skill].total++;if(x.correct)by[x.skill].ok++;});
    const skills=Object.entries(by).map(([k,v])=>{const p=Math.round(v.ok/v.total*100);return `<div class="skill-row"><div>${esc(k)}</div><div class="bar"><div class="fill" style="width:${p}%"></div></div><div>${p}%</div></div>`}).join("");
    const needs=weak.length?`<ul class="action-list">${[...new Map(weak.map(x=>[x.skill,x])).values()].map(x=>`<li><strong>${esc(x.skill)}:</strong> ${esc(x.need||"Review this skill and try a short focused practice.")}</li>`).join("")}</ul>`:"<div class='notice success'>Excellent — no weak skill was detected in this attempt.</div>";
    const review=t.questions.map((q,i)=>{const s=a.answers[i].selected;return `<div class="student-review-item"><strong>Q${i+1}. ${esc(q.stem)}</strong><p class="${a.answers[i].correct?"status ok":"status bad"}">${a.answers[i].correct?"Correct":"Needs review"}</p><p>Your answer: ${s===null?"No answer":esc(q.choices[s])}</p>${a.answers[i].correct?"":`<p>Correct answer: <strong>${esc(q.choices[q.answer])}</strong></p>`}<p class="muted">${esc(q.explanation)}</p>${a.answers[i].correct?"":`<button class="btn btn-secondary explain-mistake-btn no-print" onclick="PROVE.explainMyMistake(${i})"><span class="explain-mistake-spark">✦</span> Explain my mistake</button>`}</div>`}).join("");
    app.innerHTML=shell(`<main class="container student-app-shell">${studentTabs()}<section class="student-view"><div class="report-head"><div><div class="eyebrow">My STEP Report</div><h1>${esc(t.title)}</h1><p class="muted">Unit ${t.unitNumber} • ${esc(t.type)}</p></div><div class="no-print"><button class="btn btn-secondary" onclick="PROVE.setStudentTab('home')">Back to My Dashboard</button></div></div>
      <div class="card"><div class="score">${a.score}/${a.total} <span style="font-size:22px">(${a.percentage}%)</span></div><p>Time used: ${fmtTime(a.elapsedSeconds)}</p></div>
      <div class="grid grid-2"><div class="card"><h2>Skill Breakdown</h2>${skills}</div><div class="card"><h2>What I Need</h2>${needs}</div></div>
      <div class="card"><h2>Review</h2>${review}</div></section></main>`,"Student Report");
  }

  async function explainMyMistake(questionIndex){
    const t=state.activeTraining;
    const q=t?.questions?.[questionIndex];
    const selected=state.exam?.answers?.[questionIndex];
    if(!t || !q || !window.MG1Assistant?.render){
      alert("MG1 Assistant is still loading. Please try again in a moment.");
      return;
    }

    const cleanContextText=(value,max)=>String(value??"").replace(/<[^>]*>/g," ").replace(/\s+/g," ").trim().slice(0,max);
    const selectedText=selected===null || selected===undefined
      ? "No answer"
      : `${String.fromCharCode(65+selected)}) ${cleanContextText(q.choices?.[selected],70)}`;
    const correctText=`${String.fromCharCode(65+q.answer)}) ${cleanContextText(q.choices?.[q.answer],70)}`;
    const rawPassage=t.type==="reading" ? cleanContextText(t.passage,100) : "";
    const passageContext=rawPassage ? `\nPassage context: ${rawPassage}` : "";
    const prompt=`Explain my mistake from StepUp Practice.
Unit ${t.unitNumber}: ${cleanContextText(t.unitTitle,40)}
Skill: ${cleanContextText(q.skill||t.type,40)}
Question: ${cleanContextText(q.stem,130)}
My answer: ${selectedText}
Correct answer: ${correctText}${passageContext}
Explain this mistake briefly and clearly. Why is my answer wrong, and why does the correct answer work? Stay on this question.`;

    state.studentTab="tools";
    await renderStudent();
    window.MG1Assistant.render();

    // Use the assistant exactly as configured; only prefill the current Practice context.
    let tries=0;
    const sendWhenReady=()=>{
      const input=document.getElementById("mg1Input");
      const send=document.getElementById("mg1Send");
      if(input && send){
        input.value=prompt;
        input.focus();
        send.click();
        return;
      }
      if(++tries<12)setTimeout(sendWhenReady,50);
      else alert("MG1 Assistant is still loading. Please try again.");
    };
    setTimeout(sendWhenReady,0);
  }

  function stopClassModeTimer(){if(state.classMode?.timer){clearInterval(state.classMode.timer);state.classMode.timer=null}}
  function startClassMode(trainingId){const t=findTraining(trainingId);if(!t)return;stopClassModeTimer();state.classMode={training:t,index:0,revealed:false,paused:false,remaining:t.durationSeconds,timer:null};runClassModeTimer();renderClassModeScreen()}
  function runClassModeTimer(){stopClassModeTimer();if(!state.classMode||state.classMode.paused)return;state.classMode.timer=setInterval(()=>{if(!state.classMode||state.classMode.paused)return;state.classMode.remaining=Math.max(0,state.classMode.remaining-1);const el=document.getElementById("cmTimer");if(el)el.textContent=fmtTime(state.classMode.remaining);if(state.classMode.remaining<=0)stopClassModeTimer()},1000)}
  function classQuestionHtml(q,cm){return `<div class="eyebrow">Question ${cm.index+1}</div><div class="classmode-stem">${esc(q.stem)}</div>${q.choices.map((c,i)=>`<div class="classmode-choice ${cm.revealed&&i===q.answer?"correct":""}"><strong>${String.fromCharCode(65+i)}.</strong> ${esc(c)}</div>`).join("")}${cm.revealed?`<div class="classmode-explain"><strong>Answer: ${String.fromCharCode(65+q.answer)}</strong><br>${esc(q.explanation||"")}</div>`:""}<div class="exam-actions"><button class="btn btn-secondary" ${cm.index===0?"disabled":""} onclick="PROVE.classPrev()">Previous</button><div><button class="btn btn-secondary" onclick="PROVE.revealClassAnswer()">Reveal Answer</button> <button class="btn btn-primary" onclick="PROVE.classNext()">${cm.index===cm.training.questions.length-1?"Finish":"Next Question"}</button></div></div>`}
  function renderClassModeScreen(){const cm=state.classMode,t=cm.training,q=t.questions[cm.index];app.innerHTML=`<div class="classmode-shell"><div class="classmode-toolbar"><div><strong>Class Mode • ${esc(t.title)}</strong><div style="font-size:12px;opacity:.8">Question ${cm.index+1} of ${t.questions.length}</div></div><div style="display:flex;gap:8px;align-items:center"><strong id="cmTimer">${fmtTime(cm.remaining)}</strong><button class="btn btn-outline" onclick="PROVE.toggleClassPause()">${cm.paused?"Resume":"Pause & Discuss"}</button><button class="btn btn-outline" onclick="PROVE.exitClassMode()">Exit</button></div></div><div class="classmode-content">${t.type==="reading"?`<div class="grid grid-2"><div class="classmode-card"><h2>Reading Passage</h2><div class="passage-text">${t.passage}</div></div><div class="classmode-card">${classQuestionHtml(q,cm)}</div></div>`:`<div class="classmode-card">${classQuestionHtml(q,cm)}</div>`}</div></div>`}
  function toggleClassPause(){if(!state.classMode)return;state.classMode.paused=!state.classMode.paused;if(state.classMode.paused)stopClassModeTimer();else runClassModeTimer();renderClassModeScreen()}
  function revealClassAnswer(){if(state.classMode){state.classMode.revealed=true;renderClassModeScreen()}}
  function classPrev(){if(state.classMode&&state.classMode.index>0){state.classMode.index--;state.classMode.revealed=false;renderClassModeScreen()}}
  function classNext(){if(!state.classMode)return;if(state.classMode.index<state.classMode.training.questions.length-1){state.classMode.index++;state.classMode.revealed=false;renderClassModeScreen()}else exitClassMode()}
  function exitClassMode(){stopClassModeTimer();state.classMode=null;state.teacherTab="classmode";renderTeacher()}


  async function savePdfPages(pageHtmls, filename, orientation="portrait"){
    if(!window.html2canvas || !window.jspdf){
      alert("PDF libraries did not load. Please refresh the page and try again.");
      return;
    }
    const {jsPDF}=window.jspdf;
    const doc=new jsPDF({orientation,unit:"mm",format:"a4"});
    const pageW=doc.internal.pageSize.getWidth();
    const pageH=doc.internal.pageSize.getHeight();
    const margin=8;
    const maxW=pageW-(margin*2);
    const maxH=pageH-(margin*2);

    for(let i=0;i<pageHtmls.length;i++){
      const host=document.createElement("div");
      host.setAttribute("dir","ltr");
      host.style.cssText=`
        position:fixed;left:-12000px;top:0;
        width:${orientation==="landscape"?"1120px":"780px"};
        background:#ffffff;color:#1d2a35;padding:28px;
        font-family:Arial,Tahoma,"Segoe UI",sans-serif;
        box-sizing:border-box;z-index:-9999;
      `;
      host.innerHTML=pageHtmls[i];
      document.body.appendChild(host);

      if(document.fonts && document.fonts.ready){
        try{await document.fonts.ready}catch(e){}
      }

      const canvas=await html2canvas(host,{
        scale:2,
        backgroundColor:"#ffffff",
        useCORS:true,
        logging:false,
        windowWidth:host.scrollWidth,
        windowHeight:host.scrollHeight
      });
      document.body.removeChild(host);

      if(i>0)doc.addPage();
      const ratio=Math.min(maxW/canvas.width,maxH/canvas.height);
      const imgW=canvas.width*ratio;
      const imgH=canvas.height*ratio;
      const x=(pageW-imgW)/2;
      const y=margin;
      doc.addImage(canvas.toDataURL("image/jpeg",0.94),"JPEG",x,y,imgW,imgH);
    }
    doc.save(filename);
  }

  function pdfReportStyles(){
    return `
      <style>
        *{box-sizing:border-box}
        body{margin:0}
        .report{font-family:Arial,Tahoma,"Segoe UI",sans-serif;color:#1d2a35}
        h1{font-size:24px;margin:0 0 8px;color:#17324d}
        h2{font-size:18px;margin:18px 0 9px;color:#17324d}
        .meta{font-size:13px;line-height:1.7;margin-bottom:14px}
        .metaLine{display:flex;align-items:baseline;gap:5px;flex-wrap:wrap;margin:2px 0}
        .biLabel{display:inline-flex;align-items:baseline;gap:4px;white-space:nowrap;font-weight:700}
        .ar{direction:rtl;unicode-bidi:isolate;font-family:Tahoma,Arial,"Segoe UI",sans-serif}
        .valueAuto{direction:auto;unicode-bidi:isolate}
        .biHead{display:inline-flex;align-items:baseline;gap:6px}
        .thBi{display:flex;align-items:center;gap:4px;white-space:nowrap}
        .kpis{display:flex;gap:10px;flex-wrap:wrap;margin:12px 0 16px}
        .kpiBox{border:1px solid #d8e0e6;border-radius:8px;padding:10px 12px;min-width:120px}
        .kpiBox strong{display:block;font-size:20px;color:#17324d}
        table{width:100%;border-collapse:collapse;font-size:12px}
        th{background:#2b6088;color:#fff;padding:8px;text-align:left}
        td{padding:8px;border-bottom:1px solid #e7edf1;vertical-align:top}
        tr:nth-child(even) td{background:#f7f9fa}
        [dir="auto"]{unicode-bidi:plaintext}
        .nameCell{font-weight:700;font-size:13px}
        .small{font-size:11px;color:#6b7984}
        .skillRow{display:grid;grid-template-columns:220px 1fr 55px;gap:8px;align-items:center;margin:8px 0}
        .bar{height:8px;background:#e7edf1;border-radius:99px;overflow:hidden}
        .fill{height:100%;background:#2f7784}
        .footer{margin-top:14px;font-size:10px;color:#84919a;text-align:right}
      </style>
    `;
  }

  async function downloadStudentPDF(studentId){
    const s=await getUserById(studentId); if(!s)return alert("Student not found.");
    const attempts=(await getAttempts({studentId})).sort((a,b)=>b.submittedAt.localeCompare(a.submittedAt));
    const avg=attempts.length?Math.round(attempts.reduce((n,a)=>n+a.percentage,0)/attempts.length):0;

    const map={};
    attempts.forEach(a=>(a.answers||[]).forEach(x=>{
      map[x.skill]??={ok:0,total:0};
      map[x.skill].total++;
      if(x.correct)map[x.skill].ok++;
    }));
    const skillRows=Object.entries(map).map(([k,v])=>({
      skill:k,pct:Math.round(v.ok/v.total*100)
    }));

    const chunks=[];
    for(let i=0;i<attempts.length;i+=16)chunks.push(attempts.slice(i,i+16));
    if(!chunks.length)chunks.push([]);

    const pages=chunks.map((chunk,idx)=>`
      ${pdfReportStyles()}
      <div class="report">
        <h1>StepUp | Student Progress Report</h1>
        <div class="meta">
          <div class="metaLine"><span class="biLabel"><span>Student</span><span>/</span><span class="ar">الطالبة</span><span>:</span></span><span class="valueAuto">${esc(s.displayName)}</span></div>
          <div class="metaLine"><span class="biLabel"><span>Class</span><span>/</span><span class="ar">الفصل</span><span>:</span></span><span class="valueAuto">${esc(s.classCode||"")}</span></div>
          <div class="metaLine"><span class="biLabel"><span>Overall average</span><span>/</span><span class="ar">المتوسط</span><span>:</span></span><span>${avg}%</span></div>
        </div>
        ${idx===0?`<div class="kpis">
          <div class="kpiBox"><strong>${attempts.length}</strong><span>Attempts</span></div>
          <div class="kpiBox"><strong>${avg}%</strong><span>Overall</span></div>
        </div>`:""}
        <h2>${idx===0?`<span class="biHead"><span>Attempt History</span><span>/</span><span class="ar">سجل المحاولات</span></span>`:"Attempt History - continued"}</h2>
        <table>
          <thead><tr><th>Training</th><th>Type</th><th>Score</th><th>Time</th><th>Date</th></tr></thead>
          <tbody>
            ${chunk.map(a=>`<tr>
              <td dir="auto">${esc(a.trainingTitle)}</td>
              <td>${esc(a.trainingType)}</td>
              <td>${a.score}/${a.total} (${a.percentage}%)</td>
              <td>${fmtTime(a.elapsedSeconds)}</td>
              <td>${new Date(a.submittedAt).toLocaleDateString("en-GB")}</td>
            </tr>`).join("") || `<tr><td colspan="5">No attempts yet.</td></tr>`}
          </tbody>
        </table>
        <div class="footer">StepUp | STEP Training Lab</div>
      </div>
    `);

    pages.push(`
      ${pdfReportStyles()}
      <div class="report">
        <h1><span class="biHead"><span>Skill Profile</span><span>/</span><span class="ar">ملف المهارات</span></span></h1>
        <div class="meta"><div class="metaLine"><span class="biLabel"><span>Student</span><span>/</span><span class="ar">الطالبة</span><span>:</span></span><span class="valueAuto">${esc(s.displayName)}</span></div></div>
        ${skillRows.length?skillRows.map(x=>`
          <div class="skillRow">
            <div dir="auto">${esc(x.skill)}</div>
            <div class="bar"><div class="fill" style="width:${x.pct}%"></div></div>
            <div>${x.pct}%</div>
          </div>`).join(""):`<p>No skill data yet.</p>`}
        <div class="footer">StepUp | STEP Training Lab</div>
      </div>
    `);

    await savePdfPages(pages,`PROVE_IT_${slug(s.displayName)||"student"}_report.pdf`,"portrait");
  }

  async function exportClassPDF(){
    if(!state.selectedClassId)return alert("Select a class first.");
    const r=await classReportData(state.selectedClassId);
    if(!r.cls)return;

    const studentChunks=[];
    for(let i=0;i<r.studentRows.length;i+=18)studentChunks.push(r.studentRows.slice(i,i+18));
    if(!studentChunks.length)studentChunks.push([]);

    const pages=studentChunks.map((chunk,idx)=>`
      ${pdfReportStyles()}
      <div class="report">
        <h1>StepUp | Class Report</h1>
        <div class="meta">
          <div class="metaLine"><span class="biLabel"><span>Teacher</span><span>/</span><span class="ar">المعلمة</span><span>:</span></span><span class="valueAuto">${esc(state.profile.displayName)}</span></div>
          <div class="metaLine"><span class="biLabel"><span>Class</span><span>/</span><span class="ar">الفصل</span><span>:</span></span><span class="valueAuto">${esc(r.cls.name)}</span><span style="margin-inline-start:12px;font-weight:700">Code:</span><span>${esc(r.cls.code)}</span></div>
        </div>
        ${idx===0?`<div class="kpis">
          <div class="kpiBox"><strong>${r.students.length}</strong><span>Students</span></div>
          <div class="kpiBox"><strong>${r.completion}%</strong><span>Completion</span></div>
          <div class="kpiBox"><strong>${r.readingAvg}%</strong><span>Reading</span></div>
          <div class="kpiBox"><strong>${r.grammarAvg}%</strong><span>Grammar</span></div>
        </div>`:""}
        <h2>${idx===0?`<span class="biHead"><span>Students</span><span>/</span><span class="ar">الطالبات</span></span>`:"Students - continued"}</h2>
        <table>
          <thead>
            <tr><th><span class="thBi"><span>Student</span><span>/</span><span class="ar">الطالبة</span></span></th><th>Completed</th><th>Reading</th><th>Grammar</th><th>Overall</th><th>Last activity</th></tr>
          </thead>
          <tbody>
            ${chunk.map(s=>`<tr>
              <td class="nameCell" dir="auto">${esc(s.name)}</td>
              <td>${s.completed}/${s.totalTrainings}</td>
              <td>${s.reading||0}%</td>
              <td>${s.grammar||0}%</td>
              <td>${s.overall||0}%</td>
              <td>${s.last?new Date(s.last).toLocaleDateString("en-GB"):"-"}</td>
            </tr>`).join("") || `<tr><td colspan="6">No students yet.</td></tr>`}
          </tbody>
        </table>
        <div class="footer">StepUp | STEP Training Lab</div>
      </div>
    `);

    const stats=skillStats(r.attempts);
    pages.push(`
      ${pdfReportStyles()}
      <div class="report">
        <h1><span class="biHead"><span>Skill Performance</span><span>/</span><span class="ar">أداء المهارات</span></span></h1>
        <div class="meta">
          <div class="metaLine"><span class="biLabel"><span>Class</span><span>/</span><span class="ar">الفصل</span><span>:</span></span><span class="valueAuto">${esc(r.cls.name)}</span><span style="margin-inline-start:12px;font-weight:700">Code:</span><span>${esc(r.cls.code)}</span></div>
        </div>
        ${stats.length?stats.map(s=>`
          <div class="skillRow">
            <div dir="auto">${esc(s.skill)}</div>
            <div class="bar"><div class="fill" style="width:${s.pct}%"></div></div>
            <div>${s.pct}%</div>
          </div>`).join(""):`<p>No skill data yet.</p>`}
        <div class="footer">StepUp | STEP Training Lab</div>
      </div>
    `);

    await savePdfPages(pages,`PROVE_IT_${slug(r.cls.name)||"class"}_report.pdf`,"landscape");
  }

  async function exportClassExcel(){
    if(!state.selectedClassId)return alert("Select a class first.");
    if(typeof XLSX==="undefined")return alert("Excel library did not load.");
    const r=await classReportData(state.selectedClassId);
    if(!r.cls)return;
    const wb=XLSX.utils.book_new();
    const summary=[
      ["StepUp | Class Report",""],
      ["Teacher",state.profile.displayName],
      ["School",state.profile.school||""],
      ["Class",r.cls.name],
      ["Class Code",r.cls.code],
      ["Students",r.students.length],
      ["Training Completion",`${r.completion}%`],
      ["Reading Average",`${r.readingAvg}%`],
      ["Grammar Average",`${r.grammarAvg}%`],
      ["Overall Attempt Average",`${r.overallAvg}%`]
    ];
    XLSX.utils.book_append_sheet(wb,XLSX.utils.aoa_to_sheet(summary),"Summary");

    const students=[["Student","Trainings Completed","Available Trainings","Reading %","Grammar %","Overall %","Attempts","Last Activity"]];
    r.studentRows.forEach(s=>students.push([s.name,s.completed,s.totalTrainings,s.reading,s.grammar,s.overall,s.attempts,s.last?new Date(s.last).toLocaleString():""]));
    XLSX.utils.book_append_sheet(wb,XLSX.utils.aoa_to_sheet(students),"Students");

    const attempts=[["Student","Class","Unit","Training","Type","Score","Total","Percentage","Time Seconds","Submitted At"]];
    r.attempts.forEach(a=>attempts.push([a.studentName,a.classCode,a.unitNumber,a.trainingTitle,a.trainingType,a.score,a.total,a.percentage,a.elapsedSeconds,a.submittedAt]));
    XLSX.utils.book_append_sheet(wb,XLSX.utils.aoa_to_sheet(attempts),"Attempts");

    const skills=[["Skill","Correct","Total","Mastery %"]];
    skillStats(r.attempts).forEach(s=>skills.push([s.skill,s.ok,s.total,s.pct]));
    XLSX.utils.book_append_sheet(wb,XLSX.utils.aoa_to_sheet(skills),"Skills");
    XLSX.writeFile(wb,`PROVE_IT_${slug(r.cls.name)||"class"}_report.xlsx`);
  }

  async function downloadStudentExcel(studentId){
    if(typeof XLSX==="undefined")return alert("Excel library did not load.");
    const s=await getUserById(studentId); if(!s)return;
    const attempts=(await getAttempts({studentId})).sort((a,b)=>b.submittedAt.localeCompare(a.submittedAt));
    const latest=latestPerTraining(attempts);
    const wb=XLSX.utils.book_new();
    const summary=[
      ["StepUp | Student Progress Report",""],
      ["Student",s.displayName],
      ["Class",s.classCode||""],
      ["Overall %",pctAverage(latest.length?latest:attempts)],
      ["Reading %",trainingTypeAverage(latest.length?latest:attempts,"reading")],
      ["Grammar %",trainingTypeAverage(latest.length?latest:attempts,"grammar")],
      ["Completed Trainings",new Set(attempts.map(a=>a.trainingId)).size],
      ["Available Trainings",availableTrainingCount()]
    ];
    XLSX.utils.book_append_sheet(wb,XLSX.utils.aoa_to_sheet(summary),"Summary");
    const at=[["Training","Type","Unit","Score","Total","Percentage","Time Seconds","Submitted At"]];
    attempts.forEach(a=>at.push([a.trainingTitle,a.trainingType,a.unitNumber,a.score,a.total,a.percentage,a.elapsedSeconds,a.submittedAt]));
    XLSX.utils.book_append_sheet(wb,XLSX.utils.aoa_to_sheet(at),"Attempts");
    const sk=[["Skill","Correct","Total","Mastery %","Recommended Focus"]];
    skillStats(attempts).forEach(x=>sk.push([x.skill,x.ok,x.total,x.pct,x.need||""]));
    XLSX.utils.book_append_sheet(wb,XLSX.utils.aoa_to_sheet(sk),"Skills");
    XLSX.writeFile(wb,`PROVE_IT_${slug(s.displayName)||"student"}_report.xlsx`);
  }

  async function exportTeacherCSV(){
    const attempts=await getAttempts({teacherId:state.profile.id}); downloadCSV("teacher_results.csv",attempts);
  }
  async function exportOwnerCSV(){
    const attempts=await getAttempts(); downloadCSV("platform_results.csv",attempts);
  }
  function downloadCSV(name,attempts){
    const rows=[["Student","Class","Unit","Training","Type","Score","Total","Percentage","TimeSeconds","SubmittedAt"]];
    attempts.forEach(a=>rows.push([a.studentName,a.classCode,a.unitNumber,a.trainingTitle,a.trainingType,a.score,a.total,a.percentage,a.elapsedSeconds,a.submittedAt]));
    const csv=rows.map(r=>r.map(v=>`"${String(v??"").replace(/"/g,'""')}"`).join(",")).join("\n");
    const blob=new Blob(["\ufeff"+csv],{type:"text/csv;charset=utf-8"}),url=URL.createObjectURL(blob),link=document.createElement("a");link.href=url;link.download=name;link.click();URL.revokeObjectURL(url);
  }
  function printPage(){window.print()}

  window.PROVE = {
    pickRole,studentContinue,studentRegister,studentLogin,teacherRegister,emailLogin,logout,goMainLogin,
    renderOwner,renderTeacher,renderStudent,createClass,selectClass,toggleUnit,openStudent,deleteStudent,setStudentTab,setTeacherTab,openStudentTool,editStudentName,startTraining,startRemedial,choose,goQ,toggleFlag,prevQ,nextQ,explainMyMistake,copyStudentLink,showClassQR,closeClassQR,
    startClassMode,toggleClassPause,revealClassAnswer,classPrev,classNext,exitClassMode,
    downloadStudentPDF,downloadStudentExcel,exportClassPDF,exportClassExcel,exportTeacherCSV,exportOwnerCSV,printPage
  };
  boot();
})();
