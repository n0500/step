// StepUp • Student progress persistence hardening
// Ensures every student attempt is saved with the canonical Firebase UID/class/teacher
// required by Firestore rules, keeps a retry queue, and gives visible save feedback.
(() => {
  "use strict";

  const KEY = "stepup_pending_attempts_v1";
  const state = {
    installed: false,
    flushing: false,
    lastStatus: "",
    toastTimer: null
  };

  function fbReady(){
    return !!(window.firebase && firebase.auth && firebase.firestore);
  }

  function readPending(){
    try{
      const raw = localStorage.getItem(KEY);
      const arr = raw ? JSON.parse(raw) : [];
      return Array.isArray(arr) ? arr : [];
    }catch(e){
      return [];
    }
  }

  function writePending(items){
    try{
      localStorage.setItem(KEY, JSON.stringify(items || []));
    }catch(e){
      console.warn("Could not persist pending StepUp attempts", e);
    }
  }

  function upsertPending(item){
    const items = readPending().filter(x => x.docId !== item.docId);
    items.push(item);
    writePending(items);
  }

  function removePending(docId){
    writePending(readPending().filter(x => x.docId !== docId));
  }

  function toast(message, kind="ok"){
    let el = document.getElementById("stepupProgressSaveToast");
    if(!el){
      el = document.createElement("div");
      el.id = "stepupProgressSaveToast";
      el.className = "stepup-progress-save-toast";
      document.body.appendChild(el);
    }
    el.className = `stepup-progress-save-toast ${kind}`;
    el.textContent = message;
    el.classList.add("show");
    clearTimeout(state.toastTimer);
    state.toastTimer = setTimeout(() => el.classList.remove("show"), 2600);
  }

  function ensureStyles(){
    if(document.getElementById("stepupProgressSaveStyles")) return;
    const s = document.createElement("style");
    s.id = "stepupProgressSaveStyles";
    s.textContent = `
      .stepup-progress-save-toast{
        position:fixed;left:50%;bottom:max(22px,calc(env(safe-area-inset-bottom) + 16px));
        transform:translate(-50%,18px);z-index:12000;opacity:0;pointer-events:none;
        padding:11px 16px;border-radius:999px;background:#17324d;color:#fff;
        font:800 14px/1.2 Arial,Tahoma,"Segoe UI",sans-serif;
        box-shadow:0 12px 34px rgba(16,42,67,.26);
        transition:opacity .18s ease,transform .18s ease;
        max-width:min(88vw,520px);text-align:center
      }
      .stepup-progress-save-toast.show{opacity:1;transform:translate(-50%,0)}
      .stepup-progress-save-toast.ok{background:#176b4a}
      .stepup-progress-save-toast.error{background:#a62f3b}
      .stepup-progress-save-toast.pending{background:#8a6418}
      .journey-save-confirm{
        margin:12px auto 0;padding:10px 14px;border-radius:13px;
        background:#edf9f3;border:1px solid #bfe6cf;color:#176b4a;
        font-weight:800;text-align:center;max-width:620px
      }
      .journey-save-confirm.error{
        background:#fff0f1;border-color:#efc4c7;color:#a62f3b
      }
    `;
    document.head.appendChild(s);
  }

  function newDocId(uid){
    const rand = Math.random().toString(36).slice(2,10);
    return `a_${String(uid||"student").slice(0,10)}_${Date.now()}_${rand}`;
  }

  async function canonicalAttempt(data){
    const auth = firebase.auth();
    const user = auth.currentUser;
    if(!user) throw new Error("Student is not signed in.");

    const db = firebase.firestore();
    const snap = await db.collection("users").doc(user.uid).get();
    if(!snap.exists) throw new Error("Student profile was not found.");

    const profile = snap.data() || {};
    if(profile.role !== "student") return data;

    if(!profile.classId || !profile.teacherId){
      throw new Error("Student class information is incomplete.");
    }

    return {
      ...data,
      studentId: user.uid,
      studentName: profile.displayName || data?.studentName || "",
      classId: profile.classId,
      classCode: profile.classCode || data?.classCode || "",
      teacherId: profile.teacherId,
      submittedAt: data?.submittedAt || new Date().toISOString()
    };
  }

  async function saveWithRetryRecord(collectionRef, originalAdd, rawData){
    // Only harden the attempts collection. Everything else keeps Firebase's normal behavior.
    if(collectionRef.id !== "attempts"){
      return originalAdd.call(collectionRef, rawData);
    }

    const auth = firebase.auth();
    const user = auth.currentUser;
    if(!user){
      state.lastStatus = "error";
      toast("Progress was not saved — please sign in again.", "error");
      throw new Error("No signed-in student.");
    }

    const data = await canonicalAttempt(rawData);
    const docId = data.clientAttemptId || newDocId(user.uid);
    data.clientAttemptId = docId;

    const pending = { docId, data, queuedAt: new Date().toISOString() };
    upsertPending(pending);

    const docRef = collectionRef.doc(docId);

    try{
      // If this exact attempt was already accepted before a reload/crash, do not duplicate it.
      const existing = await docRef.get();
      if(!existing.exists){
        await docRef.set(data);
      }
      removePending(docId);
      state.lastStatus = "ok";
      toast("Progress saved ✓", "ok");
      window.dispatchEvent(new CustomEvent("stepup:progress-saved", { detail: { docId, attempt: data } }));
      return docRef;
    }catch(e){
      state.lastStatus = "error";
      console.error("StepUp progress save failed", e);
      toast("Progress was not saved. It will retry automatically.", "error");
      window.dispatchEvent(new CustomEvent("stepup:progress-save-failed", { detail: { docId, error: String(e?.message || e) } }));
      throw e;
    }
  }

  async function flushPending(){
    if(state.flushing || !fbReady()) return;
    const user = firebase.auth().currentUser;
    if(!user) return;

    const items = readPending();
    if(!items.length) return;

    state.flushing = true;
    try{
      const db = firebase.firestore();
      for(const item of items){
        try{
          const data = await canonicalAttempt(item.data || {});
          data.clientAttemptId = item.docId;
          const ref = db.collection("attempts").doc(item.docId);
          const existing = await ref.get();
          if(!existing.exists) await ref.set(data);
          removePending(item.docId);
        }catch(e){
          console.warn("Pending progress retry is still waiting", e);
        }
      }

      if(readPending().length === 0){
        state.lastStatus = "ok";
      }
    }finally{
      state.flushing = false;
    }
  }

  function decorateJourneyResult(){
    const result = document.querySelector(".journey-result");
    if(!result || result.querySelector(".journey-save-confirm")) return;

    if(state.lastStatus === "ok"){
      const note = document.createElement("div");
      note.className = "journey-save-confirm";
      note.textContent = "✓ Attempt saved. Journey completion moves forward when this stop is passed.";
      result.appendChild(note);
    }else if(state.lastStatus === "error"){
      const note = document.createElement("div");
      note.className = "journey-save-confirm error";
      note.textContent = "This attempt is waiting to be saved. StepUp will retry automatically.";
      result.appendChild(note);
    }
  }

  function install(){
    if(state.installed || !fbReady()) return;
    ensureStyles();

    try{
      const db = firebase.firestore();
      const probe = db.collection("__stepup_probe__");
      const proto = Object.getPrototypeOf(probe);
      if(!proto || typeof proto.add !== "function") throw new Error("Firestore add() was not found.");

      if(!proto.__stepupOriginalAdd){
        Object.defineProperty(proto, "__stepupOriginalAdd", {
          value: proto.add,
          configurable: false,
          enumerable: false,
          writable: false
        });

        proto.add = function(data){
          return saveWithRetryRecord(this, proto.__stepupOriginalAdd, data);
        };
      }

      state.installed = true;

      firebase.auth().onAuthStateChanged(user => {
        if(user) setTimeout(flushPending, 300);
      });

      window.addEventListener("online", flushPending);

      const observer = new MutationObserver(() => decorateJourneyResult());
      observer.observe(document.documentElement, { childList:true, subtree:true });

      setTimeout(flushPending, 700);
    }catch(e){
      console.error("StepUp progress save protection could not start", e);
    }
  }

  if(document.readyState === "loading"){
    document.addEventListener("DOMContentLoaded", install, { once:true });
  }else{
    install();
  }

  window.STEPUP_PROGRESS_SAVE = {
    flushPending,
    pendingCount: () => readPending().length
  };
})();
