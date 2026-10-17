/* STEP UP · Fix My Mistakes: isolated learning recovery, not a graded assessment. */
(function(){
  'use strict';
  var active=null;
  function esc(v){return String(v==null?'':v).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
  function uid(){try{return window.firebase.auth().currentUser&&window.firebase.auth().currentUser.uid||null;}catch(_){return null;}}
  function host(){return document.querySelector('.student-view');}
  function key(s){return 'stepup-fix-20261018-'+uid()+'-'+s;}
  function read(s){try{return JSON.parse(localStorage.getItem(key(s))||'null');}catch(_){return null;}}
  function save(){if(!active||!uid()||active.uid!==uid())return;try{localStorage.setItem(key(active.unit+'-'+active.runId),JSON.stringify({pos:active.pos,phase:active.phase,tryNo:active.tryNo,outcomes:active.outcomes,updatedAt:new Date().toISOString()}));}catch(_){}}
  function item(p,c,a,why,audio){return {p:p,c:c,a:a,why:why||'',audio:audio||''};}
  // Every item is newly written for recovery, not an original exam or practice-bank question.
  // Two distinct checks per concept permit one optional second attempt.
  var checks={
    simple:[
      item('My sister ___ to school every morning.',['walk','walks','is walking','walked'],1,'Every morning describes a routine. With she, use walks.'),
      item('Water ___ at 100°C.',['boils','is boiling','boiled','has boiling'],0,'Use the simple present for a general scientific fact.')
    ],
    progressive:[
      item('Look! The birds ___ over the garden.',['fly','flew','are flying','have flown'],2,'Look! refers to an action happening now.'),
      item('This week, we ___ a new school project.',['work on','are working on','worked on','have working'],1,'This week describes a temporary action in progress.')
    ],
    stative:[
      item('I ___ the answer to this question.',['am knowing','know','knowing','was know'],1,'Know is a stative verb, so we normally use the simple present.'),
      item('She ___ this idea is useful.',['is believing','believes','believing','was believe'],1,'Believe expresses a state or opinion, not an action in progress.')
    ],
    past:[
      item('They ___ the museum last Friday.',['visit','have visited','visited','are visiting'],2,'Last Friday refers to a finished past time.'),
      item('___ you see the film yesterday?',['Did','Have','Do','Are'],0,'Use Did + subject + base verb for a simple past question.')
    ],
    perfectPast:[
      item('We ___ in this city since 2021.',['live','lived yesterday','have lived','are live'],2,'Since 2021 connects the past to the present.'),
      item('She ___ to Jeddah in 2022.',['has traveled','travels','traveled','is traveling'],2,'In 2022 is a finished past time; use the simple past.')
    ],
    pastProgressive:[
      item('At 9 p.m. last night, they ___ dinner.',['were having','have','are having','had usually'],0,'An action in progress at a particular past moment uses was/were + -ing.'),
      item('Yesterday at six, I ___ my homework.',['do','was doing','have done','am doing'],1,'Use was doing for an action in progress at a past time.')
    ],
    interrupted:[
      item('I ___ a book when the phone rang.',['read now','was reading','have read','am reading'],1,'Was reading is the longer past action; rang is the shorter event.'),
      item('They ___ home when it began to rain.',['were walking','are walking','have walked','walk'],0,'Use were walking for an action interrupted by began.')
    ],
    simultaneous:[
      item('While she was studying, her brother ___ dinner.',['was cooking','has cooked','cooks tomorrow','is cook'],0,'Both actions were in progress at the same time in the past.'),
      item('While they ___, the teacher was writing on the board.',['talk','were talking','have talked','are talk'],1,'While can connect two simultaneous past progressive actions.')
    ],
    perfProg:[
      item('He ___ English for three hours.',['has been studying','studied yesterday','is study','have study'],0,'Has been studying emphasizes duration from the past until now.'),
      item('They ___ since eight o’clock.',['wait','have been waiting','were wait','waited tomorrow'],1,'Since indicates the starting point of an ongoing action.')
    ],
    perfSimple:[
      item('Mona ___ two emails today.',['has sent','has been send','send yesterday','is send'],0,'Has sent emphasizes a completed number or result.'),
      item('I ___ my application already.',['finish yesterday','have finished','am finish','finishing'],1,'Already often describes a completed result relevant now.')
    ],
    perfContrast:[
      item('She ___ five pages so far.',['has written','has been write','writes yesterday','is written'],0,'A completed number is usually expressed with the present perfect simple.'),
      item('He ___ for the exam all morning.',['has been preparing','has prepare','prepares yesterday','was prepare'],0,'All morning emphasizes the duration of an ongoing activity.')
    ],
    gerund:[
      item('Sara is good ___ solving problems.',['at','for','on','to'],0,'The expression is good at + verb-ing.'),
      item('Ali is interested ___ learning languages.',['on','in','for','at'],1,'The expression is interested in + verb-ing.')
    ],
    relative:[
      item('A pilot is someone ___ flies airplanes.',['where','who','which','when'],1,'Who refers to a person.'),
      item('This is the phone ___ I bought yesterday.',['who','where','that','when'],2,'That can introduce a relative clause about a thing.')
    ],
    wh:[
      item('___ does your sister work? — In a hospital.',['Where','When','Who','Why'],0,'Where asks about a place.'),
      item('Where ___ he live?',['do','does','is','have'],1,'Use does with he in simple present questions.')
    ],
    prep:[
      item('We have a meeting ___ Thursday.',['in','on','at','to'],1,'Use on with days of the week.'),
      item('The class starts ___ 8:00 a.m.',['at','on','in','from'],0,'Use at with a specific clock time.')
    ],
    will:[
      item('The door is open. I ___ close it.',['am closing yesterday','will','have','was going'],1,'Will can express a decision made at the moment.'),
      item('I think life ___ be different in 2050.',['will','was','have','is being'],0,'Will can express a prediction or opinion about the future.')
    ],
    goingPlan:[
      item('We already booked the tickets. We ___ visit Taif.',['will have','are going to','were','have'],1,'A plan decided earlier uses be going to.'),
      item('Look at those clouds! It ___ rain.',['has','is going to','was','have'],1,'Be going to can express a prediction based on visible evidence.')
    ],
    futureProg:[
      item('At this time tomorrow, I ___ for the exam.',['will be studying','studied','have studied','study yesterday'],0,'Use will be + verb-ing for an action in progress at a future time.'),
      item('This time next week, they ___ in Riyadh.',['will be working','worked','have working','work yesterday'],0,'Future progressive describes an ongoing action at a specified future time.')
    ],
    futureArr:[
      item('We ___ our teacher tomorrow at four.',['are meeting','met yesterday','has met','are meet'],0,'Present progressive expresses a planned future arrangement.'),
      item('They ___ to Dammam on Friday.',['are flying','flew yesterday','has fly','were flown'],0,'Present progressive can express a fixed future arrangement.')
    ],
    tag:[
      item('You are ready, ___?',['are you','aren’t you','do you','did you'],1,'A positive statement with are takes a negative tag.'),
      item('They won’t be late, ___?',['won’t they','are they','will they','do they'],2,'A negative statement with will takes a positive tag.')
    ],
    suggest:[
      item('___ going to the library after class?',['How about','How many','When is','How far'],0,'How about + verb-ing makes a suggestion.'),
      item('Why don’t we make a poster? — ___',['That sounds great!','Yesterday.','At eight.','A blue poster.'],0,'An appropriate response accepts the suggestion.')
    ],
    realTalk:[
      item('“I’m absolutely sure” is closest in meaning to:',['I am certain','I forgot','I disagree','I am bored'],0,'Absolutely sure expresses confidence.'),
      item('“No kidding?” often expresses:',['surprise','a warning','a time','a number'],0,'No kidding? is commonly used when surprised.')
    ],
    vocab:[
      item('The city opened a new library. The word “opened” is closest in meaning to:',['closed forever','started operating','forgot','lost'],1,'Use the sentence context to infer the meaning.'),
      item('The plan had a positive effect. “Effect” means:',['a result or change','an old building','a person','a day'],0,'The context shows that effect is a result or change.')
    ],
    careerVocab:[
      item('A person who repairs cars is a ___.',['mechanic','surgeon','pilot','chef'],0,'A mechanic repairs vehicles.'),
      item('A ___ studies and discovers new things.',['scientist','driver','cashier','actor'],0,'A scientist investigates and discovers things.')
    ],
    u3Vocab:[
      item('Hundreds of people came together to see the event. They ___.',['gathered','separated','disappeared','forgot'],0,'Gathered means came together.'),
      item('The old machine was no longer used. It was ___.',['modern','obsolete','new','perfect'],1,'Obsolete means outdated or no longer in use.')
    ],
    main:[
      item('Read: “Our school built a garden. Students grow vegetables there and learn to care for plants.” What is the main idea?',['The school garden helps students learn.','Vegetables are expensive.','The school closed.','Students dislike plants.'],0,'Choose the idea that summarizes the whole short text.'),
      item('Read: “Buses now reach more neighborhoods. People spend less time traveling.” What is the main idea?',['New buses improve travel.','Buses are always empty.','Roads are closed.','Travel costs increased.'],0,'The main idea covers all the details in the text.')
    ],
    detail:[
      item('Read: “The science fair will be on Wednesday in the school hall.” Where is the fair?',['In the library','In the school hall','At the airport','In the park'],1,'Find the exact location stated in the short text.'),
      item('Read: “The museum opens at nine and closes at four.” When does it close?',['At seven','At nine','At four','At ten'],2,'Scan for the specific time mentioned.')
    ],
    inference:[
      item('Read: “Maha took her umbrella after seeing dark clouds.” What can you infer?',['She expects rain.','She is going swimming.','It is very sunny.','She lost her bag.'],0,'Dark clouds and an umbrella together suggest rain.'),
      item('Read: “The lights were off, and the store door was locked.” What can you infer?',['The store is closed.','The store is busy.','It has no door.','The store opened early.'],0,'The clues imply the store is not open.')
    ],
    reference:[
      item('Read: “Hind bought a laptop. She uses it for school.” What does “it” refer to?',['Hind','school','the laptop','a teacher'],2,'It refers back to the closest logical thing: a laptop.'),
      item('Read: “The students saw the coach. He smiled.” Who is “He”?',['The coach','The students','The school','The class'],0,'He refers to the singular male noun coach.')
    ],
    readingVocab:[
      item('Read: “The town is thriving. New businesses open every month.” “Thriving” means:',['prosperous','empty','silent','broken'],0,'The new businesses are evidence that the town is doing well.'),
      item('Read: “The instructions were clear and simple.” “Clear” means:',['easy to understand','dangerous','late','secret'],0,'The surrounding word simple supports the meaning.')
    ],
    author:[
      item('Read: “For example, students can plant trees and save water.” Why does the writer give examples?',['To support the main idea','To list dates','To change the subject','To ask a question'],0,'Examples support or explain a point.'),
      item('Read: “The city improved roads and added buses.” Why mention both changes?',['To give details about transport improvements','To describe a holiday','To name two teachers','To explain a recipe'],0,'The examples illustrate the type of improvement.')
    ],
    audioDetail:[
      item('What time does the art club meet?',['At ten','At three','At seven','At five'],1,'The short announcement says three o’clock.','The art club meets at three o’clock on Tuesday.'),
      item('Where is the English workshop?',['In Room 12','In the gym','In the library','In the kitchen'],2,'The spoken notice says in the library.','The English workshop will be in the library on Thursday.')
    ],
    audioMain:[
      item('What is the announcement mainly about?',['A new school club','A rainy day','A lost phone','A football match'],0,'The message announces the opening of a new school club.','Our school is starting a new science club next week. Students can join on Monday.'),
      item('What is the speaker talking about?',['A new bus service','A school exam','A cooking lesson','A visit to the hospital'],0,'The main idea is the new bus service.','Starting tomorrow, a new bus will take students to school every morning.')
    ],
    audioSequence:[
      item('What did the students do first?',['They visited a museum','They went home','They bought lunch','They took a test'],0,'The recording says they visited the museum before lunch.','First, the students visited a museum. After that, they had lunch at a café.'),
      item('What happened after the lights went out?',['The teacher opened a window','The class began','The bus arrived','The store closed'],0,'The recording gives the sequence directly.','The lights went out during the class. Then the teacher opened a window.')
    ]
  };
  function topic(q){
    var s=String(q.skill||'').toLowerCase(),p=String(q.stem||'').toLowerCase(),e=String(q.explanation||'').toLowerCase();
    if(/listening/.test(s)){return /sequence|order/.test(s)?'audioSequence':/main idea/.test(s)?'audioMain':'audioDetail';}
    if(/reading|comprehension|historical|global issues/.test(s)){
      if(/reference/.test(s))return 'reference';
      if(/inference/.test(s))return 'inference';
      if(/main idea/.test(s))return 'main';
      if(/vocab/.test(s))return 'readingVocab';
      if(/author/.test(s))return 'author';
      return 'detail';
    }
    if(/tag question/.test(s)||/tag question/.test(e))return 'tag';
    if(/suggestion/.test(s)||/suggestion/.test(e))return 'suggest';
    if(/future progressive/.test(s)||/will be \+ verb-ing|future progressive/.test(e))return 'futureProg';
    if(/present progressive for the future|future arrangement/.test(s)||/scheduled future|future arrangement/.test(e))return 'futureArr';
    if(/going to/.test(s)||/going to/.test(e)||/future prediction/.test(e))return 'goingPlan';
    if(/future with will|will •|future with will/.test(s)||/will is used|after will|will can/.test(e))return 'will';
    if(/perfect simple & progressive/.test(s))return 'perfContrast';
    if(/perfect progressive/.test(s))return 'perfProg';
    if(/perfect simple/.test(s))return 'perfSimple';
    if(/adjective \+ preposition|gerund|good at|interested in/.test(s))return 'gerund';
    if(/relative pronoun/.test(s))return 'relative';
    if(/prepositions of time/.test(s))return 'prep';
    if(/wh-question|information question/.test(s))return 'wh';
    if(/stative/.test(s))return 'stative';
    if(/past progressive with while/.test(s))return 'simultaneous';
    if(/past progressive.*when|past progressive with as/.test(s))return 'interrupted';
    if(/past progressive/.test(s))return 'pastProgressive';
    if(/present perfect|past vs present perfect|simple past vs present perfect/.test(s))return 'perfectPast';
    if(/simple past|past in context|past sequence/.test(s))return 'past';
    if(/present progressive/.test(s)||/progressive -/.test(s))return 'progressive';
    if(/simple present|present simple/.test(s))return 'simple';
    if(/real talk/.test(s))return 'realTalk';
    if(/vocabulary|vocab/.test(s))return /^u2$/.test(q.unit)?'careerVocab':/^u3$/.test(q.unit)?'u3Vocab':'vocab';
    if(/final challenge/.test(s)){
      if(/tag/.test(e)||/won.t/.test(p))return 'tag';
      if(/progressive|will be|this time/.test(e+p))return 'futureProg';
      if(/suggestion/.test(e+p))return 'suggest';
      if(/going to|future/.test(e+p))return 'goingPlan';
      if(/present progressive/.test(e))return 'futureArr';
      return 'will';
    }
    return /grammar/.test(s)?'simple':'detail';
  }
  var arabic={
    simple:'نستخدم المضارع البسيط للعادة أو الحقيقة. انتبهي للفاعل والكلمات الدالة على التكرار.',
    progressive:'نستخدم المضارع المستمر للفعل الذي يحدث الآن أو للحالة المؤقتة. انتبهي إلى am/is/are + ing.',
    stative:'أفعال الحالة مثل know وunderstand لا تستخدم غالبا بصيغة الاستمرار.',
    past:'استخدمي الماضي البسيط مع وقت انتهى، مثل yesterday أو last year.',
    perfectPast:'ميزي بين وقت ماض انتهى فنستخدم الماضي البسيط، وحدث مرتبط بالحاضر فنستخدم المضارع التام.',
    pastProgressive:'نستخدم was/were + ing لوصف فعل كان مستمرا في لحظة معينة من الماضي.',
    interrupted:'حددي الفعل المستمر في الماضي والفعل الأقصر الذي قطعه. المستمر بصيغة was/were + ing.',
    simultaneous:'تربط while بين فعلين كانا يحدثان في الوقت نفسه في الماضي.',
    perfProg:'نستخدم have/has been + ing لفعل بدأ في الماضي وما زال مستمرا. تشير since للبداية وfor للمدة.',
    perfSimple:'نستخدم have/has + التصريف الثالث عند التركيز على النتيجة أو عدد الأشياء المنجزة.',
    perfContrast:'نستخدم المضارع التام البسيط للنتيجة أو العدد، والتام المستمر للتركيز على مدة النشاط.',
    gerund:'انتبهي إلى التعبير الثابت وحرف الجر، ثم صيغة الفعل المنتهية بـ ing.',
    relative:'نستخدم who للشخص، وwhich للشيء، وقد تأتي that بحسب السياق.',
    wh:'حددي نوع المعلومة المطلوبة، ثم راجعي ترتيب السؤال والفعل المساعد.',
    prep:'حددي التعبير الزمني: on مع الأيام، وat مع الساعة وnight.',
    will:'نستخدم will للقرار اللحظي أو التوقع والرأي عن المستقبل، وبعدها فعل بصيغته الأساسية.',
    goingPlan:'نستخدم be going to لخطة سابقة أو توقع تدعمه علامة واضحة الآن.',
    futureProg:'نستخدم will be + ing لوصف فعل سيكون مستمرا في وقت محدد في المستقبل.',
    futureArr:'يمكن استخدام المضارع المستمر للتعبير عن ترتيب مستقبلي محدد.',
    tag:'في سؤال التأكيد تتحول الجملة المثبتة عادة إلى ذيل منفي، والمنفية إلى ذيل مثبت.',
    suggest:'للاقتراح نستخدم مثلا How about + ing أو Why don’t we + فعل أساسي.',
    realTalk:'انتبهي لمعنى التعبير كاملًا في سياق المحادثة، لا لمعنى كل كلمة وحدها.',
    vocab:'حددي معنى الكلمة من سياق الجملة. لا تعتمدي على ترجمة كلمة منفصلة.',
    careerVocab:'اربطي المفردة بالمهنة أو وصف العمل الوارد في السؤال.',
    u3Vocab:'اربطي المفردة بموقفها في النص أو المحادثة لتحديد معناها الصحيح.',
    main:'الفكرة الرئيسة تلخص النص كله، وليست معلومة صغيرة وردت في سطر واحد.',
    detail:'ابحثي عن الدليل أو المعلومة الدقيقة في النص، ثم قارنيها بالخيارات.',
    inference:'الاستنتاج يعتمد على أدلة من النص، حتى لو لم ترد الإجابة حرفيا.',
    reference:'لتحديد مرجع الضمير، عودي إلى الاسم المناسب في الجملة السابقة.',
    readingVocab:'استخدمي الكلمات المحيطة بالمفردة لفهم معناها من السياق.',
    author:'اسألي نفسك: لماذا ذكر الكاتب هذا المثال؟ هل يوضح الفكرة أم يدعمها؟',
    audioDetail:'استمعي للمعلومة المطلوبة مباشرة، مثل الاسم أو الوقت أو المكان، لا لكلمة مألوفة فقط.',
    audioMain:'ركزي على موضوع المقطع كاملًا، ولا تختاري تفصيلا صغيرا بدل الفكرة الرئيسة.',
    audioSequence:'انتبهي لترتيب الأحداث والكلمات الدالة على البداية وما حدث بعدها.'
  };
  function source(){return window.STEPUP_SMART&&window.STEPUP_SMART.latestResult;}
  function mistakesOf(a){return (a.answers||[]).filter(function(x){return x&&x.correct===false;});}
  function activeOK(){return active&&uid()===active.uid&&source()&&source()(active.unit)&&String(source()(active.unit).reviewRunId)===String(active.runId);}
  function start(unit){
    // Discard a prior student's recovery screen as soon as the auth identity changes.
    if(active&&active.uid!==uid()){
      active=null;var previous=host();
      if(previous&&previous.querySelector('.fix-recovery'))previous.innerHTML='<section class="fix-recovery"><p>This review belongs to a different session. Open your own unit to continue.</p></section>';
    }
    if(!/^u[123]$/.test(unit)||!uid()||!source())return;
    var a=source()(unit);if(!a||a.recordKind!=='smart-full-review')return;
    var errors=mistakesOf(a);if(!errors.length)return;
    var id=String(a.reviewRunId||'');if(!id)return;
    var prev=read(unit+'-'+id)||{},pos=Number(prev.pos);
    active={uid:uid(),unit:unit,runId:id,mistakes:errors,pos:Number.isInteger(pos)?Math.min(Math.max(pos,0),errors.length):0,
      phase:['explain','check','feedback','done'].includes(prev.phase)?prev.phase:'explain',
      tryNo:prev.tryNo===1?1:0,outcomes:prev.outcomes&&typeof prev.outcomes==='object'?prev.outcomes:{},selected:null};
    if(active.phase==='feedback')active.phase='check'; // A pending choice is never restored as confirmed.
    render();
  }
  function current(){return active&&active.mistakes[active.pos];}
  function qTopic(){var q=current();return q&&topic(Object.assign({unit:active.unit},q));}
  function question(){var topicId=qTopic(),set=checks[topicId];return set&&set[active.tryNo%2]||null;}
  function whyAR(q){var t=qTopic();var translation=arabic[t]||arabic.detail;
    var answer=q.correctText?'<p class="fix-ar-answer">الإجابة الصحيحة: <b dir="ltr">'+esc(q.correctText)+'</b></p>':'';
    return '<p dir="rtl" lang="ar">'+esc(translation)+'</p>'+answer;
  }
  function intro(){
    var q=current(),k=active.pos+1,n=active.mistakes.length;
    var en=q.explanation||'Compare the clue in the question with the correct answer.';
    return '<header class="fix-head"><small>Unit '+esc(active.unit.slice(1))+' · Mistake '+k+' of '+n+'</small><h2>Understand Your Mistake</h2><p>'+esc(q.skill||'Review')+'</p></header>'+
      '<div class="fix-original"><h3 dir="ltr">'+esc(q.stem||'')+'</h3><p dir="ltr" class="fix-your"><b>Your answer:</b> '+esc(q.selectedText||'Not recorded')+'</p>'+
      '<p dir="ltr" class="fix-correct"><b>Correct answer:</b> '+esc(q.correctText||'')+'</p></div>'+
      '<section class="fix-explanation"><h3>Why?</h3><div lang="en" dir="ltr"><b>English</b><p>'+esc(en)+'</p></div>'+
      '<div lang="ar" dir="rtl"><b>بالعربية</b>'+whyAR(q)+'</div></section>';
  }
  function render(){
    if(!activeOK()){active=null;var old=host();if(old&&old.querySelector('.fix-recovery'))old.innerHTML='';return;}
    var h=host();if(!h)return;
    if(active.pos>=active.mistakes.length||active.phase==='done'){active.phase='done';save();return renderDone();}
    var s='<section class="fix-recovery" data-fix-unit="'+esc(active.unit)+'">'+intro();
    if(active.phase==='explain'){
      s+='<button type="button" class="fix-primary" data-fix-action="begin-check">Check My Understanding →</button>';
    }else if(active.phase==='check'){
      var q=question();if(!q){s+='<p role="status">A matching check is not available for this skill yet.</p><button class="fix-primary" data-fix-action="next">Next Mistake →</button>';}
      else{s+='<div class="fix-check"><small>Check My Understanding · '+(active.tryNo+1)+'/2</small><h3 dir="ltr">'+esc(q.p)+'</h3>';
        if(q.audio){s+='<button type="button" class="fix-listen" data-fix-action="listen">▶ Listen to the short message</button><p class="fix-audio-note" role="status">Listen before choosing your answer.</p>';}
        s+='<div class="fix-options" role="group" aria-label="Check question options">'+q.c.map(function(x,i){return '<button type="button" aria-pressed="false" data-fix-action="choose" data-index="'+i+'">'+String.fromCharCode(65+i)+'. '+esc(x)+'</button>';}).join('')+'</div>'+
          '<button type="button" class="fix-primary fix-confirm" data-fix-action="confirm" disabled>Confirm Answer</button></div>';
      }
    }else if(active.phase==='feedback'){
      var ok=active.lastCorrect===true,q=question();
      s+='<div class="fix-feedback '+(ok?'fix-good':'fix-review')+'" role="status"><h3>'+(ok?'Great! You’ve got it!':'Keep learning')+'</h3>'+
        '<p><b>Correct answer:</b> '+esc(q&&q.c[q.a]||'')+'</p><p>'+esc(q&&q.why||'')+'</p></div>'+
        (!ok&&active.tryNo===0?'<button type="button" class="fix-primary" data-fix-action="retry">Try One More Check →</button>':'')+
        '<button type="button" class="fix-secondary" data-fix-action="next">'+(active.pos+1===active.mistakes.length?'Finish Review':'Next Mistake →')+'</button>';
    }
    s+='<button type="button" class="fix-exit" data-fix-action="exit">Back to My Learning Level</button></section>';
    h.innerHTML=s;
  }
  function renderDone(){
    var h=host();if(!h)return;
    var vals=Object.keys(active.outcomes).map(function(k){return active.outcomes[k];});
    var passed=vals.filter(function(x){return x==='checked';}).length;
    h.innerHTML='<section class="fix-recovery fix-complete"><h2>Well done! ✨</h2><p>You reviewed '+active.mistakes.length+' mistake'+(active.mistakes.length===1?'':'s')+'.</p>'+
      '<p><b>'+passed+'</b> check'+(passed===1?'':'s')+' answered correctly.</p>'+
      (passed<active.mistakes.length?'<p>Some ideas may need more practice. Your original score has not changed.</p>':'<p>Keep using what you learned. Your original score has not changed.</p>')+
      '<button type="button" class="fix-primary" data-fix-action="exit">Back to My Learning Level</button></section>';
  }
  function choose(i){
    if(!activeOK()||active.phase!=='check'||!question()||!Number.isInteger(i)||i<0||i>=question().c.length)return;
    active.selected=i;
    var h=host();if(!h)return;
    h.querySelectorAll('.fix-options button').forEach(function(b){var selected=Number(b.dataset.index)===i;b.classList.toggle('fix-selected',selected);b.setAttribute('aria-pressed',String(selected));});
    var button=h.querySelector('.fix-confirm');if(button)button.disabled=false;
  }
  function confirm(){
    if(!activeOK()||active.phase!=='check'||active.selected===null||!question())return;
    var ok=active.selected===question().a;
    active.lastCorrect=ok;active.outcomes[String(active.pos)]=ok?'checked':'needs-review';active.phase='feedback';active.selected=null;save();render();
  }
  function retry(){if(!activeOK()||active.phase!=='feedback'||active.lastCorrect!==false||active.tryNo!==0)return;active.tryNo=1;active.phase='check';active.selected=null;save();render();}
  function next(){if(!activeOK()||active.phase!=='feedback'&&active.phase!=='check')return;active.pos++;active.phase='explain';active.tryNo=0;active.selected=null;save();render();}
  function beginCheck(){if(!activeOK()||active.phase!=='explain')return;active.phase='check';active.selected=null;save();render();}
  function exit(){if(!active||!uid()||active.uid!==uid())return;var unit=active.unit;save();active=null;var a=source()&&source()(unit),h=host();if(a&&h){h.innerHTML=window.STEPUP_SMART.reportHTML(a)+'<div class="smart-footer-action"><button type="button" onclick="STEPUP_SMART.openUnit(\''+unit+'\')">Back to Unit '+unit.slice(1)+'</button></div>';}else window.STEPUP_SMART.openUnit(unit);}
  function listen(){
    var q=question(),h=host();if(!activeOK()||active.phase!=='check'||!q||!q.audio||!h)return;
    var notice=h.querySelector('.fix-audio-note');
    if(!('speechSynthesis'in window)||!('SpeechSynthesisUtterance'in window)){
      if(notice)notice.textContent='Audio is unavailable on this device. Read this text instead: '+q.audio+' (reading check only).';return;
    }
    try{window.speechSynthesis.cancel();var msg=new window.SpeechSynthesisUtterance(q.audio);msg.lang='en-US';msg.rate=.82;msg.onerror=function(){if(notice)notice.textContent='Audio could not play. Read this text instead: '+q.audio+' (reading check only).';};window.speechSynthesis.speak(msg);if(notice)notice.textContent='Playing English audio…';}
    catch(e){if(notice)notice.textContent='Audio is unavailable. Read this text instead: '+q.audio+' (reading check only).';}
  }
  document.addEventListener('click',function(e){
    var b=e.target.closest&&e.target.closest('.student-view [data-fix-action]');
    if(!b)return;
    var action=b.dataset.fixAction;
    if(action==='choose')choose(Number(b.dataset.index));
    else if(action==='confirm')confirm();
    else if(action==='begin-check')beginCheck();
    else if(action==='retry')retry();
    else if(action==='next')next();
    else if(action==='exit')exit();
    else if(action==='listen')listen();
  });
  var css=document.createElement('style');css.id='stepupFixStyles';
  css.textContent='.fix-recovery{max-width:760px;margin:16px auto;padding:22px;border:1px solid #dce6ee;background:#fff;border-radius:18px;color:#20334d}.fix-head small,.fix-check small{color:#58758b;font-weight:700}.fix-head h2{font-size:23px;margin:8px 0}.fix-head p{color:#557083;margin:0 0 12px}.fix-original{padding:16px;border-radius:14px;background:#f5f8fc}.fix-original h3,.fix-check h3{font-size:19px;line-height:1.65;margin:4px 0 14px}.fix-original p{margin:8px 0;line-height:1.6}.fix-your{color:#944243}.fix-correct{color:#176d55}.fix-explanation{margin:16px 0}.fix-explanation h3{margin:0 0 9px}.fix-explanation>div{border:1px solid #e1e8ee;padding:12px 15px;border-radius:12px;margin:8px 0;line-height:1.75}.fix-explanation [lang="ar"]{background:#fbfcfe}.fix-explanation p{margin:4px 0}.fix-check{margin:20px 0;padding:15px;background:#f5f8fc;border-radius:14px}.fix-options{display:grid;gap:9px;margin-bottom:14px}.fix-options button{font-family:inherit;text-align:left!important;direction:ltr;border:1px solid #cbd7e4;border-radius:11px;background:#fff;color:#25394e;padding:14px;font-size:15px;cursor:pointer;min-height:46px}.fix-options button.fix-selected{border:2px solid #286ca4!important;background:#eaf3ff!important;box-shadow:0 0 0 1px #cbdfff}.fix-primary,.fix-secondary,.fix-listen{display:block;width:100%;border:0;border-radius:12px;padding:13px 15px;margin:10px 0;font-size:15px;font-weight:800;cursor:pointer}.fix-primary{background:#286c88;color:#fff}.fix-primary:disabled{opacity:.42;cursor:not-allowed}.fix-secondary{color:#286c88;background:#e8f3f7}.fix-listen{background:#e9f1fc;color:#254f80}.fix-exit{display:block;margin:15px auto 0;border:0;background:transparent;color:#526a81;text-decoration:underline;padding:9px;cursor:pointer}.fix-feedback{padding:14px;border-radius:12px;background:#fff7ee}.fix-feedback.fix-good{background:#edf8f1}.fix-feedback p{line-height:1.6}.fix-complete{text-align:center}.fix-ar-answer b{unicode-bidi:isolate}@media(hover:hover) and (pointer:fine){.fix-options button:hover:not(.fix-selected){background:#f3f7fc;border-color:#8caecc}}@media(max-width:520px){.fix-recovery{padding:15px}.fix-head h2{font-size:20px}}';
  document.head.appendChild(css);
  window.STEPUP_FIX={start:start,choose:choose,beginCheck:beginCheck,confirm:confirm,retry:retry,next:next,exit:exit,topic:topic,checks:checks,getActive:function(){return active;}};
})();