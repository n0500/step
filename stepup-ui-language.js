/* STEP UP student UI language — English default, Arabic optional.
 * No authentication, Firestore, scores, certificates, or lesson logic changes.
 * Scope: student UI labels only. Questions, answer choices, unit titles and
 * reading/listening/STEP lesson materials remain in English.
 */
(function(){
  "use strict";
  if(window.STEPUP_UI_LANGUAGE) return;

  const VERSION="20261021-student-language-v1";
  const KEY_PREFIX="stepup_student_ui_lang_";
  const ui={
    "Home":"الرئيسية",
    "My Journey":"رحلتي",
    "My Progress":"تقدمي",
    "Assistant":"المساعد",
    "Welcome back":"مرحبًا بعودتك",
    "Your next step":"خطوتك القادمة",
    "Continue where you left off":"واصلي من حيث توقفتِ",
    "Your journey will appear here.":"ستظهر رحلتك التعليمية هنا.",
    "Continue your journey":"واصلي رحلتك",
    "Continue":"متابعة",
    "View My Journey":"عرض رحلتي",
    "Journey complete":"اكتملت الرحلة",
    "You did it ✨":"أحسنتِ ✨",
    "Your open-unit journey is complete. Revisit any stop whenever you want a quick refresh.":"أنجزتِ رحلتك في الوحدات المفتوحة. يمكنك مراجعة أي مهارة وقتما تشائين.",
    "Journey progress":"تقدم الرحلة",
    "Your pace":"خطوتك",
    "Keep it light":"تعلّمي بخطوات بسيطة",
    "A short, focused session is enough. StepUp always shows the next useful step.":"جلسة تدريب قصيرة ومركزة تكفي، وسيعرض لك التطبيق الخطوة المناسبة التالية.",
    "My Weekly Journey":"رحلتي هذا الأسبوع",
    "Ready":"جاهزة",
    "Bronze":"برونزي",
    "Silver":"فضي",
    "Gold":"ذهبي",
    "Diamond":"ماسي",
    "My Journey":"رحلتي",
    "Small steps. Real progress.":"خطوات صغيرة، وتقدم مستمر.",
    "One clear stop at a time — no long task list.":"أنجزي خطوة واضحة في كل مرة، دون مهام طويلة.",
    "Complete":"مكتملة",
    "In progress":"قيد الإنجاز",
    "Locked":"مغلقة",
    "Teacher will open this unit":"ستفتح المعلمة هذه الوحدة",
    "Want extra STEP practice?":"هل تريدين تدريبًا إضافيًا على STEP؟",
    "Open practice library →":"افتحي مكتبة التدريبات ←",
    "Open practice library":"افتحي مكتبة التدريبات",
    "My Journey":"رحلتي",
    "Master the Unit":"أتقني الوحدة",
    "StepUp checks what you know and gives support only when needed.":"يتحقق STEP UP مما أتقنتِه ويقدم الدعم عند الحاجة.",
    "Mastered":"متقنة",
    "Quick adaptive check":"تحقق سريع يتكيف مع مستواك",
    "Unlocks next":"يفتح الخطوة التالية",
    "Completed":"مكتملة",
    "Correct":"صحيح",
    "Needs review":"تحتاج إلى مراجعة",
    "All answers correct":"جميع الإجابات صحيحة",
    "Complete the previous stop first":"أكملي الخطوة السابقة أولًا",
    "Read":"القراءة",
    "Listen":"الاستماع",
    "Find evidence in a short reading.":"ابحثي عن الدليل في قطعة قراءة قصيرة.",
    "Listen for the idea and key details.":"استمعي للفكرة العامة والتفاصيل المهمة.",
    "6 quick questions • strategy first.":"6 أسئلة قصيرة مع التركيز على الاستراتيجية.",
    "STEP Practice":"تدريب STEP",
    "Final Challenge":"التحدي النهائي",
    "Finish the unit with confidence.":"أنهي الوحدة بثقة.",
    "Unit journey progress":"تقدم رحلة الوحدة",
    "Back to units":"العودة إلى الوحدات",
    "Back to My Journey":"العودة إلى رحلتي",
    "Review Lesson":"مراجعة الدرس",
    "Review the lesson":"مراجعة الدرس",
    "Review The Lesson":"مراجعة الدرس",
    "Practice Again":"التدرب مرة أخرى",
    "Fix My Mistakes":"تصحيح أخطائي",
    "Fix my mistakes":"تصحيح أخطائي",
    "Continue Review":"متابعة المراجعة",
    "Continue review":"متابعة المراجعة",
    "Check":"تحققي",
    "Confirm Answer":"تأكيد الإجابة",
    "Confirm":"تأكيد",
    "Next Question":"السؤال التالي",
    "Next":"التالي",
    "Try Again":"حاولي مجددًا",
    "See Results":"عرض النتائج",
    "See Result":"عرض النتيجة",
    "See My Learning Level":"عرض مستوى تعلمي",
    "Practice Again · Full Unit":"التدرب مجددًا · الوحدة كاملة",
    "Restart":"إعادة البدء",
    "Start":"ابدئي",
    "Start Practice":"ابدئي التدريب",
    "Start Challenge":"ابدئي التحدي",
    "Done":"تم",
    "Saving…":"جارٍ الحفظ…",
    "Loading…":"جارٍ التحميل…",
    "Cancel":"إلغاء",
    "Close":"إغلاق",
    "Skip":"تخطي",
    "Hint":"تلميح",
    "English Hint":"تلميح بالإنجليزية",
    "Show Hint":"عرض تلميح",
    "Try now":"جرّبي الآن",
    "Learning journey":"الرحلة التعليمية",
    "Units at a glance":"الوحدات باختصار",
    "Open Journey":"افتحي رحلتي",
    "Progress":"التقدم",
    "See what you have mastered and what deserves one quick review.":"تعرّفي على المهارات التي أتقنتِها وما يحتاج إلى مراجعة سريعة.",
    "Detailed STEP practice results":"تفاصيل نتائج تدريبات STEP",
    "Current Skill Profile":"مستوى المهارات الحالي",
    "Recommended Focus":"مجالات مقترحة للتركيز",
    "History":"السجل",
    "Recent Results":"النتائج الأخيرة",
    "Training":"التدريب",
    "Type":"النوع",
    "Score":"الدرجة",
    "Status":"الحالة",
    "Date":"التاريخ",
    "No results yet.":"لا توجد نتائج بعد.",
    "Strong Skills":"مهارات متميزة",
    "Skills to Review":"مهارات تحتاج إلى مراجعة",
    "Learning Tools":"أدوات التعلم",
    "Learn smarter":"تعلّمي بذكاء",
    "Choose the support you need. Every tool stays inside StepUp.":"اختاري المساعدة المناسبة لكِ؛ جميع الأدوات داخل STEP UP.",
    "Your study companion":"رفيقك في التعلم",
    "Need help?":"هل تحتاجين إلى مساعدة؟",
    "Ask about the unit you are studying. Get one clear explanation or a quick practice — then return to your journey.":"اسألي عن الوحدة التي تدرسينها، واحصلي على شرح واضح أو تدريب سريع، ثم عودي إلى رحلتك.",
    "Ask Assistant":"اسألي المساعد",
    "AI Tutor":"مساعد ذكي",
    "Dictionary":"القاموس",
    "Dictionary + My Words":"القاموس وكلماتي",
    "Look up a word, hear it, and save it for later.":"ابحثي عن معنى الكلمة، واستمعي إلى نطقها واحفظيها.",
    "Writing Coach":"مساعد الكتابة",
    "Optional support when you want help planning or revising writing.":"مساعدة اختيارية في تخطيط الكتابة ومراجعتها.",
    "Ask questions, get a clear explanation, and continue your journey.":"اطرحي أسئلتك واحصلي على شرح واضح، ثم تابعي رحلتك.",
    "Search meanings, hear pronunciation, and save words for later.":"ابحثي عن المعاني، واستمعي إلى النطق، واحفظي الكلمات.",
    "Optional help when you want support with writing.":"مساعدة اختيارية في الكتابة.",
    "My Growth":"تطوري",
    "See your level, goals, achievements, and learning progress.":"اطّلعي على مستواك وأهدافك وإنجازاتك وتقدمك.",
    "Quick":"سريع",
    "StepUp Path":"مسار STEP UP",
    "Profile":"الملف الشخصي",
    "My Profile":"ملفي الشخصي",
    "Keep your name accurate. Class and school information are managed by your teacher.":"احرصي على صحة اسمك؛ تتولى المعلمة إدارة بيانات الفصل والمدرسة.",
    "StepUp Student":"طالبة STEP UP",
    "Change Login Name":"تغيير اسم الدخول",
    "Class":"الفصل",
    "School":"المدرسة",
    "Account":"الحساب",
    "Student":"طالبة",
    "Log out":"تسجيل الخروج",
    "Logout":"تسجيل الخروج",
    "App Language":"لغة التطبيق",
    "Language":"اللغة",
    "English":"الإنجليزية",
    "Arabic":"العربية",
    "Your name":"اسمك",
    "Name":"الاسم",
    "Training Library":"مكتبة التدريبات",
    "Choose an open unit and continue at your pace.":"اختاري وحدة مفتوحة وتابعي التعلم وفق سرعتك.",
    "Practice":"تدريب",
    "Timed practice":"تدريب بوقت محدد",
    "Mini STEP Challenge":"تحدي STEP المصغر",
    "Three-Pass Method":"استراتيجية المرور الثلاثي",
    "Latest":"الأحدث",
    "Available":"متاحة",
    "🔒 Coming Soon":"🔒 قريبًا",
    "This unit is not open yet.":"هذه الوحدة لم تُفتح بعد.",
    "Grammar":"القواعد",
    "Vocabulary":"المفردات",
    "Reading":"القراءة",
    "Listening":"الاستماع",
    "Writing":"الكتابة",
    "Real Talk":"التعبيرات الشائعة",
    "STEP":"STEP",
    "Next:":"التالي:",
    "Your learning report":"تقرير تعلمك",
    "Continuing automatically. You can continue now.":"تستمر المراجعة تلقائيًا، ويمكنك المتابعة الآن.",
    "Review completed":"اكتملت المراجعة",
    "Challenge complete!":"اكتمل التحدي!",
    "Correct answer!":"إجابة صحيحة!",
    "Incorrect answer":"إجابة غير صحيحة",
    "Your answer":"إجابتك",
    "Correct answer":"الإجابة الصحيحة",
    "See My Progress":"عرض تقدمي",
    "Your Progress":"تقدمك",
    "Keep climbing":"واصلي التقدم",
    "Units open":"وحدات مفتوحة",
    "Units complete":"وحدات مكتملة",
    "Your next step":"خطوتك القادمة",
    "Your next step:":"خطوتك القادمة:",
    "YOUR UNIT CHECKLIST":"قائمة متابعة الوحدة",
    "What’s left?":"ما المتبقي؟",
    "Open a unit to continue exactly where you need.":"افتحي الوحدة لتتابعي المهارات التي تحتاجينها."
  };
  const AR_SOURCE={
    "يمكن اعتماد الاسم الجديد للدخول مع بقاء رمز PIN نفسه":"يمكنك تسجيل الدخول بالاسم الجديد ورمز PIN نفسه."
  };
  const EN_FROM_AR={
    "يمكن اعتماد الاسم الجديد للدخول مع بقاء رمز PIN نفسه":"You can sign in with your new name and the same PIN."
  };
  const excludeSelector=[
    "script","style","noscript","code","pre","textarea","input","select","option",
    ".journey-question-card h2",".journey-question-card .journey-option",
    ".journey-question-card .question",".journey-question-card .choices",
    ".journey-content-card",".journey-passage",".reading-passage",
    ".listening-script",".reading-text",".source-text",".source-passage",
    ".passage",".question-stem",".question-text",".question-prompt",
    ".answer-choice",".answer-option",".training-question",".exam-question",
    ".question-card .question",".quiz-question",".smart-fix-prompt",
    "[data-question-id]","[data-option-id]","[data-english-content]",
    ".journey-unit-card h3",".journey-unit-card p",
    ".journey-unit-hero h1",".journey-unit-hero p",
    ".journey-subtask b",".journey-stop-icon",
    ".unit-title",".unit-objective",".training-title",".training-card h4",
    ".journey-question-card .journey-answer-options",
    ".journey-question-card label",
    ".student-profile-main strong",
    ".student-welcome h1"
  ].join(",");
  const saved=new WeakMap();
  let selected="en",storageKey="",queued=false,installed=false;
  const clean=s=>String(s||"").trim().replace(/\s+/g," ");
  function currentKey(){
    let uid="guest";
    try{uid=window.firebase?.auth?.()?.currentUser?.uid||"guest";}catch(_){}
    return KEY_PREFIX+uid;
  }
  function storedLanguage(){
    try{return localStorage.getItem(storageKey)==="ar"?"ar":"en";}catch(_){return"en";}
  }
  function persist(lang){try{localStorage.setItem(storageKey,lang);}catch(_){}}
  function lookup(en){
    if(Object.prototype.hasOwnProperty.call(ui,en))return{en,ar:ui[en]};
    if(Object.prototype.hasOwnProperty.call(EN_FROM_AR,en))return{en:EN_FROM_AR[en],ar:AR_SOURCE[en]};
    let m;
    if((m=en.match(/^Hi,\s*(.+)$/)) && m[1])return{en,ar:"مرحبًا، "+m[1]};
    if((m=en.match(/^(\d+)% of this unit journey$/)))return{en,ar:m[1]+"٪ من رحلة الوحدة"};
    if((m=en.match(/^(\d+)\/(\d+) required stages(?: complete)?$/)))return{en,ar:m[1]+"/"+m[2]+" مراحل أساسية مكتملة"};
    if((m=en.match(/^(\d+) active (day|days) this week$/)))return{en,ar:m[1]+" أيام تدريب هذا الأسبوع"};
    if((m=en.match(/^Complete practice on (\d+) more (?:day|days) to reach the weekly goal\.$/)))return{en,ar:"تدربي "+m[1]+" أيام إضافية لتحقيق هدف الأسبوع."};
    if((m=en.match(/^Continue Full Review · (\d+) left$/)))return{en,ar:"متابعة المراجعة الشاملة · المتبقي "+m[1]};
    if((m=en.match(/^Practice Again · Full Unit$/)))return{en,ar:"التدرب مجددًا · الوحدة كاملة"};
    if((m=en.match(/^(\d+)\/(\d+) core practices completed$/)))return{en,ar:m[1]+"/"+m[2]+" تدريبات أساسية مكتملة"};
    if((m=en.match(/^Unit (\d+) complete!$/)))return{en,ar:"اكتملت الوحدة "+m[1]+"!"};
    if((m=en.match(/^Unit (\d+)$/)))return{en,ar:"الوحدة "+m[1]};
    return null;
  }
  // Restrict localization to readable UI copy. Never interpret lesson text.
  function allowed(node){
    const p=node.parentElement;
    if(!p||!p.isConnected||p.closest(excludeSelector))return false;
    if(p.closest("[data-stepup-lang-switch]"))return false;
    if(p.closest(".journey-question-card, .journey-feedback, .journey-result, .journey-focus-shell, .fix-recovery, .exam-shell, .training-exam, .student-exam, .quiz-shell")){
      const b=p.closest("button");
      // Only recognizable *action* buttons inside practice; never answers.
      if(!b||!b.matches(".btn,.btn-primary,.btn-secondary,.journey-main-btn,.journey-link-btn,.smart-next,.smart-confirm,.smart-review,.journey-focus-start,.journey-focus-back-secondary,[data-smart-next],[data-unit-review-continue]"))return false;
      if(b.closest(".journey-options,.journey-choices,.answers,.answer-options,[role=radiogroup]"))return false;
    }
    // Unit titles and instructional source material stay English even when
    // their text incidentally equals an interface label (e.g. "Reading").
    if(p.closest(".journey-unit-card") && !p.closest(".journey-status,.journey-unit-foot"))return false;
    if(p.matches(".journey-unit-num,.journey-mini-progress strong,.progress-value"))return false;
    return true;
  }
  function translateText(node){
    if(!allowed(node))return;
    const current=node.nodeValue;
    let entry=saved.get(node);
    const base=entry && current===entry.last?entry.original:current;
    const prefix=(base.match(/^\s*/)||[""])[0],suffix=(base.match(/\s*$/)||[""])[0];
    const plain=clean(base);
    if(!plain)return;
    const translated=lookup(plain);
    if(!translated){
      if(entry && current!==entry.last)saved.delete(node);
      return;
    }
    const result=prefix+(selected==="ar"?translated.ar:translated.en)+suffix;
    saved.set(node,{original:base,last:result});
    if(current!==result)node.nodeValue=result;
  }
  function visit(root){
    if(!root)return;
    const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);
    let n;
    while((n=walker.nextNode()))translateText(n);
  }
  function switchMarkup(){
    const en=selected==="en";
    return '<span class="stepup-lang-controls" data-stepup-lang-switch role="group" aria-label="Student interface language">'+
      '<button type="button" data-student-ui-language="en" aria-pressed="'+en+'" title="English interface">EN</button>'+
      '<button type="button" data-student-ui-language="ar" aria-pressed="'+(!en)+'" title="الواجهة العربية">عربي</button></span>';
  }
  function ensureSwitch(){
    const target=document.querySelector(".student-appbar .nav-actions");
    if(!target)return;
    let controls=target.querySelector("[data-stepup-lang-switch]");
    if(!controls){
      const wrapper=document.createElement("span");
      wrapper.innerHTML=switchMarkup();
      controls=wrapper.firstElementChild;
      // After the existing avatar, without moving any existing element.
      target.insertBefore(controls,target.firstChild);
    }else{
      controls.querySelectorAll("[data-student-ui-language]").forEach(btn=>
        btn.setAttribute("aria-pressed",String(btn.getAttribute("data-student-ui-language")===selected)));
    }
  }
  function refresh(){
    queued=false;
    if(!document.querySelector(".student-app-shell")){
      storageKey="";selected="en";
      return;
    }
    const key=currentKey();
    if(key!==storageKey){storageKey=key;selected=storedLanguage();}
    ensureSwitch();
    const shell=document.querySelector(".student-app-shell");
    if(shell){shell.setAttribute("lang",selected);visit(shell);}
    const bar=document.querySelector(".student-appbar");
    if(bar){bar.setAttribute("lang",selected);visit(bar);}
  }
  function schedule(){
    if(queued)return;
    queued=true;
    // Deferred once per frame so we don't interfere mid-render.
    if(typeof requestAnimationFrame==="function")requestAnimationFrame(refresh);
    else Promise.resolve().then(refresh);
  }
  function setLanguage(lang){
    if(lang!=="en"&&lang!=="ar")return;
    if(!document.querySelector(".student-app-shell"))return;
    const key=currentKey();
    if(storageKey!==key)storageKey=key;
    selected=lang;persist(lang);
    refresh();
  }
  document.addEventListener("click",event=>{
    const b=event.target?.closest?.("[data-student-ui-language]");
    if(!b)return;
    event.preventDefault();
    setLanguage(b.getAttribute("data-student-ui-language"));
  });
  function initialize(){
    if(installed)return;
    installed=true;
    const host=document.getElementById("app");
    if(!host)return;
    const observer=new MutationObserver(schedule);
    observer.observe(host,{subtree:true,childList:true,characterData:true});
    schedule();
  }
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",initialize,{once:true});
  else initialize();
  window.STEPUP_UI_LANGUAGE={version:VERSION,setLanguage,getLanguage:()=>selected,refresh:schedule};
})();
