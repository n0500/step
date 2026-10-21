// STEP UP: safe new-name sign-in for existing Firebase Auth accounts.
// Keeps the existing UID and email/password. Requires loginAliases Firestore rules.
(function(){
  "use strict";
  if(!window.PROVE || !window.firebase || !firebase.auth || !firebase.firestore) return;

  const originalLogin = window.PROVE.studentContinue;
  const originalEditName = window.PROVE.editStudentName;
  const auth = () => firebase.auth();
  const db = () => firebase.firestore();
  const normalizeName = v => String(v || "").trim().replace(/\s+/g," ");
  const normalizePin = v => String(v || "").trim()
    .replace(/[٠-٩]/g,c=>String(c.charCodeAt(0)-1632))
    .replace(/[۰-۹]/g,c=>String(c.charCodeAt(0)-1776));
  const legacyPattern = /^s_([a-f0-9]{24})@students\.proveit\.local$/i;
  const failedLogin = code => /invalid-credential|wrong-password|invalid-login-credentials|user-not-found|invalid-email/.test(String(code||""));

  async function aliasId(name, classCode) {
    const key = normalizeName(classCode).toUpperCase() + "|" + normalizeName(name).toLowerCase();
    const bytes = new TextEncoder().encode(key);
    const hash = await crypto.subtle.digest("SHA-256",bytes);
    const hex = Array.from(new Uint8Array(hash)).map(b=>b.toString(16).padStart(2,"0")).join("");
    return "a_"+hex.slice(0,24);
  }

  async function checkSavedPin(user,profile,pin){
    // For already signed-in students the 4-digit PIN saved by their most
    // recent successful login is authoritative for profile confirmation.
    // Do not require a *second* Auth reauthentication just to rename a
    // profile: Firebase may reject the reauth operation independently.
    if(normalizePin(profile.pin)===pin) return {valid:true,verifiedBy:"saved-pin"};
    // If the profile copy has not been saved (or is stale), verify against
    // the existing legacy login WITHOUT creating a new user or changing UID.
    const match=String(user.email||"").match(legacyPattern);
    if(!match) return {valid:false,verifiedBy:"not-legacy"};
    const credential=firebase.auth.EmailAuthProvider.credential(
      user.email, pin+"Aa!"+match[1].slice(0,4));
    try{
      await user.reauthenticateWithCredential(credential);
      return {valid:true,verifiedBy:"auth"};
    }catch(error){
      if(failedLogin(error?.code))return {valid:false,verifiedBy:"auth-rejected"};
      throw error;
    }
  }

  async function editName(){
    if(!auth().currentUser)return originalEditName();
    const user=auth().currentUser;
    let original;
    try{
      const snap=await db().collection("users").doc(user.uid).get({source:"server"});
      if(!snap.exists || snap.data().role!=="student")return alert("ملف الطالبة غير متاح.");
      original=snap.data();
    }catch(error){
      console.warn("StepUp profile read",error?.code);
      return alert("تعذّر فتح ملف الطالبة. تحققي من الاتصال.");
    }

    const input=prompt("Enter your correct name / اكتبي اسمك الصحيح:",original.displayName||"");
    if(input===null)return;
    const next=normalizeName(input);
    if(next.length<2||next.length>80)return alert("أدخلي الاسم الصحيح من 2 إلى 80 حرفًا.");
    const pinInput=prompt("Enter your current PIN / أدخلي رمز PIN الحالي:");
    if(pinInput===null)return;
    const pin=normalizePin(pinInput);
    if(!/^[0-9]{4}$/.test(pin))return alert("أدخلي رمز PIN المكوّن من 4 أرقام.");

    // New-name PIN login is supported only for original name+PIN accounts.
    // Never put a student's genuine linked email in a publicly readable alias.
    const email=String(user.email||"");
    if(!legacyPattern.test(email)){
      return alert("هذا الحساب مرتبط بالبريد الإلكتروني. لا يمكن تغيير اسم الدخول برمز PIN في هذا النوع من الحسابات. تواصلي مع المعلمة.");
    }
    let pinCheck;
    try{pinCheck=await checkSavedPin(user,original,pin);}
    catch(error){
      console.warn("StepUp PIN verification",error?.code);
      return alert("تعذّر التحقق من PIN بسبب الاتصال بخدمة تسجيل الدخول ("+
        String(error?.code||"غير معروف")+"). لم يتغير الحساب.");
    }
    if(!pinCheck.valid){
      return alert("لم نتمكن من تأكيد رمز PIN. إن كان الرمز صحيحًا وكنتِ تدخلين به، اطلبي من المعلمة التحقق من رمزك في Student Access. سبب التحقق: "+pinCheck.verifiedBy);
    }

    const id=await aliasId(next,original.classCode);
    const aliasRef=db().collection("loginAliases").doc(id);
    const userRef=db().collection("users").doc(user.uid);
    try{
      await db().runTransaction(async transaction=>{
        const [profileSnap,aliasSnap]=await Promise.all([
          transaction.get(userRef),transaction.get(aliasRef)
        ]);
        if(!profileSnap.exists || profileSnap.data().role!=="student"){
          throw new Error("account-missing");
        }
        const current=profileSnap.data();
        if(current.classCode!==original.classCode || current.displayName!==original.displayName){
          throw new Error("profile-changed");
        }
        if(aliasSnap.exists && aliasSnap.data().uid!==user.uid){
          throw new Error("name-in-use");
        }
        const data={
          uid:user.uid,
          classCode:current.classCode,
          loginName:next,
          loginEmail:email,
          createdAt:firebase.firestore.FieldValue.serverTimestamp()
        };
        if(!aliasSnap.exists)transaction.set(aliasRef,data);
        const updates={};
        if(current.displayName!==next)updates.displayName=next;
        if(pinCheck.verifiedBy==="auth" && normalizePin(current.pin)!==pin) updates.pin=pin;
        if(Object.keys(updates).length)transaction.update(userRef,updates);
      });

      // Only after the alias + profile update have succeeded together.
      alert("تم اعتماد الاسم الجديد. يمكنكِ تسجيل الدخول به من أي جهاز، باستخدام رمز PIN نفسه. بقي الحساب والتقدم والشهادات كما هي.");
      window.location.reload();
    }catch(error){
      const code=String(error?.code||error?.message||"");
      console.warn("StepUp rename rejected",code);
      if(code.includes("name-in-use"))return alert("هذا الاسم مستخدم لحساب آخر في الفصل. تواصلي مع معلمتك.");
      if(code.includes("profile-changed"))return alert("تغيرت بيانات حسابك. حدّثي الصفحة ثم حاولي مجددًا.");
      if(code.includes("permission-denied")){
        return alert("رفضت Firebase حفظ اسم الدخول الجديد (permission-denied). لا يتعلق هذا بخطأ في PIN. لم يتغير الحساب، ويحتاج الأمر مراجعة قواعد Firestore المنشورة.");
      }
      return alert("تعذّر حفظ اسم الدخول الجديد. لم تتغير بيانات حسابك، حاولي مجددًا.");
    }
  }

  async function signInWithNewName(forcedClassCode){
    const name=normalizeName(document.getElementById("stName")?.value);
    const classCode=normalizeName(forcedClassCode||document.getElementById("stClassCode")?.value).toUpperCase();
    const pin=normalizePin(document.getElementById("stPin")?.value);
    if(!name || !classCode || !/^[0-9]{4}$/.test(pin)){
      return originalLogin.apply(this,arguments);
    }
    if(auth().currentUser)return originalLogin.apply(this,arguments);

    // Preserve legacy login priority so a later renamed student cannot take
    // over the login route of another student with the same original name.
    const id=(await aliasId(name,classCode)).slice(2);
    const directEmail="s_"+id+"@students.proveit.local";
    const directPassword=pin+"Aa!"+id.slice(0,4);
    let directResult;
    try{
      directResult=await auth().signInWithEmailAndPassword(directEmail,directPassword);
    }catch(error){
      if(!failedLogin(error?.code)){
        console.warn("StepUp legacy login error",error?.code);
        return alert("تعذّر الدخول حاليًا. تحققي من الإنترنت وحاولي مجددًا.");
      }
    }

    if(directResult){
      try{
        const profile=await db().collection("users").doc(directResult.user.uid).get({source:"server"});
        if(!profile.exists || profile.data().role!=="student"){
          await auth().signOut();
          return alert("ملف الحساب غير متاح. تواصلي مع معلمتك.");
        }
        window.location.reload();
      }catch(error){
        console.warn("StepUp legacy profile read",error?.code);
        return alert("تعذّر قراءة الحساب. تحققي من الإنترنت.");
      }
      return;
    }

    let entry=null;
    try{
      const snap=await db().collection("loginAliases").doc("a_"+id).get({source:"server"});
      if(snap.exists)entry=snap.data();
    }catch(error){
      // Leave old login/email-upgrade behavior intact until alias rules deploy.
      if(error?.code!=="permission-denied")console.warn("StepUp alias lookup",error?.code);
      return originalLogin.apply(this,arguments);
    }
    if(!entry)return originalLogin.apply(this,arguments);
    const match=String(entry.loginEmail||"").match(legacyPattern);
    if(!match || entry.classCode!==classCode ||
       normalizeName(entry.loginName).toLowerCase()!==name.toLowerCase() ||
       !entry.uid){
      return alert("تعذّر التعرف على بيانات الاسم الجديد. تواصلي مع معلمتك.");
    }
    try{
      const result=await auth().signInWithEmailAndPassword(
        entry.loginEmail,pin+"Aa!"+match[1].slice(0,4));
      const profile=await db().collection("users").doc(result.user.uid).get({source:"server"});
      if(result.user.uid!==entry.uid || !profile.exists ||
        profile.data().role!=="student" ||
        profile.data().classCode!==classCode ||
        normalizeName(profile.data().displayName).toLowerCase()!==name.toLowerCase()){
        await auth().signOut();
        return alert("بيانات الاسم الجديد لا تطابق حساب الطالبة. تواصلي مع معلمتك.");
      }
      window.location.reload();
    }catch(error){
      console.warn("StepUp alias login failed",error?.code);
      if(failedLogin(error?.code)){
        return alert("رمز PIN غير صحيح لهذا الحساب. تحققي منه أو تواصلي مع معلمتك.");
      }
      return alert("تعذّر تسجيل الدخول الآن. تحققي من الاتصال وحاولي مجددًا.");
    }
  }

  signInWithNewName.__accountGuardPatched="20261021-alias-login";
  signInWithNewName.__busyWrapped=true; // Do not let the older auto-create/busy wrappers override this.
  window.PROVE.studentContinue=signInWithNewName;
  window.PROVE.editStudentName=editName;
  window.STEPUP_NAME_LOGIN={version:"20261021-alias-login",aliasId};
})();