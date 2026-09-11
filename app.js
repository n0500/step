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
    return `
      <header class="appbar">
        <div class="brand"><div class="logo">PI</div><div><strong>PROVE IT | STEP Training Lab</strong><small>${esc(title)}</small></div></div>
        <div class="nav-actions">
          ${state.profile?`<span>${esc(state.profile.displayName||state.profile.name||state.profile.role)}</span><button class="btn btn-outline" onclick="PROVE.logout()">Logout</button>`:""}
        </div>
      </header>
      ${content}`;
  }

  function renderLanding(){
    app.innerHTML = `
      <div class="auth-shell">
        <div class="card hero">
          <div class="eyebrow">Mega Goal 1 • STEP-style Training</div>
          <h1>PROVE IT | STEP Training Lab</h1>
          <p class="muted">Reading + Grammar practice, progress tracking, and teacher reports.</p>
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
            <div class="eyebrow">PROVE IT | Student Access</div>
            <h1>Welcome 👋</h1>
            <div class="class-badge">📘 ${esc(classObj.name||"Your Class")}</div>
            ${classObj.school?`<p class="muted">${esc(classObj.school)}</p>`:""}
          </div>
          <div class="form-grid">
            <div class="field"><label>Full name / الاسم الكامل</label><input id="stName" autocomplete="name"></div>
            <div class="field"><label>PIN (4 digits)</label><input id="stPin" type="password" inputmode="numeric" maxlength="4" autocomplete="current-password"></div>
          </div>
          <div class="quick-entry-note">Use the same name and PIN every time. If this is your first visit, your profile is created automatically.</div>
          <button class="btn btn-primary" style="width:100%;margin-top:14px" onclick="PROVE.studentContinue('${esc(classCode)}')">Continue</button>
          <div style="text-align:center;margin-top:14px"><button class="btn btn-secondary" onclick="PROVE.goMainLogin()">Teacher / Owner login</button></div>
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
        await state.fb.auth.signInWithEmailAndPassword(c.email,c.password);
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


  function studentTabs(){
    const items=[
      ["home","🏠 Home"],
      ["practice","📝 Practice"],
      ["progress","📈 Progress"],
      ["results","✓ Results"],
      ["profile","👤 Profile"]
    ];
    return `<nav class="role-tabs">${items.map(([id,label])=>`<button class="role-tab ${state.studentTab===id?"active":""}" onclick="PROVE.setStudentTab('${id}')">${label}</button>`).join("")}</nav>`;
  }

  function teacherTabs(){
    const items=[
      ["home","🏠 Home"],
      ["classes","👥 Classes"],
      ["classmode","🖥️ Class Mode"],
      ["reports","📊 Reports"],
      ["profile","👤 Profile"]
    ];
    return `<nav class="role-tabs">${items.map(([id,label])=>`<button class="role-tab ${state.teacherTab===id?"active":""}" onclick="PROVE.setTeacherTab('${id}')">${label}</button>`).join("")}</nav>`;
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
  async function teacherHome(classes,cls){
    if(!cls)return `<div class="report-head"><div><div class="eyebrow">Teacher Dashboard</div><h1>${esc(state.profile.displayName)}</h1></div><button class="btn btn-success" onclick="PROVE.createClass()">+ Create Class</button></div><div class="notice">Create your first class to begin.</div>`;
    const r=await classReportData(cls.id),open=openUnitsForClass(cls),current=open[open.length-1],weak=skillStats(r.attempts)[0];
    return `<div class="report-head"><div><div class="eyebrow">Teacher Dashboard</div><h1>${esc(state.profile.displayName)}</h1><p class="muted">${esc(state.profile.school||"")}</p></div><button class="btn btn-success" onclick="PROVE.createClass()">+ Create Class</button></div>
      <div class="card"><div class="form-grid">${classSelect(classes)}<div class="field"><label>Current Open Unit</label><input readonly value="${current?`Unit ${current.number}: ${current.title}`:"-"}"></div></div></div>
      <div class="grid grid-4"><div class="card kpi"><div class="num">${r.students.length}</div><div class="label">Students</div></div><div class="card kpi"><div class="num">${r.completion}%</div><div class="label">Completion</div></div><div class="card kpi"><div class="num">${r.readingAvg}%</div><div class="label">Reading</div></div><div class="card kpi"><div class="num">${r.grammarAvg}%</div><div class="label">Grammar</div></div></div>
      <div class="grid grid-2"><div class="card"><h2>Class Needs</h2>${renderNeeds(r.attempts)}</div><div class="card"><h2>Quick Insight</h2>${weak?`<p class="auto-message"><strong>${esc(weak.skill)}</strong> is currently the lowest skill at <strong>${weak.pct}%</strong>.</p>`:"<p class='muted'>Results will appear after students begin.</p>"}</div></div>`;
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
    const cards=classes.map(c=>`
      <div class="card">
        <div class="report-head">
          <div>
            <h2>${esc(c.name)}</h2>
            <p class="muted">Class Code: <strong>${esc(c.code)}</strong> • ${students.filter(s=>s.classId===c.id).length} students</p>
            <div class="share-actions">
              <button class="btn btn-primary" onclick="PROVE.copyStudentLink('${esc(c.code)}')">Copy Student Link</button>
              <button class="btn btn-secondary" onclick="PROVE.showClassQR('${esc(c.code)}','${esc(c.name).replace(/'/g,"&#39;")}')">Class QR</button>
            </div>
          </div>
          <button class="btn btn-secondary" onclick="PROVE.selectClass('${c.id}')">Select</button>
        </div>
        <h3>Unit Access</h3>
        ${DATA.units.map(u=>{
          const isOpen=(c.openUnits||["u1"]).includes(u.id),ready=(u.trainings||[]).length>0;
          return `<div class="lock-row">
            <div><strong>Unit ${u.number}: ${esc(u.title)}</strong><div class="mini-stat">${!ready?"Content not added yet":isOpen?"Available to students":"Hidden from students"}</div></div>
            <div><span class="pill ${isOpen&&ready?"open-chip":"locked-chip"}">${isOpen&&ready?"Open":"Locked"}</span>
            ${u.id!=="u1"&&ready?`<button class="btn btn-secondary" onclick="PROVE.toggleUnit('${c.id}','${u.id}',${!isOpen})">${isOpen?"Lock":"Open Unit"}</button>`:""}</div>
          </div>`;
        }).join("")}
      </div>`).join("");
    return `<div class="report-head">
      <div><div class="eyebrow">Classes</div><h1>Classes & Unit Access</h1><p class="muted">Share one class link or QR. Students do not need to type the class code.</p></div>
      <button class="btn btn-success" onclick="PROVE.createClass()">+ Create Class</button>
    </div>${cards||"<div class='notice'>No classes yet.</div>"}`;
  }
  function findRecommendedClassTraining(openUnits,attempts){
    const ordered=openUnits.flatMap(u=>u.trainings.map(t=>({...t,unitId:u.id})));if(!ordered.length)return null;let best=ordered[0],bestCount=Infinity;
    for(const t of ordered){const count=new Set(attempts.filter(a=>a.trainingId===t.id).map(a=>a.studentId)).size;if(count<bestCount){best=t;bestCount=count}}
    return best;
  }
  async function teacherClassMode(classes,cls){
    if(!cls)return `<h1>Class Mode</h1><div class="notice">Create a class first.</div>`;
    const open=openUnitsForClass(cls),r=await classReportData(cls.id),rec=findRecommendedClassTraining(open,r.attempts);
    const items=open.flatMap(u=>u.trainings.map(t=>`<div class="training-card"><div><h4>${t.type==="reading"?"📖":"✍️"} Unit ${u.number} • ${esc(t.title)}</h4><div class="muted">${esc(t.subtitle)}</div></div><button class="btn btn-primary" onclick="PROVE.startClassMode('${t.id}')">Start Class Mode</button></div>`)).join("");
    return `<div class="eyebrow">Class Mode</div><h1>Teach & Solve Together</h1><p class="muted">Class Mode never changes individual student scores.</p><div class="card"><div class="form-grid">${classSelect(classes)}<div class="field"><label>Recommended next</label><input readonly value="${rec?`${rec.type==="reading"?"Reading":"Grammar"} • ${rec.title}`:"-"}"></div></div></div>${rec?`<div class="next-step"><div class="eyebrow">Recommended Class Practice</div><h2>${esc(rec.title)}</h2><button class="btn btn-primary" onclick="PROVE.startClassMode('${rec.id}')">Start Recommended Practice</button></div>`:""}<div class="card"><h2>Open Unit Practices</h2>${items||"<p class='muted'>No open content.</p>"}</div>`;
  }
  async function teacherReports(classes,cls){
    if(!cls)return `<h1>Reports</h1><div class="notice">Create a class first.</div>`;
    const r=await classReportData(cls.id),rows=r.studentRows.map(s=>{const l=resultLevel(s.overall);return `<tr><td><button class="btn btn-secondary" onclick="PROVE.openStudent('${s.id}')">${esc(s.name)}</button></td><td>${s.completed}/${s.totalTrainings}</td><td>${s.reading||"-"}${s.reading?"%":""}</td><td>${s.grammar||"-"}${s.grammar?"%":""}</td><td>${s.overall||"-"}${s.overall?"%":""}</td><td><span class="result-badge ${l.cls}">${s.attempts?l.label:"No data"}</span></td></tr>`}).join("");
    return `<div class="report-head"><div><div class="eyebrow">Reports</div><h1>Class Results</h1></div><div><button class="btn btn-secondary" onclick="PROVE.exportClassPDF()">Export PDF</button><button class="btn btn-primary" onclick="PROVE.exportClassExcel()">Export Excel</button></div></div><div class="card"><div class="form-grid">${classSelect(classes)}<div class="field"><label>Class Code</label><input readonly value="${esc(cls.code)}"></div></div></div><div class="grid grid-2"><div class="card"><h2>Class Needs</h2>${renderNeeds(r.attempts)}</div><div class="card"><h2>Skill Performance</h2>${renderSkillBars(r.attempts)}</div></div><div class="card"><h2>Students</h2><div class="table-wrap"><table><thead><tr><th>Student</th><th>Completed</th><th>Reading</th><th>Grammar</th><th>Overall</th><th>Status</th></tr></thead><tbody>${rows||"<tr><td colspan='6'>No students yet.</td></tr>"}</tbody></table></div></div>`;
  }
  function teacherProfile(classes){return `<div class="eyebrow">Profile</div><h1>${esc(state.profile.displayName)}</h1><div class="card"><div class="form-grid"><div class="field"><label>Teacher</label><input readonly value="${esc(state.profile.displayName||"")}"></div><div class="field"><label>School</label><input readonly value="${esc(state.profile.school||"")}"></div><div class="field"><label>Classes</label><input readonly value="${classes.length}"></div></div></div>`}

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
          <div class="no-print"><button class="btn btn-secondary" onclick="PROVE.setTeacherTab('reports')">← Back</button><button class="btn btn-secondary" onclick="PROVE.downloadStudentPDF('${s.id}')">Export PDF</button><button class="btn btn-primary" onclick="PROVE.downloadStudentExcel('${s.id}')">Export Excel</button></div>
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

  async function renderStudent(){
    const ctx=await buildStudentContext();let body="";
    if(state.studentTab==="home")body=studentHome(ctx);
    if(state.studentTab==="practice")body=studentPractice(ctx);
    if(state.studentTab==="progress")body=studentProgress(ctx);
    if(state.studentTab==="results")body=studentResults(ctx);
    if(state.studentTab==="profile")body=studentProfile(ctx);
    app.innerHTML=shell(`<main class="container">${studentTabs()}${body}</main>`,"Student");
  }
  function studentHome(ctx){
    const latest=latestPerTraining(ctx.attempts.filter(a=>a.trainingType!=="remedial")),reading=trainingTypeAverage(latest,"reading"),grammar=trainingTypeAverage(latest,"grammar"),overall=pctAverage(latest),available=ctx.openUnits.flatMap(u=>u.trainings),completed=new Set(ctx.attempts.filter(a=>a.trainingType!=="remedial").map(a=>a.trainingId)).size,completion=available.length?Math.round(Math.min(completed,available.length)/available.length*100):0,step=nextStudentStep(ctx);
    let next="";
    if(step.kind==="training")next=`<div class="next-step"><div class="eyebrow">Next Step</div><h2>Unit ${step.unit.number} • ${esc(step.training.title)}</h2><p>${esc(step.training.subtitle)}</p><button class="btn btn-primary" onclick="PROVE.startTraining('${step.training.id}')">Continue Learning</button></div>`;
    if(step.kind==="remedial")next=`<div class="next-step"><div class="eyebrow">Recommended Next</div><h2>Quick Review • Unit ${step.unit.number}</h2><p>Focus on: ${step.weak.slice(0,3).map(x=>esc(x.skill)).join(", ")}</p><button class="btn btn-primary" onclick="PROVE.startRemedial('${step.unit.id}')">Practice My Weak Skills</button></div>`;
    if(step.kind==="waiting")next=`<div class="next-step"><div class="eyebrow">Completed</div><h2>Unit ${step.unit.number} completed ✅</h2><p class="auto-message">The next unit will open soon.</p></div>`;
    return `<div><div class="eyebrow">My Dashboard</div><h1>${esc(state.profile.displayName)}</h1><p class="muted">Class: ${esc(state.profile.classCode||"")}</p></div>${next}<div class="grid grid-4"><div class="card kpi"><div class="num">${completion}%</div><div class="label">Overall Progress</div></div><div class="card kpi"><div class="num">${reading}%</div><div class="label">Reading Level</div></div><div class="card kpi"><div class="num">${grammar}%</div><div class="label">Grammar Level</div></div><div class="card kpi"><div class="num">${overall}%</div><div class="label">Current Overall</div></div></div><div class="grid grid-2"><div class="card"><h2>My Skills</h2>${renderStudentSkillBars(latest)}</div><div class="card"><h2>What I Need</h2>${renderStudentNeeds(latest)}</div></div>`;
  }
  function studentPractice(ctx){
    const openSet=new Set(ctx.openUnits.map(u=>u.id));
    const cards=DATA.units.map(u=>{const ready=(u.trainings||[]).length>0,open=ready&&openSet.has(u.id);return `<div class="card unit-card ${open?"":"locked"}"><span class="pill ${open?"ok":"warn"}">${open?"Available":"🔒 Coming Soon"}</span><h3>Unit ${u.number}: ${esc(u.title)}</h3>${open?u.trainings.map(t=>{const at=latestAttemptFor(ctx.attempts,t.id);return `<div class="training-card"><div><h4>${t.type==="reading"?"📖":"✍️"} ${esc(t.title)}</h4><div class="muted">${esc(t.subtitle)}</div>${at?`<div class="pill">Latest: ${at.percentage}%</div>`:""}</div><button class="btn btn-primary" onclick="PROVE.startTraining('${t.id}')">${at?"Practice Again":"Start"}</button></div>`}).join(""):`<p class="muted">This unit is not open yet.</p>`}</div>`}).join("");
    return `<div class="eyebrow">Practice</div><h1>Training Library</h1><p class="muted">Choose any practice that is currently open.</p><div class="grid grid-2">${cards}</div>`;
  }
  function studentProgress(ctx){
    const cards=ctx.openUnits.map(u=>{const done=u.trainings.filter(t=>ctx.attempts.some(a=>a.trainingId===t.id)).length,p=Math.round(done/u.trainings.length*100);return `<div class="card progress-card"><div class="progress-head"><div><strong>Unit ${u.number}: ${esc(u.title)}</strong><div class="mini-stat">${done}/${u.trainings.length} core practices completed</div></div><strong>${p}%</strong></div><div class="progress-track"><div class="progress-value" style="width:${p}%"></div></div></div>`}).join("");
    const latest=latestPerTraining(ctx.attempts.filter(a=>a.trainingType!=="remedial"));return `<div class="eyebrow">Progress</div><h1>My Progress</h1><div class="grid grid-2">${cards}</div><div class="card"><h2>Current Skill Profile</h2>${renderStudentSkillBars(latest)}</div><div class="card"><h2>Recommended Focus</h2>${renderStudentNeeds(latest)}</div>`;
  }
  function studentResults(ctx){const rows=ctx.attempts.map(a=>{const l=resultLevel(a.percentage);return `<tr><td>${esc(a.trainingTitle)}</td><td>${esc(a.trainingType)}</td><td>${a.score}/${a.total} (${a.percentage}%)</td><td><span class="result-badge ${l.cls}">${l.label}</span></td><td>${fmtTime(a.elapsedSeconds)}</td><td>${new Date(a.submittedAt).toLocaleDateString()}</td></tr>`}).join("");return `<div class="eyebrow">Results</div><h1>My Results</h1><div class="card"><div class="table-wrap"><table><thead><tr><th>Training</th><th>Type</th><th>Score</th><th>Status</th><th>Time</th><th>Date</th></tr></thead><tbody>${rows||"<tr><td colspan='6'>No results yet.</td></tr>"}</tbody></table></div></div>`}
  function studentProfile(ctx){return `<div class="eyebrow">Profile</div><h1>My Profile</h1><div class="card"><div class="form-grid"><div class="field"><label>Name</label><input readonly value="${esc(state.profile.displayName||"")}"></div><div class="field"><label>Class Code</label><input readonly value="${esc(state.profile.classCode||"")}"></div><div class="field"><label>School</label><input readonly value="${esc(state.profile.school||"")}"></div></div></div>`}

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
    const review=t.questions.map((q,i)=>{const s=a.answers[i].selected;return `<div style="border-top:1px solid #edf1f4;padding:12px 0"><strong>Q${i+1}. ${esc(q.stem)}</strong><p class="${a.answers[i].correct?"status ok":"status bad"}">${a.answers[i].correct?"Correct":"Needs review"}</p><p>Your answer: ${s===null?"No answer":esc(q.choices[s])}</p>${a.answers[i].correct?"":`<p>Correct answer: <strong>${esc(q.choices[q.answer])}</strong></p>`}<p class="muted">${esc(q.explanation)}</p></div>`}).join("");
    app.innerHTML=shell(`<main class="container"><div class="report-head"><div><div class="eyebrow">My STEP Report</div><h1>${esc(t.title)}</h1><p class="muted">Unit ${t.unitNumber} • ${esc(t.type)}</p></div><div class="no-print"><button class="btn btn-secondary" onclick="PROVE.setStudentTab('home')">Back to My Dashboard</button></div></div>
      <div class="card"><div class="score">${a.score}/${a.total} <span style="font-size:22px">(${a.percentage}%)</span></div><p>Time used: ${fmtTime(a.elapsedSeconds)}</p></div>
      <div class="grid grid-2"><div class="card"><h2>Skill Breakdown</h2>${skills}</div><div class="card"><h2>What I Need</h2>${needs}</div></div>
      <div class="card"><h2>Review</h2>${review}</div></main>`,"Student Report");
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
        <h1>PROVE IT | Student Progress Report</h1>
        <div class="meta">
          <strong>Student / الطالبة:</strong> <span dir="auto">${esc(s.displayName)}</span><br>
          <strong>Class / الفصل:</strong> <span dir="auto">${esc(s.classCode||"")}</span><br>
          <strong>Overall average / المتوسط:</strong> ${avg}%
        </div>
        ${idx===0?`<div class="kpis">
          <div class="kpiBox"><strong>${attempts.length}</strong><span>Attempts</span></div>
          <div class="kpiBox"><strong>${avg}%</strong><span>Overall</span></div>
        </div>`:""}
        <h2>${idx===0?"Attempt History / سجل المحاولات":"Attempt History - continued"}</h2>
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
        <div class="footer">PROVE IT | STEP Training Lab</div>
      </div>
    `);

    pages.push(`
      ${pdfReportStyles()}
      <div class="report">
        <h1>Skill Profile / ملف المهارات</h1>
        <div class="meta"><strong>Student / الطالبة:</strong> <span dir="auto">${esc(s.displayName)}</span></div>
        ${skillRows.length?skillRows.map(x=>`
          <div class="skillRow">
            <div dir="auto">${esc(x.skill)}</div>
            <div class="bar"><div class="fill" style="width:${x.pct}%"></div></div>
            <div>${x.pct}%</div>
          </div>`).join(""):`<p>No skill data yet.</p>`}
        <div class="footer">PROVE IT | STEP Training Lab</div>
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
        <h1>PROVE IT | Class Report</h1>
        <div class="meta">
          <strong>Teacher / المعلمة:</strong> <span dir="auto">${esc(state.profile.displayName)}</span><br>
          <strong>Class / الفصل:</strong> <span dir="auto">${esc(r.cls.name)}</span>
          &nbsp;&nbsp; <strong>Code:</strong> ${esc(r.cls.code)}
        </div>
        ${idx===0?`<div class="kpis">
          <div class="kpiBox"><strong>${r.students.length}</strong><span>Students</span></div>
          <div class="kpiBox"><strong>${r.completion}%</strong><span>Completion</span></div>
          <div class="kpiBox"><strong>${r.readingAvg}%</strong><span>Reading</span></div>
          <div class="kpiBox"><strong>${r.grammarAvg}%</strong><span>Grammar</span></div>
        </div>`:""}
        <h2>${idx===0?"Students / الطالبات":"Students - continued"}</h2>
        <table>
          <thead>
            <tr><th>Student / الطالبة</th><th>Completed</th><th>Reading</th><th>Grammar</th><th>Overall</th><th>Last activity</th></tr>
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
        <div class="footer">PROVE IT | STEP Training Lab</div>
      </div>
    `);

    const stats=skillStats(r.attempts);
    pages.push(`
      ${pdfReportStyles()}
      <div class="report">
        <h1>Skill Performance / أداء المهارات</h1>
        <div class="meta">
          <strong>Class / الفصل:</strong> <span dir="auto">${esc(r.cls.name)}</span>
          &nbsp;&nbsp; <strong>Code:</strong> ${esc(r.cls.code)}
        </div>
        ${stats.length?stats.map(s=>`
          <div class="skillRow">
            <div dir="auto">${esc(s.skill)}</div>
            <div class="bar"><div class="fill" style="width:${s.pct}%"></div></div>
            <div>${s.pct}%</div>
          </div>`).join(""):`<p>No skill data yet.</p>`}
        <div class="footer">PROVE IT | STEP Training Lab</div>
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
      ["PROVE IT | Class Report",""],
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
      ["PROVE IT | Student Progress Report",""],
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
    renderOwner,renderTeacher,renderStudent,createClass,selectClass,toggleUnit,openStudent,setStudentTab,setTeacherTab,startTraining,startRemedial,choose,goQ,toggleFlag,prevQ,nextQ,copyStudentLink,showClassQR,closeClassQR,
    startClassMode,toggleClassPause,revealClassAnswer,classPrev,classNext,exitClassMode,
    downloadStudentPDF,downloadStudentExcel,exportClassPDF,exportClassExcel,exportTeacherCSV,exportOwnerCSV,printPage
  };
  boot();
})();
