/* STEP UP · Unit 5 · Form, Meaning & Function · Remote 30-minute lesson.
 * Separate formative evidence: does not alter certificate eligibility, previous attempts or unit mastery.
 * Textbook reference: Mega Goal 1 Student Book, pp. 78–79.
 */
(function () {
  "use strict";
  const VERSION = "20261109-u5-fmf-live-1";
  const PRE = [
    {id:"pre-modals",skill:"FMF · Modals",q:"You ___ stop at a red traffic light.",a:["shouldn't","must","can","should to"],ok:1,why:"Must expresses a rule or obligation. Use must + base verb."},
    {id:"pre-adverbs",skill:"FMF · Adverbs",q:"A careful driver drives ___.",a:["careful","care","carefully","good"],ok:2,why:"Carefully describes how the person drives, so we use an adverb."},
    {id:"pre-place",skill:"FMF · Place",q:"The library is next ___ the clinic.",a:["from","of","at","to"],ok:3,why:"Next to means beside."},
    {id:"pre-directions",skill:"FMF · Directions",q:"___ straight for two blocks.",a:["Go","Going","Goes","To go"],ok:0,why:"Directions use the imperative: base verb, Go straight."}
  ];
  const POST = [
    {id:"post-modals",skill:"FMF · Modals",q:"Wearing a seat belt is required. You ___ wear it.",a:["should to","must","mustn't","shouldn't"],ok:1,why:"A requirement takes must, followed by the base verb wear."},
    {id:"post-adverbs",skill:"FMF · Adverbs",q:"She is a good driver. She drives ___.",a:["good","goodly","well","slow"],ok:2,why:"The adverb of good is well: She drives well."},
    {id:"post-place",skill:"FMF · Place",q:"The museum is opposite the school. It is ___ the school.",a:["next of","between","on","across from"],ok:3,why:"Across from means on the opposite side."},
    {id:"post-directions",skill:"FMF · Directions",q:"At the traffic lights, ___ left.",a:["turn","turns","turning","to turn"],ok:0,why:"Give directions using the base form: Turn left."}
  ];
  const PRACTICE = [
    {q:"The sign says NO PARKING. You ___ park here.",a:["mustn't","should","must to","should to"],ok:0,why:"Mustn't expresses prohibition: parking is not allowed."},
    {q:"He is a fast runner. He runs ___.",a:["fastly","fast","fastestly","good"],ok:1,why:"Fast is both an adjective and an adverb. Never use fastly."},
    {q:"Look at the map: The bank is ___ the clinic and the school.",a:["between","across from","far","at"],ok:0,why:"Between describes the bank in the middle of two places."},
    {q:"You need to give a direction. Which is correct?",a:["Turning right.","To turn right.","Turn right.","Turns right."],ok:2,why:"The imperative begins with the base verb: Turn right."}
  ];
  const CHALLENGE = [
    {q:"You ___ use your phone while driving. It is prohibited.",a:["should","mustn't","must to","should to"],ok:1,why:"Mustn't means something is prohibited, not just bad advice."},
    {q:"The child crossed the road ___.",a:["careful","carefully","good","quick"],ok:1,why:"Carefully tells us how the child crossed the road."},
    {q:"The museum is ___ from the school.",a:["next","between","across","on"],ok:2,why:"Across from = opposite."}
  ];
  const sceneInfo = [
    ["Start · Safety First",2,"Warm-up"],
    ["Quick Check",3,"Diagnostic"],
    ["Rules or Advice?",6,"Modal Auxiliaries"],
    ["How Does It Happen?",5,"Adverbs of Manner"],
    ["Where Is It?",5,"Prepositions of Place"],
    ["Find the Way",4,"Giving Directions"],
    ["Team Challenge",3,"Class Practice"],
    ["Exit Ticket",2,"Assessment"]
  ];
  let teacher = {scene:0,selected:null,revealed:false,challenge:0,scores:[0,0,0],classId:"",classCode:"",savedStats:null,statsBusy:false};
  let student = null;
  const esc = (x) => String(x == null ? "" : x).replace(/[&<>"']/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c];});
  const E = (s) => '<div class="u5live-en" lang="en">'+s+'</div>';
  const A = (s) => '<div class="u5live-ar" lang="ar" dir="rtl">'+s+'</div>';
  const tile = (head,en,ar,extra) => '<div class="u5live-tile '+(extra||"")+'"><h3>'+head+'</h3>'+E(en)+A(ar)+'</div>';
  const btn = (text,call,extra) => '<button type="button" class="'+(extra||"u5live-primary")+'" onclick="'+call+'">'+text+'</button>';
  const map = () => '<div class="u5live-map" role="img" aria-label="The clinic, bank and school on one side of Main Street; park, bookstore and museum on the other.">'+
    '<div class="u5live-map-row"><div class="u5live-place">Clinic</div><div class="u5live-place">Bank</div><div class="u5live-place">School</div></div>'+
    '<div class="u5live-street">MAIN STREET</div>'+
    '<div class="u5live-map-row"><div class="u5live-place">Park</div><div class="u5live-place">Bookstore</div><div class="u5live-place">Museum</div></div></div>';
  function quizHTML(q,selected,revealed,kind){
    let h = '<div class="u5live-question"><div class="u5live-sectionline" style="color:#a7dbde">THINK • CHOOSE • EXPLAIN</div>'+E(esc(q.q))+
      '<div class="u5live-options">';
    q.a.forEach((x,i) => {
      const cls = revealed ? (i===q.ok?"good":selected===i?"bad":"") : (selected===i?"chosen":"");
      const action = kind==="teacher" ? 'STEPUP_U5_LIVE.teacherChoose('+i+')' :
        kind==="challenge" ? 'STEPUP_U5_LIVE.challengeChoose('+i+')' :
        kind==="student" ? 'STEPUP_U5_LIVE.studentChoose('+i+')' :
        'STEPUP_U5_LIVE.practiceChoose('+i+','+kind+')';
      h += '<button type="button" class="u5live-option '+cls+'" onclick="'+action+'"'+(revealed?" disabled":"")+'><b>'+String.fromCharCode(65+i)+'.</b> '+esc(x)+'</button>';
    });
    h += '</div>';
    if(revealed)h += '<div class="u5live-answer">'+E('<b>Correct: '+esc(q.a[q.ok])+'</b>')+A(esc(q.why))+'</div>';
    return h + '</div>';
  }
  function teacherBody(){
    const s = teacher.scene;
    if(s===0) return '<div class="u5live-kicker">Unit 5 · Did You Hurt Yourself?</div>'+
      '<h1>Safety Mission: Choose the Right Words</h1>'+
      '<p class="u5live-sub">من مواقف السلامة اليومية نتعلّم كيف نعبر عن القوانين والنصائح، وكيف نصف الأفعال والأماكن والاتجاهات.</p>'+
      '<div class="u5live-grid">'+
      tile('Situation A','<b>You must stop.</b>','عند الإشارة الحمراء: هل أتحدث عن قانون أم نصيحة؟','strong')+
      tile('Situation B','<b>You should rest.</b>','إذا كنت متعبًا: هل أتحدث عن قانون أم نصيحة؟','warn')+
      '</div><div class="u5live-rule">'+A('اسألي الطالبات: Which sentence is stronger? Why? ثم انتقلي للقياس القبلي دون كشف الإجابات.')+'</div>';
    if(s===1)return '<h2>Quick Check · Before We Learn</h2><p class="u5live-sub">اطلبي من كل طالبة فتح درس Unit 5 – FMF Live Lesson والضغط على Start Quick Check.</p>'+
      '<div class="u5live-grid three">'+
      tile('01','<b>Open Unit 5</b>','افتحي الوحدة الخامسة')+
      tile('02','<b>Choose FMF Live Lesson</b>','لا تدخلي درس Grammar')+
      tile('03','<b>Answer 4 questions</b>','العمل فردي، دون مساعدة')+
      '</div><div class="u5live-rule">Diagnostic assessment: 4 questions • 4 skills • results saved separately from mastery.</div>';
    if(s===2)return '<h2>Must vs Should</h2><p class="u5live-sub">اسألي: هل الجملة تعبّر عن قانون يجب اتباعه، أم نصيحة يُفضّل اتباعها؟</p>'+
      '<div class="u5live-grid">'+
      tile('MUST · Obligation','<b>You must stop</b> at a red light.','قانون / إلزام: يجب أن تتوقف.','strong')+
      tile('SHOULD · Advice','You <b>should check</b> your tires.','نصيحة: من الأفضل أن تفحص إطاراتك.')+
      tile("MUSTN'T · Prohibition",'You <b>must not use</b> your phone while driving.','منع: غير مسموح باستخدام الهاتف.','warn')+
      tile("SHOULDN'T · Negative advice",'You <b>should not drive</b> when tired.','نصيحة بعدم فعل شيء.','warn')+
      '</div><div class="u5live-rule">'+A('<b>Form:</b> Subject + must / should + base verb. لا نضيف to أو s أو ing بعد must وshould. قوة التعبير: must أقوى من should.')+'</div>'+
      quizHTML({q:"The sign says NO PARKING. You ___ park here.",a:["should","mustn't","must to","should to"],ok:1,why:"A NO PARKING sign is a prohibition. Mustn't + base verb."},teacher.selected,teacher.revealed,"teacher");
    if(s===3)return '<h2>Adjective or Adverb?</h2><p class="u5live-sub">ما الفرق بين وصف الشخص ووصف طريقة القيام بالفعل؟</p>'+
      '<div class="u5live-grid">'+
      tile('Adjective · describes a noun','She is a <b>careful</b> driver.','نصف السائقة نفسها: careful.')+
      tile('Adverb · describes an action','She drives <b>carefully</b>.','نصف كيف تقود: carefully.','strong')+
      tile('Special: good → well','She is a <b>good</b> driver.<br>She drives <b>well</b>.','الفعل drive يحتاج ظرفًا: well.')+
      tile('Special: fast → fast','He is a <b>fast</b> runner.<br>He runs <b>fast</b>.','لا نقول fastly. الكلمة لا تتغير.')+
      '</div><div class="u5live-rule">'+A('اسألي How does she drive? الإجابة عن طريقة حدوث الفعل تكون غالبًا بظرف ينتهي بـ -ly. لكن good تتحول إلى well، وfast تبقى fast.')+'</div>'+
      quizHTML({q:"The driver is careful. She drives ___.",a:["careful","carefully","good","fastly"],ok:1,why:"Carefully describes the action drives."},teacher.selected,teacher.revealed,"teacher");
    if(s===4)return '<h2>Where Is the Museum?</h2><p class="u5live-sub">شاهدي الخريطة ثم اربطي كل موقع بالمكان المجاور له.</p>'+
      map()+
      '<div class="u5live-grid three">'+
      tile('BETWEEN','The bank is <b>between</b> the clinic and the school.','بين مكانين.')+
      tile('ACROSS FROM','The museum is <b>across from</b> the school.','على الجهة المقابلة.')+
      tile('NEXT TO','The bookstore is <b>next to</b> the museum.','بجانب / ملاصق.')+
      '</div>'+
      quizHTML({q:"Look at the map. The bank is ___ the clinic and the school.",a:["across from","between","far from","on"],ok:1,why:"The bank is in the middle of the clinic and the school."},teacher.selected,teacher.revealed,"teacher");
    if(s===5)return '<h2>Give Clear Directions</h2><p class="u5live-sub">اتجاهات قصيرة وواضحة تبدأ بالفعل مباشرة (Imperative).</p>'+
      '<div class="u5live-directions"><div class="u5live-direction">↑<br>Go straight</div><div class="u5live-direction">←<br>Turn left</div><div class="u5live-direction">→<br>Turn right</div></div>'+
      '<div class="u5live-grid">'+
      tile('Ask','<b>Excuse me, where is the museum?</b>','أستخدم Where is...? للسؤال عن المكان.')+
      tile('Answer','<b>Go straight. Turn right.</b><br>It is <b>next to</b> the bookstore.','توجيه + مكان: فعل أمر ثم وصف الموقع.','strong')+
      '</div><div class="u5live-rule">'+A('Form: Base verb + direction. نقول Turn left وليس Turning left. في الصفحة 79 يتدرب الطلاب على استخدام الأوامر مع حروف الجر.')+'</div>'+
      quizHTML({q:"Which sentence gives a correct direction?",a:["To turn right.","Turn right.","Turning right.","Turns right."],ok:1,why:"Use an imperative verb in its base form: Turn right."},teacher.selected,teacher.revealed,"teacher");
    if(s===6)return '<h2>Team Challenge · 3 Questions</h2><p class="u5live-sub">قسّمي الصف إلى ثلاث مجموعات. تختار كل مجموعة إجابة وتشرح السبب قبل إظهاره.</p>'+
      '<div class="u5live-teams">'+[0,1,2].map(i=>'<button class="u5live-team" type="button" onclick="STEPUP_U5_LIVE.addPoint('+i+')">Group '+(i+1)+' · <b>'+teacher.scores[i]+' points</b> +</button>').join('')+'</div>'+
      '<p class="u5live-footer">Question '+(teacher.challenge+1)+' / '+CHALLENGE.length+' · النقاط هنا للتحفيز داخل العرض فقط، ولا تُسجل كدرجات للطالبة.</p>'+
      quizHTML(CHALLENGE[teacher.challenge],teacher.selected,teacher.revealed,"challenge")+
      '<div class="u5live-navigation">'+btn("Show answer","STEPUP_U5_LIVE.teacherReveal()","u5live-lite")+
      btn(teacher.challenge===CHALLENGE.length-1?"Restart group questions":"Next group question","STEPUP_U5_LIVE.nextChallenge()","u5live-primary")+'</div>'+
      '<p class="u5live-note">Optional: Use the existing six-question STEP FMF Class Mode if time permits. <button type="button" class="u5live-lite" onclick="STEPUP_U5_LIVE.launchStep()">Open STEP FMF Class Mode</button></p>';
    return '<h2>Exit Ticket · What Did We Learn?</h2><p class="u5live-sub">4 new questions, one for each language function. Compare pre- and post-check without affecting certificates.</p>'+
      '<div class="u5live-grid">'+
      tile('Meaning','<b>Must</b> = obligation<br><b>Should</b> = advice','ما الفرق بين الإلزام والنصيحة؟','strong')+
      tile('Form','<b>Drive carefully</b><br><b>Turn right</b>','كيف أصف الفعل وأعطي اتجاهًا؟')+
      '</div>'+
      '<div class="u5live-rule">'+A('اطلبي من الطالبات العودة إلى درس FMF Live Lesson في STEP UP والضغط على Start Exit Ticket. بعد الإجابة راجعي ملخص النتائج.')+'</div>'+
      '<div class="u5live-navigation">'+btn("Refresh class results","STEPUP_U5_LIVE.loadStats()","u5live-primary")+'</div>'+
      statsHTML();
  }
  function statsHTML(){
    const st=teacher.savedStats;
    if(!st) return '<p class="u5live-note">Class report: select Refresh class results after students finish. Requires online teacher sign-in.</p>';
    if(st.error)return '<p class="u5live-note">'+esc(st.error)+'</p>';
    return '<div class="u5live-stats"><div class="u5live-stat"><b>'+st.preCount+'</b><small>Pre-check submitted</small></div>'+
      '<div class="u5live-stat"><b>'+st.postCount+'</b><small>Exit ticket submitted</small></div>'+
      '<div class="u5live-stat"><b>'+(st.matched?((st.delta>0?"+":"")+st.delta+" pp"):"—")+'</b><small>Average gain · '+st.matched+' matched students</small></div></div>'+
      '<p class="u5live-note">Class '+esc(teacher.classCode)+' · pre average '+st.preAvg+'% · post average '+st.postAvg+'%. Latest attempt per student and stage; average gain uses only students with both results.</p>';
  }
  function renderTeacher(){
    const app=document.getElementById("app");if(!app)return;
    const info=sceneInfo[teacher.scene];
    const num=teacher.scene+1;
    app.innerHTML = '<div class="u5live-shell"><div class="u5live-wrap"><div class="u5live-top">'+
      '<div><div class="u5live-brand">STEP UP · LIVE LESSON</div><small>UNIT 5 · FORM, MEANING & FUNCTION · 30 MINUTES</small></div>'+
      '<div>'+btn("← Back to Teacher Dashboard","STEPUP_U5_LIVE.closeTeacher()","u5live-exit")+'</div></div>'+
      '<div class="u5live-progress">'+sceneInfo.map((_,i)=>'<i class="'+(i<=teacher.scene?"done":"")+'"></i>').join('')+'</div>'+
      '<section class="u5live-panel"><div class="u5live-top"><span class="u5live-kicker">STEP '+num+' / '+sceneInfo.length+' · '+info[1]+' MIN</span><span class="u5live-sectionline">'+esc(info[2])+'</span></div>'+
      teacherBody()+
      (teacher.scene>=2&&teacher.scene<=5?'<div class="u5live-navigation">'+btn("Reveal answer + explain","STEPUP_U5_LIVE.teacherReveal()","u5live-lite")+'</div>':"")+
      '<div class="u5live-note">Teacher-led screen share • class '+esc(teacher.classCode||"not selected")+' • Student activity: Unit 5 → FMF Live Lesson.</div>'+
      '<div class="u5live-navigation">'+btn("Previous","STEPUP_U5_LIVE.prev()","u5live-lite")+
      btn(teacher.scene===sceneInfo.length-1?"Back to lesson start":"Next →","STEPUP_U5_LIVE.next()","u5live-primary")+'</div>'+
      '</section><p class="u5live-footer">Mega Goal 1 · Student Book pp. 78–79 · This lesson uses separate diagnostic evidence, not certificate points.</p></div></div>';
  }
  function openTeacher(classId,classCode){
    const teacherPage=document.querySelector(".teacher-classmode-v2");
    if(!teacherPage) return alert("Open this lesson from Teacher → Class Mode.");
    teacher={scene:0,selected:null,revealed:false,challenge:0,scores:[0,0,0],classId:String(classId||""),classCode:String(classCode||""),savedStats:null,statsBusy:false};
    renderTeacher();
  }
  function closeTeacher(){ window.PROVE && window.PROVE.setTeacherTab("classmode"); }
  function next(){teacher.scene=(teacher.scene+1)%sceneInfo.length;teacher.selected=null;teacher.revealed=false;renderTeacher();}
  function prev(){teacher.scene=Math.max(0,teacher.scene-1);teacher.selected=null;teacher.revealed=false;renderTeacher();}
  function teacherChoose(n){if(!teacher.revealed){teacher.selected=n;renderTeacher();}}
  function challengeChoose(n){teacherChoose(n);}
  function teacherReveal(){teacher.revealed=true;renderTeacher();}
  function nextChallenge(){teacher.challenge=(teacher.challenge+1)%CHALLENGE.length;teacher.selected=null;teacher.revealed=false;renderTeacher();}
  function addPoint(n){if(!Number.isInteger(n)||n<0||n>2)return;teacher.scores[n]++;renderTeacher();}
  function launchStep(){window.PROVE && window.PROVE.startClassMode("u5-step-class-fmf");}

  function initialStudent(){return {phase:"home",question:0,selected:null,pre:[],post:[],preScore:null,postScore:null,saved:{pre:false,post:false},pending:false,practiceSelections:{}};}
  function openStudent(){
    if(!document.querySelector(".student-view"))return alert("Sign in to your STEP UP student account first.");
    student=initialStudent();renderStudent();
  }
  function studentQuizQuestion(){
    const arr=student.phase==="pre"?PRE:POST;
    const q=arr[student.question],answers=student.phase==="pre"?student.pre:student.post;
    const selected=answers[student.question];
    return '<div class="u5live-sectionline">'+(student.phase==="pre"?"BEFORE LEARNING":"AFTER LEARNING")+' · Question '+(student.question+1)+' / '+arr.length+'</div>'+
      '<h2>'+(student.phase==="pre"?"Quick Check":"Exit Ticket")+'</h2>'+
      '<p class="u5live-sub">Choose one answer. You can use your phone, tablet or laptop.</p>'+
      quizHTML(q,selected,false,"student")+
      '<div class="u5live-navigation">'+btn("Back","STEPUP_U5_LIVE.studentBack()","u5live-lite")+
      '<button class="u5live-primary" type="button" '+(selected==null||student.pending?"disabled":"")+' onclick="STEPUP_U5_LIVE.studentNext()">'+
      (student.question===arr.length-1?"Submit answers":"Next question →")+'</button></div>';
  }
  function studentLessonContent(){
    const blocks=[
      ['1 · Rules and advice','<b>Must</b> = a law or obligation. <b>Should</b> = advice.<br>Must not = prohibition. Should not = negative advice.','Example: You must stop at a red light. You should drive carefully.','Remember: modal + base verb. No to.'],
      ['2 · Describe how','Adjective: a <b>careful</b> driver.<br>Adverb: drives <b>carefully</b>.','Special: good → well. Fast → fast.','Adverbs answer How?'],
      ['3 · Say where','<b>Between</b> two places. <b>Next to</b> = beside.<br><b>Across from</b> = opposite.','The bank is between the clinic and school.','Use the map to verify places.'],
      ['4 · Give directions','<b>Go straight. Turn left. Turn right.</b>','Use the base verb to give a direction.','Imperatives do not begin with to.']
    ];
    let h='<h2>Learn · Four Useful Functions</h2><p class="u5live-sub">Read, then try one example for each language skill. Ask your teacher when you need help.</p>'+
      '<div class="u5live-student-lesson">'+blocks.map((b,i)=>'<div class="u5live-tile" style="margin:12px 0"><h3>'+b[0]+'</h3>'+E(b[1])+
      '<p>'+esc(b[2])+'</p><p class="u5live-note">'+esc(b[3])+'</p>'+
      (i===2?map():"")+
      '<div class="u5live-question">'+E(esc(PRACTICE[i].q))+'<div class="u5live-options">'+PRACTICE[i].a.map((choice,j)=>{
        const selected=student.practiceSelections[i],revealed=selected!=null;
        const cls=revealed?(j===PRACTICE[i].ok?"good":j===selected?"bad":""):"";
        return '<button type="button" '+(revealed?"disabled":"")+' class="u5live-option '+cls+'" onclick="STEPUP_U5_LIVE.practiceChoose('+j+','+i+')">'+String.fromCharCode(65+j)+'. '+esc(choice)+'</button>';
      }).join('')+'</div>'+(student.practiceSelections[i]!=null?'<div class="u5live-answer">'+esc(PRACTICE[i].why)+'</div>':"")+'</div></div>').join('')+'</div>'+
      '<div class="u5live-navigation">'+btn("Return to Unit 5","STEPUP_U5_LIVE.closeStudent()","u5live-lite")+
      btn("Start Exit Ticket →","STEPUP_U5_LIVE.startPost()","u5live-primary")+'</div>';
    return h;
  }
  function studentResult(){
    const pct=(s,total)=>Math.round(s/total*100);
    const pre=student.preScore,post=student.postScore;
    let h='<h2>My Exit Ticket Results</h2><div class="u5live-stats">'+
      '<div class="u5live-stat"><b>'+(pre==null?"—":pct(pre,PRE.length)+"%")+'</b><small>Before</small></div>'+
      '<div class="u5live-stat"><b>'+(post==null?"—":pct(post,POST.length)+"%")+'</b><small>After</small></div>'+
      '<div class="u5live-stat"><b>'+(pre==null||post==null?"—":(pct(post,POST.length)-pct(pre,PRE.length)>0?"+":"")+(pct(post,POST.length)-pct(pre,PRE.length))+" pp")+'</b><small>My improvement</small></div></div>'+
      '<div class="u5live-rule">'+(student.saved.post?"Your exit-ticket result was saved.":"Your answer was submitted locally, but saving could not be confirmed. Check your connection and use Save again if prompted.")+'</div>'+
      '<h3>Review the answers</h3>';
    POST.forEach((q,i)=>{h+='<div class="u5live-pill">'+E((i+1)+". "+esc(q.q)+"<br><b>"+esc(q.a[q.ok])+"</b>")+A(esc(q.why))+'</div>';});
    h+='<div class="u5live-navigation">'+btn("Study again","STEPUP_U5_LIVE.studyAgain()","u5live-lite")+
      btn("Return to Unit 5","STEPUP_U5_LIVE.closeStudent()","u5live-primary")+'</div>';
    return h;
  }
  function renderStudent(){
    const view=document.querySelector(".student-view");
    if(!view||!student)return;
    let body="";
    if(student.phase==="home"){
      body='<span class="u5live-kicker">UNIT 5 · FMF</span><h1>Safety Mission</h1>'+
        '<p class="u5live-sub">Learn to give rules, advice and directions, and to describe how things happen.</p>'+
        '<div class="u5live-grid">'+
        tile('Step 1 · Before','4 quick questions','قبل الشرح: اكتشفي ما تعرفينه')+
        tile('Step 2 · Learn','4 useful language skills','تعلمّي ثم جرّبي الأمثلة')+
        tile('Step 3 · After','4 new questions','بعد الشرح: قارني تقدمك')+
        tile('Your progress','Results saved in STEP UP','يظهر الإنجاز في تقارير المعلمة')+'</div>'+
        '<p class="u5live-note">Separate formative activity. This does not add certificate or mastery points.</p>'+
        '<div class="u5live-navigation">'+btn("Return to Unit 5","STEPUP_U5_LIVE.closeStudent()","u5live-lite")+
        btn("Start Quick Check →","STEPUP_U5_LIVE.startPre()","u5live-primary")+'</div>';
    }else if(student.phase==="pre"||student.phase==="post"){body=studentQuizQuestion();}
    else if(student.phase==="learn"){body=studentLessonContent();}
    else if(student.phase==="result"){body=studentResult();}
    view.innerHTML='<section class="u5live-shell u5live-student"><div class="u5live-top"><b>STEP UP · FMF Live Lesson</b><small>Mega Goal 1 · pp. 78–79</small></div>'+
      '<div class="u5live-panel">'+body+'</div></section>';
  }
  function startPre(){if(!student)return;student.phase="pre";student.question=0;student.selected=null;renderStudent();}
  function startPost(){if(!student)return;student.phase="post";student.question=0;student.selected=null;renderStudent();}
  function studentChoose(n){
    if(!student||student.pending)return;
    const arr=student.phase==="pre"?PRE:student.phase==="post"?POST:null;
    if(!arr||n<0||n>3)return;
    const answers=student.phase==="pre"?student.pre:student.post;
    answers[student.question]=n;
    renderStudent();
  }
  function studentBack(){if(!student||student.pending)return;
    if(student.question>0)student.question--;
    else student.phase=student.phase==="pre"?"home":"learn";
    renderStudent();
  }
  async function persist(kind,questions,answers){
    const score=questions.reduce((total,q,i)=>total+(answers[i]===q.ok?1:0),0);
    const payload={trainingId:"u5-fmf-live-"+kind,trainingTitle:"Unit 5 FMF · "+(kind==="pre"?"Quick Check (Pre)":"Exit Ticket (Post)"),
      trainingType:"fmf",unitId:"u5",unitNumber:5,score,total:questions.length,percentage:Math.round(100*score/questions.length),
      elapsedSeconds:Math.round((Date.now()-student.startedAt)/1000),
      studyMethod:"u5-fmf-remote-lesson",answers:questions.map((q,i)=>({
      question_id:"U5-FMF-LIVE-"+q.id,skill:q.skill,stem:q.q,correct:answers[i]===q.ok,
      selected:answers[i],selectedText:q.a[answers[i]],correctAnswer:q.ok,correctText:q.a[q.ok],
      explanation:q.why,need:q.why
    }))};
    let saved=false;
    try{const result=await window.PROVE.recordJourneyAttempt(payload);saved=!!result;}catch(e){console.warn("FMF live result queued or not saved",e);}
    student.saved[kind]=saved;
    return score;
  }
  async function studentNext(){
    if(!student||student.pending)return;
    const kind=student.phase;
    if(kind!=="pre"&&kind!=="post")return;
    const a=kind==="pre"?student.pre:student.post;
    const bank=kind==="pre"?PRE:POST;
    if(a[student.question]==null)return;
    if(student.question<bank.length-1){student.question++;renderStudent();return;}
    student.pending=true;student.startedAt=student.startedAt||Date.now();renderStudent();
    const score=await persist(kind,bank,a);
    student.pending=false;
    if(kind==="pre"){student.preScore=score;student.phase="learn";}
    else{student.postScore=score;student.phase="result";}
    renderStudent();
  }
  function practiceChoose(choice,index){
    if(!student||student.phase!=="learn"||student.practiceSelections[index]!=null)return;
    if(index<0||index>=PRACTICE.length||choice<0||choice>=4)return;
    student.practiceSelections[index]=choice;renderStudent();
  }
  function studyAgain(){if(!student)return;student.phase="learn";renderStudent();}
  function closeStudent(){student=null; if(window.STEPUP_JOURNEY)window.STEPUP_JOURNEY.openUnit("u5");}
  async function loadStats(){
    if(teacher.statsBusy||!teacher.classId)return;
    teacher.statsBusy=true;
    let stat;
    try{
      if(!window.firebase||!firebase.auth().currentUser)throw new Error("Sign in as a teacher to see saved results.");
      const id=firebase.auth().currentUser.uid;
      const snap=await firebase.firestore().collection("attempts").where("teacherId","==",id).get();
      const records=snap.docs.map(x=>x.data()).filter(x=>x.classId===teacher.classId&&["u5-fmf-live-pre","u5-fmf-live-post"].includes(x.trainingId));
      const latest={pre:new Map(),post:new Map()};
      records.sort((a,b)=>String(a.submittedAt||"").localeCompare(String(b.submittedAt||""))).forEach(a=>{
        const kind=a.trainingId.endsWith("-pre")?"pre":"post";latest[kind].set(a.studentId,a);
      });
      const pre=[...latest.pre.values()],post=[...latest.post.values()];
      const avg=arr=>arr.length?Math.round(arr.reduce((s,x)=>s+Number(x.percentage||0),0)/arr.length):0;
      const deltas=[];latest.post.forEach((p,studentId)=>{const b=latest.pre.get(studentId);if(b)deltas.push(Number(p.percentage||0)-Number(b.percentage||0));});
      stat={preCount:pre.length,postCount:post.length,preAvg:avg(pre),postAvg:avg(post),matched:deltas.length,delta:deltas.length?Math.round(deltas.reduce((s,x)=>s+x,0)/deltas.length):0};
    }catch(e){stat={error:"Unable to load class results. Please check access and try again. "+String(e.code||"")};}
    teacher.savedStats=stat;teacher.statsBusy=false;renderTeacher();
  }
  window.STEPUP_U5_LIVE={version:VERSION,openTeacher,closeTeacher,next,prev,teacherChoose,challengeChoose,teacherReveal,nextChallenge,addPoint,launchStep,
    openStudent,startPre,startPost,studentChoose,studentBack,studentNext,practiceChoose,studyAgain,closeStudent,loadStats};
})();