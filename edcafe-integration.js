// StepUp • Edcafe per-class integration — 2026-09-28
// Replaces the visible MG1 Assistant experience with one Edcafe AI Tutor link per class.
(() => {
  "use strict";

  const state = { classCache: new Map(), patched:false, observer:null, userRole:null, roleUid:"" };

  const esc = (s="") => String(s).replace(/[&<>"']/g, m => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
  }[m]));

  function fb(){
    try{
      if(!window.firebase?.apps?.length) return null;
      return { auth: firebase.auth(), db: firebase.firestore() };
    }catch(e){ return null; }
  }

  function validEdcafeUrl(value){
    try{
      const u = new URL(String(value||"").trim());
      return u.protocol === "https:" &&
        (u.hostname === "edcafe.ai" || u.hostname.endsWith(".edcafe.ai"));
    }catch(e){ return false; }
  }

  async function getCurrentUserRole(){
    const F = fb();
    const uid = F?.auth?.currentUser?.uid || "";
    if(!uid){
      state.userRole=null;
      state.roleUid="";
      return null;
    }

    if(state.roleUid===uid && state.userRole) return state.userRole;

    try{
      const snap=await F.db.collection("users").doc(uid).get();
      if(!snap.exists) return null;
      const role=String(snap.data()?.role || "").trim().toLowerCase();
      state.userRole=role || null;
      state.roleUid=uid;
      return state.userRole;
    }catch(e){
      console.warn("Could not load current user role",e);
      return null;
    }
  }

  async function getCurrentStudentClass(){
    const F = fb();
    if(!F?.auth?.currentUser) return null;
    const uid = F.auth.currentUser.uid;
    const pSnap = await F.db.collection("users").doc(uid).get();
    if(!pSnap.exists) return null;
    const p = pSnap.data() || {};
    if(!p.classId) return null;
    if(state.classCache.has(p.classId)) return state.classCache.get(p.classId);
    const cSnap = await F.db.collection("classes").doc(p.classId).get();
    if(!cSnap.exists) return null;
    const cls = {id:cSnap.id, ...cSnap.data()};
    state.classCache.set(cls.id, cls);
    return cls;
  }

  async function getClass(classId){
    if(state.classCache.has(classId)) return state.classCache.get(classId);
    const F = fb();
    if(F){
      const snap = await F.db.collection("classes").doc(classId).get();
      if(!snap.exists) return null;
      const cls = {id:snap.id, ...snap.data()};
      state.classCache.set(classId, cls);
      return cls;
    }
    try{
      const arr = JSON.parse(localStorage.getItem("proveit_classes") || "[]");
      const cls = arr.find(x => x.id === classId) || null;
      if(cls) state.classCache.set(classId, cls);
      return cls;
    }catch(e){ return null; }
  }

  async function saveClassEdcafeLink(classId){
    const input = document.getElementById(`edcafeUrl_${classId}`);
    if(!input) return;
    const url = String(input.value||"").trim();

    if(url && !validEdcafeUrl(url)){
      alert("Paste a valid Edcafe link that starts with https:// and belongs to edcafe.ai.");
      input.focus();
      return;
    }

    const F = fb();
    try{
      if(F){
        const clsSnap = await F.db.collection("classes").doc(classId).get();
        if(!clsSnap.exists) throw new Error("Class not found.");
        const cls = clsSnap.data() || {};
        await F.db.collection("classes").doc(classId).update({edcafeUrl:url});
        if(cls.code){
          await F.db.collection("joinCodes").doc(cls.code).set({edcafeUrl:url},{merge:true});
        }
        state.classCache.set(classId,{id:classId,...cls,edcafeUrl:url});
      }else{
        const key="proveit_classes";
        const arr=JSON.parse(localStorage.getItem(key)||"[]");
        const i=arr.findIndex(x=>x.id===classId);
        if(i<0) throw new Error("Class not found.");
        arr[i]={...arr[i],edcafeUrl:url};
        localStorage.setItem(key,JSON.stringify(arr));
        state.classCache.set(classId,arr[i]);
      }
      alert(url ? "Edcafe AI Tutor link saved for this class." : "Edcafe AI Tutor link removed from this class.");
      syncTeacherCards();
    }catch(e){
      console.error("Saving Edcafe link failed",e);
      alert("Could not save the Edcafe link. Please try again.");
    }
  }

  function classIdFromCard(card){
    const btn=[...card.querySelectorAll("button")].find(b =>
      String(b.getAttribute("onclick")||"").includes("PROVE.selectClass(")
    );
    const code=btn?.getAttribute("onclick")||"";
    return code.match(/PROVE\.selectClass\('([^']+)'\)/)?.[1] || "";
  }

  async function syncTeacherCards(){
    const cards=[...document.querySelectorAll(".teacher-class-card")];
    for(const card of cards){
      const classId=classIdFromCard(card);
      if(!classId) continue;

      let panel=card.querySelector(".edcafe-class-panel");
      if(!panel){
        panel=document.createElement("div");
        panel.className="teacher-unit-access edcafe-class-panel";
        panel.innerHTML=`
          <div class="teacher-card-head">
            <div>
              <h3>Edcafe AI Tutor</h3>
              <p class="muted">Add the dedicated Edcafe tutor link for this class.</p>
            </div>
          </div>
          <div class="field">
            <label>Edcafe link</label>
            <input id="edcafeUrl_${esc(classId)}" type="url"
              placeholder="https://app.edcafe.ai/..."
              autocomplete="off" spellcheck="false">
          </div>
          <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:10px">
            <button class="btn btn-primary" data-edcafe-save>Save Edcafe Link</button>
            <a class="btn btn-secondary" data-edcafe-open target="_blank" rel="noopener noreferrer" style="display:none;text-decoration:none">Open Link</a>
          </div>`;
        card.appendChild(panel);
        panel.querySelector("[data-edcafe-save]")?.addEventListener("click",()=>saveClassEdcafeLink(classId));
      }

      const cls=await getClass(classId);
      const input=panel.querySelector(`#edcafeUrl_${CSS.escape(classId)}`);
      const open=panel.querySelector("[data-edcafe-open]");
      const url=String(cls?.edcafeUrl||"").trim();
      if(input && document.activeElement!==input) input.value=url;
      if(open){
        if(validEdcafeUrl(url)){
          open.href=url;
          open.style.display="";
        }else{
          open.removeAttribute("href");
          open.style.display="none";
        }
      }
    }
  }

  async function renderStudentEdcafeHub(){
    const hub=document.querySelector(".student-assistant-hub");
    if(!hub || hub.dataset.edcafeReady==="1") return;
    hub.dataset.edcafeReady="1";

    hub.innerHTML=`
      <section class="assistant-main-card edcafe-main-card">
        <div>
          <div class="section-kicker" style="color:#ddd8ff">AI Tutor • Edcafe</div>
          <h1>Your AI Tutor</h1>
          <p id="edcafeStudentMessage">Loading your class tutor…</p>
        </div>
        <div id="edcafeStudentAction"></div>
      </section>`;

    try{
      const cls=await getCurrentStudentClass();
      const url=String(cls?.edcafeUrl||"").trim();
      const msg=document.getElementById("edcafeStudentMessage");
      const action=document.getElementById("edcafeStudentAction");
      if(validEdcafeUrl(url)){
        if(msg) msg.textContent=`Talk to the Edcafe tutor prepared for ${cls?.name||"your class"} without leaving STEP UP.`;
        if(action){
          action.innerHTML=`
            <div class="edcafe-hub-actions">
              <button type="button" class="journey-main-btn" data-edcafe-embed>Open AI Tutor here</button>
              <a href="${esc(url)}" target="_blank" rel="noopener noreferrer" class="edcafe-external-link">Open in new tab</a>
            </div>`;
          action.querySelector("[data-edcafe-embed]")?.addEventListener("click",openCurrentTutor);
        }
      }else{
        if(msg) msg.textContent="Your teacher has not added the Edcafe AI Tutor link for this class yet.";
        if(action) action.innerHTML="";
      }
    }catch(e){
      console.warn("Edcafe student hub failed",e);
      const msg=document.getElementById("edcafeStudentMessage");
      if(msg) msg.textContent="The AI Tutor link could not be loaded. Please try again.";
    }
  }

  let tutorFocusReturn=null;

  function closeTutorModal(){
    const modal=document.getElementById("stepupEdcafeModal");
    if(!modal) return;
    modal.remove();
    document.body.classList.remove("stepup-edcafe-modal-open");
    if(tutorFocusReturn?.isConnected) tutorFocusReturn.focus();
    tutorFocusReturn=null;
  }

  function showTutorInApp(url,className){
    closeTutorModal();
    tutorFocusReturn=document.activeElement;
    const modal=document.createElement("div");
    modal.id="stepupEdcafeModal";
    modal.className="stepup-edcafe-overlay";
    modal.setAttribute("role","dialog");
    modal.setAttribute("aria-modal","true");
    modal.setAttribute("aria-label","Edcafe AI Tutor");

    modal.innerHTML=`
      <div class="stepup-edcafe-dialog">
        <header class="stepup-edcafe-header">
          <div class="stepup-edcafe-heading">
            <strong>AI Tutor • Edcafe</strong>
            <span>${esc(className || "Your class")} | STEP UP</span>
          </div>
          <div class="stepup-edcafe-header-actions">
            <a class="stepup-edcafe-external" href="${esc(url)}" target="_blank" rel="noopener noreferrer">Open externally</a>
            <button type="button" class="stepup-edcafe-close" aria-label="Close AI Tutor">Close ×</button>
          </div>
        </header>
        <div class="stepup-edcafe-frame-wrap">
          <iframe title="Mega Goal 1 Tutor – ${esc(className||"Your class")}" src="${esc(url)}"
            allow="microphone" referrerpolicy="strict-origin-when-cross-origin"></iframe>
        </div>
        <div class="stepup-edcafe-footnote">If the tutor is blank or the microphone does not work, choose <b>Open externally</b>.</div>
      </div>`;
    modal.querySelector(".stepup-edcafe-close")?.addEventListener("click",closeTutorModal);
    modal.addEventListener("click",e=>{if(e.target===modal)closeTutorModal();});
    document.body.classList.add("stepup-edcafe-modal-open");
    document.body.appendChild(modal);
    modal.querySelector(".stepup-edcafe-close")?.focus();
  }

  document.addEventListener("keydown",e=>{
    if(e.key==="Escape" && document.getElementById("stepupEdcafeModal")) closeTutorModal();
  });

  async function openCurrentTutor(){
    try{
      const cls=await getCurrentStudentClass();
      const url=String(cls?.edcafeUrl||"").trim();
      if(!validEdcafeUrl(url)){
        alert("Your teacher has not added the Edcafe AI Tutor link for this class yet.");
        return;
      }
      showTutorInApp(url,cls?.name||"Your class");
    }catch(e){
      console.warn("Could not open embedded Edcafe tutor",e);
      alert("Could not open the Edcafe AI Tutor. Please try again.");
    }
  }

  async function syncStudentFloatingTutor(){
    const role=await getCurrentUserRole();
    const existing=document.getElementById("studentFloatingAiTutor");

    // Student only. Remove immediately for teachers, logged-out users, or any other role.
    if(role!=="student"){
      existing?.remove();
      return;
    }

    if(existing) return;

    const btn=document.createElement("button");
    btn.id="studentFloatingAiTutor";
    btn.type="button";
    btn.className="student-floating-ai-tutor";
    btn.setAttribute("aria-label","Open AI Tutor");
    btn.innerHTML=`
      <span class="student-floating-ai-icon" aria-hidden="true">🤖</span>
      <span class="student-floating-ai-label">AI Tutor</span>
    `;
    btn.addEventListener("click",openCurrentTutor);
    document.body.appendChild(btn);
  }

  function patchVisibleLabels(){
    document.querySelectorAll('.student-nav [data-student-tab="assistant"] .student-nav-label')
      .forEach(el=>{ if(el.textContent.trim()!=="AI Tutor") el.textContent="AI Tutor"; });

    document.querySelectorAll(".explain-mistake-btn").forEach(btn=>{
      btn.innerHTML='<span class="explain-mistake-spark">✦</span> Ask AI Tutor';
    });
  }

  function patchProve(){
    if(state.patched || !window.PROVE) return;
    state.patched=true;

    const originalOpenStudentTool=window.PROVE.openStudentTool;
    window.PROVE.openStudentTool=function(kind){
      if(kind==="assistant") return openCurrentTutor();
      return originalOpenStudentTool?.(kind);
    };

    // Existing "Explain my mistake" buttons now open the class Edcafe tutor.
    window.PROVE.explainMyMistake=function(){
      return openCurrentTutor();
    };

    window.PROVE.saveClassEdcafeLink=saveClassEdcafeLink;
    window.PROVE.openEdcafeTutor=openCurrentTutor;
  }

  function sync(){
    patchProve();
    patchVisibleLabels();
    syncTeacherCards();
    renderStudentEdcafeHub();
    syncStudentFloatingTutor();
  }

  function injectStyles(){
    if(document.getElementById("stepupEdcafeStyles")) return;
    const s=document.createElement("style");
    s.id="stepupEdcafeStyles";
    s.textContent=`
      .edcafe-class-panel{margin-top:16px;border-top:1px solid #e5edf4;padding-top:16px}
      .edcafe-class-panel input{width:100%;box-sizing:border-box}
      .edcafe-main-card .journey-main-btn{display:inline-flex;align-items:center;justify-content:center}
      .edcafe-hub-actions{display:flex;gap:12px;flex-wrap:wrap;align-items:center}
      .edcafe-external-link{color:#fff;text-decoration:underline;text-underline-offset:3px;font-weight:700}
      body.stepup-edcafe-modal-open{overflow:hidden}
      .stepup-edcafe-overlay{position:fixed;inset:0;z-index:100000;background:rgba(14,19,42,.72);display:flex;align-items:center;justify-content:center;padding:12px;box-sizing:border-box}
      .stepup-edcafe-dialog{display:flex;flex-direction:column;width:min(1080px,100%);height:min(860px,calc(100dvh - 24px));background:#fff;border-radius:18px;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,.3);color:#18243d}
      .stepup-edcafe-header{display:flex;justify-content:space-between;align-items:center;gap:12px;padding:12px 16px;background:#f4f5fc;border-bottom:1px solid #dddff3;flex-wrap:wrap}
      .stepup-edcafe-heading{display:flex;flex-direction:column;gap:3px;font:600 14px/1.35 Arial,Tahoma,sans-serif}
      .stepup-edcafe-heading strong{font-size:17px;color:#2e2a72}
      .stepup-edcafe-heading span{font-weight:400;color:#62677d}
      .stepup-edcafe-header-actions{display:flex;align-items:center;gap:10px;flex-wrap:wrap}
      .stepup-edcafe-header-actions a,.stepup-edcafe-header-actions button{font:700 13px/1.3 Arial,Tahoma,sans-serif;padding:10px 12px;border-radius:10px;cursor:pointer;text-decoration:none}
      .stepup-edcafe-external{color:#554dd7;border:1px solid #a9a4ee;background:#fff}
      .stepup-edcafe-close{color:#fff;border:0;background:#5148c2}
      .stepup-edcafe-frame-wrap{flex:1;min-height:0;background:#fff}
      .stepup-edcafe-frame-wrap iframe{width:100%;height:100%;border:0;display:block}
      .stepup-edcafe-footnote{padding:8px 14px;background:#fafaff;color:#50566b;font:12px/1.4 Arial,Tahoma,sans-serif;text-align:center}
      @media(max-width:600px){
        .stepup-edcafe-overlay{padding:0}
        .stepup-edcafe-dialog{width:100%;height:100dvh;max-height:100dvh;border-radius:0}
        .stepup-edcafe-header{padding:9px 11px;gap:8px}
        .stepup-edcafe-heading strong{font-size:15px}
        .stepup-edcafe-header-actions a,.stepup-edcafe-header-actions button{font-size:12px;padding:8px 9px}
      }

      .student-floating-ai-tutor{
        position:fixed;
        right:max(18px,env(safe-area-inset-right));
        bottom:max(18px,calc(env(safe-area-inset-bottom) + 14px));
        z-index:9999;
        display:flex;
        align-items:center;
        gap:9px;
        min-height:52px;
        padding:9px 14px 9px 10px;
        border:1px solid rgba(255,255,255,.7);
        border-radius:999px;
        background:linear-gradient(135deg,#5f56e8,#8c52d9);
        color:#fff;
        font:800 14px/1 Arial,Tahoma,"Segoe UI",sans-serif;
        box-shadow:0 10px 28px rgba(62,55,150,.28);
        cursor:pointer;
        -webkit-tap-highlight-color:transparent;
        transition:transform .16s ease,box-shadow .16s ease;
      }
      .student-floating-ai-tutor:hover{transform:translateY(-2px);box-shadow:0 13px 32px rgba(62,55,150,.34)}
      .student-floating-ai-tutor:active{transform:translateY(0) scale(.97)}
      .student-floating-ai-icon{
        width:34px;height:34px;border-radius:50%;
        display:grid;place-items:center;
        background:rgba(255,255,255,.18);
        font-size:20px;
      }
      .student-floating-ai-label{white-space:nowrap;letter-spacing:.01em}
      @media(max-width:520px){
        .student-floating-ai-tutor{
          right:max(12px,env(safe-area-inset-right));
          bottom:max(12px,calc(env(safe-area-inset-bottom) + 10px));
          min-height:50px;
          padding:8px 12px 8px 8px;
        }
        .student-floating-ai-icon{width:34px;height:34px}
      }
    `;
    document.head.appendChild(s);
  }

  injectStyles();

  const start=()=>{
    sync();
    state.observer=new MutationObserver(()=>sync());
    state.observer.observe(document.body,{childList:true,subtree:true});
  };

  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",start,{once:true});
  else start();

  window.STEPUP_EDCAFE={saveClassEdcafeLink,openCurrentTutor,closeTutorModal,getCurrentStudentClass,syncStudentFloatingTutor};
})();
