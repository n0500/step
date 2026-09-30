// StepUp • Unit 2 Review — deterministic full coverage
// 2026-09-29
// Goals:
// - Unit 2 can be entered directly even if Unit 1 is unfinished.
// - Every required review question is shown to every student; no random sampling.
// - Every answer is saved to Firestore before moving on.
// - Correct / Not quite feedback appears after every saved answer.
// - Required exam path: Vocabulary & Real Talk → Grammar → Language Functions → Reading → Listening.
// - Reading and Listening are required parts of the Unit 2 review path.
(() => {
  "use strict";

  const J = window.STEPUP_JOURNEY;
  if (!J || !J.data) return;

  const VERSION = "u2-needs-practice-20260930-1";
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
  const READING_PASSAGE = [
    {
      title:"About Us",
      paragraphs:[
        "JobPool is a privately-owned career network with branches all over the world. Since its foundation in 2000, the company has constantly improved its users’ experience with new features and services. JobPool has been growing globally through strategic international expansion. We have helped professionals and companies all over the world to meet each other."
      ]
    },
    {
      title:"Media Intern: TV and Radio Media International",
      paragraphs:[
        "Do you want to be part of the fast-paced world of television and meet famous people at the same time? Here’s your chance. Our interns research information about hot topics. They need to find information quickly and be able to summarize it in clear language. Our hosts use the information on their programs. Our interns also greet our guests when they arrive in our studios. You need to be fluent in English and be good at using computers. And you must be friendly and outgoing. This is a paid internship for the summer."
      ]
    },
    {
      title:"Archaeological Interns: Students Learning Overseas",
      paragraphs:[
        "Here’s an opportunity to study history firsthand and to work with noted archaeologists on an exciting dig. We’ve been uncovering ruins at the famous ancient city of Pompeii for several years. Interns’ job is to dig slowly and carefully. They also work to uncover buildings that have been buried for centuries. It is very hard and painstaking work. The reward is a chance to discover something that the volcano Vesuvius buried with its lava two thousand years ago. This is an unpaid three-month internship, but lodging and meals are provided near the site."
      ]
    },
    {
      title:"Environmental Engineering: Saudi Construction, Riyadh",
      paragraphs:[
        "Great opportunity for a civil engineering graduate student in the environment field! This project involves the construction of a road and a number of other local projects, such as research centers and new pipelines. The interns work alongside experienced civil engineers and receive training in the different work sectors. You need to be able to read blueprints, have some knowledge of Arabic, and be able to cope with temperatures that average 104°F (40°C). Food and accommodation will be provided."
      ]
    }
  ];

  function readingPassageHTML(){
    return `<section id="u2ReadingPassage" class="u2-reading-passage" dir="ltr">
      <div class="u2-reading-passage-head">
        <div>
          <span>Reading Passage</span>
          <b>JobPool Has the Job for You</b>
        </div>
        <button type="button" onclick="document.getElementById('u2ReadingQuestion')?.scrollIntoView({behavior:'smooth',block:'start'})">↓ Go to Question</button>
      </div>
      ${READING_PASSAGE.map(part=>`
        <div class="u2-reading-part">
          <h3>${esc(part.title)}</h3>
          ${part.paragraphs.map(p=>`<p>${esc(p)}</p>`).join("")}
        </div>`).join("")}
    </section>`;
  }

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

  const LISTENING_DIALOGUE = [
    {speaker:"Yousef", text:"So, Khaled, are you happy with your job at the TV station?"},
    {speaker:"Khaled", text:"Yes, very happy. I enjoy being out there and talking to people. I get a lot of satisfaction out of my job."},
    {speaker:"Yousef", text:"How long have you been working on TV?"},
    {speaker:"Khaled", text:"I’ve been a reporter at this station for five years, since my internship. What about you?"},
    {speaker:"Yousef", text:"I’ve been working at the bank since I left high school. It’s the same thing day after day, day in and day out. I’m bored to death. I was hoping to be a watch repairer, you know, but my parents talked me out of it. They said it wasn’t a serious profession."},
    {speaker:"Khaled", text:"Well, I was going to be a dentist, but luckily I changed my mind. Can you imagine me in a small room, stuck between four walls?"},
    {speaker:"Yousef", text:"That’s where I am right now. It’s time to move on and find something more challenging. I have a lot of different skills. I’m good at solving problems. I’m organized, reliable, hardworking. What do you think I should do?"}
  ];

  function listeningPlayerHTML(){
    return `<section class="u2-listening-player" aria-label="Listening audio">
      <div class="u2-listening-player-copy">
        <span>🎧</span>
        <div>
          <b>Listen to the conversation</b>
          <small id="u2ListeningStatus">Play the audio, then answer the question. Replay anytime.</small>
        </div>
      </div>
      <div class="u2-listening-controls">
        <button type="button" onclick="STEPUP_U2_EXAM.listen()">▶ Listen</button>
        <button type="button" onclick="STEPUP_U2_EXAM.stopAudio()">■ Stop</button>
      </div>
    </section>`;
  }

  function setListeningStatus(message){
    const el=document.getElementById("u2ListeningStatus");
    if(el)el.textContent=message;
  }

  function stopListening(){
    try{
      if("speechSynthesis" in window) window.speechSynthesis.cancel();
    }catch(_){}
    setListeningStatus("Stopped. Tap Listen to play again.");
  }

  function playListening(){
    if(!("speechSynthesis" in window) || typeof SpeechSynthesisUtterance==="undefined"){
      setListeningStatus("Audio playback is not supported on this device.");
      return;
    }
    window.speechSynthesis.cancel();

    const voices=(window.speechSynthesis.getVoices?.()||[]).filter(v=>String(v.lang||"").toLowerCase().startsWith("en"));
    const voiceA=voices[0]||null;
    const voiceB=voices.find(v=>!voiceA || v.name!==voiceA.name)||voiceA||null;

    setListeningStatus("Playing…");
    LISTENING_DIALOGUE.forEach((line,index)=>{
      const u=new SpeechSynthesisUtterance(line.text);
      u.lang="en-US";
      u.rate=.90;
      u.pitch=line.speaker==="Khaled" ? .96 : 1.02;
      if(line.speaker==="Khaled" && voiceA)u.voice=voiceA;
      if(line.speaker==="Yousef" && voiceB)u.voice=voiceB;
      if(index===LISTENING_DIALOGUE.length-1){
        u.onend=()=>setListeningStatus("Finished. Replay anytime.");
        u.onerror=()=>setListeningStatus("Audio stopped. Tap Listen to try again.");
      }
      window.speechSynthesis.speak(u);
    });
  }

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
      title:"STEP Practice", icon:"STEP", questions:step,
      trainingId:"journey-u2-step", trainingType:"step", required:true
    },
    reading: {
      title:"Reading", icon:"📖", questions:reading,
      trainingId:"journey-u2-reading", trainingType:"reading", required:true
    },
    listening: {
      title:"Listening", icon:"🎧", questions:listening,
      trainingId:"journey-u2-listening", trainingType:"listening", required:true
    }
  };

  const requiredKeys = ["vocab","grammar","functions","reading","listening"];
  const allRequiredQuestionIds = requiredKeys.flatMap(k=>sections[k].questions.map(x=>x.id));
  const TOTAL_REQUIRED = allRequiredQuestionIds.length; // 30

  function openSet(list){
    return new Set((list||[]).map(x=>typeof x==="string"?x:x?.id).filter(Boolean));
  }

  function hydrate(a,o,p){
    attempts = Array.isArray(a)?a:[];
    openUnits = Array.isArray(o)?o:[];
    profile = p || null;
  }

  function stageAttempts(trainingId){
    return attempts
      .filter(a=>a.trainingId===trainingId && a.recordKind!=="question")
      .sort((a,b)=>String(b.submittedAt||"").localeCompare(String(a.submittedAt||"")));
  }

  function latestStage(trainingId){
    return stageAttempts(trainingId)[0] || null;
  }

  function bestStage(trainingId){
    return stageAttempts(trainingId)
      .sort((a,b)=>(Number(b.bestPercentage ?? b.percentage ?? 0)-Number(a.bestPercentage ?? a.percentage ?? 0)) ||
        String(b.submittedAt||"").localeCompare(String(a.submittedAt||"")))[0] || null;
  }

  function stageAttemptCount(trainingId){
    return stageAttempts(trainingId).length;
  }

  function questionAttempts(sectionKey,questionId){
    return attempts
      .filter(a=>a.recordKind==="question" &&
        a.examUnit==="u2" &&
        a.examSection===sectionKey &&
        a.questionId===questionId)
      .sort((a,b)=>String(b.submittedAt||"").localeCompare(String(a.submittedAt||"")));
  }

  function latestQuestion(sectionKey, questionId){
    return questionAttempts(sectionKey,questionId)[0] || null;
  }

  function bestQuestion(sectionKey,questionId){
    const list=questionAttempts(sectionKey,questionId);
    return list.find(a=>a.correct===true || a.bestCorrect===true) || list[0] || null;
  }

  function answeredCount(sectionKey){
    const sec=sections[sectionKey];
    return sec.questions.filter(x=>!!latestQuestion(sectionKey,x.id)).length;
  }

  function correctCount(sectionKey){
    const sec=sections[sectionKey];
    return sec.questions.filter(x=>!!bestQuestion(sectionKey,x.id)?.correct || !!bestQuestion(sectionKey,x.id)?.bestCorrect).length;
  }

  function sectionDone(sectionKey){
    const sec=sections[sectionKey];
    return answeredCount(sectionKey)===sec.questions.length;
  }

  function requiredAnswered(){
    return requiredKeys.reduce((n,k)=>n+answeredCount(k),0);
  }

  function requiredCorrect(){
    return requiredKeys.reduce((n,k)=>n+correctCount(k),0);
  }

  function reviewPct(){
    return Math.round(requiredAnswered()/TOTAL_REQUIRED*100);
  }

  function accuracyPct(){
    const answered=requiredAnswered();
    return answered?Math.round(requiredCorrect()/answered*100):0;
  }

  function progressStatsHTML(){
    const answered=requiredAnswered();
    const correct=requiredCorrect();
    return `<div class="u2-progress-stats">
      <span><b>${answered}/${TOTAL_REQUIRED}</b><small>Progress • ${reviewPct()}%</small></span>
      <span><b>${answered?`${correct}/${answered}`:"—"}</b><small>Accuracy${answered?` • ${accuracyPct()}%`:""}</small></span>
    </div>`;
  }


  function weaknessAreas(){
    const grouped=new Map();

    requiredKeys.forEach(sectionKey=>{
      const sec=sections[sectionKey];
      sec.questions.forEach(item=>{
        const list=questionAttempts(sectionKey,item.id);
        if(!list.length)return;

        const mastered=list.some(a=>a.correct===true || a.bestCorrect===true);
        if(mastered)return;

        const mapKey=`${sectionKey}::${item.skill}`;
        const misses=list.filter(a=>a.correct===false).length;
        const last=list.reduce((m,a)=>String(a.submittedAt||"")>m?String(a.submittedAt||""):m,"");

        if(!grouped.has(mapKey)){
          grouped.set(mapKey,{
            sectionKey,
            sectionTitle:sec.title,
            skill:item.skill,
            questionCount:0,
            misses:0,
            last:""
          });
        }
        const g=grouped.get(mapKey);
        g.questionCount+=1;
        g.misses+=Math.max(1,misses);
        if(last>g.last)g.last=last;
      });
    });

    return [...grouped.values()]
      .sort((a,b)=>
        (b.questionCount-a.questionCount) ||
        (b.misses-a.misses) ||
        String(b.last).localeCompare(String(a.last))
      )
      .slice(0,3);
  }

  function improvedAreas(){
    const grouped=new Map();

    requiredKeys.forEach(sectionKey=>{
      const sec=sections[sectionKey];
      sec.questions.forEach(item=>{
        const list=questionAttempts(sectionKey,item.id);
        if(list.length<2)return;

        const hasWrong=list.some(a=>a.correct===false);
        const correctAttempts=list.filter(a=>a.correct===true || a.bestCorrect===true);
        if(!hasWrong || !correctAttempts.length)return;

        const latestCorrect=correctAttempts
          .map(a=>String(a.submittedAt||""))
          .sort()
          .pop() || "";

        const mapKey=`${sectionKey}::${item.skill}`;
        if(!grouped.has(mapKey)){
          grouped.set(mapKey,{
            sectionKey,
            sectionTitle:sec.title,
            skill:item.skill,
            improvedQuestions:0,
            lastCorrect:""
          });
        }
        const g=grouped.get(mapKey);
        g.improvedQuestions+=1;
        if(latestCorrect>g.lastCorrect)g.lastCorrect=latestCorrect;
      });
    });

    return [...grouped.values()]
      .sort((a,b)=>String(b.lastCorrect).localeCompare(String(a.lastCorrect)))
      .slice(0,2);
  }

  function needsPracticeHTML(){
    const weak=weaknessAreas();
    const improved=improvedAreas();
    const answered=requiredAnswered();

    let main="";
    if(!answered){
      main=`<div class="u2-needs-empty">
        Complete a few questions first. Your practice recommendations will appear here.
      </div>`;
    }else if(!weak.length){
      main=`<div class="u2-needs-strong">
        <span>✓</span>
        <div><b>No current weak areas</b><small>Keep practicing to maintain your progress.</small></div>
      </div>`;
    }else{
      main=`<div class="u2-needs-list">
        ${weak.map(w=>`
          <button type="button" class="u2-need-row"
            onclick="STEPUP_U2_EXAM.practiceWeakness('${encodeURIComponent(w.sectionKey)}','${encodeURIComponent(w.skill)}')">
            <span class="u2-need-mark">!</span>
            <span class="u2-need-copy">
              <b>${esc(w.skill)}</b>
              <small>${esc(w.sectionTitle)} • ${w.questionCount} ${w.questionCount===1?"question":"questions"} to strengthen</small>
            </span>
            <span class="u2-need-action">Practice</span>
          </button>`).join("")}
      </div>`;
    }

    const improvedHTML=improved.length?`
      <div class="u2-improved">
        <span class="u2-improved-label">Improved ✓</span>
        <div class="u2-improved-chips">
          ${improved.map(x=>`<span>${esc(x.skill)}</span>`).join("")}
        </div>
      </div>`:"";

    return `<section class="journey-master-card u2-needs-card">
      <div class="journey-stage-title">
        <span>◎</span>
        <div>
          <h2>Needs Practice</h2>
          <p>Based on your answers. Areas disappear when you master them.</p>
        </div>
      </div>
      ${main}
      ${improvedHTML}
    </section>`;
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
    const previous=questionAttempts(sectionKey,item.id);
    const priorBestCorrect=previous.some(a=>a.correct===true || a.bestCorrect===true);
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
      attemptNumber:previous.length+1,
      bestCorrect:priorBestCorrect || correct,
      bestScore:(priorBestCorrect || correct)?1:0,
      bestPercentage:(priorBestCorrect || correct)?100:0,
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
      const a=bestQuestion(sectionKey,item.id);
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
    const priorStages=stageAttempts(sec.trainingId);
    const priorBest=priorStages.reduce((m,a)=>Math.max(m,Number(a.bestPercentage ?? a.percentage ?? 0)),0);
    const currentRunScore=(session?.runAnswers||[]).filter(a=>a.correct).length;
    const payload={
      trainingId:sec.trainingId,
      trainingTitle:sec.title,
      trainingType:sec.trainingType,
      unitId:"u2",
      unitNumber:2,
      score,total,percentage,
      attemptNumber:priorStages.length+1,
      attemptScore:currentRunScore,
      attemptPercentage:Math.round(currentRunScore/Math.max(1,(session?.runAnswers||[]).length)*100),
      bestScore:Math.max(score,Math.round(priorBest*total/100)),
      bestTotal:total,
      bestPercentage:Math.max(percentage,priorBest),
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
    const stage=bestStage(sec.trainingId);
    const score=stage?`${stage.bestScore ?? stage.score}/${stage.bestTotal ?? stage.total}`:"";
    const attemptsCount=stageAttemptCount(sec.trainingId);
    const practiceCount=Math.max(0,attemptsCount-1);
    const reviewCount=sec.questions.filter(q=>q.review).length;
    return `<button class="journey-stop ${done?'done':''} ${key==='step'?'u2-step-card':''}" onclick="STEPUP_U2_EXAM.start('${key}')">
      <span class="journey-stop-icon ${key==='step'&&!done?'u2-step-icon':''}">${done?'✓':sec.icon}</span>
      <span class="journey-stop-copy">
        <b>${esc(sec.title)}</b>
        <small>${done?`Completed ${score?`• ${score}`:''} • Practice again${practiceCount?` • ${practiceCount}× practiced`:''}`:`${answered}/${sec.questions.length} answered${reviewCount?` • ${reviewCount} review questions`:''}`}</small>
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
        <span class="journey-kicker">Unit 2 • Review</span>
        <h1>Careers</h1>
        <p>Every required review question is included for every student. Nothing is randomly skipped.</p>
        <div class="journey-mini-progress"><i style="width:${pct}%"></i></div>
        ${progressStatsHTML()}
      </section>

      ${needsPracticeHTML()}

      <section class="journey-master-card">
        <div class="journey-stage-title">
          <span>✓</span>
          <div>
            <h2>Review Path</h2>
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
          <span class="u2-step-heading-icon">STEP</span>
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

      <button class="u2-practice-entry" onclick="STEPUP_U2_EXAM.practice()">
        <span class="u2-practice-icon">↻</span>
        <span class="u2-practice-copy">
          <b>Practice</b>
          <small>Repeat completed skills as many times as you want. Your progress will not reset.</small>
        </span>
        <span class="journey-stop-arrow">›</span>
      </button>

</section>`;
  }

  function openPractice(){
    const h=studentView();
    if(!h)return;
    const completed=requiredKeys.filter(sectionDone);
    const pct=reviewPct();

    h.innerHTML=`<div class="journey-breadcrumb"><button onclick="STEPUP_U2_EXAM.open()">Unit 2</button><span>›</span><b>Practice</b></div>

      <section class="journey-unit-hero u2-practice-hero">
        <span class="journey-kicker">Practice Mode</span>
        <h1>Practice again</h1>
        <p>Repeat completed skills anytime. Practice attempts are saved, but your Unit 2 completion progress stays intact.</p>
        <div class="journey-mini-progress"><i style="width:${pct}%"></i></div>
        <small>Unit 2 progress • ${requiredAnswered()}/${TOTAL_REQUIRED} • ${pct}%</small>
      </section>

      <section class="journey-master-card">
        <div class="journey-stage-title">
          <span>↻</span>
          <div>
            <h2>Choose a skill</h2>
            <p>${completed.length?`You can repeat any completed skill.`:`Complete a skill first, then it will appear here for practice.`}</p>
          </div>
        </div>
        <div class="journey-stops">
          ${completed.length?completed.map(sectionCard).join(""):`<div class="u2-practice-empty">No completed skills yet.</div>`}
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
    stopListening();
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


  function startWeakness(sectionKeyEncoded,skillEncoded){
    stopListening();
    const sectionKey=decodeURIComponent(sectionKeyEncoded||"");
    const skill=decodeURIComponent(skillEncoded||"");
    const sec=sections[sectionKey];
    if(!sec)return;

    let queue=sec.questions.filter(item=>item.skill===skill);
    if(!queue.length)queue=[...sec.questions];

    session={
      sectionKey,
      sec,
      queue,
      pos:0,
      started:Date.now(),
      runAnswers:[],
      focusOnly:true,
      focusSkill:skill
    };
    helpMode=null;
    renderQuestion();
  }

  function renderQuestion(){
    if(!session)return;
    const h=studentView();
    if(!h)return;
    const item=session.queue[session.pos];
    const isReading=session.sectionKey==="reading";
    const isListening=session.sectionKey==="listening";
    const reviewBadge=item.review?`<span class="u2-review-badge">Review Question</span>`:"";
    h.innerHTML=`<div class="journey-breadcrumb"><button onclick="STEPUP_U2_EXAM.open()">Unit 2</button><span>›</span><b>${esc(session.sec.title)}</b></div>
      <section class="journey-question-card ${isReading?'u2-reading-question-card':''}">
        <div class="journey-question-meta">
          <span>${esc(item.skill)}</span>
          <b>${session.pos+1}/${session.queue.length}</b>
        </div>
        ${reviewBadge}
        <div class="${isReading?'u2-reading-layout':''}">
          ${isReading?readingPassageHTML():""}
          <div class="${isReading?'u2-reading-question-pane':''}" ${isReading?'id="u2ReadingQuestion"':""}>
            ${isListening?listeningPlayerHTML():""}
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
            ${isReading?`<button type="button" class="u2-back-to-passage" onclick="document.getElementById('u2ReadingPassage')?.scrollIntoView({behavior:'smooth',block:'start'})">↑ Back to Passage</button>`:""}
          </div>
        </div>
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
    stopListening();
    if(!session)return;
    if(session.pos<session.queue.length-1){
      session.pos++;
      helpMode=null;
      return renderQuestion();
    }

    // Focused weakness practice can finish without forcing the rest of an unfinished section.
    if(session.focusOnly && !sectionDone(session.sectionKey)){
      const focusSkill=session.focusSkill||session.sec.title;
      const focusScore=session.runAnswers.filter(a=>a.correct).length;
      const focusTotal=session.runAnswers.length;
      const h=studentView();
      session=null;

      if(h){
        h.innerHTML=`<section class="journey-result good">
          <div class="journey-result-score">${focusScore}<span>/${focusTotal}</span></div>
          <h2>Focused practice complete ✨</h2>
          <p>You practiced ${esc(focusSkill)}. Your new answers are saved and your best result is kept.</p>
          <div class="journey-result-actions">
            <button class="journey-main-btn" onclick="STEPUP_U2_EXAM.open()">Back to Unit 2</button>
          </div>
        </section>`;
      }
      return;
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
    const focused=!!session.focusOnly;
    const focusSkill=session.focusSkill||"";
    const passNeeded=sec.pass||Math.ceil(sec.questions.length*0.67);
    const passed=result.score>=passNeeded;
    const h=studentView();
    session=null;

    if(h){
      h.innerHTML=`<section class="journey-result ${passed?'good':'review'}">
        <div class="journey-result-score">${result.score}<span>/${result.total}</span></div>
        <h2>${focused?'Focused practice complete ✨':(passed?'Review stop complete ✨':'Review complete — check the missed answers')}</h2>
        <p>${focused?`You practiced ${esc(focusSkill)}. Your best result has been updated.`:`All ${result.total} questions in ${esc(sec.title)} were shown and saved.`}</p>
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
      .u2-reading-passage{
        margin:14px 0 20px;
        padding:16px;
        border:1px solid #dfe6ef;
        border-radius:18px;
        background:#fbfcfe;
        color:#172033;
        text-align:left;
      }
      .u2-reading-passage-head{
        display:flex;
        flex-direction:column;
        gap:9px;
        margin-bottom:14px;
        padding-bottom:11px;
        border-bottom:1px solid #e6ebf2;
      }
      .u2-reading-passage-head>div{display:flex;flex-direction:column;gap:3px}
      .u2-reading-passage-head button,
      .u2-back-to-passage{
        min-height:40px;padding:8px 12px;border:1px solid #d8e1ec;border-radius:12px;
        background:#fff;color:#35506f;font-weight:800;cursor:pointer;
      }
      .u2-back-to-passage{margin-top:14px;width:100%}
      .u2-reading-passage-head span{
        font-size:11px;
        font-weight:900;
        letter-spacing:.08em;
        text-transform:uppercase;
        color:#6a778c;
      }
      .u2-reading-passage-head b{
        font-size:18px;
        line-height:1.3;
        color:#0f213d;
      }
      .u2-reading-part + .u2-reading-part{
        margin-top:16px;
        padding-top:14px;
        border-top:1px solid #edf1f5;
      }
      .u2-reading-part h3{
        margin:0 0 7px;
        font-size:15px;
        line-height:1.4;
        color:#173b63;
      }
      .u2-reading-part p{
        margin:0;
        font-size:14px;
        line-height:1.75;
        color:#33425a;
      }
      @media (max-width:520px){
        .u2-reading-passage{padding:14px;margin:12px 0 18px}
        .u2-reading-passage-head b{font-size:17px}
        .u2-reading-part h3{font-size:14px}
        .u2-reading-part p{font-size:13.5px;line-height:1.72}
      }

      .u2-progress-stats{
        display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:9px;
        margin-top:12px;
      }
      .u2-progress-stats>span{
        display:flex;flex-direction:column;gap:2px;padding:10px 12px;
        border:1px solid #e1e8f0;border-radius:14px;background:#fff;
      }
      .u2-progress-stats b{font-size:16px;color:#172033}
      .u2-progress-stats small{font-size:11px;color:#6a778c}
      .u2-listening-player{
        margin:0 0 16px;padding:14px;border:1px solid #d9e4ef;
        border-radius:18px;background:#f8fbff;
      }
      .u2-listening-player-copy{display:flex;align-items:center;gap:11px}
      .u2-listening-player-copy>span{
        width:42px;height:42px;display:grid;place-items:center;flex:0 0 auto;
        border-radius:13px;background:#eaf2ff;font-size:21px;
      }
      .u2-listening-player-copy b{display:block;color:#172033}
      .u2-listening-player-copy small{display:block;margin-top:3px;color:#6a778c;line-height:1.45}
      .u2-listening-controls{display:flex;gap:8px;flex-wrap:wrap;margin-top:11px}
      .u2-listening-controls button{
        min-height:42px;padding:9px 14px;border:1px solid #cad7e7;border-radius:12px;
        background:#fff;color:#173b63;font-weight:900;cursor:pointer;
      }
      .u2-listening-controls button:first-child{background:#173b63;color:#fff;border-color:#173b63}
      @media (min-width:900px){
        .u2-reading-layout{
          display:grid;grid-template-columns:minmax(0,1.15fr) minmax(320px,.85fr);
          gap:20px;align-items:start;
        }
        .u2-reading-layout .u2-reading-passage{margin:0}
        .u2-reading-question-pane{
          position:sticky;top:92px;padding:16px;border:1px solid #e2e8f0;
          border-radius:18px;background:#fff;
        }
        .u2-reading-passage-head button,
        .u2-back-to-passage{display:none}
      }
      @media (max-width:520px){
        .u2-progress-stats{grid-template-columns:1fr 1fr}
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
      .u2-step-icon,
      .u2-step-heading-icon{
        display:inline-grid;place-items:center;
        min-width:46px;height:46px;padding:0 7px;
        border-radius:14px;
        font-size:11px;font-weight:900;letter-spacing:.5px;
        line-height:1;
        background:#eef3ff;color:#2f56b3;
        border:2px solid #b9c8ef;
      }
      .u2-step-card .journey-stop-copy b{
        font-weight:900;
      }
      .u2-step-home-card{
        border:2px solid var(--line,#dce3ee);
      }
      .u2-step-home-row{
        display:flex;align-items:center;gap:14px;width:100%;
      }
      .u2-step-home-row .journey-continue-copy{
        flex:1;min-width:0;
      }
      .u2-step-home-row .journey-main-btn{
        flex:0 0 auto;
      }
      @media (max-width:699px){
        .u2-step-home-row{align-items:flex-start;flex-wrap:wrap}
        .u2-step-home-row .journey-continue-copy{flex:1 1 calc(100% - 66px)}
        .u2-step-home-row .journey-main-btn{width:100%}
      }
      .u2-step-separate-card{
        border-style:dashed;
      }
      .u2-practice-entry{
        width:100%;margin-top:14px;padding:15px 16px;
        display:flex;align-items:center;gap:12px;text-align:left;
        border:1px solid #dfe6ef;border-radius:18px;background:#fff;
        color:#172033;cursor:pointer;
      }
      .u2-practice-entry:hover{border-color:#bcc9da}
      .u2-practice-icon{
        width:44px;height:44px;display:grid;place-items:center;
        border-radius:14px;background:#eef4fb;color:#1d5fd6;
        font-size:24px;font-weight:900;flex:0 0 auto;
      }
      .u2-practice-copy{display:block;flex:1;min-width:0}
      .u2-practice-copy b{display:block;font-size:16px}
      .u2-practice-copy small{display:block;margin-top:3px;color:#6a778c;line-height:1.45}
      .u2-practice-empty{
        padding:16px;border:1px dashed #dfe6ef;border-radius:16px;
        text-align:center;color:#6a778c;background:#fafbfd;
      }
      .u2-needs-card{margin-top:14px}
      .u2-needs-list{display:grid;gap:9px}
      .u2-need-row{
        width:100%;display:flex;align-items:center;gap:11px;
        padding:12px 13px;border:1px solid #e1e7ef;border-radius:15px;
        background:#fff;color:#172033;text-align:left;cursor:pointer;
      }
      .u2-need-row:hover{border-color:#c7d3e2}
      .u2-need-mark{
        width:34px;height:34px;display:grid;place-items:center;flex:0 0 auto;
        border-radius:11px;background:#fff4e6;color:#9b5d08;font-weight:900;
      }
      .u2-need-copy{display:block;flex:1;min-width:0}
      .u2-need-copy b{display:block;font-size:14px;line-height:1.35}
      .u2-need-copy small{display:block;margin-top:3px;color:#6a778c;font-size:11px;line-height:1.4}
      .u2-need-action{
        flex:0 0 auto;padding:7px 10px;border-radius:999px;
        background:#eef4fb;color:#1d5fd6;font-size:11px;font-weight:900;
      }
      .u2-needs-empty,
      .u2-needs-strong{
        padding:13px 14px;border:1px dashed #dce4ee;border-radius:14px;
        background:#fafbfd;color:#6a778c;font-size:13px;line-height:1.5;
      }
      .u2-needs-strong{display:flex;align-items:center;gap:10px}
      .u2-needs-strong>span{
        width:32px;height:32px;display:grid;place-items:center;flex:0 0 auto;
        border-radius:50%;background:#e8f6ee;color:#178a55;font-weight:900;
      }
      .u2-needs-strong b{display:block;color:#244331}
      .u2-needs-strong small{display:block;margin-top:2px;color:#6a778c}
      .u2-improved{
        margin-top:12px;padding-top:11px;border-top:1px solid #edf1f5;
      }
      .u2-improved-label{
        display:block;margin-bottom:7px;color:#178a55;font-size:11px;font-weight:900;
        text-transform:uppercase;letter-spacing:.04em;
      }
      .u2-improved-chips{display:flex;gap:7px;flex-wrap:wrap}
      .u2-improved-chips span{
        padding:7px 10px;border-radius:999px;background:#eaf7ef;color:#24623f;
        font-size:11px;font-weight:800;
      }
      @media (max-width:520px){
        .u2-need-row{align-items:flex-start}
        .u2-need-action{margin-top:2px}
      }
      .u2-step-separate-card .journey-stage-title p{
        max-width:760px;
      }
    `;
    document.head.appendChild(s);
  }

  function stepHomeCard(){
    if(!unit2IsOpen())return "";
    const answered=answeredCount("step");
    const total=sections.step.questions.length;
    const done=answered===total;
    return `<section class="journey-continue u2-step-home-card">
      <div class="u2-step-home-row">
        <span class="u2-step-heading-icon">${done?'✓':'STEP'}</span>
        <div class="journey-continue-copy">
          <span class="journey-kicker">STEP Practice</span>
          <h2>STEP</h2>
          <p>Quick grammar practice.</p>
          <div class="journey-mini-progress"><i style="width:${Math.round(answered/total*100)}%"></i></div>
          <small>${answered}/${total} questions</small>
        </div>
        <button class="journey-main-btn" onclick="STEPUP_U2_EXAM.start('step')">${done?'Practice again':'Start STEP'}</button>
      </div>
    </section>`;
  }

  function examBanner(){
    if(!unit2IsOpen())return "";
    return `<section class="journey-continue u2-exam-priority">
      <div class="journey-continue-copy">
        <span class="journey-kicker">Unit 2 Review</span>
        <h2>Unit 2 • Careers</h2>
        <p><strong>Full coverage:</strong> all Unit 2 review questions appear for every student.</p>
        <div class="journey-mini-progress"><i style="width:${reviewPct()}%"></i></div>
        ${progressStatsHTML()}
      </div>
      <button class="journey-main-btn" onclick="STEPUP_U2_EXAM.open()">Open Unit 2 Review</button>
    </section>`;
  }

  J.homeHTML=function(a,o,p){
    hydrate(a,o,p);
    return examBanner()+stepHomeCard()+old.homeHTML(a,o,p);
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
      <div class="journey-progress-head"><div><span class="journey-kicker">Unit 2 Review</span><h2>${reviewPct()}% complete</h2></div></div>
      ${progressStatsHTML()}
      <p>Your accuracy keeps your best result when you practice again and improve.</p>
    </section>
    ${needsPracticeHTML()}`;
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
    practice:openPractice,
    practiceWeakness:startWeakness,
    start:startSection,
    answer,
    next,
    help:toggleHelp,
    listen:playListening,
    stopAudio:stopListening,
    getProgress:()=>({
      answered:requiredAnswered(),
      total:TOTAL_REQUIRED,
      percentage:reviewPct(),
      correct:requiredCorrect(),
      accuracy:accuracyPct()
    })
  };
})();
