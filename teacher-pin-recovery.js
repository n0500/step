// Teacher-managed PIN changes on the existing Firebase Spark plan.
// A separate in-memory Auth session proves the saved student credential.
// Never create an account or replace the teacher's default Auth session.
(function(){
  "use strict";

  var running = new Set();
  var serial = 0;
  var activeDialog = null;

  function error(code,message){
    var e = new Error(message);
    e.code = code;
    return e;
  }

  function normalizePin(value){
    return String(value || "").trim().replace(/[٠-٩]/g,function(c){
      return String(c.charCodeAt(0)-1632);
    }).replace(/[۰-۹]/g,function(c){
      return String(c.charCodeAt(0)-1776);
    });
  }

  async function credentials(profile,pin){
    var normalized = String(profile.classCode || "").trim().toUpperCase() + "|" +
      String(profile.displayName || "").toLowerCase().trim().replace(/\s+/g," ");
    var hash = await crypto.subtle.digest("SHA-256",new TextEncoder().encode(normalized));
    var h = Array.from(new Uint8Array(hash)).map(function(b){return b.toString(16).padStart(2,"0");}).join("");
    return {email:"s_"+h.slice(0,24)+"@students.proveit.local",password:pin+"Aa!"+h.slice(0,4)};
  }

  async function readStudent(studentId){
    if(!window.firebase || !firebase.apps.length || !firebase.auth().currentUser){
      throw error("pin/no-session","سجلي الدخول بحساب المعلمة أولًا.");
    }
    if(typeof studentId !== "string" || !studentId || studentId.includes("/")){
      throw error("pin/invalid-student","تعذر تحديد حساب الطالبة.");
    }
    var teacherId = firebase.auth().currentUser.uid;
    var database = firebase.firestore();
    var teacher = await database.collection("users").doc(teacherId).get({source:"server"});
    var t = teacher.exists ? teacher.data() : {};
    if(t.role !== "teacher" || (t.status || "active") !== "active"){
      throw error("pin/not-teacher","هذه الخاصية متاحة لحساب المعلمة النشط فقط.");
    }
    var snap = await database.collection("users").doc(studentId).get({source:"server"});
    var student = snap.exists ? snap.data() : {};
    if(student.role !== "student" || student.teacherId !== teacherId){
      throw error("pin/not-owned","يمكنك تغيير رمز الطالبات المسجلات لديك فقط.");
    }
    if(!student.displayName || !student.classCode){
      throw error("pin/missing-identity","بيانات الدخول لهذا الحساب غير مكتملة.");
    }
    return {id:studentId,profile:student,teacherId:teacherId};
  }

  async function change(studentId,newPin,repairOnly){
    newPin = normalizePin(newPin);
    if(!/^[0-9]{4}$/.test(newPin)){
      throw error("pin/invalid-pin","اكتبي رمزًا من 4 أرقام.");
    }
    if(running.has(studentId)){
      throw error("pin/busy","يجري تحديث رمز هذه الطالبة. انتظري اكتمال العملية.");
    }
    running.add(studentId);
    var temporary = null;
    var temporaryAuth = null;
    var passwordChanged = false;
    var passwordAttempted = false;
    var target;
    try{
      target = await readStudent(studentId);
      var oldPin = repairOnly ? newPin : String(target.profile.pin || "");
      if(!/^[0-9]{4}$/.test(oldPin)){
        throw error("pin/not-saved","رمز الطالبة الحالي غير محفوظ. لا يمكن تغييره بهذه الطريقة.");
      }
      if(!repairOnly && oldPin === newPin){
        throw error("pin/unchanged","هذا هو الرمز المحفوظ بالفعل. اختاري رمزًا جديدًا.");
      }
      var oldCreds = await credentials(target.profile,oldPin);
      var newCreds = await credentials(target.profile,newPin);
      // initializeApp with a distinct name isolates this login from the teacher.
      temporary = firebase.initializeApp(window.PROVEIT_CONFIG.firebase,
        "stepup-pin-change-"+Date.now()+"-"+(++serial));
      temporaryAuth = temporary.auth();
      await temporaryAuth.setPersistence(firebase.auth.Auth.Persistence.NONE);
      var login = await temporaryAuth.signInWithEmailAndPassword(oldCreds.email,oldCreds.password);
      if(login.user.uid !== studentId){
        throw error("pin/identity-mismatch","بيانات الدخول لا تطابق حساب الطالبة المحدد. لم يُغيّر الرمز.");
      }
      var ref = temporary.firestore().collection("users").doc(studentId);
      var current = await ref.get({source:"server"});
      var p = current.exists ? current.data() : {};
      if(p.role !== "student" || p.teacherId !== target.teacherId ||
         p.displayName !== target.profile.displayName || p.classCode !== target.profile.classCode ||
         (!repairOnly && String(p.pin || "") !== oldPin)){
        throw error("pin/profile-changed","تغيّرت بيانات الحساب. حدّثي القائمة وحاولي مرة أخرى.");
      }
      if(!firebase.auth().currentUser || firebase.auth().currentUser.uid !== target.teacherId){
        throw error("pin/no-session","انتهت جلسة المعلمة. لم يُغيّر الرمز.");
      }
      if(!repairOnly){
        passwordAttempted = true;
        await login.user.updatePassword(newCreds.password);
        passwordChanged = true;
      }
      // Change only PIN. The UID, class, results, certificates and email stay intact.
      await ref.update({pin:newPin});
      return {status:"saved",studentId:studentId,pin:newPin,
        displayName:target.profile.displayName,classCode:target.profile.classCode};
    }catch(e){
      if(passwordChanged){
        // Auth and Firestore are different services: never report a failed write
        // as an unchanged password. The UI lets the teacher retry just that write.
        return {status:"profile-pending",studentId:studentId,pin:newPin,
          displayName:target.profile.displayName,classCode:target.profile.classCode};
      }
      if(passwordAttempted && /network-request-failed|timeout/.test(String(e && e.code || ""))){
        // A lost Auth response does not prove that the server rejected the change.
        // Verify the new credential on retry before repairing the profile.
        return {status:"change-unconfirmed",studentId:studentId,pin:newPin,
          displayName:target.profile.displayName,classCode:target.profile.classCode};
      }
      throw e;
    }finally{
      if(temporaryAuth){try{await temporaryAuth.signOut();}catch(_){} }
      if(temporary){try{await temporary.delete();}catch(_){} }
      running.delete(studentId);
    }
  }

  async function withLock(studentId,newPin,repairOnly){
    if(window.navigator.locks && window.navigator.locks.request){
      return navigator.locks.request("stepup-pin-change-"+studentId,{ifAvailable:true},function(lock){
        if(!lock) throw error("pin/busy","رمز هذه الطالبة يُحدّث في نافذة أخرى. انتظري اكتمال العملية.");
        return change(studentId,newPin,repairOnly);
      });
    }
    return change(studentId,newPin,repairOnly);
  }

  function message(e){
    var code = String(e && e.code || "");
    if(code.indexOf("pin/") === 0) return e.message;
    if(/invalid-credential|wrong-password|user-not-found|invalid-login-credentials/.test(code)){
      return "لم ينجح التحقق بالرمز المحفوظ. إذا كانت الطالبة تدخل بالبريد، تستخدم «نسيت كلمة المرور؟» في صفحة الدخول بالبريد.";
    }
    if(/network-request-failed|unavailable|deadline-exceeded/.test(code)) return "تعذر الاتصال. تأكدي من الإنترنت وحاولي مرة أخرى.";
    if(/resource-exhausted|quota/.test(code)) return "وصل التطبيق إلى حد الاستخدام اليومي المجاني. حاولي بعد تجدد الحد.";
    if(/permission-denied/.test(code)) return "تعذر الوصول إلى حساب الطالبة. حدّثي القائمة وتحققي من صلاحيات حسابك.";
    if(/too-many-requests/.test(code)) return "محاولات كثيرة خلال وقت قصير. انتظري قليلًا وحاولي مرة أخرى.";
    if(/user-disabled/.test(code)) return "حساب الطالبة موقوف. راجعي إعدادات الحساب.";
    if(/requires-recent-login|user-token-expired/.test(code)) return "انتهت الجلسة. سجلي الدخول مجددًا وحاولي مرة أخرى.";
    return "تعذر إكمال العملية. لم يُحفظ رمز جديد. حاولي مرة أخرى.";
  }

  async function open(studentId,onSaved){
    if(activeDialog) return;
    var dialog = document.createElement("dialog");
    dialog.className = "teacher-pin-dialog";
    dialog.dir = "rtl";
    dialog.setAttribute("aria-labelledby","teacherPinDialogTitle");
    dialog.innerHTML = '<form class="teacher-pin-form">'+
      '<h2 id="teacherPinDialogTitle">تعيين PIN جديد</h2>'+
      '<p class="teacher-pin-target"></p>'+
      '<p class="muted">للحسابات التي تدخل بالاسم وPIN. تبقى نتائج الطالبة وشهاداتها على حسابها نفسه.</p>'+
      '<label for="teacherNewPin">الرمز الجديد — 4 أرقام</label>'+
      '<input id="teacherNewPin" type="text" dir="ltr" inputmode="numeric" maxlength="4" autocomplete="off" required>'+
      '<p class="teacher-pin-status" role="status" aria-live="polite">جاري التحقق من الحساب…</p>'+
      '<div class="teacher-pin-dialog-actions">'+
      '<button class="btn btn-primary teacher-pin-submit" type="submit" disabled>تعيين الرمز</button>'+
      '<button class="btn btn-secondary teacher-pin-close" type="button">إلغاء</button>'+
      '</div></form>';
    document.body.appendChild(dialog);
    activeDialog = dialog;
    if(dialog.showModal) dialog.showModal(); else dialog.setAttribute("open","");
    var form = dialog.querySelector("form");
    form.addEventListener("submit",function(e){e.preventDefault();});
    var input = dialog.querySelector("input");
    var status = dialog.querySelector(".teacher-pin-status");
    var submit = dialog.querySelector(".teacher-pin-submit");
    var close = dialog.querySelector(".teacher-pin-close");
    var busy = false;
    var pending = null;
    var closed = false;
    function dismiss(){
      if(busy) return;
      closed = true;
      dialog.remove();
      if(activeDialog === dialog) activeDialog = null;
    }
    close.addEventListener("click",dismiss);
    dialog.addEventListener("cancel",function(e){e.preventDefault();dismiss();});
    try{
      var target = await readStudent(studentId);
      if(closed) return;
      dialog.querySelector(".teacher-pin-target").textContent = target.profile.displayName;
      if(!/^[0-9]{4}$/.test(String(target.profile.pin || ""))){
        status.textContent = "رمز الطالبة الحالي غير محفوظ. يتاح تغييره بعد حفظه عند دخولها المعتاد.";
        input.disabled = true;
        return;
      }
      status.textContent = "اختاري الرمز الجديد، ثم اضغطي «تعيين الرمز».";
      submit.disabled = false;
      input.focus();
    }catch(e){
      if(!closed){status.textContent = message(e);input.disabled = true;}
      return;
    }
    form.addEventListener("submit",async function(e){
      e.preventDefault();
      if(busy) return;
      var pin = pending ? pending.pin : normalizePin(input.value);
      if(!/^[0-9]{4}$/.test(pin)){
        status.textContent = "اكتبي رمزًا من 4 أرقام.";
        input.focus();
        return;
      }
      busy = true;
      input.value = pin;
      input.disabled = true;
      submit.disabled = true;
      close.disabled = true;
      status.textContent = pending ? "جاري حفظ الرمز في القائمة…" : "جاري تغيير رمز الدخول…";
      try{
        var result = await withLock(studentId,pin,!!pending);
        if(result.status !== "saved"){
          pending = result;
          status.textContent = result.status === "change-unconfirmed" ?
            "تعذر تأكيد التغيير بسبب الاتصال. احتفظي بالرمز الجديد المطلوب "+pin+"، ثم اضغطي «التحقق وحفظ الرمز» عند عودة الاتصال." :
            "تغيّر رمز الدخول إلى "+pin+"، لكن تعذر حفظه في القائمة. احتفظي به واضغطي «إعادة حفظ الرمز».";
          submit.textContent = result.status === "change-unconfirmed" ? "التحقق وحفظ الرمز" : "إعادة حفظ الرمز";
          submit.disabled = false;
          close.textContent = "إغلاق — احتفظت بالرمز";
        }else{
          pending = null;
          status.textContent = "تم تعيين الرمز "+pin+". تدخل الطالبة باسمها نفسه والرمز الجديد. كود الفصل: "+result.classCode;
          submit.hidden = true;
          close.textContent = "تم";
          // A refresh failure cannot turn a completed password change into an error.
          try{if(onSaved) await onSaved(result);}catch(_){}
        }
      }catch(err){
        status.textContent = pending ? (pending.status === "change-unconfirmed" ? "الرمز الجديد المطلوب " : "رمز الدخول الجديد هو ")+pending.pin+". "+message(err)+" أعيدي التحقق والحفظ عندما يعود الاتصال." : message(err);
        submit.disabled = false;
        input.disabled = !!pending;
      }finally{
        busy = false;
        close.disabled = false;
      }
    });
  }

  window.STEPUP_PIN_RECOVERY = {
    open:open,
    reset:function(studentId,pin){return withLock(studentId,pin,false);},
    repair:function(studentId,pin){return withLock(studentId,pin,true);}
  };
})();
