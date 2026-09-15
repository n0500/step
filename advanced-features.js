(() => {
  "use strict";

  const ADV = {
    profile: null,
    hubClassId: null,
    hubMode: "overview",
    smartSession: null,
    profilePromise: null
  };

  const $ = (sel, root=document) => root.querySelector(sel);
  const $$ = (sel, root=document) => [...root.querySelectorAll(sel)];
  const esc = (s="") => String(s).replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]));
  const nowISO = () => new Date().toISOString();
  const fmtDate = v => { try { return new Date(v).toLocaleDateString(); } catch { return ""; } };
  const fmtDateTime = v => { try { return new Date(v).toLocaleString(); } catch { return ""; } };
  const avg = arr => arr.length ? Math.round(arr.reduce((s,n)=>s+(Number(n)||0),0)/arr.length) : 0;
  const sortByDateDesc = (arr, key="createdAt") => [...arr].sort((a,b)=>String(b[key]||"").localeCompare(String(a[key]||"")));

  function fb(){
    if(!window.firebase || !firebase.apps?.length) return null;
    return {auth:firebase.auth(), db:firebase.firestore()};
  }

  async function getProfile(force=false){
    if(ADV.profile && !force) return ADV.profile;
    if(ADV.profilePromise && !force) return ADV.profilePromise;
    ADV.profilePromise=(async()=>{
      const F=fb();
      const user=F?.auth.currentUser;
      if(!F || !user) return null;
      const snap=await F.db.collection("users").doc(user.uid).get();
      ADV.profile=snap.exists?{id:snap.id,...snap.data()}:null;
      return ADV.profile;
    })();
    try{return await ADV.profilePromise;}finally{ADV.profilePromise=null;}
  }

  function injectStyles(){
    if($("#stepupAdvancedStyles")) return;
    const s=document.createElement("style");
    s.id="stepupAdvancedStyles";
    s.textContent=`
      .adv-wrap{max-width:1220px;margin:0 auto}.adv-head{display:flex;justify-content:space-between;gap:14px;align-items:flex-start;flex-wrap:wrap;margin-bottom:16px}.adv-subtabs{display:flex;gap:8px;flex-wrap:wrap;margin:10px 0 18px}.adv-subtab{border:1px solid #d9e4ef;background:#fff;color:#17324d;border-radius:999px;padding:9px 13px;font-weight:800;cursor:pointer}.adv-subtab.active{background:#173b63;color:#fff;border-color:#173b63}.adv-kpis{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px;margin-bottom:16px}.adv-kpi{background:#fff;border:1px solid #e3ebf3;border-radius:18px;padding:18px;box-shadow:0 8px 20px rgba(16,42,67,.05)}.adv-kpi strong{display:block;font-size:30px;color:#17324d}.adv-kpi span{font-size:12px;color:#66758a}.adv-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px}.adv-card{background:#fff;border:1px solid #e3ebf3;border-radius:18px;padding:18px;box-shadow:0 8px 20px rgba(16,42,67,.05);margin-bottom:16px}.adv-card h2,.adv-card h3{margin:0 0 10px;color:#17324d}.adv-row{display:flex;justify-content:space-between;gap:12px;align-items:center;padding:11px 0;border-bottom:1px solid #edf2f7}.adv-row:last-child{border-bottom:0}.adv-actions{display:flex;gap:8px;flex-wrap:wrap}.adv-input,.adv-select,.adv-textarea{width:100%;border:1px solid #cfdbe7;border-radius:12px;padding:11px 12px;background:#fff}.adv-textarea{min-height:110px;resize:vertical}.adv-label{display:block;font-size:12px;font-weight:900;color:#4b5f73;margin:0 0 5px}.adv-form-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}.adv-chip{display:inline-block;padding:4px 8px;border-radius:999px;background:#eef5ff;color:#214e7b;font-size:11px;font-weight:900}.adv-chip.good{background:#e9f7ef;color:#15803d}.adv-chip.warn{background:#fff4dd;color:#9a6700}.adv-chip.bad{background:#fdecec;color:#b42318}.adv-msg{border-radius:14px;padding:12px 14px;margin:8px 0;white-space:pre-wrap;line-height:1.55}.adv-msg.user{background:#eef5ff;margin-left:9%}.adv-msg.ai{background:#f6f8fa;margin-right:9%}.adv-empty{color:#66758a;padding:12px 0}.adv-modal-overlay{position:fixed;inset:0;background:#102536b8;display:flex;align-items:center;justify-content:center;padding:18px;z-index:12000}.adv-modal{width:min(94vw,800px);max-height:90vh;overflow:auto;background:#fff;border-radius:20px;padding:22px;box-shadow:0 24px 70px #0005}.adv-modal-head{display:flex;justify-content:space-between;gap:12px;align-items:flex-start}.adv-close{border:0;background:#eef2f5;border-radius:10px;width:40px;height:40px;font-size:20px;cursor:pointer}.adv-achievement{display:flex;gap:12px;align-items:center;border:1px solid #e5edf4;border-radius:16px;padding:14px}.adv-achievement .icon{font-size:28px}.adv-progress{height:9px;background:#edf2f6;border-radius:999px;overflow:hidden}.adv-progress>div{height:100%;background:#2f7784}.adv-rubric-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px}.adv-rubric{border:1px solid #e4eaf0;border-radius:14px;padding:12px;text-align:center}.adv-rubric strong{display:block;font-size:24px;color:#17324d}.adv-parent-shell{max-width:760px;margin:42px auto;padding:0 18px}.adv-parent-card{background:#fff;border:1px solid #e3ebf3;border-radius:22px;padding:24px;box-shadow:0 14px 34px rgba(16,42,67,.08)}.adv-parent-metric{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}.adv-parent-metric>div{background:#f8fbfe;border-radius:14px;padding:14px;text-align:center}.adv-parent-metric strong{display:block;font-size:26px;color:#17324d}.adv-writing-extra{display:flex;gap:8px;flex-wrap:wrap;margin-top:10px}.adv-writing-btn{border:1px solid #d8e3ec;background:#fff;border-radius:999px;padding:9px 12px;font-weight:800;color:#17324d;cursor:pointer}.adv-offtrack{font-size:12px;color:#9a6700}.adv-weekly-box{background:linear-gradient(135deg,#f8fbff,#f4fffb);border:1px solid #dceaf5;border-radius:18px;padding:18px}.adv-list{margin:0;padding-left:20px}.adv-list li{margin:7px 0}.adv-table{width:100%;border-collapse:separate;border-spacing:0}.adv-table th,.adv-table td{padding:10px;border-bottom:1px solid #edf2f7;text-align:left;font-size:13px}.adv-table th{background:#f8fbfe;color:#4b5f73}.adv-parent-role{grid-column:auto}.adv-hidden{display:none!important}
      @media(max-width:900px){.adv-kpis,.adv-grid,.adv-form-grid,.adv-rubric-grid{grid-template-columns:1fr 1fr}.adv-parent-metric{grid-template-columns:1fr 1fr}}
      @media(max-width:650px){.adv-kpis,.adv-grid,.adv-form-grid,.adv-rubric-grid,.adv-parent-metric{grid-template-columns:1fr}.adv-row{align-items:flex-start;flex-direction:column}.adv-actions{width:100%}.adv-actions .btn{flex:1}.auth-role:has(.adv-parent-role){grid-template-columns:1fr 1fr!important}}
    `;
    document.head.appendChild(s);
  }

  async function getTeacherClasses(uid){
    const F=fb(); if(!F)return[];
    const s=await F.db.collection("classes").where("teacherId","==",uid).get();
    return s.docs.map(d=>({id:d.id,...d.data()})).filter(x=>!x.archived);
  }
  async function getTeacherStudents(uid){
    const F=fb(); if(!F)return[];
    const s=await F.db.collection("users").where("teacherId","==",uid).get();
    return s.docs.map(d=>({id:d.id,...d.data()})).filter(x=>x.role==="student");
  }
  async function getTeacherAttempts(uid){
    const F=fb(); if(!F)return[];
    const s=await F.db.collection("attempts").where("teacherId","==",uid).get();
    return s.docs.map(d=>({id:d.id,...d.data()}));
  }
  async function getTeacherCollection(name, uid){
    const F=fb(); if(!F)return[];
    const s=await F.db.collection(name).where("teacherId","==",uid).get();
    return s.docs.map(d=>({id:d.id,...d.data()}));
  }
  async function getStudentCollection(name, uid){
    const F=fb(); if(!F)return[];
    const s=await F.db.collection(name).where("studentId","==",uid).get();
    return s.docs.map(d=>({id:d.id,...d.data()}));
  }
  async function getClassAssignments(classId){
    const F=fb(); if(!F)return[];
    const s=await F.db.collection("assignments").where("classId","==",classId).get();
    return s.docs.map(d=>({id:d.id,...d.data()})).filter(x=>x.status!=="closed");
  }

  function latestPerTraining(attempts){
    const m={};
    sortByDateDesc(attempts,"submittedAt").forEach(a=>{if(!m[a.trainingId])m[a.trainingId]=a;});
    return Object.values(m);
  }
  function typeAvg(attempts,type){return avg(latestPerTraining(attempts).filter(a=>a.trainingType===type).map(a=>a.percentage));}
  function overallAvg(attempts){return avg(latestPerTraining(attempts).map(a=>a.percentage));}

  function skillStats(attempts){
    const m={};
    attempts.forEach(a=>(a.answers||[]).forEach(x=>{
      const k=x.skill||"Other"; m[k]??={ok:0,total:0,wrong:0,units:{}};
      m[k].total++; if(x.correct)m[k].ok++; else {m[k].wrong++;const unitId=x.sourceUnitId||a.unitId||"";if(unitId)m[k].units[unitId]=(m[k].units[unitId]||0)+1;}
    }));
    return Object.entries(m).map(([skill,v])=>({skill,...v,pct:v.total?Math.round(v.ok/v.total*100):0})).sort((a,b)=>a.pct-b.pct);
  }
  function topUnitForSkill(stat){
    const entries=Object.entries(stat?.units||{}).sort((a,b)=>b[1]-a[1]);
    return entries[0]?.[0]||"u1";
  }
  function studentRows(students,attempts){
    return students.map(s=>{
      const a=attempts.filter(x=>x.studentId===s.id);
      const latest=latestPerTraining(a);
      return {student:s,attempts:a,overall:avg(latest.map(x=>x.percentage)),reading:avg(latest.filter(x=>x.trainingType==="reading").map(x=>x.percentage)),grammar:avg(latest.filter(x=>x.trainingType==="grammar").map(x=>x.percentage)),last:sortByDateDesc(a,"submittedAt")[0]?.submittedAt||""};
    });
  }

  function preserveRoleNav(customTabId){
    const main=$("main.container");
    if(!main)return null;
    const nav=$(".role-tabs",main);
    if(!nav)return null;
    const navClone=nav;
    [...main.children].forEach(ch=>{if(ch!==navClone)ch.remove();});
    const studentMode=navClone.dataset.role==="student";
    $$(".role-tab",navClone).forEach(b=>b.classList.toggle("active",studentMode?b.dataset.studentTab==="tools":b.id===customTabId));
    const host=document.createElement("section"); host.className=studentMode?"adv-wrap student-view student-tool-view":"adv-wrap"; main.appendChild(host); return host;
  }

  async function renderTeacherHub(mode=ADV.hubMode){
    ADV.hubMode=mode;
    const profile=await getProfile(); if(!profile||profile.role!=="teacher")return;
    const host=preserveRoleNav("stepupTeachingHubTab"); if(!host)return;
    host.innerHTML=`<div class="adv-card"><div class="adv-empty">Loading Teaching Hub…</div></div>`;
    const classes=await getTeacherClasses(profile.id);
    if(!ADV.hubClassId || !classes.some(c=>c.id===ADV.hubClassId))ADV.hubClassId=classes[0]?.id||null;
    const classOptions=classes.map(c=>`<option value="${c.id}" ${c.id===ADV.hubClassId?"selected":""}>${esc(c.name)} (${esc(c.code||"")})</option>`).join("");
    host.innerHTML=`
      <div class="adv-head"><div><div class="eyebrow">Teacher Workspace</div><h1>Teaching Hub</h1><p class="muted">Conversations, assignments, insights, notes, weekly reporting, and parent summaries.</p></div><div style="min-width:240px"><label class="adv-label">Class</label><select class="adv-select" id="advHubClass">${classOptions||"<option>No classes</option>"}</select></div></div>
      <div class="adv-subtabs">
        ${[["overview","🧠 Insights"],["conversations","💬 Conversations"],["assignments","📝 Assignments"],["notes","📋 Notes"],["weekly","🗓 Weekly Report"],["parents","👪 Parent View"]].map(([id,label])=>`<button class="adv-subtab ${mode===id?"active":""}" data-adv-mode="${id}">${label}</button>`).join("")}
      </div><div id="advHubBody"></div>`;
    $("#advHubClass")?.addEventListener("change",e=>{ADV.hubClassId=e.target.value;renderTeacherHub(mode);});
    $$('[data-adv-mode]').forEach(b=>b.addEventListener("click",()=>renderTeacherHub(b.dataset.advMode)));
    if(mode==="overview")await renderTeacherOverview(profile,classes);
    if(mode==="conversations")await renderTeacherConversations(profile);
    if(mode==="assignments")await renderTeacherAssignments(profile,classes);
    if(mode==="notes")await renderTeacherNotes(profile);
    if(mode==="weekly")await renderWeeklyReport(profile,classes);
    if(mode==="parents")await renderParentLinks(profile,classes);
  }

  async function renderTeacherOverview(profile,classes){
    const body=$("#advHubBody"); if(!body)return;
    const [studentsAll,attemptsAll,writingAll]=await Promise.all([getTeacherStudents(profile.id),getTeacherAttempts(profile.id),getTeacherCollection("writingHistory",profile.id)]);
    const students=studentsAll.filter(s=>s.classId===ADV.hubClassId);
    const attempts=attemptsAll.filter(a=>a.classId===ADV.hubClassId);
    const rows=studentRows(students,attempts);
    const skills=skillStats(attempts);
    const weakest=skills[0];
    const cutoff=Date.now()-7*24*60*60*1000;
    const weekly=attempts.filter(a=>new Date(a.submittedAt||a.createdAt||0).getTime()>=cutoff);
    const active=new Set(weekly.map(a=>a.studentId)).size;
    const noActivity=rows.filter(r=>!r.last).map(r=>r.student.displayName);
    const needs=rows.filter(r=>r.attempts.length&&r.overall<60).sort((a,b)=>a.overall-b.overall).slice(0,5);
    const strong=rows.filter(r=>r.overall>=80).sort((a,b)=>b.overall-a.overall).slice(0,5);
    const writing=writingAll.filter(w=>w.classId===ADV.hubClassId && w.rubric);
    const writingPriority={}; writing.forEach(w=>{const p=w.rubric?.priority; if(p)writingPriority[p]=(writingPriority[p]||0)+1;});
    const topWriting=Object.entries(writingPriority).sort((a,b)=>b[1]-a[1])[0];
    body.innerHTML=`
      <div class="adv-kpis"><div class="adv-kpi"><strong>${students.length}</strong><span>Students</span></div><div class="adv-kpi"><strong>${overallAvg(attempts)}%</strong><span>Overall</span></div><div class="adv-kpi"><strong>${typeAvg(attempts,"reading")}%</strong><span>Reading</span></div><div class="adv-kpi"><strong>${typeAvg(attempts,"grammar")}%</strong><span>Grammar</span></div></div>
      <div class="adv-grid">
        <div class="adv-card"><h2>Common Errors</h2>${skills.length?skills.slice(0,6).map(s=>`<div class="adv-row"><div><strong>${esc(s.skill)}</strong><div class="muted">${s.wrong} incorrect response${s.wrong===1?"":"s"}</div></div><span class="adv-chip ${s.pct<60?"bad":s.pct<80?"warn":"good"}">${s.pct}%</span></div>`).join(""):"<div class='adv-empty'>No performance data yet.</div>"}${topWriting?`<div class="adv-row"><div><strong>Writing priority</strong><div class="muted">${esc(topWriting[0])}</div></div><span class="adv-chip warn">${topWriting[1]} draft(s)</span></div>`:""}${weakest?`<div class="adv-actions" style="margin-top:12px"><button class="btn btn-primary" id="advSmartReview">Assign Smart Review: ${esc(weakest.skill)}</button></div>`:""}</div>
        <div class="adv-card"><h2>Class Insights</h2><div class="adv-row"><div><strong>Needs support</strong><div class="muted">Below 60%</div></div><span class="adv-chip bad">${rows.filter(r=>r.attempts.length&&r.overall<60).length}</span></div><div class="adv-row"><div><strong>Developing</strong><div class="muted">60–79%</div></div><span class="adv-chip warn">${rows.filter(r=>r.overall>=60&&r.overall<80).length}</span></div><div class="adv-row"><div><strong>Mastered</strong><div class="muted">80%+</div></div><span class="adv-chip good">${rows.filter(r=>r.overall>=80).length}</span></div><div class="adv-row"><div><strong>Active this week</strong><div class="muted">Students with practice attempts</div></div><span class="adv-chip">${active}/${students.length}</span></div></div>
        <div class="adv-card"><h2>Students to Support</h2>${needs.length?needs.map(r=>`<div class="adv-row"><span>${esc(r.student.displayName)}</span><span class="adv-chip bad">${r.overall}%</span></div>`).join(""):"<div class='adv-empty'>No student is currently below 60%.</div>"}${noActivity.length?`<p class="muted" style="margin-top:12px"><strong>No activity yet:</strong> ${esc(noActivity.slice(0,6).join(", "))}${noActivity.length>6?"…":""}</p>`:""}</div>
        <div class="adv-card"><h2>Strong Performance</h2>${strong.length?strong.map(r=>`<div class="adv-row"><span>${esc(r.student.displayName)}</span><span class="adv-chip good">${r.overall}%</span></div>`).join(""):"<div class='adv-empty'>Mastery highlights will appear after more practice.</div>"}</div>
      </div>`;
    $("#advSmartReview")?.addEventListener("click",()=>createSmartReview(profile,weakest,classes.find(c=>c.id===ADV.hubClassId)));
  }

  async function createSmartReview(profile,skillStat,cls){
    if(!skillStat||!cls)return;
    const F=fb(); if(!F)return;
    const unitId=topUnitForSkill(skillStat);
    const unit=(window.PROVEIT_DATA?.units||[]).find(u=>u.id===unitId);
    const title=`Smart Review: ${skillStat.skill}`;
    await F.db.collection("assignments").add({teacherId:profile.id,classId:cls.id,className:cls.name||"",type:"remedial",title,prompt:`Targeted review for ${skillStat.skill} based on class performance.`,targetSkill:skillStat.skill,unitId,unitNumber:unit?.number||null,status:"active",createdAt:nowISO(),dueAt:""});
    alert("Smart Review assigned to the class.");
    renderTeacherHub("assignments");
  }

  async function renderTeacherConversations(profile){
    const body=$("#advHubBody"); if(!body)return;
    const messages=sortByDateDesc(await getTeacherCollection("assistantMessages",profile.id));
    const classMsgs=messages.filter(m=>!ADV.hubClassId||m.classId===ADV.hubClassId);
    const groups={};
    classMsgs.forEach(m=>{const k=`${m.studentId}|${m.assistantType}`;groups[k]??=[];groups[k].push(m);});
    const cards=Object.entries(groups).map(([key,arr])=>{const last=sortByDateDesc(arr)[0];return `<div class="adv-row"><div><strong>${esc(last.studentName||"Student")}</strong> <span class="adv-chip">${last.assistantType==="writing"?"Writing Coach":"MG1 Assistant"}</span><div class="muted">${esc((last.text||"").slice(0,110))}${(last.text||"").length>110?"…":""}</div><div class="muted" style="font-size:11px">${fmtDateTime(last.createdAt)}</div></div><button class="btn btn-secondary" data-open-conv="${esc(key)}">Open</button></div>`;}).join("");
    body.innerHTML=`<div class="adv-card"><div class="adv-head"><div><h2>Student Conversations</h2><p class="muted">MG1 Assistant and Writing Coach conversations for this class.</p></div><span class="adv-chip">${Object.keys(groups).length} thread(s)</span></div>${cards||"<div class='adv-empty'>No saved conversations yet.</div>"}</div>`;
    $$('[data-open-conv]').forEach(b=>b.addEventListener("click",()=>openConversation(groups[b.dataset.openConv]||[])));
  }

  function openConversation(messages){
    const sorted=[...messages].sort((a,b)=>String(a.createdAt||"").localeCompare(String(b.createdAt||"")));
    const first=sorted[0]||{};
    openModal(`<div class="adv-modal-head"><div><div class="eyebrow">${first.assistantType==="writing"?"Writing Coach":"MG1 Assistant"}</div><h2>${esc(first.studentName||"Student")}</h2></div><button class="adv-close" data-close-adv>×</button></div><div style="margin-top:14px">${sorted.map(m=>`<div class="adv-msg ${m.role==="user"?"user":"ai"}"><strong>${m.role==="user"?"Student":"Assistant"}</strong><div>${esc(m.text||"")}</div><div class="muted" style="font-size:10px;margin-top:5px">${fmtDateTime(m.createdAt)}</div></div>`).join("")}</div>`);
  }

  async function renderTeacherAssignments(profile,classes){
    const body=$("#advHubBody"); if(!body)return;
    const [assignments,subs]=await Promise.all([getTeacherCollection("assignments",profile.id),getTeacherCollection("assignmentSubmissions",profile.id)]);
    const list=sortByDateDesc(assignments).filter(a=>!ADV.hubClassId||a.classId===ADV.hubClassId);
    body.innerHTML=`
      <div class="adv-card"><h2>Create Assignment</h2><div class="adv-form-grid"><div><label class="adv-label">Class</label><select id="advAssignClass" class="adv-select">${classes.map(c=>`<option value="${c.id}" ${c.id===ADV.hubClassId?"selected":""}>${esc(c.name)}</option>`).join("")}</select></div><div><label class="adv-label">Type</label><select id="advAssignType" class="adv-select"><option value="writing">Writing</option><option value="general">General practice</option></select></div><div><label class="adv-label">Title</label><input id="advAssignTitle" class="adv-input" placeholder="e.g. Unit 2 Writing Task"></div><div><label class="adv-label">Due date</label><input id="advAssignDue" class="adv-input" type="date"></div></div><div style="margin-top:12px"><label class="adv-label">Instructions</label><textarea id="advAssignPrompt" class="adv-textarea" placeholder="What should students do?"></textarea></div><button id="advCreateAssignment" class="btn btn-primary" style="margin-top:12px">Create Assignment</button></div>
      <div class="adv-card"><h2>Assignments</h2>${list.length?list.map(a=>{const done=subs.filter(s=>s.assignmentId===a.id).length;return `<div class="adv-row"><div><strong>${esc(a.title)}</strong> <span class="adv-chip">${esc(a.type)}</span><div class="muted">${esc(a.prompt||"")}</div><div class="muted" style="font-size:11px">${a.dueAt?`Due ${esc(a.dueAt)} • `:""}${done} submission(s)</div></div><div class="adv-actions">${a.status==="closed"?`<span class="adv-chip">Closed</span>`:`<button class="btn btn-secondary" data-close-assignment="${a.id}">Close</button>`}<button class="btn btn-danger" data-delete-assignment="${a.id}">Delete</button></div></div>`;}).join(""):"<div class='adv-empty'>No assignments yet.</div>"}</div>`;
    $("#advCreateAssignment")?.addEventListener("click",()=>createAssignment(profile,classes));
    $$('[data-close-assignment]').forEach(b=>b.addEventListener("click",()=>updateAssignment(b.dataset.closeAssignment,{status:"closed"}))); 
    $$('[data-delete-assignment]').forEach(b=>b.addEventListener("click",()=>deleteAssignment(b.dataset.deleteAssignment)));
  }

  async function createAssignment(profile,classes){
    const F=fb(); if(!F)return;
    const classId=$("#advAssignClass")?.value; const cls=classes.find(c=>c.id===classId); const title=$("#advAssignTitle")?.value.trim(); const prompt=$("#advAssignPrompt")?.value.trim(); const type=$("#advAssignType")?.value||"general"; const dueAt=$("#advAssignDue")?.value||"";
    if(!classId||!title||!prompt)return alert("Enter the class, title, and instructions.");
    await F.db.collection("assignments").add({teacherId:profile.id,classId,className:cls?.name||"",type,title,prompt,dueAt,status:"active",createdAt:nowISO()});
    alert("Assignment created."); renderTeacherHub("assignments");
  }
  async function updateAssignment(id,data){const F=fb();if(!F)return;await F.db.collection("assignments").doc(id).update(data);renderTeacherHub("assignments");}
  async function deleteAssignment(id){if(!confirm("Delete this assignment?"))return;const F=fb();if(!F)return;await F.db.collection("assignments").doc(id).delete();renderTeacherHub("assignments");}

  async function renderTeacherNotes(profile){
    const body=$("#advHubBody"); if(!body)return;
    const [studentsAll,notesAll]=await Promise.all([getTeacherStudents(profile.id),getTeacherCollection("teacherNotes",profile.id)]);
    const students=studentsAll.filter(s=>!ADV.hubClassId||s.classId===ADV.hubClassId);
    const notes=sortByDateDesc(notesAll).filter(n=>!ADV.hubClassId||n.classId===ADV.hubClassId);
    body.innerHTML=`<div class="adv-grid"><div class="adv-card"><h2>Private Teacher Note</h2><label class="adv-label">Student</label><select id="advNoteStudent" class="adv-select">${students.map(s=>`<option value="${s.id}">${esc(s.displayName)}</option>`).join("")}</select><label class="adv-label" style="margin-top:12px">Note</label><textarea id="advNoteText" class="adv-textarea" placeholder="Private note — not visible to the student."></textarea><button id="advSaveNote" class="btn btn-primary" style="margin-top:12px">Save Note</button></div><div class="adv-card"><h2>Recent Notes</h2>${notes.length?notes.slice(0,20).map(n=>`<div class="adv-row"><div><strong>${esc(n.studentName||"Student")}</strong><div>${esc(n.text||"")}</div><div class="muted" style="font-size:11px">${fmtDateTime(n.createdAt)}</div></div><button class="btn btn-danger" data-delete-note="${n.id}">Delete</button></div>`).join(""):"<div class='adv-empty'>No private notes yet.</div>"}</div></div>`;
    $("#advSaveNote")?.addEventListener("click",()=>saveTeacherNote(profile,students));
    $$('[data-delete-note]').forEach(b=>b.addEventListener("click",()=>deleteTeacherNote(b.dataset.deleteNote)));
  }
  async function saveTeacherNote(profile,students){const F=fb();if(!F)return;const studentId=$("#advNoteStudent")?.value;const text=$("#advNoteText")?.value.trim();const s=students.find(x=>x.id===studentId);if(!s||!text)return alert("Choose a student and enter a note.");await F.db.collection("teacherNotes").add({teacherId:profile.id,studentId,classId:s.classId,studentName:s.displayName,text,createdAt:nowISO()});renderTeacherHub("notes");}
  async function deleteTeacherNote(id){if(!confirm("Delete this note?"))return;const F=fb();if(!F)return;await F.db.collection("teacherNotes").doc(id).delete();renderTeacherHub("notes");}

  async function renderWeeklyReport(profile,classes){
    const body=$("#advHubBody"); if(!body)return;
    const [studentsAll,attemptsAll,messagesAll,writingAll,subsAll]=await Promise.all([getTeacherStudents(profile.id),getTeacherAttempts(profile.id),getTeacherCollection("assistantMessages",profile.id),getTeacherCollection("writingHistory",profile.id),getTeacherCollection("assignmentSubmissions",profile.id)]);
    const students=studentsAll.filter(s=>s.classId===ADV.hubClassId); const cutoff=Date.now()-7*24*60*60*1000;
    const inWeek=v=>new Date(v||0).getTime()>=cutoff;
    const attempts=attemptsAll.filter(a=>a.classId===ADV.hubClassId&&inWeek(a.submittedAt));
    const messages=messagesAll.filter(m=>m.classId===ADV.hubClassId&&inWeek(m.createdAt));
    const writing=writingAll.filter(w=>w.classId===ADV.hubClassId&&inWeek(w.createdAt));
    const subs=subsAll.filter(s=>s.classId===ADV.hubClassId&&inWeek(s.completedAt||s.createdAt));
    const activeIds=new Set([...attempts.map(a=>a.studentId),...messages.map(m=>m.studentId),...writing.map(w=>w.studentId)]);
    const inactive=students.filter(s=>!activeIds.has(s.id)); const skills=skillStats(attempts);
    const cls=classes.find(c=>c.id===ADV.hubClassId);
    body.innerHTML=`<div class="adv-weekly-box"><div class="adv-head"><div><div class="eyebrow">Last 7 Days</div><h2>${esc(cls?.name||"Class")} Weekly Report</h2></div><button class="btn btn-secondary" id="advCopyWeekly">Copy Summary</button></div><div class="adv-kpis"><div class="adv-kpi"><strong>${activeIds.size}/${students.length}</strong><span>Active Students</span></div><div class="adv-kpi"><strong>${attempts.length}</strong><span>Practice Attempts</span></div><div class="adv-kpi"><strong>${overallAvg(attempts)}%</strong><span>Practice Average</span></div><div class="adv-kpi"><strong>${writing.length}</strong><span>Writing Drafts</span></div></div><div class="adv-grid"><div class="adv-card"><h3>Top Priority Skills</h3>${skills.length?skills.slice(0,5).map(s=>`<div class="adv-row"><span>${esc(s.skill)}</span><span class="adv-chip ${s.pct<60?"bad":"warn"}">${s.pct}%</span></div>`).join(""):"<div class='adv-empty'>No practice data this week.</div>"}</div><div class="adv-card"><h3>Participation</h3><div class="adv-row"><span>Assistant messages</span><span class="adv-chip">${messages.length}</span></div><div class="adv-row"><span>Completed assignments</span><span class="adv-chip">${subs.length}</span></div><div class="adv-row"><span>No activity</span><span class="adv-chip ${inactive.length?"warn":"good"}">${inactive.length}</span></div>${inactive.length?`<p class="muted">${esc(inactive.map(s=>s.displayName).slice(0,8).join(", "))}${inactive.length>8?"…":""}</p>`:""}</div></div></div>`;
    $("#advCopyWeekly")?.addEventListener("click",()=>copyText(buildWeeklyText(cls,students,activeIds,attempts,writing,skills,inactive,subs,messages)));
  }
  function buildWeeklyText(cls,students,activeIds,attempts,writing,skills,inactive,subs,messages){return `StepUp Weekly Report — ${cls?.name||"Class"}\nActive students: ${activeIds.size}/${students.length}\nPractice attempts: ${attempts.length}\nPractice average: ${overallAvg(attempts)}%\nWriting drafts: ${writing.length}\nAssistant messages: ${messages.length}\nCompleted assignments: ${subs.length}\nTop priority skills: ${skills.slice(0,3).map(s=>`${s.skill} ${s.pct}%`).join(", ")||"No data"}\nNo activity: ${inactive.map(s=>s.displayName).join(", ")||"None"}`;}

  async function renderParentLinks(profile,classes){
    const body=$("#advHubBody"); if(!body)return;
    const [studentsAll,viewsAll]=await Promise.all([getTeacherStudents(profile.id),getTeacherCollection("parentViews",profile.id)]);
    const students=studentsAll.filter(s=>!ADV.hubClassId||s.classId===ADV.hubClassId);
    body.innerHTML=`<div class="adv-card"><h2>Parent Read-only View</h2><p class="muted">Generate a private summary link. It shows progress only — never conversations or teacher notes.</p>${students.length?students.map(s=>{const v=viewsAll.find(x=>x.studentId===s.id);return `<div class="adv-row"><div><strong>${esc(s.displayName)}</strong><div class="muted">${v?`Last updated ${fmtDateTime(v.updatedAt)}`:"No parent link yet"}</div></div><div class="adv-actions"><button class="btn btn-primary" data-parent-link="${s.id}">${v?"Refresh & Copy Link":"Create Link"}</button>${v?`<button class="btn btn-danger" data-parent-revoke="${v.id}">Revoke</button>`:""}</div></div>`;}).join(""):"<div class='adv-empty'>No students in this class.</div>"}</div>`;
    $$('[data-parent-link]').forEach(b=>b.addEventListener("click",()=>generateParentLink(profile,students.find(s=>s.id===b.dataset.parentLink),classes,viewsAll)));
    $$('[data-parent-revoke]').forEach(b=>b.addEventListener("click",()=>revokeParentLink(b.dataset.parentRevoke)));
  }

  function randomCode(n=12){const chars="ABCDEFGHJKLMNPQRSTUVWXYZ23456789";let s="";for(let i=0;i<n;i++)s+=chars[Math.floor(Math.random()*chars.length)];return s;}
  async function generateParentLink(profile,student,classes,viewsAll){
    if(!student)return; const F=fb(); if(!F)return;
    const attempts=(await getTeacherAttempts(profile.id)).filter(a=>a.studentId===student.id);
    const latest=latestPerTraining(attempts); const skills=skillStats(attempts); const cls=classes.find(c=>c.id===student.classId);
    let view=viewsAll.find(v=>v.studentId===student.id); const code=view?.id||randomCode();
    const data={teacherId:profile.id,studentId:student.id,studentName:student.displayName,classId:student.classId,className:cls?.name||student.classCode||"",overall:avg(latest.map(a=>a.percentage)),reading:avg(latest.filter(a=>a.trainingType==="reading").map(a=>a.percentage)),grammar:avg(latest.filter(a=>a.trainingType==="grammar").map(a=>a.percentage)),attempts:attempts.length,strengths:[...skills].sort((a,b)=>b.pct-a.pct).slice(0,3).map(s=>`${s.skill} (${s.pct}%)`),focus:skills.slice(0,3).map(s=>`${s.skill} (${s.pct}%)`),updatedAt:nowISO()};
    await F.db.collection("parentViews").doc(code).set(data,{merge:true});
    const url=`${location.origin}${location.pathname}?parent=${encodeURIComponent(code)}`;
    await copyText(url,false); openModal(`<div class="adv-modal-head"><div><div class="eyebrow">Parent View</div><h2>${esc(student.displayName)}</h2></div><button class="adv-close" data-close-adv>×</button></div><p>Parent link copied.</p><div class="qr-link">${esc(url)}</div><p class="muted">This link contains a read-only progress summary. Revoke it at any time from Teaching Hub.</p>`);
  }
  async function revokeParentLink(id){if(!confirm("Revoke this parent link?"))return;const F=fb();if(!F)return;await F.db.collection("parentViews").doc(id).delete();renderTeacherHub("parents");}

  function renderWeeklyFocus(attempts){
    const recent=sortByDateDesc(attempts,"submittedAt").slice(0,10);
    const stats=skillStats(recent);
    const weak=stats.filter(x=>x.total>0&&x.pct<80).slice(0,2);
    if(!recent.length){
      return `<div class="adv-card weekly-focus-card"><div class="section-kicker">This week</div><h2>Weekly Focus</h2><p class="adv-empty">Complete your first practice to unlock a personalized weekly focus.</p></div>`;
    }
    if(!weak.length){
      return `<div class="adv-card weekly-focus-card"><div class="weekly-focus-head"><div><div class="section-kicker">This week</div><h2>Weekly Focus</h2><p class="muted">Your recent skills are holding at 80% or higher. Keep the momentum with timed mixed practice.</p></div><span class="adv-chip good">On track</span></div><div class="weekly-focus-footer"><span>Next step:</span><button class="text-link" onclick="window.PROVE?.setStudentTab('practice')">Take a timed Mini STEP Challenge →</button></div></div>`;
    }
    const focus=weak;
    return `<div class="adv-card weekly-focus-card"><div class="weekly-focus-head"><div><div class="section-kicker">This week</div><h2>Weekly Focus</h2><p class="muted">Review one clue, complete a short focused practice, then test yourself again.</p></div><span class="adv-chip">Personalized</span></div>
      <div class="weekly-focus-list">${focus.map(s=>{const unitId=topUnitForSkill(s);const safeSkill=encodeURIComponent(s.skill).replace(/'/g,"%27");return `<div class="weekly-focus-row"><div><strong>${esc(s.skill)}</strong><span>${s.pct}% current mastery</span></div><div class="weekly-focus-next"><small>Next step</small><b>Review the clue + 3 focused questions</b></div><button class="btn btn-secondary" onclick="window.PROVE?.reviewError('${esc(unitId)}','${safeSkill}')">Start Review</button></div>`}).join("")}</div>
      <div class="weekly-focus-footer"><span>Then:</span><button class="text-link" onclick="window.PROVE?.setStudentTab('practice')">Take a timed Mini STEP Challenge →</button></div>
    </div>`;
  }

  async function renderStudentGrowth(){
    const profile=await getProfile(); if(!profile||profile.role!=="student")return;
    const host=preserveRoleNav("stepupGrowthTab"); if(!host)return;
    host.innerHTML=`<div class="adv-card"><div class="adv-empty">Loading My Growth…</div></div>`;
    const F=fb(); if(!F)return;
    const [attempts,writing,goals,assignments,subs]=await Promise.all([
      getStudentCollection("attempts",profile.id),
      getStudentCollection("writingHistory",profile.id),
      getStudentCollection("studentGoals",profile.id),
      getClassAssignments(profile.classId),
      getStudentCollection("assignmentSubmissions",profile.id)
    ]);
    const coreAttempts=attempts.filter(a=>a.trainingType==="reading"||a.trainingType==="grammar");
    const latest=latestPerTraining(coreAttempts); const overall=avg(latest.map(a=>a.percentage)); const reading=avg(latest.filter(a=>a.trainingType==="reading").map(a=>a.percentage)); const grammar=avg(latest.filter(a=>a.trainingType==="grammar").map(a=>a.percentage));
    const goal=sortByDateDesc(goals,"updatedAt")[0]||null; const achievements=computeAchievements(attempts,writing,goal,{overall,reading,grammar}); const doneIds=new Set(subs.map(s=>s.assignmentId));
    const journey=studentJourneySummary(attempts,achievements,overall);
    host.innerHTML=`<div class="student-tool-breadcrumb"><button type="button" onclick="window.PROVE?.setStudentTab('tools')">Tools</button><span>›</span><strong>My Growth</strong></div>
      ${renderStudentJourneyHero(profile,journey)}
      ${renderWeeklyFocus(attempts)}
      <div class="adv-head student-growth-head"><div><div class="eyebrow">My Growth</div><h1>Your learning, in one place</h1><p class="muted">Goals, assignments, achievements, and writing history.</p></div></div>
      <div class="adv-grid"><div class="adv-card"><h2>My Goal</h2>${goal?renderGoal(goal,{overall,reading,grammar}):"<p class='adv-empty'>Set one clear target for yourself.</p>"}<div class="adv-form-grid"><div><label class="adv-label">Metric</label><select id="advGoalMetric" class="adv-select"><option value="overall">Overall</option><option value="reading">Reading</option><option value="grammar">Grammar</option></select></div><div><label class="adv-label">Target %</label><input id="advGoalTarget" class="adv-input" type="number" min="60" max="100" value="80"></div></div><button id="advSaveGoal" class="btn btn-primary" style="margin-top:12px">${goal?"Update Goal":"Set Goal"}</button></div>
      <div class="adv-card"><h2>Achievements</h2><div class="adv-grid">${achievements.map(a=>`<div class="adv-achievement"><div class="icon">${a.icon}</div><div><strong>${esc(a.title)}</strong><div class="muted">${esc(a.text)}</div></div></div>`).join("")||"<div class='adv-empty'>Your achievements will appear as you practice.</div>"}</div></div></div>
      <div class="adv-card"><h2>My Assignments</h2>${assignments.length?sortByDateDesc(assignments).map(a=>`<div class="adv-row"><div><strong>${esc(a.title)}</strong> <span class="adv-chip">${esc(a.type)}</span><div class="muted">${esc(a.prompt||"")}</div>${a.dueAt?`<div class="muted" style="font-size:11px">Due ${esc(a.dueAt)}</div>`:""}</div><div class="adv-actions">${doneIds.has(a.id)?`<span class="adv-chip good">Done ✓</span>`:`${a.type==="writing"?`<button class="btn btn-primary" data-open-writing="${a.id}">Open Writing Coach</button>`:a.type==="remedial"?`<button class="btn btn-primary" data-smart-start="${a.id}">Start Smart Review</button>`:""}<button class="btn btn-secondary" data-mark-done="${a.id}">Mark Done</button>`}</div></div>`).join(""):"<div class='adv-empty'>No active assignments.</div>"}</div>
      <div class="adv-card"><h2>Writing History</h2>${writing.length?sortByDateDesc(writing).slice(0,12).map((w,i)=>renderWritingHistory(w,i)).join(""):"<div class='adv-empty'>Your saved drafts and rubric checks will appear here.</div>"}</div>`;
    $("#advSaveGoal")?.addEventListener("click",()=>saveGoal(profile,goal));
    $$('[data-open-writing]').forEach(b=>b.addEventListener("click",()=>openWritingForAssignment(assignments.find(a=>a.id===b.dataset.openWriting))));
    $$('[data-mark-done]').forEach(b=>b.addEventListener("click",()=>markAssignmentDone(profile,assignments.find(a=>a.id===b.dataset.markDone))));
    $$('[data-smart-start]').forEach(b=>b.addEventListener("click",()=>startSmartAssignment(profile,assignments.find(a=>a.id===b.dataset.smartStart))));
  }


  function studentJourneySummary(attempts,achievements,overall){
    const now=new Date();
    const mondayIndex=(now.getDay()+6)%7;
    const start=new Date(now); start.setHours(0,0,0,0); start.setDate(start.getDate()-mondayIndex);
    const activeDays=new Set();
    attempts.forEach(a=>{
      const d=new Date(a.submittedAt||a.createdAt||0);
      if(!Number.isNaN(d.getTime())&&d>=start&&d<=now) activeDays.add(d.toLocaleDateString("en-CA"));
    });
    const days=Math.min(activeDays.size,7);
    const level=days>=5?"Diamond":days===4?"Gold":days===3?"Silver":days>=1?"Bronze":"Ready";
    const recent=sortByDateDesc(attempts,"submittedAt")[0]||null;
    const unitNumber=Number(recent?.unitNumber||0);
    const unitLabel=unitNumber?`Unit ${unitNumber}`:"Start your first unit";
    const growthScore=Math.min(5,Math.max(1,Math.ceil((Math.min(100,Number(overall||0))/100)*3)+Math.min(2,Math.floor((achievements?.length||0)/3))));
    const stages=["Start","Build","Advance","Strong","Peak"];
    return {days,level,unitLabel,growthStage:growthScore,growthLabel:stages[growthScore-1]||"Start",overall:Number(overall||0)};
  }

  function renderStudentJourneyHero(profile,j){
    const labels=["Start","Build","Advance","Strong","Peak"];
    const steps=labels.map((label,i)=>`<div class="journey-step ${i<j.growthStage?"active":""} ${i===j.growthStage-1?"current":""}">
      <span class="journey-step-node">${i+1}</span><small>${label}</small>
    </div>`).join("");
    return `<section class="stepup-journey-hero">
      <div class="journey-hero-top">
        <div>
          <div class="journey-hero-kicker">My StepUp Path</div>
          <h1>${esc(profile.displayName||"Student")}</h1>
          <p>${esc(j.unitLabel)} • Keep moving forward, one step at a time.</p>
        </div>
        <div class="journey-hero-mark journey-stepup-mark" aria-hidden="true"><span>STEP</span><strong>UP</strong></div>
      </div>
      <div class="journey-current-level"><span>Current level</span><strong>Level ${j.growthStage} · ${esc(j.growthLabel)}</strong></div>
      <div class="journey-hero-stats">
        <div><span>Weekly level</span><strong>${esc(j.level)}</strong></div>
        <div><span>Active days</span><strong>${j.days}/5</strong></div>
        <div><span>StepUp level</span><strong>${j.growthStage}/5</strong></div>
      </div>
      <div class="journey-path-strip">
        <div class="journey-path-head"><span>StepUp Path</span><strong>${esc(j.growthLabel)}</strong></div>
        <div class="journey-step-track">${steps}</div>
      </div>
    </section>`;
  }

  function renderGoal(goal,scores){const current=Number(scores[goal.metric]||0),target=Number(goal.target||80),pct=Math.min(100,Math.round(current/target*100));return `<div style="margin-bottom:14px"><div class="adv-row"><strong>${esc(goal.metric)} target</strong><span class="adv-chip ${current>=target?"good":"warn"}">${current}% / ${target}%</span></div><div class="adv-progress"><div style="width:${pct}%"></div></div></div>`;}
  async function saveGoal(profile,goal){const F=fb();if(!F)return;const metric=$("#advGoalMetric")?.value||"overall";const target=Math.max(60,Math.min(100,Number($("#advGoalTarget")?.value||80)));const ref=goal?F.db.collection("studentGoals").doc(goal.id):F.db.collection("studentGoals").doc();await ref.set({studentId:profile.id,studentName:profile.displayName,teacherId:profile.teacherId,classId:profile.classId,metric,target,status:"active",createdAt:goal?.createdAt||nowISO(),updatedAt:nowISO()},{merge:true});renderStudentGrowth();}

  function computeAchievements(attempts,writing,goal,scores){const out=[];if(attempts.length>=1)out.push({icon:"🚀",title:"First Step",text:"Completed the first StepUp practice."});if(attempts.length>=5)out.push({icon:"⭐",title:"Practice 5",text:"Completed at least five practice attempts."});if(scores.reading>=80)out.push({icon:"📖",title:"Reading Mastery",text:"Reading performance reached 80% or higher."});if(scores.grammar>=80)out.push({icon:"✍️",title:"Grammar Mastery",text:"Grammar performance reached 80% or higher."});const rubrics=sortByDateDesc(writing).filter(w=>w.rubric?.total!=null);if(rubrics.length>=2){const newest=Number(rubrics[0].rubric.total||0),oldest=Number(rubrics[rubrics.length-1].rubric.total||0);if(newest>oldest)out.push({icon:"📈",title:"Writing Growth",text:`Writing rubric improved from ${oldest} to ${newest}.`});}if(goal&&Number(scores[goal.metric]||0)>=Number(goal.target||100))out.push({icon:"🎯",title:"Goal Getter",text:"Reached the current learning goal."});const days=new Set(attempts.map(a=>String(a.submittedAt||"").slice(0,10)).filter(Boolean));if(days.size>=3)out.push({icon:"🔥",title:"Active Learner",text:"Practiced on three or more different days."});return out;}

  function renderWritingHistory(w,i){const r=w.rubric;return `<div class="adv-row"><div style="flex:1"><strong>${r?`Rubric Check ${i+1}`:`Draft ${i+1}`}</strong><div class="muted">${esc((w.draft||"").slice(0,160))}${(w.draft||"").length>160?"…":""}</div><div class="muted" style="font-size:11px">${fmtDateTime(w.createdAt)}</div>${r?`<div class="adv-rubric-grid" style="margin-top:10px"><div class="adv-rubric"><strong>${r.organization??"-"}</strong><span>Organization</span></div><div class="adv-rubric"><strong>${r.grammar??"-"}</strong><span>Grammar</span></div><div class="adv-rubric"><strong>${r.vocabulary??"-"}</strong><span>Vocabulary</span></div><div class="adv-rubric"><strong>${r.mechanics??"-"}</strong><span>Mechanics</span></div></div><p class="muted"><strong>Total:</strong> ${r.total??"-"}/100 • <strong>Priority:</strong> ${esc(r.priority||"")}</p>`:""}</div></div>`;}

  async function markAssignmentDone(profile,a){if(!a)return;const F=fb();if(!F)return;const existing=(await getStudentCollection("assignmentSubmissions",profile.id)).find(s=>s.assignmentId===a.id);if(existing)return alert("Already marked as done.");await F.db.collection("assignmentSubmissions").add({assignmentId:a.id,assignmentTitle:a.title,studentId:profile.id,studentName:profile.displayName,teacherId:profile.teacherId,classId:profile.classId,status:"done",createdAt:nowISO(),completedAt:nowISO()});renderStudentGrowth();}
  function openWritingForAssignment(a){if(window.MG1Assistant?.openWritingCoach){window.MG1Assistant.openWritingCoach();setTimeout(()=>{const input=$("#writingInput");if(input){input.value=`Assignment: ${a.title}
${a.prompt}`;input.focus();}},250);return;}const tab=$("#mg1WritingTab");if(tab){tab.click();setTimeout(()=>{const input=$("#writingInput");if(input){input.value=`Assignment: ${a.title}
${a.prompt}`;input.focus();}},250);}else alert("Writing Coach is still loading. Try again in a moment.");}

  async function startSmartAssignment(profile,a){
    if(!a)return; const DATA=window.PROVEIT_DATA; if(!DATA)return alert("Training data is unavailable.");
    const unit=(DATA.units||[]).find(u=>u.id===a.unitId); let pool=[];
    const scan=unit?[unit]:(DATA.units||[]);
    scan.forEach(u=>(u.trainings||[]).forEach(t=>(t.questions||[]).forEach(q=>{if(!a.targetSkill||q.skill===a.targetSkill)pool.push({...q,unitId:u.id,unitNumber:u.number});})));
    if(!pool.length && a.unitId && window.PROVE?.startRemedial)return PROVE.startRemedial(a.unitId);
    if(!pool.length)return alert("No matching practice questions are available for this skill yet.");
    ADV.smartSession={assignment:a,profile,questions:pool.slice(0,3),index:0,answers:[]}; renderSmartQuestion();
  }
  function renderSmartQuestion(){const s=ADV.smartSession;if(!s)return;const q=s.questions[s.index];openModal(`<div class="adv-modal-head"><div><div class="eyebrow">Smart Remedial Practice</div><h2>${esc(s.assignment.targetSkill||s.assignment.title)}</h2><p class="muted">Question ${s.index+1} of ${s.questions.length}</p></div><button class="adv-close" data-close-adv>×</button></div><div style="font-size:20px;font-weight:800;margin:18px 0">${esc(q.stem)}</div>${(q.choices||[]).map((c,i)=>`<button class="choice" style="width:100%;text-align:left" data-smart-choice="${i}"><strong>${String.fromCharCode(65+i)}.</strong> ${esc(c)}</button>`).join("")}`);$$('[data-smart-choice]').forEach(b=>b.addEventListener("click",()=>chooseSmartAnswer(Number(b.dataset.smartChoice))));}
  async function chooseSmartAnswer(i){const s=ADV.smartSession;if(!s)return;const q=s.questions[s.index];s.answers.push({question:s.index+1,skill:q.skill,selected:i,correctAnswer:q.answer,correct:i===q.answer,need:q.need||""});if(s.index<s.questions.length-1){s.index++;renderSmartQuestion();return;}await finishSmartAssignment();}
  async function finishSmartAssignment(){const s=ADV.smartSession;if(!s)return;const F=fb();const score=s.answers.filter(a=>a.correct).length,total=s.questions.length,pct=Math.round(score/total*100);if(F){await F.db.collection("attempts").add({studentId:s.profile.id,studentName:s.profile.displayName,classId:s.profile.classId,classCode:s.profile.classCode,teacherId:s.profile.teacherId,trainingId:`smart-${s.assignment.id}`,trainingTitle:s.assignment.title,trainingType:"remedial",unitId:s.assignment.unitId||"",unitNumber:s.assignment.unitNumber||null,score,total,percentage:pct,elapsedSeconds:0,autoSubmitted:false,answers:s.answers,submittedAt:nowISO()});const existing=(await getStudentCollection("assignmentSubmissions",s.profile.id)).find(x=>x.assignmentId===s.assignment.id);if(!existing)await F.db.collection("assignmentSubmissions").add({assignmentId:s.assignment.id,assignmentTitle:s.assignment.title,studentId:s.profile.id,studentName:s.profile.displayName,teacherId:s.profile.teacherId,classId:s.profile.classId,status:"done",createdAt:nowISO(),completedAt:nowISO()});}ADV.smartSession=null;openModal(`<div class="adv-modal-head"><div><div class="eyebrow">Smart Review Complete</div><h2>${score}/${total} (${pct}%)</h2></div><button class="adv-close" data-close-adv>×</button></div><p>${pct>=80?"Strong work — this skill is looking much better.":"Review the feedback from your teacher and try the skill again later."}</p>`);}

  async function saveAssistantMessage(detail){
    const profile=await getProfile(); const F=fb(); if(!F||!profile||profile.role!=="student")return;
    if(!detail||!["user","ai"].includes(detail.role)||!String(detail.text||"").trim())return;
    const doc={studentId:profile.id,studentName:profile.displayName||"",teacherId:profile.teacherId,classId:profile.classId,classCode:profile.classCode||"",assistantType:detail.assistantType==="writing"?"writing":"mg1",role:detail.role,text:String(detail.text).slice(0,5000),createdAt:nowISO()};
    try{await F.db.collection("assistantMessages").add(doc);}catch(e){console.warn("Could not save assistant message",e);}
    if(doc.assistantType==="writing"&&doc.role==="user"&&looksLikeDraft(doc.text)){
      try{await F.db.collection("writingHistory").add({studentId:profile.id,studentName:profile.displayName||"",teacherId:profile.teacherId,classId:profile.classId,draft:doc.text,kind:"draft",createdAt:nowISO()});}catch(e){console.warn("Could not save writing draft",e);}
    }
  }
  function looksLikeDraft(text){const words=String(text||"").trim().split(/\s+/).filter(Boolean);return text.length>=90&&words.length>=14;}

  function injectWritingTools(){
    const tools=$(".mg1-writing-tools"); if(!tools||$("#advRubricBtn"))return;
    const wrap=document.createElement("div");wrap.className="adv-writing-extra";wrap.innerHTML=`<button class="adv-writing-btn" id="advRubricBtn">📊 Writing Rubric</button><button class="adv-writing-btn" id="advSaveDraftBtn">💾 Save Draft</button>`;tools.parentElement?.appendChild(wrap);
    $("#advRubricBtn")?.addEventListener("click",evaluateCurrentDraft);
    $("#advSaveDraftBtn")?.addEventListener("click",saveCurrentDraft);
  }
  function currentDraftText(){const typed=$("#writingInput")?.value.trim();if(typed)return typed;const users=$$("#writingMessages .mg1-msg.user");return users.length?users[users.length-1].textContent.trim():"";}
  async function saveCurrentDraft(){const text=currentDraftText();if(!looksLikeDraft(text))return alert("Paste or write a longer draft first.");const profile=await getProfile(),F=fb();if(!profile||!F)return;await F.db.collection("writingHistory").add({studentId:profile.id,studentName:profile.displayName||"",teacherId:profile.teacherId,classId:profile.classId,draft:text,kind:"draft",createdAt:nowISO()});alert("Draft saved to Writing History.");}
  async function evaluateCurrentDraft(){const draft=currentDraftText();if(!looksLikeDraft(draft))return alert("Paste or write a draft first.");if(!window.StepUpAI?.evaluateWriting)return alert("Writing Rubric is still loading. Try again in a moment.");const btn=$("#advRubricBtn");if(btn){btn.disabled=true;btn.textContent="Evaluating…";}try{const rubric=await window.StepUpAI.evaluateWriting(draft);const profile=await getProfile(),F=fb();if(profile&&F)await F.db.collection("writingHistory").add({studentId:profile.id,studentName:profile.displayName||"",teacherId:profile.teacherId,classId:profile.classId,draft,kind:"rubric",rubric,createdAt:nowISO()});openRubric(rubric,draft);}catch(e){console.error(e);alert("Could not evaluate the draft right now. Try again.");}finally{if(btn){btn.disabled=false;btn.textContent="📊 Writing Rubric";}}}
  function openRubric(r,draft){openModal(`<div class="adv-modal-head"><div><div class="eyebrow">Writing Rubric</div><h2>${r.total??"-"}/100</h2></div><button class="adv-close" data-close-adv>×</button></div><div class="adv-rubric-grid" style="margin:16px 0"><div class="adv-rubric"><strong>${r.organization??"-"}</strong><span>Organization /25</span></div><div class="adv-rubric"><strong>${r.grammar??"-"}</strong><span>Grammar /25</span></div><div class="adv-rubric"><strong>${r.vocabulary??"-"}</strong><span>Vocabulary /25</span></div><div class="adv-rubric"><strong>${r.mechanics??"-"}</strong><span>Mechanics /25</span></div></div><div class="adv-card"><strong>Priority</strong><p>${esc(r.priority||"Review one important area at a time.")}</p><strong>Coach feedback</strong><p>${esc(r.summary||"")}</p></div><p class="muted">Saved automatically in Writing History.</p>`);}

  async function openParentLogin(){const box=$("#authBox");if(!box)return;$$('.role-card').forEach(x=>x.classList.remove('active'));$(".adv-parent-role")?.classList.add("active");box.innerHTML=`<div style="margin-top:18px"><div class="field"><label>Parent access code / رمز ولي الأمر</label><input id="advParentCode" autocapitalize="characters"></div><button class="btn btn-primary" style="margin-top:12px" id="advParentOpen">Open Progress View</button><p class="muted" style="font-size:12px">Read-only progress summary. Conversations and teacher notes are never shown.</p></div>`;$("#advParentOpen")?.addEventListener("click",()=>loadParentView($("#advParentCode")?.value.trim().toUpperCase()));}
  async function loadParentView(code){if(!code)return alert("Enter the parent access code.");const F=fb();if(!F)return alert("Firebase is unavailable.");try{const d=await F.db.collection("parentViews").doc(code).get();if(!d.exists)return alert("Parent link not found or revoked.");renderParentView({id:d.id,...d.data()});}catch(e){console.error(e);alert("Could not open this parent view.");}}
  function renderParentView(v){const app=$("#app");if(!app)return;app.innerHTML=`<div class="adv-parent-shell"><div class="adv-parent-card"><div class="eyebrow">StepUp Parent View</div><h1>${esc(v.studentName||"Student Progress")}</h1><p class="muted">${esc(v.className||"")} • Updated ${fmtDateTime(v.updatedAt)}</p><div class="adv-parent-metric"><div><strong>${v.overall||0}%</strong><span>Overall</span></div><div><strong>${v.reading||0}%</strong><span>Reading</span></div><div><strong>${v.grammar||0}%</strong><span>Grammar</span></div></div><div class="adv-grid" style="margin-top:16px"><div class="adv-card"><h3>Strengths</h3>${(v.strengths||[]).length?`<ul class="adv-list">${v.strengths.map(x=>`<li>${esc(x)}</li>`).join("")}</ul>`:"<p class='adv-empty'>More practice is needed before strengths can be summarized.</p>"}</div><div class="adv-card"><h3>Recommended Focus</h3>${(v.focus||[]).length?`<ul class="adv-list">${v.focus.map(x=>`<li>${esc(x)}</li>`).join("")}</ul>`:"<p class='adv-empty'>No focus areas yet.</p>"}</div></div><div class="notice">This is a read-only learning summary. Student conversations and private teacher notes are not included.</div></div></div>`;}

  function injectParentRole(){const roles=$(".auth-role");if(!roles||$(".adv-parent-role"))return;const d=document.createElement("div");d.className="role-card adv-parent-role";d.innerHTML="<strong>Parent</strong><small>ولي الأمر</small>";d.addEventListener("click",openParentLogin);roles.appendChild(d);}

  async function injectRoleTabs(){
    const profile=await getProfile(); if(!profile)return;
    const nav=$(".role-tabs"); if(!nav)return;
    if(profile.role==="teacher"&&!$("#stepupTeachingHubTab")){
      const b=document.createElement("button");b.id="stepupTeachingHubTab";b.className="role-tab";b.textContent="🧠 Teaching Hub";b.addEventListener("click",()=>renderTeacherHub("overview"));nav.appendChild(b);
    }
  }

  function openModal(html){$("#stepupAdvModal")?.remove();const o=document.createElement("div");o.id="stepupAdvModal";o.className="adv-modal-overlay";o.innerHTML=`<div class="adv-modal">${html}</div>`;document.body.appendChild(o);o.addEventListener("click",e=>{if(e.target===o||e.target.closest("[data-close-adv]"))o.remove();});return o;}
  async function copyText(text,show=true){try{await navigator.clipboard.writeText(text);if(show)alert("Copied.");}catch{prompt("Copy:",text);}}

  async function handleParentQuery(){const code=new URLSearchParams(location.search).get("parent");if(!code)return false;const F=fb();if(!F)return false;try{const d=await F.db.collection("parentViews").doc(code.toUpperCase()).get();if(d.exists){renderParentView({id:d.id,...d.data()});return true;}}catch(e){console.warn(e);}return false;}

  function observe(){
    const mo=new MutationObserver(()=>{
      injectStyles(); injectParentRole(); injectRoleTabs(); injectWritingTools();
    });
    mo.observe(document.body,{subtree:true,childList:true});
  }

  window.addEventListener("stepup:assistant-message",e=>saveAssistantMessage(e.detail));
  window.STEPUP_ADV={renderTeacherHub,renderStudentGrowth,openParentLogin,loadParentView,startSmartAssignment};

  injectStyles(); observe();
  if(window.firebase?.auth){
    firebase.auth().onAuthStateChanged(async()=>{ADV.profile=null;await getProfile(true);injectRoleTabs();injectParentRole();injectWritingTools();});
  }
  setTimeout(()=>{handleParentQuery();injectRoleTabs();injectParentRole();injectWritingTools();},350);
})();
