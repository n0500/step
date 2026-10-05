// StepUp • Student account email upgrade
// Adds an email + password to the SAME Firebase user (same UID) after legacy name + PIN login.
// Existing progress remains linked to the unchanged Firebase UID.
(function(){
  "use strict";

  if(!window.PROVE || !window.firebase || !firebase.auth || !firebase.firestore) return;

  var originalContinue = window.PROVE.studentContinue;
  var originalRegister = window.PROVE.studentRegister;
  var LEGACY_DOMAIN = "@students.proveit.local";
  var observerTimer = null;
  var upgradeBusy = false;

  function auth(){ return firebase.auth(); }
  function db(){ return firebase.firestore(); }

  function esc(value){
    return String(value == null ? "" : value).replace(/[&<>"']/g,function(ch){
      return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[ch];
    });
  }

  function classCodeFromUrl(){
    var code = new URLSearchParams(window.location.search).get("class");
    return code ? code.trim().toUpperCase() : "";
  }

  async function sha256(text){
    var bytes = new TextEncoder().encode(text);
    var hash = await crypto.subtle.digest("SHA-256", bytes);
    return Array.from(new Uint8Array(hash)).map(function(b){
      return b.toString(16).padStart(2,"0");
    }).join("");
  }

  async function legacyCreds(name,classCode,pin){
    var normalized = classCode.toUpperCase().trim() + "|" + name.toLowerCase().trim().replace(/\s+/g," ");
    var h = await sha256(normalized);
    return {
      email: "s_" + h.slice(0,24) + LEGACY_DOMAIN,
      password: String(pin) + "Aa!" + h.slice(0,4)
    };
  }

  function isLegacyEmail(email){
    return String(email || "").toLowerCase().endsWith(LEGACY_DOMAIN);
  }

  function legacyId(email){
    return String(email || "").toLowerCase().split("@")[0];
  }

  function skipKey(uid){
    return "stepup_skip_email_upgrade_" + String(uid || "");
  }

  function upgradedKey(email){
    return "stepup_account_upgraded_" + legacyId(email);
  }

  function pendingUidKey(uid){
    return "stepup_pending_email_upgrade_uid_" + String(uid || "");
  }

  function pendingLegacyKey(email){
    return "stepup_pending_email_upgrade_legacy_" + legacyId(email);
  }

  function savePendingUpgrade(data){
    if(!data || !data.uid || !data.legacyEmail) return;
    var raw = JSON.stringify(data);
    localStorage.setItem(pendingUidKey(data.uid),raw);
    localStorage.setItem(pendingLegacyKey(data.legacyEmail),raw);
  }

  function readPendingByUid(uid){
    try{return JSON.parse(localStorage.getItem(pendingUidKey(uid)) || "null");}catch(e){return null;}
  }

  function readPendingByLegacy(email){
    try{return JSON.parse(localStorage.getItem(pendingLegacyKey(email)) || "null");}catch(e){return null;}
  }

  function clearPendingUpgrade(data){
    if(!data) return;
    if(data.uid) localStorage.removeItem(pendingUidKey(data.uid));
    if(data.legacyEmail) localStorage.removeItem(pendingLegacyKey(data.legacyEmail));
  }

  function findAnyPendingUpgrade(){
    try{
      var found = null;
      Object.keys(localStorage).some(function(k){
        if(k.indexOf("stepup_pending_email_upgrade_uid_") !== 0) return false;
        var x = JSON.parse(localStorage.getItem(k) || "null");
        if(x && x.uid && x.legacyEmail && x.newEmail){
          found = x;
          return true;
        }
        return false;
      });
      return found;
    }catch(e){
      return null;
    }
  }

  function legacyPasswordFromCurrentEmail(email,pin){
    var id = legacyId(email);
    var h4 = id.indexOf("s_") === 0 ? id.slice(2,6) : "";
    return String(pin) + "Aa!" + h4;
  }

  function friendlyError(error,context){
    var code = error && error.code ? error.code : "";
    if(code === "auth/email-already-in-use") return "هذا البريد الإلكتروني مرتبط بحساب آخر.";
    if(code === "auth/invalid-email") return "تحققي من كتابة البريد الإلكتروني.";
    if(code === "auth/weak-password") return "اختاري كلمة مرور أقوى.";
    if(code === "auth/wrong-password" || code === "auth/invalid-credential") {
      return context === "upgrade" ? "رمز PIN الحالي غير صحيح." : "بيانات الدخول غير صحيحة.";
    }
    if(code === "auth/user-not-found") return "لم يتم العثور على الحساب.";
    if(code === "auth/too-many-requests") return "تمت محاولات كثيرة. حاولي مرة أخرى لاحقًا.";
    if(code === "auth/network-request-failed") return "تعذر الاتصال بالإنترنت. تحققي من الشبكة وحاولي مرة أخرى.";
    if(code === "auth/requires-recent-login") return "أعيدي تسجيل الدخول ثم حاولي تحديث الحساب مرة أخرى.";
    if(code === "auth/user-token-expired") return "انتهت جلسة الدخول القديمة بعد تأكيد البريد. سنعيد ربط الجلسة بالحساب نفسه.";
    if(code === "auth/operation-not-allowed") return "يتطلب Firebase التحقق من البريد الجديد أولًا. أُعيد ترتيب الخطوات لهذا الغرض.";
    return (error && error.message) ? error.message : "تعذر إكمال العملية.";
  }

  async function getClassByCode(code){
    var snap = await db().collection("joinCodes").doc(code).get();
    if(!snap.exists) return null;
    var j = snap.data() || {};
    return {
      id:j.classId,
      code:code,
      name:j.className || "",
      teacherId:j.teacherId,
      school:j.school || ""
    };
  }

  async function ensureStudentProfile(user,name,classObj,classCode){
    var ref = db().collection("users").doc(user.uid);
    var snap = await ref.get();
    if(snap.exists) return;
    await ref.set({
      role:"student",
      displayName:name,
      classId:classObj.id,
      classCode:classCode,
      teacherId:classObj.teacherId,
      school:classObj.school || "",
      createdAt:new Date().toISOString()
    });
  }

  async function studentContinue(forcedClassCode){
    if(!firebase.apps || !firebase.apps.length){
      return originalContinue ? originalContinue.apply(window.PROVE,arguments) : null;
    }

    var nameEl = document.getElementById("stName");
    var codeEl = document.getElementById("stClassCode");
    var pinEl = document.getElementById("stPin");
    var name = nameEl ? nameEl.value.trim() : "";
    var classCode = String(forcedClassCode || (codeEl ? codeEl.value : "") || "").trim().toUpperCase();
    var pin = pinEl ? pinEl.value.trim() : "";

    if(!name || !classCode || !/^\d{4}$/.test(pin)){
      alert("أدخلي الاسم الكامل وPIN المكوّن من 4 أرقام.");
      return;
    }

    var classObj = await getClassByCode(classCode);
    if(!classObj){
      alert("تعذر العثور على الفصل. تحققي من الرابط أو كود الفصل.");
      return;
    }

    var creds = await legacyCreds(name,classCode,pin);

    try{
      var result = await auth().signInWithEmailAndPassword(creds.email,creds.password);
      await ensureStudentProfile(result.user,name,classObj,classCode);
    }catch(error){
      var pending = readPendingByLegacy(creds.email);
      if(pending && pending.newEmail){
        try{
          var pendingResult = await auth().signInWithEmailAndPassword(pending.newEmail,creds.password);
          await ensureStudentProfile(pendingResult.user,name,classObj,classCode);
          setTimeout(maybeShowUpgrade,180);
          return;
        }catch(pendingError){
          console.warn("StepUp pending upgraded-email login failed",pendingError);
        }
      }
      console.warn("StepUp legacy student login failed",error);
      alert(
        "لم نتمكن من الدخول بهذه البيانات.\n\n" +
        "إذا سبق لك استخدام Step Up:\n" +
        "• اكتبي الاسم بالطريقة نفسها التي سجلتِ بها أول مرة.\n" +
        "• استخدمي PIN نفسه.\n\n" +
        "إذا سبق أن ربطتِ بريدك بالحساب، اختاري «الدخول بالبريد الإلكتروني».\n\n" +
        "إذا كانت هذه أول مرة لك فقط، اختاري «إنشاء حساب جديد — أول مرة فقط»."
      );
    }
  }

  async function studentRegister(forcedClassCode){
    if(!originalRegister) return;

    var nameEl = document.getElementById("stName");
    var codeEl = document.getElementById("stClassCode");
    var pinEl = document.getElementById("stPin");
    var name = nameEl ? nameEl.value.trim() : "";
    var classCode = String(forcedClassCode || (codeEl ? codeEl.value : "") || "").trim().toUpperCase();
    var pin = pinEl ? pinEl.value.trim() : "";

    if(!name || !classCode || !/^\d{4}$/.test(pin)){
      alert("لإنشاء الحساب أدخلي الاسم الكامل وPIN المكوّن من 4 أرقام.");
      return;
    }

    var creds = await legacyCreds(name,classCode,pin);
    if(localStorage.getItem(upgradedKey(creds.email)) === "1"){
      alert("سبق ربط هذا الحساب ببريد إلكتروني. اختاري «الدخول بالبريد الإلكتروني» للدخول إلى حسابك نفسه. ربط البريد اختياري للحسابات الأخرى.");
      return;
    }

    var ok = confirm(
      "إنشاء حساب جديد — لأول استخدام فقط.\n\n" +
      "إذا سبق لك استخدام Step Up من قبل، اختاري «إلغاء» ثم استخدمي «دخول بالحساب الحالي» حتى يبقى تقدمك محفوظًا في حسابك نفسه.\n\n" +
      "هل هذه أول مرة لك فعلًا في Step Up؟"
    );
    if(!ok) return;

    var temporaryCode = null;
    if(!codeEl){
      temporaryCode = document.createElement("input");
      temporaryCode.type = "hidden";
      temporaryCode.id = "stClassCode";
      temporaryCode.value = classCode;
      (nameEl && nameEl.parentNode ? nameEl.parentNode : document.body).appendChild(temporaryCode);
    }else if(forcedClassCode){
      codeEl.value = classCode;
    }

    try{
      return await originalRegister.call(window.PROVE);
    }finally{
      if(temporaryCode) temporaryCode.remove();
    }
  }

  async function studentEmailLogin(){
    var emailEl = document.getElementById("stepupStudentEmail");
    var passwordEl = document.getElementById("stepupStudentPassword");
    var email = emailEl ? emailEl.value.trim().toLowerCase() : "";
    var password = passwordEl ? passwordEl.value : "";

    if(!email || !password){
      alert("أدخلي البريد الإلكتروني وكلمة المرور.");
      return;
    }

    try{
      var result = await auth().signInWithEmailAndPassword(email,password);
      var snap = await db().collection("users").doc(result.user.uid).get();
      var profile = snap.exists ? snap.data() : null;
      if(!profile || profile.role !== "student"){
        await auth().signOut();
        alert("هذا الحساب ليس حساب طالبة في Step Up.");
        return;
      }
    }catch(error){
      alert("تعذر تسجيل الدخول: " + friendlyError(error,"emailLogin"));
    }
  }

  async function studentResetPassword(){
    var emailEl = document.getElementById("stepupStudentEmail");
    var email = emailEl ? emailEl.value.trim().toLowerCase() : "";
    if(!email){
      email = (prompt("اكتبي البريد الإلكتروني المرتبط بحسابك:") || "").trim().toLowerCase();
    }
    if(!email) return;

    try{
      auth().languageCode = "ar";
      await auth().sendPasswordResetEmail(email);
      alert("تم إرسال رابط استعادة كلمة المرور إلى بريدك الإلكتروني.");
    }catch(error){
      alert("تعذر إرسال رابط الاستعادة: " + friendlyError(error,"reset"));
    }
  }

  function emailLoginHTML(){
    var classCode = classCodeFromUrl();
    var classLine = classCode ? '<div class="stepup-account-class">رابط الفصل محفوظ — سجلي ببريدك فقط</div>' : "";
    return [
      '<div class="auth-shell stepup-email-login-page" dir="rtl">',
        '<div class="card stepup-email-login-card">',
          '<div class="stepup-account-brand">STEP <span>UP</span></div>',
          '<div class="eyebrow">تسجيل دخول الطالبة</div>',
          '<h1>الدخول بالبريد الإلكتروني</h1>',
          '<p class="muted"><strong>هذا الخيار فقط لمن اختارت سابقًا ربط بريدها بالحساب.</strong><br>ربط البريد ليس إلزاميًا؛ هو وسيلة إضافية لاستعادة كلمة المرور عند نسيانها.</p>',
          classLine,
          '<div class="stepup-account-form">',
            '<label for="stepupStudentEmail">البريد الإلكتروني</label>',
            '<input id="stepupStudentEmail" type="email" inputmode="email" autocomplete="username" placeholder="name@example.com">',
            '<label for="stepupStudentPassword">كلمة المرور</label>',
            '<input id="stepupStudentPassword" type="password" autocomplete="current-password" placeholder="••••••••">',
          '</div>',
          '<button class="btn btn-primary stepup-account-main-btn" id="stepupStudentEmailLoginBtn">دخول</button>',
          '<div class="stepup-account-link-row">',
            '<button class="stepup-account-link" id="stepupResetPasswordBtn">نسيت كلمة المرور؟</button>',
            '<button class="stepup-account-link" id="stepupBackLegacyBtn">العودة للدخول بالاسم وPIN</button>',
          '</div>',
          '<div class="stepup-account-safe-note">نفس حسابك ونفس تقدمك — فقط طريقة دخول أكثر أمانًا.</div>',
        '</div>',
      '</div>'
    ].join("");
  }

  function showEmailLogin(){
    var app = document.getElementById("app");
    if(!app) return;
    app.innerHTML = emailLoginHTML();
    var loginBtn = document.getElementById("stepupStudentEmailLoginBtn");
    var resetBtn = document.getElementById("stepupResetPasswordBtn");
    var backBtn = document.getElementById("stepupBackLegacyBtn");
    if(loginBtn) loginBtn.addEventListener("click",studentEmailLogin);
    if(resetBtn) resetBtn.addEventListener("click",studentResetPassword);
    if(backBtn) backBtn.addEventListener("click",function(){ window.location.reload(); });
    var pass = document.getElementById("stepupStudentPassword");
    if(pass) pass.addEventListener("keydown",function(e){
      if(e.key === "Enter") studentEmailLogin();
    });
  }

  function skipUpgrade(){
    var user = auth().currentUser;
    if(user) sessionStorage.setItem(skipKey(user.uid),"1");
    var overlay = document.getElementById("stepupAccountUpgradeOverlay");
    if(overlay) overlay.remove();
  }

  function upgradeHTML(profile){
    var firstName = esc(((profile && profile.displayName) || "طالبة").trim().split(/\s+/)[0]);
    return [
      '<div id="stepupAccountUpgradeOverlay" class="stepup-account-overlay" dir="rtl" role="dialog" aria-modal="true" aria-labelledby="stepupUpgradeTitle">',
        '<div class="stepup-account-upgrade-card">',
          '<div class="stepup-account-update-badge">تحديث جديد في Step Up</div>',
          '<h2 id="stepupUpgradeTitle">مرحبًا ' + firstName + ' 👋</h2>',
          '<p class="stepup-account-lead"><strong>إضافة البريد اختيارية.</strong><br>تفيدك إذا نسيتِ كلمة المرور وأردتِ استعادتها لاحقًا. يمكنك إضافته الآن أو اختيار «تخطي» والاستمرار بحسابك الحالي.</p>',
          '<div class="stepup-account-preserve">',
            '<span class="stepup-account-check">✓</span>',
            '<div><strong>لن يتغير حسابك أو تقدمك</strong><small>نتائجك، وحداتك، شهاداتك وتقدمك ستبقى كما هي.</small></div>',
          '</div>',
          '<div class="stepup-account-steps stepup-account-steps-four">',
            '<div><span>1</span><strong>أنتِ داخل حسابك الحالي</strong></div>',
            '<div><span>2</span><strong>أضيفي بريدك</strong></div>',
            '<div><span>3</span><strong>تحققي من البريد</strong></div>',
            '<div><span>4</span><strong>اختاري كلمة مرور</strong></div>',
          '</div>',
          '<div class="stepup-account-form">',
            '<label for="stepupUpgradeEmail">البريد الإلكتروني</label>',
            '<input id="stepupUpgradeEmail" type="email" inputmode="email" autocomplete="email" placeholder="name@example.com">',
            '<label for="stepupUpgradeEmailConfirm">تأكيد البريد الإلكتروني</label>',
            '<input id="stepupUpgradeEmailConfirm" type="email" inputmode="email" autocomplete="email" placeholder="أعيدي كتابة البريد">',
            '<label for="stepupUpgradePin">PIN الحالي للتأكيد</label>',
            '<input id="stepupUpgradePin" type="password" inputmode="numeric" maxlength="4" autocomplete="current-password" placeholder="4 أرقام">',
          '</div>',
          '<button id="stepupCompleteUpgradeBtn" class="btn btn-primary stepup-account-main-btn">إرسال رسالة التحقق</button>',
          '<button id="stepupSkipUpgradeBtn" class="stepup-account-skip">تخطي الآن والمتابعة بدون بريد</button>',
          '<div class="stepup-account-footer-note">إذا اخترتِ التخطي، سيبقى حسابك الحالي وتقدمك كما هما ويمكنك الاستمرار باستخدام الاسم وPIN.</div>',
        '</div>',
      '</div>'
    ].join("");
  }

  function verificationHTML(profile,pending){
    var firstName = esc(((profile && profile.displayName) || "طالبة").trim().split(/\s+/)[0]);
    return [
      '<div id="stepupAccountUpgradeOverlay" class="stepup-account-overlay" dir="rtl" role="dialog" aria-modal="true">',
        '<div class="stepup-account-upgrade-card">',
          '<div class="stepup-account-update-badge">الخطوة 3 من 4</div>',
          '<h2>تحققي من بريدك يا ' + firstName + '</h2>',
          '<p class="stepup-account-lead">أرسلنا رسالة تحقق إلى:</p>',
          '<div class="stepup-account-email-chip">' + esc(pending.newEmail) + '</div>',
          '<div class="stepup-account-preserve">',
            '<span class="stepup-account-check">✉</span>',
            '<div><strong>افتحي الرسالة واضغطي رابط التحقق</strong><small>بعدها ارجعي إلى Step Up واضغطي «تم التحقق من البريد».</small></div>',
          '</div>',
          '<div class="stepup-account-safe-note">حتى يتم التحقق، حسابك الحالي وتقدمك يظلان كما هما.<br>إذا لم تجدي الرسالة، تحققي من Junk / Spam وابحثي عن المرسل noreply@step-c44ef.firebaseapp.com.</div>',
          '<button id="stepupCheckVerificationBtn" class="btn btn-primary stepup-account-main-btn">تم التحقق من البريد</button>',
          '<button id="stepupResendVerificationBtn" class="btn btn-secondary stepup-account-main-btn">إعادة إرسال رسالة التحقق</button>',
          '<button id="stepupRestartUpgradeBtn" class="stepup-account-skip">تغيير البريد أو البدء من جديد</button>',
        '</div>',
      '</div>'
    ].join("");
  }

  function recoveryHTML(pending){
    return [
      '<div id="stepupAccountUpgradeOverlay" class="stepup-account-overlay" dir="rtl" role="dialog" aria-modal="true">',
        '<div class="stepup-account-upgrade-card">',
          '<div class="stepup-account-update-badge">تم تأكيد البريد ✓</div>',
          '<h2>بقيت خطوة أمان بسيطة</h2>',
          '<p class="stepup-account-lead">تم تأكيد بريدك بنجاح. بقي أن نفتح <strong>نفس حسابك الحالي</strong> مرة أخرى.</p>',
          '<div class="stepup-account-preserve">',
            '<span class="stepup-account-check">✓</span>',
            '<div><strong>حسابك وتقدمك محفوظان</strong><small>أدخلي PIN القديم مرة واحدة فقط لإكمال التحديث على الحساب نفسه.</small></div>',
          '</div>',
          '<div class="stepup-account-email-chip">' + esc(pending.newEmail) + '</div>',
          '<div class="stepup-account-form">',
            '<label for="stepupRecoveryPin">PIN الحالي</label>',
            '<input id="stepupRecoveryPin" type="password" inputmode="numeric" maxlength="4" autocomplete="current-password" placeholder="4 أرقام">',
          '</div>',
          '<button id="stepupRecoverSessionBtn" class="btn btn-primary stepup-account-main-btn">متابعة على نفس الحساب</button>',
          '<div class="stepup-account-footer-note">لن يتغير UID أو النتائج أو التقدم.</div>',
        '</div>',
      '</div>'
    ].join("");
  }

  function bindRecoveryUpgrade(){
    var recoverBtn = document.getElementById("stepupRecoverSessionBtn");
    if(recoverBtn) recoverBtn.addEventListener("click",recoverVerifiedSession);
  }

  async function showRecoveryStep(pending){
    replaceUpgradeOverlay(recoveryHTML(pending));
    bindRecoveryUpgrade();
  }

  async function recoverVerifiedSession(){
    if(upgradeBusy) return;
    var pin = ((document.getElementById("stepupRecoveryPin") || {}).value || "").trim();
    if(!/^\d{4}$/.test(pin)){
      alert("أدخلي PIN الحالي المكوّن من 4 أرقام.");
      return;
    }

    var pending = null;
    var staleUser = auth().currentUser;
    if(staleUser) pending = readPendingByUid(staleUser.uid);
    if(!pending) pending = findAnyPendingUpgrade();
    if(!pending || !pending.newEmail || !pending.legacyEmail){
      alert("لم نجد طلب تحديث البريد. أعيدي الدخول بالاسم وPIN ثم حاولي مرة أخرى.");
      return;
    }

    var oldPassword = legacyPasswordFromCurrentEmail(pending.legacyEmail,pin);
    var btn = document.getElementById("stepupRecoverSessionBtn");
    upgradeBusy = true;
    if(btn){
      btn.disabled = true;
      btn.textContent = "جاري فتح حسابك...";
    }

    try{
      try{ await auth().signOut(); }catch(e){}
      var result = await auth().signInWithEmailAndPassword(pending.newEmail,oldPassword);

      if(!result.user || result.user.uid !== pending.uid){
        try{ await auth().signOut(); }catch(e){}
        throw new Error("ACCOUNT_UID_MISMATCH");
      }

      var profile = await getStudentProfileForUpgrade(result.user);
      replaceUpgradeOverlay(passwordHTML(profile || {},pending));
      bindPasswordUpgrade();
    }catch(error){
      console.error("StepUp verified session recovery failed",error);
      if(error && error.message === "ACCOUNT_UID_MISMATCH"){
        alert("تعذر مطابقة الحساب. لم يتم تغيير أي تقدم. تواصلي مع المعلمة.");
      }else if(error && (error.code === "auth/wrong-password" || error.code === "auth/invalid-credential")){
        alert("PIN الحالي غير صحيح. جرّبي PIN الذي كنتِ تستخدمينه قبل إضافة البريد.");
      }else{
        alert("تعذر إكمال إعادة الدخول: " + friendlyError(error,"upgrade"));
      }
    }finally{
      upgradeBusy = false;
      if(btn && document.body.contains(btn)){
        btn.disabled = false;
        btn.textContent = "متابعة على نفس الحساب";
      }
    }
  }

  function passwordHTML(profile,pending){
    var firstName = esc(((profile && profile.displayName) || "طالبة").trim().split(/\s+/)[0]);
    return [
      '<div id="stepupAccountUpgradeOverlay" class="stepup-account-overlay" dir="rtl" role="dialog" aria-modal="true">',
        '<div class="stepup-account-upgrade-card">',
          '<div class="stepup-account-update-badge">الخطوة 4 من 4</div>',
          '<h2>تم التحقق من البريد ✓</h2>',
          '<p class="stepup-account-lead">بقي أن تختاري كلمة مرور لحسابك نفسه.</p>',
          '<div class="stepup-account-email-chip">' + esc(pending.newEmail) + '</div>',
          '<div class="stepup-account-form">',
            '<label for="stepupUpgradePassword">كلمة المرور الجديدة</label>',
            '<input id="stepupUpgradePassword" type="password" autocomplete="new-password" placeholder="8 أحرف أو أكثر">',
            '<label for="stepupUpgradePasswordConfirm">تأكيد كلمة المرور</label>',
            '<input id="stepupUpgradePasswordConfirm" type="password" autocomplete="new-password" placeholder="أعيدي كتابة كلمة المرور">',
            '<label for="stepupUpgradePin">PIN القديم للتأكيد الأخير</label>',
            '<input id="stepupUpgradePin" type="password" inputmode="numeric" maxlength="4" autocomplete="current-password" placeholder="4 أرقام">',
          '</div>',
          '<button id="stepupFinishUpgradeBtn" class="btn btn-primary stepup-account-main-btn">حفظ كلمة المرور وإكمال التحديث</button>',
          '<div class="stepup-account-footer-note">بعد هذه الخطوة يمكنك الدخول بالبريد وكلمة المرور الجديدة واستعادة كلمة المرور عند الحاجة.</div>',
        '</div>',
      '</div>'
    ].join("");
  }

  async function getStudentProfileForUpgrade(user){
    var snap = await db().collection("users").doc(user.uid).get();
    if(!snap.exists) return null;
    var profile = snap.data() || {};
    return profile.role === "student" ? profile : null;
  }

  function replaceUpgradeOverlay(html){
    var old = document.getElementById("stepupAccountUpgradeOverlay");
    if(old) old.remove();
    document.body.insertAdjacentHTML("beforeend",html);
  }

  function bindInitialUpgrade(){
    var saveBtn = document.getElementById("stepupCompleteUpgradeBtn");
    var skipBtn = document.getElementById("stepupSkipUpgradeBtn");
    if(saveBtn) saveBtn.addEventListener("click",requestEmailUpgrade);
    if(skipBtn) skipBtn.addEventListener("click",skipUpgrade);
  }

  function bindVerificationUpgrade(){
    var checkBtn = document.getElementById("stepupCheckVerificationBtn");
    var resendBtn = document.getElementById("stepupResendVerificationBtn");
    var restartBtn = document.getElementById("stepupRestartUpgradeBtn");
    if(checkBtn) checkBtn.addEventListener("click",checkVerifiedEmail);
    if(resendBtn) resendBtn.addEventListener("click",resendVerificationEmail);
    if(restartBtn) restartBtn.addEventListener("click",restartEmailUpgrade);
  }

  function bindPasswordUpgrade(){
    var finishBtn = document.getElementById("stepupFinishUpgradeBtn");
    if(finishBtn) finishBtn.addEventListener("click",finishPasswordUpgrade);
  }

  async function maybeShowUpgrade(){
    if(upgradeBusy) return;
    if(document.getElementById("stepupAccountUpgradeOverlay")) return;
    if(!firebase.apps || !firebase.apps.length) return;

    var user = auth().currentUser;
    if(!user){
      var signedOutPending = findAnyPendingUpgrade();
      if(signedOutPending){
        await showRecoveryStep(signedOutPending);
      }
      return;
    }

    try{
      var pending = readPendingByUid(user.uid);
      if(pending){
        try{
          await user.reload();
        }catch(e){
          if(e && e.code === "auth/user-token-expired"){
            await showRecoveryStep(pending);
            return;
          }
        }
        user = auth().currentUser || user;
        var pendingProfile = null;
        try{
          pendingProfile = await getStudentProfileForUpgrade(user);
        }catch(profileError){
          if(profileError && profileError.code === "auth/user-token-expired"){
            await showRecoveryStep(pending);
            return;
          }
          throw profileError;
        }
        if(!pendingProfile) return;

        if(String(user.email || "").toLowerCase() === String(pending.newEmail || "").toLowerCase()){
          replaceUpgradeOverlay(passwordHTML(pendingProfile,pending));
          bindPasswordUpgrade();
        }else{
          replaceUpgradeOverlay(verificationHTML(pendingProfile,pending));
          bindVerificationUpgrade();
        }
        return;
      }

      if(!isLegacyEmail(user.email)) return;
      if(sessionStorage.getItem(skipKey(user.uid)) === "1") return;

      var profile = await getStudentProfileForUpgrade(user);
      if(!profile) return;

      replaceUpgradeOverlay(upgradeHTML(profile));
      bindInitialUpgrade();
    }catch(error){
      console.warn("StepUp account upgrade prompt unavailable",error);
    }
  }

  async function requestEmailUpgrade(){
    if(upgradeBusy) return;

    var email = ((document.getElementById("stepupUpgradeEmail") || {}).value || "").trim().toLowerCase();
    var emailConfirm = ((document.getElementById("stepupUpgradeEmailConfirm") || {}).value || "").trim().toLowerCase();
    var pin = ((document.getElementById("stepupUpgradePin") || {}).value || "").trim();

    if(!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){
      alert("اكتبي بريدًا إلكترونيًا صحيحًا.");
      return;
    }
    if(email !== emailConfirm){
      alert("البريد الإلكتروني وتأكيد البريد غير متطابقين.");
      return;
    }
    if(isLegacyEmail(email)){
      alert("استخدمي بريدك الإلكتروني الحقيقي.");
      return;
    }
    if(!/^\d{4}$/.test(pin)){
      alert("أدخلي PIN الحالي المكوّن من 4 أرقام.");
      return;
    }

    var user = auth().currentUser;
    if(!user || !isLegacyEmail(user.email)){
      alert("تعذر بدء التحديث من هذا الحساب. أعيدي تسجيل الدخول بالاسم وPIN.");
      return;
    }

    var legacyEmail = String(user.email).toLowerCase();
    var oldPassword = legacyPasswordFromCurrentEmail(legacyEmail,pin);
    var btn = document.getElementById("stepupCompleteUpgradeBtn");

    upgradeBusy = true;
    if(btn){
      btn.disabled = true;
      btn.textContent = "جاري إرسال رسالة التحقق...";
    }

    try{
      var credential = firebase.auth.EmailAuthProvider.credential(legacyEmail,oldPassword);
      await user.reauthenticateWithCredential(credential);

      if(typeof user.verifyBeforeUpdateEmail !== "function"){
        throw new Error("Firebase verifyBeforeUpdateEmail is not available.");
      }

      auth().languageCode = "ar";
      await user.verifyBeforeUpdateEmail(email);

      var pending = {
        uid:user.uid,
        legacyEmail:legacyEmail,
        newEmail:email,
        startedAt:new Date().toISOString()
      };
      savePendingUpgrade(pending);
      sessionStorage.removeItem(skipKey(user.uid));

      var profile = await getStudentProfileForUpgrade(user);
      replaceUpgradeOverlay(verificationHTML(profile || {},pending));
      bindVerificationUpgrade();
    }catch(error){
      console.error("StepUp email verification request failed",error);
      alert("لم يتم تغيير حسابك. " + friendlyError(error,"upgrade"));
    }finally{
      upgradeBusy = false;
      if(btn && document.body.contains(btn)){
        btn.disabled = false;
        btn.textContent = "إرسال رسالة التحقق";
      }
    }
  }

  async function resendVerificationEmail(){
    if(upgradeBusy) return;
    var user = auth().currentUser;
    if(!user) return alert("أعيدي تسجيل الدخول ثم حاولي مرة أخرى.");

    var pending = readPendingByUid(user.uid);
    if(!pending || !pending.newEmail) return alert("لم نجد طلب تحقق قيد الانتظار.");

    var btn = document.getElementById("stepupResendVerificationBtn");
    upgradeBusy = true;
    if(btn){
      btn.disabled = true;
      btn.textContent = "جاري إعادة الإرسال...";
    }

    try{
      auth().languageCode = "ar";
      await user.verifyBeforeUpdateEmail(pending.newEmail);
      alert(
        "أُعيد إرسال رسالة التحقق ✓\n\n" +
        "تحققي من Inbox ثم Junk / Spam.\n" +
        "ابحثي عن المرسل: noreply@step-c44ef.firebaseapp.com"
      );
    }catch(error){
      if(error && error.code === "auth/requires-recent-login"){
        alert("انتهت صلاحية جلسة التحقق. ارجعي إلى الدخول بالاسم وPIN ثم حاولي إعادة الإرسال مرة أخرى.");
      }else{
        alert("تعذر إعادة الإرسال: " + friendlyError(error,"upgrade"));
      }
    }finally{
      upgradeBusy = false;
      if(btn && document.body.contains(btn)){
        btn.disabled = false;
        btn.textContent = "إعادة إرسال رسالة التحقق";
      }
    }
  }

  async function checkVerifiedEmail(){
    if(upgradeBusy) return;
    var user = auth().currentUser;
    if(!user){
      var signedOutPending = findAnyPendingUpgrade();
      if(signedOutPending){
        await showRecoveryStep(signedOutPending);
        return;
      }
      return alert("لم نجد جلسة التحديث. أعيدي الدخول بالاسم وPIN.");
    }

    var pending = readPendingByUid(user.uid) || findAnyPendingUpgrade();
    if(!pending) return alert("لم نجد طلب تحديث قيد الانتظار.");

    var btn = document.getElementById("stepupCheckVerificationBtn");
    upgradeBusy = true;
    if(btn){
      btn.disabled = true;
      btn.textContent = "جاري التحقق...";
    }

    try{
      await user.reload();
      user = auth().currentUser || user;
      if(String(user.email || "").toLowerCase() !== String(pending.newEmail || "").toLowerCase()){
        alert("لم يكتمل التحقق بعد. افتحي رسالة Firebase في بريدك واضغطي رابط التحقق، ثم ارجعي وحاولي مرة أخرى.");
        return;
      }

      var profile = await getStudentProfileForUpgrade(user);
      replaceUpgradeOverlay(passwordHTML(profile || {},pending));
      bindPasswordUpgrade();
    }catch(error){
      if(error && error.code === "auth/user-token-expired"){
        await showRecoveryStep(pending);
      }else{
        alert("تعذر التأكد من حالة البريد: " + friendlyError(error,"upgrade"));
      }
    }finally{
      upgradeBusy = false;
      if(btn && document.body.contains(btn)){
        btn.disabled = false;
        btn.textContent = "تم التحقق من البريد";
      }
    }
  }

  async function restartEmailUpgrade(){
    var user = auth().currentUser;
    if(!user) return;
    var pending = readPendingByUid(user.uid);
    if(!pending) return;

    try{ await user.reload(); }catch(e){}
    user = auth().currentUser || user;

    if(String(user.email || "").toLowerCase() === String(pending.newEmail || "").toLowerCase()){
      alert("تم التحقق من البريد بالفعل. أكملي الآن اختيار كلمة المرور.");
      var profileDone = await getStudentProfileForUpgrade(user);
      replaceUpgradeOverlay(passwordHTML(profileDone || {},pending));
      bindPasswordUpgrade();
      return;
    }

    clearPendingUpgrade(pending);
    var profile = await getStudentProfileForUpgrade(user);
    replaceUpgradeOverlay(upgradeHTML(profile || {}));
    bindInitialUpgrade();
  }

  async function finishPasswordUpgrade(){
    if(upgradeBusy) return;

    var password = ((document.getElementById("stepupUpgradePassword") || {}).value || "");
    var passwordConfirm = ((document.getElementById("stepupUpgradePasswordConfirm") || {}).value || "");
    var pin = ((document.getElementById("stepupUpgradePin") || {}).value || "").trim();

    if(password.length < 8){
      alert("اختاري كلمة مرور من 8 أحرف أو أكثر.");
      return;
    }
    if(password !== passwordConfirm){
      alert("كلمة المرور وتأكيدها غير متطابقين.");
      return;
    }
    if(!/^\d{4}$/.test(pin)){
      alert("أدخلي PIN القديم المكوّن من 4 أرقام.");
      return;
    }

    var user = auth().currentUser;
    if(!user) return alert("أعيدي تسجيل الدخول ثم تابعي التحديث.");

    var pending = readPendingByUid(user.uid);
    if(!pending) return alert("لم نجد طلب تحديث قيد الانتظار.");

    var btn = document.getElementById("stepupFinishUpgradeBtn");
    upgradeBusy = true;
    if(btn){
      btn.disabled = true;
      btn.textContent = "جاري إكمال التحديث...";
    }

    try{
      await user.reload();
      user = auth().currentUser || user;

      if(String(user.email || "").toLowerCase() !== String(pending.newEmail || "").toLowerCase()){
        alert("يجب التحقق من البريد أولًا.");
        return;
      }

      var oldPassword = legacyPasswordFromCurrentEmail(pending.legacyEmail,pin);
      var credential = firebase.auth.EmailAuthProvider.credential(pending.newEmail,oldPassword);
      await user.reauthenticateWithCredential(credential);
      await user.updatePassword(password);

      localStorage.setItem(upgradedKey(pending.legacyEmail),"1");
      sessionStorage.removeItem(skipKey(user.uid));
      clearPendingUpgrade(pending);

      var overlay = document.getElementById("stepupAccountUpgradeOverlay");
      if(overlay) overlay.remove();

      alert(
        "تم تحديث حسابك بنجاح ✓\n\n" +
        "• نفس الحساب ونفس التقدم محفوظان.\n" +
        "• من الآن استخدمي بريدك الإلكتروني وكلمة المرور الجديدة.\n" +
        "• يمكنك استخدام «نسيت كلمة المرور؟» عند الحاجة."
      );
    }catch(error){
      console.error("StepUp password upgrade failed",error);
      alert("لم يتغير تقدمك أو حسابك. " + friendlyError(error,"upgrade"));
    }finally{
      upgradeBusy = false;
      if(btn && document.body.contains(btn)){
        btn.disabled = false;
        btn.textContent = "حفظ كلمة المرور وإكمال التحديث";
      }
    }
  }

  function enhanceAuthUI(){
    var nameEl = document.getElementById("stName");
    var pinEl = document.getElementById("stPin");
    if(!nameEl || !pinEl) return;

    var root = nameEl.closest(".student-entry-card") || document.getElementById("authBox");
    if(!root || root.querySelector(".stepup-account-actions")) return;

    var note = root.querySelector(".quick-entry-note");
    if(note){
      note.innerHTML =
        '<strong>اختاري الطريقة المناسبة لك:</strong><br>' +
        '• لديك حساب؟ اكتبي نفس الاسم وPIN ثم اضغطي «دخول بالحساب الحالي».<br>' +
        '• أول مرة لك؟ اختاري «إنشاء حساب جديد — أول مرة فقط».<br>' +
        '• ربط البريد اختياري، ويفيدك في استعادة كلمة المرور إذا نسيتِها.<br>' +
        '• إذا سبق أن ربطتِ بريدك، يمكنك الدخول بالبريد الإلكتروني.';
    }

    var primary = root.querySelector("button.btn-primary");
    if(primary && /studentContinue/.test(primary.getAttribute("onclick") || "")){
      primary.textContent = "دخول بالحساب الحالي";
    }

    var forcedClassCode = classCodeFromUrl();
    var actions = document.createElement("div");
    actions.className = "stepup-account-actions";

    var createBtn = document.createElement("button");
    createBtn.type = "button";
    createBtn.className = "btn btn-secondary stepup-account-create";
    createBtn.textContent = "إنشاء حساب جديد — أول مرة فقط";
    createBtn.addEventListener("click",function(){ studentRegister(forcedClassCode); });

    var emailBtn = document.createElement("button");
    emailBtn.type = "button";
    emailBtn.className = "stepup-account-email-entry";
    emailBtn.textContent = "سبق أن ربطتِ بريدك؟ الدخول بالبريد الإلكتروني";
    emailBtn.addEventListener("click",showEmailLogin);

    actions.appendChild(createBtn);
    actions.appendChild(emailBtn);

    if(primary && primary.parentNode){
      primary.insertAdjacentElement("afterend",actions);
    }else{
      root.appendChild(actions);
    }
  }

  function scheduleEnhance(){
    clearTimeout(observerTimer);
    observerTimer = setTimeout(function(){
      enhanceAuthUI();
      maybeShowUpgrade();
    },80);
  }

  window.PROVE.studentContinue = studentContinue;
  window.PROVE.studentRegister = studentRegister;

  window.STEPUP_ACCOUNT = {
    showEmailLogin:showEmailLogin,
    studentEmailLogin:studentEmailLogin,
    studentResetPassword:studentResetPassword,
    maybeShowUpgrade:maybeShowUpgrade,
    requestEmailUpgrade:requestEmailUpgrade,
    checkVerifiedEmail:checkVerifiedEmail,
    recoverVerifiedSession:recoverVerifiedSession,
    resendVerificationEmail:resendVerificationEmail,
    finishPasswordUpgrade:finishPasswordUpgrade,
    skipUpgrade:skipUpgrade,
    isLegacyEmail:isLegacyEmail
  };

  try{
    auth().onAuthStateChanged(function(){ setTimeout(maybeShowUpgrade,220); });
  }catch(error){
    console.warn("StepUp account auth observer unavailable",error);
  }

  var observer = new MutationObserver(scheduleEnhance);
  observer.observe(document.documentElement,{childList:true,subtree:true});
  window.addEventListener("DOMContentLoaded",scheduleEnhance);
  setTimeout(scheduleEnhance,120);
})();