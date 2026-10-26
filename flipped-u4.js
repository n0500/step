/* STEP UP — Unit 4 Flipped Reading | The Forgotten Wallet
 * Self-paced preparation, independently assigned per class.
 * Original textbook recording: MG Bk 1 F-SA_2025_2-07.mp3 (CD2/Track07).
 * Does not create mastery attempts, change unit access or issue certificates.
 */
(function(){
'use strict';
const VERSION='20261026-home-mastery-1';
const LESSON_VERSION=3;
const MEDIA='assets/audio/mega-goal-1/unit-04/reading-original-part-';
const AUDIO_SIZE=3256291;
const AUDIO_SHA256='1cc207b7fe39a61bcc8666cfd603769517c7beeecc076c7df2f27dab71cae411';
// Sentence cues estimated from original recording pause boundaries, not word-for-word forced alignment.
const READING_CUES=[9.469,15.347,20.013,22.407,35.815,41.619,45.980,51.034,
 64.520,69.223,76.183,83.534,94.912,105.783,111.500,117.600,127.000,
 134.000,140.000,146.300,151.000,156.000,160.862,168.665,175.880,
 180.397,183.350,187.645,193.698];
const READING_END=201.016;
const TASK='u4-forgotten-wallet-v1';
const e=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const db=()=>window.firebase?.apps?.length?firebase.firestore():null;
const user=()=>window.firebase?.apps?.length?firebase.auth().currentUser:null;
const ids=()=>Array.from({length:6},(_,i)=>MEDIA+String(i+1).padStart(2,'0')+'.bin');
const storedId=uid=>TASK+'-'+uid;
const key=uid=>'stepup-flipped-u4-'+uid;
const defaultState=()=>({step:0,opening:'',opinion:'',answers:{},recovery:{},completed:false,readSections:[],legacyCompleted:false});
const CHAPTERS=[
 {title:'The Surprise That Started It',icon:'🍽️',range:[0,2],start:9.469,end:105.783,
  goal:'Discover the problem, the solution and the first credit card.',
  vocabulary:[['inconceivable','impossible to imagine','يصعب تصوره'],['impractical','not useful in daily life','غير عملي'],['charging it','paying by card instead of cash','الدفع بالبطاقة بدل النقد']]},
 {title:'From One Restaurant to the World',icon:'🌍',range:[2,4],start:105.783,end:175.880,
  goal:'Trace how the idea spread and why people valued the card.',
  vocabulary:[['status symbol','something showing high social standing','رمز للمكانة الاجتماعية'],['franchise','a licensed business branch','امتياز تجاري'],['cashed in on','benefited financially from','استفاد ماديًا من']]},
 {title:'Why the World Changed',icon:'💳',range:[4,6],start:175.880,end:201.016,
  goal:'Identify customer rewards and explain the lasting impact.',
  vocabulary:[['rewards program','special benefits given to customers','برنامج المكافآت'],['revolutionized','changed something in an important way','أحدث تغييرًا جذريًا']]}
];
const CHECKS=[
 {id:'q1',step:2,skill:'Problem and cause',paragraph:'2',
  prompt:'What problem started the idea of paying without cash?',
  choices:['Frank had left his wallet in his other suit.','The waiter asked everyone to use a card.','Restaurants refused to accept money.'],correct:0,
  quote:'Frank realized that he had left his wallet in the other suit.',
  support:'Frank was embarrassed because he could not pay with the cash he was carrying.',
  retryPrompt:'Where had Frank left his wallet?',retryChoices:['At the airport.','In his other suit.','In the restaurant kitchen.'],retryCorrect:1},
 {id:'q2',step:3,skill:'How the solution worked',paragraph:'2',
  prompt:'How did Frank pay when he returned a year later?',
  choices:['He used a cardboard Diner’s Club Card and signed the bill.','He paid with his new mobile phone.','He borrowed cash from the waiter.'],correct:0,
  quote:'Frank handed the waiter a small cardboard card, a Diner’s Club Card, and signed for the meal.',
  support:'The card offered an alternative to paying cash immediately.',
  retryPrompt:'What did he do after handing over the card?',retryChoices:['Signed for his meal.','Changed suits.','Ordered another meal.'],retryCorrect:0},
 {id:'q3',step:5,skill:'Timeline and expansion',paragraph:'3',
  prompt:'What shows that the Diner’s Club idea spread internationally?',
  choices:['It was accepted only in New York.','It created franchises in Canada, France, and Cuba.','No other businesses wanted to accept cards.'],correct:1,
  quote:'The Diner’s Club Card became the first international charge card in 1952 with franchises in Canada, France, and Cuba.',
  support:'The card moved beyond one country, one restaurant, and later beyond restaurants.',
  retryPrompt:'In which year did the card become international?',retryChoices:['1949','1952','1984'],retryCorrect:1},
 {id:'q4',step:6,skill:'Vocabulary in context',paragraph:'2',
  prompt:'What does “status symbol” mean in this reading?',
  choices:['A sign of high social standing.','An official passport.','A card that gives all meals free.'],correct:0,
  quote:'It became a status symbol for those who carried it.',
  support:'A status symbol shows prestige or social standing.',
  retryPrompt:'Someone carries the card to show prestige. Prestige is closest to...',
  retryChoices:['high social standing','low prices','a lost wallet'],retryCorrect:0},
 {id:'q5',step:8,skill:'Benefits and details',paragraph:'5',
  prompt:'What benefit is mentioned for customers in reward programs?',
  choices:['Unlimited cash at restaurants.','Free airline miles or hotel discounts.','Free international passports.'],correct:1,
  quote:'Now many reward programs offer free airline miles and discounts on hotels and other products.',
  support:'Reward programs encourage loyal card users with special benefits.',
  retryPrompt:'Which activity could a card reward help with?',retryChoices:['Booking a hotel at a discount.','Making a paper suitcase.','Replacing a passport.'],retryCorrect:0},
 {id:'q6',step:9,skill:'Main idea and inference',paragraph:'6',
  prompt:'What is the main message of The World of Plastic?',
  choices:['Credit cards began from a problem and transformed payments worldwide.','Restaurants should never use credit cards.','The story is mainly about making movies.'],correct:0,
  quote:'An entirely new business was created that revolutionized the way the world has paid for goods and services ever since.',
  support:'The conclusion connects Frank’s experience with a major worldwide change.',
  retryPrompt:'What did the invention change most?',retryChoices:['The way people pay for goods and services.','The way people travel by plane.','The way restaurants cook food.'],retryCorrect:0}
];
const getQuestion=step=>CHECKS.find(q=>q.step===step);
const answeredCount=(v=state)=>CHECKS.filter(q=>Number.isInteger(v.answers?.[q.id])).length;
const correctCount=(v=state)=>CHECKS.filter(q=>v.answers?.[q.id]===q.correct).length;
const recoveredCount=(v=state)=>CHECKS.filter(q=>Number.isInteger(v.answers?.[q.id])&&v.answers[q.id]!==q.correct&&v.recovery?.[q.id]===q.retryCorrect).length;
const needsRetry=(q,v=state)=>Number.isInteger(v.answers?.[q.id])&&v.answers[q.id]!==q.correct&&!Number.isInteger(v.recovery?.[q.id]);
const isCheckResolved=(q,v=state)=>Number.isInteger(v.answers?.[q.id])&&(v.answers[q.id]===q.correct||Number.isInteger(v.recovery?.[q.id]));
const completedCheck=v=>CHECKS.every(q=>isCheckResolved(q,v))&&v?.opinion&&Array.isArray(v.readSections)&&v.readSections.length===3;
const readiness=v=>{
 if(!v||Number(v.lessonVersion)!==LESSON_VERSION||!v.completed||!completedCheck(v))return 'unfinished';
 const first=correctCount(v),remedial=CHECKS.filter(q=>v.answers[q.id]!==q.correct);
 if(first>=5&&remedial.every(q=>v.recovery?.[q.id]===q.retryCorrect))return 'ready';
 if(remedial.every(q=>v.recovery?.[q.id]===q.retryCorrect))return 'supported';
 return 'review';
};
const nextStep=step=>step===0?1:step===1?2:step===2?3:step===3?4:step===4?5:step===5?6:step===6?7:step===7?8:step===8?9:step===9?10:11;
let state=defaultState(),ctx=null,modal=null,audio=null,audioURL='',audioLoading=null,writeQueue=Promise.resolve(),deepLinkHandled=false;
let followEnabled=true,lastFollowCue=-2,chapterStopAt=0;
function authStudent(){return user()?.uid||'';}
function localGet(uid){try{const raw=JSON.parse(localStorage.getItem(key(uid))||'null');return raw?.version===1?raw.data:null}catch(_){return null;}}
function localSet(uid,data){try{localStorage.setItem(key(uid),JSON.stringify({version:1,data}));}catch(_){}}
async function loadOriginalAudio(){
 if(audioURL)return audioURL;
 if(audioLoading)return audioLoading;
 audioLoading=(async()=>{
   const chunks=await Promise.all(ids().map(async url=>{
      const res=await fetch(url,{cache:'force-cache'});
      if(!res.ok)throw Error('Audio segment '+res.status);
      return res.arrayBuffer();
   }));
   const size=chunks.reduce((sum,item)=>sum+item.byteLength,0);
   if(size!==AUDIO_SIZE)throw Error('Audio size mismatch');
   const blob=new Blob(chunks,{type:'audio/mpeg'});
   const data=await blob.arrayBuffer();
   if(window.crypto?.subtle){
     const digest=await crypto.subtle.digest('SHA-256',data);
     const hex=Array.from(new Uint8Array(digest),b=>b.toString(16).padStart(2,'0')).join('');
     if(hex!==AUDIO_SHA256)throw Error('Audio checksum mismatch');
   }
   audioURL=URL.createObjectURL(blob);
   return audioURL;
 })().catch(err=>{audioLoading=null;throw err;});
 return audioLoading;
}
function stopAudio(){if(audio){audio.pause();audio.removeAttribute('src');audio.load();audio=null;}}
function close(){chapterStopAt=0;stopAudio();if(modal){modal.remove();modal=null;}ctx=null;}
function checkClass(cls,uid,role){return !!(cls&&uid&&role==='student'&&cls.flippedU4Enabled===true);}
function studentCard(cls,profile){
 if(!checkClass(cls,profile?.id||authStudent(),profile?.role))return '';
 const cached=localGet(profile.id);
 const done=readiness(cached)==='ready'||readiness(cached)==='supported'||readiness(cached)==='review';
 if(!deepLinkHandled&&new URLSearchParams(location.search).get('flipped')==='u4'){
   deepLinkHandled=true;Promise.resolve().then(()=>open());
 }
 return '<section class="fw-entry"><div class="fw-entry-art" aria-hidden="true">🍽️ <span>💳</span></div><div class="fw-entry-copy"><small>UNIT 4 · FLIPPED READING</small><h2>The Forgotten Wallet</h2><p>Learn the complete textbook reading in 3 short parts. Understand it, check yourself and get help when needed.</p></div><button type="button" onclick="STEPUP_FLIPPED_U4.open()">'+(done?'Explore Again':'Discover the Story')+'</button></section>';
}
function teacherCard(cls){
 if(!cls)return '';
 const enabled=cls.flippedU4Enabled===true;
 const arg=JSON.stringify(cls.id).replace(/\"/g,'&quot;');
 const codeArg=JSON.stringify(cls.code||'').replace(/\"/g,'&quot;');
 return '<section class="fw-teacher" data-fw-class="'+e(cls.id)+'"><div class="fw-teacher-intro"><small>UNIT 4 · FLIPPED CLASSROOM</small><h2>The Forgotten Wallet</h2><p>Pre-teach all six textbook paragraphs with 3 guided parts, 6 understanding checks, and instant support. Use the report to shorten your next lesson.</p><div class="fw-teacher-pills"><span>Original textbook recording</span><span>6 guided checks · 3 short parts</span><span>No grades or certificates</span><span>Student progress saved</span></div></div><div class="fw-teacher-actions"><span class="fw-teacher-status">'+(enabled?'Available to this class':'Not assigned yet')+'</span><button type="button" onclick="STEPUP_FLIPPED_U4.setEnabled('+arg+','+(!enabled)+')">'+(enabled?'Close Assignment':'Assign to This Class')+'</button><button class="secondary" type="button" onclick="STEPUP_FLIPPED_U4.preview()">Preview Story</button><button class="secondary" type="button" onclick="STEPUP_FLIPPED_U4.classroom()">Start 12-Minute Class Discussion</button><button class="secondary" type="button" onclick="STEPUP_FLIPPED_U4.report('+arg+')">View Participation</button><button class="secondary" type="button" onclick="STEPUP_FLIPPED_U4.copyLink('+codeArg+')">Copy Student Link</button></div><div class="fw-report" id="fw-report-'+e(cls.id)+'" hidden></div></section>';
}
// Four teacher-led application slides: no student devices, no repeated home quiz.
let classroomBox=null,classroomPage=0,classroomRevealed=false;
const CLASSROOM=[
 {tag:'2 MIN · ACTIVE RETRIEVAL',title:'Rebuild the timeline',
  prompt:'What happened in 1949, 1950, 1952, and 1984?',
  instruction:'Ask four students for the events. Do not reread the whole passage.',
  evidence:'1949: wallet forgotten · 1950: first Diner’s Club Card · 1952: thousands of businesses and international franchises · 1984: first card-member rewards program'},
 {tag:'3 MIN · FIND THE EVIDENCE',title:'Prove it with a sentence',
  prompt:'Which exact sentence proves the idea spread beyond the United States?',
  instruction:'Give students thinking time. Invite two answers with evidence.',
  evidence:'The Diner’s Club Card became the first international charge card in 1952 with franchises in Canada, France, and Cuba. — Textbook, paragraph 3'},
 {tag:'4 MIN · THINK DEEPER',title:'Cause and effect',
  prompt:'Why was “charging it” an important change from paying in cash?',
  instruction:'Ask students to explain the advantage and support it from paragraph 2.',
  evidence:'Soon the concept of “charging it” was picked up by merchants as an alternative form of payment to the use of cash. — Textbook, paragraph 2'},
 {tag:'3 MIN · TRANSFER',title:'Think like an innovator',
  prompt:'What everyday problem today could inspire a useful invention?',
  instruction:'Think silently, write one sentence, then invite three students to share and explain.',
  evidence:'Possible answer: “A small problem can become a useful invention when someone designs a practical solution.” (Model, not a textbook quote)'}
];
function drawClassroom(){
 if(!classroomBox)return;
 const sl=CLASSROOM[classroomPage];
 classroomBox.innerHTML='<div class="fw-class-shell"><header><small>STEP UP · UNIT 4 · POST-FLIP CLASSROOM</small><button type="button" data-fw-class="close">✕ Exit</button></header><div class="fw-class-progress">'+(classroomPage+1)+' / '+CLASSROOM.length+'</div>'+
 '<main><span>'+e(sl.tag)+'</span><h1>'+e(sl.title)+'</h1><h2>'+e(sl.prompt)+'</h2><p>'+e(sl.instruction)+'</p>'+
 (classroomRevealed?'<div class="fw-class-evidence"><strong>Reveal & discuss</strong><p>'+e(sl.evidence)+'</p></div>':'')+'</main>'+
 '<footer><button type="button" data-fw-class="prev" '+(classroomPage===0?'disabled':'')+'>Previous</button><button type="button" data-fw-class="reveal">'+(classroomRevealed?'Hide evidence':'Reveal evidence')+'</button><button class="next" type="button" data-fw-class="next">'+(classroomPage===CLASSROOM.length-1?'Finish':'Next prompt')+'</button></footer></div>';
}
function classroom(){
 if(classroomBox)return;
 classroomPage=0;classroomRevealed=false;
 classroomBox=document.createElement('div');
 classroomBox.className='fw-class-overlay';
 classroomBox.setAttribute('role','dialog');classroomBox.setAttribute('aria-modal','true');
 classroomBox.setAttribute('aria-label','Unit 4 post-flipped classroom');
 classroomBox.addEventListener('click',event=>{
   const target=event.target.closest('[data-fw-class]');if(!target||target.disabled)return;
   const action=target.dataset.fwClass;
   if(action==='close'||(action==='next'&&classroomPage===CLASSROOM.length-1)){classroomBox.remove();classroomBox=null;return;}
   if(action==='prev')classroomPage=Math.max(0,classroomPage-1);
   if(action==='next')classroomPage=Math.min(CLASSROOM.length-1,classroomPage+1);
   if(action==='reveal')classroomRevealed=!classroomRevealed;
   else classroomRevealed=false;
   drawClassroom();
 });
 document.body.appendChild(classroomBox);drawClassroom();
}
async function setEnabled(classId,enabled){
 if(!user()||!db()){alert('Sign in to your teacher account.');return;}
 try{
   const doc=await db().collection('classes').doc(classId).get();
   const teacher=await db().collection('users').doc(user().uid).get();
   if(!doc.exists||doc.data().teacherId!==user().uid||teacher.data()?.role!=='teacher')throw Error('Teacher permission required');
   await db().collection('classes').doc(classId).update({flippedU4Enabled:!!enabled});
   window.PROVE?.renderTeacher?.();
 }catch(err){console.warn('Flipped Reading assignment',err);alert('Could not update the assignment. Please retry.');}
}
async function report(classId){
 const el=document.getElementById('fw-report-'+classId);if(!el||!db()||!user())return;
 el.hidden=false;el.innerHTML='<p>Loading your class reading insight…</p>';
 try{
   const cl=await db().collection('classes').doc(classId).get();
   if(!cl.exists||cl.data().teacherId!==user().uid)throw Error('Access denied');
   const [rosterSnap,subSnap]=await Promise.all([
     db().collection('users').where('teacherId','==',user().uid).get(),
     db().collection('assignmentSubmissions').where('teacherId','==',user().uid).get()
   ]);
   const students=rosterSnap.docs.map(x=>({id:x.id,...x.data()})).filter(x=>x.role==='student'&&x.classId===classId)
     .sort((x,y)=>String(x.displayName||'').localeCompare(String(y.displayName||''),'ar'));
   const saved=new Map(subSnap.docs.map(x=>x.data()).filter(x=>x.assignmentKind===TASK&&x.classId===classId).map(x=>[x.studentId,x]));
   const find=st=>saved.get(st.id);
   const statuses=students.map(st=>({student:st,record:find(st),status:readiness(find(st))}));
   const counts={ready:0,supported:0,review:0,unfinished:0,notStarted:0};
   for(const v of statuses){
     if(!v.record)counts.notStarted++;
     else counts[v.status]++;
   }
   const skillSummary=CHECKS.map(q=>{
      const completed=students.map(find).filter(v=>v&&Number(v.lessonVersion)===LESSON_VERSION&&Number.isInteger(v.answers?.[q.id]));
      const first=completed.filter(v=>v.answers[q.id]===q.correct).length;
      const total=completed.length;
      return {q,first,total,accuracy:total?first/total:1};
   });
   const needs=skillSummary.filter(x=>x.total>=1&&x.accuracy<.75).sort((a,b)=>a.accuracy-b.accuracy);
   const options={yes:'Yes',maybe:'Maybe',no:'No'};
   el.innerHTML='<div class="fw-stats"><div><b>'+counts.ready+'</b><small>Ready independently</small></div><div><b>'+counts.supported+'</b><small>Ready after support</small></div><div><b>'+counts.review+'</b><small>Needs follow-up</small></div></div>'+
    '<p class="fw-report-hint">'+counts.unfinished+' started but unfinished · '+counts.notStarted+' not started. Ready is a lesson-preparation indicator, not a certificate or guaranteed mastery.</p>'+
    '<div class="fw-skill-summary">'+skillSummary.map(x=>'<div class="'+(x.total&&x.accuracy<.75?'fw-skill-alert':'')+'"><strong>'+e(x.q.skill)+'</strong><span>'+x.first+'/'+x.total+' first try</span></div>').join('')+'</div>'+
    '<div class="fw-lesson-tip"><strong>Suggested classroom focus</strong><p>'+
      (needs.length?'Start with '+e(needs.slice(0,2).map(x=>x.q.skill).join(' + '))+'. Let prepared students cite evidence while you give focused support to others.':'Start with a 2-minute timeline retrieval, then move to evidence-based discussion. Re-teach only if the answers reveal a gap.')+
    '</p><small>Suggested discussion: Which single event most changed how people pay, and what is your evidence?</small></div>'+
    '<div class="fw-roster">'+(students.length?statuses.map(({student,record,status})=>{
      const label=!record?'Not started':status==='ready'?'Ready':status==='supported'?'With support':status==='review'?'Needs review':'In progress';
      const mark=Number(record?.lessonVersion)===LESSON_VERSION?correctCount(record)+'/6 first try · '+recoveredCount(record)+' recovered':'—';
      const trouble=record&&Number(record.lessonVersion)===LESSON_VERSION?CHECKS.filter(q=>record.answers?.[q.id]!==q.correct&&Number.isInteger(record.answers?.[q.id])).map(q=>q.skill).join(', '):'';
      return '<div><strong>'+e(student.displayName||'Student')+'</strong><span>'+e(label)+'</span><small>'+e(mark)+(trouble?' · Revisit: '+e(trouble):'')+(record?.opinion?' · Opinion: '+e(options[record.opinion]||record.opinion):'')+'</small></div>';
    }).join(''):'<p>No students found in this class.</p>')+'</div>';
 }catch(err){
   console.warn('Home reading report',err);
   el.innerHTML='<p>Unable to load results. Please try again.</p><button type="button" onclick="STEPUP_FLIPPED_U4.report('+JSON.stringify(classId).replace(/"/g,'&quot;')+')">Retry</button>';
 }
}
async function open(){
 if(modal)return;
 const uid=authStudent();
 if(!uid||!db()){alert('Please sign in to STEP UP first.');return;}
 try{
   const p=await db().collection('users').doc(uid).get();
   if(!p.exists||p.data().role!=='student')throw Error('Student account required');
   const cl=await db().collection('classes').doc(p.data().classId).get();
   if(!cl.exists||cl.data().flippedU4Enabled!==true)throw Error('This story has not been assigned to your class');
   ctx={uid,profile:p.data(),classId:p.data().classId,teacherId:p.data().teacherId};
   const remote=await db().collection('assignmentSubmissions').doc(storedId(uid)).get().catch(()=>null);
   const r=remote?.exists?remote.data():null;
   const local=localGet(uid);
   const remoteUpdated=Date.parse(r?.updatedAt||'')||0;
   const localUpdated=Date.parse(local?.updatedAt||'')||0;
   const chooseLocal=!!local&&localUpdated>remoteUpdated;
   const value=chooseLocal?local:(r&&r.assignmentKind===TASK?r:(local||defaultState()));
   const upToDate=Number(value.lessonVersion||0)===LESSON_VERSION;
   const oldCompleted=!!(value.completed&&Number(value.lessonVersion||0)<LESSON_VERSION);
   state={...defaultState(),
     opening:value.opening||'',opinion:upToDate?value.opinion||'':'',
     answers:upToDate&&value.answers&&typeof value.answers==='object'?{...value.answers}:{},
     recovery:upToDate&&value.recovery&&typeof value.recovery==='object'?{...value.recovery}:{},
     readSections:upToDate&&Array.isArray(value.readSections)?value.readSections.filter(n=>Number.isInteger(n)&&n>=0&&n<3):[],
     legacyCompleted:!!(value.legacyCompleted||oldCompleted),
     completed:upToDate&&value.completed===true&&completedCheck(value)
   };
   state.step=state.completed?11:upToDate?Math.min(10,Math.max(0,Number(value.progressStep??value.step)||0)):oldCompleted?1:0;
   if(state.step>=2&&!state.readSections.includes(0))state.step=1;
   if(state.step>=5&&!state.readSections.includes(1))state.step=4;
   if(state.step>=8&&!state.readSections.includes(2))state.step=7;
   for(const q of CHECKS){
     if(q.step<state.step&&!isCheckResolved(q,state)){state.step=q.step;break;}
   }
   modal=document.createElement('div');modal.className='fw-modal';modal.setAttribute('role','dialog');modal.setAttribute('aria-modal','true');modal.setAttribute('aria-label','The Forgotten Wallet');
   document.body.appendChild(modal);
   modal.addEventListener('click',click);render();
   if(chooseLocal&&upToDate)persist();
 }catch(err){console.warn('Flipped Reading access',err);alert(err.message?.includes('not been assigned')?'This story is not open for your class yet.':'Could not start the story. Check your connection and try again.');}
}
function preview(){
 if(modal)return;
 ctx=null;state=defaultState();
 modal=document.createElement('div');modal.className='fw-modal';modal.setAttribute('role','dialog');modal.setAttribute('aria-modal','true');modal.setAttribute('aria-label','The Forgotten Wallet Preview');
 document.body.appendChild(modal);modal.addEventListener('click',click);render();
}
function persist(){
 if(!ctx)return;
 const now=new Date().toISOString();
 localSet(ctx.uid,{...state,lessonVersion:LESSON_VERSION,updatedAt:now,version:1});
 const data={assignmentKind:TASK,studentId:ctx.uid,teacherId:ctx.teacherId,classId:ctx.classId,
   studentName:ctx.profile.displayName||'',opening:state.opening,opinion:state.opinion,
   progressStep:state.step,readSections:[...state.readSections],answers:{...state.answers},
   recovery:{...state.recovery},comprehensionAnswered:answeredCount(),comprehensionCorrect:correctCount(),
   recoveredCount:recoveredCount(),lessonVersion:LESSON_VERSION,legacyCompleted:!!state.legacyCompleted,
   completed:!!state.completed,preparationStatus:state.completed?readiness({...state,lessonVersion:LESSON_VERSION}):'unfinished',updatedAt:now};
 if(state.completed&&state.step===11)data.completedAt=now;
 const uid=ctx.uid;
 writeQueue=writeQueue.catch(()=>{}).then(async()=>{
   if(!db()||authStudent()!==uid)return;
   await db().collection('assignmentSubmissions').doc(storedId(uid)).set(data,{merge:true});
 }).catch(err=>{console.warn('Home reading sync failed',err);showSyncNotice();});
}
async function copyLink(classCode){
 const url=new URL(location.href);url.search='';url.searchParams.set('class',String(classCode||''));url.searchParams.set('flipped','u4');url.hash='';
 try{await navigator.clipboard.writeText(url.toString());alert('Student link copied.');}catch(_){window.prompt('Copy student link:',url.toString());}
}
function showSyncNotice(){const x=modal?.querySelector('#fwSync');if(x)x.textContent='Saved on this device. Reopen online to sync.';}
const scenes=[
 {
  "ico": "👔",
  "year": "1949",
  "title": "A small mistake",
  "text": "When the waiter presented the check, Frank realized that he had left his wallet in the other suit.",
  "line": "What would you do?"
 },
 {
  "ico": "💳",
  "year": "1950",
  "title": "A clever idea",
  "text": "When the check came, Frank handed the waiter a small cardboard card, a Diner’s Club Card, and signed for the meal.",
  "line": "What if you could pay without cash?"
 },
 {
  "ico": "🌍",
  "year": "1952 and beyond",
  "title": "An idea spreads",
  "text": "The idea of the credit card quickly expanded outside the United States.",
  "line": "One idea can change our lives."
 }
];
function readingParagraphs(){
 const raw=window.STEPUP_JOURNEY?.data?.units?.find(u=>u.id==='u4')?.reading;
 if(typeof raw!=='string'||!raw.startsWith('The World of Plastic\n\n'))return [];
 const parts=raw.split(/\n\s*\n/).slice(1);
 if(parts.length!==6||!parts.every((p,i)=>p.startsWith((i+1)+'. ')))return [];
 return parts;
}

function splitReadSentences(paragraph){
 const plain=paragraph.replace(/^\d+\.\s*/,'');
 const pieces=plain.match(/[^.!?]+[.!?]+(?:[”"']|$)?|[^.!?]+$/g)||[];
 return pieces.join('')===plain?pieces:[plain];
}
function readingFollowMarkup(paragraphs,baseIndex=0){
 const all=readingParagraphs().flatMap(p=>splitReadSentences(p));
 const valid=all.length===READING_CUES.length;
 let cursor=baseIndex;
 const html=paragraphs.map(p=>'<p>'+splitReadSentences(p).map(part=>{
   const i=cursor++;
   return valid?'<span class="fw-sentence" data-fw-cue="'+i+'">'+e(part)+'</span>':e(part);
 }).join('')+'</p>').join('');
 return {html,valid};
}
function readingCueAt(seconds){
 if(!Number.isFinite(seconds)||seconds<READING_CUES[0]||seconds>=READING_END)return -1;
 let lo=0,hi=READING_CUES.length-1;
 while(lo<hi){const mid=Math.ceil((lo+hi)/2);if(READING_CUES[mid]<=seconds)lo=mid;else hi=mid-1;}
 return lo;
}
function refreshFollowAlong(forceScroll=false){
 const area=modal?.querySelector('.fw-reading-text');
 if(!area||!audio)return;
 const spans=area.querySelectorAll('.fw-sentence');
 if(!spans.length)return;
 const idx=followEnabled?readingCueAt(audio.currentTime):-1;
 if(idx===lastFollowCue&&!forceScroll)return;
 for(let i=0;i<spans.length;i++){
   const active=Number(spans[i].dataset.fwCue)===idx;
   spans[i].classList.toggle('fw-sentence-active',active);
   if(active)spans[i].setAttribute('aria-current','true');
   else spans[i].removeAttribute('aria-current');
 }
 lastFollowCue=idx;
 if(idx<0||!followEnabled)return;
 const node=Array.from(spans).find(sp=>Number(sp.dataset.fwCue)===idx);
 if(!node)return;
 const delta=node.getBoundingClientRect().top-area.getBoundingClientRect().top;
 const offset=delta-area.clientHeight*.33;
 if(offset<-18||offset>area.clientHeight*.36){
   const top=Math.max(0,area.scrollTop+offset);
   if(typeof area.scrollTo==='function'){
     const reduced=!!window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
     area.scrollTo({top,behavior:reduced?'auto':'smooth'});
   }else area.scrollTop=top;
 }
}
function onReadingAudioTick(){if(audio&&chapterStopAt>0&&audio.currentTime>=chapterStopAt-.08&&!audio.paused){audio.pause();chapterStopAt=0;}refreshFollowAlong();}
function toggleFollowReading(){
 followEnabled=!followEnabled;
 const btn=modal?.querySelector('[data-fw="toggleFollow"]');
 if(btn){btn.textContent=followEnabled?'Follow audio: ON':'Follow audio: OFF';btn.setAttribute('aria-pressed',String(followEnabled));}
 lastFollowCue=-2;refreshFollowAlong(true);
}
function chapterHtml(chapterIdx){
 const chapter=CHAPTERS[chapterIdx],p=readingParagraphs();
 if(p.length!==6)return '<div class="fw-scene"><h2>The original textbook text is unavailable</h2><p>Please reload STEP UP and try again before answering.</p><button class="fw-primary" data-fw="refresh">Retry</button></div>';
 const chosen=p.slice(...chapter.range),base=p.slice(0,chapter.range[0]).reduce((n,x)=>n+splitReadSentences(x).length,0);
 const help=chapter.vocabulary.map(v=>'<div class="fw-vocab-term"><b>'+e(v[0])+'</b><span>'+e(v[1])+'</span><small>'+e(v[2])+'</small></div>').join('');
 return '<div class="fw-reading fw-home-chapter"><div class="fw-chapter-heading"><div class="fw-chapter-icon">'+chapter.icon+'</div><div><span class="fw-eyebrow">PART '+(chapterIdx+1)+' OF 3 · MEGA GOAL 1 · PAGE 60</span><h2>'+e(chapter.title)+'</h2><p>'+e(chapter.goal)+'</p></div></div>'+
 '<div class="fw-follow-bar"><span>Follow the original book while listening</span><button type="button" data-fw="toggleFollow" aria-pressed="'+String(followEnabled)+'">'+(followEnabled?'Follow audio: ON':'Follow audio: OFF')+'</button></div>'+
 '<div class="fw-reading-text" aria-label="Textbook reading part '+(chapterIdx+1)+'">'+readingFollowMarkup(chosen,base).html+'</div>'+
 '<div class="fw-chapter-helper"><button class="fw-audio-part" type="button" data-fw="chapterAudio" data-choice="'+chapterIdx+'">▶ Listen to this part</button><details><summary>Need help with a word?</summary><div class="fw-vocab-items">'+help+'</div></details></div>'+
 '<div class="fw-timeline"><span>1949</span><i>→</i><span>1950</span><i>→</i><span>1952</span><i>→</i><span>1984</span></div>'+
 '<button class="fw-primary" type="button" data-fw="chapterDone" data-choice="'+chapterIdx+'">I understand this part · Check my understanding</button>'+
 '<p class="fw-note">Read at your pace. The audio follows the textbook but is optional.</p></div>';
}
function questionHtml(q){
 const first=state.answers[q.id],answered=Number.isInteger(first);
 const correct=answered&&first===q.correct;
 const recovery=state.recovery[q.id],recovered=Number.isInteger(recovery);
 const done=answered&&(correct||recovered);
 const old=readingParagraphs()[Number(q.paragraph)-1]||'';
 const evidence='<details class="fw-book-evidence"><summary>📖 See the evidence · textbook paragraph '+q.paragraph+'</summary><p>'+e(old.replace(/^\d+\.\s*/,''))+'</p></details>';
 const options=q.choices.map((x,i)=>'<button type="button" data-fw="check" data-choice="'+i+'" '+(answered?'disabled ':'')+'class="'+(answered&&i===first?(correct?'fw-answer-right':'fw-answer-try'):'')+'">'+e(x)+'</button>').join('');
 const followup=answered&&!correct?'<div class="fw-feedback"><strong>Find the evidence and try a new example</strong><p>'+e(q.support)+'</p><blockquote>'+e(q.quote)+'</blockquote><h3>'+e(q.retryPrompt)+'</h3><div class="fw-answers">'+q.retryChoices.map((x,i)=>'<button type="button" data-fw="recover" data-choice="'+i+'" '+(recovered?'disabled ':'')+'class="'+(recovered&&i===recovery?(recovery===q.retryCorrect?'fw-answer-right':'fw-answer-try'):'')+'">'+e(x)+'</button>').join('')+'</div>'+ (recovered?'<p>'+(recovery===q.retryCorrect?'Yes! You used the text to fix the idea.':'The answer is: '+e(q.retryChoices[q.retryCorrect])+'. You can revisit this idea at the end.')+'</p>':'<p class="fw-note">There is no penalty for needing a hint.</p>')+'</div>':answered?'<div class="fw-feedback"><strong>Exactly — your evidence is in paragraph '+q.paragraph+'.</strong><p>'+e(q.support)+'</p></div>':'<p class="fw-note">Think of the text. You may open the evidence if you need help.</p>';
 return '<div class="fw-scene fw-home-question"><span class="fw-eyebrow">CHECK '+CHECKS.indexOf(q)+1+' OF 6 · '+e(q.skill)+'</span><h2>'+e(q.prompt)+'</h2><div class="fw-answers">'+options+'</div>'+evidence+followup+
 (done?'<button type="button" class="fw-primary" data-fw="nextCheck">'+(q.step===9?'Share Your Opinion':getQuestion(q.step+1)?'Next Quick Check':'Continue the Story')+'</button>':'')+
 '</div>';
}
function render(){
 if(!modal)return;
 const stepLabels=['Your prediction','How it began','Find a detail','How it worked','Growing worldwide','Expansion','Vocabulary','Rewards and impact','Benefits','Big idea','Your perspective','Preparation summary'];
 const progress=Math.round(Math.min(11,Math.max(0,state.step))/11*100);
 const head='<header class="fw-head"><div><small>STEP UP · UNIT 4 · HOME PREPARATION</small><h1>The World of Plastic</h1><p>3 short reading parts · 6 understanding checks · No grades</p></div><button type="button" data-fw="close" aria-label="Close activity">✕</button></header>'+
 '<div class="fw-progress" role="progressbar" aria-valuenow="'+progress+'" aria-valuemin="0" aria-valuemax="100"><span style="width:'+progress+'%"></span></div>';
 let body='';
 if(state.step===0){
    body='<div class="fw-scene-art">🍽️ 💳</div><div class="fw-scene"><span class="fw-eyebrow">A TRUE STORY · NEW YORK, 1949</span><h2>One forgotten wallet. A worldwide change.</h2><p>Your mission: discover how an embarrassing moment led to a new way of paying. By the end, you should be able to explain the story yourself.</p>'+
    '<div class="fw-objectives"><strong>After this lesson, you can:</strong><p>Explain the problem and solution · Trace the spread · Understand key words · Tell why the invention mattered</p></div>'+
    '<h3>What do you think happened when Frank forgot his wallet?</h3><div class="fw-answers">'+[['borrow','Someone paid for him.'],['idea','He invented a new way to pay.'],['leave','He never returned.']].map(x=>'<button type="button" data-fw="opening" data-choice="'+x[0]+'">'+e(x[1])+'</button>').join('')+'</div><p class="fw-note">Just a prediction — not a test.</p></div>';
 }else if([1,4,7].includes(state.step))body=chapterHtml(state.step===1?0:state.step===4?1:2);
 else if(getQuestion(state.step))body=questionHtml(getQuestion(state.step));
 else if(state.step===10)body='<div class="fw-scene-art">💭</div><div class="fw-scene"><span class="fw-eyebrow">APPLY WHAT YOU LEARNED</span><h2>Can one mistake change the world?</h2><p>Choose your view. In class, you will support it with evidence from the reading.</p><div class="fw-answers">'+[['yes','Yes, it can.'],['maybe','Sometimes — it depends.'],['no','Not by itself.']].map(x=>'<button type="button" data-fw="opinion" data-choice="'+x[0]+'">'+e(x[1])+'</button>').join('')+'</div><p class="fw-note">There is no single correct opinion.</p></div>';
 else{
   const status=readiness({...state,lessonVersion:LESSON_VERSION});
   const wrong=CHECKS.filter(q=>state.answers[q.id]!==q.correct);
   const unresolved=wrong.filter(q=>state.recovery[q.id]!==q.retryCorrect);
   const ok=status==='ready';
   const title=ok?'Ready for class!':status==='supported'?'Prepared with support!':'One more small review will help';
   const explanation=ok?'You showed independent understanding of the key reading ideas.':
      status==='supported'?'You found and corrected the ideas you first missed. Your teacher will know where you needed help.':
      'You have finished the reading, but one or more ideas need another look before the lesson.';
   body='<div class="fw-scene-art">🌟 📖</div><div class="fw-scene"><span class="fw-eyebrow">HOME LESSON SUMMARY</span><h2>'+title+'</h2><p>'+explanation+'</p>'+
     '<div class="fw-home-results"><div><b>'+correctCount()+'/6</b><small>First-try understanding</small></div><div><b>'+recoveredCount()+'</b><small>Ideas recovered</small></div></div>'+
     (unresolved.length?'<div class="fw-review-list"><strong>Review these ideas:</strong>'+unresolved.map(q=>'<button type="button" data-fw="reviewWeak" data-choice="'+e(q.id)+'">'+e(q.skill)+'</button>').join('')+'</div>':'')+
     '<div class="fw-objectives"><strong>In class, be ready to explain:</strong><p>1949 → 1950 → 1952 → 1984 · Why did one mistake change the world?</p></div>'+
     '<button class="fw-primary" type="button" data-fw="close">Close · Go to STEP UP</button><button class="fw-restart" type="button" data-fw="restart">Review the lesson again</button></div>';
 }
 const audioSection='<section class="fw-audio"><div><b>🎧 Original textbook recording</b><small>Mega Goal 1 · Unit 4 · CD 2, Track 07 · 3:23</small></div><button type="button" id="fwAudioButton" data-fw="loadAudio">'+(audioURL?'Audio ready':'Load audio')+'</button><div class="fw-audio-player" id="fwAudioPlayer"></div></section>';
 if(!modal.querySelector('.fw-sheet')){
   modal.innerHTML='<div class="fw-sheet">'+head+audioSection+'<main class="fw-main">'+body+'</main><footer><span id="fwSync">Progress saves automatically · Separate from mastery and certificates</span><span id="fwStepLabel">'+e(stepLabels[state.step])+'</span></footer></div>';
   if(audioURL)attachAudio();
 }else{
   const main=modal.querySelector('.fw-main');if(main)main.innerHTML=body;
   const bar=modal.querySelector('.fw-progress');if(bar){bar.setAttribute('aria-valuenow',String(progress));const fill=bar.querySelector('span');if(fill)fill.style.width=progress+'%';}
   const label=modal.querySelector('#fwStepLabel');if(label)label.textContent=stepLabels[state.step];
   modal.scrollTop=0;
 }
 if([1,4,7].includes(state.step)){lastFollowCue=-2;refreshFollowAlong(true);}
}
function attachAudio(){
 const host=modal?.querySelector('#fwAudioPlayer');if(!host)return;
 const previous=audio?.currentTime||0;const playing=audio?!audio.paused:false;
 // Preserve the playback element across story scenes rather than restarting the track.
 if(audio){host.appendChild(audio);audio.currentTime=previous;if(playing)audio.play().catch(()=>{});refreshFollowAlong(true);return;}
 audio=document.createElement('audio');audio.controls=true;audio.preload='metadata';audio.src=audioURL;
 audio.setAttribute('aria-label','Original Mega Goal 1 Unit 4 Reading audio');
 ['timeupdate','seeked','playing','pause','ended','loadedmetadata'].forEach(name=>audio.addEventListener(name,onReadingAudioTick));
 host.appendChild(audio);refreshFollowAlong(true);
}
async function showAudio(){
 const button=modal?.querySelector('#fwAudioButton');if(!button)return;
 button.disabled=true;button.textContent='Loading the textbook recording…';
 try{await loadOriginalAudio();if(!modal)return;button.textContent='Ready to play';button.disabled=false;attachAudio();}
 catch(err){console.error('Original unit 4 reading audio failed',err);button.disabled=false;button.textContent='Retry audio';const msg=modal?.querySelector('#fwSync');if(msg)msg.textContent='Original audio could not load. Please retry with internet access.';}
}
async function playChapter(index){
 const chapter=CHAPTERS[index];
 if(!chapter||!modal)return;
 const button=modal.querySelector('[data-fw="chapterAudio"]');
 if(button){button.disabled=true;button.textContent='Loading the original audio…';}
 try{
   await loadOriginalAudio();
   if(!modal||![1,4,7].includes(state.step))return;
   attachAudio();
   if(!audio)throw Error('Unable to initialize audio');
   audio.currentTime=chapter.start;
   chapterStopAt=chapter.end;
   lastFollowCue=-2;
   refreshFollowAlong(true);
   try{await audio.play();}catch(e){
     chapterStopAt=0;
     const note=modal.querySelector('#fwSync');if(note)note.textContent='Audio is ready. Please press play in the audio bar.';
   }
 }catch(err){
   console.warn('Original reading chapter audio',err);
   const note=modal?.querySelector('#fwSync');if(note)note.textContent='Audio unavailable. The complete textbook text remains available to read.';
 }finally{
   const fresh=modal?.querySelector('[data-fw="chapterAudio"]');
   if(fresh){fresh.disabled=false;fresh.textContent='▶ Listen to this part';}
 }
}
function click(event){
 const b=event.target.closest('[data-fw]');if(!b||!modal?.contains(b)||b.disabled)return;
 const action=b.dataset.fw;
 if(action==='close')return close();
 if(action==='loadAudio')return showAudio();
 if(action==='toggleFollow')return toggleFollowReading();
 if(action==='chapterAudio')return playChapter(Number(b.dataset.choice));
 if(action==='refresh'){render();return;}
 if(action==='opening'&&state.step===0){
   state.opening=b.dataset.choice;state.step=1;persist();render();return;
 }
 if(action==='chapterDone'&&[1,4,7].includes(state.step)){
   const idx=Number(b.dataset.choice);
   if(idx!==(state.step===1?0:state.step===4?1:2)||readingParagraphs().length!==6)return;
   if(!state.readSections.includes(idx))state.readSections.push(idx);
   chapterStopAt=0;if(audio&&!audio.paused)audio.pause();
   if(state.reviewReturn===11){state.step=11;delete state.reviewReturn;}
   else state.step=nextStep(state.step);
   persist();render();return;
 }
 if(action==='check'&&getQuestion(state.step)){
   const q=getQuestion(state.step),choice=Number(b.dataset.choice);
   if(Number.isInteger(state.answers[q.id])||!Number.isInteger(choice)||choice<0||choice>=q.choices.length)return;
   state.answers[q.id]=choice;persist();render();return;
 }
 if(action==='recover'&&getQuestion(state.step)){
   const q=getQuestion(state.step),choice=Number(b.dataset.choice);
   if(!needsRetry(q)||!Number.isInteger(choice)||choice<0||choice>=q.retryChoices.length)return;
   state.recovery[q.id]=choice;persist();render();return;
 }
 if(action==='nextCheck'&&getQuestion(state.step)){
   const q=getQuestion(state.step);
   if(!isCheckResolved(q))return;
   if(state.reviewReturn===11){state.step=11;state.completed=completedCheck(state);delete state.reviewReturn;}
   else state.step=nextStep(state.step);
   persist();render();return;
 }
 if(action==='opinion'&&state.step===10&&CHECKS.every(q=>isCheckResolved(q,state))&&state.readSections.length===3){
   if(!['yes','maybe','no'].includes(b.dataset.choice))return;
   state.opinion=b.dataset.choice;state.step=11;state.completed=completedCheck(state);persist();render();return;
 }
 if(action==='reviewWeak'&&state.step===11){
   const q=CHECKS.find(x=>x.id===b.dataset.choice);
   if(!q||state.answers[q.id]===q.correct||state.recovery[q.id]===q.retryCorrect)return;
   delete state.recovery[q.id];state.step=q.step;state.reviewReturn=11;state.completed=false;
   persist();render();return;
 }
 if(action==='restart'&&state.step===11){
   state.step=1;state.reviewReturn=11;
   // Keep the original first-try and recovery evidence intact during voluntary review.
   render();return;
 }
}
function init(){window.addEventListener('pagehide',()=>{stopAudio();if(audioURL)URL.revokeObjectURL(audioURL);audioURL='';});}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
window.STEPUP_FLIPPED_U4={studentCard,teacherCard,setEnabled,report,copyLink,preview,open,close,loadOriginalAudio,version:VERSION,
 _checks:CHECKS,_chapters:CHAPTERS,_readiness:readiness,_completedCheck:completedCheck,
 classroom,_classroomPrompts:CLASSROOM,
  _checkClass:checkClass,_audioParts:ids,_audioSha:AUDIO_SHA256,_scenes:scenes,
 _cueTimes:READING_CUES,_cueAt:readingCueAt,_splitSentences:splitReadSentences,_readingMarkup:readingFollowMarkup};
})();