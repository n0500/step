// StepUp • Unit 2 Exam Review — deterministic full coverage
// 2026-09-29
// Goals:
// - Unit 2 can be entered directly even if Unit 1 is unfinished.
// - Every required review question is shown to every student; no random sampling.
// - Every answer is saved to Firestore before moving on.
// - Correct / Not quite feedback appears after every saved answer.
// - Required exam path: Vocabulary & Real Talk → Grammar → Language Functions.
// - Reading, Listening, and Writing remain available as extra/optional review and never block the exam path.
(() => {
  "use strict";

  const J = window.STEPUP_JOURNEY;
  if (!J || !J.data) return;

  const VERSION = "u2-bilingual-help-20260929-1";
  const UNIT_ID = "u2";
  const UNIT_NUMBER = 2;

  let attempts = [];
  let openUnits = [];
  let profile = null;
  let session = null;
  let saving = false;

  const old = {
    html: J.html,
    homeHTML: J.homeHTML,
    progressHTML: J.progressHTML,
    openUnit: J.openUnit,
    go: J.go
  };

  const esc = s => String(s ?? "").replace(/[&<>"']/g,c=>({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
  }[c]));

  const q = (id, skill, prompt, choices, answer, explanation, source, review=false) => ({
    id, skill, prompt, choices, answer, explanation, source, review
  });


  function englishHint(item){
    const skill=String(item?.skill||"");
    if(/Present Perfect Progressive/.test(skill)) return "Look for duration or an action that started in the past and is still continuing.";
    if(/Present Perfect Simple/.test(skill)) return "Think about a completed result, number, or experience up to now.";
    if(/Adjective \+ Preposition \+ Gerund|Good at \+ Gerund|Interested in \+ Gerund/.test(skill)) return "Check the fixed expression first, then the verb form that follows it.";
    if(/Simple Present/.test(skill) && /Wh-Questions/.test(skill)) return "With he/she, use does + subject + base verb.";
    if(/Simple Present/.test(skill)) return "Look for a routine or repeated action, then check the subject.";
    if(/Prepositions of Time/.test(skill)) return "Think about the preposition normally used with this time expression.";
    if(/Relative Pronouns/.test(skill)) return "First decide whether the noun is a person or a thing.";
    if(/Past Progressive with While/.test(skill)) return "Use while for actions happening at the same time in the past.";
    if(/Wh-Questions/.test(skill)) return "Check the order: question word + auxiliary + subject + base verb.";
    if(/Real Talk/.test(skill)) return "Use the meaning of the whole expression in the Unit 2 conversation.";
    if(/Vocabulary/.test(skill)) return "Use the sentence meaning and career context to eliminate weak choices.";
    if(/Reading/.test(skill)) return "Return to the passage and find the evidence before choosing.";
    if(/Listening/.test(skill)) return "Listen for the main idea or the exact detail asked for.";
    if(/Writing/.test(skill)) return "Use the structure and meaning of a formal cover letter.";
    return "Find the clue in the sentence, eliminate weak options, then choose.";
  }

  function arabicHint(item){
    const skill=String(item?.skill||"");
    if(/Present Perfect Progressive/.test(skill)) return "ابحثي عن مدة أو فعل بدأ في الماضي وما زال مستمرا.";
    if(/Present Perfect Simple/.test(skill)) return "ركزي على النتيجة أو العدد أو الخبرة المكتملة حتى الآن.";
    if(/Adjective \+ Preposition \+ Gerund|Good at \+ Gerund|Interested in \+ Gerund/.test(skill)) return "حددي التعبير الثابت أولا، ثم انتبهي لصيغة الفعل التي تأتي بعده.";
    if(/Simple Present/.test(skill) && /Wh-Questions/.test(skill)) return "مع he / she نستخدم does ثم الفعل بصيغته الأساسية.";
    if(/Simple Present/.test(skill)) return "ابحثي عن عادة أو فعل متكرر، ثم انتبهي للفاعل.";
    if(/Prepositions of Time/.test(skill)) return "فكري في حرف الجر المستخدم عادة مع هذا التعبير الزمني.";
    if(/Relative Pronouns/.test(skill)) return "حددي أولا: هل الاسم شخص أم شيء؟";
    if(/Past Progressive with While/.test(skill)) return "استخدمي while لربط حدثين كانا يحدثان في الوقت نفسه في الماضي.";
    if(/Wh-Questions/.test(skill)) return "راجعي ترتيب السؤال: أداة السؤال ثم الفعل المساعد ثم الفاعل ثم الفعل الأساسي.";
    if(/Real Talk/.test(skill)) return "ركزي على معنى التعبير كاملا كما ورد في محادثة الوحدة الثانية.";
    if(/Vocabulary/.test(skill)) return "استخدمي معنى الجملة وسياق الوظائف لاستبعاد الخيارات غير المناسبة.";
    if(/Reading/.test(skill)) return "ارجعي للنص وابحثي عن الدليل قبل اختيار الإجابة.";
    if(/Listening/.test(skill)) return "استمعي للفكرة الرئيسة أو للتفصيل المطلوب في السؤال.";
    if(/Writing/.test(skill)) return "استخدمي ترتيب ومعنى عناصر خطاب التقديم الرسمي.";
    return "ابحثي عن الكلمة المفتاحية في الجملة واستبعدي الخيارات غير المناسبة.";
  }

  function arabicExplanation(item){
    const skill=String(item?.skill||"");
    const p=String(item?.prompt||"");
    if(p.includes("bored to death")) return "التعبير bored to death يعني مللا شديدا.";
    if(p.includes("day after day")) return "التعبير day after day يعني تكرار الشيء بالنمط نفسه يوما بعد يوم.";
    if(p.includes("scientist")) return "الكلمة المناسبة هي scientist لأنها تعني عالما، وهو الشخص الذي يكتشف ويدرس أشياء جديدة.";
    if(p.includes("stuck in")) return "في سياق المحادثة، stuck in تعني عالقا أو غير قادر على الخروج أو الحركة بحرية.";
    if(p.toLowerCase().includes("talk someone out of it")) return "التعبير يعني إقناع شخص بألا يفعل شيئا أو أن يختار شيئا مختلفا.";
    if(p.includes("luckily")) return "كلمة luckily تستخدم عندما نرى أن ما حدث كان إيجابيا أو محظوظا.";
    if(/Present Perfect Progressive/.test(skill)) return "نستخدم has/have been + verb-ing عندما بدأ الفعل في الماضي وما زال مستمرا، وغالبا تظهر مدة مثل for أو since.";
    if(/Present Perfect Simple & Progressive/.test(skill)) return "نستخدم المضارع التام المستمر للنشاط المستمر، والمضارع التام البسيط للنتيجة أو العدد أو الخبرة المكتملة حتى الآن.";
    if(/Present Perfect Simple/.test(skill)) return "نستخدم المضارع التام البسيط للنتيجة أو العدد أو الخبرة المكتملة حتى الآن: have/has + past participle.";
    if(/Adjective \+ Preposition \+ Gerund|Good at \+ Gerund|Interested in \+ Gerund/.test(skill)) return "بعد good at و interested in نستخدم الفعل بصيغة -ing.";
    if(/Simple Present/.test(skill) && /Wh-Questions/.test(skill)) return "في أسئلة المضارع البسيط مع he/she نستخدم does، وبعد does يأتي الفعل بصيغته الأساسية.";
    if(/Simple Present/.test(skill)) return "نستخدم المضارع البسيط للعادات والأفعال المتكررة، ومع he/she نضيف غالبا -s للفعل.";
    if(/Prepositions of Time/.test(skill)) return "نستخدم at مع night: at night.";
    if(/Relative Pronouns/.test(skill)) return "نستخدم who للأشخاص، وwhich للأشياء، ويمكن استخدام that مع الأشخاص أو الأشياء حسب السياق.";
    if(/Past Progressive with While/.test(skill)) return "نستخدم while مع حدثين كانا مستمرين في الوقت نفسه في الماضي، وصيغة الحدث المستمر هي was/were + verb-ing.";
    if(/Wh-Questions/.test(skill)) return "ترتيب السؤال الصحيح: أداة السؤال + الفعل المساعد + الفاعل + الفعل بصيغته الأساسية.";
    if(/Reading/.test(skill)) return "الإجابة الصحيحة تعتمد على الدليل المباشر أو الاستنتاج من نص القراءة في الوحدة الثانية.";
    if(/Listening/.test(skill)) return "الإجابة الصحيحة تأتي من الفكرة أو التفصيل المذكور في محادثة الوحدة الثانية.";
    if(/Writing/.test(skill)) return "الإجابة الصحيحة تتبع معنى وترتيب عناصر خطاب التقديم الرسمي.";
    return "راجعي القاعدة والكلمة المفتاحية في السؤال، ثم قارنيها بصيغة الإجابة الصحيحة.";
  }

  let helpMode=null;
  function toggleHelp(mode){
    if(!session)return;
    helpMode = helpMode===mode ? null : mode;
    renderQuestion();
  }

  // -------------------- REQUIRED EXAM REVIEW --------------------
  // Review items are placed first and are never skipped.

  const vocab = [
    q("REV-U2-V07","Real Talk",
      "The phrase “bored to death” means:",
      ["positive event","very bored","work","very lucky"],1,
      "“Bored to death” means very bored.",
      "Unit 2 review • Vocabulary Q7",true),
    q("REV-U2-V08","Real Talk",
      "The phrase “day after day” means:",
      ["very bored","positive event","same pattern","a new job"],2,
      "“Day after day” means following the same pattern repeatedly.",
      "Unit 2 review • Vocabulary Q8",true),
    q("REV-U2-V09","Vocabulary",
      "My friend wants to become a ___ and discover new things.",
      ["scientist","clay","flavor","driver"],0,
      "Scientist is the career word that completes the sentence.",
      "Unit 2 review • Vocabulary Q9",true),
    q("U2-RT-STUCK","Real Talk",
      "In the Unit 2 conversation, “stuck in” is closest in meaning to ___.",
      ["unable to move or get out","ready to travel","very successful","working outdoors"],0,
      "In context, Khaled imagines being stuck between four walls.",
      "Mega Goal 1 Unit 2 • Conversation"),
    q("U2-RT-TALKOUT","Real Talk",
      "“Talk someone out of it” means ___.",
      ["convince someone to do something different","ask someone to speak louder","offer someone a job","work with someone"],0,
      "The expression means convincing someone to choose differently.",
      "Mega Goal 1 Unit 2 • Real Talk"),
    q("U2-RT-LUCKILY","Real Talk",
      "In Unit 2, “luckily” shows that an event was ___.",
      ["positive","boring","impossible","unfinished"],0,
      "“Luckily” is used to give the opinion that an event was positive.",
      "Mega Goal 1 Unit 2 • Real Talk")
  ];

  const grammar = [
    q("REV-U2-G11","Adjective + Preposition + Gerund",
      "I’m interested in ___ English.",
      ["studied","studies","studying","study"],2,
      "After interested in, use verb-ing.",
      "Unit 2 review • Grammar Q11",true),
    q("REV-U2-G14","Present Perfect Progressive",
      "How long has he been ___ football?",
      ["plays","play","playing","played"],2,
      "Use has been + verb-ing for an activity continuing over time.",
      "Unit 2 review • Grammar Q14",true),
    q("U2-G-B1","Present Perfect Simple & Progressive",
      "I ___ a job for three months, and I still ___ one.",
      ["have been looking for / haven't found","have looked for / haven't been finding","look / don't find","am looking for / didn't find"],0,
      "The search is continuing, while finding a job is the result that has not happened.",
      "Mega Goal 1 Unit 2 • Grammar B1"),
    q("U2-G-B2","Present Perfect Simple",
      "My father ___ at many different jobs during his career.",
      ["has worked","has been working","is working","works now"],0,
      "The sentence focuses on the completed experience across several jobs.",
      "Mega Goal 1 Unit 2 • Grammar B2"),
    q("U2-G-B3","Present Perfect Simple & Progressive",
      "Adnan ___ books for years, but he ___ an award yet.",
      ["has been writing / hasn't received","has written / hasn't been receiving","writes / doesn't receive","was writing / didn't receive"],0,
      "For years emphasizes the continuing activity; the award is a result that has not happened.",
      "Mega Goal 1 Unit 2 • Grammar B3"),
    q("U2-G-B4","Present Perfect Simple",
      "How many pages of that book ___?",
      ["have you read","have you been reading","did you reading","are you read"],0,
      "How many asks about a completed amount, so use the present perfect simple.",
      "Mega Goal 1 Unit 2 • Grammar B4"),
    q("U2-G-GOODAT","Good at + Gerund",
      "Hakim is good at ___ pictures.",
      ["taking","take","to take","took"],0,
      "Good at is followed by a noun or verb-ing.",
      "Mega Goal 1 Unit 2 • Grammar D example"),
    q("U2-G-INTERESTED","Interested in + Gerund",
      "Hakim is interested in ___ a photographer.",
      ["become","becoming","became","to became"],1,
      "Interested in is followed by verb-ing.",
      "Mega Goal 1 Unit 2 • Grammar D example")
  ];

  const functions = [
    q("REV-U2-G10","Simple Present",
      "He ___ his car every day.",
      ["drive","drives","driving","drove"],1,
      "Every day signals the simple present; with he, add -s.",
      "Unit 2 review • Grammar Q10",true),
    q("REV-U2-G12","Prepositions of Time",
      "He works ___ night.",
      ["at","on","in","for"],0,
      "Use at with night: at night.",
      "Unit 2 review • Grammar Q12",true),
    q("REV-U2-G13","Relative Pronouns",
      "The new driver ___ started work yesterday is very quiet.",
      ["where","who","which","when"],1,
      "Use who for a person when it is the subject of the relative clause.",
      "Unit 2 review • Grammar Q13",true),
    q("U2-FMF-WH1","Wh-Questions • Simple Present",
      "What ___ your uncle ___? He’s a writer.",
      ["does / do","do / does","is / do","does / does"],0,
      "Use does + subject + base verb.",
      "Mega Goal 1 Unit 2 • Form, Meaning and Function"),
    q("U2-FMF-WH2","Wh-Questions • Simple Present",
      "Where ___ she work?",
      ["do","does","is","has"],1,
      "With she, use does + base verb.",
      "Mega Goal 1 Unit 2 • Form, Meaning and Function"),
    q("U2-FMF-REL","Relative Pronouns",
      "The products ___ they launched this week are selling well.",
      ["that","who","where","when"],0,
      "That can refer to things.",
      "Mega Goal 1 Unit 2 • Relative Pronouns"),
    q("U2-FMF-WHILE1","Past Progressive with While",
      "It was raining ___ Yahya was washing the car.",
      ["while","since","for","until"],0,
      "While connects actions happening at the same time in the past.",
      "Mega Goal 1 Unit 2 • Past Progressive with While"),
    q("U2-FMF-WHILE2","Past Progressive with While",
      "While you were working at the photography studio, I ___ graphic design at college.",
      ["was studying","studied","have studied","am studying"],0,
      "Both actions were happening at the same time in the past.",
      "Mega Goal 1 Unit 2 • Past Progressive with While")
  ];

  const step = [
    q("U2-STEP-01","Simple Present",
      "Our boss ______ important people every Tuesday.",
      ["Meeting","Was met","Meets","Is meet"],2,
      "Every Tuesday signals the simple present.",
      "STEP compilation"),
    q("U2-STEP-02","Present Perfect Progressive",
      "The students ______ a new way to process water for six months now.",
      ["develop","are developing","have developed","have been developing"],3,
      "For six months now emphasizes an ongoing activity.",
      "STEP compilation"),
    q("U2-STEP-03","Past Progressive with While",
      "I drank several cups of tea while I ______ this essay.",
      ["have written","wrote","write","was writing"],3,
      "While introduces the continuing past action.",
      "STEP compilation"),
    q("U2-STEP-04","Relative Pronouns",
      "The man ______ is standing next to the door is our teacher.",
      ["which","who","whose","whom"],1,
      "Who refers to a person as the subject of the relative clause.",
      "STEP compilation"),
    q("U2-STEP-05","Adjective + Preposition + Gerund",
      "He is interested ______ learning English.",
      ["in","on","at","for"],0,
      "The fixed expression is interested in.",
      "STEP compilation"),
    q("U2-STEP-06","Present Perfect Simple",
      "I will not go on holiday until I ______ all my work.",
      ["have completed","will complete","completed","did complete"],0,
      "The present perfect expresses completion before the future action.",
      "STEP compilation"),
    q("U2-STEP-07","Wh-Questions",
      "I do not understand this sentence. What ______?",
      ["does mean this word","means this word","does this word mean","this word does mean"],2,
      "Use does + subject + base verb.",
      "STEP compilation"),
    q("U2-STEP-08","Prepositions of Time",
      "I usually study ______ night.",
      ["in","on","at","for"],2,
      "Use at with night.",
      "STEP compilation")
  ];


  // -------------------- OPTIONAL / EXTRA REVIEW --------------------
  const writing = [
    q("U2-WR-01","Writing • Cover Letter",
      "Ahmad Al Nasser / Public Relation Manager / Media International / 90 Riyadh Road / (1) ___",
      ["Jeddah","English","resume"],0,
      "The blank completes the address with the city: Jeddah.",
      "Unit 2 Writing review"),
    q("U2-WR-02","Writing • Cover Letter",
      "I am writing to apply for the summer (2) ___.",
      ["skills","Sincerely","internship"],2,
      "The correct phrase is summer internship.",
      "Unit 2 Writing review"),
    q("U2-WR-03","Writing • Cover Letter",
      "I’m enclosing a completed job application, my (3) ___ and references.",
      ["English","resume","Jeddah"],1,
      "A job application commonly includes a résumé and references.",
      "Unit 2 Writing review"),
    q("U2-WR-04","Writing • Cover Letter",
      "I speak (4) ___ fluently.",
      ["English","intern","skills"],0,
      "English is the language in this sentence.",
      "Unit 2 Writing review"),
    q("U2-WR-05","Writing • Cover Letter",
      "My computer (5) ___ are excellent.",
      ["Jeddah","resume","skills"],2,
      "Computer skills completes the sentence.",
      "Unit 2 Writing review"),
    q("U2-WR-06","Writing • Cover Letter",
      "(6) ___, Youssef Fahad",
      ["intern","Sincerely","English"],1,
      "Sincerely is the closing used in the letter.",
      "Unit 2 Writing review")
  ];

  const reading = [
    q("U2-READ-STEP-01","Reading • Main Idea",
      "What is the main purpose of the JobPool passage?",
      ["To present different internship opportunities and their requirements","To explain how to start a private company","To compare university subjects","To describe one person's daily routine"],0,
      "The passage presents several internship openings and the qualifications needed for each.",
      "Mega Goal 1 Unit 2 • JobPool Has the Job for You"),
    q("U2-READ-STEP-02","Reading • Detail",
      "Which internship is unpaid?",
      ["Media Intern","Archaeological Intern","Environmental Engineering","All three internships"],1,
      "The archaeological internship is unpaid, although lodging and meals are provided.",
      "Mega Goal 1 Unit 2 • Archaeological Interns"),
    q("U2-READ-STEP-03","Reading • Vocabulary in Context",
      "In the passage, the word “painstaking” is closest in meaning to ___.",
      ["requiring a lot of care and effort","quick and effortless","highly paid","done only by machines"],0,
      "The surrounding sentence describes the work as hard and careful.",
      "Mega Goal 1 Unit 2 • Archaeological Interns"),
    q("U2-READ-STEP-04","Reading • Inference",
      "Which applicant is the best match for the media internship?",
      ["Someone fluent in English who is friendly and good with computers","Someone who only wants to work outdoors","Someone who cannot summarize information","Someone who avoids meeting guests"],0,
      "Those qualities match the requirements listed for the media internship.",
      "Mega Goal 1 Unit 2 • Media Intern")
  ];

  const listening = [
    q("U2-LST-STEP-01","Listening • Main Idea",
      "What are Khaled and Yousef mainly talking about?",
      ["Their jobs and career choices","A school exam","A football match","A travel plan"],0,
      "The conversation focuses on their jobs, satisfaction, and career choices.",
      "Mega Goal 1 Unit 2 • Conversation"),
    q("U2-LST-STEP-02","Listening • Detail",
      "How long has Khaled been a reporter at the station?",
      ["One year","Three years","Five years","Ten years"],2,
      "Khaled says he has been a reporter there for five years.",
      "Mega Goal 1 Unit 2 • Conversation"),
    q("U2-LST-STEP-03","Listening • Detail",
      "What job did Yousef hope to have?",
      ["Dentist","Watch repairer","Reporter","Engineer"],1,
      "Yousef says he was hoping to be a watch repairer.",
      "Mega Goal 1 Unit 2 • Conversation"),
    q("U2-LST-STEP-04","Listening • Inference",
      "What can be inferred about Yousef's current job?",
      ["He is dissatisfied and wants a new challenge","He has just started and loves it","He plans to stay there forever","He works at the TV station"],0,
      "He says he is bored and wants something more challenging.",
      "Mega Goal 1 Unit 2 • Conversation")
  ];

  const sections = {
    vocab: {
      title:"Vocabulary & Real Talk", icon:"💬", questions:vocab,
      trainingId:"journey-u2-core-1", trainingType:"vocabulary", required:true
    },
    grammar: {
      title:"Grammar", icon:"🧩", questions:grammar,
      trainingId:"journey-u2-core-2", trainingType:"grammar", required:true
    },
    functions: {
      title:"Form, Meaning & Function", icon:"🎯", questions:functions,
      trainingId:"journey-u2-core-3", trainingType:"grammar", required:true
    },
    step: {
      title:"STEP Practice", icon:"⚡", questions:step,
      trainingId:"journey-u2-step", trainingType:"step", required:true
    },
    writing: {
      title:"Writing Review", icon:"✍️", questions:writing,
      trainingId:"journey-u2-writing", trainingType:"writing", required:false
    },
    reading: {
      title:"Reading • Extra Practice", icon:"📖", questions:reading,
      trainingId:"journey-u2-reading-extra", trainingType:"reading", required:false
    },
    listening: {
      title:"Listening • Extra Practice", icon:"🎧", questions:listening,
      trainingId:"journey-u2-listening-extra", trainingType:"listening", required:false
    }
  };

  const requiredKeys = ["vocab","grammar","functions"];
  const allRequiredQuestionIds = requiredKeys.flatMap(k=>sections[k].questions.map(x=>x.id));
  const TOTAL_REQUIRED = allRequiredQuestionIds.length; // 22

  function openSet(list){
    return new Set((list||[]).map(x=>typeof x==="string"?x:x?.id).filter(Boolean));
  }

  function hydrate(a,o,p){
    attempts = Array.isArray(a)?a:[];
    openUnits = Array.isArray(o)?o:[];
    profile = p || null;
  }

  function latestStage(trainingId){
    return attempts
      .filter(a=>a.trainingId===trainingId && a.recordKind!=="question")
      .sort((a,b)=>String(b.submittedAt||"").localeCompare(String(a.submittedAt||"")))[0] || null;
  }

  function latestQuestion(sectionKey, questionId){
    return attempts
      .filter(a=>a.recordKind==="question" &&
        a.examUnit==="u2" &&
        a.examSection===sectionKey &&
        a.questionId===questionId)
      .sort((a,b)=>String(b.submittedAt||"").localeCompare(String(a.submittedAt||"")))[0] || null;
  }

  function answeredCount(sectionKey){
    const sec=sections[sectionKey];
    return sec.questions.filter(x=>!!latestQuestion(sectionKey,x.id)).length;
  }

  function sectionDone(sectionKey){
    const sec=sections[sectionKey];
    return answeredCount(sectionKey)===sec.questions.length;
  }

  function requiredAnswered(){
    return requiredKeys.reduce((n,k)=>n+answeredCount(k),0);
  }

  function reviewPct(){
    return Math.round(requiredAnswered()/TOTAL_REQUIRED*100);
  }

  function studentView(){
    return document.querySelector(".student-view");
  }

  function unit2IsOpen(){
    return openSet(openUnits).has("u2");
  }

  async function currentStudent(){
    if(!window.firebase?.auth || !window.firebase?.firestore) throw new Error("Firebase is not available.");
    const user=firebase.auth().currentUser;
    if(!user) throw new Error("Student is not signed in.");
    const snap=await firebase.firestore().collection("users").doc(user.uid).get();
    if(!snap.exists) throw new Error("Student profile was not found.");
    const p=snap.data()||{};
    if(p.role!=="student") throw new Error("This account is not a student account.");
    return {user,p};
  }

  async function saveQuestion(sectionKey,item,selected){
    const {user,p}=await currentStudent();
    const correct=selected===item.answer;
    const now=new Date().toISOString();
    const record={
      recordKind:"question",
      examUnit:"u2",
      examSection:sectionKey,
      questionId:item.id,
      studentId:user.uid,
      studentName:p.displayName||"",
      classId:p.classId||"",
      classCode:p.classCode||"",
      teacherId:p.teacherId||"",
      trainingId:`question-u2-${sectionKey}-${item.id}-${Date.now()}`,
      trainingTitle:sections[sectionKey].title,
      trainingType:"question",
      unitNumber:2,
      stem:item.prompt,
      skill:item.skill,
      selected,
      selectedText:item.choices[selected]||"",
      correctAnswer:item.answer,
      correctText:item.choices[item.answer]||"",
      correct,
      score:correct?1:0,
      total:1,
      percentage:correct?100:0,
      source:item.source,
      studyMethod:"u2-exam-review-question",
      submittedAt:now
    };
    await firebase.firestore().collection("attempts").add(record);
    attempts.push(record);
    return record;
  }

  async function saveSection(sectionKey){
    const sec=sections[sectionKey];
    const answers=sec.questions.map(item=>{
      const a=latestQuestion(sectionKey,item.id);
      return {
        question_id:item.id,
        stem:item.prompt,
        skill:item.skill,
        selected:Number(a?.selected ?? -1),
        correctAnswer:item.answer,
        correct:!!a?.correct,
        selectedText:a?.selectedText||"",
        correctText:item.choices[item.answer]||"",
        explanation:item.explanation||"",
        need:""
      };
    });
    const score=answers.filter(a=>a.correct).length;
    const total=sec.questions.length;
    const percentage=Math.round(score/total*100);
    const payload={
      trainingId:sec.trainingId,
      trainingTitle:sec.title,
      trainingType:sec.trainingType,
      unitId:"u2",
      unitNumber:2,
      score,total,percentage,
      elapsedSeconds:Math.max(1,Math.round((Date.now()-(session?.started||Date.now()))/1000)),
      answers,
      studyMethod:"u2-exam-review"
    };
    await window.PROVE.recordJourneyAttempt(payload);
    // Keep local rendering state current without waiting for a dashboard refresh.
    attempts.push({...payload,submittedAt:new Date().toISOString()});
    return {score,total,percentage};
  }

  function sectionCard(key){
    const sec=sections[key];
    const answered=answeredCount(key);
    const done=answered===sec.questions.length;
    const stage=latestStage(sec.trainingId);
    const score=stage?`${stage.score}/${stage.total}`:"";
    const reviewCount=sec.questions.filter(q=>q.review).length;
    return `<button class="journey-stop ${done?'done':''}" onclick="STEPUP_U2_EXAM.start('${key}')">
      <span class="journey-stop-icon">${done?'✓':sec.icon}</span>
      <span class="journey-stop-copy">
        <b>${esc(sec.title)}</b>
        <small>${done?`Completed ${score?`• ${score}`:''}`:`${answered}/${sec.questions.length} answered${reviewCount?` • ${reviewCount} review questions`:''}`}</small>
      </span>
      <span class="journey-stop-arrow">›</span>
    </button>`;
  }

  function openUnit2(){
    if(!unit2IsOpen()) return old.openUnit("u2");
    const h=studentView();
    if(!h)return;

    const pct=reviewPct();
    const answered=requiredAnswered();

    h.innerHTML=`<div class="journey-breadcrumb"><button onclick="PROVE.setStudentTab('journey')">My Journey</button><span>›</span><b>Unit 2</b></div>

      <section class="journey-unit-hero">
        <span class="journey-kicker">Unit 2 • Exam Review</span>
        <h1>Careers</h1>
        <p>Every required review question is included for every student. Nothing is randomly skipped.</p>
        <div class="journey-mini-progress"><i style="width:${pct}%"></i></div>
        <small>${answered}/${TOTAL_REQUIRED} required questions answered • ${pct}%</small>
      </section>

      <section class="journey-master-card">
        <div class="journey-stage-title">
          <span>✓</span>
          <div>
            <h2>Tomorrow’s Review Path</h2>
            <p>Answer in any order. Every answer is saved before you continue.</p>
          </div>
          <b>${pct}%</b>
        </div>
        <div class="journey-stops">
          ${requiredKeys.map(sectionCard).join("")}
        </div>
      </section>

      <section class="journey-master-card u2-step-separate-card">
        <div class="journey-stage-title">
          <span>⚡</span>
          <div>
            <h2>STEP Practice</h2>
            <p>Quick grammar practice.</p>
          </div>
          <b>${answeredCount("step")}/${sections.step.questions.length}</b>
        </div>
        <div class="journey-stops">
          ${sectionCard("step")}
        </div>
      </section>

      <section class="journey-master-card">
        <div class="journey-stage-title">
          <span>+</span>
          <div>
            <h2>Extra / Optional Practice</h2>
            <p>These do not block your Unit 2 exam review progress.</p>
          </div>
        </div>
        <div class="journey-stops">
          ${sectionCard("writing")}
          ${sectionCard("reading")}
          ${sectionCard("listening")}
        </div>
      </section>`;
  }

  function pendingQuestions(sectionKey){
    const sec=sections[sectionKey];
    const remaining=sec.questions.filter(item=>!latestQuestion(sectionKey,item.id));
    // If the section was already completed, a manual revisit starts all questions again.
    return remaining.length?remaining:[...sec.questions];
  }

  function startSection(sectionKey){
    const sec=sections[sectionKey];
    if(!sec)return;
    const queue=pendingQuestions(sectionKey);
    session={
      sectionKey,sec,queue,pos:0,
      started:Date.now(),
      runAnswers:[]
    };
    helpMode=null;
    renderQuestion();
  }

  function renderQuestion(){
    if(!session)return;
    const h=studentView();
    if(!h)return;
    const item=session.queue[session.pos];
    const reviewBadge=item.review?`<span class="u2-review-badge">Review Question</span>`:"";
    h.innerHTML=`<div class="journey-breadcrumb"><button onclick="STEPUP_U2_EXAM.open()">Unit 2</button><span>›</span><b>${esc(session.sec.title)}</b></div>
      <section class="journey-question-card">
        <div class="journey-question-meta">
          <span>${esc(item.skill)}</span>
          <b>${session.pos+1}/${session.queue.length}</b>
        </div>
        ${reviewBadge}
        <h2 dir="ltr">${esc(item.prompt)}</h2>
        <div class="journey-options">
          ${item.choices.map((x,i)=>`<button ${saving?'disabled':''} onclick="STEPUP_U2_EXAM.answer(${i})"><span>${String.fromCharCode(65+i)}</span><b dir="ltr">${esc(x)}</b></button>`).join("")}
        </div>
        <div class="u2-help-actions">
          <button type="button" class="${helpMode==='en'?'active':''}" onclick="STEPUP_U2_EXAM.help('en')">English Hint</button>
          <button type="button" class="${helpMode==='ar'?'active':''}" onclick="STEPUP_U2_EXAM.help('ar')">مساعدة بالعربي</button>
        </div>
        ${helpMode==='en'?`<div class="u2-help-panel en" dir="ltr">${esc(englishHint(item))}</div>`:""}
        ${helpMode==='ar'?`<div class="u2-help-panel ar" dir="rtl">${esc(arabicHint(item))}</div>`:""}
        ${session.sectionKey==="step"?"":`<small class="u2-source-note">${esc(item.source)}</small>`}
      </section>`;
  }

  function renderFeedback(item,selected,record){
    const h=studentView();
    if(!h)return;
    const ok=record.correct;
    h.innerHTML=`<div class="journey-breadcrumb"><button onclick="STEPUP_U2_EXAM.open()">Unit 2</button><span>›</span><b>${esc(session.sec.title)}</b></div>
      <section class="journey-feedback ${ok?'good':'support'}">
        <span>${ok?'✓':'✕'}</span>
        <h2>${ok?'Correct!':'Not quite'}</h2>
        ${!ok?`
          <div class="u2-correct-answer" dir="ltr"><b>Correct answer:</b> ${esc(item.choices[item.answer])}</div>
          <div class="u2-explain-grid">
            <div class="u2-explain-box en" dir="ltr"><b>English Explanation</b><p>${esc(item.explanation)}</p></div>
            <div class="u2-explain-box ar" dir="rtl"><b>الشرح بالعربي</b><p>${esc(arabicExplanation(item))}</p></div>
          </div>
        `:`<p>${esc(item.explanation)}</p>`}
        <div class="u2-saved-pill">Saved ✓</div>
        <button class="journey-main-btn" onclick="STEPUP_U2_EXAM.next()">Continue</button>
      </section>`;
  }

  async function answer(selected){
    if(!session||saving)return;
    const item=session.queue[session.pos];
    saving=true;
    try{
      const record=await saveQuestion(session.sectionKey,item,Number(selected));
      session.runAnswers.push(record);
      renderFeedback(item,Number(selected),record);
    }catch(e){
      console.error("Unit 2 answer save failed",e);
      alert("This answer was not saved. Please tap your answer again.");
      renderQuestion();
    }finally{
      saving=false;
    }
  }

  async function next(){
    if(!session)return;
    if(session.pos<session.queue.length-1){
      session.pos++;
      helpMode=null;
      return renderQuestion();
    }

    // If this was a resumed section, make sure all required questions now exist.
    if(!sectionDone(session.sectionKey)){
      session.queue=pendingQuestions(session.sectionKey);
      session.pos=0;
      return renderQuestion();
    }

    let result;
    try{
      result=await saveSection(session.sectionKey);
    }catch(e){
      console.error("Unit 2 section save failed",e);
      alert("Your answers are saved, but the section summary could not be saved yet. Open the section again to retry.");
      session=null;
      return openUnit2();
    }

    const sec=session.sec;
    const sectionKey=session.sectionKey;
    const passNeeded=sec.pass||Math.ceil(sec.questions.length*0.67);
    const passed=result.score>=passNeeded;
    const h=studentView();
    session=null;

    if(h){
      h.innerHTML=`<section class="journey-result ${passed?'good':'review'}">
        <div class="journey-result-score">${result.score}<span>/${result.total}</span></div>
        <h2>${passed?'Review stop complete ✨':'Review complete — check the missed answers'}</h2>
        <p>All ${result.total} questions in ${esc(sec.title)} were shown and saved.</p>
        <div class="journey-result-actions">
          <button class="journey-main-btn" onclick="STEPUP_U2_EXAM.open()">Back to Unit 2</button>
          <button class="journey-link-btn" onclick="STEPUP_U2_EXAM.start('${sectionKey}')">Practice again</button>
        </div>
      </section>`;
    }
  }

  function addStyles(){
    if(document.getElementById("u2ExamReviewStyles"))return;
    const s=document.createElement("style");
    s.id="u2ExamReviewStyles";
    s.textContent=`
      .u2-review-badge{
        display:inline-flex;align-items:center;gap:6px;
        margin:2px 0 10px;padding:7px 10px;border-radius:999px;
        background:#fff4cc;color:#6b5310;font-weight:800;font-size:13px
      }
      .u2-source-note{display:block;margin-top:14px;color:#78879a;font-size:12px}
      .u2-correct-answer{
        margin:12px 0;padding:12px 14px;border-radius:14px;
        background:#f1f5fb;color:#17243a;text-align:left
      }
      .u2-saved-pill{
        display:inline-block;margin:8px 0 2px;padding:7px 11px;border-radius:999px;
        background:#e7f7ee;color:#176b4a;font-weight:900
      }
      .u2-help-actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:14px}
      .u2-help-actions button{border:1px solid #d7dfeb;background:#fff;color:#33445c;border-radius:999px;padding:9px 13px;font-weight:800}
      .u2-help-actions button.active{background:#eef3ff;border-color:#aebfea}
      .u2-help-panel{margin-top:10px;padding:12px 14px;border-radius:14px;background:#f7f9fc;color:#33445c;line-height:1.7}
      .u2-help-panel.ar{font-size:15px}
      .u2-explain-grid{display:grid;gap:10px;margin-top:12px}
      .u2-explain-box{padding:13px 14px;border-radius:14px;background:#f7f9fc;text-align:left}
      .u2-explain-box.ar{text-align:right}
      .u2-explain-box b{display:block;margin-bottom:5px}
      .u2-explain-box p{margin:0;line-height:1.7}
      .u2-step-separate-card{
        border-style:dashed;
      }
      .u2-step-separate-card .journey-stage-title p{
        max-width:760px;
      }
    `;
    document.head.appendChild(s);
  }

  function examBanner(){
    if(!unit2IsOpen())return "";
    return `<section class="journey-continue u2-exam-priority">
      <div class="journey-continue-copy">
        <span class="journey-kicker">Tomorrow • Unit 2 Exam Review</span>
        <h2>Unit 2 • Careers</h2>
        <p><strong>Full coverage:</strong> all Unit 2 review questions appear for every student.</p>
        <div class="journey-mini-progress"><i style="width:${reviewPct()}%"></i></div>
        <small>${requiredAnswered()}/${TOTAL_REQUIRED} Unit 2 questions answered • ${reviewPct()}%</small>
      </div>
      <button class="journey-main-btn" onclick="STEPUP_U2_EXAM.open()">Open Unit 2 Review</button>
    </section>`;
  }

  J.homeHTML=function(a,o,p){
    hydrate(a,o,p);
    return examBanner()+old.homeHTML(a,o,p);
  };

  J.html=function(a,o,p){
    hydrate(a,o,p);
    const base=old.html(a,o,p);
    return (unit2IsOpen()?examBanner():"")+base;
  };

  J.progressHTML=function(a,o,p){
    hydrate(a,o,p);
    const base=old.progressHTML(a,o,p);
    if(!unit2IsOpen())return base;
    return base+`<section class="journey-progress-card">
      <div class="journey-progress-head"><div><span class="journey-kicker">Unit 2 Exam Review</span><h2>${reviewPct()}% complete</h2></div></div>
      <p>${requiredAnswered()} of ${TOTAL_REQUIRED} Unit 2 review questions have been answered and saved.</p>
    </section>`;
  };

  J.openUnit=function(uid){
    if(uid==="u2")return openUnit2();
    return old.openUnit(uid);
  };

  J.go=function(uid,key){
    if(uid!=="u2")return old.go(uid,key);
    if(key==="core-1")return startSection("vocab");
    if(key==="core-2")return startSection("grammar");
    if(key==="core-3"||key==="core-4")return startSection("functions");
    if(key==="step")return startSection("step");
    if(key==="final")return openUnit2();
    if(key==="reading")return startSection("reading");
    if(key==="listening")return startSection("listening");
    return openUnit2();
  };

  addStyles();

  window.STEPUP_U2_EXAM={
    version:VERSION,
    open:openUnit2,
    start:startSection,
    answer,
    next,
    help:toggleHelp,
    getProgress:()=>({
      answered:requiredAnswered(),
      total:TOTAL_REQUIRED,
      percentage:reviewPct()
    })
  };
})();
