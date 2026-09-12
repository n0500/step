(() => {
  "use strict";

  const PANEL_ID = "stepupArchivedClasses";
  const MODAL_ID = "stepupClassManagerModal";
  let panelBusy = false;
  let studentGuardBusy = false;
  let studentGuardTimer = null;

  function fb(){
    if(!window.firebase || !firebase.apps?.length) return null;
    return {auth:firebase.auth(), db:firebase.firestore()};
  }

  function esc(s=""){
    return String(s).replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]));
  }

  function parseArg(el, fnName){
    const src=el?.getAttribute("onclick")||"";
    const re=new RegExp(`PROVE\\.${fnName}\\('([^']+)'`);
    const m=src.match(re);
    return m?m[1]:"";
  }

  function injectStyles(){
    if(document.getElementById("stepupClassManagerStyles")) return;
    const style=document.createElement("style");
    style.id="stepupClassManagerStyles";
    style.textContent=`
      .class-manage-actions{display:flex;gap:8px;flex-wrap:wrap;align-items:center}
      .class-manage-btn{background:#fff;border:1px solid #cdd8e1;color:#17324d}
      .cm-overlay{position:fixed;inset:0;background:#102536b8;display:flex;align-items:center;justify-content:center;padding:18px;z-index:10000}
      .cm-modal{width:min(94vw,720px);max-height:90vh;overflow:auto;background:#fff;border-radius:20px;padding:24px;box-shadow:0 24px 70px #0005}
      .cm-head{display:flex;justify-content:space-between;gap:14px;align-items:flex-start;margin-bottom:16px}
      .cm-head h2{margin:4px 0 2px;color:#17324d}
      .cm-close{border:0;background:#eef2f5;border-radius:10px;width:40px;height:40px;font-size:20px;cursor:pointer}
      .cm-summary{display:flex;gap:8px;flex-wrap:wrap;margin:12px 0 18px}
      .cm-option-grid{display:grid;gap:12px}
      .cm-option{border:1px solid #dce4ea;border-radius:15px;padding:16px;background:#fbfdfe}
      .cm-option h3{margin:0 0 6px;color:#17324d}
      .cm-option p{margin:0 0 12px;color:#697985;line-height:1.55}
      .cm-option-danger{border-color:#edcccc;background:#fffafa}
      .cm-select{width:100%;padding:11px;border:1px solid #cbd6de;border-radius:9px;background:#fff;margin-bottom:10px}
      .cm-archive-panel{margin-top:20px;border-style:dashed}
      .cm-archive-row{display:flex;justify-content:space-between;gap:14px;align-items:center;padding:13px 0;border-top:1px solid #edf1f4}
      .cm-archive-row:first-of-type{border-top:0}
      .cm-archive-actions{display:flex;gap:8px;flex-wrap:wrap}
      @media(max-width:700px){.cm-modal{padding:18px}.cm-archive-row{align-items:flex-start;flex-direction:column}.cm-archive-actions{width:100%}.cm-archive-actions .btn{flex:1}.class-manage-actions .btn{flex:1}}
    `;
    document.head.appendChild(style);
  }

  function closeModal(){ document.getElementById(MODAL_ID)?.remove(); }

  async function teacherContext(){
    const F=fb();
    if(!F) throw new Error("Firebase is not available.");
    const user=F.auth.currentUser;
    if(!user) throw new Error("Please sign in as a teacher first.");
    const profileSnap=await F.db.collection("users").doc(user.uid).get();
    const profile=profileSnap.exists?profileSnap.data():null;
    if(!profile || profile.role!=="teacher") throw new Error("Only a teacher can manage classes.");
    return {F,user,profile};
  }

  async function getTeacherData(F,uid){
    const [classesSnap,studentsSnap,attemptsSnap,joinsSnap]=await Promise.all([
      F.db.collection("classes").where("teacherId","==",uid).get(),
      F.db.collection("users").where("teacherId","==",uid).get(),
      F.db.collection("attempts").where("teacherId","==",uid).get(),
      F.db.collection("joinCodes").where("teacherId","==",uid).get()
    ]);
    return {
      classes:classesSnap.docs.map(d=>({id:d.id,ref:d.ref,...d.data()})),
      students:studentsSnap.docs.map(d=>({id:d.id,ref:d.ref,...d.data()})).filter(x=>x.role==="student"),
      attempts:attemptsSnap.docs.map(d=>({id:d.id,ref:d.ref,...d.data()})),
      joins:joinsSnap.docs.map(d=>({id:d.id,ref:d.ref,...d.data()}))
    };
  }

  async function batchDelete(F,refs,chunk=400){
    for(let i=0;i<refs.length;i+=chunk){
      const batch=F.db.batch();
      refs.slice(i,i+chunk).forEach(ref=>batch.delete(ref));
      await batch.commit();
    }
  }

  async function batchUpdate(F,items,makeData,chunk=400){
    for(let i=0;i<items.length;i+=chunk){
      const batch=F.db.batch();
      items.slice(i,i+chunk).forEach(item=>batch.update(item.ref,makeData(item)));
      await batch.commit();
    }
  }

  async function selectNextClass(F,uid,excludedId=""){
    const snap=await F.db.collection("classes").where("teacherId","==",uid).get();
    const next=snap.docs.find(d=>d.id!==excludedId);
    if(window.PROVE?.selectClass) PROVE.selectClass(next?.id||"");
    else window.PROVE?.renderTeacher?.();
  }

  async function openManager(classId){
    try{
      injectStyles();
      const {F,user}=await teacherContext();
      const data=await getTeacherData(F,user.uid);
      const cls=data.classes.find(c=>c.id===classId);
      if(!cls) return alert("This class no longer exists.");
      const students=data.students.filter(s=>s.classId===classId);
      const attempts=data.attempts.filter(a=>a.classId===classId);
      const targets=data.classes.filter(c=>c.id!==classId);

      closeModal();
      const overlay=document.createElement("div");
      overlay.id=MODAL_ID;
      overlay.className="cm-overlay";
      overlay.innerHTML=`
        <div class="cm-modal">
          <div class="cm-head">
            <div><div class="eyebrow">Class Management</div><h2>${esc(cls.name||"Class")}</h2><div class="muted">Code: ${esc(cls.code||"")}</div></div>
            <button class="cm-close" type="button" aria-label="Close">×</button>
          </div>
          <div class="cm-summary"><span class="pill">${students.length} students</span><span class="pill">${attempts.length} attempts</span></div>
          <div class="cm-option-grid">
            <div class="cm-option">
              <h3>Archive Class</h3>
              <p>Hide the class and disable its links/QR while keeping students and results. You can restore it later.</p>
              <button class="btn btn-secondary" data-cm="archive">Archive Class</button>
            </div>
            <div class="cm-option">
              <h3>Move Students & Delete</h3>
              <p>Move this class into another class. Existing student logins keep working through the old class link, which becomes a redirect to the new class.</p>
              ${targets.length?`<select class="cm-select" id="cmMoveTarget">${targets.map(t=>`<option value="${t.id}">${esc(t.name)} (${esc(t.code||"")})</option>`).join("")}</select><button class="btn btn-primary" data-cm="move">Move Students & Delete</button>`:`<div class="notice">Create another class first if you want to move these students.</div>`}
            </div>
            <div class="cm-option cm-option-danger">
              <h3>Delete Class & Data</h3>
              <p>Permanently remove this class from StepUp together with its student profiles and saved attempts/results.</p>
              <button class="btn btn-danger" data-cm="delete">Delete Class & Data</button>
            </div>
          </div>
        </div>`;
      document.body.appendChild(overlay);
      overlay.querySelector(".cm-close")?.addEventListener("click",closeModal);
      overlay.addEventListener("click",e=>{if(e.target===overlay)closeModal();});
      overlay.querySelector('[data-cm="archive"]')?.addEventListener("click",()=>archiveClass(classId));
      overlay.querySelector('[data-cm="move"]')?.addEventListener("click",()=>moveAndDelete(classId,document.getElementById("cmMoveTarget")?.value||""));
      overlay.querySelector('[data-cm="delete"]')?.addEventListener("click",()=>deleteClassData(classId,false));
    }catch(e){
      console.error(e); alert(e?.message||String(e));
    }
  }

  async function archiveClass(classId){
    try{
      const {F,user}=await teacherContext();
      const data=await getTeacherData(F,user.uid);
      const cls=data.classes.find(c=>c.id===classId);
      if(!cls) throw new Error("Class not found.");
      if(!confirm(`Archive "${cls.name}"?\n\nStudents and results will be kept. Class links and QR access will be disabled until you restore it.`)) return;

      const joinDocs=data.joins.filter(j=>j.classId===classId);
      const archiveRef=F.db.collection("archivedClasses").doc(classId);
      const classRef=F.db.collection("classes").doc(classId);
      const archivedJoinCodes=joinDocs.map(j=>({id:j.id,data:{...j}})).map(x=>({id:x.id,data:Object.fromEntries(Object.entries(x.data).filter(([k])=>k!=="id"&&k!=="ref"))}));
      const classData=Object.fromEntries(Object.entries(cls).filter(([k])=>k!=="id"&&k!=="ref"));

      const batch=F.db.batch();
      batch.set(archiveRef,{...classData,archivedAt:new Date().toISOString(),archivedBy:user.uid,_archivedJoinCodes:archivedJoinCodes});
      batch.delete(classRef);
      joinDocs.forEach(j=>batch.delete(j.ref));
      await batch.commit();

      closeModal();
      alert(`"${cls.name}" archived. Student data and results were kept.`);
      await selectNextClass(F,user.uid,classId);
    }catch(e){console.error(e);alert("Could not archive the class: "+(e?.message||e));}
  }

  async function moveAndDelete(classId,targetId){
    try{
      if(!targetId) return alert("Choose the destination class first.");
      const {F,user}=await teacherContext();
      const data=await getTeacherData(F,user.uid);
      const source=data.classes.find(c=>c.id===classId);
      const target=data.classes.find(c=>c.id===targetId);
      if(!source||!target) throw new Error("Source or destination class was not found.");

      const students=data.students.filter(s=>s.classId===classId);
      const attempts=data.attempts.filter(a=>a.classId===classId);
      const joins=data.joins.filter(j=>j.classId===classId);

      const ok=confirm(`Move ${students.length} student(s) from "${source.name}" to "${target.name}" and delete the old class?\n\nTheir saved attempts will move with them. Existing student login links for the old class will continue to redirect to the new class.`);
      if(!ok) return;

      await batchUpdate(F,students,()=>({classId:targetId}));
      await batchUpdate(F,attempts,()=>({classId:targetId}));

      const finalBatch=F.db.batch();
      const aliasJoins=joins.length ? joins : (source.code ? [{id:source.code,ref:F.db.collection("joinCodes").doc(source.code),code:source.code}] : []);
      aliasJoins.forEach(j=>finalBatch.set(j.ref,{
        classId:targetId,
        className:target.name||"",
        code:j.code||j.id,
        teacherId:user.uid,
        school:target.school||"",
        openUnits:target.openUnits||["u1"],
        legacy:true,
        migratedFromClassId:classId,
        migratedAt:new Date().toISOString()
      }));
      finalBatch.delete(F.db.collection("classes").doc(classId));
      await finalBatch.commit();

      closeModal();
      alert(`Students moved to "${target.name}" and the old class was removed.`);
      if(window.PROVE?.selectClass) PROVE.selectClass(targetId); else window.PROVE?.renderTeacher?.();
    }catch(e){console.error(e);alert("Could not move the class: "+(e?.message||e));}
  }

  async function deleteClassData(classId,isArchived){
    try{
      const {F,user}=await teacherContext();
      const data=await getTeacherData(F,user.uid);
      let cls=data.classes.find(c=>c.id===classId);
      let archiveSnap=null;
      if(isArchived){
        archiveSnap=await F.db.collection("archivedClasses").doc(classId).get();
        if(!archiveSnap.exists) throw new Error("Archived class not found.");
        cls={id:classId,...archiveSnap.data()};
      }
      if(!cls) throw new Error("Class not found.");

      const students=data.students.filter(s=>s.classId===classId);
      const attempts=data.attempts.filter(a=>a.classId===classId);
      const joins=data.joins.filter(j=>j.classId===classId);

      const first=confirm(`Delete "${cls.name}" and its StepUp data?\n\nStudents: ${students.length}\nAttempts: ${attempts.length}\n\nThis cannot be undone.`);
      if(!first) return;
      const second=confirm("Final confirmation: permanently remove this class data from StepUp?");
      if(!second) return;

      await batchDelete(F,attempts.map(x=>x.ref));
      await batchDelete(F,students.map(x=>x.ref));
      await batchDelete(F,joins.map(x=>x.ref));

      const finalBatch=F.db.batch();
      if(isArchived) finalBatch.delete(F.db.collection("archivedClasses").doc(classId));
      else finalBatch.delete(F.db.collection("classes").doc(classId));
      await finalBatch.commit();

      closeModal();
      alert(`"${cls.name}" and its StepUp data were deleted.`);
      await selectNextClass(F,user.uid,classId);
    }catch(e){console.error(e);alert("Could not delete the class: "+(e?.message||e));}
  }

  async function restoreClass(classId){
    try{
      const {F,user}=await teacherContext();
      const ref=F.db.collection("archivedClasses").doc(classId);
      const snap=await ref.get();
      if(!snap.exists) throw new Error("Archived class not found.");
      const archived=snap.data();
      if(archived.teacherId!==user.uid) throw new Error("You do not have permission to restore this class.");

      const joins=Array.isArray(archived._archivedJoinCodes)?archived._archivedJoinCodes:[];
      for(const j of joins){
        const existing=await F.db.collection("joinCodes").doc(j.id).get();
        if(existing.exists) throw new Error(`Cannot restore because class code ${j.id} is already in use.`);
      }

      const classData=Object.fromEntries(Object.entries(archived).filter(([k])=>!["archivedAt","archivedBy","_archivedJoinCodes"].includes(k)));
      const batch=F.db.batch();
      batch.set(F.db.collection("classes").doc(classId),classData);
      if(joins.length){
        joins.forEach(j=>batch.set(F.db.collection("joinCodes").doc(j.id),j.data));
      }else if(classData.code){
        batch.set(F.db.collection("joinCodes").doc(classData.code),{
          classId,
          className:classData.name||"",
          code:classData.code,
          teacherId:user.uid,
          school:classData.school||"",
          openUnits:classData.openUnits||["u1"],
          createdAt:classData.createdAt||new Date().toISOString()
        });
      }
      batch.delete(ref);
      await batch.commit();
      alert(`"${classData.name||"Class"}" restored.`);
      if(window.PROVE?.selectClass) PROVE.selectClass(classId); else window.PROVE?.renderTeacher?.();
    }catch(e){console.error(e);alert("Could not restore the class: "+(e?.message||e));}
  }

  async function renderArchivedPanel(){
    if(panelBusy || document.getElementById(PANEL_ID)) return;
    const classesHeading=[...document.querySelectorAll("h1")].find(h=>(h.textContent||"").includes("Classes & Unit Access"));
    if(!classesHeading) return;
    panelBusy=true;
    try{
      const {F,user}=await teacherContext();
      const [archivedSnap,studentsSnap]=await Promise.all([
        F.db.collection("archivedClasses").where("teacherId","==",user.uid).get(),
        F.db.collection("users").where("teacherId","==",user.uid).get()
      ]);
      const archived=archivedSnap.docs.map(d=>({id:d.id,...d.data()}));
      if(!archived.length) return;
      const students=studentsSnap.docs.map(d=>d.data()).filter(x=>x.role==="student");
      const panel=document.createElement("div");
      panel.id=PANEL_ID;
      panel.className="card cm-archive-panel";
      panel.innerHTML=`<div class="eyebrow">Archived</div><h2>Archived Classes</h2><p class="muted">Archived classes are hidden and their student links are disabled, but their data is preserved.</p>${archived.map(c=>`<div class="cm-archive-row"><div><strong>${esc(c.name||"Class")}</strong><div class="mini-stat">Code: ${esc(c.code||"")} • ${students.filter(s=>s.classId===c.id).length} students</div></div><div class="cm-archive-actions"><button class="btn btn-secondary" data-restore="${c.id}">Restore</button><button class="btn btn-danger" data-delete-archived="${c.id}">Delete Data</button></div></div>`).join("")}`;
      const main=document.querySelector("main.container");
      main?.appendChild(panel);
      panel.querySelectorAll("[data-restore]").forEach(b=>b.addEventListener("click",()=>restoreClass(b.dataset.restore)));
      panel.querySelectorAll("[data-delete-archived]").forEach(b=>b.addEventListener("click",()=>deleteClassData(b.dataset.deleteArchived,true)));
    }catch(e){
      console.warn("Archived class panel unavailable",e);
    }finally{panelBusy=false;}
  }

  async function guardArchivedStudent(){
    if(studentGuardBusy) return;
    const F=fb();
    const user=F?.auth?.currentUser;
    if(!F || !user) return;
    studentGuardBusy=true;
    try{
      const profileSnap=await F.db.collection("users").doc(user.uid).get();
      if(!profileSnap.exists) return;
      const profile=profileSnap.data();
      if(profile.role!=="student" || !profile.classId) return;

      const activeSnap=await F.db.collection("classes").doc(profile.classId).get();
      const existingBlock=document.getElementById("stepupArchivedStudentBlock");
      if(activeSnap.exists){
        if(existingBlock && window.PROVE?.renderStudent) await PROVE.renderStudent();
        return;
      }

      const archivedSnap=await F.db.collection("archivedClasses").doc(profile.classId).get();
      if(!archivedSnap.exists) return;
      const archived=archivedSnap.data();
      const main=document.querySelector("main.container");
      if(!main || existingBlock) return;
      main.innerHTML=`<div id="stepupArchivedStudentBlock" class="card" style="max-width:720px;margin:42px auto;text-align:center;padding:34px">
        <div class="eyebrow">Class Archived</div>
        <h1 style="color:#17324d;margin-bottom:8px">${esc(archived.name||"Your Class")}</h1>
        <p class="muted" style="font-size:16px;line-height:1.7">This class is temporarily archived. Your saved results are safe, but practice is paused until your teacher restores the class.</p>
        <button class="btn btn-secondary" type="button" onclick="PROVE.logout()">Back to Login</button>
      </div>`;
    }catch(e){
      console.warn("Archived student guard unavailable",e);
    }finally{
      studentGuardBusy=false;
    }
  }

  function scheduleStudentGuard(delay=250){
    clearTimeout(studentGuardTimer);
    studentGuardTimer=setTimeout(guardArchivedStudent,delay);
  }

  function enhanceClassCards(){
    const classesHeading=[...document.querySelectorAll("h1")].find(h=>(h.textContent||"").includes("Classes & Unit Access"));
    if(!classesHeading) return;
    document.querySelectorAll('button[onclick*="PROVE.selectClass"]').forEach(selectBtn=>{
      const classId=parseArg(selectBtn,"selectClass");
      if(!classId) return;
      const card=selectBtn.closest(".card");
      if(!card || card.querySelector(`[data-manage-class="${classId}"]`)) return;
      let wrap=selectBtn.parentElement;
      if(!wrap?.classList.contains("class-manage-actions")){
        const newWrap=document.createElement("div");
        newWrap.className="class-manage-actions";
        selectBtn.parentNode.insertBefore(newWrap,selectBtn);
        newWrap.appendChild(selectBtn);
        wrap=newWrap;
      }
      const manage=document.createElement("button");
      manage.type="button";
      manage.className="btn class-manage-btn";
      manage.dataset.manageClass=classId;
      manage.textContent="Manage";
      manage.addEventListener("click",()=>openManager(classId));
      wrap.appendChild(manage);
    });
    renderArchivedPanel();
  }

  injectStyles();
  const observer=new MutationObserver(()=>{enhanceClassCards();scheduleStudentGuard();});
  observer.observe(document.body,{childList:true,subtree:true});
  window.addEventListener("DOMContentLoaded",()=>{enhanceClassCards();scheduleStudentGuard();});
  setTimeout(()=>{enhanceClassCards();scheduleStudentGuard();},250);
  setInterval(()=>scheduleStudentGuard(0),30000);
  try{firebase.auth().onAuthStateChanged(()=>scheduleStudentGuard(50));}catch(e){}

  window.StepUpClassManager={openManager,archiveClass,moveAndDelete,deleteClassData,restoreClass};
})();
