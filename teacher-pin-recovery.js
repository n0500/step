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
      throw error("pin/no-session","Sign in with your teacher account first.");
    }
    if(typeof studentId !== "string" || !studentId || studentId.includes("/")){
      throw error("pin/invalid-student","The student account could not be identified.");
    }
    var teacherId = firebase.auth().currentUser.uid;
    var database = firebase.firestore();
    var teacher = await database.collection("users").doc(teacherId).get({source:"server"});
    var t = teacher.exists ? teacher.data() : {};
    if(t.role !== "teacher" || (t.status || "active") !== "active"){
      throw error("pin/not-teacher","This feature is available to active teacher accounts only.");
    }
    var snap = await database.collection("users").doc(studentId).get({source:"server"});
    var student = snap.exists ? snap.data() : {};
    if(student.role !== "student" || student.teacherId !== teacherId){
      throw error("pin/not-owned","You can only change PINs for students enrolled in your classes.");
    }
    if(!student.displayName || !student.classCode){
      throw error("pin/missing-identity","The sign-in details for this account are incomplete.");
    }
    return {id:studentId,profile:student,teacherId:teacherId};
  }

  async function change(studentId,newPin,repairOnly){
    newPin = normalizePin(newPin);
    if(!/^[0-9]{4}$/.test(newPin)){
      throw error("pin/invalid-pin","Enter a 4-digit PIN.");
    }
    if(running.has(studentId)){
      throw error("pin/busy","This student PIN is being updated. Wait for the operation to finish.");
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
        throw error("pin/not-saved","The current student PIN is not saved. It cannot be changed this way.");
      }
      if(!repairOnly && oldPin === newPin){
        throw error("pin/unchanged","This PIN is already saved. Choose a different PIN.");
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
        throw error("pin/identity-mismatch","The sign-in details do not match this student account. The PIN has not changed.");
      }
      var ref = temporary.firestore().collection("users").doc(studentId);
      var current = await ref.get({source:"server"});
      var p = current.exists ? current.data() : {};
      if(p.role !== "student" || p.teacherId !== target.teacherId ||
         p.displayName !== target.profile.displayName || p.classCode !== target.profile.classCode ||
         (!repairOnly && String(p.pin || "") !== oldPin)){
        throw error("pin/profile-changed","The account details have changed. Refresh the list and try again.");
      }
      if(!firebase.auth().currentUser || firebase.auth().currentUser.uid !== target.teacherId){
        throw error("pin/no-session","The teacher session has expired. The PIN has not changed.");
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
        if(!lock) throw error("pin/busy","This student PIN is being updated in another window. Wait for the operation to finish.");
        return change(studentId,newPin,repairOnly);
      });
    }
    return change(studentId,newPin,repairOnly);
  }

  function message(e){
    var code = String(e && e.code || "");
    if(code.indexOf("pin/") === 0) return e.message;
    if(/invalid-credential|wrong-password|user-not-found|invalid-login-credentials/.test(code)){
      return "The saved PIN could not be verified. Students who sign in by email should use Forgot password on the email sign-in page.";
    }
    if(/network-request-failed|unavailable|deadline-exceeded/.test(code)) return "Could not connect. Check your internet connection and try again.";
    if(/resource-exhausted|quota/.test(code)) return "The app has reached its free daily usage limit. Try again after the limit resets.";
    if(/permission-denied/.test(code)) return "Could not access the student account. Refresh the list and check your account permissions.";
    if(/too-many-requests/.test(code)) return "Too many requests. Wait a moment and try again.";
    if(/user-disabled/.test(code)) return "The student account is disabled. Check the account settings.";
    if(/requires-recent-login|user-token-expired/.test(code)) return "Your session has expired. Sign in again and retry.";
    return "The operation could not be completed. No new PIN was saved. Try again.";
  }

  async function open(studentId,onSaved){
    if(activeDialog) return;
    var dialog = document.createElement("dialog");
    dialog.className = "teacher-pin-dialog";
    dialog.dir = "ltr";
    dialog.setAttribute("aria-labelledby","teacherPinDialogTitle");
    dialog.innerHTML = '<form class="teacher-pin-form">'+
      '<h2 id="teacherPinDialogTitle">Set New PIN</h2>'+
      '<p class="teacher-pin-target"></p>'+
      '<p class="muted">For accounts that sign in with a name and PIN. Student results and certificates stay on the same account.</p>'+
      '<label for="teacherNewPin">New PIN (4 digits)</label>'+
      '<input id="teacherNewPin" type="text" dir="ltr" inputmode="numeric" maxlength="4" autocomplete="off" required>'+
      '<p class="teacher-pin-status" role="status" aria-live="polite">Checking the account…</p>'+
      '<div class="teacher-pin-dialog-actions">'+
      '<button class="btn btn-primary teacher-pin-submit" type="submit" disabled>Set PIN</button>'+
      '<button class="btn btn-secondary teacher-pin-close" type="button">Cancel</button>'+
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
        status.textContent = "The current student PIN is not saved. It can be changed after the student signs in normally and saves it.";
        input.disabled = true;
        return;
      }
      status.textContent = "Choose a new PIN, then select Set PIN.";
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
        status.textContent = "Enter a 4-digit PIN.";
        input.focus();
        return;
      }
      busy = true;
      input.value = pin;
      input.disabled = true;
      submit.disabled = true;
      close.disabled = true;
      status.textContent = pending ? "Saving the PIN to the list…" : "Changing the sign-in PIN…";
      try{
        var result = await withLock(studentId,pin,!!pending);
        if(result.status !== "saved"){
          pending = result;
          status.textContent = result.status === "change-unconfirmed" ?
            "The connection prevented confirmation. Keep the requested new PIN "+pin+", then select Verify and Save PIN when the connection returns." :
            "The sign-in PIN changed to "+pin+", but could not be saved to the list. Keep it and select Save PIN Again.";
          submit.textContent = result.status === "change-unconfirmed" ? "Verify and Save PIN" : "Save PIN Again";
          submit.disabled = false;
          close.textContent = "Close (I Have Kept the PIN)";
        }else{
          pending = null;
          status.textContent = "PIN set to "+pin+". The student signs in with the same name and the new PIN. Class code: "+result.classCode;
          submit.hidden = true;
          close.textContent = "Done";
          // A refresh failure cannot turn a completed password change into an error.
          try{if(onSaved) await onSaved(result);}catch(_){}
        }
      }catch(err){
        status.textContent = pending ? (pending.status === "change-unconfirmed" ? "Requested new PIN: " : "New sign-in PIN: ")+pending.pin+". "+message(err)+" Verify and save again when the connection returns." : message(err);
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
